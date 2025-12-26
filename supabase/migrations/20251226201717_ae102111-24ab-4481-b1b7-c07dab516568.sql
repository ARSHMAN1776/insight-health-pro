-- =====================================================
-- Improvement 1: Add deleted_at column for soft delete
-- =====================================================

-- Add deleted_at column to patients table for soft delete
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_patients_deleted_at ON public.patients(deleted_at);

-- Add deleted_at to related tables for cascade soft delete awareness
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create indexes for soft delete
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON public.appointments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_deleted_at ON public.medical_records(deleted_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_deleted_at ON public.prescriptions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_lab_tests_deleted_at ON public.lab_tests(deleted_at);
CREATE INDEX IF NOT EXISTS idx_payments_deleted_at ON public.payments(deleted_at);

-- =====================================================
-- Improvement 2: Clean up department redundancy
-- Keep department_doctors junction table as primary
-- Remove doctors.department_id (keep for backward compat but deprecate)
-- =====================================================

-- Create a function to get departments for a doctor (using junction table)
CREATE OR REPLACE FUNCTION public.get_doctor_departments(_doctor_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id FROM public.department_doctors WHERE doctor_id = _doctor_id
$$;

-- Migrate existing department_id data to department_doctors if not already there
INSERT INTO public.department_doctors (doctor_id, department_id, role)
SELECT d.id, d.department_id, 'member'
FROM public.doctors d
WHERE d.department_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.department_doctors dd 
    WHERE dd.doctor_id = d.id AND dd.department_id = d.department_id
  )
ON CONFLICT DO NOTHING;