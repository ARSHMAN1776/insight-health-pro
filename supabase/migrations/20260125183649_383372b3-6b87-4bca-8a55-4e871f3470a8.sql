-- Create admin user directly in the database
-- Note: For production, you'd create this through the auth API with a proper password

-- First, insert an admin user into auth.users
-- We'll use the Supabase Auth admin API pattern

-- Since we can't directly insert passwords, let's update an existing user to admin role
-- OR create guidance for manual creation

-- Let's check if we can add to an existing user's metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE email = 'arshman@fastamsolutions.com';

-- Also create a simple admin account that can be used for testing
-- This requires using Supabase Auth API or Dashboard