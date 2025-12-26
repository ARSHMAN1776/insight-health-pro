import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Brain, 
  Baby, 
  Bone, 
  Eye, 
  Stethoscope, 
  Activity, 
  Microscope, 
  Pill, 
  Ambulance,
  Syringe,
  Scan,
  UserRound,
  Thermometer,
  HeartPulse,
  Hospital,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import ScrollAnimationWrapper from "@/components/landing/ScrollAnimationWrapper";

const Services = () => {
  const navigate = useNavigate();

  const departments = [
    {
      icon: Heart,
      name: "Cardiology",
      description: "Expert care for heart conditions, including diagnosis, treatment, and prevention of cardiovascular diseases.",
      services: ["ECG", "Echocardiography", "Cardiac Catheterization", "Heart Surgery"],
      color: "from-red-500/20 to-pink-500/20"
    },
    {
      icon: Brain,
      name: "Neurology",
      description: "Specialized treatment for brain, spine, and nervous system disorders with state-of-the-art technology.",
      services: ["MRI", "CT Scan", "EEG", "Neurological Surgery"],
      color: "from-purple-500/20 to-indigo-500/20"
    },
    {
      icon: Baby,
      name: "Pediatrics",
      description: "Comprehensive healthcare services for infants, children, and adolescents with a caring approach.",
      services: ["Neonatal Care", "Vaccination", "Child Development", "Pediatric Surgery"],
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Bone,
      name: "Orthopedics",
      description: "Treatment of musculoskeletal conditions, sports injuries, and joint replacement procedures.",
      services: ["Joint Replacement", "Sports Medicine", "Fracture Care", "Spine Surgery"],
      color: "from-orange-500/20 to-amber-500/20"
    },
    {
      icon: Eye,
      name: "Ophthalmology",
      description: "Complete eye care services including vision correction, cataract surgery, and retinal treatments.",
      services: ["Cataract Surgery", "LASIK", "Retinal Care", "Glaucoma Treatment"],
      color: "from-teal-500/20 to-emerald-500/20"
    },
    {
      icon: UserRound,
      name: "Dermatology",
      description: "Expert skin care and treatment for various dermatological conditions and cosmetic procedures.",
      services: ["Skin Cancer Screening", "Acne Treatment", "Cosmetic Dermatology", "Laser Therapy"],
      color: "from-rose-500/20 to-pink-500/20"
    }
  ];

  const specializations = [
    {
      icon: Stethoscope,
      name: "General Medicine",
      description: "Primary care and treatment for common health conditions and routine check-ups."
    },
    {
      icon: Syringe,
      name: "Oncology",
      description: "Comprehensive cancer care with advanced treatment options and supportive care services."
    },
    {
      icon: HeartPulse,
      name: "Critical Care",
      description: "24/7 intensive care unit for critically ill patients requiring constant monitoring."
    },
    {
      icon: Thermometer,
      name: "Internal Medicine",
      description: "Diagnosis and treatment of adult diseases affecting internal organs and systems."
    }
  ];

  const services = [
    {
      icon: Ambulance,
      name: "Emergency Services",
      description: "Round-the-clock emergency care with rapid response and advanced life support.",
      availability: "24/7"
    },
    {
      icon: Activity,
      name: "Surgical Services",
      description: "State-of-the-art operation theaters with minimally invasive and robotic surgery options.",
      availability: "24/7"
    },
    {
      icon: Microscope,
      name: "Laboratory Services",
      description: "Comprehensive diagnostic testing with accurate and timely results.",
      availability: "24/7"
    },
    {
      icon: Scan,
      name: "Radiology & Imaging",
      description: "Advanced imaging services including MRI, CT, X-ray, and ultrasound.",
      availability: "24/7"
    },
    {
      icon: Pill,
      name: "Pharmacy Services",
      description: "In-house pharmacy with a wide range of medications and expert consultation.",
      availability: "24/7"
    },
    {
      icon: Hospital,
      name: "Inpatient Care",
      description: "Comfortable patient rooms with modern amenities and attentive nursing care.",
      availability: "24/7"
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
                <Stethoscope className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">World-Class Healthcare</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="text-gradient">Our Medical</span>
                <br />
                <span className="text-foreground">Services</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive healthcare services delivered with excellence, compassion, and cutting-edge technology
              </p>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Medical Departments */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Medical Departments</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our specialized departments offer expert care across various medical fields
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className={`group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br ${dept.color} backdrop-blur-sm h-full`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/95" />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <dept.icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">{dept.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base">{dept.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Key Services:</p>
                      <ul className="space-y-2">
                        {dept.services.map((service, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 relative bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Specialized Care</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Expert care from highly trained specialists in various medical fields
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className="group text-center hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-2 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm h-full">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <spec.icon className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{spec.name}</CardTitle>
                    <CardDescription className="mt-2">{spec.description}</CardDescription>
                  </CardHeader>
                </Card>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Services */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Healthcare Services</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete range of medical services available round the clock
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-2 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                          <service.icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">{service.name}</CardTitle>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-bold rounded-full border border-primary/30 animate-pulse">
                        {service.availability}
                      </span>
                    </div>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
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
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Need Medical Assistance?</h2>
              <p className="text-xl text-muted-foreground mb-10">
                Our team of experienced healthcare professionals is ready to provide you with the best medical care
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8 py-6 text-lg shadow-xl shadow-primary/20"
                >
                  Book an Appointment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/about')}
                  className="px-8 py-6 text-lg border-2 hover:bg-primary/10"
                >
                  Learn More About Us
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

export default Services;