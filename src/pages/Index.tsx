import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import BentoGrid from '@/components/landing/BentoGrid';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import TeamSection from '@/components/landing/TeamSection';
import TrustBadges from '@/components/landing/TrustBadges';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustBadges />
      <BentoGrid />
      <TestimonialsSection />
      <TeamSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;