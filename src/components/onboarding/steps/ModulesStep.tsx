import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, Check, Plus } from 'lucide-react';
import { 
  Users, Calendar, FileText, CreditCard, TestTube, Pill, 
  Droplets, Building2, Bed, Heart, ClipboardList, Package,
  Send, BarChart3, FileSearch, MessageSquare, Scissors
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OnboardingData, ModulePricing } from '../OnboardingWizard';

interface ModulesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  patients: Users,
  appointments: Calendar,
  billing: CreditCard,
  departments: Building2,
  prescriptions: Pill,
  messages: MessageSquare,
  lab_tests: TestTube,
  pharmacy: Pill,
  inventory: Package,
  insurance: FileText,
  referrals: Send,
  reports: BarChart3,
  rooms: Bed,
  vitals: Heart,
  queue: ClipboardList,
  blood_bank: Droplets,
  operation_dept: Scissors,
  audit_logs: FileSearch,
  shift_handover: ClipboardList,
};

const ModulesStep: React.FC<ModulesStepProps> = ({ data, updateData }) => {
  const [modulePricing, setModulePricing] = useState<ModulePricing[]>([]);
  const [loading, setLoading] = useState(true);

  const planTier = data.selectedPlanData?.tier || 1;
  const planModules = data.selectedPlanData?.modules || [];
  const isYearly = data.billingCycle === 'yearly';

  useEffect(() => {
    const fetchModulePricing = async () => {
      const { data: pricing, error } = await supabase
        .from('module_pricing')
        .select('*')
        .order('min_plan_tier', { ascending: true });

      if (!error && pricing) {
        setModulePricing(pricing as ModulePricing[]);
        
        // Auto-populate enabled modules with plan's included modules
        if (data.enabledModules.length === 0 && planModules.length > 0) {
          updateData({ enabledModules: [...planModules] });
        }
      }
      setLoading(false);
    };

    fetchModulePricing();
  }, [planModules]);

  // Categorize modules
  const includedModules = modulePricing.filter(m => 
    planModules.includes(m.module_key) || m.min_plan_tier <= planTier
  );
  
  const addonModules = modulePricing.filter(m => 
    !planModules.includes(m.module_key) && 
    m.min_plan_tier > planTier && 
    !m.is_enterprise_only &&
    m.min_plan_tier <= 2 // Available as add-on for non-enterprise
  );
  
  const enterpriseOnlyModules = modulePricing.filter(m => 
    m.is_enterprise_only && planTier < 3
  );

  const toggleAddon = (moduleKey: string) => {
    const isCurrentlyEnabled = data.addonModules.includes(moduleKey);
    const module = modulePricing.find(m => m.module_key === moduleKey);
    
    if (!module) return;

    let newAddons: string[];
    let newEnabled: string[];
    
    if (isCurrentlyEnabled) {
      newAddons = data.addonModules.filter(m => m !== moduleKey);
      newEnabled = data.enabledModules.filter(m => m !== moduleKey);
    } else {
      newAddons = [...data.addonModules, moduleKey];
      newEnabled = [...data.enabledModules, moduleKey];
    }

    // Calculate new totals
    const newTotalMonthly = newAddons.reduce((sum, key) => {
      const mod = modulePricing.find(m => m.module_key === key);
      return sum + (mod?.price_monthly || 0);
    }, 0);
    
    const newTotalYearly = newAddons.reduce((sum, key) => {
      const mod = modulePricing.find(m => m.module_key === key);
      return sum + (mod?.price_yearly || 0);
    }, 0);

    updateData({
      addonModules: newAddons,
      enabledModules: newEnabled,
      addonTotalMonthly: newTotalMonthly,
      addonTotalYearly: newTotalYearly,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderModuleCard = (
    module: ModulePricing, 
    type: 'included' | 'addon' | 'enterprise'
  ) => {
    const Icon = MODULE_ICONS[module.module_key] || Package;
    const isEnabled = data.enabledModules.includes(module.module_key);
    const isAddonSelected = data.addonModules.includes(module.module_key);
    const price = isYearly ? module.price_yearly / 12 : module.price_monthly;
    
    return (
      <div
        key={module.module_key}
        className={`
          flex items-center gap-4 p-4 rounded-lg border transition-all
          ${type === 'included' ? 'border-primary/50 bg-primary/5' : ''}
          ${type === 'addon' && isAddonSelected ? 'border-primary/50 bg-primary/5' : ''}
          ${type === 'addon' && !isAddonSelected ? 'border-border hover:border-primary/30' : ''}
          ${type === 'enterprise' ? 'border-border bg-muted/30 opacity-60' : ''}
        `}
      >
        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Label className="font-medium">{module.name}</Label>
            {type === 'included' && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                <Check className="w-3 h-3 mr-1" />
                Included
              </Badge>
            )}
            {type === 'enterprise' && (
              <Badge variant="outline" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Enterprise
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{module.description}</p>
        </div>
        
        {type === 'addon' && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">
              +${Math.round(price)}/mo
            </span>
            <Switch
              checked={isAddonSelected}
              onCheckedChange={() => toggleAddon(module.module_key)}
            />
          </div>
        )}
        
        {type === 'included' && (
          <Check className="w-5 h-5 text-primary" />
        )}
        
        {type === 'enterprise' && (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Included modules section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          Included in {data.selectedPlanData?.name || 'Your Plan'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {includedModules.map(m => renderModuleCard(m, 'included'))}
        </div>
      </div>

      {/* Add-on modules section */}
      {addonModules.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Available Add-ons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2">
            {addonModules.map(m => renderModuleCard(m, 'addon'))}
          </div>
          
          {data.addonModules.length > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {data.addonModules.length} add-on{data.addonModules.length > 1 ? 's' : ''} selected
                </span>
                <span className="text-lg font-bold text-primary">
                  +${isYearly ? Math.round(data.addonTotalYearly / 12) : data.addonTotalMonthly}/mo
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enterprise-only modules section */}
      {enterpriseOnlyModules.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Enterprise Only
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enterpriseOnlyModules.map(m => renderModuleCard(m, 'enterprise'))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Upgrade to Enterprise to unlock these modules
          </p>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        You can add or remove modules anytime from Settings.
      </p>
    </div>
  );
};

export default ModulesStep;
