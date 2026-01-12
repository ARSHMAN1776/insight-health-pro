-- Drop existing public policies on surgeries table
DROP POLICY IF EXISTS "Public select surgeries" ON public.surgeries;
DROP POLICY IF EXISTS "Public insert surgeries" ON public.surgeries;
DROP POLICY IF EXISTS "Public update surgeries" ON public.surgeries;
DROP POLICY IF EXISTS "Public delete surgeries" ON public.surgeries;

-- Drop existing public policies on surgery_team table
DROP POLICY IF EXISTS "Public select surgery_team" ON public.surgery_team;
DROP POLICY IF EXISTS "Public insert surgery_team" ON public.surgery_team;
DROP POLICY IF EXISTS "Public update surgery_team" ON public.surgery_team;
DROP POLICY IF EXISTS "Public delete surgery_team" ON public.surgery_team;

-- Drop existing public policies on post_operation table
DROP POLICY IF EXISTS "Public select post_operation" ON public.post_operation;
DROP POLICY IF EXISTS "Public insert post_operation" ON public.post_operation;
DROP POLICY IF EXISTS "Public update post_operation" ON public.post_operation;
DROP POLICY IF EXISTS "Public delete post_operation" ON public.post_operation;

-- =============================================
-- SURGERIES TABLE - Role-based access control
-- =============================================

-- Admins can do everything
CREATE POLICY "Admins manage surgeries" ON public.surgeries
FOR ALL USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Doctors can view all surgeries (needed for scheduling conflicts) and manage their own
CREATE POLICY "Doctors can view all surgeries" ON public.surgeries
FOR SELECT USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can insert own surgeries" ON public.surgeries
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'doctor') AND 
  doctor_id = public.get_doctor_id_for_user(auth.uid())
);

CREATE POLICY "Doctors can update own surgeries" ON public.surgeries
FOR UPDATE USING (
  public.has_role(auth.uid(), 'doctor') AND 
  doctor_id = public.get_doctor_id_for_user(auth.uid())
) WITH CHECK (
  public.has_role(auth.uid(), 'doctor') AND 
  doctor_id = public.get_doctor_id_for_user(auth.uid())
);

CREATE POLICY "Doctors can delete own surgeries" ON public.surgeries
FOR DELETE USING (
  public.has_role(auth.uid(), 'doctor') AND 
  doctor_id = public.get_doctor_id_for_user(auth.uid())
);

-- Nurses can view surgeries (needed for patient care)
CREATE POLICY "Nurses can view surgeries" ON public.surgeries
FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

-- Patients can view their own surgeries
CREATE POLICY "Patients can view own surgeries" ON public.surgeries
FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

-- =============================================
-- SURGERY_TEAM TABLE - Role-based access control
-- =============================================

-- Admins can do everything
CREATE POLICY "Admins manage surgery_team" ON public.surgery_team
FOR ALL USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Doctors can view all surgery teams and manage teams for their own surgeries
CREATE POLICY "Doctors can view surgery_team" ON public.surgery_team
FOR SELECT USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can insert surgery_team for own surgeries" ON public.surgery_team
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
);

CREATE POLICY "Doctors can update surgery_team for own surgeries" ON public.surgery_team
FOR UPDATE USING (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
) WITH CHECK (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
);

CREATE POLICY "Doctors can delete surgery_team for own surgeries" ON public.surgery_team
FOR DELETE USING (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
);

-- Nurses can view surgery teams
CREATE POLICY "Nurses can view surgery_team" ON public.surgery_team
FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

-- =============================================
-- POST_OPERATION TABLE - Role-based access control
-- =============================================

-- Admins can do everything
CREATE POLICY "Admins manage post_operation" ON public.post_operation
FOR ALL USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Doctors can view all post-op records and manage their own patients' records
CREATE POLICY "Doctors can view post_operation" ON public.post_operation
FOR SELECT USING (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can insert post_operation for own surgeries" ON public.post_operation
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
);

CREATE POLICY "Doctors can update post_operation for own surgeries" ON public.post_operation
FOR UPDATE USING (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
) WITH CHECK (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
);

CREATE POLICY "Doctors can delete post_operation for own surgeries" ON public.post_operation
FOR DELETE USING (
  public.has_role(auth.uid(), 'doctor') AND
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.doctor_id = public.get_doctor_id_for_user(auth.uid())
  )
);

-- Nurses can view and update post-op records (for patient care)
CREATE POLICY "Nurses can view post_operation" ON public.post_operation
FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can update post_operation" ON public.post_operation
FOR UPDATE USING (public.has_role(auth.uid(), 'nurse'))
WITH CHECK (public.has_role(auth.uid(), 'nurse'));

-- Patients can view their own post-op records
CREATE POLICY "Patients can view own post_operation" ON public.post_operation
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.surgeries s 
    WHERE s.id = surgery_id 
    AND s.patient_id = public.get_patient_id_for_user(auth.uid())
  )
);