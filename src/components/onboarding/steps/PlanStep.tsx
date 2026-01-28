import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OnboardingData } from '../OnboardingWizard';

interface PlanStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number | null;
  price_yearly: number | null;
  max_patients: number | null;
  max_staff: number | null;
  max_storage_gb: number | null;
  features: string[];
  modules: string[];
  tier: number;
  is_popular?: boolean;
}

const PlanStep: React.FC<PlanStepProps> = ({ data, updateData }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data: plansData, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true, nullsFirst: false });

      if (!error && plansData) {
        const mappedPlans = plansData.map((p, index) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price_monthly: p.price_monthly,
          price_yearly: p.price_yearly,
          max_patients: p.max_patients,
          max_staff: p.max_staff,
          max_storage_gb: p.max_storage_gb,
          features: Array.isArray(p.features) ? (p.features as string[]) : [],
          // modules can be an object like {appointments: true, patients: true} or an array
          modules: Array.isArray(p.modules) 
            ? (p.modules as string[]) 
            : (p.modules && typeof p.modules === 'object' 
                ? Object.entries(p.modules as Record<string, boolean>)
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => key)
                : []),
          tier: index + 1, // 1=Starter, 2=Professional, 3=Enterprise
          is_popular: p.name === 'Professional',
        }));
        setPlans(mappedPlans);
        
        // If a plan was previously selected, update its data
        if (data.selectedPlanId) {
          const selectedPlan = mappedPlans.find(p => p.id === data.selectedPlanId);
          if (selectedPlan && !data.selectedPlanData) {
            updateData({
              selectedPlanData: {
                id: selectedPlan.id,
                name: selectedPlan.name,
                tier: selectedPlan.tier,
                modules: selectedPlan.modules,
              },
              enabledModules: selectedPlan.modules,
            });
          }
        }
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const isYearly = data.billingCycle === 'yearly';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if plan has null pricing (Enterprise/Custom)
  const isCustomPricing = (plan: Plan) => plan.price_monthly === null || plan.price_yearly === null;

  return (
    <div className="space-y-6">
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
        <span className={!isYearly ? 'font-medium' : 'text-muted-foreground'}>Monthly</span>
        <Switch
          checked={isYearly}
          onCheckedChange={(checked) => updateData({ billingCycle: checked ? 'yearly' : 'monthly' })}
        />
        <span className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
          Yearly
          <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
            Save 20%
          </Badge>
        </span>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isSelected = data.selectedPlanId === plan.id;
          const isCustom = isCustomPricing(plan);
          const price = isYearly ? plan.price_yearly : plan.price_monthly;
          const monthlyEquivalent = isYearly && plan.price_yearly !== null 
            ? Math.round(plan.price_yearly / 12) 
            : plan.price_monthly;
          
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => updateData({ 
                selectedPlanId: plan.id,
                selectedPlanData: {
                  id: plan.id,
                  name: plan.name,
                  tier: plan.tier,
                  modules: plan.modules,
                },
                enabledModules: plan.modules,
                addonModules: [],
                addonTotalMonthly: 0,
                addonTotalYearly: 0,
              })}
              className={`
                relative p-6 rounded-xl border-2 text-left transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
                }
                ${plan.is_popular ? 'md:-mt-2 md:mb-2' : ''}
              `}
            >
              {plan.is_popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              
              <div className="mb-4">
                {isCustom ? (
                  <>
                    <span className="text-2xl font-bold">Contact Sales</span>
                    <p className="text-sm text-muted-foreground">
                      Custom pricing for your needs
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold">${monthlyEquivalent}</span>
                    <span className="text-muted-foreground">/month</span>
                    {isYearly && price !== null && (
                      <p className="text-sm text-muted-foreground">
                        ${price} billed yearly
                      </p>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {plan.max_patients ? `${plan.max_patients.toLocaleString()} patients` : 'Unlimited patients'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {plan.max_staff ? `${plan.max_staff} staff members` : 'Unlimited staff'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {plan.max_storage_gb ? `${plan.max_storage_gb}GB storage` : 'Unlimited storage'}
                </li>
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  );
};

export default PlanStep;
