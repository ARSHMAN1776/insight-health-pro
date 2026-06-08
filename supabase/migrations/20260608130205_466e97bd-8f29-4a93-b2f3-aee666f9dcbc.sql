
DO $$
DECLARE
  org_b_id uuid;
  test_user_b uuid := '00000000-0000-0000-0000-00000000beef';
BEGIN
  -- Create a synthetic auth user (no password / no login) just for RLS testing
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  VALUES (
    test_user_b,
    '00000000-0000-0000-0000-000000000000',
    'authenticated','authenticated',
    'orgb-test@test.local','', now(), now(), now(),
    '{"provider":"email"}'::jsonb, '{}'::jsonb, false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.organizations (name, slug, email, plan, status)
  VALUES ('Test Org B', 'test-org-b', 'admin@test-org-b.local', 'basic', 'active')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO org_b_id FROM public.organizations WHERE slug = 'test-org-b';

  INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
  VALUES (org_b_id, test_user_b, 'owner', 'active', now())
  ON CONFLICT DO NOTHING;

  INSERT INTO public.patients (first_name,last_name,email,date_of_birth,gender,status,organization_id)
  SELECT 'OrgB','TestPatient','orgb@test.local',CURRENT_DATE,'Other','active',org_b_id
  WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE email='orgb@test.local');
END $$;

CREATE OR REPLACE FUNCTION public.run_tenant_leak_test(_user_id uuid)
RETURNS TABLE(test_name text, visible_count bigint, expected_max bigint, passed boolean)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  user_org uuid;
  vp bigint; vr bigint; va bigint; vlt bigint; vpr bigint; vn bigint;
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _user_id::text, 'role','authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  SELECT public.get_user_organization_id() INTO user_org;
  SELECT count(*) INTO vp FROM public.patients;
  SELECT count(*) INTO vr FROM public.medical_records;
  SELECT count(*) INTO va FROM public.appointments;
  SELECT count(*) INTO vlt FROM public.lab_tests;
  SELECT count(*) INTO vpr FROM public.prescriptions;
  SELECT count(*) INTO vn FROM public.notifications;

  RETURN QUERY SELECT 'user_org_resolved'::text, 0::bigint, 0::bigint, (user_org IS NOT NULL);
  RETURN QUERY SELECT 'patients_visible'::text, vp, 1::bigint, (vp <= 1);
  RETURN QUERY SELECT 'medical_records_visible'::text, vr, 0::bigint, (vr = 0);
  RETURN QUERY SELECT 'appointments_visible'::text, va, 0::bigint, (va = 0);
  RETURN QUERY SELECT 'lab_tests_visible'::text, vlt, 0::bigint, (vlt = 0);
  RETURN QUERY SELECT 'prescriptions_visible'::text, vpr, 0::bigint, (vpr = 0);
  RETURN QUERY SELECT 'notifications_visible'::text, vn, 0::bigint, (vn = 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_tenant_leak_test(uuid) TO authenticated, service_role;
