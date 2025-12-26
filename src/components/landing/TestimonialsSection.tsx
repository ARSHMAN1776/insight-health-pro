import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const testimonials = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'Chief Medical Officer',
    organization: 'Metro General Hospital',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: 'This HMS has revolutionized how we manage patient care. The intuitive interface and comprehensive features have significantly improved our efficiency.',
  },
  {
    name: 'James Rodriguez',
    role: 'Hospital Administrator',
    organization: 'Sunrise Medical Center',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: 'The implementation was seamless. We\'ve seen a 40% reduction in administrative overhead since switching to this platform.',
  },
  {
    name: 'Dr. Emily Chen',
    role: 'Head of Pediatrics',
    organization: 'Children\'s Health Network',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: 'The patient portal has transformed how families interact with our clinic. Parents love being able to access records online.',
  },
  {
    name: 'Michael Thompson',
    role: 'IT Director',
    organization: 'Regional Healthcare System',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: 'From a technical standpoint, this is the most robust and secure HMS we\'ve evaluated. Outstanding API integrations.',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-10"></div>
      <div className="absolute top-1/2 left-0 w-1/3 h-96 bg-gradient-to-r from-primary/5 to-transparent blur-3xl -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-1/3 h-96 bg-gradient-to-l from-info/5 to-transparent blur-3xl -translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <ScrollAnimationWrapper className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
            <Star className="w-4 h-4 fill-primary" />
            Testimonials
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Loved by Healthcare
            <span className="text-gradient-mesh block mt-2">Professionals</span>
          </h2>
        </ScrollAnimationWrapper>

        {/* Featured Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="glass-card p-8 lg:p-12 rounded-3xl relative overflow-hidden">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-24 h-24 text-primary" />
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-xl">
                    <img 
                      src={testimonials[currentIndex].image} 
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Stars */}
                  <div className="flex justify-center lg:justify-start gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-xl lg:text-2xl text-foreground font-medium mb-6 leading-relaxed">
                    "{testimonials[currentIndex].text}"
                  </blockquote>
                  
                  {/* Author */}
                  <div>
                    <div className="font-bold text-foreground text-lg">{testimonials[currentIndex].name}</div>
                    <div className="text-muted-foreground">{testimonials[currentIndex].role}</div>
                    <div className="text-primary font-medium">{testimonials[currentIndex].organization}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted hover:border-primary/30 transition-all duration-300 hover:scale-110 hidden lg:flex"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted hover:border-primary/30 transition-all duration-300 hover:scale-110 hidden lg:flex"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => { setCurrentIndex(index); setIsAutoPlaying(false); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;