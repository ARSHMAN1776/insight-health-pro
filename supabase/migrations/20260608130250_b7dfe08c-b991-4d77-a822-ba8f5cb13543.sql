
-- Use a SECURITY DEFINER function owned by postgres so it can switch to authenticated
CREATE OR REPLACE FUNCTION public.run_tenant_leak_test(_user_id uuid)
RETURNS TABLE(test_name text, visible_count bigint, expected_max bigint, passed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_org uuid;
  vp bigint; vr bigint; va bigint; vlt bigint; vpr bigint; vn bigint;
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _user_id::text, 'role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  SELECT public.get_user_organization_id() INTO user_org;
  SELECT count(*) INTO vp FROM public.patients;
  SELECT count(*) INTO vr FROM public.medical_records;
  SELECT count(*) INTO va FROM public.appointments;
  SELECT count(*) INTO vlt FROM public.lab_tests;
  SELECT count(*) INTO vpr FROM public.prescriptions;
  SELECT count(*) INTO vn FROM public.notifications;

  RESET ROLE;

  RETURN QUERY SELECT 'user_org_resolved'::text, 0::bigint, 0::bigint, (user_org IS NOT NULL);
  RETURN QUERY SELECT 'patients_visible'::text, vp, 1::bigint, (vp <= 1);
  RETURN QUERY SELECT 'medical_records_visible'::text, vr, 0::bigint, (vr = 0);
  RETURN QUERY SELECT 'appointments_visible'::text, va, 0::bigint, (va = 0);
  RETURN QUERY SELECT 'lab_tests_visible'::text, vlt, 0::bigint, (vlt = 0);
  RETURN QUERY SELECT 'prescriptions_visible'::text, vpr, 0::bigint, (vpr = 0);
  RETURN QUERY SELECT 'notifications_visible'::text, vn, 0::bigint, (vn = 0);
END;
$$;

ALTER FUNCTION public.run_tenant_leak_test(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.run_tenant_leak_test(uuid) TO service_role;
