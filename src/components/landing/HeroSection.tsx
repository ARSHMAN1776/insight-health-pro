import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10,000+', label: 'Patients Served' },
    { value: '50+', label: 'Healthcare Professionals' },
    { value: '99.9%', label: 'Uptime Reliability' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Full Background Image - More visible */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1920&h=1080&fit=crop&q=90" 
          alt="Confident medical team standing together"
          className="w-full h-full object-cover"
        />
        {/* Lighter overlay to show more of the image */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
      </div>
      
      <div className="w-full relative z-10">
        <div className="max-w-2xl">
          {/* Edge-to-edge glassmorphic box - no left rounded corners, more blur */}
          <div className="bg-background/20 backdrop-blur-2xl py-10 pl-4 sm:pl-8 lg:pl-16 pr-8 lg:pr-12 rounded-r-3xl border-y border-r border-white/10 shadow-2xl animate-fade-in">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center space-x-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/30">
                <CheckCircle className="w-4 h-4" />
                <span>Trusted Healthcare Platform</span>
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Modern Healthcare
              <span className="block text-gradient mt-2">Management System</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Streamline your healthcare operations with our comprehensive hospital management solution. 
              Empowering healthcare providers and patients with cutting-edge technology.
            </p>
            
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-10 group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30"
                >
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HIPAA Badge */}
        <div className="absolute bottom-8 right-8 hidden lg:block animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">HIPAA Compliant</p>
                <p className="text-xs text-muted-foreground">100% Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
