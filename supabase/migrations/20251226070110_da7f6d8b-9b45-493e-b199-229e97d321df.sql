-- Drop the old status check constraint and add a new one that includes pending_verification
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_status_check;

ALTER TABLE public.patients ADD CONSTRAINT patients_status_check 
  CHECK (status IN ('active', 'inactive', 'discharged', 'pending_verification', 'rejected'));

-- Now fix missing patient records for users who signed up as patients before the migration
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
SELECT 
  COALESCE(au.raw_user_meta_data->>'first_name', p.first_name, ''),
  COALESCE(au.raw_user_meta_data->>'last_name', p.last_name, ''),
  au.email,
  COALESCE(au.raw_user_meta_data->>'phone', p.phone, NULL),
  COALESCE((au.raw_user_meta_data->>'date_of_birth')::date, CURRENT_DATE),
  COALESCE(au.raw_user_meta_data->>'gender', 'Other'),
  'pending_verification',
  au.id
FROM auth.users au
JOIN public.user_roles ur ON ur.user_id = au.id AND ur.role = 'patient'
LEFT JOIN public.profiles p ON p.id = au.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.patients pat WHERE pat.user_id = au.id
);

-- Create registration queue entries for the newly created patient records
INSERT INTO public.patient_registration_queue (patient_id, user_id, status)
SELECT p.id, p.user_id, 'pending'
FROM public.patients p
WHERE p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.patient_registration_queue prq WHERE prq.user_id = p.user_id
  );