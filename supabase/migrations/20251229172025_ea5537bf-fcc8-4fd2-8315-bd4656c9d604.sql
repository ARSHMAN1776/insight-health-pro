-- Allow patients to delete their own messages
CREATE POLICY "Patients can delete their own messages"
ON public.patient_messages
FOR DELETE
USING (
  patient_id = get_patient_id_for_user(auth.uid()) 
  AND sender_type = 'patient'
);

-- Allow doctors to delete their own messages
CREATE POLICY "Doctors can delete their own messages"
ON public.patient_messages
FOR DELETE
USING (
  doctor_id = get_doctor_id_for_user(auth.uid()) 
  AND sender_type = 'doctor'
);