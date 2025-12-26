import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Clock, Shield, Award, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import FloatingElements from './FloatingElements';
import AnimatedCounter from './AnimatedCounter';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: 'Patients Served', delay: 0 },
  { icon: Award, value: 500, suffix: '+', label: 'Healthcare Pros', delay: 100 },
  { icon: Clock, value: 99, suffix: '.9%', label: 'System Uptime', delay: 200 },
  { icon: Shield, value: 24, suffix: '/7', label: 'Support', delay: 300 },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <AnimatedBackground />
      <FloatingElements />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <ScrollAnimationWrapper delay={0}>
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-xl border border-primary/20 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              Now with AI-Powered Diagnostics
            </div>
          </ScrollAnimationWrapper>
          
          {/* Main Headline */}
          <ScrollAnimationWrapper delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Healthcare
              <span className="text-gradient-mesh block">Reimagined</span>
            </h1>
          </ScrollAnimationWrapper>
          
          {/* Subheadline */}
          <ScrollAnimationWrapper delay={200}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              The complete hospital management platform that empowers healthcare providers 
              to deliver exceptional patient care with cutting-edge technology.
            </p>
          </ScrollAnimationWrapper>
          
          {/* CTA Buttons */}
          <ScrollAnimationWrapper delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="btn-primary text-lg px-10 py-7 rounded-2xl group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-7 rounded-2xl border-2 border-border hover:bg-muted/50 hover:border-primary/30 group backdrop-blur-xl"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </ScrollAnimationWrapper>
          
          {/* Stats */}
          <ScrollAnimationWrapper delay={400}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="glass-card p-6 rounded-2xl hover:shadow-glow transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;