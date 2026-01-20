import React from 'react';
import { Check, Sparkles, Building2, Building, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollReveal, TiltCard, MagneticButton } from '@/components/animations';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small clinics',
    price: '499',
    period: '/month',
    icon: Building,
    popular: false,
    features: [
      'Up to 5 staff members',
      '500 patient records',
      'Appointment scheduling',
      'Basic reporting',
      'Email support',
      'Mobile app access',
    ],
    cta: 'Start Free Trial',
    variant: 'outline' as const,
  },
  {
    name: 'Professional',
    description: 'For growing healthcare facilities',
    price: '1,299',
    period: '/month',
    icon: Building2,
    popular: true,
    features: [
      'Up to 25 staff members',
      'Unlimited patient records',
      'All department modules',
      'Lab & pharmacy integration',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
    ],
    cta: 'Get Started',
    variant: 'default' as const,
  },
  {
    name: 'Enterprise',
    description: 'For large hospital networks',
    price: 'Custom',
    period: '',
    icon: Zap,
    popular: false,
    features: [
      'Unlimited staff members',
      'Multi-location support',
      'Custom integrations',
      'Dedicated account manager',
      'On-premise deployment option',
      '24/7 phone support',
      'SLA guarantee',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
];

const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            Transparent Pricing
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Plans That <span className="text-primary">Scale</span> With You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your healthcare facility. All plans include a 14-day free trial.
          </p>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <ScrollReveal
                key={plan.name}
                animation="fade-up"
                delay={index * 0.1}
              >
                <TiltCard tiltAmount={plan.popular ? 4 : 6}>
                  <Card 
                    className={`relative overflow-hidden transition-all duration-300 h-full ${
                      plan.popular 
                        ? 'border-primary shadow-lg shadow-primary/20 z-10' 
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    {plan.popular && (
                      <motion.div 
                        className="absolute top-0 right-0"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground px-3 py-1">
                          Most Popular
                        </Badge>
                      </motion.div>
                    )}
                    
                    {/* Breathing glow for popular plan */}
                    {plan.popular && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}
                    
                    <CardHeader className="text-center pb-4 relative">
                      <motion.div 
                        className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                          plan.popular ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-7 h-7" />
                      </motion.div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center relative">
                      <div className="mb-6">
                        <motion.span 
                          className="text-5xl font-bold text-foreground"
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                        >
                          {plan.price === 'Custom' ? '' : '$'}{plan.price}
                        </motion.span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      
                      <ul className="space-y-3 mb-8 text-left">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li 
                            key={feature} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + featureIndex * 0.05 }}
                          >
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      <MagneticButton strength={0.2}>
                        <Button 
                          variant={plan.variant}
                          className={`w-full rounded-full ${
                            plan.popular 
                              ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25' 
                              : ''
                          }`}
                          onClick={() => navigate('/contact')}
                        >
                          {plan.cta}
                        </Button>
                      </MagneticButton>
                    </CardContent>
                  </Card>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Note */}
        <ScrollReveal animation="fade-up" delay={0.4} className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            All prices in USD. Need a custom solution?{' '}
            <motion.span 
              className="text-primary font-medium cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/contact')}
            >
              Let's talk
            </motion.span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PricingSection;
