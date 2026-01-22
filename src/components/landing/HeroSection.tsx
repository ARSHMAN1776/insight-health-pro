import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Play, Shield, Clock, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextReveal, MagneticButton, ParallaxSection } from '@/components/animations';
import heroHospital from '@/assets/hero-hospital.jpg';

const HeroSection = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10,000+', label: 'Patients Served', icon: Users },
    { value: '50+', label: 'Healthcare Pros', icon: Shield },
    { value: '99.9%', label: 'Uptime', icon: Clock },
    { value: '24/7', label: 'Support', icon: Sparkles }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0">
        <ParallaxSection className="absolute inset-0 w-full h-full" speed={0.2}>
          <img 
            src={heroHospital}
            alt="Modern hospital building"
            className="w-full h-full object-cover scale-105"
          />
        </ParallaxSection>
        
        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        
        {/* Animated Mesh Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" />
        </div>
      </div>

      {/* Animated Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, hsl(var(--primary) / ${Math.random() * 0.1 + 0.05}) 0%, transparent 70%)`,
            }}
            animate={{ 
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20 lg:py-0">
          {/* Left Content */}
          <motion.div 
            className="max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Trust Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <motion.span 
                className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-primary/5 text-primary px-6 py-3 rounded-full text-sm font-semibold border border-primary/20 backdrop-blur-sm"
                whileHover={{ scale: 1.03, boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.3)' }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>Trusted by 500+ Healthcare Facilities</span>
              </motion.span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6">
                <TextReveal text="The Future of" delay={0.2} />
                <span className="block mt-2">
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                    <TextReveal text="Healthcare" delay={0.4} />
                  </span>
                </span>
                <span className="block text-foreground/80 text-3xl sm:text-4xl lg:text-5xl mt-2">
                  <TextReveal text="Management" delay={0.6} />
                </span>
              </h1>
            </motion.div>
            
            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl"
            >
              Transform your healthcare operations with our 
              <span className="text-foreground font-medium"> AI-powered</span> hospital management platform. 
              Seamless patient care, 
              <span className="text-primary font-medium"> intelligent automation</span>, 
              and enterprise-grade security.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-12">
              <MagneticButton strength={0.15}>
                <Button 
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-xl shadow-primary/25 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </MagneticButton>
              
              <MagneticButton strength={0.15}>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/contact')}
                  className="px-8 py-6 text-lg rounded-full border-2 group"
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </MagneticButton>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={index} 
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                  >
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 text-center hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <div className="flex justify-center mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <motion.div 
                        className="text-xl sm:text-2xl font-bold text-foreground"
                        whileHover={{ scale: 1.05 }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Side - Feature Cards */}
          <motion.div 
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          >
            {/* Floating Cards */}
            <div className="relative h-[600px]">
              {/* Main Card */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-border/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">HIPAA Compliant</h3>
                      <p className="text-sm text-muted-foreground">Enterprise Security</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Security Score: 100%</p>
                </div>
              </motion.div>

              {/* Top Right Card */}
              <motion.div 
                className="absolute top-10 right-0 w-64"
                animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">+247 Patients</p>
                      <p className="text-xs text-muted-foreground">This Week</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bottom Left Card */}
              <motion.div 
                className="absolute bottom-20 left-0 w-72"
                animate={{ y: [0, -8, 0], x: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Avg Wait Time</p>
                      <p className="text-xs text-muted-foreground">Real-time tracking</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">12 min</div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-0 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
