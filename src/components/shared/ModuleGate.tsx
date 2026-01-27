import React from 'react';
import { useModules } from '@/hooks/useModules';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { ModuleKey } from '@/types/organization';
import UpgradePrompt from './UpgradePrompt';

interface ModuleGateProps {
  module: ModuleKey | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

/**
 * ModuleGate - Conditionally renders children based on module availability
 * 
 * In single-tenant mode (no organization): All modules are available
 * In multi-tenant mode: Checks if module is enabled for the organization
 * 
 * @param module - The module key to check
 * @param children - Content to render if module is enabled
 * @param fallback - Optional content to render if module is disabled (overrides upgrade prompt)
 * @param showUpgrade - Whether to show upgrade prompt when module is disabled (default: true)
 */
export const ModuleGate: React.FC<ModuleGateProps> = ({
  module,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { isMultiTenantMode } = useOrganization();
  const { isEnabled, requiresUpgrade, getModuleDefinition, getRequiredPlanName } = useModules();

  // In single-tenant mode, all modules are enabled
  if (!isMultiTenantMode) {
    return <>{children}</>;
  }

  // Check if module is enabled
  if (isEnabled(module)) {
    return <>{children}</>;
  }

  // Module is not enabled - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    const definition = getModuleDefinition(module as ModuleKey);
    const requiredPlan = getRequiredPlanName(module as ModuleKey);
    const needsUpgrade = requiresUpgrade(module as ModuleKey);

    return (
      <UpgradePrompt
        moduleName={definition?.name || module}
        moduleDescription={definition?.description}
        requiredPlan={requiredPlan}
        needsPlanUpgrade={needsUpgrade}
      />
    );
  }

  return null;
};

export default ModuleGate;
