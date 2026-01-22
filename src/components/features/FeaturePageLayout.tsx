import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ArrowRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ScrollReveal } from '@/components/animations';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Benefit {
  text: string;
}

interface FeaturePageLayoutProps {
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  features: Feature[];
  stats?: Stat[];
  benefits?: Benefit[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    hospital: string;
  };
  ctaTitle: string;
  ctaDescription: string;
}

const FeaturePageLayout: React.FC<FeaturePageLayoutProps> = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  description,
  heroImage,
  features,
  stats,
  benefits,
  testimonial,
  ctaTitle,
  ctaDescription,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Image */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-muted/50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <ScrollReveal delay={0.1}>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <BadgeIcon className="w-4 h-4" />
                  <span>{badge}</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 leading-tight">
                  {title}
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.25}>
                <p className="text-xl lg:text-2xl text-primary font-medium mb-4">
                  {subtitle}
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {description}
                </p>
              </ScrollReveal>

              {/* Benefits List */}
              {benefits && benefits.length > 0 && (
                <ScrollReveal delay={0.35}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal delay={0.4}>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => navigate('/login')}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full shadow-lg shadow-primary/25"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/contact')}
                    className="px-8 rounded-full"
                  >
                    Schedule Demo
                  </Button>
                </div>
              </ScrollReveal>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2">
              <ScrollReveal delay={0.2}>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {/* Image Container with Shadow and Border */}
                  <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50">
                    <img 
                      src={heroImage}
                      alt={title}
                      className="w-full h-64 sm:h-80 lg:h-[450px] object-cover"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
                  </div>
                  
                  {/* Floating Stats Card */}
                  {stats && stats.length > 0 && (
                    <motion.div 
                      className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-xl hidden sm:block"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-4">
                        {stats.slice(0, 2).map((stat, index) => (
                          <div key={index} className={index > 0 ? 'pl-4 border-l border-border' : ''}>
                            <div className="text-2xl font-bold text-primary">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                </motion.div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && stats.length > 2 && (
        <section className="py-12 border-y border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                <span>Powerful Features</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Key Capabilities
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Everything you need to transform your healthcare operations
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={index * 0.1}>
                  <motion.div
                    className="group relative bg-card p-6 lg:p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
                    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    
                    {/* Hover Arrow */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      {testimonial && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center">
                <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
                <blockquote className="text-2xl lg:text-3xl font-medium text-foreground mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary">{testimonial.hospital}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-10 lg:p-16">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
              </div>
              
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground mb-6">
                  {ctaTitle}
                </h2>
                <p className="text-lg lg:text-xl text-primary-foreground/80 mb-10 leading-relaxed">
                  {ctaDescription}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    onClick={() => navigate('/login')}
                    size="lg"
                    variant="secondary"
                    className="px-10 rounded-full shadow-lg text-base font-semibold"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/contact')}
                    size="lg"
                    variant="outline"
                    className="px-10 rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base font-semibold"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturePageLayout;
