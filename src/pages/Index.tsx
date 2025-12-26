import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TrustBadges from '@/components/landing/TrustBadges';
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
      <CTASection />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
