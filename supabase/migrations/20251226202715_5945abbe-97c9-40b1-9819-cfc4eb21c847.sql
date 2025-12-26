-- Create patient_messages table for doctor-patient messaging
CREATE TABLE public.patient_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id),
  sender_type text NOT NULL CHECK (sender_type IN ('patient', 'doctor')),
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create prescription_refill_requests table
CREATE TABLE public.prescription_refill_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id uuid NOT NULL REFERENCES public.prescriptions(id),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_refill_requests ENABLE ROW LEVEL SECURITY;

-- RLS for patient_messages
CREATE POLICY "Patients can view their own messages"
ON public.patient_messages FOR SELECT
USING (patient_id = get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can send messages"
ON public.patient_messages FOR INSERT
WITH CHECK (patient_id = get_patient_id_for_user(auth.uid()) AND sender_type = 'patient');

CREATE POLICY "Doctors can view messages from their patients"
ON public.patient_messages FOR SELECT
USING (doctor_id = get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Doctors can send messages"
ON public.patient_messages FOR INSERT
WITH CHECK (doctor_id = get_doctor_id_for_user(auth.uid()) AND sender_type = 'doctor');

CREATE POLICY "Message participants can update read status"
ON public.patient_messages FOR UPDATE
USING (
  patient_id = get_patient_id_for_user(auth.uid()) OR 
  doctor_id = get_doctor_id_for_user(auth.uid())
);

CREATE POLICY "Admins can manage all messages"
ON public.patient_messages FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS for prescription_refill_requests
CREATE POLICY "Patients can view their own refill requests"
ON public.prescription_refill_requests FOR SELECT
USING (patient_id = get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can create refill requests"
ON public.prescription_refill_requests FOR INSERT
WITH CHECK (patient_id = get_patient_id_for_user(auth.uid()));

CREATE POLICY "Doctors can view refill requests for their prescriptions"
ON public.prescription_refill_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions p 
    WHERE p.id = prescription_id AND p.doctor_id = get_doctor_id_for_user(auth.uid())
  )
);

CREATE POLICY "Doctors can update refill requests for their prescriptions"
ON public.prescription_refill_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions p 
    WHERE p.id = prescription_id AND p.doctor_id = get_doctor_id_for_user(auth.uid())
  )
);

CREATE POLICY "Pharmacists can view all refill requests"
ON public.prescription_refill_requests FOR SELECT
USING (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update refill requests"
ON public.prescription_refill_requests FOR UPDATE
USING (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Admins can manage all refill requests"
ON public.prescription_refill_requests FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_patient_messages_patient ON public.patient_messages(patient_id);
CREATE INDEX idx_patient_messages_doctor ON public.patient_messages(doctor_id);
CREATE INDEX idx_prescription_refills_patient ON public.prescription_refill_requests(patient_id);
CREATE INDEX idx_prescription_refills_prescription ON public.prescription_refill_requests(prescription_id);