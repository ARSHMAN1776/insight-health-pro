import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradePromptProps {
  moduleName: string;
  moduleDescription?: string;
  requiredPlan?: string;
  needsPlanUpgrade?: boolean;
  compact?: boolean;
}

/**
 * UpgradePrompt - Shows when a user tries to access a module they don't have access to
 * 
 * @param moduleName - The name of the module being accessed
 * @param moduleDescription - Description of what the module does
 * @param requiredPlan - The plan name required for this module
 * @param needsPlanUpgrade - Whether the user needs to upgrade their plan (vs just enabling the module)
 * @param compact - Whether to show a compact version of the prompt
 */
export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  moduleName,
  moduleDescription,
  requiredPlan = 'Professional',
  needsPlanUpgrade = true,
  compact = false,
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // Navigate to billing/upgrade page
    navigate('/settings?tab=billing');
  };

  const handleContactSales = () => {
    // Navigate to contact page for enterprise
    navigate('/contact');
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
        <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {moduleName} requires {requiredPlan}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleUpgrade}>
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">{moduleName}</CardTitle>
            <CardDescription className="text-base">
              {moduleDescription || `Access to ${moduleName} is not available on your current plan.`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {needsPlanUpgrade ? (
            <>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Available on {requiredPlan}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upgrade your plan to unlock this feature and many more.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={handleUpgrade} className="w-full">
                  Upgrade to {requiredPlan}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
                
                {requiredPlan === 'Enterprise' && (
                  <Button variant="outline" onClick={handleContactSales} className="w-full">
                    Contact Sales
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                This module is available on your plan but hasn't been enabled yet.
                Contact your organization administrator to enable it.
              </p>
              
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Go to Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradePrompt;
