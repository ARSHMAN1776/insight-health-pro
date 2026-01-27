// Multi-tenant organization types

export interface Organization {
  id: string;
  name: string;
  slug: string;
  legal_name?: string;
  email: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  license_number?: string;
  tax_id?: string;
  npi_number?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  currency: string;
  locale: string;
  date_format: string;
  status: 'active' | 'suspended' | 'cancelled' | 'archived' | 'trialing';
  trial_ends_at?: string;
  activated_at?: string;
  max_staff: number;
  max_patients: number;
  max_storage_gb: number;
  require_2fa: boolean;
  session_timeout_minutes: number;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  permissions: string[];
  status: 'active' | 'invited' | 'suspended';
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  last_active_at?: string;
  can_invite_members: boolean;
  can_manage_billing: boolean;
  can_export_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tier: number;
  price_monthly?: number;
  price_yearly?: number;
  setup_fee: number;
  max_staff?: number;
  max_patients?: number;
  max_departments?: number;
  max_storage_gb?: number;
  max_api_calls_per_month?: number;
  features: string[];
  modules: Record<string, boolean>;
  integrations: string[];
  support_level: 'email' | 'priority' | 'dedicated' | 'enterprise';
  support_response_sla_hours: number;
  hipaa_compliant: boolean;
  soc2_compliant: boolean;
  data_retention_days: number;
  is_active: boolean;
  is_public: boolean;
  is_custom: boolean;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  stripe_product_id?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id?: string;
  plan?: SubscriptionPlan;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'incomplete';
  billing_cycle: 'monthly' | 'yearly' | 'custom';
  current_period_start?: string;
  current_period_end?: string;
  trial_start?: string;
  trial_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_staff_count: number;
  current_patient_count: number;
  current_storage_gb: number;
  current_api_calls: number;
  last_invoice_date?: string;
  last_invoice_amount?: number;
  next_invoice_date?: string;
  next_invoice_amount?: number;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  cancellation_reason?: string;
  discount_code?: string;
  discount_percentage?: number;
  discount_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationModule {
  id: string;
  organization_id: string;
  module_key: string;
  is_enabled: boolean;
  settings: Record<string, unknown>;
  enabled_at?: string;
  disabled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingProgress {
  id: string;
  organization_id: string;
  step: string;
  completed: boolean;
  data: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Module configuration
export const MODULE_KEYS = [
  'dashboard',
  'patients',
  'appointments',
  'departments',
  'prescriptions',
  'billing',
  'lab_tests',
  'pharmacy',
  'inventory',
  'insurance',
  'blood_bank',
  'operation_dept',
  'referrals',
  'reports',
  'audit_logs',
  'queue',
  'vitals',
  'shift_handover',
  'rooms',
  'messages',
] as const;

export type ModuleKey = typeof MODULE_KEYS[number];

export interface ModuleDefinition {
  key: ModuleKey;
  name: string;
  description: string;
  category: 'core' | 'clinical' | 'financial' | 'admin';
  minPlanTier: 1 | 2 | 3;
  route?: string;
}

export const MODULE_DEFINITIONS: Record<ModuleKey, ModuleDefinition> = {
  dashboard: {
    key: 'dashboard',
    name: 'Dashboard',
    description: 'Overview and analytics',
    category: 'core',
    minPlanTier: 1,
    route: '/dashboard',
  },
  patients: {
    key: 'patients',
    name: 'Patient Management',
    description: 'Manage patient records and information',
    category: 'core',
    minPlanTier: 1,
    route: '/patients',
  },
  appointments: {
    key: 'appointments',
    name: 'Appointments',
    description: 'Schedule and manage appointments',
    category: 'core',
    minPlanTier: 1,
    route: '/appointments',
  },
  departments: {
    key: 'departments',
    name: 'Departments',
    description: 'Manage hospital departments',
    category: 'admin',
    minPlanTier: 1,
    route: '/departments',
  },
  prescriptions: {
    key: 'prescriptions',
    name: 'Prescriptions',
    description: 'Create and manage prescriptions',
    category: 'clinical',
    minPlanTier: 1,
    route: '/prescriptions',
  },
  billing: {
    key: 'billing',
    name: 'Billing',
    description: 'Manage invoices and payments',
    category: 'financial',
    minPlanTier: 1,
    route: '/billing',
  },
  lab_tests: {
    key: 'lab_tests',
    name: 'Laboratory',
    description: 'Manage lab tests and results',
    category: 'clinical',
    minPlanTier: 2,
    route: '/lab-tests',
  },
  pharmacy: {
    key: 'pharmacy',
    name: 'Pharmacy',
    description: 'Pharmacy and medication management',
    category: 'clinical',
    minPlanTier: 2,
    route: '/pharmacy',
  },
  inventory: {
    key: 'inventory',
    name: 'Inventory',
    description: 'Stock and supplies management',
    category: 'admin',
    minPlanTier: 2,
    route: '/inventory',
  },
  insurance: {
    key: 'insurance',
    name: 'Insurance Claims',
    description: 'Process insurance claims',
    category: 'financial',
    minPlanTier: 2,
    route: '/insurance-claims',
  },
  blood_bank: {
    key: 'blood_bank',
    name: 'Blood Bank',
    description: 'Blood inventory and donations',
    category: 'clinical',
    minPlanTier: 3,
    route: '/blood-bank',
  },
  operation_dept: {
    key: 'operation_dept',
    name: 'Operation Theatre',
    description: 'Surgery scheduling and management',
    category: 'clinical',
    minPlanTier: 3,
    route: '/operation-department',
  },
  referrals: {
    key: 'referrals',
    name: 'Referrals',
    description: 'Patient referral management',
    category: 'clinical',
    minPlanTier: 2,
    route: '/referrals',
  },
  reports: {
    key: 'reports',
    name: 'Advanced Reports',
    description: 'Analytics and reporting',
    category: 'admin',
    minPlanTier: 2,
    route: '/reports',
  },
  audit_logs: {
    key: 'audit_logs',
    name: 'Audit Logs',
    description: 'PHI access audit trail',
    category: 'admin',
    minPlanTier: 2,
    route: '/audit-logs',
  },
  queue: {
    key: 'queue',
    name: 'Queue Management',
    description: 'Patient queue and tokens',
    category: 'core',
    minPlanTier: 2,
    route: '/queue',
  },
  vitals: {
    key: 'vitals',
    name: 'Vitals Tracking',
    description: 'Patient vitals monitoring',
    category: 'clinical',
    minPlanTier: 2,
    route: '/vitals',
  },
  shift_handover: {
    key: 'shift_handover',
    name: 'Shift Handover',
    description: 'Nursing shift handovers',
    category: 'clinical',
    minPlanTier: 3,
    route: '/shift-handovers',
  },
  rooms: {
    key: 'rooms',
    name: 'Rooms & Beds',
    description: 'Room and bed management',
    category: 'admin',
    minPlanTier: 2,
    route: '/rooms',
  },
  messages: {
    key: 'messages',
    name: 'Messages',
    description: 'Patient-provider messaging',
    category: 'core',
    minPlanTier: 1,
    route: '/patient-messages',
  },
};
