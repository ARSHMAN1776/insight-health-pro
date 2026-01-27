-- =====================================================
-- SECURITY FIX: Set search_path for all helper functions
-- =====================================================

-- Fix get_user_organization_id function
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id 
  FROM public.organization_members 
  WHERE user_id = auth.uid() 
    AND status = 'active'
  LIMIT 1
$$;

-- Fix get_user_org_role function
CREATE OR REPLACE FUNCTION public.get_user_org_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role 
  FROM public.organization_members 
  WHERE user_id = auth.uid() 
    AND organization_id = public.get_user_organization_id()
    AND status = 'active'
  LIMIT 1
$$;

-- Fix can_access_organization function
CREATE OR REPLACE FUNCTION public.can_access_organization(resource_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.user_id = auth.uid()
      AND om.organization_id = resource_org_id
      AND om.status = 'active'
      AND o.status IN ('active', 'trialing')
  )
$$;

-- Fix is_module_enabled function
CREATE OR REPLACE FUNCTION public.is_module_enabled(module_key TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_enabled 
     FROM public.organization_modules 
     WHERE organization_id = public.get_user_organization_id() 
       AND module_key = $1),
    false
  )
$$;

-- Fix update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix the overly permissive organization INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

CREATE POLICY "Users can create their own organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() OR created_by IS NULL
  );