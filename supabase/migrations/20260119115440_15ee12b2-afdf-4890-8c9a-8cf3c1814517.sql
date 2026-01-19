
-- ============================================
-- Step 1: Create helper function for relationship-based access
-- ============================================

CREATE OR REPLACE FUNCTION public.has_patient_care_relationship(p_user_id uuid, p_patient_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_has_relationship boolean := false;
BEGIN
  -- Get user's role
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id;
  
  -- Admins always have access
  IF v_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Doctors have access to their own patients (appointments or records)
  IF v_role = 'doctor' THEN
    SELECT EXISTS (
      SELECT 1 FROM appointments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      WHERE d.user_id = p_user_id 
      AND a.patient_id = p_patient_id
      AND a.deleted_at IS NULL
    ) INTO v_has_relationship;
    RETURN v_has_relationship;
  END IF;
  
  -- Nurses: check if patient has appointment today or active queue entry
  IF v_role = 'nurse' THEN
    SELECT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = p_patient_id
      AND a.appointment_date = CURRENT_DATE
      AND a.status NOT IN ('cancelled', 'no_show')
      AND a.deleted_at IS NULL
    ) OR EXISTS (
      SELECT 1 FROM queue_entries qe
      INNER JOIN daily_queues dq ON dq.id = qe.queue_id
      WHERE qe.patient_id = p_patient_id
      AND dq.queue_date = CURRENT_DATE
      AND qe.status NOT IN ('completed', 'cancelled', 'no_show')
    ) INTO v_has_relationship;
    RETURN v_has_relationship;
  END IF;
  
  -- Lab technicians: check if patient has pending/in-progress lab tests
  IF v_role = 'lab_technician' THEN
    SELECT EXISTS (
      SELECT 1 FROM lab_tests lt
      WHERE lt.patient_id = p_patient_id
      AND lt.status IN ('pending', 'in_progress', 'sample_collected')
      AND lt.deleted_at IS NULL
    ) INTO v_has_relationship;
    RETURN v_has_relationship;
  END IF;
  
  -- Receptionists: check if patient has appointment today or is in queue
  IF v_role = 'receptionist' THEN
    SELECT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = p_patient_id
      AND a.appointment_date = CURRENT_DATE
      AND a.deleted_at IS NULL
    ) OR EXISTS (
      SELECT 1 FROM queue_entries qe
      INNER JOIN daily_queues dq ON dq.id = qe.queue_id
      WHERE qe.patient_id = p_patient_id
      AND dq.queue_date = CURRENT_DATE
    ) INTO v_has_relationship;
    RETURN v_has_relationship;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.has_patient_care_relationship TO authenticated;
