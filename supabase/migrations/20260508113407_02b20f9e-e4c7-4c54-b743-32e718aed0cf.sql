
DROP POLICY IF EXISTS "Allow signup to create role" ON public.user_roles;

DROP POLICY IF EXISTS "Authenticated users can view discharge summaries" ON public.discharge_summaries;

CREATE POLICY "Patients can view own discharge summaries"
  ON public.discharge_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ipd_admissions a
      WHERE a.id = discharge_summaries.admission_id
        AND a.patient_id = public.get_patient_id_for_user(auth.uid())
    )
  );

CREATE POLICY "Clinical staff can view discharge summaries for their patients"
  ON public.discharge_summaries FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.ipd_admissions a
      WHERE a.id = discharge_summaries.admission_id
        AND (public.has_role(auth.uid(), 'doctor'::app_role)
             OR public.has_role(auth.uid(), 'nurse'::app_role))
        AND public.has_patient_care_relationship(auth.uid(), a.patient_id)
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view admissions" ON public.ipd_admissions;

CREATE POLICY "Patients can view own admissions"
  ON public.ipd_admissions FOR SELECT
  USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Clinical staff can view admissions for their patients"
  ON public.ipd_admissions FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'receptionist'::app_role)
    OR (
      (public.has_role(auth.uid(), 'doctor'::app_role)
        OR public.has_role(auth.uid(), 'nurse'::app_role))
      AND public.has_patient_care_relationship(auth.uid(), patient_id)
    )
  );

DROP POLICY IF EXISTS "Admin can view audit logs" ON public.phi_audit_log;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.phi_audit_log;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND cmd='UPDATE') THEN
    EXECUTE 'CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND cmd='DELETE') THEN
    EXECUTE 'CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;
