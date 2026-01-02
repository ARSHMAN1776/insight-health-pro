-- =============================================
-- PHASE 2: Clinical Workflow Improvements
-- =============================================

-- 1. PRESCRIPTION ITEMS TABLE (Multi-drug prescriptions)
CREATE TABLE public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR NOT NULL,
    dosage VARCHAR,
    frequency VARCHAR,
    duration VARCHAR,
    quantity INTEGER,
    instructions TEXT,
    route VARCHAR DEFAULT 'oral', -- oral, IV, IM, topical, etc.
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRESCRIPTION TEMPLATES TABLE
CREATE TABLE public.prescription_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    template_name VARCHAR NOT NULL,
    description TEXT,
    is_global BOOLEAN DEFAULT false, -- global templates for all doctors
    diagnosis_category VARCHAR,
    medications JSONB NOT NULL DEFAULT '[]', -- array of medication objects
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DOCTOR REFERRALS TABLE
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    referring_doctor_id UUID NOT NULL REFERENCES public.doctors(id),
    receiving_doctor_id UUID REFERENCES public.doctors(id),
    receiving_department_id UUID REFERENCES public.departments(department_id),
    urgency VARCHAR NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
    reason TEXT NOT NULL,
    clinical_notes TEXT,
    diagnosis TEXT,
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
    appointment_id UUID REFERENCES public.appointments(id),
    response_notes TEXT,
    responded_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. DRUG INTERACTIONS TABLE
CREATE TABLE public.drug_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_a VARCHAR NOT NULL,
    drug_b VARCHAR NOT NULL,
    severity VARCHAR NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'contraindicated')),
    description TEXT NOT NULL,
    mechanism TEXT,
    management TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(drug_a, drug_b)
);

-- 5. DIAGNOSIS CODES (ICD-10) TABLE
CREATE TABLE public.diagnosis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR,
    subcategory VARCHAR,
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PROCEDURE CODES (CPT) TABLE
CREATE TABLE public.procedure_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR,
    base_price NUMERIC(10,2),
    modifier_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Add diagnosis_code to medical_records
ALTER TABLE public.medical_records 
ADD COLUMN IF NOT EXISTS diagnosis_code VARCHAR,
ADD COLUMN IF NOT EXISTS procedure_codes TEXT[];

-- =============================================
-- ENABLE RLS ON ALL NEW TABLES
-- =============================================

ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_codes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: PRESCRIPTION ITEMS
-- =============================================

CREATE POLICY "Admins can manage all prescription items"
ON public.prescription_items FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can manage prescription items for their prescriptions"
ON public.prescription_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.prescriptions p 
        WHERE p.id = prescription_items.prescription_id 
        AND p.doctor_id = public.get_doctor_id_for_user(auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.prescriptions p 
        WHERE p.id = prescription_items.prescription_id 
        AND p.doctor_id = public.get_doctor_id_for_user(auth.uid())
    )
);

CREATE POLICY "Pharmacists can view all prescription items"
ON public.prescription_items FOR SELECT
USING (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Patients can view their own prescription items"
ON public.prescription_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.prescriptions p 
        WHERE p.id = prescription_items.prescription_id 
        AND p.patient_id = public.get_patient_id_for_user(auth.uid())
    )
);

CREATE POLICY "Nurses can view prescription items"
ON public.prescription_items FOR SELECT
USING (public.has_role(auth.uid(), 'nurse'));

-- =============================================
-- RLS POLICIES: PRESCRIPTION TEMPLATES
-- =============================================

CREATE POLICY "Admins can manage all templates"
ON public.prescription_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can manage their own templates"
ON public.prescription_templates FOR ALL
USING (doctor_id = public.get_doctor_id_for_user(auth.uid()) OR is_global = true)
WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Doctors can view global templates"
ON public.prescription_templates FOR SELECT
USING (is_global = true OR doctor_id = public.get_doctor_id_for_user(auth.uid()));

-- =============================================
-- RLS POLICIES: REFERRALS
-- =============================================

CREATE POLICY "Admins can manage all referrals"
ON public.referrals FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Referring doctors can create and view their referrals"
ON public.referrals FOR ALL
USING (referring_doctor_id = public.get_doctor_id_for_user(auth.uid()))
WITH CHECK (referring_doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Receiving doctors can view and respond to referrals"
ON public.referrals FOR SELECT
USING (receiving_doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Receiving doctors can update referral status"
ON public.referrals FOR UPDATE
USING (receiving_doctor_id = public.get_doctor_id_for_user(auth.uid()))
WITH CHECK (receiving_doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Patients can view their own referrals"
ON public.referrals FOR SELECT
USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Nurses can view all referrals"
ON public.referrals FOR SELECT
USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Receptionists can view all referrals"
ON public.referrals FOR SELECT
USING (public.has_role(auth.uid(), 'receptionist'));

-- =============================================
-- RLS POLICIES: DRUG INTERACTIONS (Public Read)
-- =============================================

CREATE POLICY "Anyone can view drug interactions"
ON public.drug_interactions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage drug interactions"
ON public.drug_interactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES: DIAGNOSIS/PROCEDURE CODES (Public Read)
-- =============================================

CREATE POLICY "Anyone can view diagnosis codes"
ON public.diagnosis_codes FOR SELECT
USING (true);

CREATE POLICY "Admins can manage diagnosis codes"
ON public.diagnosis_codes FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view procedure codes"
ON public.procedure_codes FOR SELECT
USING (true);

CREATE POLICY "Admins can manage procedure codes"
ON public.procedure_codes FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_prescription_items_updated_at
BEFORE UPDATE ON public.prescription_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescription_templates_updated_at
BEFORE UPDATE ON public.prescription_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_prescription_items_prescription ON public.prescription_items(prescription_id);
CREATE INDEX idx_referrals_patient ON public.referrals(patient_id);
CREATE INDEX idx_referrals_referring_doctor ON public.referrals(referring_doctor_id);
CREATE INDEX idx_referrals_receiving_doctor ON public.referrals(receiving_doctor_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_diagnosis_codes_code ON public.diagnosis_codes(code);
CREATE INDEX idx_procedure_codes_code ON public.procedure_codes(code);
CREATE INDEX idx_drug_interactions_drugs ON public.drug_interactions(drug_a, drug_b);

-- =============================================
-- SEED COMMON DRUG INTERACTIONS
-- =============================================

INSERT INTO public.drug_interactions (drug_a, drug_b, severity, description, mechanism, management) VALUES
('Warfarin', 'Aspirin', 'major', 'Increased risk of bleeding', 'Both drugs affect clotting mechanisms', 'Avoid combination or monitor INR closely'),
('Warfarin', 'Ibuprofen', 'major', 'Increased risk of GI bleeding', 'NSAIDs inhibit platelet function and can cause GI ulcers', 'Use acetaminophen instead if possible'),
('Metformin', 'Alcohol', 'moderate', 'Increased risk of lactic acidosis', 'Alcohol potentiates metformin effect on lactate metabolism', 'Limit alcohol consumption'),
('Lisinopril', 'Potassium', 'moderate', 'Risk of hyperkalemia', 'ACE inhibitors reduce potassium excretion', 'Monitor potassium levels regularly'),
('Simvastatin', 'Grapefruit', 'moderate', 'Increased statin levels', 'Grapefruit inhibits CYP3A4 metabolism', 'Avoid grapefruit consumption'),
('Ciprofloxacin', 'Antacids', 'moderate', 'Reduced antibiotic absorption', 'Antacids bind to fluoroquinolones', 'Take ciprofloxacin 2 hours before antacids'),
('Fluoxetine', 'Tramadol', 'major', 'Risk of serotonin syndrome', 'Both drugs increase serotonin levels', 'Avoid combination or use with extreme caution'),
('Methotrexate', 'NSAIDs', 'major', 'Increased methotrexate toxicity', 'NSAIDs reduce renal clearance of methotrexate', 'Monitor for bone marrow suppression'),
('Digoxin', 'Amiodarone', 'major', 'Increased digoxin toxicity', 'Amiodarone inhibits P-glycoprotein', 'Reduce digoxin dose by 50%'),
('Clopidogrel', 'Omeprazole', 'moderate', 'Reduced antiplatelet effect', 'Omeprazole inhibits CYP2C19 activation', 'Use pantoprazole instead'),
('Amlodipine', 'Simvastatin', 'moderate', 'Increased risk of myopathy', 'Amlodipine inhibits CYP3A4', 'Limit simvastatin to 20mg daily'),
('Lithium', 'Ibuprofen', 'major', 'Lithium toxicity', 'NSAIDs reduce lithium clearance', 'Avoid or monitor lithium levels closely'),
('Sildenafil', 'Nitrates', 'contraindicated', 'Severe hypotension', 'Both cause vasodilation', 'Never use together - life threatening'),
('MAOIs', 'SSRIs', 'contraindicated', 'Serotonin syndrome', 'Excessive serotonin accumulation', 'Wait 14 days between medications'),
('Metronidazole', 'Alcohol', 'major', 'Disulfiram-like reaction', 'Metronidazole inhibits alcohol metabolism', 'Avoid alcohol during and 3 days after treatment');

-- =============================================
-- SEED COMMON ICD-10 CODES
-- =============================================

INSERT INTO public.diagnosis_codes (code, description, category, subcategory, is_billable) VALUES
-- Hypertension
('I10', 'Essential (primary) hypertension', 'Circulatory', 'Hypertensive diseases', true),
('I11.0', 'Hypertensive heart disease with heart failure', 'Circulatory', 'Hypertensive diseases', true),
('I11.9', 'Hypertensive heart disease without heart failure', 'Circulatory', 'Hypertensive diseases', true),
-- Diabetes
('E11.9', 'Type 2 diabetes mellitus without complications', 'Endocrine', 'Diabetes mellitus', true),
('E11.65', 'Type 2 diabetes mellitus with hyperglycemia', 'Endocrine', 'Diabetes mellitus', true),
('E10.9', 'Type 1 diabetes mellitus without complications', 'Endocrine', 'Diabetes mellitus', true),
-- Respiratory
('J06.9', 'Acute upper respiratory infection, unspecified', 'Respiratory', 'Acute respiratory infections', true),
('J18.9', 'Pneumonia, unspecified organism', 'Respiratory', 'Pneumonia', true),
('J45.909', 'Unspecified asthma, uncomplicated', 'Respiratory', 'Chronic lower respiratory', true),
('J44.9', 'Chronic obstructive pulmonary disease, unspecified', 'Respiratory', 'Chronic lower respiratory', true),
-- Cardiac
('I25.10', 'Atherosclerotic heart disease of native coronary artery', 'Circulatory', 'Ischemic heart diseases', true),
('I50.9', 'Heart failure, unspecified', 'Circulatory', 'Heart failure', true),
('I48.91', 'Unspecified atrial fibrillation', 'Circulatory', 'Cardiac arrhythmias', true),
-- GI
('K21.0', 'Gastro-esophageal reflux disease with esophagitis', 'Digestive', 'Esophagus disorders', true),
('K29.70', 'Gastritis, unspecified, without bleeding', 'Digestive', 'Gastritis', true),
-- Musculoskeletal
('M54.5', 'Low back pain', 'Musculoskeletal', 'Dorsopathies', true),
('M25.50', 'Pain in unspecified joint', 'Musculoskeletal', 'Joint disorders', true),
-- Mental Health
('F32.9', 'Major depressive disorder, single episode, unspecified', 'Mental', 'Mood disorders', true),
('F41.1', 'Generalized anxiety disorder', 'Mental', 'Anxiety disorders', true),
-- General
('R50.9', 'Fever, unspecified', 'Symptoms', 'General symptoms', true),
('R51', 'Headache', 'Symptoms', 'General symptoms', true),
('Z00.00', 'Encounter for general adult medical examination', 'Factors', 'Health examination', true);

-- =============================================
-- SEED COMMON CPT CODES
-- =============================================

INSERT INTO public.procedure_codes (code, description, category, base_price, modifier_allowed) VALUES
-- Office Visits
('99201', 'Office visit, new patient, minimal', 'E/M', 50.00, true),
('99202', 'Office visit, new patient, low', 'E/M', 75.00, true),
('99203', 'Office visit, new patient, moderate', 'E/M', 110.00, true),
('99204', 'Office visit, new patient, moderate-high', 'E/M', 165.00, true),
('99205', 'Office visit, new patient, high', 'E/M', 210.00, true),
('99211', 'Office visit, established patient, minimal', 'E/M', 25.00, true),
('99212', 'Office visit, established patient, low', 'E/M', 50.00, true),
('99213', 'Office visit, established patient, low-moderate', 'E/M', 80.00, true),
('99214', 'Office visit, established patient, moderate', 'E/M', 120.00, true),
('99215', 'Office visit, established patient, high', 'E/M', 175.00, true),
-- Lab
('36415', 'Venipuncture', 'Laboratory', 15.00, false),
('81001', 'Urinalysis, automated, microscopy', 'Laboratory', 12.00, false),
('85025', 'Complete blood count (CBC) with differential', 'Laboratory', 25.00, false),
('80053', 'Comprehensive metabolic panel', 'Laboratory', 35.00, false),
('80061', 'Lipid panel', 'Laboratory', 40.00, false),
('83036', 'Hemoglobin A1c', 'Laboratory', 30.00, false),
-- Imaging
('71046', 'Chest X-ray, 2 views', 'Radiology', 85.00, true),
('73030', 'Shoulder X-ray, complete', 'Radiology', 75.00, true),
('73560', 'Knee X-ray, complete', 'Radiology', 65.00, true),
-- Procedures
('99000', 'Specimen handling', 'Miscellaneous', 10.00, false),
('90471', 'Immunization administration', 'Immunization', 25.00, true),
('90715', 'Tdap vaccine', 'Immunization', 55.00, false),
('90732', 'Pneumococcal vaccine', 'Immunization', 120.00, false),
('96372', 'Therapeutic injection, IM/SQ', 'Injection', 30.00, true);
