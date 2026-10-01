-- ============================================================================
-- Security hardening + booking logic fixes
--
-- 1. Repairs schema drift from the first migration (legacy NOT NULL columns
--    and a unique index that contradict the hybrid capacity model).
-- 2. Introduces explicit admins (admin_users + is_admin()) instead of
--    "any authenticated user is an admin".
-- 3. Locks down RLS: no direct public INSERT into appointments, RLS on
--    salon_settings, admin-only writes everywhere.
-- 4. Rewrites the booking RPCs: input validation, server-side rules for
--    online bookings, per-phone limits, serialisation against overbooking,
--    timezone-correct holiday checks, and in-place appointment updates.
--
-- Written to be safe on both a database built from these migrations and one
-- that was changed by hand in the dashboard.
--
-- AFTER APPLYING: register the salon owner as admin, otherwise nobody can
-- open the admin panel:
--   INSERT INTO public.admin_users (user_id)
--   SELECT id FROM auth.users WHERE email = 'owner@example.com';
-- ============================================================================


-- ─── 1. Schema drift ────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'appointments'
               AND column_name = 'appointment_date') THEN
    ALTER TABLE public.appointments ALTER COLUMN appointment_date DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'appointments'
               AND column_name = 'appointment_time') THEN
    ALTER TABLE public.appointments ALTER COLUMN appointment_time DROP NOT NULL;
  END IF;
END $$;

-- One booking per date/time contradicts a salon with 7 seats.
DROP INDEX IF EXISTS public.idx_unique_appointment_slot;

-- Returned only appointment times but was SECURITY DEFINER and unused.
DROP FUNCTION IF EXISTS public.get_booked_slots(date);

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.appointments
                 WHERE start_time IS NULL OR end_time IS NULL) THEN
    ALTER TABLE public.appointments
      ALTER COLUMN start_time SET NOT NULL,
      ALTER COLUMN end_time SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'appointments_end_after_start') THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_end_after_start
      CHECK (end_time > start_time) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON public.appointments (end_time);


-- ─── 2. Admins ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Managed only from the SQL editor / service role. Admins may see their own row.
DROP POLICY IF EXISTS "Admins can read own row" ON public.admin_users;
CREATE POLICY "Admins can read own row"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;


-- ─── 3. RLS ─────────────────────────────────────────────────────────────────

-- appointments: no public access at all; bookings go through create_appointment().
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public can check availability" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;

CREATE POLICY "Admins can view appointments"
ON public.appointments FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update appointments"
ON public.appointments FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete appointments"
ON public.appointments FOR DELETE TO authenticated
USING (public.is_admin());

-- salon_holidays: public read (the booking calendar greys out closed days), admin write.
DROP POLICY IF EXISTS "Admins can manage holidays" ON public.salon_holidays;
DROP POLICY IF EXISTS "Admins can insert holidays" ON public.salon_holidays;
DROP POLICY IF EXISTS "Admins can update holidays" ON public.salon_holidays;
DROP POLICY IF EXISTS "Admins can delete holidays" ON public.salon_holidays;

CREATE POLICY "Admins can insert holidays"
ON public.salon_holidays FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update holidays"
ON public.salon_holidays FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete holidays"
ON public.salon_holidays FOR DELETE TO authenticated
USING (public.is_admin());

-- salon_settings had no RLS at all, so anyone could rewrite the capacity.
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view settings" ON public.salon_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.salon_settings;

CREATE POLICY "Admins can view settings"
ON public.salon_settings FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update settings"
ON public.salon_settings FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

ALTER TABLE public.salon_settings
  DROP CONSTRAINT IF EXISTS salon_settings_capacity_check;
ALTER TABLE public.salon_settings
  ADD CONSTRAINT salon_settings_capacity_check
  CHECK (total_capacity >= 0 AND max_online_per_slot >= 0 AND max_online_per_slot <= total_capacity);


-- ─── 4. Booking functions ───────────────────────────────────────────────────

-- The 2-argument version is replaced by one with an optional exclusion; both
-- existing would make PostgREST calls ambiguous.
DROP FUNCTION IF EXISTS public.check_slot_availability(timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.check_slot_availability(
  check_start timestamptz,
  check_end timestamptz,
  p_exclude_id uuid DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings public.salon_settings%ROWTYPE;
  v_max_online integer;
  v_online_count integer;
  v_total_count integer;
  v_state text;
BEGIN
  -- Holidays are calendar days in the salon's own timezone, not UTC.
  IF EXISTS (
    SELECT 1 FROM public.salon_holidays
    WHERE holiday_date = (check_start AT TIME ZONE 'Europe/Belgrade')::date
  ) THEN
    RETURN json_build_object(
      'state', 'FULL',
      'online_count', 0,
      'total_count', 0,
      'max_online', 0,
      'total_capacity', 0,
      'holiday', true
    );
  END IF;

  SELECT * INTO settings FROM public.salon_settings WHERE id = 1;

  -- online_ratio caps online bookings in addition to the hard per-slot limit.
  v_max_online := LEAST(
    settings.max_online_per_slot,
    floor(settings.total_capacity * settings.online_ratio)::integer
  );

  SELECT
    COUNT(*) FILTER (WHERE source = 'online'),
    COUNT(*)
  INTO v_online_count, v_total_count
  FROM public.appointments
  WHERE status <> 'cancelled'
    AND id IS DISTINCT FROM p_exclude_id
    AND start_time < check_end
    AND end_time > check_start;

  IF v_total_count >= settings.total_capacity THEN
    v_state := 'FULL';
  ELSIF v_online_count >= v_max_online THEN
    v_state := 'ONLINE_FULL_WALKIN_AVAILABLE';
  ELSE
    v_state := 'ONLINE_AVAILABLE';
  END IF;

  RETURN json_build_object(
    'state', v_state,
    'online_count', v_online_count,
    'total_count', v_total_count,
    'max_online', v_max_online,
    'total_capacity', settings.total_capacity,
    'holiday', false
  );
END;
$$;

-- Availability for a whole day in one round trip (instead of one RPC per slot).
CREATE OR REPLACE FUNCTION public.get_slots_availability(
  p_starts timestamptz[],
  p_duration_minutes integer DEFAULT 60,
  p_exclude_id uuid DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  IF p_starts IS NULL OR cardinality(p_starts) = 0 THEN
    RETURN '[]'::json;
  END IF;
  IF cardinality(p_starts) > 48 THEN
    RAISE EXCEPTION 'Too many slots requested';
  END IF;
  IF p_duration_minutes IS NULL OR p_duration_minutes < 15 OR p_duration_minutes > 480 THEN
    RAISE EXCEPTION 'Invalid duration';
  END IF;

  SELECT json_agg(
    json_build_object(
      'start', s,
      'availability', public.check_slot_availability(
        s, s + make_interval(mins => p_duration_minutes), p_exclude_id
      )
    )
    ORDER BY s
  )
  INTO v_result
  FROM unnest(p_starts) AS s;

  RETURN v_result;
END;
$$;

-- Shared input validation. Returns an error message or NULL.
CREATE OR REPLACE FUNCTION public.validate_appointment_input(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_service_type text,
  p_notes text,
  p_require_phone boolean
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_customer_name IS NULL OR char_length(btrim(p_customer_name)) NOT BETWEEN 2 AND 100 THEN
    RETURN 'Ime mora imati između 2 i 100 karaktera.';
  END IF;

  IF p_require_phone THEN
    IF p_customer_phone IS NULL
       OR p_customer_phone !~ '^\+?[0-9 ()/.-]{6,25}$'
       OR char_length(regexp_replace(p_customer_phone, '\D', '', 'g')) NOT BETWEEN 6 AND 15 THEN
      RETURN 'Unesite ispravan broj telefona.';
    END IF;
  ELSIF p_customer_phone IS NOT NULL AND char_length(p_customer_phone) > 30 THEN
    RETURN 'Broj telefona je predugačak.';
  END IF;

  IF p_customer_email IS NOT NULL AND (
       char_length(p_customer_email) > 254
       OR p_customer_email !~ '^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$'
     ) THEN
    RETURN 'Unesite ispravnu email adresu.';
  END IF;

  IF p_service_type IS NULL OR char_length(btrim(p_service_type)) NOT BETWEEN 1 AND 100 THEN
    RETURN 'Izaberite uslugu.';
  END IF;

  IF p_notes IS NOT NULL AND char_length(p_notes) > 500 THEN
    RETURN 'Napomena može imati najviše 500 karaktera.';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_appointment(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_service_type text,
  p_notes text DEFAULT NULL,
  p_source text DEFAULT 'online'
) RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean := public.is_admin();
  v_source text := coalesce(p_source, 'online');
  v_name text := btrim(p_customer_name);
  v_phone text := nullif(btrim(p_customer_phone), '');
  v_email text := nullif(lower(btrim(p_customer_email)), '');
  v_service text := btrim(p_service_type);
  v_notes text := nullif(btrim(p_notes), '');
  v_local_start timestamp;
  v_error text;
  v_status json;
  v_id uuid;
BEGIN
  IF v_source NOT IN ('online', 'walkin') THEN
    RETURN json_build_object('success', false, 'error', 'Neispravan izvor termina.');
  END IF;

  -- Only the salon may enter walk-ins; otherwise anyone could bypass the online quota.
  IF v_source = 'walkin' AND NOT v_is_admin THEN
    RETURN json_build_object('success', false, 'error', 'Nemate dozvolu za ovu akciju.');
  END IF;

  v_error := public.validate_appointment_input(
    v_name, v_phone, v_email, v_service, v_notes, NOT v_is_admin
  );
  IF v_error IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', v_error);
  END IF;

  IF p_start_time IS NULL OR p_end_time IS NULL
     OR p_end_time <= p_start_time
     OR p_end_time - p_start_time > interval '8 hours' THEN
    RETURN json_build_object('success', false, 'error', 'Neispravno vreme termina.');
  END IF;

  IF NOT v_is_admin THEN
    v_local_start := p_start_time AT TIME ZONE 'Europe/Belgrade';

    IF p_start_time <= now() THEN
      RETURN json_build_object('success', false, 'error', 'Izabrani termin je već prošao.');
    END IF;
    IF p_start_time > now() + interval '61 days' THEN
      RETURN json_build_object('success', false, 'error', 'Termin se može zakazati najviše 60 dana unapred.');
    END IF;
    IF extract(isodow FROM v_local_start) = 7 THEN
      RETURN json_build_object('success', false, 'error', 'Nedeljom ne radimo.');
    END IF;
  END IF;

  -- Serialise bookings so two simultaneous requests cannot both take the last seat.
  PERFORM pg_advisory_xact_lock(hashtext('public.appointments.capacity'));

  IF NOT v_is_admin THEN
    -- Abuse limits: per phone number, and overall burst protection.
    IF (SELECT count(*) FROM public.appointments
        WHERE source = 'online'
          AND status <> 'cancelled'
          AND end_time > now()
          AND regexp_replace(customer_phone, '\D', '', 'g') = regexp_replace(v_phone, '\D', '', 'g')
       ) >= 3 THEN
      RETURN json_build_object('success', false, 'error',
        'Sa ovim brojem telefona već imate 3 zakazana termina. Za više termina pozovite salon.');
    END IF;

    IF (SELECT count(*) FROM public.appointments
        WHERE source = 'online' AND created_at > now() - interval '10 minutes') >= 20 THEN
      RETURN json_build_object('success', false, 'error',
        'Trenutno je previše zahteva. Pokušajte ponovo za nekoliko minuta ili nas pozovite.');
    END IF;
  END IF;

  v_status := public.check_slot_availability(p_start_time, p_end_time);

  IF v_status->>'state' = 'FULL' THEN
    RETURN json_build_object('success', false, 'error', 'Termin je popunjen.', 'status', v_status);
  END IF;

  IF v_source = 'online' AND v_status->>'state' <> 'ONLINE_AVAILABLE' THEN
    RETURN json_build_object('success', false,
      'error', 'Online zakazivanje za ovaj termin nije dostupno, ali možete doći bez zakazivanja.',
      'status', v_status);
  END IF;

  INSERT INTO public.appointments (
    customer_name, customer_phone, customer_email, start_time, end_time,
    service_type, notes, source, status
  ) VALUES (
    v_name, coalesce(v_phone, '—'), v_email, p_start_time, p_end_time,
    v_service, v_notes, v_source, 'confirmed'
  )
  RETURNING id INTO v_id;

  RETURN json_build_object(
    'success', true,
    'appointment_id', v_id,
    'status', public.check_slot_availability(p_start_time, p_end_time)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_appointment(
  p_appointment_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_service_type text,
  p_customer_name text,
  p_customer_phone text,
  p_notes text,
  p_status text
) RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current public.appointments%ROWTYPE;
  v_status json;
  v_error text;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Nemate dozvolu za ovu akciju.');
  END IF;

  IF p_status NOT IN ('pending', 'confirmed', 'cancelled') THEN
    RETURN json_build_object('success', false, 'error', 'Neispravan status.');
  END IF;

  IF p_start_time IS NULL OR p_end_time IS NULL OR p_end_time <= p_start_time THEN
    RETURN json_build_object('success', false, 'error', 'Neispravno vreme termina.');
  END IF;

  v_error := public.validate_appointment_input(
    btrim(p_customer_name), nullif(btrim(p_customer_phone), ''), NULL,
    btrim(p_service_type), nullif(btrim(p_notes), ''), false
  );
  IF v_error IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', v_error);
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('public.appointments.capacity'));

  SELECT * INTO v_current FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Termin nije pronađen.');
  END IF;

  -- Re-check capacity when the appointment moves, or when a cancelled one is re-activated.
  IF p_status <> 'cancelled' AND (
       v_current.start_time <> p_start_time
       OR v_current.end_time <> p_end_time
       OR v_current.status = 'cancelled'
     ) THEN
    v_status := public.check_slot_availability(p_start_time, p_end_time, p_appointment_id);

    IF v_status->>'state' = 'FULL'
       OR (v_current.source = 'online' AND v_status->>'state' <> 'ONLINE_AVAILABLE') THEN
      RETURN json_build_object('success', false,
        'error', 'Termin je popunjen ili nije dostupan za ovaj tip rezervacije.',
        'status', v_status);
    END IF;
  END IF;

  UPDATE public.appointments
  SET
    start_time = p_start_time,
    end_time = p_end_time,
    service_type = btrim(p_service_type),
    customer_name = btrim(p_customer_name),
    customer_phone = coalesce(nullif(btrim(p_customer_phone), ''), '—'),
    notes = nullif(btrim(p_notes), ''),
    status = p_status
  WHERE id = p_appointment_id;

  RETURN json_build_object(
    'success', true,
    'status', public.check_slot_availability(p_start_time, p_end_time)
  );
END;
$$;


-- ─── 5. Privileges ──────────────────────────────────────────────────────────
-- Postgres grants EXECUTE to PUBLIC by default; be explicit about who may call what.

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_slot_availability(timestamptz, timestamptz, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_slots_availability(timestamptz[], integer, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_appointment_input(text, text, text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_appointment(text, text, text, timestamptz, timestamptz, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_appointment(uuid, timestamptz, timestamptz, text, text, text, text, text) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.validate_appointment_input(text, text, text, text, text, boolean) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_appointment(uuid, timestamptz, timestamptz, text, text, text, text, text) FROM anon;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_slot_availability(timestamptz, timestamptz, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_slots_availability(timestamptz[], integer, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_appointment(text, text, text, timestamptz, timestamptz, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_appointment(uuid, timestamptz, timestamptz, text, text, text, text, text) TO authenticated;
