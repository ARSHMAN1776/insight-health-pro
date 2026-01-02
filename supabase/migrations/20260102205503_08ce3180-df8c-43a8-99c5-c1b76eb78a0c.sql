-- Create patient_vitals table for tracking vital signs
CREATE TABLE public.patient_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_by UUID NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature DECIMAL(4,1),
    spo2 INTEGER,
    respiratory_rate INTEGER,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    bmi DECIMAL(4,1),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    blood_glucose DECIMAL(5,1),
    notes TEXT,
    is_abnormal BOOLEAN DEFAULT false,
    abnormal_flags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shift_handovers table for nursing handover documentation
CREATE TABLE public.shift_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outgoing_nurse_id UUID NOT NULL,
    incoming_nurse_id UUID,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_type VARCHAR(20) NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'night')),
    handover_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'completed')),
    general_notes TEXT,
    critical_patients TEXT,
    pending_tasks JSONB DEFAULT '[]'::jsonb,
    medication_notes TEXT,
    equipment_issues TEXT,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shift_handover_patients for per-patient handover details
CREATE TABLE public.shift_handover_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_id UUID NOT NULL REFERENCES public.shift_handovers(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    room_number VARCHAR(20),
    bed_number INTEGER,
    condition_summary TEXT,
    pending_medications TEXT,
    pending_tests TEXT,
    special_instructions TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_handover_patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_vitals
CREATE POLICY "Admins can manage all vitals"
ON public.patient_vitals FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Nurses can insert vitals"
ON public.patient_vitals FOR INSERT
WITH CHECK (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can view all vitals"
ON public.patient_vitals FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can update vitals"
ON public.patient_vitals FOR UPDATE
USING (has_role(auth.uid(), 'nurse'))
WITH CHECK (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Doctors can view vitals for their patients"
ON public.patient_vitals FOR SELECT
USING (
    has_role(auth.uid(), 'doctor') AND 
    doctor_has_patient_relationship(get_doctor_id_for_user(auth.uid()), patient_id)
);

CREATE POLICY "Patients can view own vitals"
ON public.patient_vitals FOR SELECT
USING (patient_id = get_patient_id_for_user(auth.uid()));

-- RLS Policies for shift_handovers
CREATE POLICY "Admins can manage all handovers"
ON public.shift_handovers FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Nurses can insert handovers"
ON public.shift_handovers FOR INSERT
WITH CHECK (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can view all handovers"
ON public.shift_handovers FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can update handovers"
ON public.shift_handovers FOR UPDATE
USING (has_role(auth.uid(), 'nurse'))
WITH CHECK (has_role(auth.uid(), 'nurse'));

-- RLS Policies for shift_handover_patients
CREATE POLICY "Admins can manage all handover patients"
ON public.shift_handover_patients FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Nurses can insert handover patients"
ON public.shift_handover_patients FOR INSERT
WITH CHECK (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can view all handover patients"
ON public.shift_handover_patients FOR SELECT
USING (has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can update handover patients"
ON public.shift_handover_patients FOR UPDATE
USING (has_role(auth.uid(), 'nurse'))
WITH CHECK (has_role(auth.uid(), 'nurse'));

-- Add triggers for updated_at
CREATE TRIGGER update_patient_vitals_updated_at
    BEFORE UPDATE ON public.patient_vitals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_handovers_updated_at
    BEFORE UPDATE ON public.shift_handovers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_patient_vitals_patient_id ON public.patient_vitals(patient_id);
CREATE INDEX idx_patient_vitals_recorded_at ON public.patient_vitals(recorded_at DESC);
CREATE INDEX idx_patient_vitals_is_abnormal ON public.patient_vitals(is_abnormal) WHERE is_abnormal = true;
CREATE INDEX idx_shift_handovers_date ON public.shift_handovers(shift_date DESC);
CREATE INDEX idx_shift_handovers_status ON public.shift_handovers(status);
CREATE INDEX idx_shift_handover_patients_handover_id ON public.shift_handover_patients(handover_id);