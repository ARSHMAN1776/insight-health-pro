
-- IPD Admissions table
CREATE TABLE public.ipd_admissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  department_id UUID REFERENCES public.departments(department_id),
  room_assignment_id UUID REFERENCES public.room_assignments(id),
  admission_number TEXT NOT NULL,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_discharge_date DATE,
  actual_discharge_date TIMESTAMPTZ,
  admission_type TEXT NOT NULL DEFAULT 'planned' CHECK (admission_type IN ('emergency', 'planned', 'transfer', 'referral')),
  admission_reason TEXT NOT NULL,
  diagnosis_at_admission TEXT,
  diagnosis_code TEXT,
  status TEXT NOT NULL DEFAULT 'admitted' CHECK (status IN ('admitted', 'under_treatment', 'ready_for_discharge', 'discharged', 'transferred', 'deceased', 'lama')),
  attending_nurse_id UUID,
  insurance_info JSONB,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  allergies TEXT,
  special_instructions TEXT,
  diet_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Ward Rounds table
CREATE TABLE public.ward_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_id UUID NOT NULL REFERENCES public.ipd_admissions(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  nurse_id UUID,
  round_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  round_type TEXT NOT NULL DEFAULT 'routine' CHECK (round_type IN ('routine', 'emergency', 'specialist', 'night')),
  patient_condition TEXT NOT NULL DEFAULT 'stable' CHECK (patient_condition IN ('critical', 'serious', 'stable', 'improving', 'deteriorating')),
  vitals JSONB,
  subjective_notes TEXT,
  objective_notes TEXT,
  assessment TEXT,
  plan TEXT,
  medication_changes TEXT,
  diet_changes TEXT,
  investigation_orders TEXT,
  next_review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discharge Summaries table
CREATE TABLE public.discharge_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_id UUID NOT NULL REFERENCES public.ipd_admissions(id) ON DELETE CASCADE UNIQUE,
  prepared_by UUID NOT NULL,
  approved_by UUID,
  discharge_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  discharge_type TEXT NOT NULL DEFAULT 'normal' CHECK (discharge_type IN ('normal', 'lama', 'transfer', 'expired', 'absconded')),
  diagnosis_at_discharge TEXT NOT NULL,
  diagnosis_codes TEXT[],
  procedures_performed TEXT,
  procedure_codes TEXT[],
  treatment_summary TEXT NOT NULL,
  course_in_hospital TEXT,
  condition_at_discharge TEXT NOT NULL DEFAULT 'stable' CHECK (condition_at_discharge IN ('stable', 'improved', 'unchanged', 'deteriorated', 'critical')),
  follow_up_instructions TEXT,
  follow_up_date DATE,
  medications_at_discharge JSONB,
  diet_advice TEXT,
  activity_restrictions TEXT,
  warning_signs TEXT,
  referrals TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'finalized')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ipd_admissions_patient ON public.ipd_admissions(patient_id);
CREATE INDEX idx_ipd_admissions_doctor ON public.ipd_admissions(doctor_id);
CREATE INDEX idx_ipd_admissions_status ON public.ipd_admissions(status);
CREATE INDEX idx_ipd_admissions_date ON public.ipd_admissions(admission_date DESC);
CREATE INDEX idx_ward_rounds_admission ON public.ward_rounds(admission_id);
CREATE INDEX idx_ward_rounds_date ON public.ward_rounds(round_date DESC);
CREATE INDEX idx_discharge_summaries_admission ON public.discharge_summaries(admission_id);

-- Generate admission number sequence
CREATE SEQUENCE IF NOT EXISTS ipd_admission_seq START 1001;

-- Trigger for admission number
CREATE OR REPLACE FUNCTION public.generate_admission_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admission_number IS NULL OR NEW.admission_number = '' THEN
    NEW.admission_number := 'IPD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('ipd_admission_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_admission_number
BEFORE INSERT ON public.ipd_admissions
FOR EACH ROW
EXECUTE FUNCTION public.generate_admission_number();

-- Updated_at trigger for ipd_admissions
CREATE TRIGGER update_ipd_admissions_updated_at
BEFORE UPDATE ON public.ipd_admissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for discharge_summaries
CREATE TRIGGER update_discharge_summaries_updated_at
BEFORE UPDATE ON public.discharge_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.ipd_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ward_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ipd_admissions
CREATE POLICY "Authenticated users can view admissions"
ON public.ipd_admissions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can create admissions"
ON public.ipd_admissions FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update admissions"
ON public.ipd_admissions FOR UPDATE TO authenticated
USING (true);

-- RLS Policies for ward_rounds
CREATE POLICY "Authenticated users can view ward rounds"
ON public.ward_rounds FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can create ward rounds"
ON public.ward_rounds FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update ward rounds"
ON public.ward_rounds FOR UPDATE TO authenticated
USING (true);

-- RLS Policies for discharge_summaries
CREATE POLICY "Authenticated users can view discharge summaries"
ON public.discharge_summaries FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can create discharge summaries"
ON public.discharge_summaries FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update discharge summaries"
ON public.discharge_summaries FOR UPDATE TO authenticated
USING (true);
