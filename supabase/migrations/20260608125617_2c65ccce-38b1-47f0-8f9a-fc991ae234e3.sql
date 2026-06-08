
-- =====================================================================
-- STEP 2: MULTI-TENANT ISOLATION
-- Adds organization_id + RESTRICTIVE tenant-isolation RLS to all PHI/tenant tables
-- =====================================================================

DO $$
DECLARE
  default_org_id uuid;
  t text;
  tenant_tables text[] := ARRAY[
    'patients','doctors','nurses',
    'appointments','medical_records',
    'prescriptions','prescription_items','prescription_templates','prescription_refill_requests',
    'lab_tests',
    'daily_queues','queue_entries',
    'ipd_admissions','ward_rounds','discharge_summaries',
    'surgeries','surgery_team','operation_theatres','post_operation',
    'blood_stock','blood_stock_transactions','blood_issues','donors',
    'departments','department_doctors',
    'rooms','room_assignments',
    'inventory','purchase_orders','purchase_order_items','suppliers',
    'pharmacy_bills','pharmacy_bill_items',
    'payments',
    'insurance_claims','insurance_claim_items',
    'hospital_settings',
    'notifications','phi_audit_log',
    'staff_schedules','shift_handovers','shift_handover_patients',
    'referrals','appointment_waitlist','patient_feedback',
    'patient_messages','patient_vitals','patient_registration_queue',
    'reminders','scheduling_analytics','scheduling_recommendations',
    'api_keys','webhook_endpoints','user_settings','onboarding_progress'
  ];
BEGIN
  SELECT id INTO default_org_id FROM public.organizations ORDER BY created_at LIMIT 1;
  IF default_org_id IS NULL THEN
    RAISE EXCEPTION 'No default organization found. Run Step 1 first.';
  END IF;

  FOREACH t IN ARRAY tenant_tables LOOP
    -- Skip if table doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name=t
    ) THEN
      RAISE NOTICE 'Skipping % (does not exist)', t;
      CONTINUE;
    END IF;

    -- Add column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t AND column_name='organization_id'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN organization_id uuid', t);
      EXECUTE format('UPDATE public.%I SET organization_id = %L WHERE organization_id IS NULL', t, default_org_id);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN organization_id SET NOT NULL', t);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN organization_id SET DEFAULT public.get_user_organization_id()', t);
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT', t, t || '_organization_id_fkey');
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(organization_id)', 'idx_' || t || '_org_id', t);
      RAISE NOTICE 'Added organization_id to %', t;
    END IF;

    -- Drop existing tenant-isolation policy if any, then add RESTRICTIVE policy
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', t);
    EXECUTE format($f$
      CREATE POLICY tenant_isolation ON public.%I
        AS RESTRICTIVE
        FOR ALL
        TO authenticated
        USING (organization_id = public.get_user_organization_id())
        WITH CHECK (organization_id = public.get_user_organization_id())
    $f$, t);
    RAISE NOTICE 'Tenant isolation policy applied to %', t;
  END LOOP;
END $$;

-- =====================================================================
-- Update handle_new_user trigger to tag new patient/doctor/nurse with org
-- =====================================================================
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

  IF default_org_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
    VALUES (
      default_org_id, NEW.id,
      CASE WHEN user_role = 'admin' THEN 'owner' ELSE 'member' END,
      'active', now()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF user_role = 'patient' THEN
    INSERT INTO public.patients (first_name,last_name,email,phone,date_of_birth,gender,status,user_id,organization_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name',''),
      COALESCE(NEW.raw_user_meta_data->>'last_name',''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone',NULL),
      COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, CURRENT_DATE),
      COALESCE(NEW.raw_user_meta_data->>'gender','Other'),
      'pending_verification',
      NEW.id,
      default_org_id
    ) RETURNING id INTO new_patient_id;

    INSERT INTO public.patient_registration_queue (patient_id, user_id, status, organization_id)
    VALUES (new_patient_id, NEW.id, 'pending', default_org_id);

    FOR staff_user IN
      SELECT om.user_id FROM public.organization_members om
      JOIN public.user_roles ur ON ur.user_id = om.user_id
      WHERE om.organization_id = default_org_id
        AND ur.role IN ('admin','receptionist')
    LOOP
      INSERT INTO public.notifications (user_id,title,message,type,priority,action_url,metadata,organization_id)
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
        ),
        default_org_id
      );
    END LOOP;

  ELSIF user_role = 'doctor' THEN
    INSERT INTO public.doctors (first_name,last_name,email,phone,specialization,license_number,department,status,user_id,organization_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name',''),
      COALESCE(NEW.raw_user_meta_data->>'last_name',''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone',NULL),
      COALESCE(NEW.raw_user_meta_data->>'specialization','General'),
      COALESCE(NEW.raw_user_meta_data->>'license_number','PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'department',NULL),
      'active', NEW.id, default_org_id
    );

  ELSIF user_role = 'nurse' THEN
    INSERT INTO public.nurses (first_name,last_name,email,phone,specialization,license_number,department,status,organization_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name',''),
      COALESCE(NEW.raw_user_meta_data->>'last_name',''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone',NULL),
      COALESCE(NEW.raw_user_meta_data->>'specialization',NULL),
      COALESCE(NEW.raw_user_meta_data->>'license_number','PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'department',NULL),
      'active', default_org_id
    );
  END IF;

  RETURN NEW;
END;
$function$;
