import React from 'react';
import { 
  CreditCard,
  Mail,
  MessageSquare,
  Cloud,
  Shield,
  Wifi,
  Zap,
  Link
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const integrations = [
  {
    name: 'Payment Gateways',
    description: 'Stripe, PayPal, Square',
    icon: CreditCard,
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    name: 'Email Services',
    description: 'SendGrid, Mailchimp, AWS SES',
    icon: Mail,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    name: 'SMS & Notifications',
    description: 'Twilio, WhatsApp Business',
    icon: MessageSquare,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    name: 'Cloud Storage',
    description: 'AWS S3, Google Cloud, Azure',
    icon: Cloud,
    color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  {
    name: 'Security & Auth',
    description: 'OAuth, SAML, 2FA',
    icon: Shield,
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  {
    name: 'IoT Devices',
    description: 'Medical device connectivity',
    icon: Wifi,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    name: 'Lab Equipment',
    description: 'HL7, FHIR compatible',
    icon: Zap,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'EHR Systems',
    description: 'Seamless data exchange',
    icon: Link,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
];

const IntegrationsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Link className="w-4 h-4" />
            Seamless Integrations
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Connect With Your <span className="text-primary">Existing Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our HMS integrates with popular healthcare and business tools to create a unified ecosystem.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <Card 
                key={integration.name}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-5 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-xl ${integration.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">
                    {integration.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* API Note */}
        <div className="mt-12 p-6 bg-card border border-border/50 rounded-2xl max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Custom API Access</h4>
              <p className="text-sm text-muted-foreground">
                Need a custom integration? Our RESTful API allows you to connect any third-party service or build custom workflows tailored to your facility's needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
