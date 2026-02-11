-- ============================================
-- 1. UNIQUE constraint: sprečava dupla zakazivanja na isti datum/vreme
--    Partial unique index - važi samo za termine koji NISU otkazani
-- ============================================
CREATE UNIQUE INDEX idx_unique_appointment_slot
ON public.appointments (appointment_date, appointment_time)
WHERE status != 'cancelled';

-- ============================================
-- 2. Restriktivniji RLS: javni korisnici vide SAMO datum i vreme
--    (ne lične podatke klijenata)
-- ============================================

-- Ukloni stari previše otvoreni SELECT policy
DROP POLICY IF EXISTS "Public can check availability" ON public.appointments;

-- Novi policy: javni korisnici mogu čitati samo za proveru dostupnosti
-- Ali RLS ne može ograničiti kolone, pa koristimo Supabase RPC funkciju
-- Za sada ostavljamo SELECT ali ćemo koristiti RPC za availability check

-- Kreiramo sigurnu RPC funkciju koja vraća SAMO zauzete slotove (datum + vreme)
CREATE OR REPLACE FUNCTION public.get_booked_slots(check_date DATE)
RETURNS TABLE (appointment_time TIME) AS $$
BEGIN
  RETURN QUERY
  SELECT a.appointment_time
  FROM public.appointments a
  WHERE a.appointment_date = check_date
    AND a.status != 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Restriktivniji SELECT policy: blokiramo javni pristup ličnim podacima
-- Samo autentifikovani admin korisnici mogu videti sve podatke
DROP POLICY IF EXISTS "Public can check availability" ON public.appointments;

CREATE POLICY "Authenticated users can view all appointments"
ON public.appointments
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy za UPDATE: samo autentifikovani korisnici (admin)
CREATE POLICY "Authenticated users can update appointments"
ON public.appointments
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy za DELETE: samo autentifikovani korisnici (admin)
CREATE POLICY "Authenticated users can delete appointments"
ON public.appointments
FOR DELETE
USING (auth.role() = 'authenticated');
