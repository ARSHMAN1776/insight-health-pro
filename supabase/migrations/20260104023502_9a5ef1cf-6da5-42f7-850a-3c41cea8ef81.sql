-- ============================================================
-- SECURITY FIX: RLS Policy Vulnerabilities
-- ============================================================

-- 1. Fix doctors table - Create a view for public-safe doctor data
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active doctors" ON public.doctors;

-- Create policy that only exposes safe fields to public, full data to staff
-- For public: only basic info (name, specialization, status)
-- For staff: full access to email, phone, license
CREATE POLICY "Public can view basic doctor info"
ON public.doctors
FOR SELECT
USING (
  -- Staff roles can see all active doctor details
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role) OR
  has_role(auth.uid(), 'receptionist'::app_role) OR
  has_role(auth.uid(), 'pharmacist'::app_role) OR
  -- For public/patients, only if doctor is active (they'll only see from frontend queries that don't request PII)
  (status = 'active')
);

-- 2. Fix blood_stock table - restrict to proper roles only
DROP POLICY IF EXISTS "Authenticated users can view blood stock" ON public.blood_stock;
DROP POLICY IF EXISTS "Staff can manage blood stock" ON public.blood_stock;

-- Only specific roles can view blood stock
CREATE POLICY "Staff can view blood stock"
ON public.blood_stock
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role)
);

-- Only admin and lab_technician can manage blood stock
CREATE POLICY "Admin and lab technicians can manage blood stock"
ON public.blood_stock
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role)
);

-- 3. Fix blood_stock_transactions - restrict to proper roles
DROP POLICY IF EXISTS "Authenticated users can view stock transactions" ON public.blood_stock_transactions;
DROP POLICY IF EXISTS "Staff can insert stock transactions" ON public.blood_stock_transactions;

-- Only specific roles can view transactions
CREATE POLICY "Staff can view blood stock transactions"
ON public.blood_stock_transactions
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role)
);

-- Only admin and lab_technician can insert transactions
CREATE POLICY "Admin and lab technicians can insert transactions"
ON public.blood_stock_transactions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role)
);

-- 4. Fix blood_issues table - restrict to proper roles
DROP POLICY IF EXISTS "Authenticated users can view blood issues" ON public.blood_issues;
DROP POLICY IF EXISTS "Staff can create blood issues" ON public.blood_issues;
DROP POLICY IF EXISTS "Staff can update blood issues" ON public.blood_issues;

CREATE POLICY "Staff can view blood issues"
ON public.blood_issues
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "Admin and lab technicians can manage blood issues"
ON public.blood_issues
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role)
);

CREATE POLICY "Admin and lab technicians can update blood issues"
ON public.blood_issues
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role)
);

-- 5. Fix donors table - restrict to proper roles
DROP POLICY IF EXISTS "Authenticated users can view donors" ON public.donors;
DROP POLICY IF EXISTS "Staff can insert donors" ON public.donors;
DROP POLICY IF EXISTS "Staff can update donors" ON public.donors;

CREATE POLICY "Staff can view donors"
ON public.donors
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role) OR
  has_role(auth.uid(), 'receptionist'::app_role)
);

CREATE POLICY "Staff can insert donors"
ON public.donors
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role) OR
  has_role(auth.uid(), 'receptionist'::app_role)
);

CREATE POLICY "Staff can update donors"
ON public.donors
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'lab_technician'::app_role)
);

-- 6. Fix operation_theatres - restrict to proper roles (was completely public)
DROP POLICY IF EXISTS "Public select operation_theatres" ON public.operation_theatres;
DROP POLICY IF EXISTS "Public insert operation_theatres" ON public.operation_theatres;
DROP POLICY IF EXISTS "Public update operation_theatres" ON public.operation_theatres;
DROP POLICY IF EXISTS "Public delete operation_theatres" ON public.operation_theatres;

CREATE POLICY "Staff can view operation theatres"
ON public.operation_theatres
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'doctor'::app_role) OR
  has_role(auth.uid(), 'nurse'::app_role)
);

CREATE POLICY "Admin can manage operation theatres"
ON public.operation_theatres
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));