-- Update handle_new_user to also insert into doctors/nurses tables for staff roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_patient_id uuid;
  staff_user record;
  user_role text;
BEGIN
  -- Get the role from metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, phone, department, specialization, license_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'department', NULL),
    COALESCE(NEW.raw_user_meta_data->>'specialization', NULL),
    COALESCE(NEW.raw_user_meta_data->>'license_number', NULL)
  );

  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    user_role::app_role
  );

  -- Handle different roles
  IF user_role = 'patient' THEN
    -- Create patient record
    INSERT INTO public.patients (
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      status,
      user_id
    )
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, CURRENT_DATE),
      COALESCE(NEW.raw_user_meta_data->>'gender', 'Other'),
      'pending_verification',
      NEW.id
    )
    RETURNING id INTO new_patient_id;

    -- Create registration queue entry
    INSERT INTO public.patient_registration_queue (patient_id, user_id, status)
    VALUES (new_patient_id, NEW.id, 'pending');

    -- Create notifications for admins and receptionists
    FOR staff_user IN 
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role IN ('admin', 'receptionist')
    LOOP
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        priority,
        action_url,
        metadata
      )
      VALUES (
        staff_user.user_id,
        'New Patient Registration',
        'New patient ' || COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '') || ' has registered and requires verification.',
        'patient_registration',
        'high',
        '/patients',
        jsonb_build_object(
          'patient_id', new_patient_id,
          'patient_name', COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
          'patient_email', NEW.email,
          'registration_time', now()
        )
      );
    END LOOP;
    
  ELSIF user_role = 'doctor' THEN
    -- Create doctor record
    INSERT INTO public.doctors (
      first_name,
      last_name,
      email,
      phone,
      specialization,
      license_number,
      department,
      status
    )
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'General'),
      COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'department', NULL),
      'active'
    );
    
  ELSIF user_role = 'nurse' THEN
    -- Create nurse record
    INSERT INTO public.nurses (
      first_name,
      last_name,
      email,
      phone,
      specialization,
      license_number,
      department,
      status
    )
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE(NEW.raw_user_meta_data->>'specialization', NULL),
      COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'department', NULL),
      'active'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Now manually insert Dr. Muzzamil into the doctors table since he already exists in profiles
INSERT INTO public.doctors (first_name, last_name, email, specialization, license_number, status)
SELECT 
  p.first_name,
  p.last_name,
  (SELECT email FROM auth.users WHERE id = p.id),
  COALESCE(p.specialization, 'General'),
  COALESCE(p.license_number, 'PENDING'),
  'active'
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'doctor'
AND NOT EXISTS (
  SELECT 1 FROM public.doctors d WHERE LOWER(d.first_name) = LOWER(p.first_name) AND LOWER(d.last_name) = LOWER(p.last_name)
);