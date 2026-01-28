import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for tenant data
export interface TenantBranding {
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface TenantData {
  id: string;
  name: string;
  slug: string;
  branding: TenantBranding;
}

interface TenantContextType {
  // Core tenant state
  tenant: TenantData | null;
  isTenantMode: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Computed properties
  subdomain: string | null;
  isMainDomain: boolean;
  
  // Helper functions
  getTenantUrl: () => string;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Known main domains where marketing site should show
const MAIN_DOMAINS = [
  'localhost',
  'insight-health-pro.lovable.app',
  'lovable.app',
  '127.0.0.1',
];

// Preview domains pattern
const PREVIEW_DOMAIN_PATTERN = /^[a-z0-9-]+--[a-z0-9-]+\.lovable\.app$/;

/**
 * Extract subdomain from hostname
 * Returns null if on main domain or preview domain
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Check if it's a preview domain (e.g., id-preview--ff8919f2.lovable.app)
  if (PREVIEW_DOMAIN_PATTERN.test(host)) {
    return null;
  }
  
  // Check if it's a known main domain
  if (MAIN_DOMAINS.some(domain => host === domain || host.endsWith(`.${domain}`))) {
    // Check for subdomain on main domain (e.g., citygeneral.insight-health-pro.lovable.app)
    const baseDomain = MAIN_DOMAINS.find(d => host.endsWith(`.${d}`) || host === d);
    if (baseDomain && host !== baseDomain) {
      const subdomain = host.replace(`.${baseDomain}`, '').split('.').pop();
      // Exclude preview patterns
      if (subdomain && !subdomain.includes('--') && !subdomain.includes('preview')) {
        return subdomain;
      }
    }
    return null;
  }
  
  // For custom domains like citygeneral.example.com
  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const subdomain = extractSubdomain(hostname);
  const isMainDomain = subdomain === null;
  const isTenantMode = !isMainDomain && tenant !== null;

  const fetchTenant = useCallback(async () => {
    if (!subdomain) {
      setTenant(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Look up organization by slug
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug, logo_url, primary_color, secondary_color, address_line1, city, state_province, phone, email')
        .eq('slug', subdomain)
        .maybeSingle();

      if (orgError) {
        console.error('Error fetching tenant:', orgError);
        setError('Failed to load organization');
        setTenant(null);
        return;
      }

      if (!orgData) {
        setError('Organization not found');
        setTenant(null);
        return;
      }

      // Build address string from components
      const addressParts = [orgData.address_line1, orgData.city, orgData.state_province].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;

      setTenant({
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        branding: {
          logoUrl: orgData.logo_url,
          primaryColor: orgData.primary_color,
          secondaryColor: orgData.secondary_color,
          tagline: null, // Not in schema - could add later
          address: fullAddress,
          phone: orgData.phone,
          email: orgData.email,
        },
      });
      setError(null);
    } catch (err) {
      console.error('Error in fetchTenant:', err);
      setError('Failed to load organization');
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, [subdomain]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  // Get the full tenant URL
  const getTenantUrl = useCallback(() => {
    if (!tenant) return window.location.origin;
    // For production, return the subdomain URL
    const baseDomain = 'insight-health-pro.lovable.app';
    return `https://${tenant.slug}.${baseDomain}`;
  }, [tenant]);

  const value: TenantContextType = {
    tenant,
    isTenantMode,
    isLoading,
    error,
    subdomain,
    isMainDomain,
    getTenantUrl,
    refreshTenant: fetchTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  
  // Return safe defaults if context is not available
  if (!context) {
    return {
      tenant: null,
      isTenantMode: false,
      isLoading: false,
      error: null,
      subdomain: null,
      isMainDomain: true,
      getTenantUrl: () => window.location.origin,
      refreshTenant: async () => {},
    };
  }
  
  return context;
};

export default TenantContext;
