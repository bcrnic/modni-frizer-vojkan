-- Update appointments table
ALTER TABLE appointments 
  ADD COLUMN source text NOT NULL DEFAULT 'online' CHECK (source IN ('online', 'walkin')),
  ADD COLUMN end_time timestamptz,
  -- Convert appointment_date and appointment_time to timestamptz
  ADD COLUMN start_time timestamptz;

-- Migrate existing data
UPDATE appointments 
SET start_time = (appointment_date || ' ' || appointment_time)::timestamptz,
    end_time = (appointment_date || ' ' || appointment_time)::timestamptz + interval '1 hour'
WHERE start_time IS NULL;

-- Create indexes
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Create salon settings
CREATE TABLE salon_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  total_capacity integer NOT NULL DEFAULT 7,
  online_ratio numeric NOT NULL DEFAULT 0.6 CHECK (online_ratio > 0 AND online_ratio <= 1),
  max_online_per_slot integer NOT NULL DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO salon_settings (id) VALUES (1);

-- Function to check slot availability
CREATE OR REPLACE FUNCTION check_slot_availability(
  check_start timestamptz,
  check_end timestamptz
) RETURNS json AS $$
DECLARE
  settings record;
  online_count integer;
  total_count integer;
  result json;
BEGIN
  -- Get salon settings
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

-- Function to create appointment with capacity check
CREATE OR REPLACE FUNCTION create_appointment(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_service_type text,
  p_notes text DEFAULT NULL,
  p_source text DEFAULT 'online'
) RETURNS json AS $$
DECLARE
  slot_status json;
  settings record;
BEGIN
  -- Get salon settings
  SELECT * INTO settings FROM salon_settings WHERE id = 1;
  
  -- Check slot availability
  slot_status := check_slot_availability(p_start_time, p_end_time);
  
  -- Validate based on source
  IF p_source = 'online' AND (slot_status->>'state' != 'ONLINE_AVAILABLE') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Online booking not available for this slot',
      'status', slot_status
    );
  END IF;
  
  IF (slot_status->>'state')::text = 'FULL' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Slot is fully booked',
      'status', slot_status
    );
  END IF;

  -- Insert appointment
  INSERT INTO appointments (
    customer_name,
    customer_phone,
    customer_email,
    start_time,
    end_time,
    service_type,
    notes,
    source,
    status
  ) VALUES (
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_start_time,
    p_end_time,
    p_service_type,
    p_notes,
    p_source,
    'confirmed'
  );

  RETURN json_build_object(
    'success', true,
    'status', check_slot_availability(p_start_time, p_end_time)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
