import { useMemo, useCallback } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  MODULE_DEFINITIONS, 
  MODULE_KEYS, 
  type ModuleKey, 
  type ModuleDefinition 
} from '@/types/organization';

export interface ModuleStatus {
  key: ModuleKey;
  name: string;
  description: string;
  category: 'core' | 'clinical' | 'financial' | 'admin';
  isEnabled: boolean;
  isAvailableInPlan: boolean;
  requiredPlanTier: number;
  route?: string;
}

export const useModules = () => {
  const { organization, plan, modules, isModuleEnabled, isMultiTenantMode } = useOrganization();

  // Get all modules with their status
  const allModules = useMemo((): ModuleStatus[] => {
    return MODULE_KEYS.map((key) => {
      const definition = MODULE_DEFINITIONS[key];
      const currentTier = plan?.tier ?? 1;
      const isAvailableInPlan = definition.minPlanTier <= currentTier;
      
      return {
        key,
        name: definition.name,
        description: definition.description,
        category: definition.category,
        isEnabled: isModuleEnabled(key),
        isAvailableInPlan,
        requiredPlanTier: definition.minPlanTier,
        route: definition.route,
      };
    });
  }, [plan, isModuleEnabled]);

  // Get only enabled modules
  const enabledModules = useMemo(() => {
    return allModules.filter(m => m.isEnabled);
  }, [allModules]);

  // Get disabled modules
  const disabledModules = useMemo(() => {
    return allModules.filter(m => !m.isEnabled);
  }, [allModules]);

  // Get modules available for upgrade
  const upgradeableModules = useMemo(() => {
    return allModules.filter(m => !m.isEnabled && !m.isAvailableInPlan);
  }, [allModules]);

  // Get modules by category
  const getModulesByCategory = useCallback((category: 'core' | 'clinical' | 'financial' | 'admin') => {
    return allModules.filter(m => m.category === category);
  }, [allModules]);

  // Check if a specific module requires upgrade
  const requiresUpgrade = useCallback((moduleKey: ModuleKey): boolean => {
    const definition = MODULE_DEFINITIONS[moduleKey];
    const currentTier = plan?.tier ?? 1;
    return definition.minPlanTier > currentTier;
  }, [plan]);

  // Get the minimum plan name required for a module
  const getRequiredPlanName = useCallback((moduleKey: ModuleKey): string => {
    const definition = MODULE_DEFINITIONS[moduleKey];
    switch (definition.minPlanTier) {
      case 1:
        return 'Starter';
      case 2:
        return 'Professional';
      case 3:
        return 'Enterprise';
      default:
        return 'Unknown';
    }
  }, []);

  // Get module definition
  const getModuleDefinition = useCallback((moduleKey: ModuleKey): ModuleDefinition => {
    return MODULE_DEFINITIONS[moduleKey];
  }, []);

  // Get module status
  const getModuleStatus = useCallback((moduleKey: ModuleKey): ModuleStatus | undefined => {
    return allModules.find(m => m.key === moduleKey);
  }, [allModules]);

  // Count modules by status
  const moduleCounts = useMemo(() => ({
    total: MODULE_KEYS.length,
    enabled: enabledModules.length,
    disabled: disabledModules.length,
    requiresUpgrade: upgradeableModules.length,
  }), [enabledModules, disabledModules, upgradeableModules]);

  return {
    // Module lists
    allModules,
    enabledModules,
    disabledModules,
    upgradeableModules,
    
    // Helpers
    getModulesByCategory,
    requiresUpgrade,
    getRequiredPlanName,
    getModuleDefinition,
    getModuleStatus,
    
    // Check function (alias for isModuleEnabled)
    isEnabled: isModuleEnabled,
    
    // Counts
    moduleCounts,
    
    // Mode flag
    isMultiTenantMode,
  };
};

export default useModules;
