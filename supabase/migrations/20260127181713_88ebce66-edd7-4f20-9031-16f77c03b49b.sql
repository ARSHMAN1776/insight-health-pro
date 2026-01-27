-- =====================================================
-- MULTI-TENANT SAAS TRANSFORMATION - PHASE 1
-- Database Foundation Migration
-- Version: 6.0.0
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- CORE MULTI-TENANT TABLES
-- =====================================================

-- 1. ORGANIZATIONS (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  legal_name TEXT,
  
  -- Contact Information
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  
  -- Address (structured for international support)
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Compliance & Licensing
  license_number TEXT,
  tax_id TEXT,
  npi_number TEXT,
  accreditation_body TEXT,
  accreditation_number TEXT,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  
  -- Configuration
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  locale TEXT DEFAULT 'en-US',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  
  -- Status & Lifecycle
  status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Limits & Quotas
  max_staff INTEGER DEFAULT 10,
  max_patients INTEGER DEFAULT 100,
  max_storage_gb INTEGER DEFAULT 5,
  
  -- Security
  require_2fa BOOLEAN DEFAULT false,
  allowed_ip_ranges TEXT[],
  session_timeout_minutes INTEGER DEFAULT 60,
  password_policy JSONB DEFAULT '{"minLength": 8, "requireUppercase": true, "requireNumbers": true}',
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_org_status CHECK (status IN ('active', 'suspended', 'cancelled', 'archived', 'trialing')),
  CONSTRAINT valid_country CHECK (country ~ '^[A-Z]{2}$')
);

-- Indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_trial_ends ON public.organizations(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_email ON public.organizations(email);

-- 2. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan Details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tier INTEGER NOT NULL,
  
  -- Pricing
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  setup_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Limits
  max_staff INTEGER,
  max_patients INTEGER,
  max_departments INTEGER,
  max_storage_gb INTEGER,
  max_api_calls_per_month INTEGER,
  
  -- Features & Modules
  features JSONB NOT NULL DEFAULT '[]',
  modules JSONB NOT NULL DEFAULT '{}',
  integrations JSONB DEFAULT '[]',
  
  -- Support Level
  support_level TEXT DEFAULT 'email',
  support_response_sla_hours INTEGER DEFAULT 48,
  
  -- Compliance Features
  hipaa_compliant BOOLEAN DEFAULT false,
  soc2_compliant BOOLEAN DEFAULT false,
  data_retention_days INTEGER DEFAULT 365,
  backup_frequency_hours INTEGER DEFAULT 24,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  
  -- Stripe Integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_tier CHECK (tier BETWEEN 1 AND 10),
  CONSTRAINT valid_support_level CHECK (support_level IN ('email', 'priority', 'dedicated', 'enterprise'))
);

-- Indexes for subscription_plans
CREATE INDEX IF NOT EXISTS idx_plans_tier ON public.subscription_plans(tier);
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.subscription_plans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_plans_slug ON public.subscription_plans(slug);

-- 3. ORGANIZATION MEMBERS
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role & Permissions
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  
  -- Status
  status TEXT DEFAULT 'active',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  
  -- Access Control
  can_invite_members BOOLEAN DEFAULT false,
  can_manage_billing BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, user_id),
  CONSTRAINT valid_member_role CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  CONSTRAINT valid_member_status CHECK (status IN ('active', 'invited', 'suspended'))
);

-- Indexes for organization_members
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members(role);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON public.organization_members(status);

-- 4. ORGANIZATION SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  
  -- Billing
  status TEXT DEFAULT 'trialing',
  billing_cycle TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Trial Management
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Payment
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  
  -- Usage Tracking
  current_staff_count INTEGER DEFAULT 0,
  current_patient_count INTEGER DEFAULT 0,
  current_storage_gb DECIMAL(10,2) DEFAULT 0,
  current_api_calls INTEGER DEFAULT 0,
  
  -- Billing History
  last_invoice_date TIMESTAMPTZ,
  last_invoice_amount DECIMAL(10,2),
  next_invoice_date TIMESTAMPTZ,
  next_invoice_amount DECIMAL(10,2),
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Discounts
  discount_code TEXT,
  discount_percentage DECIMAL(5,2),
  discount_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_sub_status CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid', 'incomplete')),
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly', 'custom'))
);

-- Indexes for organization_subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.organization_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_cust ON public.organization_subscriptions(stripe_customer_id);

-- 5. ORGANIZATION MODULES
CREATE TABLE IF NOT EXISTS public.organization_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  enabled_at TIMESTAMPTZ DEFAULT now(),
  disabled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, module_key)
);

-- Indexes for organization_modules
CREATE INDEX IF NOT EXISTS idx_org_modules_org_id ON public.organization_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_modules_key ON public.organization_modules(module_key);
CREATE INDEX IF NOT EXISTS idx_org_modules_enabled ON public.organization_modules(organization_id, module_key) WHERE is_enabled = true;

-- 6. ONBOARDING PROGRESS
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, step)
);

-- Indexes for onboarding_progress
CREATE INDEX IF NOT EXISTS idx_onboarding_org_id ON public.onboarding_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_step ON public.onboarding_progress(step);

-- 7. API KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  
  -- Permissions
  scopes TEXT[] DEFAULT ARRAY['read'],
  
  -- Rate Limiting
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON public.api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(organization_id) WHERE is_active = true;

-- 8. SAAS AUDIT LOGS (separate from existing audit for SaaS-specific events)
CREATE TABLE IF NOT EXISTS public.saas_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Event Details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for saas_audit_logs
CREATE INDEX IF NOT EXISTS idx_saas_audit_org_id ON public.saas_audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saas_audit_user_id ON public.saas_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saas_audit_resource ON public.saas_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_saas_audit_action ON public.saas_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_saas_audit_created ON public.saas_audit_logs(created_at DESC);

-- 9. USAGE METRICS
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(12,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  
  -- Billing Period
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'
);

-- Indexes for usage_metrics
CREATE INDEX IF NOT EXISTS idx_usage_metrics_org_period ON public.usage_metrics(organization_id, billing_period_start);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON public.usage_metrics(metric_type, recorded_at DESC);

-- 10. WEBHOOK ENDPOINTS
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for webhook_endpoints
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON public.webhook_endpoints(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON public.webhook_endpoints(organization_id) WHERE is_active = true;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM public.organization_members 
  WHERE user_id = auth.uid() 
    AND status = 'active'
  LIMIT 1
$$;

-- Get current user's role in their organization
CREATE OR REPLACE FUNCTION public.get_user_org_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role 
  FROM public.organization_members 
  WHERE user_id = auth.uid() 
    AND organization_id = public.get_user_organization_id()
    AND status = 'active'
  LIMIT 1
$$;

-- Check if user can access a specific organization's resources
CREATE OR REPLACE FUNCTION public.can_access_organization(resource_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
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

-- Check if a module is enabled for the current user's organization
CREATE OR REPLACE FUNCTION public.is_module_enabled(module_key TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_enabled 
     FROM public.organization_modules 
     WHERE organization_id = public.get_user_organization_id() 
       AND module_key = $1),
    false
  )
$$;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER organization_subscriptions_updated_at
  BEFORE UPDATE ON public.organization_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER organization_modules_updated_at
  BEFORE UPDATE ON public.organization_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS POLICIES
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Organization owners and admins can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- SUBSCRIPTION PLANS POLICIES (public read)
CREATE POLICY "Anyone can view active public subscription plans"
  ON public.subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true AND is_public = true);

CREATE POLICY "Service role can manage subscription plans"
  ON public.subscription_plans FOR ALL
  TO service_role
  USING (true);

-- ORGANIZATION MEMBERS POLICIES
CREATE POLICY "Users can view members of their organization"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Owners and admins can insert members"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

CREATE POLICY "Owners and admins can update members"
  ON public.organization_members FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

CREATE POLICY "Owners can delete members"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() = 'owner'
  );

-- ORGANIZATION SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view their organization subscription"
  ON public.organization_subscriptions FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Service role can manage subscriptions"
  ON public.organization_subscriptions FOR ALL
  TO service_role
  USING (true);

-- ORGANIZATION MODULES POLICIES
CREATE POLICY "Users can view their organization modules"
  ON public.organization_modules FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage organization modules"
  ON public.organization_modules FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

-- ONBOARDING PROGRESS POLICIES
CREATE POLICY "Users can view their organization onboarding progress"
  ON public.onboarding_progress FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage their organization onboarding progress"
  ON public.onboarding_progress FOR ALL
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

-- API KEYS POLICIES
CREATE POLICY "Admins can view organization API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

CREATE POLICY "Admins can manage organization API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

-- SAAS AUDIT LOGS POLICIES
CREATE POLICY "Admins can view organization audit logs"
  ON public.saas_audit_logs FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

CREATE POLICY "System can insert audit logs"
  ON public.saas_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());

-- USAGE METRICS POLICIES
CREATE POLICY "Admins can view organization usage metrics"
  ON public.usage_metrics FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

CREATE POLICY "Service role can manage usage metrics"
  ON public.usage_metrics FOR ALL
  TO service_role
  USING (true);

-- WEBHOOK ENDPOINTS POLICIES
CREATE POLICY "Admins can view organization webhooks"
  ON public.webhook_endpoints FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

CREATE POLICY "Admins can manage organization webhooks"
  ON public.webhook_endpoints FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.get_user_org_role() IN ('owner', 'admin')
  );

-- =====================================================
-- SEED DEFAULT SUBSCRIPTION PLANS
-- =====================================================

INSERT INTO public.subscription_plans (
  name, slug, description, tier,
  price_monthly, price_yearly, setup_fee,
  max_staff, max_patients, max_departments, max_storage_gb, max_api_calls_per_month,
  features, modules,
  support_level, support_response_sla_hours,
  hipaa_compliant, soc2_compliant, data_retention_days,
  stripe_price_id_monthly, stripe_price_id_yearly,
  display_order, is_active, is_public
) VALUES 
(
  'Starter',
  'starter',
  'Perfect for small clinics and practices just getting started with digital healthcare management.',
  1,
  499.00, 4990.00, 0,
  5, 500, 3, 5, 10000,
  '["Patient Management", "Appointments", "Prescriptions", "Basic Billing", "Email Support"]'::jsonb,
  '{"dashboard": true, "patients": true, "appointments": true, "departments": true, "prescriptions": true, "billing": true, "lab_tests": false, "pharmacy": false, "inventory": false, "insurance": false, "blood_bank": false, "operation_dept": false, "referrals": false, "reports": false, "audit_logs": false, "queue": false, "vitals": false, "shift_handover": false, "rooms": false, "messages": true}'::jsonb,
  'email', 48,
  false, false, 365,
  NULL, NULL,
  1, true, true
),
(
  'Professional',
  'professional',
  'Comprehensive solution for growing healthcare facilities with advanced clinical workflows.',
  2,
  1299.00, 12990.00, 0,
  25, 5000, 10, 25, 50000,
  '["Everything in Starter", "Lab Tests", "Pharmacy Management", "Inventory", "Insurance Claims", "Advanced Reports", "Priority Support", "HIPAA Compliance", "API Access"]'::jsonb,
  '{"dashboard": true, "patients": true, "appointments": true, "departments": true, "prescriptions": true, "billing": true, "lab_tests": true, "pharmacy": true, "inventory": true, "insurance": true, "blood_bank": false, "operation_dept": false, "referrals": true, "reports": true, "audit_logs": true, "queue": true, "vitals": true, "shift_handover": false, "rooms": true, "messages": true}'::jsonb,
  'priority', 24,
  true, false, 730,
  NULL, NULL,
  2, true, true
),
(
  'Enterprise',
  'enterprise',
  'Full-featured platform for large hospitals with complete operational control and dedicated support.',
  3,
  NULL, NULL, 0,
  NULL, NULL, NULL, 100, 500000,
  '["Everything in Professional", "Blood Bank", "Operation Theatre", "Shift Handover", "SSO/SAML", "Custom Integrations", "Dedicated Account Manager", "Custom Training", "SOC2 Compliance", "99.99% SLA"]'::jsonb,
  '{"dashboard": true, "patients": true, "appointments": true, "departments": true, "prescriptions": true, "billing": true, "lab_tests": true, "pharmacy": true, "inventory": true, "insurance": true, "blood_bank": true, "operation_dept": true, "referrals": true, "reports": true, "audit_logs": true, "queue": true, "vitals": true, "shift_handover": true, "rooms": true, "messages": true}'::jsonb,
  'enterprise', 4,
  true, true, 2555,
  NULL, NULL,
  3, true, true
);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON public.subscription_plans TO anon;
GRANT SELECT ON public.subscription_plans TO authenticated;

GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_subscriptions TO authenticated;
GRANT ALL ON public.organization_modules TO authenticated;
GRANT ALL ON public.onboarding_progress TO authenticated;
GRANT ALL ON public.api_keys TO authenticated;
GRANT ALL ON public.saas_audit_logs TO authenticated;
GRANT ALL ON public.usage_metrics TO authenticated;
GRANT ALL ON public.webhook_endpoints TO authenticated;