import React, { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';

/**
 * TenantBranding component applies dynamic theme colors based on tenant settings.
 * It updates CSS custom properties to reflect the tenant's branding colors.
 */
const TenantBranding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant, isTenantMode } = useTenant();

  useEffect(() => {
    if (!isTenantMode || !tenant?.branding) return;

    const root = document.documentElement;
    
    // Helper to convert hex to HSL values
    const hexToHSL = (hex: string): string | null => {
      if (!hex || !hex.startsWith('#')) return null;
      
      // Remove the hash
      hex = hex.replace('#', '');
      
      // Parse hex values
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply primary color
    if (tenant.branding.primaryColor) {
      const primaryHSL = hexToHSL(tenant.branding.primaryColor);
      if (primaryHSL) {
        root.style.setProperty('--primary', primaryHSL);
        // Adjust primary-foreground for contrast
        const lightness = parseInt(primaryHSL.split(' ')[2]);
        root.style.setProperty('--primary-foreground', lightness > 50 ? '0 0% 0%' : '0 0% 100%');
      }
    }

    // Apply secondary color to accent if provided
    if (tenant.branding.secondaryColor) {
      const secondaryHSL = hexToHSL(tenant.branding.secondaryColor);
      if (secondaryHSL) {
        root.style.setProperty('--accent', secondaryHSL);
      }
    }

    // Update document title with hospital name
    if (tenant.name) {
      document.title = `${tenant.name} - Portal`;
    }

    // Cleanup function to reset colors when leaving tenant mode
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--accent');
      document.title = 'HealthCare HMS';
    };
  }, [tenant, isTenantMode]);

  return <>{children}</>;
};

export default TenantBranding;
