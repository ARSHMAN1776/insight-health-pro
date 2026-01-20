import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft, Receipt, Wallet, PieChart, Shield, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ScrollReveal } from '@/components/animations';

const BillingPayments = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Receipt, title: 'Auto Invoicing', description: 'Generate invoices automatically from services' },
    { icon: Wallet, title: 'Multiple Payment Modes', description: 'Accept cash, card, and digital payments' },
    { icon: PieChart, title: 'Revenue Analytics', description: 'Track income and identify trends' },
    { icon: Shield, title: 'Insurance Integration', description: 'Process claims with major insurers' },
    { icon: FileText, title: 'Tax Compliance', description: 'Automated tax calculations and reports' },
    { icon: RefreshCw, title: 'Payment Plans', description: 'Flexible installment options for patients' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </ScrollReveal>

          <div className="max-w-4xl">
            <ScrollReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CreditCard className="w-4 h-4" />
                <span>Core Feature</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                Billing & Payments
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Integrated billing and invoicing system. Streamline revenue cycle management, 
                process payments, and handle insurance claims effortlessly.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="px-8 py-6 text-lg rounded-full"
                >
                  Request Demo
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
              Key Capabilities
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Complete financial management for your healthcare facility
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={index * 0.1}>
                  <motion.div
                    className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
                    whileHover={{ y: -5, boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)' }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
                Simplify Your Billing
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Reduce billing errors and accelerate payment collection.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                variant="secondary"
                className="px-8 py-6 text-lg rounded-full"
              >
                Start Free Trial
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BillingPayments;
