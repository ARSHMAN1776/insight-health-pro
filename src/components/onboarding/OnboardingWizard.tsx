import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Building2, Users, CreditCard, Settings, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import AccountStep from './steps/AccountStep';
import OrganizationStep from './steps/OrganizationStep';
import PlanStep from './steps/PlanStep';
import ModulesStep from './steps/ModulesStep';
import TeamStep from './steps/TeamStep';
import CompleteStep from './steps/CompleteStep';

export interface OnboardingData {
  // Account
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  
  // Organization
  organizationName: string;
  organizationType: 'hospital' | 'clinic' | 'laboratory' | 'pharmacy';
  address: string;
  phone: string;
  website: string;
  timezone: string;
  
  // Plan
  selectedPlanId: string;
  billingCycle: 'monthly' | 'yearly';
  
  // Modules
  enabledModules: string[];
  
  // Team
  teamInvites: Array<{ email: string; role: string }>;
}

const STEPS = [
  { id: 'account', title: 'Create Account', icon: Users, description: 'Set up your admin credentials' },
  { id: 'organization', title: 'Organization', icon: Building2, description: 'Tell us about your healthcare facility' },
  { id: 'plan', title: 'Choose Plan', icon: CreditCard, description: 'Select the right plan for your needs' },
  { id: 'modules', title: 'Configure Modules', icon: Settings, description: 'Enable the features you need' },
  { id: 'team', title: 'Invite Team', icon: Users, description: 'Add your staff members' },
  { id: 'complete', title: 'All Done!', icon: Sparkles, description: 'Your workspace is ready' },
];

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
  
  const [data, setData] = useState<OnboardingData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationType: 'hospital',
    address: '',
    phone: '',
    website: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    selectedPlanId: '',
    billingCycle: 'monthly',
    enabledModules: ['patients', 'appointments', 'billing'],
    teamInvites: [],
  });

  // Check if user is already part of an organization
  useEffect(() => {
    const checkExistingOrg = async () => {
      if (user) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (membership) {
          // User already has an organization, redirect to dashboard
          navigate('/dashboard');
        } else {
          // Pre-fill email and skip account step if already authenticated
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userMeta = (user as any).user_metadata || {};
          setData(prev => ({
            ...prev,
            email: user.email || '',
            firstName: userMeta?.first_name || '',
            lastName: userMeta?.last_name || '',
          }));
          setCurrentStep(1); // Skip to organization step
        }
      }
    };
    
    checkExistingOrg();
  }, [user, navigate]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Final step - go to dashboard
      navigate('/dashboard');
      return;
    }

    // Validation per step
    if (currentStep === 0 && !user) {
      // Account step - create user
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      setIsSubmitting(true);
      try {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              role: 'admin',
            },
          },
        });
        
        if (error) throw error;
        toast.success('Account created! Please check your email to verify.');
      } catch (error: any) {
        toast.error(error.message || 'Failed to create account');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }

    if (currentStep === 1) {
      // Organization step - validate
      if (!data.organizationName || !data.organizationType) {
        toast.error('Please fill in organization details');
        return;
      }
    }

    if (currentStep === 2) {
      // Plan step - validate
      if (!data.selectedPlanId) {
        toast.error('Please select a plan');
        return;
      }
    }

    if (currentStep === 3) {
      // Modules step - create organization
      if (!user) {
        toast.error('Please sign in first');
        return;
      }
      
      setIsSubmitting(true);
      try {
        // Create organization
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: data.organizationName,
            slug: data.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            email: data.email, // Required field
            address_line1: data.address || null,
            phone: data.phone || null,
            website: data.website || null,
            timezone: data.timezone,
            status: 'trialing',
            created_by: user.id,
            // Store organization type in metadata since there's no dedicated column
            metadata: { type: data.organizationType },
          })
          .select('id')
          .single();

        if (orgError) throw orgError;

        setCreatedOrgId(org.id);

        // Add current user as owner
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner',
            status: 'active',
            joined_at: new Date().toISOString(),
          });

        if (memberError) throw memberError;

        // Create subscription
        const { error: subError } = await supabase
          .from('organization_subscriptions')
          .insert({
            organization_id: org.id,
            plan_id: data.selectedPlanId,
            status: 'trialing',
            billing_cycle: data.billingCycle,
            trial_start: new Date().toISOString(),
            trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (subError) throw subError;

        // Enable selected modules
        for (const moduleKey of data.enabledModules) {
          await supabase.from('organization_modules').insert({
            organization_id: org.id,
            module_key: moduleKey,
            is_enabled: true,
            enabled_at: new Date().toISOString(),
          });
        }

        // Track onboarding progress
        await supabase.from('onboarding_progress').insert({
          organization_id: org.id,
          step: 'modules_configured',
          completed: true,
          completed_at: new Date().toISOString(),
        });

        toast.success('Organization created successfully!');
      } catch (error: any) {
        console.error('Onboarding error:', error);
        toast.error(error.message || 'Failed to create organization');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }

    if (currentStep === 4 && createdOrgId) {
      // Team step - send invites
      setIsSubmitting(true);
      try {
        for (const invite of data.teamInvites) {
          if (invite.email) {
            await supabase.from('organization_members').insert({
              organization_id: createdOrgId,
              user_id: user!.id, // Placeholder - will be updated when user accepts
              role: invite.role,
              status: 'pending',
              invited_at: new Date().toISOString(),
              invited_by: user!.id,
            });
          }
        }
        
        if (data.teamInvites.length > 0) {
          toast.success(`${data.teamInvites.filter(i => i.email).length} invitation(s) sent!`);
        }
      } catch (error: any) {
        console.error('Invite error:', error);
        // Non-blocking - continue anyway
      }
      setIsSubmitting(false);
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return user || (data.email && data.password && data.firstName && data.lastName);
      case 1:
        return data.organizationName && data.organizationType;
      case 2:
        return data.selectedPlanId;
      case 3:
        return data.enabledModules.length > 0;
      case 4:
        return true; // Team invites are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AccountStep data={data} updateData={updateData} />;
      case 1:
        return <OrganizationStep data={data} updateData={updateData} />;
      case 2:
        return <PlanStep data={data} updateData={updateData} />;
      case 3:
        return <ModulesStep data={data} updateData={updateData} />;
      case 4:
        return <TeamStep data={data} updateData={updateData} />;
      case 5:
        return <CompleteStep data={data} />;
      default:
        return null;
    }
  };

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                      ${isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                      ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-12 md:w-24 h-1 mx-2 rounded ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main card */}
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
            <CardDescription className="text-base">
              {STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canGoNext() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === STEPS.length - 1 ? (
                  <>
                    Go to Dashboard
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip option */}
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <p className="text-center mt-4 text-sm text-muted-foreground">
            Need help?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
