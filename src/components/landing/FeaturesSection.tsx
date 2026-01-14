import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  FileText, 
  Shield, 
  Activity, 
  Pill,
  Video
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered appointment scheduling with real-time availability and automated reminders.',
  },
  {
    icon: FileText,
    title: 'Electronic Health Records',
    description: 'Secure, centralized medical records accessible anytime with complete privacy.',
  },
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Bank-level security ensuring your medical data meets industry standards.',
  },
  {
    icon: Activity,
    title: 'Lab & Diagnostics',
    description: 'Integrated lab test management with instant results and reports.',
  },
  {
    icon: Pill,
    title: 'Pharmacy Integration',
    description: 'Seamless prescription management with refill tracking and alerts.',
  },
  {
    icon: Video,
    title: 'Telemedicine Ready',
    description: 'Virtual consultations with HD video and secure messaging.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to deliver exceptional patient care and streamline operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group border border-border hover:border-primary/30 transition-colors bg-card"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
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
