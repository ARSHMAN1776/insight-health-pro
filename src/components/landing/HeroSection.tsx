import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextReveal, MagneticButton, ParallaxSection } from '@/components/animations';

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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Parallax Background Image */}
      <ParallaxSection className="absolute inset-0 w-full h-full" speed={0.3}>
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1920&h=1080&fit=crop&q=90')",
            minHeight: '100%'
          }}
          role="img"
          aria-label="Bright modern hospital with glass facade"
        />
      </ParallaxSection>
      
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
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
      
      <div className="w-full relative z-10">
        <motion.div 
          className="max-w-2xl py-10 pl-4 sm:pl-8 lg:pl-16 pr-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <motion.span 
              className="inline-flex items-center space-x-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Trusted Healthcare Platform</span>
            </motion.span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            <TextReveal text="Modern Healthcare" delay={0.3} />
            <span className="block text-gradient mt-2">
              <TextReveal text="Management System" delay={0.5} />
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-foreground/90 leading-relaxed mb-8 [text-shadow:_0_2px_8px_rgb(0_0_0_/_40%)]"
          >
            <span className="font-medium">Streamline your healthcare operations</span> with our comprehensive hospital management solution. 
            <span className="text-foreground font-medium"> Empowering healthcare providers and patients</span> with cutting-edge technology.
          </motion.p>

          {/* Stats Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  borderColor: 'hsl(var(--primary) / 0.3)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-primary"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* HIPAA Badge */}
      <motion.div 
        className="absolute bottom-8 right-8 hidden lg:block"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 100 }}
      >
        <motion.div 
          className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="w-5 h-5 text-primary" />
            </motion.div>
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
