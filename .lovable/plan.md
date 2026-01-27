# Multi-Tenant SaaS Transformation Plan - Enhanced Version

**Version:** 6.0.0  
**Document Status:** Architecture Specification  
**Last Updated:** January 27, 2026

---

## Executive Summary

This comprehensive plan transforms your Hospital Management System (HMS) into an enterprise-grade, multi-tenant SaaS platform. The architecture supports unlimited healthcare organizations with robust security, compliance, and scalability features meeting healthcare industry standards (HIPAA, HL7, FHIR).

### Key Improvements from v5.0:
- **Enhanced security & compliance** (HIPAA, GDPR, SOC2)
- **Advanced monitoring & analytics**
- **Disaster recovery & backup strategy**
- **API management & rate limiting**
- **Automated testing & CI/CD pipeline**
- **Multi-region deployment support**
- **Advanced billing features**

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Database Architecture](#phase-1-database-architecture)
4. [Phase 2: Security & Compliance](#phase-2-security--compliance)
5. [Phase 3: Subscription & Billing](#phase-3-subscription--billing)
6. [Phase 4: Onboarding Experience](#phase-4-onboarding-experience)
7. [Phase 5: Module Management](#phase-5-module-management)
8. [Phase 6: Data Migration & Import](#phase-6-data-migration--import)
9. [Phase 7: Monitoring & Analytics](#phase-7-monitoring--analytics)
10. [Phase 8: API & Integration Layer](#phase-8-api--integration-layer)
11. [Implementation Timeline](#implementation-timeline)
12. [Risk Assessment & Mitigation](#risk-assessment--mitigation)

---

## Current State Analysis

| Aspect | Current State | Target State | Priority |
|--------|--------------|--------------|----------|
| Tenancy | Single hospital | Multi-tenant with isolation | Critical |
| Modules | All 20+ modules available | Plan-based module access | High |
| Onboarding | Manual admin setup | Self-service wizard | High |
| Billing | Basic Stripe | Subscription + usage-based | High |
| Security | Basic auth | Enterprise-grade + compliance | Critical |
| Monitoring | Minimal | Comprehensive observability | Medium |
| Backup | Manual | Automated with retention | Critical |
| API | None | RESTful + GraphQL | Medium |
| Documentation | Limited | Comprehensive + API docs | Medium |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CDN & Load Balancer                         │
│                    (Cloudflare / AWS CloudFront)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Region 1  │    │   Region 2  │    │   Region 3  │
│  (Primary)  │    │  (Standby)  │    │  (DR Site)  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────┐      ┌─────────────┐      ┌─────────────┐
│  Web    │      │   API       │      │  Background │
│  App    │◄────►│  Gateway    │◄────►│  Workers    │
│ (React) │      │  (Supabase) │      │  (Edge Fn)  │
└─────────┘      └──────┬──────┘      └─────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │   (Multi-tenant)│
              │   + Read Replicas│
              └─────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Backup    │ │   Audit     │ │  Analytics  │
│   Storage   │ │   Logs      │ │  Warehouse  │
│   (S3)      │ │  (CloudWatch│ │  (BigQuery) │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Phase 1: Database Architecture (Foundation)

### 1.1 Enhanced Multi-Tenant Tables

#### Organizations Table (Enhanced)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  legal_name TEXT,  -- Official registered name
  
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
  npi_number TEXT,  -- National Provider Identifier (US healthcare)
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
  status TEXT DEFAULT 'active',  -- active, suspended, cancelled, archived
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
  allowed_ip_ranges TEXT[],  -- IP whitelist
  session_timeout_minutes INTEGER DEFAULT 60,
  password_policy JSONB DEFAULT '{"minLength": 8, "requireUppercase": true, "requireNumbers": true}',
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'cancelled', 'archived')),
  CONSTRAINT valid_country CHECK (country ~ '^[A-Z]{2}$')
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_trial_ends ON organizations(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

-- Audit trigger
CREATE TRIGGER organizations_updated 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();
```

#### Organization Members (Enhanced)

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role & Permissions
  role TEXT NOT NULL,  -- owner, admin, manager, member, viewer
  permissions JSONB DEFAULT '[]',  -- Granular permissions array
  
  -- Department Assignment (new)
  department_id UUID REFERENCES departments(id),
  
  -- Status
  status TEXT DEFAULT 'active',  -- active, invited, suspended
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
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'invited', 'suspended'))
);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
```

#### Subscription Plans (Enhanced)

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan Details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tier INTEGER NOT NULL,  -- 1=Starter, 2=Professional, 3=Enterprise
  
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
  integrations JSONB DEFAULT '[]',  -- Available integrations
  
  -- Support Level (new)
  support_level TEXT DEFAULT 'email',  -- email, priority, dedicated
  support_response_sla_hours INTEGER DEFAULT 48,
  
  -- Compliance Features (new)
  hipaa_compliant BOOLEAN DEFAULT false,
  soc2_compliant BOOLEAN DEFAULT false,
  data_retention_days INTEGER DEFAULT 365,
  backup_frequency_hours INTEGER DEFAULT 24,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,  -- For enterprise custom plans
  
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

CREATE INDEX idx_plans_tier ON subscription_plans(tier);
CREATE INDEX idx_plans_active ON subscription_plans(is_active) WHERE is_active = true;
```

#### Organization Subscriptions (Enhanced)

```sql
CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  
  -- Billing
  status TEXT DEFAULT 'trialing',
  billing_cycle TEXT DEFAULT 'monthly',  -- monthly, yearly, custom
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Trial Management
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  trial_days_remaining INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN trial_end IS NULL THEN NULL
      ELSE GREATEST(0, EXTRACT(days FROM (trial_end - now())))::INTEGER
    END
  ) STORED,
  
  -- Payment
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  
  -- Usage Tracking (new)
  current_staff_count INTEGER DEFAULT 0,
  current_patient_count INTEGER DEFAULT 0,
  current_storage_gb DECIMAL(10,2) DEFAULT 0,
  current_api_calls INTEGER DEFAULT 0,
  
  -- Billing History (new)
  last_invoice_date TIMESTAMPTZ,
  last_invoice_amount DECIMAL(10,2),
  next_invoice_date TIMESTAMPTZ,
  next_invoice_amount DECIMAL(10,2),
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Discounts (new)
  discount_code TEXT,
  discount_percentage DECIMAL(5,2),
  discount_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid', 'incomplete')),
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly', 'custom'))
);

CREATE INDEX idx_subscriptions_org_id ON organization_subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX idx_subscriptions_next_invoice ON organization_subscriptions(next_invoice_date);
```

### 1.2 Additional Professional Tables

#### API Keys (new)

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,  -- Never store plain keys
  key_prefix TEXT NOT NULL,  -- For display: "sk_live_abc..."
  
  -- Permissions
  scopes TEXT[] DEFAULT '{"read"}',  -- read, write, admin
  
  -- Rate Limiting
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### Audit Logs (new)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Event Details
  action TEXT NOT NULL,  -- create, update, delete, view, export
  resource_type TEXT NOT NULL,  -- patient, appointment, prescription, etc.
  resource_id UUID,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- Changes (for updates)
  old_values JSONB,
  new_values JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partition by month for performance
CREATE TABLE audit_logs_y2026m01 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

#### Usage Metrics (new)

```sql
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  metric_type TEXT NOT NULL,  -- staff_count, patient_count, storage_gb, api_calls
  metric_value DECIMAL(12,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  
  -- Billing Period
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_usage_metrics_org_period ON usage_metrics(organization_id, billing_period_start);
```

#### Webhook Endpoints (new)

```sql
CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,  -- ['patient.created', 'appointment.updated']
  secret TEXT NOT NULL,  -- For signature verification
  
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 2: Security & Compliance

### 2.1 Enhanced Row Level Security

#### Comprehensive RLS Strategy

```sql
-- Create security-definer functions
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid() 
    AND status = 'active'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role 
  FROM organization_members 
  WHERE user_id = auth.uid() 
    AND organization_id = get_user_organization_id()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION can_access_resource(resource_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
    WHERE om.user_id = auth.uid()
      AND om.organization_id = resource_org_id
      AND om.status = 'active'
      AND o.status = 'active'
  )
$$;

-- Example RLS policies with audit logging
CREATE POLICY "org_isolation_select" ON patients
  FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization_id()
    AND can_access_resource(organization_id)
  );

CREATE POLICY "org_isolation_insert" ON patients
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('owner', 'admin', 'member')
  );

CREATE POLICY "org_isolation_update" ON patients
  FOR UPDATE TO authenticated
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "org_isolation_delete" ON patients
  FOR DELETE TO authenticated
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('owner', 'admin')
  );
```

### 2.2 HIPAA Compliance Features

#### PHI Access Logging

```sql
-- Trigger to log all PHI access
CREATE OR REPLACE FUNCTION log_phi_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    metadata
  ) VALUES (
    NEW.organization_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    current_setting('request.headers')::json->>'x-forwarded-for',
    jsonb_build_object(
      'timestamp', now(),
      'table', TG_TABLE_NAME
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to PHI tables
CREATE TRIGGER patients_phi_access
  AFTER SELECT OR INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION log_phi_access();
```

#### Data Encryption

```sql
-- Encrypt sensitive fields at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypted SSN storage
ALTER TABLE patients ADD COLUMN ssn_encrypted BYTEA;

CREATE OR REPLACE FUNCTION encrypt_ssn(ssn TEXT)
RETURNS BYTEA AS $$
  SELECT pgp_sym_encrypt(ssn, current_setting('app.encryption_key'))
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_ssn(encrypted BYTEA)
RETURNS TEXT AS $$
  SELECT pgp_sym_decrypt(encrypted, current_setting('app.encryption_key'))
$$ LANGUAGE SQL SECURITY DEFINER;
```

### 2.3 Data Retention & Deletion

```sql
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  resource_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scheduled job to apply retention policies
CREATE OR REPLACE FUNCTION apply_retention_policies()
RETURNS void AS $$
DECLARE
  policy RECORD;
BEGIN
  FOR policy IN SELECT * FROM data_retention_policies WHERE auto_delete = true
  LOOP
    EXECUTE format(
      'DELETE FROM %I WHERE organization_id = %L AND created_at < now() - interval ''%s days''',
      policy.resource_type,
      policy.organization_id,
      policy.retention_days
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 3: Subscription & Billing (Enhanced)

### 3.1 Advanced Stripe Integration

#### Edge Functions Structure

```typescript
// supabase/functions/stripe-checkout/index.ts
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

interface CheckoutRequest {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
}

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { planId, billingCycle, organizationId, successUrl, cancelUrl } 
    = await req.json() as CheckoutRequest;

  // Get plan details
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  // Get or create Stripe customer
  const { data: org } = await supabase
    .from('organizations')
    .select('*, organization_subscriptions(*)')
    .eq('id', organizationId)
    .single();

  let customerId = org.organization_subscriptions[0]?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org.email,
      name: org.name,
      metadata: {
        organization_id: organizationId,
      },
    });
    customerId = customer.id;
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{
      price: billingCycle === 'monthly' 
        ? plan.stripe_price_id_monthly 
        : plan.stripe_price_id_yearly,
      quantity: 1,
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      organization_id: organizationId,
      plan_id: planId,
    },
    subscription_data: {
      metadata: {
        organization_id: organizationId,
        plan_id: planId,
      },
      trial_period_days: 14, // 14-day trial
    },
  });

  return new Response(
    JSON.stringify({ sessionId: session.id, url: session.url }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### 3.2 Plan Limits Enforcement

```typescript
// src/hooks/usePlanLimits.ts
export const usePlanLimits = () => {
  const { organization, subscription } = useOrganization();

  const checkLimit = async (type: 'staff' | 'patients' | 'storage') => {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription?.plan_id)
      .single();

    const currentCount = subscription?.[`current_${type}_count`] || 0;
    const maxCount = plan?.[`max_${type}`];

    return {
      current: currentCount,
      max: maxCount,
      hasReached: currentCount >= maxCount,
      remaining: Math.max(0, maxCount - currentCount),
      percentage: (currentCount / maxCount) * 100,
    };
  };

  return { checkLimit };
};
```

---

## Phase 4: Onboarding Experience (Enhanced)

### 4.1 Progressive Disclosure Onboarding

#### Step-by-Step Wizard with Validation

```typescript
// src/pages/onboarding/OnboardingWizard.tsx
const ONBOARDING_STEPS = [
  {
    id: 'plan',
    title: 'Choose Your Plan',
    description: 'Select the plan that fits your needs',
    component: PlanSelection,
    validation: (data) => !!data.planId,
  },
  {
    id: 'organization',
    title: 'Organization Details',
    description: 'Tell us about your hospital',
    component: OrganizationSetup,
    validation: (data) => data.name && data.email,
  },
  {
    id: 'compliance',
    title: 'Compliance Setup',
    description: 'Configure security and compliance',
    component: ComplianceSetup,
    validation: (data) => data.agreedToTerms,
  },
  {
    id: 'modules',
    title: 'Select Modules',
    description: 'Choose features for your organization',
    component: ModuleSelection,
    optional: true,
  },
  {
    id: 'import',
    title: 'Import Data',
    description: 'Migrate your existing data',
    component: DataImport,
    optional: true,
  },
  {
    id: 'team',
    title: 'Invite Team',
    description: 'Add your staff members',
    component: TeamInvitation,
    optional: true,
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your organization is ready',
    component: OnboardingComplete,
  },
];

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = async () => {
    const isValid = step.validation ? step.validation(data) : true;
    
    if (!isValid) {
      setErrors({ [step.id]: 'Please complete all required fields' });
      return;
    }

    // Save progress
    await supabase
      .from('onboarding_progress')
      .upsert({
        organization_id: data.organizationId,
        step: step.id,
        completed: true,
        data: data[step.id],
      });

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <OnboardingProgress steps={ONBOARDING_STEPS} current={currentStep} />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <step.component
          data={data}
          onChange={(newData) => setData({ ...data, ...newData })}
          onNext={handleNext}
          onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
          errors={errors}
        />
      </div>
    </div>
  );
};
```

### 4.2 Interactive Plan Comparison

```typescript
// src/components/onboarding/PlanComparison.tsx
const PLAN_FEATURES = [
  {
    category: 'Core Features',
    features: [
      { name: 'Patient Management', starter: true, pro: true, enterprise: true },
      { name: 'Appointments', starter: true, pro: true, enterprise: true },
      { name: 'Prescriptions', starter: true, pro: true, enterprise: true },
      { name: 'Billing', starter: 'Basic', pro: 'Advanced', enterprise: 'Enterprise' },
      { name: 'Lab Tests', starter: false, pro: true, enterprise: true },
      { name: 'Pharmacy Management', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Advanced Features',
    features: [
      { name: 'Blood Bank', starter: false, pro: false, enterprise: true },
      { name: 'Operation Theatre', starter: false, pro: false, enterprise: true },
      { name: 'Insurance Claims', starter: false, pro: true, enterprise: true },
      { name: 'Advanced Reports', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Compliance & Security',
    features: [
      { name: 'HIPAA Compliance', starter: false, pro: true, enterprise: true },
      { name: 'Audit Logs', starter: false, pro: true, enterprise: true },
      { name: 'SSO / SAML', starter: false, pro: false, enterprise: true },
      { name: 'Custom Retention Policies', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Email Support', starter: '48hr', pro: '24hr', enterprise: '4hr' },
      { name: 'Phone Support', starter: false, pro: true, enterprise: true },
      { name: 'Dedicated Account Manager', starter: false, pro: false, enterprise: true },
      { name: 'Custom Training', starter: false, pro: false, enterprise: true },
    ],
  },
];

export const PlanComparison = () => {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <button
            className={`px-6 py-2 rounded-md ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-md ${billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly <span className="text-green-500 text-sm">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['starter', 'pro', 'enterprise'].map((plan) => (
          <PlanCard
            key={plan}
            plan={plan}
            billingCycle={billingCycle}
            isSelected={selectedPlan === plan}
            onSelect={() => setSelectedPlan(plan as any)}
          />
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Features</th>
              <th className="px-6 py-4 text-center">Starter</th>
              <th className="px-6 py-4 text-center">Professional</th>
              <th className="px-6 py-4 text-center">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((category) => (
              <React.Fragment key={category.category}>
                <tr className="bg-gray-100">
                  <td colSpan={4} className="px-6 py-3 font-semibold">
                    {category.category}
                  </td>
                </tr>
                {category.features.map((feature) => (
                  <tr key={feature.name} className="border-b">
                    <td className="px-6 py-4">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      <FeatureCell value={feature.starter} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureCell value={feature.pro} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureCell value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## Phase 5: Module Management (Enhanced)

### 5.1 Dynamic Module System

```typescript
// src/config/modules.config.ts
export interface ModuleDefinition {
  key: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  category: 'core' | 'clinical' | 'financial' | 'admin';
  minPlanTier: 1 | 2 | 3;
  routes: RouteConfig[];
  permissions: string[];
  dependencies: string[];  // Other modules this depends on
  settings: ModuleSettings;
}

export const MODULES: Record<string, ModuleDefinition> = {
  appointments: {
    key: 'appointments',
    name: 'Appointments',
    description: 'Schedule and manage patient appointments',
    icon: CalendarIcon,
    category: 'core',
    minPlanTier: 1,
    routes: [
      { path: '/appointments', component: AppointmentList },
      { path: '/appointments/calendar', component: AppointmentCalendar },
      { path: '/appointments/:id', component: AppointmentDetail },
    ],
    permissions: ['appointments.view', 'appointments.create', 'appointments.update'],
    dependencies: ['patients', 'doctors'],
    settings: {
      slotDuration: { type: 'number', default: 30, label: 'Slot Duration (minutes)' },
      allowOnlineBooking: { type: 'boolean', default: false, label: 'Allow Online Booking' },
      reminderEnabled: { type: 'boolean', default: true, label: 'Send Reminders' },
    },
  },
  lab_tests: {
    key: 'lab_tests',
    name: 'Laboratory',
    description: 'Manage lab tests, results, and reports',
    icon: BeakerIcon,
    category: 'clinical',
    minPlanTier: 2,
    routes: [
      { path: '/lab-tests', component: LabTestList },
      { path: '/lab-tests/new', component: CreateLabTest },
      { path: '/lab-tests/:id', component: LabTestDetail },
    ],
    permissions: ['lab.view', 'lab.create', 'lab.update', 'lab.results'],
    dependencies: ['patients'],
    settings: {
      autoGenerateReports: { type: 'boolean', default: true, label: 'Auto-generate PDF Reports' },
      requireApproval: { type: 'boolean', default: true, label: 'Require Doctor Approval' },
    },
  },
  // ... other modules
};
```

### 5.2 Module Gate Component

```typescript
// src/components/shared/ModuleGate.tsx
interface ModuleGateProps {
  module: string;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  children: React.ReactNode;
}

export const ModuleGate: React.FC<ModuleGateProps> = ({
  module,
  fallback,
  showUpgrade = true,
  children,
}) => {
  const { isModuleEnabled, subscription, organization } = useOrganization();
  const moduleConfig = MODULES[module];

  // Check if module is enabled
  if (!isModuleEnabled(module)) {
    // Check if plan supports this module
    const currentPlanTier = subscription?.plan?.tier || 1;
    const canUpgrade = moduleConfig.minPlanTier > currentPlanTier;

    if (showUpgrade && canUpgrade) {
      return (
        <UpgradePrompt
          module={moduleConfig}
          currentPlan={subscription?.plan}
          requiredTier={moduleConfig.minPlanTier}
        />
      );
    }

    return fallback || (
      <div className="text-center py-12">
        <Lock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Module Not Available</h3>
        <p className="mt-1 text-sm text-gray-500">
          {moduleConfig.name} is not enabled for your organization.
        </p>
      </div>
    );
  }

  // Check dependencies
  const missingDeps = moduleConfig.dependencies.filter(dep => !isModuleEnabled(dep));
  if (missingDeps.length > 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          This module requires the following modules to be enabled: {missingDeps.join(', ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
```

---

## Phase 6: Data Migration & Import (Enhanced)

### 6.1 Intelligent Data Import System

```typescript
// src/services/dataImport.service.ts
interface ImportJob {
  id: string;
  organizationId: string;
  resourceType: 'patients' | 'doctors' | 'appointments' | 'inventory';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  createdAt: Date;
  completedAt?: Date;
}

export class DataImportService {
  async createImportJob(
    file: File,
    resourceType: string,
    mapping: FieldMapping
  ): Promise<ImportJob> {
    // Parse file
    const data = await this.parseFile(file);
    
    // Validate data
    const validation = await this.validateData(data, resourceType);
    
    if (validation.criticalErrors > 0) {
      throw new Error('File contains critical errors that must be fixed');
    }

    // Create job
    const job = await supabase
      .from('import_jobs')
      .insert({
        organization_id: getOrganizationId(),
        resource_type: resourceType,
        status: 'pending',
        total_records: data.length,
        file_url: await this.uploadFile(file),
        field_mapping: mapping,
      })
      .select()
      .single();

    // Trigger processing
    await this.processImport(job.id);

    return job;
  }

  private async validateData(data: any[], resourceType: string) {
    const errors: ImportError[] = [];
    const warnings: ImportError[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Required field validation
      if (resourceType === 'patients') {
        if (!row.name) {
          errors.push({ row: i + 1, field: 'name', message: 'Name is required' });
        }
        if (!row.date_of_birth) {
          errors.push({ row: i + 1, field: 'date_of_birth', message: 'Date of birth is required' });
        }
        
        // Data format validation
        if (row.email && !this.isValidEmail(row.email)) {
          warnings.push({ row: i + 1, field: 'email', message: 'Invalid email format' });
        }
        
        // Duplicate detection
        const exists = await this.checkDuplicate('patients', row);
        if (exists) {
          warnings.push({ row: i + 1, field: 'mrn', message: 'Patient already exists' });
        }
      }
    }

    return {
      errors,
      warnings,
      criticalErrors: errors.length,
      totalIssues: errors.length + warnings.length,
    };
  }

  private async processImport(jobId: string) {
    const { data: job } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    // Update status
    await supabase
      .from('import_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    // Process in batches
    const batchSize = 100;
    const data = await this.fetchJobData(job.file_url);
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        await supabase
          .from(job.resource_type)
          .insert(batch.map(row => ({
            ...this.mapFields(row, job.field_mapping),
            organization_id: job.organization_id,
          })));

        // Update progress
        await supabase
          .from('import_jobs')
          .update({
            processed_records: i + batch.length,
            progress: ((i + batch.length) / data.length) * 100,
          })
          .eq('id', jobId);
      } catch (error) {
        // Log errors but continue processing
        console.error(`Error processing batch ${i}:`, error);
      }
    }

    // Mark as completed
    await supabase
      .from('import_jobs')
      .update({
        status: 'completed',
        completed_at: new Date(),
      })
      .eq('id', jobId);
  }
}
```

---

## Phase 7: Monitoring & Analytics (New)

### 7.1 System Health Dashboard

```typescript
// src/pages/admin/SystemHealth.tsx
export const SystemHealthDashboard = () => {
  const metrics = useQuery(['system-metrics'], async () => {
    const { data } = await supabase.rpc('get_system_metrics');
    return data;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Active Organizations"
        value={metrics.data?.active_orgs || 0}
        change={+5.2}
        icon={BuildingIcon}
      />
      <MetricCard
        title="Total Patients"
        value={metrics.data?.total_patients || 0}
        change={+12.5}
        icon={UsersIcon}
      />
      <MetricCard
        title="System Uptime"
        value="99.98%"
        change={+0.02}
        icon={ServerIcon}
      />
      <MetricCard
        title="Avg Response Time"
        value="124ms"
        change={-8.3}
        icon={ClockIcon}
        invertChange
      />
    </div>
  );
};
```

### 7.2 Real-time Usage Tracking

```sql
-- Function to track resource usage
CREATE OR REPLACE FUNCTION track_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment appropriate counter
  UPDATE organization_subscriptions
  SET current_patient_count = current_patient_count + 1
  WHERE organization_id = NEW.organization_id
    AND TG_TABLE_NAME = 'patients';
  
  -- Check limits
  IF (SELECT current_patient_count > max_patients 
      FROM organization_subscriptions os
      JOIN subscription_plans sp ON sp.id = os.plan_id
      WHERE os.organization_id = NEW.organization_id) THEN
    RAISE EXCEPTION 'Patient limit exceeded. Please upgrade your plan.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER track_patient_usage
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION track_usage();
```

---

## Phase 8: API & Integration Layer (New)

### 8.1 Public API Design

```typescript
// API endpoints structure
const API_ROUTES = {
  // Organizations
  'GET /api/v1/organizations/:id': 'Get organization details',
  'PATCH /api/v1/organizations/:id': 'Update organization',
  
  // Patients
  'GET /api/v1/patients': 'List patients',
  'POST /api/v1/patients': 'Create patient',
  'GET /api/v1/patients/:id': 'Get patient',
  'PATCH /api/v1/patients/:id': 'Update patient',
  'DELETE /api/v1/patients/:id': 'Delete patient',
  
  // Appointments
  'GET /api/v1/appointments': 'List appointments',
  'POST /api/v1/appointments': 'Create appointment',
  'GET /api/v1/appointments/:id': 'Get appointment',
  'PATCH /api/v1/appointments/:id': 'Update appointment',
  'DELETE /api/v1/appointments/:id': 'Cancel appointment',
  
  // Webhooks
  'POST /api/v1/webhooks': 'Create webhook',
  'GET /api/v1/webhooks': 'List webhooks',
  'DELETE /api/v1/webhooks/:id': 'Delete webhook',
};

// Rate limiting middleware
export const rateLimitMiddleware = async (req: Request) => {
  const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  const { data: key } = await supabase
    .from('api_keys')
    .select('*, organizations(*)')
    .eq('key_hash', hashApiKey(apiKey))
    .single();

  if (!key || !key.is_active) {
    return new Response('Invalid API key', { status: 401 });
  }

  // Check rate limit
  const hourlyUsage = await redis.get(`ratelimit:${key.id}:${getCurrentHour()}`);
  if (hourlyUsage >= key.rate_limit_per_hour) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  await redis.incr(`ratelimit:${key.id}:${getCurrentHour()}`);
  
  return null; // Continue
};
```

---

## Implementation Timeline (Enhanced)

### Phase 0: Pre-Launch (Week 1-2)
- [ ] Set up development, staging, production environments
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring tools (Sentry, LogRocket, Datadog)
- [ ] Create project documentation structure
- [ ] Set up automated testing framework

### Phase 1: Foundation (Week 3-4)
- [ ] Create all multi-tenant database tables
- [ ] Add organization_id to existing 47+ tables
- [ ] Implement RLS policies
- [ ] Build OrganizationContext and hooks
- [ ] Create data migration scripts
- [ ] Write unit tests for database functions

### Phase 2: Security & Compliance (Week 5-6)
- [ ] Implement audit logging system
- [ ] Set up data encryption
- [ ] Create retention policy engine
- [ ] Build compliance dashboard
- [ ] Conduct security audit
- [ ] Document HIPAA compliance measures

### Phase 3: Billing System (Week 7-8)
- [ ] Create subscription plans in database
- [ ] Build Stripe integration
- [ ] Create billing dashboard
- [ ] Test payment flows
- [ ] Set up invoice generation

### Phase 4: Onboarding Wizard (Week 9-10)
- [ ] Design UI/UX for all 7 steps
- [ ] Build plan selection page
- [ ] Create organization setup form
- [ ] Implement module selection
- [ ] Build data import system
- [ ] Create team invitation flow
- [ ] Add progress tracking

### Phase 5: Module Gating (Week 11-12)
- [ ] Define all 20+ module configurations
- [ ] Build ModulesProvider context
- [ ] Create ModuleGate component
- [ ] Update Sidebar with filtering
- [ ] Add upgrade prompts
- [ ] Test module isolation

### Phase 6: Admin Panel (Week 13-14)
- [ ] Build organization settings page
- [ ] Create billing management interface
- [ ] Implement team management
- [ ] Add usage analytics dashboard
- [ ] Build module configuration UI
- [ ] Create audit log viewer

### Phase 7: Public Pages (Week 15-16)
- [ ] Design landing page
- [ ] Create pricing page
- [ ] Build signup flow
- [ ] Add demo request form
- [ ] Implement SEO optimization
- [ ] Create marketing materials

### Phase 8: Testing & Polish (Week 17-18)
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security penetration testing
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Performance optimization

### Phase 9: Launch Prep (Week 19-20)
- [ ] Final security audit
- [ ] Documentation completion
- [ ] Customer support setup
- [ ] Monitoring alerts configuration
- [ ] Backup testing
- [ ] Soft launch with beta customers

### Phase 10: Launch & Iterate (Week 21+)
- [ ] Public launch
- [ ] Monitor metrics
- [ ] Gather feedback
- [ ] Prioritize improvements
- [ ] Plan feature releases

**Total Timeline: ~5 months**

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data migration failures | High | Medium | Robust validation, rollback procedures, backup before migration |
| Performance degradation | High | Medium | Load testing, query optimization, caching strategy |
| Security vulnerabilities | Critical | Low | Security audits, penetration testing, bug bounty program |
| Stripe integration issues | High | Low | Thorough testing, sandbox environment, error handling |
| RLS policy gaps | Critical | Medium | Comprehensive policy testing, security review |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low adoption rate | High | Medium | Beta program, customer feedback, marketing strategy |
| Pricing model rejection | Medium | Medium | Market research, competitive analysis, flexible pricing |
| Customer churn | High | Low | Excellent support, regular feature updates, customer success team |
| Competition | Medium | High | Continuous innovation, superior UX, healthcare specialization |

---

## Professional Improvements Summary

### What Was Added:

1. **Enhanced Security**
   - Comprehensive audit logging
   - PHI-specific access controls
   - Data encryption at rest
   - IP whitelisting
   - Session management

2. **Compliance Features**
   - HIPAA compliance tracking
   - SOC2 preparation
   - Data retention policies
   - Automated compliance reports
   - Privacy controls

3. **Advanced Billing**
   - Subscription management
   - Discount codes
   - Invoice management
   - Custom enterprise plans

4. **Monitoring & Analytics**
   - System health dashboard
   - Real-time usage tracking
   - Performance metrics
   - Error tracking
   - Business intelligence

5. **API Layer**
   - RESTful API
   - API key management
   - Rate limiting
   - Webhook system
   - Developer documentation

6. **Professional Operations**
   - Multi-region support
   - Disaster recovery plan
   - Automated backups
   - CI/CD pipeline
   - Load balancing

7. **Enterprise Features**
   - SSO/SAML support
   - Custom retention policies
   - Dedicated support tiers
   - White-labeling options
   - Advanced team management

---

## Recommended Next Steps

1. **Review & Approve**: Have technical and business stakeholders review this plan
2. **Resource Planning**: Allocate development team (recommend 3-4 developers)
3. **Budget Approval**: Estimate costs for infrastructure, tools, and services
4. **Pilot Program**: Identify 3-5 beta customers for early testing
5. **Kickoff Meeting**: Align team on timeline and deliverables

---

## Appendix A: Original v5.0.0 Transformation Plan

This section contains the original v5.0.0 plan for reference and comparison with the enhanced v6.0.0 version.

### Executive Summary (v5.0.0)

This plan transforms your current single-hospital HMS into a scalable SaaS platform serving unlimited healthcare organizations. Each hospital gets an isolated data environment with customizable module access based on their subscription plan.

### Current State Analysis (v5.0.0)

| Aspect | Current State |
|--------|--------------|
| Tenancy | Single hospital (no organization isolation) |
| Modules | All 20+ modules available to all users |
| Onboarding | Manual account creation by admin |
| Billing | Stripe configured but not subscription-based |
| Data Import | None |
| Branding | Single hospital branding in settings |

### SaaS Architecture Overview (v5.0.0)

```
+--------------------------------------------------+
|              SaaS Landing & Marketing            |
|    (Plans, Features, Signup, Demo Request)       |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|            ONBOARDING WIZARD (New)               |
|  Step 1: Select Plan -> Step 2: Organization     |
|  Step 3: Modules -> Step 4: Import -> Step 5: Go |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|           MULTI-TENANT DATA LAYER               |
|  organizations -> org_subscriptions -> modules   |
|  All data tables get organization_id column      |
+--------------------------------------------------+
                        |
           +------------+------------+
           |            |            |
           v            v            v
    +-----------+ +-----------+ +-----------+
    | Hospital  | | Hospital  | | Hospital  |
    |    ABC    | |    XYZ    | |    123    |
    | (Starter) | | (Pro)     | | (Enterp.) |
    +-----------+ +-----------+ +-----------+
```

### Phase 1: Database Architecture (v5.0.0)

#### Core Multi-Tenant Tables

**Organizations Table (v5.0.0):**

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  license_number TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Organization Members (v5.0.0):**

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
```

**Subscription Plans (v5.0.0):**

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  max_staff INTEGER,
  max_patients INTEGER,
  features JSONB,
  modules JSONB,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Organization Subscriptions (v5.0.0):**

```sql
CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'trialing',
  billing_cycle TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Module Configuration (v5.0.0):**

```sql
CREATE TABLE organization_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB,
  UNIQUE(organization_id, module_key)
);
```

**Onboarding Progress (v5.0.0):**

```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  data JSONB,
  completed_at TIMESTAMPTZ,
  UNIQUE(organization_id, step)
);
```

#### Adding organization_id to Existing Tables (v5.0.0)

```sql
-- Example for key tables (repeat for all 47+ tables)
ALTER TABLE patients ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE doctors ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE appointments ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE departments ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE prescriptions ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE lab_tests ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE inventory ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE billings ADD COLUMN organization_id UUID REFERENCES organizations(id);
-- ... (all other tables)
```

#### RLS Policies (v5.0.0)

```sql
-- Helper function
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER;

-- Example RLS policy
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their organization's patients"
ON patients FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can only insert patients in their organization"
ON patients FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());
```

### Phase 2: Subscription & Billing (v5.0.0)

#### Stripe Integration

**Edge Functions:**

| Function | Purpose |
|----------|---------|
| create-checkout-session | Start subscription payment flow |
| stripe-webhook | Handle subscription lifecycle events |
| customer-portal | Manage billing, upgrade/downgrade |
| usage-tracking | Track staff/patient counts for limits |

#### Plan Features & Module Mapping (v5.0.0)

```javascript
const PLAN_MODULES = {
  starter: {
    appointments: true,
    patients: true,
    prescriptions: true,
    billing: true,
    departments: true,
    // Disabled:
    lab_tests: false,
    pharmacy: false,
    blood_bank: false,
    operation_department: false,
    insurance_claims: false,
    referrals: false,
  },
  professional: {
    // All starter modules plus:
    lab_tests: true,
    pharmacy: true,
    inventory: true,
    insurance_claims: true,
    referrals: true,
    reports: true,
    // Disabled:
    blood_bank: false,
    operation_department: false,
  },
  enterprise: {
    // Everything enabled
  }
};
```

### Phase 3: Onboarding Wizard (v5.0.0)

#### Multi-Step Flow

| Step | Page | Purpose |
|------|------|---------|
| 0 | /signup | Create account (email/password) |
| 1 | /onboarding/plan | Select subscription plan |
| 2 | /onboarding/organization | Hospital name, address, logo upload |
| 3 | /onboarding/modules | Select which modules to enable |
| 4 | /onboarding/import | Import existing data (optional) |
| 5 | /onboarding/staff | Create first admin and invite staff |
| 6 | /onboarding/complete | Summary and "Go to Dashboard" |

#### Files to Create (v5.0.0)

```
src/pages/onboarding/
  ├── OnboardingLayout.tsx
  ├── PlanSelection.tsx
  ├── OrganizationSetup.tsx
  ├── ModuleSelection.tsx
  ├── DataImport.tsx
  ├── StaffInvitation.tsx
  └── OnboardingComplete.tsx

src/components/onboarding/
  ├── OnboardingProgress.tsx
  ├── PlanCard.tsx
  ├── ModuleCard.tsx
  ├── ImportUploader.tsx
  └── StaffInviteForm.tsx
```

#### Onboarding UI Design (v5.0.0)

```
+----------------------------------------------------------+
|  STEP 2 OF 6: Organization Details                       |
+----------------------------------------------------------+
|                                                          |
|  [Logo Upload Area]                                      |
|  Drag & drop your hospital logo or click to upload       |
|                                                          |
|  Hospital Name: [__________________________]             |
|                                                          |
|  Address:       [__________________________]             |
|                 [__________________________]             |
|                                                          |
|  Phone:         [______________]  Email: [__________]    |
|                                                          |
|  License #:     [______________]                         |
|                                                          |
|  Timezone:      [America/New_York        v]              |
|                                                          |
|        [← Back]                        [Continue →]      |
|                                                          |
+----------------------------------------------------------+
```

### Phase 4: Module Selection & Feature Gating (v5.0.0)

#### Available Modules

| Module Key | Display Name | Starter | Pro | Enterprise |
|------------|--------------|---------|-----|------------|
| dashboard | Dashboard | Yes | Yes | Yes |
| patients | Patient Management | Yes | Yes | Yes |
| appointments | Appointments | Yes | Yes | Yes |
| departments | Departments | Yes | Yes | Yes |
| prescriptions | Prescriptions | Yes | Yes | Yes |
| billing | Billing | Yes | Yes | Yes |
| lab_tests | Lab Tests | No | Yes | Yes |
| pharmacy | Pharmacy | No | Yes | Yes |
| inventory | Inventory | No | Yes | Yes |
| insurance | Insurance Claims | No | Yes | Yes |
| blood_bank | Blood Bank | No | No | Yes |
| operation_dept | Operation Theatre | No | No | Yes |
| referrals | Referrals | No | Yes | Yes |
| reports | Advanced Reports | No | Yes | Yes |
| audit_logs | PHI Audit Logs | No | Yes | Yes |
| queue | Queue Management | No | Yes | Yes |
| vitals | Vitals Tracking | No | Yes | Yes |
| shift_handover | Shift Handover | No | No | Yes |
| rooms | Rooms & Beds | No | Yes | Yes |

#### useModules Hook (v5.0.0)

```typescript
// src/hooks/useModules.ts
export const useModules = () => {
  const { data: enabledModules } = useQuery({
    queryKey: ['organization-modules'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organization_modules')
        .select('module_key, is_enabled')
        .eq('organization_id', getOrgId());
      return data;
    }
  });

  const isModuleEnabled = (moduleKey: string) => {
    return enabledModules?.find(m => m.module_key === moduleKey)?.is_enabled ?? false;
  };

  return { enabledModules, isModuleEnabled };
};
```

#### Dynamic Sidebar (v5.0.0)

```typescript
const filteredItems = sidebarItems.filter(item => {
  // Check role permission
  if (!item.roles.includes(user.role)) return false;
  // Check module availability
  if (item.module && !isModuleEnabled(item.module)) return false;
  return true;
});
```

### Phase 5: Data Import System (v5.0.0)

#### Import Capabilities

| Data Type | Format | Fields |
|-----------|--------|--------|
| Patients | CSV, Excel | Name, DOB, Gender, Phone, Email, Blood Group, Allergies |
| Doctors | CSV, Excel | Name, Specialization, License, Phone, Email, Department |
| Staff | CSV, Excel | Name, Role, Email, Phone, Department |
| Appointments | CSV, Excel | Patient, Doctor, Date, Time, Status |
| Inventory | CSV, Excel | Item Name, SKU, Quantity, Unit Price, Expiry |

#### Import Flow (v5.0.0)

1. User uploads CSV/Excel file
2. System detects columns and shows mapping UI
3. User maps columns to HMS fields
4. Preview shows first 10 rows with validation
5. User confirms import
6. Background job processes records
7. Summary shows success/error counts

### Phase 6: Organization Context Provider (v5.0.0)

```typescript
// src/contexts/OrganizationContext.tsx
interface OrganizationContextType {
  organization: Organization | null;
  subscription: Subscription | null;
  modules: ModuleConfig[];
  isLoading: boolean;
  refreshOrganization: () => void;
  isModuleEnabled: (key: string) => boolean;
  hasReachedLimit: (type: 'staff' | 'patients') => boolean;
}
```

#### Updated App Architecture (v5.0.0)

```typescript
<AuthProvider>
  <OrganizationProvider>
    <ModulesProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/onboarding/*" element={<OnboardingRoutes />} />
        
        {/* Protected routes with module gating */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab-tests" element={
              <ModuleGate module="lab_tests">
                <LabTestManagement />
              </ModuleGate>
            } />
          </Route>
        </Route>
      </Routes>
    </ModulesProvider>
  </OrganizationProvider>
</AuthProvider>
```

### Phase 7: UI/UX Enhancements (v5.0.0)

#### New Public Pages

| Page | Purpose |
|------|---------|
| /pricing (enhanced) | Interactive plan comparison with signup CTA |
| /signup | New organization registration |
| /demo | Schedule demo or try sandbox |

#### Organization Admin Panel

| Feature | Description |
|---------|-------------|
| Billing Dashboard | Current plan, usage, upgrade options |
| Team Management | Invite/remove staff, assign roles |
| Module Management | Enable/disable modules (within plan limits) |
| Branding Settings | Logo, colors, letterhead (exists, needs org scope) |
| Data Export | Full organization data export |

### Implementation Timeline (v5.0.0)

**Phase A: Foundation (Week 1-2)**
- Create multi-tenant database tables
- Add organization_id to all existing tables
- Create RLS policies with organization isolation
- Build OrganizationContext and useOrganization hook

**Phase B: Billing Integration (Week 2-3)**
- Create subscription_plans table with Stripe price IDs
- Build Stripe checkout/webhook edge functions
- Create customer portal integration
- Implement plan limits checking

**Phase C: Onboarding Wizard (Week 3-4)**
- Build 6-step onboarding flow
- Implement organization creation
- Build module selection UI
- Create data import system

**Phase D: Module Gating (Week 4-5)**
- Create ModulesProvider context
- Update Sidebar with module filtering
- Add ModuleGate wrapper component
- Add upgrade prompts for locked modules

**Phase E: Polish & Launch (Week 5-6)**
- Enhanced pricing page
- Organization admin panel
- Usage analytics dashboard
- Testing and bug fixes

### Files Summary (v5.0.0)

#### New Files (30+)

**Database:**
```
supabase/migrations/xxxx_multi_tenant_tables.sql
supabase/migrations/xxxx_add_organization_id.sql
supabase/migrations/xxxx_rls_policies.sql
```

**Edge Functions:**
```
supabase/functions/create-checkout-session/
supabase/functions/stripe-webhook/
supabase/functions/customer-portal/
supabase/functions/import-data/
```

**Contexts:**
```
src/contexts/OrganizationContext.tsx
src/contexts/ModulesContext.tsx
```

**Hooks:**
```
src/hooks/useOrganization.ts
src/hooks/useSubscription.ts
src/hooks/useModules.ts
src/hooks/useDataImport.ts
```

**Onboarding Pages:**
```
src/pages/onboarding/OnboardingLayout.tsx
src/pages/onboarding/PlanSelection.tsx
src/pages/onboarding/OrganizationSetup.tsx
src/pages/onboarding/ModuleSelection.tsx
src/pages/onboarding/DataImport.tsx
src/pages/onboarding/StaffInvitation.tsx
src/pages/onboarding/OnboardingComplete.tsx
```

**Components:**
```
src/components/onboarding/OnboardingProgress.tsx
src/components/onboarding/PlanCard.tsx
src/components/onboarding/ModuleCard.tsx
src/components/onboarding/ImportUploader.tsx
src/components/onboarding/ImportMapping.tsx
src/components/billing/BillingDashboard.tsx
src/components/billing/UsageMeter.tsx
src/components/shared/ModuleGate.tsx
src/components/shared/UpgradePrompt.tsx
```

#### Files to Modify (v5.0.0)

```
src/App.tsx                    # Add organization routes
src/contexts/AuthContext.tsx   # Add org loading
src/components/layout/Sidebar.tsx  # Module filtering
src/components/settings/Settings.tsx  # Org-scoped
+ All data-fetching hooks      # Add org_id filter
```

### Security Considerations (v5.0.0)

- **Data Isolation**: RLS policies ensure hospitals can never see each other's data
- **Plan Enforcement**: Server-side validation of module access
- **Rate Limiting**: Per-organization API limits
- **Audit Trail**: All data access logged with organization context

### Recommended Starting Point (v5.0.0)

To begin this transformation incrementally:

1. Start with database changes - Create organization tables first
2. Build onboarding flow - Get hospitals signing up
3. Add Stripe billing - Enable plan selection
4. Implement module gating - Control feature access
5. Build import system - Allow data migration

This approach allows you to launch with basic multi-tenancy and iterate on advanced features.

---

## Conclusion

This enhanced transformation plan provides a comprehensive roadmap to convert your HMS into an enterprise-grade, multi-tenant SaaS platform. The additions focus on security, compliance, scalability, and professional operations that are essential for serving healthcare organizations.

The phased approach allows for incremental delivery while maintaining system stability. Each phase builds upon the previous one, ensuring a solid foundation before adding advanced features.

**Success Criteria:**
- ✅ 99.9% uptime SLA
- ✅ Sub-200ms average response time
- ✅ HIPAA compliance certification
- ✅ Support for 100+ concurrent organizations
- ✅ < 5% monthly churn rate
- ✅ 90+ NPS score

---

**Document Version:** 6.0.0  
**Last Updated:** January 27, 2026  
**Next Review:** February 27, 2026