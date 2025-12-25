-- Insert predefined blood groups (only if they don't exist)
INSERT INTO public.blood_groups (group_name) VALUES
  ('A+'),
  ('A-'),
  ('B+'),
  ('B-'),
  ('AB+'),
  ('AB-'),
  ('O+'),
  ('O-')
ON CONFLICT DO NOTHING;