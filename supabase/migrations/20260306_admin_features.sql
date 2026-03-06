-- Create table for managing holidays / blocked dates
CREATE TABLE salon_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE salon_holidays ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users (admins) can manage holidays
CREATE POLICY "Admins can manage holidays" 
ON salon_holidays 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Public can read holidays to check availability
CREATE POLICY "Public can view holidays" 
ON salon_holidays 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates on holidays
CREATE TRIGGER update_salon_holidays_updated_at
BEFORE UPDATE ON salon_holidays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to perfectly update an appointment
CREATE OR REPLACE FUNCTION update_appointment(
  p_appointment_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_service_type TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_notes TEXT,
  p_status TEXT
) RETURNS json AS $$
DECLARE
  slot_status json;
  settings record;
  current_appointment record;
BEGIN
  -- Get current appointment details BEFORE making any changes
  SELECT * INTO current_appointment FROM appointments WHERE id = p_appointment_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Appointment not found');
  END IF;

  -- Only check availability again IF the time has changed AND it's not being cancelled
  IF (current_appointment.start_time != p_start_time OR current_appointment.end_time != p_end_time) AND p_status != 'cancelled' THEN
    
    -- Temporarily delete the current appointment so check_slot_availability doesn't count it against us
    DELETE FROM appointments WHERE id = p_appointment_id;

    -- Look at what the slots look like now
    slot_status := check_slot_availability(p_start_time, p_end_time);
    
    -- Does it fit?
    IF (slot_status->>'state')::text = 'FULL' OR (current_appointment.source = 'online' AND slot_status->>'state' != 'ONLINE_AVAILABLE') THEN
      -- Re-insert the old appointment details because we cannot move it here
      INSERT INTO appointments (id, customer_name, customer_phone, customer_email, start_time, end_time, service_type, notes, source, status, created_at, updated_at)
      VALUES (
        current_appointment.id, current_appointment.customer_name, current_appointment.customer_phone, 
        current_appointment.customer_email, current_appointment.start_time, current_appointment.end_time, 
        current_appointment.service_type, current_appointment.notes, current_appointment.source, 
        current_appointment.status, current_appointment.created_at, current_appointment.updated_at
      );
      
      RETURN json_build_object('success', false, 'error', 'Slot is fully booked or unavailable for this source.', 'status', slot_status);
    END IF;

    -- Space proved. Insert the appointment at its new spot.
    INSERT INTO appointments (id, customer_name, customer_phone, customer_email, start_time, end_time, service_type, notes, source, status, created_at, updated_at)
    VALUES (
      current_appointment.id, p_customer_name, p_customer_phone, current_appointment.customer_email, p_start_time, p_end_time, p_service_type, p_notes, current_appointment.source, p_status, current_appointment.created_at, now()
    );

  ELSE
    -- Time didn't change, just update the data attributes in-place
    UPDATE appointments 
    SET 
      customer_name = p_customer_name,
      customer_phone = p_customer_phone,
      service_type = p_service_type,
      notes = p_notes,
      status = p_status,
      updated_at = now()
    WHERE id = p_appointment_id;
  END IF;

  RETURN json_build_object('success', true, 'status', check_slot_availability(current_appointment.start_time, current_appointment.end_time));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overwriting check_slot_availability to INCLUDE holidays
CREATE OR REPLACE FUNCTION check_slot_availability(
  check_start timestamptz,
  check_end timestamptz
) RETURNS json AS $$
DECLARE
  settings record;
  online_count integer;
  total_count integer;
  result json;
  is_holiday boolean;
  req_date date;
BEGIN
  -- Get pure date from check_start
  req_date := DATE(check_start AT TIME ZONE 'UTC'); -- adjust timezone if absolutely necessary, but since DB stores UTC usually, basic DATE() is close enough.

  -- 1) Check if this date is a holiday
  SELECT EXISTS(SELECT 1 FROM salon_holidays WHERE holiday_date = req_date) INTO is_holiday;
  
  IF is_holiday THEN
    RETURN json_build_object(
      'state', 'FULL',
      'online_count', 0,
      'total_count', 0,
      'max_online', 0,
      'total_capacity', 0,
      'error', 'Salon is closed on this date (Holiday/Time-off)'
    );
  END IF;

  -- 2) Normal capacity logic down here
  SELECT * INTO settings FROM salon_settings WHERE id = 1;
  
  -- Count existing appointments that overlap with the time slot
  SELECT 
    COUNT(*) FILTER (WHERE source = 'online'),
    COUNT(*)
  INTO 
    online_count,
    total_count
  FROM appointments
  WHERE status = 'confirmed'
    AND NOT (end_time <= check_start OR start_time >= check_end);

  -- Determine slot state
  IF total_count >= settings.total_capacity THEN
    result := json_build_object(
      'state', 'FULL',
      'online_count', online_count,
      'total_count', total_count,
      'max_online', settings.max_online_per_slot,
      'total_capacity', settings.total_capacity
    );
  ELSIF online_count >= settings.max_online_per_slot THEN
    result := json_build_object(
      'state', 'ONLINE_FULL_WALKIN_AVAILABLE',
      'online_count', online_count,
      'total_count', total_count,
      'max_online', settings.max_online_per_slot,
      'total_capacity', settings.total_capacity
    );
  ELSE
    result := json_build_object(
      'state', 'ONLINE_AVAILABLE',
      'online_count', online_count,
      'total_count', total_count,
      'max_online', settings.max_online_per_slot,
      'total_capacity', settings.total_capacity
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
