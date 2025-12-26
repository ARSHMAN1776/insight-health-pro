-- Add CASCADE delete to all patient-related foreign keys
-- This ensures proper cleanup when a patient is deleted

-- Appointments
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

ALTER TABLE public.appointments
ADD CONSTRAINT appointments_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Payments
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_patient_id_fkey;

ALTER TABLE public.payments
ADD CONSTRAINT payments_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Lab Tests
ALTER TABLE public.lab_tests
DROP CONSTRAINT IF EXISTS lab_tests_patient_id_fkey;

ALTER TABLE public.lab_tests
ADD CONSTRAINT lab_tests_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Medical Records
ALTER TABLE public.medical_records
DROP CONSTRAINT IF EXISTS medical_records_patient_id_fkey;

ALTER TABLE public.medical_records
ADD CONSTRAINT medical_records_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Prescriptions
ALTER TABLE public.prescriptions
DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;

ALTER TABLE public.prescriptions
ADD CONSTRAINT prescriptions_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Blood Issues
ALTER TABLE public.blood_issues
DROP CONSTRAINT IF EXISTS blood_issues_patient_id_fkey;

ALTER TABLE public.blood_issues
ADD CONSTRAINT blood_issues_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Room Assignments
ALTER TABLE public.room_assignments
DROP CONSTRAINT IF EXISTS room_assignments_patient_id_fkey;

ALTER TABLE public.room_assignments
ADD CONSTRAINT room_assignments_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Patient Messages
ALTER TABLE public.patient_messages
DROP CONSTRAINT IF EXISTS patient_messages_patient_id_fkey;

ALTER TABLE public.patient_messages
ADD CONSTRAINT patient_messages_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Prescription Refill Requests
ALTER TABLE public.prescription_refill_requests
DROP CONSTRAINT IF EXISTS prescription_refill_requests_patient_id_fkey;

ALTER TABLE public.prescription_refill_requests
ADD CONSTRAINT prescription_refill_requests_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Patient Registration Queue
ALTER TABLE public.patient_registration_queue
DROP CONSTRAINT IF EXISTS patient_registration_queue_patient_id_fkey;

ALTER TABLE public.patient_registration_queue
ADD CONSTRAINT patient_registration_queue_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Surgeries (linked to patients)
ALTER TABLE public.surgeries
DROP CONSTRAINT IF EXISTS surgeries_patient_id_fkey;

ALTER TABLE public.surgeries
ADD CONSTRAINT surgeries_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Also add CASCADE for doctor-related tables for consistency

-- Appointments (doctor)
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;

ALTER TABLE public.appointments
ADD CONSTRAINT appointments_doctor_id_fkey
FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Lab Tests (doctor)
ALTER TABLE public.lab_tests
DROP CONSTRAINT IF EXISTS lab_tests_doctor_id_fkey;

ALTER TABLE public.lab_tests
ADD CONSTRAINT lab_tests_doctor_id_fkey
FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Medical Records (doctor)
ALTER TABLE public.medical_records
DROP CONSTRAINT IF EXISTS medical_records_doctor_id_fkey;

ALTER TABLE public.medical_records
ADD CONSTRAINT medical_records_doctor_id_fkey
FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Prescriptions (doctor)
ALTER TABLE public.prescriptions
DROP CONSTRAINT IF EXISTS prescriptions_doctor_id_fkey;

ALTER TABLE public.prescriptions
ADD CONSTRAINT prescriptions_doctor_id_fkey
FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Patient Messages (doctor)
ALTER TABLE public.patient_messages
DROP CONSTRAINT IF EXISTS patient_messages_doctor_id_fkey;

ALTER TABLE public.patient_messages
ADD CONSTRAINT patient_messages_doctor_id_fkey
FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Surgeries (doctor)
ALTER TABLE public.surgeries
DROP CONSTRAINT IF EXISTS surgeries_doctor_id_fkey;

ALTER TABLE public.surgeries
ADD CONSTRAINT surgeries_doctor_id_fkey
FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Departments (department head)
ALTER TABLE public.departments
DROP CONSTRAINT IF EXISTS departments_department_head_fkey;

ALTER TABLE public.departments
ADD CONSTRAINT departments_department_head_fkey
FOREIGN KEY (department_head) REFERENCES public.doctors(id) ON DELETE SET NULL;