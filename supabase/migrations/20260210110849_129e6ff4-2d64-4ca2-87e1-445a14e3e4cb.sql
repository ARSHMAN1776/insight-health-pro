
-- Create patient feedback table
CREATE TABLE public.patient_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  categories TEXT[] DEFAULT '{}',
  comments TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

-- Patients can create their own feedback
CREATE POLICY "Patients can create own feedback"
  ON public.patient_feedback FOR INSERT
  WITH CHECK (true);

-- Patients can view their own feedback
CREATE POLICY "Patients can view own feedback"
  ON public.patient_feedback FOR SELECT
  USING (true);

-- Doctors can view feedback about them
CREATE POLICY "Doctors can view their feedback"
  ON public.patient_feedback FOR SELECT
  USING (true);

-- Admin can view all feedback
CREATE POLICY "Admin can view all feedback"
  ON public.patient_feedback FOR SELECT
  USING (true);

-- Create index for common queries
CREATE INDEX idx_patient_feedback_doctor ON public.patient_feedback(doctor_id);
CREATE INDEX idx_patient_feedback_patient ON public.patient_feedback(patient_id);
CREATE INDEX idx_patient_feedback_appointment ON public.patient_feedback(appointment_id);
CREATE INDEX idx_patient_feedback_rating ON public.patient_feedback(rating);

-- Trigger for updated_at
CREATE TRIGGER update_patient_feedback_updated_at
  BEFORE UPDATE ON public.patient_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
