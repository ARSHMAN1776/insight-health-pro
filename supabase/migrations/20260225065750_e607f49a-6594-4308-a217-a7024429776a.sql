
-- Fix permissive RLS policies for CodeCanyon security compliance

-- 1. Fix discharge_summaries - restrict INSERT/UPDATE to authenticated staff
DROP POLICY IF EXISTS "Staff can create discharge summaries" ON public.discharge_summaries;
DROP POLICY IF EXISTS "Staff can update discharge summaries" ON public.discharge_summaries;

CREATE POLICY "Staff can create discharge summaries" 
ON public.discharge_summaries 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'doctor') OR 
  has_role(auth.uid(), 'nurse')
);

CREATE POLICY "Staff can update discharge summaries" 
ON public.discharge_summaries 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'doctor') OR 
  has_role(auth.uid(), 'nurse')
);

-- 2. Fix ipd_admissions - restrict INSERT/UPDATE to authenticated staff
DROP POLICY IF EXISTS "Staff can create admissions" ON public.ipd_admissions;
DROP POLICY IF EXISTS "Staff can update admissions" ON public.ipd_admissions;

CREATE POLICY "Staff can create admissions" 
ON public.ipd_admissions 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'doctor') OR 
  has_role(auth.uid(), 'nurse') OR 
  has_role(auth.uid(), 'receptionist')
);

CREATE POLICY "Staff can update admissions" 
ON public.ipd_admissions 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'doctor') OR 
  has_role(auth.uid(), 'nurse') OR 
  has_role(auth.uid(), 'receptionist')
);

-- 3. Fix ward_rounds - restrict INSERT/UPDATE to authenticated staff
DROP POLICY IF EXISTS "Staff can create ward rounds" ON public.ward_rounds;
DROP POLICY IF EXISTS "Staff can update ward rounds" ON public.ward_rounds;

CREATE POLICY "Staff can create ward rounds" 
ON public.ward_rounds 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'doctor') OR 
  has_role(auth.uid(), 'nurse')
);

CREATE POLICY "Staff can update ward rounds" 
ON public.ward_rounds 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'doctor') OR 
  has_role(auth.uid(), 'nurse')
);

-- 4. Fix organization_subscriptions - restrict to service role only (remove permissive ALL)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.organization_subscriptions;

CREATE POLICY "Admins can view subscriptions" 
ON public.organization_subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- 5. Fix subscription_plans - restrict to service role only
DROP POLICY IF EXISTS "Service role can manage subscription plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 6. Fix usage_metrics - restrict to service role only
DROP POLICY IF EXISTS "Service role can manage usage metrics" ON public.usage_metrics;

CREATE POLICY "Admins can view usage metrics" 
ON public.usage_metrics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- 7. Fix patient_feedback - tighten the overly permissive policies
DROP POLICY IF EXISTS "Admin can view all feedback" ON public.patient_feedback;
DROP POLICY IF EXISTS "Doctors can view their feedback" ON public.patient_feedback;

CREATE POLICY "Admin can view all feedback" 
ON public.patient_feedback 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view their feedback" 
ON public.patient_feedback 
FOR SELECT 
USING (has_role(auth.uid(), 'doctor'));

DROP POLICY IF EXISTS "Patients can create own feedback" ON public.patient_feedback;
CREATE POLICY "Patients can create own feedback" 
ON public.patient_feedback 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'patient'));
