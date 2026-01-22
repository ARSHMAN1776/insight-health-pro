import React from 'react';
import { Shield, Award, Clock, HeartPulse, Lock, CheckCircle, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations';

const badges = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Full healthcare data protection',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Lock,
    title: '256-bit Encryption',
    description: 'Bank-level security',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Always available',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Healthcare excellence',
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    icon: HeartPulse,
    title: '99.9% Uptime',
    description: 'Reliable service',
    gradient: 'from-rose-500 to-pink-400',
  },
  {
    icon: CheckCircle,
    title: 'SOC 2 Certified',
    description: 'Security standards',
    gradient: 'from-indigo-500 to-blue-400',
  },
];

const TrustBadges = () => {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden border-y border-border/30">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <ScrollReveal animation="fade-up" className="text-center mb-12">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm font-semibold mb-4 border border-primary/10"
            whileHover={{ scale: 1.02 }}
          >
            <Shield className="w-4 h-4" />
            <span>Enterprise-Grade Security</span>
          </motion.div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Trusted by <span className="text-primary">500+</span> Healthcare Facilities
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Industry-leading compliance and security certifications
          </p>
        </ScrollReveal>

        {/* Badges Grid - Horizontal Scroll on Mobile */}
        <div className="relative">
          <div className="flex lg:grid lg:grid-cols-6 gap-4 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <ScrollReveal
                  key={index}
                  animation="fade-up"
                  delay={index * 0.05}
                  className="snap-center flex-shrink-0 w-[160px] lg:w-auto"
                >
                  <motion.div 
                    className="group relative h-full"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex flex-col items-center text-center p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 hover:border-primary/20 transition-all duration-300 h-full">
                      {/* Gradient glow on hover */}
                      <motion.div 
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}
                      />
                      
                      {/* Icon */}
                      <motion.div 
                        className={`relative w-12 h-12 bg-gradient-to-br ${badge.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                      </motion.div>

                      <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <ScrollReveal animation="fade-up" delay={0.3}>
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {[
              { icon: Globe, value: '50+', label: 'Countries' },
              { icon: HeartPulse, value: '2M+', label: 'Patients Managed' },
              { icon: Zap, value: '<100ms', label: 'Response Time' },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TrustBadges;
