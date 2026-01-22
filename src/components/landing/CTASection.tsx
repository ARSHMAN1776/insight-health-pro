import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, CheckCircle, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations';

const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    'No credit card required',
    '14-day free trial',
    'Cancel anytime',
    'Full feature access',
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Floating Circles */}
        <motion.div 
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-white/5"
          animate={{ 
            x: [-100, 50, -100],
            y: [-100, 50, -100],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-white/5"
          animate={{ 
            x: [100, -50, 100],
            y: [100, -50, 100],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="text-center">
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-white/20"
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Your Transformation Today</span>
              </motion.div>
              
              {/* Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
                Ready to Transform
                <span className="block mt-2 text-white/90">Your Healthcare?</span>
              </h2>
              
              {/* Description */}
              <p className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
                Join thousands of healthcare professionals who trust our platform 
                to deliver exceptional patient care.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/login')}
                    className="bg-white text-primary hover:bg-white/95 text-lg px-10 py-6 rounded-full shadow-2xl shadow-black/20 font-semibold group"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/contact')}
                    className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-10 py-6 rounded-full font-semibold group bg-transparent"
                  >
                    <MessageCircle className="mr-2 w-5 h-5" />
                    Schedule Demo
                  </Button>
                </motion.div>
              </div>

              {/* Benefits List */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-2 text-white/90"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-white/70" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Emergency Contact Card */}
              <motion.div 
                className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-white/70 text-sm">24/7 Emergency Line</p>
                  <p className="text-white text-xl font-bold">+1 (555) 911-1234</p>
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
