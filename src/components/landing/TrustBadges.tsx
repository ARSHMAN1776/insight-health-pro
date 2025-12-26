import React from 'react';
import { Shield, Award, Clock, HeartPulse, Lock, CheckCircle } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Fully compliant with healthcare data protection standards',
    color: 'bg-medical-blue',
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: '256-bit SSL encryption for all data transfers',
    color: 'bg-medical-green',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock technical and medical support',
    color: 'bg-medical-purple',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized for excellence in healthcare technology',
    color: 'bg-medical-orange',
  },
  {
    icon: HeartPulse,
    title: '99.9% Uptime',
    description: 'Reliable service when you need it most',
    color: 'bg-medical-red',
  },
  {
    icon: CheckCircle,
    title: 'SOC 2 Certified',
    description: 'Meeting the highest security standards',
    color: 'bg-gold',
  },
];

const TrustBadges = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted & Secure
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your data security is our top priority. We maintain the highest industry standards.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index} 
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 ${badge.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{badge.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
