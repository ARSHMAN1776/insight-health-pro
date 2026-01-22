import React from 'react';
import { 
  CreditCard,
  Mail,
  MessageSquare,
  Cloud,
  Shield,
  Wifi,
  Zap,
  Link,
  ArrowRight,
  Code2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations';
import { useNavigate } from 'react-router-dom';

const integrations = [
  {
    name: 'Payment Gateways',
    description: 'Stripe, PayPal, Square',
    icon: CreditCard,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Email Services',
    description: 'SendGrid, Mailchimp, AWS SES',
    icon: Mail,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'SMS & Notifications',
    description: 'Twilio, WhatsApp Business',
    icon: MessageSquare,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Cloud Storage',
    description: 'AWS S3, Google Cloud, Azure',
    icon: Cloud,
    gradient: 'from-sky-500 to-blue-500',
  },
  {
    name: 'Security & Auth',
    description: 'OAuth, SAML, 2FA',
    icon: Shield,
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    name: 'IoT Devices',
    description: 'Medical device connectivity',
    icon: Wifi,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Lab Equipment',
    description: 'HL7, FHIR compatible',
    icon: Zap,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'EHR Systems',
    description: 'Seamless data exchange',
    icon: Link,
    gradient: 'from-purple-500 to-indigo-500',
  },
];

const IntegrationsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 text-primary text-sm font-semibold mb-6 border border-primary/10"
            whileHover={{ scale: 1.02 }}
          >
            <Link className="w-4 h-4" />
            <span>Seamless Integrations</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Connect With Your
            <span className="block text-primary mt-2">Existing Tools</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our HMS integrates with popular healthcare and business tools to create a unified ecosystem.
          </p>
        </ScrollReveal>

        {/* Integrations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <ScrollReveal
                key={integration.name}
                animation="fade-up"
                delay={index * 0.05}
              >
                <motion.div 
                  className="group relative cursor-pointer"
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative h-full overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 p-6 text-center">
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${integration.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                    
                    <div className="relative">
                      {/* Icon */}
                      <motion.div 
                        className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center mb-4 shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                      </motion.div>
                      
                      {/* Content */}
                      <h3 className="font-bold text-foreground mb-1 text-sm group-hover:text-primary transition-colors">
                        {integration.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* API Card */}
        <ScrollReveal animation="fade-up" delay={0.4}>
          <motion.div 
            className="mt-12 lg:mt-16 max-w-4xl mx-auto"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-muted/30 border border-border/50 p-8 lg:p-10">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--primary))_25%,hsl(var(--primary))_50%,transparent_50%,transparent_75%,hsl(var(--primary))_75%)] bg-[length:10px_10px]" />
              </div>
              
              <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                {/* Icon */}
                <motion.div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20 flex-shrink-0"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Code2 className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h4 className="text-2xl font-bold text-foreground mb-2">Custom API Access</h4>
                  <p className="text-muted-foreground mb-4">
                    Need a custom integration? Our RESTful API allows you to connect any third-party service or build custom workflows tailored to your facility's needs.
                  </p>
                  <motion.button
                    onClick={() => navigate('/contact')}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                    whileHover={{ x: 5 }}
                  >
                    Explore API Documentation
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntegrationsSection;
