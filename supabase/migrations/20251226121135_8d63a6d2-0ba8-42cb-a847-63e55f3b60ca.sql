-- Add user_id column to doctors table to link with auth profiles
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing doctor (Dr. Muzzamil) to link with their profile
UPDATE public.doctors d
SET user_id = p.id
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'doctor'
AND LOWER(d.first_name) = LOWER(p.first_name)
AND LOWER(d.last_name) = LOWER(p.last_name);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);