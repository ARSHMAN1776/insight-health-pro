import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Shield, 
  Activity, 
  Pill,
  Video,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal, TiltCard } from '@/components/animations';

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered appointment scheduling with real-time availability, automated reminders, and intelligent conflict resolution.',
    gradient: 'from-blue-500 to-cyan-500',
    link: '/features/appointment-scheduling',
    stats: '40% faster booking',
  },
  {
    icon: FileText,
    title: 'Electronic Health Records',
    description: 'Secure, centralized medical records with instant access, complete audit trails, and seamless data portability.',
    gradient: 'from-emerald-500 to-teal-500',
    link: '/features/medical-records',
    stats: 'Zero data loss',
  },
  {
    icon: Shield,
    title: 'HIPAA Compliance',
    description: 'Bank-level 256-bit encryption ensuring your medical data exceeds all industry security standards.',
    gradient: 'from-violet-500 to-purple-500',
    link: '/features/billing-payments',
    stats: '100% compliant',
  },
  {
    icon: Activity,
    title: 'Lab & Diagnostics',
    description: 'Integrated lab management with instant results, automated reporting, and real-time status tracking.',
    gradient: 'from-orange-500 to-amber-500',
    link: '/features/lab-diagnostics',
    stats: '2x faster results',
  },
  {
    icon: Pill,
    title: 'Pharmacy Integration',
    description: 'Complete prescription lifecycle management with refill tracking, interaction alerts, and inventory sync.',
    gradient: 'from-rose-500 to-pink-500',
    link: '/features/patient-management',
    stats: 'Zero errors',
  },
  {
    icon: Video,
    title: 'Telemedicine Ready',
    description: 'HD video consultations with integrated scheduling, secure messaging, and digital prescriptions.',
    gradient: 'from-indigo-500 to-blue-500',
    link: '/features/notifications',
    stats: '24/7 available',
  },
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 text-primary text-sm font-semibold mb-6 border border-primary/10"
            whileHover={{ scale: 1.02 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Powerful Features</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="block text-primary mt-2">Deliver Exceptional Care</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive healthcare solutions designed to streamline operations, 
            enhance patient experience, and drive better outcomes.
          </p>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal 
                key={index}
                animation="fade-up"
                delay={index * 0.08}
              >
                <TiltCard tiltAmount={5} glareEffect>
                  <motion.div 
                    className="group relative h-full cursor-pointer"
                    onClick={() => navigate(feature.link)}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="relative h-full overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500">
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                      
                      {/* Content */}
                      <div className="relative p-8">
                        {/* Icon */}
                        <div className="relative mb-6">
                          <motion.div 
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                          </motion.div>
                          {/* Glow Effect */}
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-30`} />
                        </div>
                        
                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {feature.description}
                        </p>
                        
                        {/* Stats Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${feature.gradient} bg-opacity-10 text-xs font-semibold text-foreground`}>
                            {feature.stats}
                          </span>
                          <motion.div 
                            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors"
                            whileHover={{ scale: 1.1 }}
                          >
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal animation="fade-up" delay={0.5} className="mt-16 text-center">
          <motion.button
            onClick={() => navigate('/features/patient-management')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore All Features
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FeaturesSection;
