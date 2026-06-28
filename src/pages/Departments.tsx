import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import ScrollAnimationWrapper from "@/components/landing/ScrollAnimationWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Heart, Brain, Baby, Bone, Eye, Stethoscope, Activity,
  Microscope, Pill, Syringe, ArrowRight,
} from "lucide-react";

const departments = [
  { icon: Heart, name: "Cardiology", desc: "Comprehensive heart care including diagnostics, interventions, and rehabilitation." },
  { icon: Brain, name: "Neurology", desc: "Advanced care for disorders of the brain, spine, and nervous system." },
  { icon: Baby, name: "Pediatrics", desc: "Child-focused care from newborns through adolescents with compassion." },
  { icon: Bone, name: "Orthopedics", desc: "Joint, bone, and musculoskeletal treatments and surgeries." },
  { icon: Eye, name: "Ophthalmology", desc: "Complete eye care from routine exams to advanced surgical procedures." },
  { icon: Stethoscope, name: "General Medicine", desc: "Primary care, preventive screenings, and chronic disease management." },
  { icon: Activity, name: "Emergency & Trauma", desc: "24/7 emergency response with rapid triage and critical interventions." },
  { icon: Microscope, name: "Pathology & Lab", desc: "Accurate diagnostics powered by modern laboratory technology." },
  { icon: Pill, name: "Pharmacy", desc: "In-house pharmacy with prescription management and counseling." },
  { icon: Syringe, name: "Vaccination", desc: "Routine and travel vaccinations for all ages with digital records." },
];

const Departments = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-32 pb-20 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <ScrollAnimationWrapper>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Departments</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Specialized care across every major medical discipline, delivered by experienced teams.
            </p>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((d, i) => (
              <ScrollAnimationWrapper key={d.name} delay={i * 50}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <d.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{d.name}</h3>
                    <p className="text-muted-foreground">{d.desc}</p>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" onClick={() => navigate('/contact')}>
              Book a Consultation <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default Departments;
