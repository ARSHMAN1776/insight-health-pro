import React from 'react';
import { Shield, Lock, Award, CheckCircle, Zap, Globe } from 'lucide-react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const badges = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Full healthcare data protection',
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: '256-bit AES encryption',
    gradient: 'from-success to-success/70',
  },
  {
    icon: Award,
    title: 'SOC 2 Type II',
    description: 'Certified security practices',
    gradient: 'from-warning to-warning/70',
  },
  {
    icon: CheckCircle,
    title: 'HL7 FHIR',
    description: 'Healthcare interoperability',
    gradient: 'from-info to-info/70',
  },
  {
    icon: Zap,
    title: '99.99% Uptime',
    description: 'Enterprise reliability',
    gradient: 'from-destructive to-destructive/70',
  },
  {
    icon: Globe,
    title: 'GDPR Ready',
    description: 'International compliance',
    gradient: 'from-primary to-info',
  },
];

const TrustBadges = () => {
  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-20"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <ScrollAnimationWrapper className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by Healthcare Leaders
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with enterprise-grade security and compliance standards
          </p>
        </ScrollAnimationWrapper>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <ScrollAnimationWrapper 
                key={index} 
                delay={index * 50}
                className="group"
              >
                <div className="h-full p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{badge.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                </div>
              </ScrollAnimationWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;