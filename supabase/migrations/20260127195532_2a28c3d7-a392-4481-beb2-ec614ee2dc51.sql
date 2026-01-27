-- Phase 1: Fix Organizations INSERT RLS Policy
-- Drop existing policy if it exists and recreate with proper check
DROP POLICY IF EXISTS "Users can create their own organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

CREATE POLICY "Authenticated users can create organizations"
ON organizations FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Phase 2: Create Module Pricing Table for Add-on Modules
CREATE TABLE IF NOT EXISTS public.module_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_plan_tier INTEGER DEFAULT 1,
  is_enterprise_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on module_pricing (public read, admin write)
ALTER TABLE public.module_pricing ENABLE ROW LEVEL SECURITY;

-- Anyone can read module pricing (it's public info)
CREATE POLICY "Module pricing is publicly readable"
ON public.module_pricing FOR SELECT
USING (true);

-- Insert pricing for all modules
INSERT INTO public.module_pricing (module_key, name, description, price_monthly, price_yearly, min_plan_tier, is_enterprise_only)
VALUES
  -- Core modules (included in all plans, tier 1)
  ('patients', 'Patient Management', 'Patient records and registration', 0, 0, 1, false),
  ('appointments', 'Appointments', 'Scheduling and calendar', 0, 0, 1, false),
  ('billing', 'Billing & Payments', 'Invoices and payment tracking', 0, 0, 1, false),
  ('departments', 'Departments', 'Department management', 0, 0, 1, false),
  ('prescriptions', 'Prescriptions', 'E-prescribing and refills', 0, 0, 1, false),
  ('messages', 'Patient Messages', 'Patient-provider messaging', 0, 0, 1, false),
  
  -- Professional tier modules (tier 2)
  ('lab_tests', 'Lab & Diagnostics', 'Test orders and results management', 99, 990, 2, false),
  ('pharmacy', 'Pharmacy', 'Medication inventory and dispensing', 99, 990, 2, false),
  ('inventory', 'Inventory Management', 'Stock and supplies tracking', 79, 790, 2, false),
  ('insurance', 'Insurance Claims', 'Process and track insurance claims', 149, 1490, 2, false),
  ('referrals', 'Referral Management', 'Patient referral workflows', 49, 490, 2, false),
  ('reports', 'Advanced Reports', 'Analytics and custom reporting', 79, 790, 2, false),
  ('rooms', 'Rooms & Beds', 'Room and bed assignments', 49, 490, 2, false),
  ('vitals', 'Vitals Tracking', 'Patient vital signs monitoring', 49, 490, 2, false),
  ('queue', 'Queue Management', 'Patient queue and token system', 49, 490, 2, false),
  
  -- Enterprise tier modules (tier 3)
  ('blood_bank', 'Blood Bank', 'Blood inventory and transfusion', 199, 1990, 3, true),
  ('operation_dept', 'Operation Theatre', 'Surgery scheduling and management', 199, 1990, 3, true),
  ('audit_logs', 'Audit Logs', 'PHI access audit trail', 99, 990, 3, false),
  ('shift_handover', 'Shift Handover', 'Nursing shift handover notes', 49, 490, 3, true)
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  min_plan_tier = EXCLUDED.min_plan_tier,
  is_enterprise_only = EXCLUDED.is_enterprise_only;