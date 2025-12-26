import React from 'react';
import { 
  Calendar, 
  FileText, 
  Shield, 
  Activity, 
  Pill,
  Video,
  Users,
  Clock,
  Heart,
  Brain
} from 'lucide-react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered appointment scheduling with real-time availability and automated reminders.',
    gradient: 'from-primary to-primary/70',
    size: 'large',
  },
  {
    icon: FileText,
    title: 'Electronic Health Records',
    description: 'Secure, centralized medical records accessible anytime.',
    gradient: 'from-success to-success/70',
    size: 'small',
  },
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Bank-level security ensuring your data meets industry standards.',
    gradient: 'from-info to-info/70',
    size: 'small',
  },
  {
    icon: Activity,
    title: 'Lab & Diagnostics',
    description: 'Integrated lab test management with instant results and comprehensive reports.',
    gradient: 'from-warning to-warning/70',
    size: 'medium',
  },
  {
    icon: Pill,
    title: 'Pharmacy Integration',
    description: 'Seamless prescription management with refill tracking.',
    gradient: 'from-destructive to-destructive/70',
    size: 'small',
  },
  {
    icon: Video,
    title: 'Telemedicine Ready',
    description: 'Virtual consultations with HD video and secure messaging for remote patient care.',
    gradient: 'from-primary to-info',
    size: 'large',
  },
  {
    icon: Users,
    title: 'Patient Portal',
    description: 'Self-service portal for patients to manage appointments and records.',
    gradient: 'from-success to-primary',
    size: 'medium',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description: 'Predictive analytics for better patient outcomes.',
    gradient: 'from-info to-primary',
    size: 'small',
  },
];

const BentoGrid = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20"></div>
      <div className="absolute top-1/2 left-0 w-1/3 h-96 bg-gradient-to-r from-primary/5 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-80 bg-gradient-to-l from-info/5 to-transparent blur-3xl"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <ScrollAnimationWrapper className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
            <Activity className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="text-gradient-mesh block mt-2">Deliver Excellence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive healthcare solutions designed for modern medical practices
          </p>
        </ScrollAnimationWrapper>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === 'large';
            const isMedium = feature.size === 'medium';
            
            return (
              <ScrollAnimationWrapper
                key={index}
                delay={index * 100}
                className={`
                  ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}
                  ${isMedium ? 'md:col-span-2' : ''}
                `}
              >
                <div className="card-bento h-full p-6 lg:p-8 flex flex-col justify-between relative">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="mt-auto">
                    <h3 className={`font-bold text-foreground mb-2 ${isLarge ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-muted-foreground ${isLarge ? 'text-lg' : 'text-sm'} leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Decorative Corner */}
                  <div className={`absolute top-4 right-4 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`}></div>
                </div>
              </ScrollAnimationWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
