import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextReveal, MagneticButton, ParallaxSection } from '@/components/animations';
import heroHospital from '@/assets/hero-hospital.jpg';
const HeroSection = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10,000+', label: 'Patients Served' },
    { value: '50+', label: 'Healthcare Professionals' },
    { value: '99.9%', label: 'Uptime Reliability' },
    { value: '24/7', label: 'Support Available' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-background">
      {/* Background Image - Full Cover */}
      <div className="absolute inset-0">
        <ParallaxSection className="absolute inset-0 w-full h-full" speed={0.3}>
          <img 
            src={heroHospital}
            alt="Modern hospital building"
            className="w-full h-full object-cover"
          />
        </ParallaxSection>
        
        {/* Gradient Overlay - Light blur from left */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '100%',
              opacity: 0 
            }}
            animate={{ 
              y: '-20%',
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-2xl py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Trust Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.span 
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-medium border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Trusted Healthcare Platform</span>
            </motion.span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            <TextReveal text="Modern Healthcare" delay={0.3} />
            <span className="block text-primary mt-2">
              <TextReveal text="Management" delay={0.5} />
            </span>
            <span className="block text-primary">
              <TextReveal text="System" delay={0.7} />
            </span>
          </motion.h1>
          
          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl"
          >
            <span>Streamline your healthcare operations</span> with our comprehensive hospital management solution.
            <span className="font-semibold text-foreground"> Empowering healthcare providers and patients</span> with cutting-edge technology.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-10">
            <MagneticButton strength={0.3}>
              <Button 
                size="lg" 
                onClick={() => navigate('/onboarding')}
                className="text-lg px-8 shadow-lg shadow-primary/25 group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/login')}
                className="text-lg px-8"
              >
                Sign In
              </Button>
            </MagneticButton>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
              >
                <motion.div 
                  className="text-2xl sm:text-3xl font-bold text-primary"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* HIPAA Badge - Bottom Right */}
      <motion.div 
        className="absolute bottom-8 right-8 hidden lg:block"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 100 }}
      >
        <motion.div 
          className="bg-card/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg border border-border"
          whileHover={{ scale: 1.05, y: -3 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">HIPAA Compliant</p>
              <p className="text-xs text-muted-foreground">100% Secure</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
