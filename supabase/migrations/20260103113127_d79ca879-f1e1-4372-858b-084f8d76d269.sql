-- Create appointment_waitlist table
CREATE TABLE public.appointment_waitlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(department_id) ON DELETE SET NULL,
    preferred_date_start DATE NOT NULL,
    preferred_date_end DATE,
    preferred_time_slots JSONB DEFAULT '[]'::jsonb,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
    reason TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'cancelled', 'expired')),
    notified_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view own waitlist entries"
ON public.appointment_waitlist FOR SELECT
USING (patient_id = get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can create own waitlist entries"
ON public.appointment_waitlist FOR INSERT
WITH CHECK (patient_id = get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can update own waitlist entries"
ON public.appointment_waitlist FOR UPDATE
USING (patient_id = get_patient_id_for_user(auth.uid()))
WITH CHECK (patient_id = get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can cancel own waitlist entries"
ON public.appointment_waitlist FOR DELETE
USING (patient_id = get_patient_id_for_user(auth.uid()));

CREATE POLICY "Admins can manage all waitlist entries"
ON public.appointment_waitlist FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Receptionists can manage all waitlist entries"
ON public.appointment_waitlist FOR ALL
USING (has_role(auth.uid(), 'receptionist'))
WITH CHECK (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Doctors can view waitlist for their appointments"
ON public.appointment_waitlist FOR SELECT
USING (doctor_id = get_doctor_id_for_user(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_appointment_waitlist_updated_at
BEFORE UPDATE ON public.appointment_waitlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient queries
CREATE INDEX idx_waitlist_status ON public.appointment_waitlist(status);
CREATE INDEX idx_waitlist_patient ON public.appointment_waitlist(patient_id);
CREATE INDEX idx_waitlist_doctor ON public.appointment_waitlist(doctor_id);
CREATE INDEX idx_waitlist_preferred_dates ON public.appointment_waitlist(preferred_date_start, preferred_date_end);