import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, Users, Settings, Globe, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingData } from '../OnboardingWizard';

interface CompleteStepProps {
  data: OnboardingData;
}

const CompleteStep: React.FC<CompleteStepProps> = ({ data }) => {
  const { toast } = useToast();
  
  // Generate the subdomain URL from organization name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
  };
  
  const orgSlug = generateSlug(data.organizationName);
  const portalUrl = `${orgSlug}.insight-health-pro.lovable.app`;
  
  const copyPortalUrl = () => {
    navigator.clipboard.writeText(`https://${portalUrl}`);
    toast({
      title: 'URL Copied!',
      description: 'Portal URL copied to clipboard',
    });
  };

  const nextSteps = [
    {
      icon: Settings,
      title: 'Configure Settings',
      description: 'Customize your hospital branding and preferences',
    },
    {
      icon: Users,
      title: 'Add Patients',
      description: 'Start registering patients in the system',
    },
    {
      icon: BookOpen,
      title: 'Explore Documentation',
      description: 'Learn about all the features available',
    },
  ];

  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <CheckCircle2 className="w-12 h-12 text-primary" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-2">Welcome to HealthCare HMS!</h2>
        <p className="text-muted-foreground mb-6">
          Your organization <strong className="text-foreground">{data.organizationName}</strong> is ready to go.
        </p>
      </motion.div>

      {/* Portal URL Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Your Hospital Portal</h3>
        </div>
        <div className="flex items-center justify-center gap-2 bg-background rounded-md border p-3">
          <code className="text-sm font-mono text-primary">{portalUrl}</code>
          <Button variant="ghost" size="sm" onClick={copyPortalUrl}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Share this URL with your staff and patients. They can access your branded portal directly.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-muted/50 rounded-lg p-6 mb-8 text-left"
      >
        <h3 className="font-semibold mb-4">Your Setup Summary</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Organization: {data.organizationName} ({data.organizationType})
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            {data.enabledModules.length} modules enabled
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            14-day free trial activated
          </li>
          {data.teamInvites.filter(i => i.email).length > 0 && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              {data.teamInvites.filter(i => i.email).length} team invitation(s) sent
            </li>
          )}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="font-semibold mb-4">Recommended Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <Icon className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-muted-foreground mt-8"
      >
        Click "Go to Dashboard" to start managing your healthcare facility.
      </motion.p>
    </div>
  );
};

export default CompleteStep;
