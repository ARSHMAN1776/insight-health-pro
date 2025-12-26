import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Target, Eye, Users, Award, Clock, Shield, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import ScrollAnimationWrapper from "@/components/landing/ScrollAnimationWrapper";
import AnimatedCounter from "@/components/landing/AnimatedCounter";

const AboutUs = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "25+ years of experience in healthcare management and patient care excellence.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "Dr. Michael Chen",
      role: "Head of Surgery",
      description: "Renowned surgeon specializing in minimally invasive procedures and patient outcomes.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "Emily Rodriguez",
      role: "Director of Nursing",
      description: "Leading our nursing team with compassion and dedication to quality care.",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "Dr. James Wilson",
      role: "Head of Emergency Medicine",
      description: "Expert in emergency care with focus on rapid response and critical care.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&q=80"
    },
  ];

  const stats = [
    { value: 50, suffix: "+", label: "Years of Excellence" },
    { value: 10000, suffix: "+", label: "Patients Served" },
    { value: 200, suffix: "+", label: "Medical Staff" },
    { value: 98, suffix: "%", label: "Patient Satisfaction" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We treat every patient with empathy, understanding, and genuine care."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for the highest standards in medical care and patient outcomes."
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We uphold the highest ethical standards in all our interactions."
    },
    {
      icon: Clock,
      title: "Accessibility",
      description: "We ensure quality healthcare is available to everyone, 24/7."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Trusted Since 1973</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="text-gradient">Committed to Your</span>
                <br />
                <span className="text-foreground">Health & Wellbeing</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our hospital has been a cornerstone of healthcare excellence in the community for over 50 years, providing compassionate care and innovative medical solutions.
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimationWrapper>
            <Card className="max-w-5xl mx-auto overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop&q=80" 
                    alt="Hospital Building"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
                </div>
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Our History</h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Founded in 1973, our hospital began as a small community clinic with a vision to provide accessible, quality healthcare to all. Over the decades, we've grown into a comprehensive medical facility equipped with state-of-the-art technology.
                    </p>
                    <p>
                      Through continuous innovation and unwavering commitment to patient care, we've expanded our services to include specialized departments, advanced diagnostic facilities, and cutting-edge treatment options.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 relative bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ScrollAnimationWrapper delay={0}>
              <Card className="group h-full border-2 border-border/50 hover:border-primary/50 transition-all duration-500 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Our Mission</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg">
                    To deliver exceptional, patient-centered healthcare through compassionate service, medical excellence, and innovative treatment approaches. We strive to improve the health and wellbeing of every individual we serve.
                  </p>
                </CardContent>
              </Card>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={0.1}>
              <Card className="group h-full border-2 border-border/50 hover:border-primary/50 transition-all duration-500 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Our Vision</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg">
                    To be the leading healthcare institution recognized for clinical excellence, innovative practices, and outstanding patient outcomes. We envision a future where advanced medical care is accessible to all.
                  </p>
                </CardContent>
              </Card>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className="group text-center h-full border-2 border-border/50 hover:border-primary/50 transition-all duration-500 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <value.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 relative bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">Our Leadership Team</h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet the dedicated professionals leading our mission to provide exceptional healthcare services
              </p>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className="group text-center overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 h-full">
                  <div className="relative pt-8 px-8">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary/50 p-1">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover bg-background"
                        />
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pt-4">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{member.name}</CardTitle>
                    <CardDescription className="text-primary font-semibold">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimationWrapper>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to Experience Quality Care?</h2>
              <p className="text-xl text-muted-foreground mb-10">
                Join thousands of satisfied patients who trust us with their healthcare needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/login")}
                  className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8 py-6 text-lg shadow-xl shadow-primary/20"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/services")}
                  className="px-8 py-6 text-lg border-2 hover:bg-primary/10"
                >
                  View Our Services
                </Button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;