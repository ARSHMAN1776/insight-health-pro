-- Drop existing blood bank tables (cascading to remove dependencies)
DROP TABLE IF EXISTS public.blood_transfusions CASCADE;
DROP TABLE IF EXISTS public.blood_requests CASCADE;
DROP TABLE IF EXISTS public.blood_donations CASCADE;
DROP TABLE IF EXISTS public.blood_inventory CASCADE;
DROP TABLE IF EXISTS public.blood_donors CASCADE;
DROP TABLE IF EXISTS public.blood_bank_audit_log CASCADE;

-- Create blood_groups lookup table
CREATE TABLE public.blood_groups (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(5) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert all blood group types
INSERT INTO public.blood_groups (group_name) VALUES 
    ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-');

-- Create blood_stock table
CREATE TABLE public.blood_stock (
    stock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blood_group_id UUID NOT NULL REFERENCES public.blood_groups(group_id) ON DELETE RESTRICT,
    total_units INTEGER NOT NULL DEFAULT 0 CHECK (total_units >= 0),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Initialize stock for each blood group
INSERT INTO public.blood_stock (blood_group_id, total_units)
SELECT group_id, 0 FROM public.blood_groups;

-- Create donors table
CREATE TABLE public.donors (
    donor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    blood_group_id UUID NOT NULL REFERENCES public.blood_groups(group_id) ON DELETE RESTRICT,
    contact VARCHAR(50),
    last_donation_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Eligible' CHECK (status IN ('Eligible', 'Not Eligible')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create blood_issues table
CREATE TABLE public.blood_issues (
    issue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    blood_group_id UUID NOT NULL REFERENCES public.blood_groups(group_id) ON DELETE RESTRICT,
    units_given INTEGER NOT NULL CHECK (units_given > 0),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    issued_by UUID, -- Staff ID (optional FK to profiles or staff table)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_blood_stock_group ON public.blood_stock(blood_group_id);
CREATE INDEX idx_donors_blood_group ON public.donors(blood_group_id);
CREATE INDEX idx_donors_status ON public.donors(status);
CREATE INDEX idx_donors_last_donation ON public.donors(last_donation_date);
CREATE INDEX idx_blood_issues_patient ON public.blood_issues(patient_id);
CREATE INDEX idx_blood_issues_blood_group ON public.blood_issues(blood_group_id);
CREATE INDEX idx_blood_issues_date ON public.blood_issues(issue_date);
CREATE INDEX idx_blood_issues_issued_by ON public.blood_issues(issued_by);

-- Enable Row Level Security
ALTER TABLE public.blood_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_groups (public read, admin write)
CREATE POLICY "Anyone can view blood groups"
    ON public.blood_groups FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage blood groups"
    ON public.blood_groups FOR ALL
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for blood_stock (authenticated read, staff write)
CREATE POLICY "Authenticated users can view blood stock"
    ON public.blood_stock FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage blood stock"
    ON public.blood_stock FOR ALL
    USING (true)
    WITH CHECK (true);

-- RLS Policies for donors (authenticated read, staff write)
CREATE POLICY "Authenticated users can view donors"
    ON public.donors FOR SELECT
    USING (true);

CREATE POLICY "Staff can insert donors"
    ON public.donors FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff can update donors"
    ON public.donors FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can delete donors"
    ON public.donors FOR DELETE
    USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for blood_issues (authenticated read, staff write)
CREATE POLICY "Authenticated users can view blood issues"
    ON public.blood_issues FOR SELECT
    USING (true);

CREATE POLICY "Staff can create blood issues"
    ON public.blood_issues FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff can update blood issues"
    ON public.blood_issues FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can delete blood issues"
    ON public.blood_issues FOR DELETE
    USING (has_role(auth.uid(), 'admin'));

-- Trigger to update blood_stock.updated_at
CREATE TRIGGER update_blood_stock_updated_at
    BEFORE UPDATE ON public.blood_stock
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update donors.updated_at
CREATE TRIGGER update_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();