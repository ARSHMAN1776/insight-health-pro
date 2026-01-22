import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ChevronLeft, ChevronRight, Quote, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations';

const testimonials = [
  {
    id: 1,
    name: 'Dr. Jennifer Adams',
    role: 'Chief Medical Officer',
    location: 'Metro General Hospital',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "This HMS transformed our operations completely. We reduced patient wait times by 40% and our staff productivity increased dramatically. The intuitive interface made adoption seamless across all departments.",
    highlight: '40% faster patient processing',
  },
  {
    id: 2,
    name: 'Robert Chen',
    role: 'Hospital Administrator',
    location: 'Queens Medical Center',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "Staff scheduling went from 4 hours weekly to 30 minutes. The analytics dashboard provides insights we never had before. Our patient satisfaction scores are up 23% since implementation.",
    highlight: '23% higher satisfaction',
  },
  {
    id: 3,
    name: 'Lisa Martinez',
    role: 'Director of Nursing',
    location: 'St. Mary\'s Medical',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "The real-time bed management and nurse scheduling features have been game-changers. We can now optimize patient flow and reduce overtime costs significantly while improving care quality.",
    highlight: '35% reduced overtime',
  },
  {
    id: 4,
    name: 'Dr. Thomas Wright',
    role: 'Head of Cardiology',
    location: 'Heart Care Institute',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "The integrated EHR system gives me instant access to complete patient histories. I can make better-informed decisions faster. The telemedicine integration has expanded our reach to rural patients.",
    highlight: '2x patient capacity',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
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
    <section className="py-24 lg:py-32 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 text-primary text-sm font-semibold mb-6 border border-primary/10"
            whileHover={{ scale: 1.02 }}
          >
            <Star className="w-4 h-4 fill-primary" />
            <span>Success Stories</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Trusted by Healthcare
            <span className="block text-primary mt-2">Leaders Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how leading healthcare facilities transform their operations with our platform.
          </p>
        </ScrollReveal>

        {/* Main Testimonial Display */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2 border-primary/10 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-5 gap-0">
                      {/* Left - Image & Info */}
                      <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 p-8 lg:p-12 flex flex-col justify-center items-center text-center">
                        <motion.div 
                          className="relative mb-6"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                            <img 
                              src={testimonials[currentIndex].image} 
                              alt={testimonials[currentIndex].name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Quote icon */}
                          <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                            <Quote className="w-5 h-5 text-primary-foreground" />
                          </div>
                        </motion.div>
                        
                        <h4 className="font-bold text-foreground text-xl mb-1">
                          {testimonials[currentIndex].name}
                        </h4>
                        <p className="text-primary font-medium mb-1">
                          {testimonials[currentIndex].role}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {testimonials[currentIndex].location}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        
                        {/* Highlight Badge */}
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {testimonials[currentIndex].highlight}
                        </div>
                      </div>
                      
                      {/* Right - Quote */}
                      <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                        <blockquote className="text-xl lg:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                          "{testimonials[currentIndex].text}"
                        </blockquote>
                        
                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {testimonials.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setIsAutoPlaying(false);
                                  setCurrentIndex(index);
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  index === currentIndex 
                                    ? 'w-8 bg-primary' 
                                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 rounded-full" 
                              onClick={prevTestimonial}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-10 w-10 rounded-full" 
                              onClick={nextTestimonial}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Stats */}
        <ScrollReveal animation="fade-up" delay={0.3}>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 pt-8 border-t border-border/50">
            {[
              { value: '500+', label: 'Healthcare Facilities' },
              { value: '50,000+', label: 'Healthcare Staff' },
              { value: '2M+', label: 'Patients Served' },
              { value: '4.9/5', label: 'Average Rating' },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TestimonialsSection;
