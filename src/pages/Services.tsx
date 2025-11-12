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
  Hospital
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const departments = [
    {
      icon: Heart,
      name: "Cardiology",
      description: "Expert care for heart conditions, including diagnosis, treatment, and prevention of cardiovascular diseases.",
      services: ["ECG", "Echocardiography", "Cardiac Catheterization", "Heart Surgery"]
    },
    {
      icon: Brain,
      name: "Neurology",
      description: "Specialized treatment for brain, spine, and nervous system disorders with state-of-the-art technology.",
      services: ["MRI", "CT Scan", "EEG", "Neurological Surgery"]
    },
    {
      icon: Baby,
      name: "Pediatrics",
      description: "Comprehensive healthcare services for infants, children, and adolescents with a caring approach.",
      services: ["Neonatal Care", "Vaccination", "Child Development", "Pediatric Surgery"]
    },
    {
      icon: Bone,
      name: "Orthopedics",
      description: "Treatment of musculoskeletal conditions, sports injuries, and joint replacement procedures.",
      services: ["Joint Replacement", "Sports Medicine", "Fracture Care", "Spine Surgery"]
    },
    {
      icon: Eye,
      name: "Ophthalmology",
      description: "Complete eye care services including vision correction, cataract surgery, and retinal treatments.",
      services: ["Cataract Surgery", "LASIK", "Retinal Care", "Glaucoma Treatment"]
    },
    {
      icon: UserRound,
      name: "Dermatology",
      description: "Expert skin care and treatment for various dermatological conditions and cosmetic procedures.",
      services: ["Skin Cancer Screening", "Acne Treatment", "Cosmetic Dermatology", "Laser Therapy"]
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">HealthCare Plus</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
            <Button variant="ghost" onClick={() => navigate('/about')}>About</Button>
            <Button variant="ghost" className="text-primary">Services</Button>
          </nav>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Our Medical Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comprehensive healthcare services delivered with excellence, compassion, and cutting-edge technology
          </p>
        </div>
      </section>

      {/* Medical Departments */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Medical Departments</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our specialized departments offer expert care across various medical fields
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-border">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <dept.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{dept.name}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Key Services:</p>
                    <ul className="space-y-1">
                      {dept.services.map((service, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Specialized Care</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert care from highly trained specialists in various medical fields
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-border">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <spec.icon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{spec.name}</CardTitle>
                  <CardDescription>{spec.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Healthcare Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete range of medical services available round the clock
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-border">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <service.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {service.availability}
                    </span>
                  </div>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Need Medical Assistance?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our team of experienced healthcare professionals is ready to provide you with the best medical care
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              Book an Appointment
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">HealthCare Plus</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Providing quality healthcare services with compassion and excellence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/')}>Home</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/about')}>About Us</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/services')}>Services</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>123 Medical Center Drive</li>
                <li>Healthcare City, HC 12345</li>
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@healthcareplus.com</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Emergency</h3>
              <p className="text-sm text-muted-foreground mb-2">24/7 Emergency Services</p>
              <p className="text-2xl font-bold text-primary">(555) 911-HELP</p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 HealthCare Plus Hospital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;