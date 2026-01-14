import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Calendar, Search, Stethoscope, Shield, Clock, Award } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const rotatingTexts = [
    'Management System',
    'Excellence Center',
    'Care Solutions',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '10,000+', label: 'Patients Served', icon: CheckCircle },
    { value: '50+', label: 'Expert Doctors', icon: Stethoscope },
    { value: '99.9%', label: 'Uptime Reliability', icon: Clock },
    { value: '24/7', label: 'Support Available', icon: Shield }
  ];

  const trustBadges = [
    { icon: Shield, label: 'HIPAA Compliant' },
    { icon: Award, label: 'JCI Accredited' },
    { icon: CheckCircle, label: 'ISO Certified' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1920&h=1080&fit=crop&q=90" 
          alt="Modern hospital facility"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40"></div>
        {/* Additional dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse hidden lg:block" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse hidden lg:block" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl animate-fade-in">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 mb-6">
              <CheckCircle className="w-4 h-4" />
              <span>Trusted by 10,000+ Patients</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
              Modern Healthcare
              <span className="block h-[1.2em] overflow-hidden mt-2">
                <span 
                  className="text-gradient block transition-transform duration-500"
                  style={{ transform: `translateY(-${currentTextIndex * 100}%)` }}
                >
                  {rotatingTexts.map((text, i) => (
                    <span key={i} className="block h-[1.2em]">{text}</span>
                  ))}
                </span>
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Streamline your healthcare operations with our comprehensive hospital management solution. 
              <span className="text-foreground font-medium"> Empowering healthcare providers</span> and patients with cutting-edge technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button 
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 group"
              >
                <Calendar className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Schedule Appointment
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/about#team')}
                className="text-lg px-8 py-6 rounded-full border-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Find a Doctor
              </Button>
            </div>

            {/* Trust Badges Row */}
            <div className="flex flex-wrap gap-4">
              {trustBadges.map((badge, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Stats Cards */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Floating HIPAA Badge */}
            <div className="mt-6 p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl inline-flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">100% Secure & Private</p>
                <p className="text-sm text-muted-foreground">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-10 lg:hidden">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50"
            >
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
