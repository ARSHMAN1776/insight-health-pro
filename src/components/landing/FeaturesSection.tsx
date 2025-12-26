import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  FileText, 
  Shield, 
  Activity, 
  Users, 
  Clock,
  Pill,
  Video,
  Bell
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered appointment scheduling with real-time availability and automated reminders.',
    color: 'bg-medical-blue',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: FileText,
    title: 'Electronic Health Records',
    description: 'Secure, centralized medical records accessible anytime with complete privacy.',
    color: 'bg-medical-green',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Bank-level security ensuring your medical data meets industry standards.',
    color: 'bg-medical-purple',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: Activity,
    title: 'Lab & Diagnostics',
    description: 'Integrated lab test management with instant results and reports.',
    color: 'bg-medical-orange',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: Pill,
    title: 'Pharmacy Integration',
    description: 'Seamless prescription management with refill tracking and alerts.',
    color: 'bg-medical-red',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: Video,
    title: 'Telemedicine Ready',
    description: 'Virtual consultations with HD video and secure messaging.',
    color: 'bg-medical-blue',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&q=80',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-1/2 h-96 bg-gradient-to-r from-primary/5 to-transparent blur-3xl"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to deliver exceptional patient care and streamline operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group overflow-hidden border-2 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 bg-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"></div>
                  <div className={`absolute bottom-4 left-4 w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
