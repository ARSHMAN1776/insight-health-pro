import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Jennifer Adams',
    role: 'Patient since 2021',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "After my surgery last year, the follow-up care was exceptional. Dr. Thompson personally called to check on my recovery. The patient portal made it easy to track my appointments and medications. Couldn't ask for better care.",
    date: 'March 2024',
  },
  {
    id: 2,
    name: 'Robert Chen',
    role: 'Hospital Administrator',
    location: 'Queens Medical Center',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "We implemented this HMS system 18 months ago. Staff scheduling went from 4 hours weekly to 30 minutes. The reporting dashboard gives us insights we never had before. Our patient satisfaction scores are up 23%.",
    date: 'February 2024',
  },
  {
    id: 3,
    name: 'Lisa Martinez',
    role: 'Mother of 3',
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "With three kids, I need a healthcare system that works. Booking pediatric appointments online at 10pm when I finally have time? Game changer. Dr. Santos is amazing with my children - they actually look forward to checkups.",
    date: 'January 2024',
  },
  {
    id: 4,
    name: 'Thomas Wright',
    role: 'Retired Teacher',
    location: 'Staten Island, NY',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    rating: 5,
    text: "At 72, I was skeptical about digital healthcare. The staff walked me through everything. Now I video call my cardiologist from home. My wife and I both use the prescription refill feature - it's straightforward and reliable.",
    date: 'December 2023',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Patient Stories
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Real Experiences, <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Real Results</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear directly from patients and healthcare professionals who use our platform every day.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="group border border-border/50 hover:border-primary/20 bg-card hover:shadow-xl transition-all duration-500"
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground/70">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{testimonial.date}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/10" />
                  <p className="text-muted-foreground leading-relaxed pl-6">
                    {testimonial.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <Card className="border border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-border"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{testimonials[currentIndex].name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonials[currentIndex].text}"
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{testimonials[currentIndex].date}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevTestimonial}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {testimonials.length}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextTestimonial}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust indicator */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Trusted by <span className="font-semibold text-foreground">10,000+</span> patients across New York
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
