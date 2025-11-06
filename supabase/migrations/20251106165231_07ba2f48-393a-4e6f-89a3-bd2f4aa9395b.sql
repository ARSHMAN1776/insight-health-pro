-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles RLS to allow insert via trigger
DROP POLICY IF EXISTS "Allow signup to create profile" ON public.profiles;
CREATE POLICY "Allow signup to create profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update user_roles RLS to allow insert via trigger  
DROP POLICY IF EXISTS "Allow signup to create role" ON public.user_roles;
CREATE POLICY "Allow signup to create role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);