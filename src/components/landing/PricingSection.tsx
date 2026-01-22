import React, { useState } from 'react';
import { Check, Sparkles, Building2, Building, Zap, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollReveal, TiltCard, MagneticButton } from '@/components/animations';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small clinics and practices',
    monthlyPrice: 499,
    yearlyPrice: 399,
    icon: Building,
    popular: false,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      { text: 'Up to 5 staff members', included: true },
      { text: '500 patient records', included: true },
      { text: 'Appointment scheduling', included: true },
      { text: 'Basic reporting', included: true },
      { text: 'Email support', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Lab integration', included: false },
      { text: 'Custom branding', included: false },
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    description: 'For growing healthcare facilities',
    monthlyPrice: 1299,
    yearlyPrice: 999,
    icon: Building2,
    popular: true,
    gradient: 'from-primary to-primary/80',
    features: [
      { text: 'Up to 25 staff members', included: true },
      { text: 'Unlimited patient records', included: true },
      { text: 'All department modules', included: true },
      { text: 'Lab & pharmacy integration', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom branding', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    description: 'For large hospital networks',
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Zap,
    popular: false,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      { text: 'Unlimited staff members', included: true },
      { text: 'Multi-location support', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'On-premise deployment', included: true },
      { text: '24/7 phone support', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Training & onboarding', included: true },
    ],
    cta: 'Contact Sales',
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 text-primary text-sm font-semibold mb-6 border border-primary/10"
            whileHover={{ scale: 1.02 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Simple, Transparent Pricing</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Plans That Scale
            <span className="block text-primary mt-2">With Your Needs</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Choose the perfect plan for your healthcare facility. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            
            return (
              <ScrollReveal
                key={plan.name}
                animation="fade-up"
                delay={index * 0.1}
              >
                <TiltCard tiltAmount={plan.popular ? 3 : 5}>
                  <motion.div
                    className="h-full"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card 
                      className={`relative overflow-hidden h-full transition-all duration-300 ${
                        plan.popular 
                          ? 'border-2 border-primary shadow-2xl shadow-primary/20' 
                          : 'border border-border/50 hover:border-primary/30'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 left-0 right-0">
                          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-semibold">
                            Most Popular
                          </div>
                        </div>
                      )}
                      
                      {/* Background Glow */}
                      {plan.popular && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
                          animate={{ opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        />
                      )}
                      
                      <CardHeader className={`text-center pb-6 ${plan.popular ? 'pt-14' : 'pt-8'}`}>
                        <motion.div 
                          className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription className="text-base">{plan.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="text-center">
                        {/* Price */}
                        <div className="mb-8">
                          {price ? (
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-5xl font-bold text-foreground">${price}</span>
                              <span className="text-muted-foreground">/month</span>
                            </div>
                          ) : (
                            <div className="text-4xl font-bold text-foreground">Custom</div>
                          )}
                          {isYearly && price && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Billed annually (${price * 12}/year)
                            </p>
                          )}
                        </div>
                        
                        {/* Features */}
                        <ul className="space-y-3 mb-8 text-left">
                          {plan.features.map((feature, featureIndex) => (
                            <motion.li 
                              key={featureIndex} 
                              className="flex items-start gap-3"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 + featureIndex * 0.03 }}
                            >
                              {feature.included ? (
                                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                              )}
                              <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                                {feature.text}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                        
                        {/* CTA Button */}
                        <MagneticButton strength={0.15}>
                          <Button 
                            className={`w-full rounded-full py-6 text-base font-semibold ${
                              plan.popular 
                                ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25' 
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                            variant={plan.popular ? 'default' : 'secondary'}
                            onClick={() => navigate(plan.name === 'Enterprise' ? '/contact' : '/login')}
                          >
                            {plan.cta}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </MagneticButton>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Note */}
        <ScrollReveal animation="fade-up" delay={0.4} className="mt-16 text-center">
          <p className="text-muted-foreground">
            All prices in USD. Need a custom solution?{' '}
            <motion.span 
              className="text-primary font-semibold cursor-pointer hover:underline"
              whileHover={{ scale: 1.02 }}
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
