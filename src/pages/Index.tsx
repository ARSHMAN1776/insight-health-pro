import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import DepartmentsSection from '@/components/landing/DepartmentsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import IntegrationsSection from '@/components/landing/IntegrationsSection';
import TrustBadges from '@/components/landing/TrustBadges';
import TeamSection from '@/components/landing/TeamSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import BackToTop from '@/components/shared/BackToTop';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      <HeroSection />
      <TrustBadges />
      <FeaturesSection />
      <DepartmentsSection />
      <HowItWorksSection />
      <PricingSection />
      <IntegrationsSection />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
