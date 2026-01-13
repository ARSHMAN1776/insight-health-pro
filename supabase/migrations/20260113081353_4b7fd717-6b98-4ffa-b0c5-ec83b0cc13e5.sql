-- ============================================================================
-- CRITICAL SECURITY FIX: Remove overly permissive RLS policies
-- ============================================================================

-- 1. DROP dangerous policies that expose sensitive data
DROP POLICY IF EXISTS "Anonymous can verify patient exists" ON public.patients;
DROP POLICY IF EXISTS "Anyone can view department doctors" ON public.department_doctors;
DROP POLICY IF EXISTS "Anyone can view active departments" ON public.departments;
DROP POLICY IF EXISTS "Public can view basic doctor info" ON public.doctors;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert patient registrations" ON public.patient_registration_queue;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.phi_audit_log;

-- 2. Replace with secure authenticated-only policies

-- Patients: Only staff and the patient themselves can view
CREATE POLICY "Authenticated staff can view patients" ON public.patients
FOR SELECT TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'lab_technician') OR
    public.has_role(auth.uid(), 'pharmacist') OR
    user_id = auth.uid()
);

-- Doctors: Only authenticated users can view
CREATE POLICY "Authenticated users can view doctors" ON public.doctors
FOR SELECT TO authenticated
USING (true);

-- Department doctors: Only authenticated users can view
CREATE POLICY "Authenticated users can view department doctors" ON public.department_doctors
FOR SELECT TO authenticated
USING (true);

-- Departments: Only authenticated users can view active
CREATE POLICY "Authenticated users can view active departments" ON public.departments
FOR SELECT TO authenticated
USING (status = 'Active');

-- Notifications: Use service role for system inserts (handled by triggers)
-- Regular authenticated users can only insert their own
CREATE POLICY "Authenticated users can insert own notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Patient registration queue: Only authenticated users can insert for themselves
CREATE POLICY "Authenticated patients can insert registration" ON public.patient_registration_queue
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- PHI audit log: Only admins can insert (or via database trigger with SECURITY DEFINER)
CREATE POLICY "Admin can insert audit logs" ON public.phi_audit_log
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also allow viewing audit logs only by admin
CREATE POLICY "Admin can view audit logs" ON public.phi_audit_log
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Update staff_schedules to require authentication properly
DROP POLICY IF EXISTS "Authenticated users can view staff schedules" ON public.staff_schedules;
CREATE POLICY "Staff can view schedules" ON public.staff_schedules
FOR SELECT TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'receptionist')
);