import React from 'react';
import { 
  UserPlus, 
  Settings, 
  Rocket, 
  HeadphonesIcon,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Sign Up & Setup',
    description: 'Create your account and configure your facility details, departments, and staff roles in minutes.',
    icon: UserPlus,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    number: '02',
    title: 'Customize Modules',
    description: 'Enable the modules you need - patient management, scheduling, lab, pharmacy, billing, and more.',
    icon: Settings,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    number: '03',
    title: 'Go Live',
    description: 'Import existing data, train your staff with our resources, and start managing your facility efficiently.',
    icon: Rocket,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    number: '04',
    title: 'Ongoing Support',
    description: 'Get continuous updates, 24/7 support, and access to new features as your facility grows.',
    icon: HeadphonesIcon,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
];

const HowItWorksSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Rocket className="w-4 h-4" />
            Quick Setup
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get Started in <span className="text-primary">4 Easy Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From sign-up to going live, we make the transition to our HMS smooth and hassle-free.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.number}
                  className="relative group"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 lg:relative lg:top-0 lg:left-0 lg:translate-x-0 z-10">
                    <div className="w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg mx-auto lg:mx-0">
                      <span className="text-primary font-bold">{step.number}</span>
                    </div>
                  </div>
                  
                  {/* Card */}
                  <div className="mt-8 lg:mt-6 p-6 bg-card border border-border/50 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow - Mobile/Tablet */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4 lg:hidden">
                      <ArrowRight className="w-6 h-6 text-primary/40 rotate-90 md:rotate-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button 
            size="lg"
            className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            onClick={() => navigate('/contact')}
          >
            Request a Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Full installation support • Lifetime updates included
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
