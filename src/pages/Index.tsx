import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustBadges from '@/components/landing/TrustBadges';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TeamSection from '@/components/landing/TeamSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import BackToTop from '@/components/shared/BackToTop';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBadges />
        <FeaturesSection />
        <TeamSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
