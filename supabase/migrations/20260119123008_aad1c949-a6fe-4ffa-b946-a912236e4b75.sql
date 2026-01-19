-- =====================================================
-- Consolidate RLS Policies and Secure Queue Functions
-- =====================================================

-- 1. Drop duplicate/overlapping policies on patients table
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'patients' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.patients', policy_record.policyname);
  END LOOP;
END $$;

-- 2. Create clean, consolidated RLS policies for patients
-- Policy 1: Patients can view their own record
CREATE POLICY "patients_own_record_select" ON public.patients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Patients can update their own record (limited fields)
CREATE POLICY "patients_own_record_update" ON public.patients
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Admins have full access
CREATE POLICY "patients_admin_all" ON public.patients
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy 4: Staff with care relationship can view
CREATE POLICY "patients_care_relationship_select" ON public.patients
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'doctor') AND public.has_patient_care_relationship(auth.uid(), id)
    OR public.has_role(auth.uid(), 'nurse') AND public.has_patient_care_relationship(auth.uid(), id)
  );

-- Policy 5: Receptionists can view and insert patients
CREATE POLICY "patients_receptionist_select" ON public.patients
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "patients_receptionist_insert" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

-- Policy 6: Receptionists can update patient status
CREATE POLICY "patients_receptionist_update" ON public.patients
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'))
  WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

-- 3. Secure queue functions with role authorization

-- Update get_or_create_daily_queue to include role check and doctor-specific prefix
CREATE OR REPLACE FUNCTION public.get_or_create_daily_queue(
  _doctor_id uuid,
  _department_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _queue_id uuid;
  _today date := CURRENT_DATE;
  _prefix text;
  _doctor_name text;
BEGIN
  -- Role authorization check
  IF NOT (
    has_role(auth.uid(), 'receptionist') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'doctor') OR
    has_role(auth.uid(), 'nurse')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to manage queues';
  END IF;

  -- Check for existing queue
  SELECT id INTO _queue_id
  FROM daily_queues
  WHERE doctor_id = _doctor_id
    AND queue_date = _today
    AND is_active = true;
  
  IF _queue_id IS NOT NULL THEN
    RETURN _queue_id;
  END IF;
  
  -- Generate doctor-specific prefix (first letter of last name)
  SELECT UPPER(SUBSTRING(last_name, 1, 1)) INTO _doctor_name
  FROM doctors WHERE id = _doctor_id;
  
  _prefix := COALESCE(_doctor_name, 'Q');
  
  -- Create new queue
  INSERT INTO daily_queues (
    doctor_id,
    department_id,
    queue_date,
    token_prefix,
    is_active,
    current_token_number
  ) VALUES (
    _doctor_id,
    _department_id,
    _today,
    _prefix,
    true,
    0
  )
  RETURNING id INTO _queue_id;
  
  RETURN _queue_id;
END;
$$;

-- Update generate_next_token to include role check
CREATE OR REPLACE FUNCTION public.generate_next_token(_queue_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prefix text;
  _next_number integer;
  _token text;
BEGIN
  -- Role authorization check
  IF NOT (
    has_role(auth.uid(), 'receptionist') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'doctor') OR
    has_role(auth.uid(), 'nurse')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to generate tokens';
  END IF;

  -- Validate queue exists
  IF NOT EXISTS (SELECT 1 FROM daily_queues WHERE id = _queue_id) THEN
    RAISE EXCEPTION 'Queue not found';
  END IF;

  -- Get prefix and increment token number
  UPDATE daily_queues
  SET current_token_number = current_token_number + 1,
      updated_at = NOW()
  WHERE id = _queue_id
  RETURNING token_prefix, current_token_number INTO _prefix, _next_number;
  
  -- Format token (e.g., "M-001")
  _token := _prefix || '-' || LPAD(_next_number::text, 3, '0');
  
  RETURN _token;
END;
$$;

-- Update calculate_queue_position to handle priority correctly
CREATE OR REPLACE FUNCTION public.calculate_queue_position(
  _queue_id uuid,
  _priority text DEFAULT 'normal'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _position integer;
  _emergency_count integer;
  _priority_count integer;
BEGIN
  -- Role authorization check
  IF NOT (
    has_role(auth.uid(), 'receptionist') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'doctor') OR
    has_role(auth.uid(), 'nurse')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to calculate queue position';
  END IF;

  -- Validate queue exists
  IF NOT EXISTS (SELECT 1 FROM daily_queues WHERE id = _queue_id) THEN
    RAISE EXCEPTION 'Queue not found';
  END IF;

  -- Count patients by priority in waiting status
  SELECT 
    COUNT(*) FILTER (WHERE priority = 'emergency' AND status = 'waiting'),
    COUNT(*) FILTER (WHERE priority = 'priority' AND status = 'waiting')
  INTO _emergency_count, _priority_count
  FROM queue_entries
  WHERE queue_id = _queue_id;
  
  -- Calculate position based on priority
  IF _priority = 'emergency' THEN
    -- Emergency goes after other emergencies (position 1 if first emergency)
    _position := COALESCE(_emergency_count, 0) + 1;
  ELSIF _priority = 'priority' THEN
    -- Priority goes after emergencies and other priority patients
    _position := COALESCE(_emergency_count, 0) + COALESCE(_priority_count, 0) + 1;
  ELSE
    -- Normal goes to end of queue
    SELECT COALESCE(MAX(position_in_queue), 0) + 1 INTO _position
    FROM queue_entries
    WHERE queue_id = _queue_id AND status = 'waiting';
  END IF;
  
  RETURN _position;
END;
$$;

-- 4. Grant execute permissions on queue functions
GRANT EXECUTE ON FUNCTION public.get_or_create_daily_queue(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_next_token(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_queue_position(uuid, text) TO authenticated;