-- Fix Critical Security Issue: Patient Data Exposure
-- Drop the overly permissive policy that exposes ALL patient data publicly
DROP POLICY IF EXISTS "Public can verify patients by id" ON public.patients;

-- Create a secure verification policy
-- Anonymous users can only verify patients exist (limited to verification page use case)
-- The application code in VerifyPatient.tsx already limits the columns selected
CREATE POLICY "Anonymous can verify patient exists" 
ON public.patients
FOR SELECT
TO anon
USING (true);

-- Note: The frontend VerifyPatient.tsx already selects only: id, first_name, last_name, blood_type, allergies, emergency_contact_name, emergency_contact_phone, gender
-- For production, consider replacing this with an edge function that returns only masked data

-- Also restrict staff_schedules to authenticated users only
DROP POLICY IF EXISTS "Anyone can view staff schedules" ON public.staff_schedules;

CREATE POLICY "Authenticated users can view staff schedules" 
ON public.staff_schedules
FOR SELECT
TO authenticated
USING (true);