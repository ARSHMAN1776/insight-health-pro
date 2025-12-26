-- =====================================================
-- SECURITY FIX: Implement Proper Role-Based Access Control
-- =====================================================

-- First, create helper functions to get patient_id and doctor_id for a user
-- These are SECURITY DEFINER to avoid infinite recursion in RLS

-- Get patient_id for a user
CREATE OR REPLACE FUNCTION public.get_patient_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.patients WHERE user_id = _user_id LIMIT 1
$$;

-- Get doctor_id for a user
CREATE OR REPLACE FUNCTION public.get_doctor_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.doctors WHERE user_id = _user_id LIMIT 1
$$;

-- Check if a doctor has treated a patient (has appointments, records, prescriptions, or lab tests)
CREATE OR REPLACE FUNCTION public.doctor_has_patient_relationship(_doctor_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments WHERE doctor_id = _doctor_id AND patient_id = _patient_id
    UNION
    SELECT 1 FROM public.medical_records WHERE doctor_id = _doctor_id AND patient_id = _patient_id
    UNION
    SELECT 1 FROM public.prescriptions WHERE doctor_id = _doctor_id AND patient_id = _patient_id
    UNION
    SELECT 1 FROM public.lab_tests WHERE doctor_id = _doctor_id AND patient_id = _patient_id
  )
$$;

-- =====================================================
-- PATIENTS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Public delete patients" ON public.patients;
DROP POLICY IF EXISTS "Public insert patients" ON public.patients;
DROP POLICY IF EXISTS "Public select patients" ON public.patients;
DROP POLICY IF EXISTS "Public update patients" ON public.patients;

-- Patients can view their own record
CREATE POLICY "Patients can view own record"
ON public.patients FOR SELECT
USING (
  user_id = auth.uid()
);

-- Patients can update their own record
CREATE POLICY "Patients can update own record"
ON public.patients FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Doctors can view patients they have a relationship with
CREATE POLICY "Doctors can view their patients"
ON public.patients FOR SELECT
USING (
  has_role(auth.uid(), 'doctor') AND
  doctor_has_patient_relationship(get_doctor_id_for_user(auth.uid()), id)
);

-- Nurses can view all patients (for care purposes)
CREATE POLICY "Nurses can view all patients"
ON public.patients FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

-- Receptionists can view and manage all patients
CREATE POLICY "Receptionists can view all patients"
ON public.patients FOR SELECT
USING (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can insert patients"
ON public.patients FOR INSERT
WITH CHECK (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can update patients"
ON public.patients FOR UPDATE
USING (has_role(auth.uid(), 'receptionist'))
WITH CHECK (has_role(auth.uid(), 'receptionist'));

-- Admins have full access to patients
CREATE POLICY "Admins can manage all patients"
ON public.patients FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- System can insert patients (for signup trigger)
CREATE POLICY "System can insert patients"
ON public.patients FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- APPOINTMENTS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Public delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public select appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public update appointments" ON public.appointments;

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
ON public.appointments FOR SELECT
USING (
  patient_id = get_patient_id_for_user(auth.uid())
);

-- Patients can create appointments for themselves
CREATE POLICY "Patients can create own appointments"
ON public.appointments FOR INSERT
WITH CHECK (
  patient_id = get_patient_id_for_user(auth.uid())
);

-- Doctors can view their own appointments
CREATE POLICY "Doctors can view own appointments"
ON public.appointments FOR SELECT
USING (
  doctor_id = get_doctor_id_for_user(auth.uid())
);

-- Doctors can update their own appointments
CREATE POLICY "Doctors can update own appointments"
ON public.appointments FOR UPDATE
USING (doctor_id = get_doctor_id_for_user(auth.uid()))
WITH CHECK (doctor_id = get_doctor_id_for_user(auth.uid()));

-- Nurses can view all appointments
CREATE POLICY "Nurses can view all appointments"
ON public.appointments FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

-- Receptionists can manage all appointments
CREATE POLICY "Receptionists can view all appointments"
ON public.appointments FOR SELECT
USING (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can insert appointments"
ON public.appointments FOR INSERT
WITH CHECK (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can update appointments"
ON public.appointments FOR UPDATE
USING (has_role(auth.uid(), 'receptionist'))
WITH CHECK (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can delete appointments"
ON public.appointments FOR DELETE
USING (has_role(auth.uid(), 'receptionist'));

-- Admins have full access
CREATE POLICY "Admins can manage all appointments"
ON public.appointments FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- MEDICAL_RECORDS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.medical_records;
DROP POLICY IF EXISTS "Public delete medical_records" ON public.medical_records;
DROP POLICY IF EXISTS "Public insert medical_records" ON public.medical_records;
DROP POLICY IF EXISTS "Public select medical_records" ON public.medical_records;
DROP POLICY IF EXISTS "Public update medical_records" ON public.medical_records;

-- Patients can view their own medical records
CREATE POLICY "Patients can view own medical records"
ON public.medical_records FOR SELECT
USING (
  patient_id = get_patient_id_for_user(auth.uid())
);

-- Doctors can view records they created
CREATE POLICY "Doctors can view own medical records"
ON public.medical_records FOR SELECT
USING (
  doctor_id = get_doctor_id_for_user(auth.uid())
);

-- Doctors can create medical records
CREATE POLICY "Doctors can create medical records"
ON public.medical_records FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'doctor') AND
  doctor_id = get_doctor_id_for_user(auth.uid())
);

-- Doctors can update records they created
CREATE POLICY "Doctors can update own medical records"
ON public.medical_records FOR UPDATE
USING (doctor_id = get_doctor_id_for_user(auth.uid()))
WITH CHECK (doctor_id = get_doctor_id_for_user(auth.uid()));

-- Nurses can view all medical records (for care purposes)
CREATE POLICY "Nurses can view all medical records"
ON public.medical_records FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

-- Admins have full access
CREATE POLICY "Admins can manage all medical records"
ON public.medical_records FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- PRESCRIPTIONS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.prescriptions;
DROP POLICY IF EXISTS "Public delete prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Public insert prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Public select prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Public update prescriptions" ON public.prescriptions;

-- Patients can view their own prescriptions
CREATE POLICY "Patients can view own prescriptions"
ON public.prescriptions FOR SELECT
USING (
  patient_id = get_patient_id_for_user(auth.uid())
);

-- Doctors can view prescriptions they created
CREATE POLICY "Doctors can view own prescriptions"
ON public.prescriptions FOR SELECT
USING (
  doctor_id = get_doctor_id_for_user(auth.uid())
);

-- Doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'doctor') AND
  doctor_id = get_doctor_id_for_user(auth.uid())
);

-- Doctors can update prescriptions they created
CREATE POLICY "Doctors can update own prescriptions"
ON public.prescriptions FOR UPDATE
USING (doctor_id = get_doctor_id_for_user(auth.uid()))
WITH CHECK (doctor_id = get_doctor_id_for_user(auth.uid()));

-- Pharmacists can view all prescriptions
CREATE POLICY "Pharmacists can view all prescriptions"
ON public.prescriptions FOR SELECT
USING (has_role(auth.uid(), 'pharmacist'));

-- Pharmacists can update prescription status (dispensed, etc.)
CREATE POLICY "Pharmacists can update prescriptions"
ON public.prescriptions FOR UPDATE
USING (has_role(auth.uid(), 'pharmacist'))
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

-- Nurses can view all prescriptions (for care purposes)
CREATE POLICY "Nurses can view all prescriptions"
ON public.prescriptions FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

-- Admins have full access
CREATE POLICY "Admins can manage all prescriptions"
ON public.prescriptions FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- LAB_TESTS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.lab_tests;
DROP POLICY IF EXISTS "Public delete lab_tests" ON public.lab_tests;
DROP POLICY IF EXISTS "Public insert lab_tests" ON public.lab_tests;
DROP POLICY IF EXISTS "Public select lab_tests" ON public.lab_tests;
DROP POLICY IF EXISTS "Public update lab_tests" ON public.lab_tests;

-- Patients can view their own lab tests
CREATE POLICY "Patients can view own lab tests"
ON public.lab_tests FOR SELECT
USING (
  patient_id = get_patient_id_for_user(auth.uid())
);

-- Doctors can view lab tests they ordered
CREATE POLICY "Doctors can view own lab tests"
ON public.lab_tests FOR SELECT
USING (
  doctor_id = get_doctor_id_for_user(auth.uid())
);

-- Doctors can create lab tests
CREATE POLICY "Doctors can create lab tests"
ON public.lab_tests FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'doctor') AND
  doctor_id = get_doctor_id_for_user(auth.uid())
);

-- Doctors can update lab tests they ordered
CREATE POLICY "Doctors can update own lab tests"
ON public.lab_tests FOR UPDATE
USING (doctor_id = get_doctor_id_for_user(auth.uid()))
WITH CHECK (doctor_id = get_doctor_id_for_user(auth.uid()));

-- Nurses can view and update all lab tests (for processing results)
CREATE POLICY "Nurses can view all lab tests"
ON public.lab_tests FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can update lab tests"
ON public.lab_tests FOR UPDATE
USING (has_role(auth.uid(), 'nurse'))
WITH CHECK (has_role(auth.uid(), 'nurse'));

-- Admins have full access
CREATE POLICY "Admins can manage all lab tests"
ON public.lab_tests FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- DOCTORS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Public delete doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public insert doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public select doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public update doctors" ON public.doctors;

-- Everyone can view active doctors (for appointment booking)
CREATE POLICY "Anyone can view active doctors"
ON public.doctors FOR SELECT
USING (status = 'active');

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile"
ON public.doctors FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins have full access
CREATE POLICY "Admins can manage all doctors"
ON public.doctors FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- NURSES TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.nurses;
DROP POLICY IF EXISTS "Public delete nurses" ON public.nurses;
DROP POLICY IF EXISTS "Public insert nurses" ON public.nurses;
DROP POLICY IF EXISTS "Public select nurses" ON public.nurses;
DROP POLICY IF EXISTS "Public update nurses" ON public.nurses;

-- Staff can view nurses
CREATE POLICY "Staff can view nurses"
ON public.nurses FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'doctor') OR
  has_role(auth.uid(), 'nurse') OR
  has_role(auth.uid(), 'receptionist')
);

-- Admins have full access
CREATE POLICY "Admins can manage all nurses"
ON public.nurses FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- PAYMENTS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.payments;
DROP POLICY IF EXISTS "Public delete payments" ON public.payments;
DROP POLICY IF EXISTS "Public insert payments" ON public.payments;
DROP POLICY IF EXISTS "Public select payments" ON public.payments;
DROP POLICY IF EXISTS "Public update payments" ON public.payments;

-- Patients can view their own payments
CREATE POLICY "Patients can view own payments"
ON public.payments FOR SELECT
USING (
  patient_id = get_patient_id_for_user(auth.uid())
);

-- Receptionists can manage payments
CREATE POLICY "Receptionists can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can insert payments"
ON public.payments FOR INSERT
WITH CHECK (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can update payments"
ON public.payments FOR UPDATE
USING (has_role(auth.uid(), 'receptionist'))
WITH CHECK (has_role(auth.uid(), 'receptionist'));

-- Admins have full access
CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- ROOMS TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.rooms;
DROP POLICY IF EXISTS "Public delete rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public select rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public update rooms" ON public.rooms;

-- Staff can view rooms
CREATE POLICY "Staff can view rooms"
ON public.rooms FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'doctor') OR
  has_role(auth.uid(), 'nurse') OR
  has_role(auth.uid(), 'receptionist')
);

-- Nurses can update room occupancy
CREATE POLICY "Nurses can update rooms"
ON public.rooms FOR UPDATE
USING (has_role(auth.uid(), 'nurse'))
WITH CHECK (has_role(auth.uid(), 'nurse'));

-- Admins have full access
CREATE POLICY "Admins can manage all rooms"
ON public.rooms FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- INVENTORY TABLE - Drop old policies and create new ones
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.inventory;
DROP POLICY IF EXISTS "Public delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Public insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Public select inventory" ON public.inventory;
DROP POLICY IF EXISTS "Public update inventory" ON public.inventory;

-- Staff can view inventory
CREATE POLICY "Staff can view inventory"
ON public.inventory FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'pharmacist') OR
  has_role(auth.uid(), 'nurse')
);

-- Pharmacists can manage inventory
CREATE POLICY "Pharmacists can insert inventory"
ON public.inventory FOR INSERT
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update inventory"
ON public.inventory FOR UPDATE
USING (has_role(auth.uid(), 'pharmacist'))
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

-- Admins have full access
CREATE POLICY "Admins can manage all inventory"
ON public.inventory FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));