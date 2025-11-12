import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Shield, 
  Clock,
  Users,
  Activity,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Appointment Management',
      description: 'Schedule and manage appointments with ease. Real-time availability and automated reminders.',
      color: 'bg-medical-blue'
    },
    {
      icon: FileText,
      title: 'Electronic Health Records',
      description: 'Secure, centralized medical records accessible anytime, anywhere with complete privacy.',
      color: 'bg-medical-purple'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Bank-level security ensuring your medical data is protected with industry standards.',
      color: 'bg-medical-green'
    },
    {
      icon: Activity,
      title: 'Lab & Diagnostics',
      description: 'Integrated lab test management with instant results and comprehensive reports.',
      color: 'bg-medical-orange'
    },
    {
      icon: Users,
      title: 'Patient Portal',
      description: 'Empowering patients with 24/7 access to their health information and services.',
      color: 'bg-medical-blue'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications for appointments, results, and prescriptions.',
      color: 'bg-medical-purple'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Patients Served' },
    { value: '50+', label: 'Healthcare Professionals' },
    { value: '99.9%', label: 'Uptime Reliability' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/95 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">HealthCare HMS</h1>
                <p className="text-xs text-muted-foreground">Hospital Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/about')}
                className="hidden md:flex"
              >
                About Us
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/services')}
                className="hidden md:flex"
              >
                Services
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="hidden sm:flex"
              >
                Staff Portal
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                Patient Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Trusted Healthcare Platform</span>
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Modern Healthcare
                <span className="block text-primary mt-2">Management System</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Streamline your healthcare operations with our comprehensive hospital management solution. 
                Empowering healthcare providers and patients with cutting-edge technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="text-lg px-8"
                >
                  <Stethoscope className="mr-2 w-5 h-5" />
                  Staff Login
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-3xl"></div>
                <Card className="relative backdrop-blur-sm bg-card/50 border-2 shadow-2xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-medical-blue/10 to-medical-blue/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Next Appointment</div>
                          <div className="text-sm text-muted-foreground">Dr. Smith - 2:30 PM</div>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-medical-green" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-medical-green/10 to-medical-green/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-medical-green rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Lab Results</div>
                          <div className="text-sm text-muted-foreground">Ready to view</div>
                        </div>
                      </div>
                      <Activity className="w-6 h-6 text-medical-green" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-medical-purple/10 to-medical-purple/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-medical-purple rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Prescription</div>
                          <div className="text-sm text-muted-foreground">Refill available</div>
                        </div>
                      </div>
                      <Clock className="w-6 h-6 text-medical-purple" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to deliver exceptional patient care and streamline hospital operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="bg-gradient-to-br from-primary to-primary/90 border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <CardContent className="p-12 lg:p-16 relative z-10">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground">
                  Ready to Transform Your Healthcare Experience?
                </h2>
                <p className="text-xl text-primary-foreground/90">
                  Join thousands of satisfied users who trust our platform for their healthcare needs
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('/login')}
                    className="text-lg px-8 shadow-lg"
                  >
                    Patient Portal
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Stethoscope className="mr-2 w-5 h-5" />
                    Staff Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">HealthCare HMS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering healthcare through innovative technology solutions
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/about')} className="hover:text-primary transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-primary transition-colors">Services</button></li>
                <li><a href="#" className="hover:text-primary transition-colors">Departments</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 mt-0.5 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 mt-0.5 text-primary" />
                  <span>info@healthcare.com</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                  <span>123 Medical Center Dr<br />Healthcare City, HC 12345</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HealthCare HMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
