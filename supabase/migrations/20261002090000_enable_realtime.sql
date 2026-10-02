-- The admin dashboard listens for appointment changes (live refresh).
-- On Supabase this needs the table in the supabase_realtime publication.
-- Guarded so it is a no-op where the publication does not exist or already
-- contains the table.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
END $$;
