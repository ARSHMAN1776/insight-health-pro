import React from 'react';
import { Shield, Award, Clock, HeartPulse, Lock, CheckCircle } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Fully compliant with healthcare data protection standards',
    gradient: 'from-blue-500 to-cyan-400',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: '256-bit SSL encryption for all data transfers',
    gradient: 'from-emerald-500 to-teal-400',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock technical and medical support',
    gradient: 'from-violet-500 to-purple-400',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized for excellence in healthcare technology',
    gradient: 'from-amber-500 to-orange-400',
    shadowColor: 'shadow-amber-500/20',
  },
  {
    icon: HeartPulse,
    title: '99.9% Uptime',
    description: 'Reliable service when you need it most',
    gradient: 'from-rose-500 to-pink-400',
    shadowColor: 'shadow-rose-500/20',
  },
  {
    icon: CheckCircle,
    title: 'SOC 2 Certified',
    description: 'Meeting the highest security standards',
    gradient: 'from-yellow-500 to-amber-400',
    shadowColor: 'shadow-yellow-500/20',
  },
];

const TrustBadges = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted & <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Secure</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your data security is our top priority. We maintain the highest industry standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index} 
                className={`group relative flex flex-col items-center text-center p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${badge.shadowColor}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient glow effect on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon container with gradient border */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${badge.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-foreground mb-3 text-lg group-hover:text-primary transition-colors duration-300">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {badge.description}
                </p>

                {/* Decorative corner accent */}
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-gradient-to-br ${badge.gradient} opacity-60`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
