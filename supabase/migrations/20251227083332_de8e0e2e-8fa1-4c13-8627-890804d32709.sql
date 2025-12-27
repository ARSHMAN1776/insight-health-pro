-- Add UPDATE policy for patients to cancel/reschedule their own appointments
CREATE POLICY "Patients can update own appointments" 
ON public.appointments 
FOR UPDATE 
USING (patient_id = get_patient_id_for_user(auth.uid()))
WITH CHECK (patient_id = get_patient_id_for_user(auth.uid()));