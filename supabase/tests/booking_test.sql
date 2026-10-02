-- Integration tests for RLS and booking RPCs.
-- Run with supabase/tests/run.sh against a throwaway Postgres (never production).
\set ON_ERROR_STOP 1
SET client_min_messages = warning;

-- ─── Fixtures ───────────────────────────────────────────────────────────────

CREATE TABLE test_ctx (k text PRIMARY KEY, v text);
GRANT SELECT ON test_ctx TO anon, authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000000a', 'owner@salon.test'),
  ('00000000-0000-0000-0000-00000000000b', 'stranger@evil.test');
INSERT INTO public.admin_users (user_id) VALUES ('00000000-0000-0000-0000-00000000000a');

-- Next week's Monday and Tuesday at 12:00 / 15:00 salon time, and the Sunday after.
INSERT INTO test_ctx VALUES
  ('mon_noon', ((date_trunc('week', now() AT TIME ZONE 'Europe/Belgrade') + interval '7 days 12 hours') AT TIME ZONE 'Europe/Belgrade')::text),
  ('tue_15',   ((date_trunc('week', now() AT TIME ZONE 'Europe/Belgrade') + interval '8 days 15 hours') AT TIME ZONE 'Europe/Belgrade')::text),
  ('wed_00_30',((date_trunc('week', now() AT TIME ZONE 'Europe/Belgrade') + interval '9 days 30 minutes') AT TIME ZONE 'Europe/Belgrade')::text),
  ('sun_noon', ((date_trunc('week', now() AT TIME ZONE 'Europe/Belgrade') + interval '13 days 12 hours') AT TIME ZONE 'Europe/Belgrade')::text);

CREATE FUNCTION ctx(key text) RETURNS timestamptz LANGUAGE sql STABLE AS
  $$ SELECT v::timestamptz FROM test_ctx WHERE k = key $$;
GRANT EXECUTE ON FUNCTION ctx(text) TO anon, authenticated;

CREATE FUNCTION book(name text, phone text, start_at timestamptz, source text DEFAULT 'online', email text DEFAULT NULL)
RETURNS json LANGUAGE sql AS $$
  SELECT public.create_appointment(name, phone, email, start_at, start_at + interval '1 hour', 'Šišanje', NULL, source)
$$;
GRANT EXECUTE ON FUNCTION book(text, text, timestamptz, text, text) TO anon, authenticated;


-- ─── Anonymous visitor ──────────────────────────────────────────────────────

SET ROLE anon;
SET request.jwt.claims = '{"role":"anon"}';

DO $$
DECLARE r json;
BEGIN
  r := book('Ana Anić', '+381 60 1234567', ctx('mon_noon'), 'online', 'ana@example.com');
  ASSERT (r->>'success')::boolean, 'anon online booking should succeed: ' || r;
  ASSERT r->>'appointment_id' IS NOT NULL, 'booking returns appointment_id';

  ASSERT (SELECT count(*) FROM public.appointments) = 0, 'anon must not read appointments';
  ASSERT NOT public.is_admin(), 'anon is not admin';

  r := book('Ana Anić', '+381 60 1234567', ctx('mon_noon'), 'walkin');
  ASSERT NOT (r->>'success')::boolean, 'anon must not create walk-ins';

  r := book('Ana Anić', 'abc', ctx('mon_noon'));
  ASSERT NOT (r->>'success')::boolean AND r->>'error' LIKE '%telefon%', 'invalid phone rejected: ' || r;

  r := book('A', '0601234567', ctx('mon_noon'));
  ASSERT NOT (r->>'success')::boolean, 'too short name rejected';

  r := book(repeat('x', 101), '0601234567', ctx('mon_noon'));
  ASSERT NOT (r->>'success')::boolean, 'too long name rejected';

  r := book('Ana Anić', '0601234567', ctx('mon_noon'), 'online', 'not-an-email');
  ASSERT NOT (r->>'success')::boolean, 'invalid email rejected';

  r := book('Ana Anić', '0601234567', now() - interval '1 hour');
  ASSERT NOT (r->>'success')::boolean, 'past slot rejected';

  r := book('Ana Anić', '0601234567', now() + interval '90 days');
  ASSERT NOT (r->>'success')::boolean, 'slot beyond 60 days rejected';

  r := book('Ana Anić', '0601234567', ctx('sun_noon'));
  ASSERT NOT (r->>'success')::boolean AND r->>'error' LIKE '%Nedelj%', 'sunday rejected: ' || r;

  r := public.get_slots_availability(ARRAY[ctx('mon_noon'), ctx('tue_15')]);
  ASSERT json_array_length(r) = 2, 'batch availability returns one entry per slot';
  ASSERT (r->0->'availability'->>'online_count')::int = 1, 'batch sees the existing booking';
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.appointments (customer_name, customer_phone, service_type, start_time, end_time)
    VALUES ('x', 'x', 'x', now(), now() + interval '1 hour');
    RAISE EXCEPTION 'anon direct insert should fail';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    INSERT INTO public.salon_holidays (holiday_date) VALUES (current_date + 3);
    RAISE EXCEPTION 'anon holiday insert should fail';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    PERFORM public.update_appointment(gen_random_uuid(), now(), now() + interval '1 hour', 'x', 'xx', 'x', NULL, 'cancelled');
    RAISE EXCEPTION 'anon update_appointment should fail';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  UPDATE public.salon_settings SET total_capacity = 1000;
  DELETE FROM public.salon_holidays;
END $$;

RESET ROLE;
DO $$ BEGIN
  ASSERT (SELECT total_capacity FROM public.salon_settings) = 7, 'anon must not change settings';
END $$;


-- ─── Logged-in user who is NOT an admin ────────────────────────────────────

SET ROLE authenticated;
SET request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-00000000000b"}';

DO $$
DECLARE r json;
BEGIN
  ASSERT NOT public.is_admin(), 'stranger is not admin';
  ASSERT (SELECT count(*) FROM public.appointments) = 0, 'non-admin must not read appointments';

  UPDATE public.appointments SET status = 'cancelled';
  r := book('Mallory', '0601111111', ctx('mon_noon'), 'walkin');
  ASSERT NOT (r->>'success')::boolean, 'non-admin must not create walk-ins';

  r := public.update_appointment(gen_random_uuid(), ctx('mon_noon'), ctx('mon_noon') + interval '1 hour', 'x', 'xx', 'x', NULL, 'cancelled');
  ASSERT NOT (r->>'success')::boolean, 'non-admin update_appointment refused';
END $$;

RESET ROLE;
DO $$ BEGIN
  ASSERT (SELECT count(*) FROM public.appointments WHERE status = 'cancelled') = 0,
    'non-admin must not cancel appointments';
END $$;


-- ─── Capacity and limits (anon books, admin adds walk-ins) ──────────────────

SET ROLE anon;
SET request.jwt.claims = '{"role":"anon"}';

DO $$
DECLARE r json; i int;
BEGIN
  -- 7 seats * 0.6 = 4 online seats per slot; one is already taken.
  FOR i IN 2..4 LOOP
    r := book('Klijentkinja ' || i, '06000000' || i, ctx('mon_noon'));
    ASSERT (r->>'success')::boolean, 'online booking ' || i || ' should fit: ' || r;
  END LOOP;

  r := book('Klijentkinja 5', '0600000005', ctx('mon_noon'));
  ASSERT NOT (r->>'success')::boolean, 'fifth online booking must be refused';
  ASSERT r->'status'->>'state' = 'ONLINE_FULL_WALKIN_AVAILABLE', 'state is walk-in only: ' || r;

  -- Capacity counts per exact start time: a full 12:00 does not block 12:30,
  -- and 12:30 gets its own 4 online seats.
  FOR i IN 1..4 LOOP
    r := book('Pola sata ' || i, '06400000' || i, ctx('mon_noon') + interval '30 minutes');
    ASSERT (r->>'success')::boolean, '12:30 booking ' || i || ' independent of full 12:00: ' || r;
  END LOOP;
  r := book('Pola sata 5', '0640000005', ctx('mon_noon') + interval '30 minutes');
  ASSERT NOT (r->>'success')::boolean, 'fifth online booking at 12:30 must be refused';
  ASSERT (public.check_slot_availability(ctx('mon_noon') - interval '30 minutes', ctx('mon_noon') + interval '30 minutes')->>'online_count')::int = 0,
    '11:30 does not see 12:00 bookings';

  -- Per-phone limit: three active online bookings per number.
  r := book('Ista', '0611111111', ctx('tue_15'));
  ASSERT (r->>'success')::boolean, 'phone booking 1';
  r := book('Ista', '061 111 1111', ctx('tue_15') + interval '1 hour');
  ASSERT (r->>'success')::boolean, 'phone booking 2';
  r := book('Ista', '061/111-1111', ctx('tue_15') + interval '2 hours');
  ASSERT (r->>'success')::boolean, 'phone booking 3';
  r := book('Ista', '0611111111', ctx('tue_15') + interval '3 hours');
  ASSERT NOT (r->>'success')::boolean AND r->>'error' LIKE '%3 zakazana%', 'phone limit (normalised): ' || r;
END $$;

SET ROLE authenticated;
SET request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-00000000000a"}';

DO $$
DECLARE r json; i int;
BEGIN
  ASSERT public.is_admin(), 'owner is admin';
  ASSERT (SELECT count(*) FROM public.appointments) = 11, 'admin sees all appointments';

  FOR i IN 1..3 LOOP
    r := book('Walk-in ' || i, '', ctx('mon_noon'), 'walkin');
    ASSERT (r->>'success')::boolean, 'walk-in ' || i || ' should fit: ' || r;
  END LOOP;

  r := book('Walk-in 4', '', ctx('mon_noon'), 'walkin');
  ASSERT NOT (r->>'success')::boolean AND r->'status'->>'state' = 'FULL', 'eighth person must be refused: ' || r;

  -- A completely full 12:00 still leaves 12:30 open for walk-ins.
  FOR i IN 1..3 LOOP
    r := book('Walk-in 12:30 ' || i, '', ctx('mon_noon') + interval '30 minutes', 'walkin');
    ASSERT (r->>'success')::boolean, '12:30 walk-in ' || i || ': ' || r;
  END LOOP;
  r := book('Walk-in 12:30 4', '', ctx('mon_noon') + interval '30 minutes', 'walkin');
  ASSERT NOT (r->>'success')::boolean, '12:30 is full after 7 people';

  -- Admin may record a walk-in that already started.
  r := book('Upravo ušla', '', now() - interval '10 minutes', 'walkin');
  ASSERT (r->>'success')::boolean, 'admin can record a past walk-in: ' || r;
END $$;

DO $$
DECLARE r json; v_id uuid; v_other uuid;
BEGIN
  SELECT id INTO v_id FROM public.appointments WHERE customer_phone = '0611111111' AND start_time = ctx('tue_15');

  -- Moving into the full Monday slot fails and leaves the row untouched.
  r := public.update_appointment(v_id, ctx('mon_noon'), ctx('mon_noon') + interval '1 hour', 'Šišanje', 'Ista', '0611111111', NULL, 'confirmed');
  ASSERT NOT (r->>'success')::boolean, 'cannot move into a full slot';
  ASSERT (SELECT start_time FROM public.appointments WHERE id = v_id) = ctx('tue_15'), 'row unchanged after refused move';

  -- Editing details without moving does not count the appointment against itself.
  r := public.update_appointment(v_id, ctx('tue_15'), ctx('tue_15') + interval '1 hour', 'Feniranje', 'Ista Izmenjena', '0611111111', 'nap', 'confirmed');
  ASSERT (r->>'success')::boolean, 'in-place edit: ' || r;

  -- Moving to an empty slot works and keeps id/created_at.
  r := public.update_appointment(v_id, ctx('tue_15') + interval '4 hours', ctx('tue_15') + interval '5 hours', 'Feniranje', 'Ista Izmenjena', '0611111111', NULL, 'confirmed');
  ASSERT (r->>'success')::boolean, 'move to free slot: ' || r;
  ASSERT (SELECT service_type FROM public.appointments WHERE id = v_id) = 'Feniranje', 'fields updated';

  -- Cancel one Monday booking, fill the seat with a walk-in, then re-confirming must fail.
  SELECT id INTO v_other FROM public.appointments WHERE source = 'online' AND start_time = ctx('mon_noon') LIMIT 1;
  r := public.update_appointment(v_other, ctx('mon_noon'), ctx('mon_noon') + interval '1 hour', 'Šišanje', 'Neko', '0600000002', NULL, 'cancelled');
  ASSERT (r->>'success')::boolean, 'cancel: ' || r;
  r := book('Walk-in 4', '', ctx('mon_noon'), 'walkin');
  ASSERT (r->>'success')::boolean, 'freed seat can be used: ' || r;
  r := public.update_appointment(v_other, ctx('mon_noon'), ctx('mon_noon') + interval '1 hour', 'Šišanje', 'Neko', '0600000002', NULL, 'confirmed');
  ASSERT NOT (r->>'success')::boolean, 're-confirming into a full slot is refused';

  -- Holidays use the salon's calendar day: 00:30 in Belgrade is still that day.
  INSERT INTO public.salon_holidays (holiday_date, reason)
  VALUES ((ctx('wed_00_30') AT TIME ZONE 'Europe/Belgrade')::date, 'Odmor');
  r := public.check_slot_availability(ctx('wed_00_30'), ctx('wed_00_30') + interval '1 hour');
  ASSERT r->>'state' = 'FULL' AND (r->>'holiday')::boolean, 'holiday blocks slot in local time: ' || r;

  UPDATE public.salon_settings SET max_online_per_slot = 5;
  ASSERT (SELECT max_online_per_slot FROM public.salon_settings) = 5, 'admin can change settings';
  UPDATE public.salon_settings SET max_online_per_slot = 4;
END $$;

SET ROLE anon;
SET request.jwt.claims = '{"role":"anon"}';

DO $$
DECLARE r json;
BEGIN
  r := book('Praznik', '0622222222', ctx('wed_00_30') + interval '11 hours');
  ASSERT NOT (r->>'success')::boolean, 'cannot book on a holiday';
  ASSERT (SELECT count(*) FROM public.salon_holidays) = 1, 'anon can read holidays';
END $$;

RESET ROLE;
DO $$ BEGIN
  ASSERT EXISTS (SELECT 1 FROM pg_publication_tables
                 WHERE pubname = 'supabase_realtime' AND tablename = 'appointments'),
    'appointments must be in the realtime publication';
END $$;
\echo 'All booking tests passed.'
