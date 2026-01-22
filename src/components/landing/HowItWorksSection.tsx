import React from 'react';
import { 
  UserPlus, 
  Settings, 
  Rocket, 
  HeadphonesIcon,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollReveal, MagneticButton } from '@/components/animations';

const steps = [
  {
    number: '01',
    title: 'Sign Up & Setup',
    description: 'Create your account and configure your facility details, departments, and staff roles in minutes.',
    icon: UserPlus,
    gradient: 'from-blue-500 to-cyan-500',
    time: '5 min',
  },
  {
    number: '02',
    title: 'Customize Modules',
    description: 'Enable the modules you need - patient management, scheduling, lab, pharmacy, billing, and more.',
    icon: Settings,
    gradient: 'from-purple-500 to-violet-500',
    time: '30 min',
  },
  {
    number: '03',
    title: 'Go Live',
    description: 'Import existing data, train your staff with our resources, and start managing your facility efficiently.',
    icon: Rocket,
    gradient: 'from-emerald-500 to-teal-500',
    time: '1 day',
  },
  {
    number: '04',
    title: 'Ongoing Support',
    description: 'Get continuous updates, 24/7 support, and access to new features as your facility grows.',
    icon: HeadphonesIcon,
    gradient: 'from-orange-500 to-amber-500',
    time: '24/7',
  },
];

const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade-up" className="text-center mb-16 lg:mb-20">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 text-primary text-sm font-semibold mb-6 border border-primary/10"
            whileHover={{ scale: 1.02 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Quick & Easy Setup</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Get Started in
            <span className="block text-primary mt-2">4 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From sign-up to going live, we make the transition to our HMS smooth and hassle-free.
          </p>
        </ScrollReveal>

        {/* Steps Grid */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-28 left-[10%] right-[10%] h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <ScrollReveal
                  key={step.number}
                  animation="fade-up"
                  delay={index * 0.1}
                >
                  <motion.div 
                    className="relative group"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Step Number - Floating */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <motion.div 
                        className="w-14 h-14 rounded-2xl bg-card border-2 border-primary flex items-center justify-center shadow-xl shadow-primary/10"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <span className="text-primary font-bold text-lg">{step.number}</span>
                      </motion.div>
                    </div>
                    
                    {/* Card */}
                    <div className="pt-10 h-full">
                      <div className="relative h-full overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 p-6 lg:p-8">
                        {/* Gradient Background on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                        
                        <div className="relative">
                          {/* Icon */}
                          <motion.div 
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 shadow-lg`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                          </motion.div>
                          
                          {/* Content */}
                          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {step.description}
                          </p>
                          
                          {/* Time Badge */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">{step.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow - Mobile */}
                    {index < steps.length - 1 && (
                      <div className="flex justify-center my-6 lg:hidden">
                        <ArrowRight className="w-6 h-6 text-primary/40 rotate-90 md:rotate-0" />
                      </div>
                    )}
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <ScrollReveal animation="fade-up" delay={0.5} className="mt-16 lg:mt-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-3xl p-8 lg:p-12 border border-border/50">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Ready to Transform Your Healthcare Facility?
              </h3>
              <p className="text-muted-foreground mb-8">
                Join 500+ healthcare facilities already using our platform.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <MagneticButton strength={0.15}>
                  <Button 
                    size="lg"
                    className="rounded-full px-10 py-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 text-base font-semibold"
                    onClick={() => navigate('/login')}
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </MagneticButton>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 py-6 text-base font-semibold"
                  onClick={() => navigate('/contact')}
                >
                  Schedule Demo
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6">
                {['No credit card required', '14-day free trial', 'Cancel anytime'].map((text, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HowItWorksSection;
