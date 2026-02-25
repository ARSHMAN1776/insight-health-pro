-- Fix empty admin profile name
UPDATE public.profiles 
SET first_name = 'Admin', last_name = 'User'
WHERE id = '63712aaa-707a-4a03-b9bd-0b0d52f96cdf' 
AND (first_name = '' OR first_name IS NULL);