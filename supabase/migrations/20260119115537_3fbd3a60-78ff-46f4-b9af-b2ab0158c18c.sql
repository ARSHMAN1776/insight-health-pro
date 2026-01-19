
-- ============================================
-- Step 2: Fix remaining RLS policies
-- ============================================

-- 1. FIX PATIENTS TABLE - Add relationship-based access
-- The previous migration already dropped the overly permissive policies
CREATE POLICY "Staff with care relationship can view patients" ON patients
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_patient_care_relationship(auth.uid(), id)
  );

-- 2. FIX MEDICAL RECORDS - Relationship-based access for nurses  
-- The previous migration already dropped "Nurses can view all medical records"
CREATE POLICY "Nurses view records for patients under care" ON medical_records
  FOR SELECT USING (
    has_role(auth.uid(), 'nurse'::app_role) AND
    has_patient_care_relationship(auth.uid(), patient_id)
  );

CREATE POLICY "Nurses update records for patients under care" ON medical_records
  FOR UPDATE USING (
    has_role(auth.uid(), 'nurse'::app_role) AND
    has_patient_care_relationship(auth.uid(), patient_id)
  );

-- 3. FIX LAB TESTS - Relationship-based access
-- The previous migration already dropped the overly permissive policies
CREATE POLICY "Lab technicians view assigned or pending tests" ON lab_tests
  FOR SELECT USING (
    has_role(auth.uid(), 'lab_technician'::app_role) AND
    (lab_technician = auth.uid()::text OR status IN ('pending', 'in_progress', 'sample_collected'))
  );

CREATE POLICY "Lab technicians update tests" ON lab_tests
  FOR UPDATE USING (
    has_role(auth.uid(), 'lab_technician'::app_role) AND
    (lab_technician = auth.uid()::text OR status IN ('pending', 'in_progress'))
  )
  WITH CHECK (
    has_role(auth.uid(), 'lab_technician'::app_role)
  );

CREATE POLICY "Nurses view lab tests for patients under care" ON lab_tests
  FOR SELECT USING (
    has_role(auth.uid(), 'nurse'::app_role) AND
    has_patient_care_relationship(auth.uid(), patient_id)
  );

-- 4. FIX PRESCRIPTIONS - Relationship-based access for nurses
-- The previous migration already dropped "Nurses can view all prescriptions"
CREATE POLICY "Nurses view prescriptions for patients under care" ON prescriptions
  FOR SELECT USING (
    has_role(auth.uid(), 'nurse'::app_role) AND
    has_patient_care_relationship(auth.uid(), patient_id)
  );

-- 5. FIX APPOINTMENTS - Relationship-based access for nurses
-- The previous migration already dropped "Nurses can view all appointments"
CREATE POLICY "Nurses view todays appointments" ON appointments
  FOR SELECT USING (
    has_role(auth.uid(), 'nurse'::app_role) AND
    appointment_date = CURRENT_DATE
  );

-- 6. FIX DOCTORS TABLE - Staff can view, patients use view
-- The previous migration already dropped "Authenticated users can view doctors"
CREATE POLICY "Staff can view doctor details" ON doctors
  FOR SELECT USING (
    has_role(auth.uid(), 'doctor'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nurse'::app_role) OR
    has_role(auth.uid(), 'receptionist'::app_role) OR
    has_role(auth.uid(), 'lab_technician'::app_role) OR
    has_role(auth.uid(), 'pharmacist'::app_role)
  );

-- Create public directory view for patients (for appointment booking)
CREATE OR REPLACE VIEW public.doctors_directory
WITH (security_invoker = true)
AS SELECT 
  id,
  first_name,
  last_name,
  specialization,
  department,
  department_id,
  consultation_fee,
  availability_schedule,
  status,
  years_of_experience
FROM doctors
WHERE status = 'active';

GRANT SELECT ON public.doctors_directory TO authenticated;

-- 7. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date_status 
  ON appointments(patient_id, appointment_date, status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_queue_entries_patient_status
  ON queue_entries(patient_id, status);

CREATE INDEX IF NOT EXISTS idx_lab_tests_patient_status
  ON lab_tests(patient_id, status)
  WHERE deleted_at IS NULL;
