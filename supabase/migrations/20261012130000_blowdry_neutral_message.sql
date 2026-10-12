-- Visitors should not see why blow-dry is unavailable: use a neutral message.
-- Same as 20261012120000_blowdry_not_fri_sat.sql apart from the error text.

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
    IF lower(v_service) = 'feniranje' AND extract(isodow FROM v_local_start) IN (5, 6) THEN
      RETURN json_build_object('success', false, 'error',
        'Izabrana usluga nije dostupna za ovaj termin.');
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
