import React from 'react';
import Navbar from '@/components/landing/Navbar';
import TopBar from '@/components/landing/TopBar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TrustBadges from '@/components/landing/TrustBadges';
import TeamSection from '@/components/landing/TeamSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import BackToTop from '@/components/shared/BackToTop';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Top Utility Bar */}
      <TopBar />
      
      {/* Main Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Trust Badges */}
      <TrustBadges />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Call to Action */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
      
      {/* Back to Top Button */}
      <BackToTop />

      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default Index;
