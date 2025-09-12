-- Open access policies for development to allow saving and reading without authentication
-- NOTE: Healthcare data should be protected in production. Replace with proper auth-based RLS later.

-- Helper function: create policies only if they don't already exist
DO $$ BEGIN
  -- patients
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Public select patients'
  ) THEN
    CREATE POLICY "Public select patients" ON public.patients FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Public insert patients'
  ) THEN
    CREATE POLICY "Public insert patients" ON public.patients FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Public update patients'
  ) THEN
    CREATE POLICY "Public update patients" ON public.patients FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Public delete patients'
  ) THEN
    CREATE POLICY "Public delete patients" ON public.patients FOR DELETE USING (true);
  END IF;

  -- doctors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='doctors' AND policyname='Public select doctors'
  ) THEN
    CREATE POLICY "Public select doctors" ON public.doctors FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='doctors' AND policyname='Public insert doctors'
  ) THEN
    CREATE POLICY "Public insert doctors" ON public.doctors FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='doctors' AND policyname='Public update doctors'
  ) THEN
    CREATE POLICY "Public update doctors" ON public.doctors FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='doctors' AND policyname='Public delete doctors'
  ) THEN
    CREATE POLICY "Public delete doctors" ON public.doctors FOR DELETE USING (true);
  END IF;

  -- nurses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nurses' AND policyname='Public select nurses'
  ) THEN
    CREATE POLICY "Public select nurses" ON public.nurses FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nurses' AND policyname='Public insert nurses'
  ) THEN
    CREATE POLICY "Public insert nurses" ON public.nurses FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nurses' AND policyname='Public update nurses'
  ) THEN
    CREATE POLICY "Public update nurses" ON public.nurses FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nurses' AND policyname='Public delete nurses'
  ) THEN
    CREATE POLICY "Public delete nurses" ON public.nurses FOR DELETE USING (true);
  END IF;

  -- appointments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Public select appointments'
  ) THEN
    CREATE POLICY "Public select appointments" ON public.appointments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Public insert appointments'
  ) THEN
    CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Public update appointments'
  ) THEN
    CREATE POLICY "Public update appointments" ON public.appointments FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Public delete appointments'
  ) THEN
    CREATE POLICY "Public delete appointments" ON public.appointments FOR DELETE USING (true);
  END IF;

  -- medical_records
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='medical_records' AND policyname='Public select medical_records'
  ) THEN
    CREATE POLICY "Public select medical_records" ON public.medical_records FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='medical_records' AND policyname='Public insert medical_records'
  ) THEN
    CREATE POLICY "Public insert medical_records" ON public.medical_records FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='medical_records' AND policyname='Public update medical_records'
  ) THEN
    CREATE POLICY "Public update medical_records" ON public.medical_records FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='medical_records' AND policyname='Public delete medical_records'
  ) THEN
    CREATE POLICY "Public delete medical_records" ON public.medical_records FOR DELETE USING (true);
  END IF;

  -- prescriptions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prescriptions' AND policyname='Public select prescriptions'
  ) THEN
    CREATE POLICY "Public select prescriptions" ON public.prescriptions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prescriptions' AND policyname='Public insert prescriptions'
  ) THEN
    CREATE POLICY "Public insert prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prescriptions' AND policyname='Public update prescriptions'
  ) THEN
    CREATE POLICY "Public update prescriptions" ON public.prescriptions FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prescriptions' AND policyname='Public delete prescriptions'
  ) THEN
    CREATE POLICY "Public delete prescriptions" ON public.prescriptions FOR DELETE USING (true);
  END IF;

  -- lab_tests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lab_tests' AND policyname='Public select lab_tests'
  ) THEN
    CREATE POLICY "Public select lab_tests" ON public.lab_tests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lab_tests' AND policyname='Public insert lab_tests'
  ) THEN
    CREATE POLICY "Public insert lab_tests" ON public.lab_tests FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lab_tests' AND policyname='Public update lab_tests'
  ) THEN
    CREATE POLICY "Public update lab_tests" ON public.lab_tests FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lab_tests' AND policyname='Public delete lab_tests'
  ) THEN
    CREATE POLICY "Public delete lab_tests" ON public.lab_tests FOR DELETE USING (true);
  END IF;

  -- inventory
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory' AND policyname='Public select inventory'
  ) THEN
    CREATE POLICY "Public select inventory" ON public.inventory FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory' AND policyname='Public insert inventory'
  ) THEN
    CREATE POLICY "Public insert inventory" ON public.inventory FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory' AND policyname='Public update inventory'
  ) THEN
    CREATE POLICY "Public update inventory" ON public.inventory FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inventory' AND policyname='Public delete inventory'
  ) THEN
    CREATE POLICY "Public delete inventory" ON public.inventory FOR DELETE USING (true);
  END IF;

  -- rooms
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rooms' AND policyname='Public select rooms'
  ) THEN
    CREATE POLICY "Public select rooms" ON public.rooms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rooms' AND policyname='Public insert rooms'
  ) THEN
    CREATE POLICY "Public insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rooms' AND policyname='Public update rooms'
  ) THEN
    CREATE POLICY "Public update rooms" ON public.rooms FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rooms' AND policyname='Public delete rooms'
  ) THEN
    CREATE POLICY "Public delete rooms" ON public.rooms FOR DELETE USING (true);
  END IF;

  -- payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Public select payments'
  ) THEN
    CREATE POLICY "Public select payments" ON public.payments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Public insert payments'
  ) THEN
    CREATE POLICY "Public insert payments" ON public.payments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Public update payments'
  ) THEN
    CREATE POLICY "Public update payments" ON public.payments FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Public delete payments'
  ) THEN
    CREATE POLICY "Public delete payments" ON public.payments FOR DELETE USING (true);
  END IF;
END $$;