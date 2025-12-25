-- =============================================
-- BLOOD BANK MODULE - DATABASE SCHEMA
-- =============================================

-- Blood Donors Table
CREATE TABLE public.blood_donors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    weight_kg DECIMAL(5,2),
    last_donation_date DATE,
    next_eligible_date DATE,
    medical_conditions TEXT,
    medications TEXT,
    is_eligible BOOLEAN DEFAULT true,
    eligibility_notes TEXT,
    total_donations INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deferred', 'permanently_deferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blood Donations Table (Donation Records)
CREATE TABLE public.blood_donations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID NOT NULL REFERENCES public.blood_donors(id) ON DELETE RESTRICT,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    donation_time TIME NOT NULL,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    volume_ml INTEGER NOT NULL DEFAULT 450 CHECK (volume_ml > 0),
    hemoglobin_level DECIMAL(4,1),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    pulse_rate INTEGER,
    temperature DECIMAL(4,1),
    bag_number VARCHAR(50) UNIQUE NOT NULL,
    collection_site VARCHAR(100),
    collected_by VARCHAR(100) NOT NULL,
    screening_status VARCHAR(30) DEFAULT 'pending' CHECK (screening_status IN ('pending', 'passed', 'failed', 'quarantine')),
    screening_notes TEXT,
    adverse_reactions TEXT,
    status VARCHAR(20) DEFAULT 'collected' CHECK (status IN ('collected', 'processing', 'tested', 'available', 'discarded', 'expired', 'used')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blood Inventory Table (Available Blood Units)
CREATE TABLE public.blood_inventory (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES public.blood_donations(id) ON DELETE RESTRICT,
    bag_number VARCHAR(50) UNIQUE NOT NULL,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    component_type VARCHAR(50) NOT NULL DEFAULT 'whole_blood' CHECK (component_type IN ('whole_blood', 'packed_rbc', 'platelets', 'fresh_frozen_plasma', 'cryoprecipitate')),
    volume_ml INTEGER NOT NULL CHECK (volume_ml > 0),
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    storage_location VARCHAR(100),
    storage_temperature VARCHAR(20),
    testing_status VARCHAR(30) DEFAULT 'pending' CHECK (testing_status IN ('pending', 'passed', 'failed')),
    hiv_status VARCHAR(20) DEFAULT 'pending' CHECK (hiv_status IN ('pending', 'negative', 'positive')),
    hbv_status VARCHAR(20) DEFAULT 'pending' CHECK (hbv_status IN ('pending', 'negative', 'positive')),
    hcv_status VARCHAR(20) DEFAULT 'pending' CHECK (hcv_status IN ('pending', 'negative', 'positive')),
    syphilis_status VARCHAR(20) DEFAULT 'pending' CHECK (syphilis_status IN ('pending', 'negative', 'positive')),
    malaria_status VARCHAR(20) DEFAULT 'pending' CHECK (malaria_status IN ('pending', 'negative', 'positive')),
    crossmatch_compatible BOOLEAN,
    status VARCHAR(20) DEFAULT 'quarantine' CHECK (status IN ('quarantine', 'available', 'reserved', 'issued', 'used', 'expired', 'discarded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blood Requests Table
CREATE TABLE public.blood_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    component_type VARCHAR(50) NOT NULL DEFAULT 'whole_blood' CHECK (component_type IN ('whole_blood', 'packed_rbc', 'platelets', 'fresh_frozen_plasma', 'cryoprecipitate')),
    units_requested INTEGER NOT NULL DEFAULT 1 CHECK (units_requested > 0),
    units_issued INTEGER DEFAULT 0,
    priority VARCHAR(20) NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency', 'critical')),
    indication TEXT NOT NULL,
    clinical_notes TEXT,
    required_date DATE NOT NULL,
    required_time TIME,
    request_status VARCHAR(30) DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'partially_fulfilled', 'fulfilled', 'cancelled', 'rejected')),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blood Transfusions Table (Audit Trail)
CREATE TABLE public.blood_transfusions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.blood_requests(id) ON DELETE RESTRICT,
    inventory_id UUID NOT NULL REFERENCES public.blood_inventory(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    bag_number VARCHAR(50) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    volume_ml INTEGER NOT NULL,
    transfusion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transfusion_start_time TIME NOT NULL,
    transfusion_end_time TIME,
    administered_by VARCHAR(100) NOT NULL,
    verified_by VARCHAR(100) NOT NULL,
    pre_transfusion_vitals JSONB,
    post_transfusion_vitals JSONB,
    compatibility_verified BOOLEAN NOT NULL DEFAULT true,
    patient_consent_obtained BOOLEAN NOT NULL DEFAULT true,
    adverse_reaction BOOLEAN DEFAULT false,
    reaction_type VARCHAR(100),
    reaction_severity VARCHAR(20) CHECK (reaction_severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
    reaction_description TEXT,
    reaction_management TEXT,
    outcome VARCHAR(30) DEFAULT 'successful' CHECK (outcome IN ('successful', 'completed_with_reaction', 'stopped_early', 'failed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blood Bank Audit Log
CREATE TABLE public.blood_bank_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    performed_by VARCHAR(100),
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_transfusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_bank_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_donors
CREATE POLICY "Authenticated users can view blood donors"
ON public.blood_donors FOR SELECT
USING (true);

CREATE POLICY "Admins can manage blood donors"
ON public.blood_donors FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can insert blood donors"
ON public.blood_donors FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can update blood donors"
ON public.blood_donors FOR UPDATE
USING (true)
WITH CHECK (true);

-- RLS Policies for blood_donations
CREATE POLICY "Authenticated users can view blood donations"
ON public.blood_donations FOR SELECT
USING (true);

CREATE POLICY "Staff can manage blood donations"
ON public.blood_donations FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for blood_inventory
CREATE POLICY "Authenticated users can view blood inventory"
ON public.blood_inventory FOR SELECT
USING (true);

CREATE POLICY "Staff can manage blood inventory"
ON public.blood_inventory FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for blood_requests
CREATE POLICY "Authenticated users can view blood requests"
ON public.blood_requests FOR SELECT
USING (true);

CREATE POLICY "Doctors can create blood requests"
ON public.blood_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can update blood requests"
ON public.blood_requests FOR UPDATE
USING (true)
WITH CHECK (true);

-- RLS Policies for blood_transfusions
CREATE POLICY "Authenticated users can view blood transfusions"
ON public.blood_transfusions FOR SELECT
USING (true);

CREATE POLICY "Staff can manage blood transfusions"
ON public.blood_transfusions FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for audit log
CREATE POLICY "Admins can view audit log"
ON public.blood_bank_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit log"
ON public.blood_bank_audit_log FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_blood_donors_blood_type ON public.blood_donors(blood_type);
CREATE INDEX idx_blood_donors_status ON public.blood_donors(status);
CREATE INDEX idx_blood_donations_donor_id ON public.blood_donations(donor_id);
CREATE INDEX idx_blood_donations_date ON public.blood_donations(donation_date);
CREATE INDEX idx_blood_inventory_blood_type ON public.blood_inventory(blood_type);
CREATE INDEX idx_blood_inventory_status ON public.blood_inventory(status);
CREATE INDEX idx_blood_inventory_expiry ON public.blood_inventory(expiry_date);
CREATE INDEX idx_blood_requests_patient_id ON public.blood_requests(patient_id);
CREATE INDEX idx_blood_requests_status ON public.blood_requests(request_status);
CREATE INDEX idx_blood_transfusions_patient_id ON public.blood_transfusions(patient_id);
CREATE INDEX idx_blood_transfusions_date ON public.blood_transfusions(transfusion_date);
CREATE INDEX idx_audit_log_record ON public.blood_bank_audit_log(table_name, record_id);

-- Create trigger for updated_at
CREATE TRIGGER update_blood_donors_updated_at
    BEFORE UPDATE ON public.blood_donors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_donations_updated_at
    BEFORE UPDATE ON public.blood_donations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_inventory_updated_at
    BEFORE UPDATE ON public.blood_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
    BEFORE UPDATE ON public.blood_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();