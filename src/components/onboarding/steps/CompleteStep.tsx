import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, BookOpen, Users, Settings } from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';

interface CompleteStepProps {
  data: OnboardingData;
}

const CompleteStep: React.FC<CompleteStepProps> = ({ data }) => {
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
        <p className="text-muted-foreground mb-8">
          Your organization <strong className="text-foreground">{data.organizationName}</strong> is ready to go.
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
