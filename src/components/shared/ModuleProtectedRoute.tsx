import React from 'react';
import { useModules } from '@/hooks/useModules';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { ModuleKey } from '@/types/organization';
import UpgradePrompt from './UpgradePrompt';

interface ModuleProtectedRouteProps {
  module: ModuleKey;
  children: React.ReactNode;
}

/**
 * ModuleProtectedRoute - Route-level protection for module-gated features
 * 
 * In single-tenant mode: All modules accessible
 * In multi-tenant mode: Shows upgrade prompt if module is disabled
 */
const ModuleProtectedRoute: React.FC<ModuleProtectedRouteProps> = ({
  module,
  children,
}) => {
  const { isMultiTenantMode } = useOrganization();
  const { isEnabled, requiresUpgrade, getModuleDefinition, getRequiredPlanName } = useModules();

  // Single-tenant mode - all modules enabled
  if (!isMultiTenantMode) {
    return <>{children}</>;
  }

  // Module is enabled - render children
  if (isEnabled(module)) {
    return <>{children}</>;
  }

  // Module is disabled - show upgrade prompt
  const definition = getModuleDefinition(module);
  const requiredPlan = getRequiredPlanName(module);
  const needsUpgrade = requiresUpgrade(module);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <UpgradePrompt
        moduleName={definition?.name || module}
        moduleDescription={definition?.description}
        requiredPlan={requiredPlan}
        needsPlanUpgrade={needsUpgrade}
      />
    </div>
  );
};

export default ModuleProtectedRoute;
