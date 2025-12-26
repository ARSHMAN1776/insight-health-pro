import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-mesh-intense"></div>
      
      {/* Animated Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl blob blob-1 animate-float-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl blob blob-2 animate-float-reverse"></div>
      
      {/* Dots Pattern */}
      <div className="absolute inset-0 bg-dots opacity-10"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollAnimationWrapper>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" />
              Limited Time Offer
            </div>
          </ScrollAnimationWrapper>
          
          <ScrollAnimationWrapper delay={100}>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your
              <span className="block mt-2">Healthcare Practice?</span>
            </h2>
          </ScrollAnimationWrapper>
          
          <ScrollAnimationWrapper delay={200}>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of healthcare providers who trust our platform to deliver exceptional patient care.
            </p>
          </ScrollAnimationWrapper>
          
          <ScrollAnimationWrapper delay={300}>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-7 rounded-2xl shadow-xl group font-semibold hover:scale-105 transition-all duration-500"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </ScrollAnimationWrapper>

          {/* Emergency Contact */}
          <ScrollAnimationWrapper delay={400}>
            <div className="mt-12 inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl">
              <div className="relative">
                <Phone className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></span>
              </div>
              <div className="text-left">
                <div className="text-white/70 text-sm">24/7 Support Line</div>
                <div className="text-white font-bold text-lg">1-800-HEALTH</div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
};

export default CTASection;