-- ============================================================================
-- Count capacity per exact start time instead of per overlapping hour.
--
-- Service durations are not fixed, so the 60-minute end_time is only
-- informational. "Max 4 online bookings per slot" now means: at most 4 online
-- appointments that START at exactly that time. A full 11:00 no longer blocks
-- 11:30. The same applies to total_capacity (online + walk-in).
--
-- check_end is kept in the signature so existing callers keep working, but it
-- no longer affects the result.
-- ============================================================================

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

  -- Only appointments that start at exactly this time count against the slot.
  SELECT
    COUNT(*) FILTER (WHERE source = 'online'),
    COUNT(*)
  INTO v_online_count, v_total_count
  FROM public.appointments
  WHERE status <> 'cancelled'
    AND id IS DISTINCT FROM p_exclude_id
    AND start_time = check_start;

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

REVOKE ALL ON FUNCTION public.check_slot_availability(timestamptz, timestamptz, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_slot_availability(timestamptz, timestamptz, uuid) TO anon, authenticated;
