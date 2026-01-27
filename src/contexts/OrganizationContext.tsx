import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Organization, 
  OrganizationMember, 
  OrganizationSubscription, 
  OrganizationModule,
  SubscriptionPlan,
  ModuleKey 
} from '@/types/organization';

interface OrganizationContextType {
  // Organization data
  organization: Organization | null;
  membership: OrganizationMember | null;
  subscription: OrganizationSubscription | null;
  plan: SubscriptionPlan | null;
  modules: OrganizationModule[];
  
  // State flags
  isLoading: boolean;
  isMultiTenantMode: boolean;
  hasOrganization: boolean;
  
  // Helper functions
  isModuleEnabled: (moduleKey: ModuleKey | string) => boolean;
  hasReachedLimit: (type: 'staff' | 'patients' | 'storage') => boolean;
  getLimitUsage: (type: 'staff' | 'patients' | 'storage') => { current: number; max: number | null; percentage: number };
  canPerformAction: (action: string) => boolean;
  
  // Refresh function
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [modules, setModules] = useState<OrganizationModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizationData = useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setMembership(null);
      setSubscription(null);
      setPlan(null);
      setModules([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch membership first to get organization_id
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        setIsLoading(false);
        return;
      }

      if (!membershipData) {
        // User has no organization - legacy/single-tenant mode
        setMembership(null);
        setOrganization(null);
        setSubscription(null);
        setPlan(null);
        setModules([]);
        setIsLoading(false);
        return;
      }

      setMembership(membershipData as OrganizationMember);

      // Fetch organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membershipData.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
      } else {
        setOrganization(orgData as Organization);
      }

      // Fetch subscription with plan
      const { data: subData, error: subError } = await supabase
        .from('organization_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('organization_id', membershipData.organization_id)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      } else if (subData) {
        const { plan: planData, ...subscriptionData } = subData;
        setSubscription(subscriptionData as OrganizationSubscription);
        setPlan(planData as SubscriptionPlan);
      }

      // Fetch enabled modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('organization_modules')
        .select('*')
        .eq('organization_id', membershipData.organization_id);

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
      } else {
        setModules((modulesData || []) as OrganizationModule[]);
      }

    } catch (error) {
      console.error('Error in fetchOrganizationData:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizationData();
  }, [fetchOrganizationData]);

  // Check if a module is enabled
  const isModuleEnabled = useCallback((moduleKey: ModuleKey | string): boolean => {
    // In single-tenant mode (no organization), all modules are enabled
    if (!organization) {
      return true;
    }

    // Check if module is explicitly enabled in organization_modules
    const moduleConfig = modules.find(m => m.module_key === moduleKey);
    if (moduleConfig) {
      return moduleConfig.is_enabled;
    }

    // Fall back to plan's module configuration
    if (plan?.modules && typeof plan.modules === 'object') {
      return (plan.modules as Record<string, boolean>)[moduleKey] ?? false;
    }

    return false;
  }, [organization, modules, plan]);

  // Check if organization has reached a limit
  const hasReachedLimit = useCallback((type: 'staff' | 'patients' | 'storage'): boolean => {
    // In single-tenant mode, no limits
    if (!organization || !subscription || !plan) {
      return false;
    }

    switch (type) {
      case 'staff':
        return plan.max_staff !== null && subscription.current_staff_count >= plan.max_staff;
      case 'patients':
        return plan.max_patients !== null && subscription.current_patient_count >= plan.max_patients;
      case 'storage':
        return plan.max_storage_gb !== null && subscription.current_storage_gb >= plan.max_storage_gb;
      default:
        return false;
    }
  }, [organization, subscription, plan]);

  // Get limit usage details
  const getLimitUsage = useCallback((type: 'staff' | 'patients' | 'storage') => {
    if (!organization || !subscription || !plan) {
      return { current: 0, max: null, percentage: 0 };
    }

    let current = 0;
    let max: number | null = null;

    switch (type) {
      case 'staff':
        current = subscription.current_staff_count;
        max = plan.max_staff ?? null;
        break;
      case 'patients':
        current = subscription.current_patient_count;
        max = plan.max_patients ?? null;
        break;
      case 'storage':
        current = subscription.current_storage_gb;
        max = plan.max_storage_gb ?? null;
        break;
    }

    const percentage = max ? (current / max) * 100 : 0;

    return { current, max, percentage };
  }, [organization, subscription, plan]);

  // Check if user can perform an action based on role
  const canPerformAction = useCallback((action: string): boolean => {
    if (!membership) {
      return true; // Single-tenant mode - allow all
    }

    const rolePermissions: Record<string, string[]> = {
      owner: ['*'], // All permissions
      admin: ['manage_members', 'manage_billing', 'manage_modules', 'export_data', 'manage_settings'],
      manager: ['manage_members', 'export_data'],
      member: ['view_data', 'edit_data'],
      viewer: ['view_data'],
    };

    const permissions = rolePermissions[membership.role] || [];
    return permissions.includes('*') || permissions.includes(action);
  }, [membership]);

  const value: OrganizationContextType = {
    organization,
    membership,
    subscription,
    plan,
    modules,
    isLoading,
    isMultiTenantMode: !!organization,
    hasOrganization: !!organization,
    isModuleEnabled,
    hasReachedLimit,
    getLimitUsage,
    canPerformAction,
    refreshOrganization: fetchOrganizationData,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  
  // Return safe defaults if context is not available (e.g., outside provider)
  if (!context) {
    return {
      organization: null,
      membership: null,
      subscription: null,
      plan: null,
      modules: [],
      isLoading: false,
      isMultiTenantMode: false,
      hasOrganization: false,
      isModuleEnabled: () => true, // All modules enabled in single-tenant
      hasReachedLimit: () => false, // No limits in single-tenant
      getLimitUsage: () => ({ current: 0, max: null, percentage: 0 }),
      canPerformAction: () => true, // All actions allowed in single-tenant
      refreshOrganization: async () => {},
    };
  }
  
  return context;
};

export default OrganizationContext;
