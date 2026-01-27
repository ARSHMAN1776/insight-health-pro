import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { SubscriptionPlan, OrganizationSubscription } from '@/types/organization';

export const useSubscription = () => {
  const { organization, subscription, plan, refreshOrganization } = useOrganization();
  const queryClient = useQueryClient();

  // Fetch all available plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Calculate trial days remaining
  const getTrialDaysRemaining = (): number | null => {
    if (!subscription?.trial_end) return null;
    
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Check if subscription is in trial
  const isInTrial = (): boolean => {
    return subscription?.status === 'trialing';
  };

  // Check if subscription is active (including trial)
  const isActive = (): boolean => {
    return subscription?.status === 'active' || subscription?.status === 'trialing';
  };

  // Check if subscription requires payment action
  const requiresPaymentAction = (): boolean => {
    return subscription?.status === 'past_due' || subscription?.status === 'unpaid';
  };

  // Get next billing date
  const getNextBillingDate = (): Date | null => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end);
  };

  // Calculate price with discount
  const getPriceWithDiscount = (basePrice: number): number => {
    if (!subscription?.discount_percentage) return basePrice;
    
    const discountEnds = subscription.discount_ends_at 
      ? new Date(subscription.discount_ends_at) 
      : null;
    
    if (discountEnds && discountEnds < new Date()) {
      return basePrice; // Discount expired
    }
    
    return basePrice * (1 - subscription.discount_percentage / 100);
  };

  // Get plan by tier
  const getPlanByTier = (tier: number): SubscriptionPlan | undefined => {
    return plans.find(p => p.tier === tier);
  };

  // Get plan by slug
  const getPlanBySlug = (slug: string): SubscriptionPlan | undefined => {
    return plans.find(p => p.slug === slug);
  };

  // Check if can upgrade to a specific plan
  const canUpgradeTo = (targetPlan: SubscriptionPlan): boolean => {
    if (!plan) return true; // No current plan, can select any
    return targetPlan.tier > plan.tier;
  };

  // Check if can downgrade to a specific plan
  const canDowngradeTo = (targetPlan: SubscriptionPlan): boolean => {
    if (!plan) return false;
    return targetPlan.tier < plan.tier;
  };

  return {
    // Current subscription data
    subscription,
    plan,
    plans,
    plansLoading,
    
    // Status checks
    isInTrial,
    isActive,
    requiresPaymentAction,
    
    // Trial info
    trialDaysRemaining: getTrialDaysRemaining(),
    
    // Billing info
    nextBillingDate: getNextBillingDate(),
    getPriceWithDiscount,
    
    // Plan helpers
    getPlanByTier,
    getPlanBySlug,
    canUpgradeTo,
    canDowngradeTo,
    
    // Refresh
    refreshSubscription: refreshOrganization,
  };
};

export default useSubscription;
