import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Target, Eye, Users } from "lucide-react";

const AboutUs = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "25+ years of experience in healthcare management and patient care excellence.",
    },
    {
      name: "Dr. Michael Chen",
      role: "Head of Surgery",
      description: "Renowned surgeon specializing in minimally invasive procedures and patient outcomes.",
    },
    {
      name: "Emily Rodriguez",
      role: "Director of Nursing",
      description: "Leading our nursing team with compassion and dedication to quality care.",
    },
    {
      name: "Dr. James Wilson",
      role: "Head of Emergency Medicine",
      description: "Expert in emergency care with focus on rapid response and critical care.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">About Us</h1>
            </div>
            <nav className="hidden md:flex gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
              <Button variant="ghost" onClick={() => navigate('/services')}>Services</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Committed to Your Health & Wellbeing
            </h2>
            <p className="text-lg text-muted-foreground">
              Our hospital has been a cornerstone of healthcare excellence in the community for over 50 years,
              providing compassionate care and innovative medical solutions.
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl">Our History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Founded in 1973, our hospital began as a small community clinic with a vision to provide
                accessible, quality healthcare to all. Over the decades, we've grown into a comprehensive
                medical facility equipped with state-of-the-art technology and staffed by dedicated healthcare
                professionals.
              </p>
              <p>
                Through continuous innovation and unwavering commitment to patient care, we've expanded our
                services to include specialized departments, advanced diagnostic facilities, and cutting-edge
                treatment options. Today, we proudly serve thousands of patients annually, maintaining the same
                values of compassion and excellence that guided our founders.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To deliver exceptional, patient-centered healthcare through compassionate service,
                  medical excellence, and innovative treatment approaches. We strive to improve the health
                  and wellbeing of every individual we serve, treating each patient with dignity, respect,
                  and personalized attention.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be the leading healthcare institution recognized for clinical excellence, innovative
                  practices, and outstanding patient outcomes. We envision a future where advanced medical
                  care is accessible to all, supported by cutting-edge technology and delivered by
                  compassionate professionals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Our Leadership Team</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Meet the dedicated professionals leading our mission to provide exceptional healthcare services
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription className="text-primary font-medium">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Experience Quality Care?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of satisfied patients who trust us with their healthcare needs
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/login")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Hospital Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
