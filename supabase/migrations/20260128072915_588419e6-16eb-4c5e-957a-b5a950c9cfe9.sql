-- Insert test organization for verification
INSERT INTO public.organizations (
  id,
  name,
  slug,
  email,
  phone,
  status,
  created_by,
  created_at,
  address_line1,
  city
) VALUES (
  gen_random_uuid(),
  'Demo Medical Center',
  'demo-medical-center',
  'demohospital2026@yopmail.com',
  '+92 300 1234567',
  'trialing',
  'aa465de1-0c68-4593-8862-228981acbcd2',
  now(),
  '123 Medical Center Road',
  'Demo City'
);

-- Add user as owner
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role,
  status,
  joined_at
)
SELECT 
  o.id,
  'aa465de1-0c68-4593-8862-228981acbcd2'::uuid,
  'owner',
  'active',
  now()
FROM public.organizations o 
WHERE o.slug = 'demo-medical-center';

-- Create trial subscription
INSERT INTO public.organization_subscriptions (
  organization_id,
  status,
  billing_cycle,
  trial_start,
  trial_end,
  current_period_start,
  current_period_end
)
SELECT 
  o.id,
  'trialing',
  'monthly',
  now(),
  now() + interval '14 days',
  now(),
  now() + interval '14 days'
FROM public.organizations o 
WHERE o.slug = 'demo-medical-center';

-- Enable some modules
INSERT INTO public.organization_modules (organization_id, module_key, is_enabled, enabled_at)
SELECT o.id, 'appointments', true, now() FROM organizations o WHERE o.slug = 'demo-medical-center'
UNION ALL
SELECT o.id, 'patients', true, now() FROM organizations o WHERE o.slug = 'demo-medical-center'
UNION ALL
SELECT o.id, 'prescriptions', true, now() FROM organizations o WHERE o.slug = 'demo-medical-center'
UNION ALL
SELECT o.id, 'billing', true, now() FROM organizations o WHERE o.slug = 'demo-medical-center';