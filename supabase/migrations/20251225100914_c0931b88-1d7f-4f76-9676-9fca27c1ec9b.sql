-- Phase 1: Add user_id to patients table for proper auth linking
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- Phase 2: Create patient registration queue for hospital awareness
CREATE TABLE IF NOT EXISTS public.patient_registration_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamp with time zone,
    rejection_reason text,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on registration queue
ALTER TABLE public.patient_registration_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_registration_queue
-- Admins and receptionists can see all registrations
CREATE POLICY "Staff can view all patient registrations" 
ON public.patient_registration_queue 
FOR SELECT 
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'receptionist') OR
    has_role(auth.uid(), 'doctor') OR
    has_role(auth.uid(), 'nurse')
);

-- System can insert registrations (triggered by signup)
CREATE POLICY "System can insert patient registrations" 
ON public.patient_registration_queue 
FOR INSERT 
WITH CHECK (true);

-- Staff can update registrations (approve/reject)
CREATE POLICY "Staff can update patient registrations" 
ON public.patient_registration_queue 
FOR UPDATE 
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'receptionist')
);

-- Patients can view their own registration status
CREATE POLICY "Patients can view their own registration" 
ON public.patient_registration_queue 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_patient_registration_queue_updated_at
BEFORE UPDATE ON public.patient_registration_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to:
-- 1. Set user_id in patients table
-- 2. Create registration queue entry
-- 3. Create notification for staff
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_patient_id uuid;
  staff_user record;
BEGIN
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

  -- Insert into user_roles table (default to patient if no role specified)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::app_role
  );

  -- If the role is 'patient', also create a record in the patients table
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'patient') = 'patient' THEN
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
  END IF;

  RETURN NEW;
END;
$$;

-- Enable realtime for patient_registration_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_registration_queue;