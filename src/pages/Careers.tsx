import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import ScrollAnimationWrapper from "@/components/landing/ScrollAnimationWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, Heart, GraduationCap, Users, Sparkles } from "lucide-react";

const openings = [
  { title: "Senior Cardiologist", dept: "Cardiology", type: "Full-time", location: "On-site" },
  { title: "Registered Nurse (ICU)", dept: "Critical Care", type: "Full-time", location: "On-site" },
  { title: "Medical Lab Technologist", dept: "Pathology", type: "Full-time", location: "On-site" },
  { title: "Pediatrician", dept: "Pediatrics", type: "Full-time", location: "On-site" },
  { title: "Front Desk Receptionist", dept: "Administration", type: "Full-time", location: "On-site" },
  { title: "Pharmacist", dept: "Pharmacy", type: "Part-time", location: "On-site" },
];

const benefits = [
  { icon: Heart, title: "Health Coverage", desc: "Comprehensive medical, dental, and vision for you and family." },
  { icon: GraduationCap, title: "Learning Budget", desc: "Annual stipend for courses, conferences, and certifications." },
  { icon: Users, title: "Inclusive Culture", desc: "Diverse teams, mentorship, and clear career paths." },
  { icon: Sparkles, title: "Modern Tools", desc: "Work with state-of-the-art clinical and digital systems." },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-32 pb-20 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <ScrollAnimationWrapper>
            <Badge className="mb-4">We're hiring</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Build a Career That Heals</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join a mission-driven team transforming how hospitals deliver care.
            </p>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Work With Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {benefits.map((b, i) => (
              <ScrollAnimationWrapper key={b.title} delay={i * 60}>
                <Card className="h-full text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <b.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-center mb-10">Open Positions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {openings.map((j) => (
              <Card key={j.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{j.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{j.dept}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{j.type}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{j.location}</span>
                    </div>
                  </div>
                  <Button asChild>
                    <a href="mailto:careers@healthcare.com?subject=Application">Apply Now</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 text-muted-foreground">
            Don't see your role? Email us at{" "}
            <a className="text-primary underline" href="mailto:careers@healthcare.com">careers@healthcare.com</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default Careers;
