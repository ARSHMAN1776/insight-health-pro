
-- 1. Plan tier enum
DO $$ BEGIN
  CREATE TYPE public.app_plan AS ENUM ('basic','pro','premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Add plan column to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan public.app_plan NOT NULL DEFAULT 'premium';

-- 3. Plan -> modules catalog (which modules are included in each plan)
CREATE TABLE IF NOT EXISTS public.plan_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan public.app_plan NOT NULL,
  module_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan, module_key)
);

GRANT SELECT ON public.plan_modules TO anon, authenticated;
GRANT ALL ON public.plan_modules TO service_role;

ALTER TABLE public.plan_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan modules are public-readable"
  ON public.plan_modules FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify plan modules"
  ON public.plan_modules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Seed the plan/module matrix
INSERT INTO public.plan_modules (plan, module_key) VALUES
  -- BASIC: core clinic essentials
  ('basic','patients'),('basic','appointments'),('basic','prescriptions'),
  ('basic','billing'),('basic','queue'),('basic','lab'),('basic','medical_records'),
  -- PRO: basic + larger ops
  ('pro','patients'),('pro','appointments'),('pro','prescriptions'),
  ('pro','billing'),('pro','queue'),('pro','lab'),('pro','medical_records'),
  ('pro','ipd'),('pro','pharmacy'),('pro','blood_bank'),
  ('pro','patient_portal'),('pro','insurance'),('pro','multi_language'),
  ('pro','staff_scheduling'),('pro','referrals'),
  -- PREMIUM: everything
  ('premium','patients'),('premium','appointments'),('premium','prescriptions'),
  ('premium','billing'),('premium','queue'),('premium','lab'),('premium','medical_records'),
  ('premium','ipd'),('premium','pharmacy'),('premium','blood_bank'),
  ('premium','patient_portal'),('premium','insurance'),('premium','multi_language'),
  ('premium','staff_scheduling'),('premium','referrals'),
  ('premium','ot'),('premium','ai_copilot'),('premium','ai_chatbot'),
  ('premium','ai_diagnosis'),('premium','smart_scheduling'),
  ('premium','fhir_export'),('premium','advanced_reports'),
  ('premium','custom_branding'),('premium','phi_audit_dashboard')
ON CONFLICT (plan, module_key) DO NOTHING;

-- 5. Bootstrap the Default Organization (only if none exists)
DO $$
DECLARE
  _default_org_id uuid;
  _first_admin_id uuid;
BEGIN
  -- Pick a first admin user (any admin) to be created_by
  SELECT ur.user_id INTO _first_admin_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
  ORDER BY ur.user_id
  LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.organizations) THEN
    INSERT INTO public.organizations (
      name, slug, email, status, plan, timezone, currency, locale,
      max_staff, max_patients, max_storage_gb, created_by
    ) VALUES (
      'Default Organization',
      'default',
      COALESCE((SELECT email FROM auth.users WHERE id = _first_admin_id), 'admin@example.com'),
      'active',
      'premium',
      'UTC',
      'USD',
      'en',
      999, 999999, 100,
      _first_admin_id
    )
    RETURNING id INTO _default_org_id;
  ELSE
    SELECT id INTO _default_org_id FROM public.organizations ORDER BY created_at LIMIT 1;
  END IF;

  -- Backfill all existing users as members of default org
  INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
  SELECT
    _default_org_id,
    u.id,
    CASE
      WHEN public.has_role(u.id, 'admin') THEN 'owner'
      ELSE 'member'
    END,
    'active',
    now()
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.organization_members om WHERE om.user_id = u.id
  );

  -- Enable all Premium plan modules for default org
  INSERT INTO public.organization_modules (organization_id, module_key, is_enabled, enabled_at)
  SELECT _default_org_id, pm.module_key, true, now()
  FROM public.plan_modules pm
  WHERE pm.plan = 'premium'
  ON CONFLICT (organization_id, module_key) DO NOTHING;
END $$;

-- 6. Update handle_new_user trigger to attach new users to the default org
--    (Temporary single-tenant behavior; will be replaced by org-creation flow in Phase 1 step 3.)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_patient_id uuid;
  staff_user record;
  user_role text;
  default_org_id uuid;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');

  -- Find the default org (first org by created_at) for now
  SELECT id INTO default_org_id FROM public.organizations ORDER BY created_at LIMIT 1;

  INSERT INTO public.profiles (id, first_name, last_name, phone, department, specialization, license_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name',''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',''),
    COALESCE(NEW.raw_user_meta_data->>'phone',NULL),
    COALESCE(NEW.raw_user_meta_data->>'department',NULL),
    COALESCE(NEW.raw_user_meta_data->>'specialization',NULL),
    COALESCE(NEW.raw_user_meta_data->>'license_number',NULL)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role);

  -- Attach to default org as member (or owner if admin)
  IF default_org_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
    VALUES (
      default_org_id,
      NEW.id,
      CASE WHEN user_role = 'admin' THEN 'owner' ELSE 'member' END,
      'active',
      now()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF user_role = 'patient' THEN
    INSERT INTO public.patients (first_name,last_name,email,phone,date_of_birth,gender,status,user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name',''),
      COALESCE(NEW.raw_user_meta_data->>'last_name',''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone',NULL),
      COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, CURRENT_DATE),
      COALESCE(NEW.raw_user_meta_data->>'gender','Other'),
      'pending_verification',
      NEW.id
    ) RETURNING id INTO new_patient_id;

    INSERT INTO public.patient_registration_queue (patient_id, user_id, status)
    VALUES (new_patient_id, NEW.id, 'pending');

    FOR staff_user IN
      SELECT ur.user_id FROM public.user_roles ur
      WHERE ur.role IN ('admin','receptionist')
    LOOP
      INSERT INTO public.notifications (user_id,title,message,type,priority,action_url,metadata)
      VALUES (
        staff_user.user_id,
        'New Patient Registration',
        'New patient ' || COALESCE(NEW.raw_user_meta_data->>'first_name','') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name','') || ' has registered and requires verification.',
        'patient_registration','high','/patients',
        jsonb_build_object(
          'patient_id', new_patient_id,
          'patient_name', COALESCE(NEW.raw_user_meta_data->>'first_name','') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name',''),
          'patient_email', NEW.email,
          'registration_time', now()
        )
      );
    END LOOP;

  ELSIF user_role = 'doctor' THEN
    INSERT INTO public.doctors (first_name,last_name,email,phone,specialization,license_number,department,status,user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name',''),
      COALESCE(NEW.raw_user_meta_data->>'last_name',''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone',NULL),
      COALESCE(NEW.raw_user_meta_data->>'specialization','General'),
      COALESCE(NEW.raw_user_meta_data->>'license_number','PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'department',NULL),
      'active',
      NEW.id
    );

  ELSIF user_role = 'nurse' THEN
    INSERT INTO public.nurses (first_name,last_name,email,phone,specialization,license_number,department,status)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name',''),
      COALESCE(NEW.raw_user_meta_data->>'last_name',''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone',NULL),
      COALESCE(NEW.raw_user_meta_data->>'specialization',NULL),
      COALESCE(NEW.raw_user_meta_data->>'license_number','PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'department',NULL),
      'active'
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 7. Helper functions
CREATE OR REPLACE FUNCTION public.get_user_plan()
RETURNS public.app_plan
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.plan
  FROM public.organizations o
  JOIN public.organization_members om ON om.organization_id = o.id
  WHERE om.user_id = auth.uid() AND om.status = 'active'
  ORDER BY om.joined_at NULLS LAST
  LIMIT 1
$$;

-- Strengthen is_module_enabled to also verify the plan covers the module
CREATE OR REPLACE FUNCTION public.is_module_enabled(module_key text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(
      (SELECT om.is_enabled
         FROM public.organization_modules om
         WHERE om.organization_id = public.get_user_organization_id()
           AND om.module_key = $1),
      false
    )
    AND EXISTS (
      SELECT 1 FROM public.plan_modules pm
      JOIN public.organizations o ON o.plan = pm.plan
      WHERE o.id = public.get_user_organization_id()
        AND pm.module_key = $1
    )
$$;
