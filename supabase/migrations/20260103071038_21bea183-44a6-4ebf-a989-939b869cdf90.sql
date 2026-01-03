-- Create insurance claims table
CREATE TABLE public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    claim_number VARCHAR(50) UNIQUE,
    insurance_provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    submission_date DATE DEFAULT CURRENT_DATE,
    service_date DATE NOT NULL,
    diagnosis_codes TEXT[] DEFAULT '{}',
    procedure_codes TEXT[] DEFAULT '{}',
    total_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'draft',
    denial_reason TEXT,
    denial_code VARCHAR(20),
    appeal_deadline DATE,
    appeal_submitted BOOLEAN DEFAULT FALSE,
    appeal_notes TEXT,
    notes TEXT,
    submitted_by UUID,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create insurance claim items for line items
CREATE TABLE public.insurance_claim_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    procedure_code VARCHAR(20) NOT NULL,
    procedure_description TEXT,
    diagnosis_code VARCHAR(20),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    denial_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claim_items ENABLE ROW LEVEL SECURITY;

-- Generate claim number function
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.claim_number IS NULL THEN
        NEW.claim_number := 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_claim_number
    BEFORE INSERT ON public.insurance_claims
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_claim_number();

-- RLS Policies for insurance_claims
CREATE POLICY "Admins can manage all claims"
    ON public.insurance_claims FOR ALL
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Receptionists can manage claims"
    ON public.insurance_claims FOR ALL
    USING (has_role(auth.uid(), 'receptionist'))
    WITH CHECK (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Doctors can view claims for their patients"
    ON public.insurance_claims FOR SELECT
    USING (
        has_role(auth.uid(), 'doctor') AND 
        doctor_has_patient_relationship(get_doctor_id_for_user(auth.uid()), patient_id)
    );

CREATE POLICY "Patients can view own claims"
    ON public.insurance_claims FOR SELECT
    USING (patient_id = get_patient_id_for_user(auth.uid()));

-- RLS Policies for insurance_claim_items
CREATE POLICY "Admins can manage all claim items"
    ON public.insurance_claim_items FOR ALL
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Receptionists can manage claim items"
    ON public.insurance_claim_items FOR ALL
    USING (has_role(auth.uid(), 'receptionist'))
    WITH CHECK (has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Doctors can view claim items for their patients"
    ON public.insurance_claim_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.insurance_claims c
            WHERE c.id = insurance_claim_items.claim_id
            AND has_role(auth.uid(), 'doctor')
            AND doctor_has_patient_relationship(get_doctor_id_for_user(auth.uid()), c.patient_id)
        )
    );

CREATE POLICY "Patients can view own claim items"
    ON public.insurance_claim_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.insurance_claims c
            WHERE c.id = insurance_claim_items.claim_id
            AND c.patient_id = get_patient_id_for_user(auth.uid())
        )
    );

-- Create updated_at trigger
CREATE TRIGGER update_insurance_claims_updated_at
    BEFORE UPDATE ON public.insurance_claims
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_insurance_claims_patient ON public.insurance_claims(patient_id);
CREATE INDEX idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX idx_insurance_claims_submission_date ON public.insurance_claims(submission_date);
CREATE INDEX idx_insurance_claim_items_claim ON public.insurance_claim_items(claim_id);