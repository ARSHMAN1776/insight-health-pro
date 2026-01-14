import { useNavigate } from "react-router-dom";
import { Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 lg:py-24">
          {/* Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Trusted by 50,000+ patients
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Health,{" "}
              <span className="text-primary">Our Priority</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Experience world-class healthcare with our team of expert physicians. 
              Book appointments, access medical records, and manage your health journey 
              all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="h-12 px-6 text-base font-medium"
                onClick={() => navigate("/login")}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book an Appointment
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-6 text-base font-medium"
                asChild
              >
                <a href="tel:1-800-HEALTH">
                  <Phone className="w-5 h-5 mr-2" />
                  1-800-HEALTH
                </a>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-8 pt-6 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">200+</p>
                <p className="text-sm text-muted-foreground">Expert Doctors</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div>
                <p className="text-2xl font-bold text-foreground">50k+</p>
                <p className="text-sm text-muted-foreground">Patients Served</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block"></div>
              <div className="hidden sm:block">
                <p className="text-2xl font-bold text-foreground">15+</p>
                <p className="text-sm text-muted-foreground">Specialties</p>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Abstract healthcare illustration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-background to-muted rounded-2xl border border-border flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Certified Excellence</h3>
                  <p className="text-sm text-muted-foreground">JCI Accredited • HIPAA Compliant</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border"></div>
    </section>
  );
};

export default HeroSection;
