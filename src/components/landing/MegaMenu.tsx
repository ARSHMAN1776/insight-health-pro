import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Activity, 
  TestTube, 
  Pill, 
  Video, 
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Syringe,
  Ambulance,
  Calendar,
  User,
  FileText,
  CreditCard,
  Clock,
  Shield,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface MegaMenuProps {
  type: 'services' | 'departments' | 'patients';
  isOpen: boolean;
  onClose: () => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ type, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const servicesData = {
    title: 'Our Services',
    description: 'Comprehensive healthcare services for you and your family',
    items: [
      { icon: Ambulance, name: 'Emergency Care', description: '24/7 emergency medical services', path: '/services#emergency' },
      { icon: Stethoscope, name: 'Outpatient Services', description: 'Consultations & follow-ups', path: '/services#outpatient' },
      { icon: TestTube, name: 'Lab & Diagnostics', description: 'Advanced testing facilities', path: '/services#lab' },
      { icon: Pill, name: 'Pharmacy', description: 'In-house pharmacy services', path: '/services#pharmacy' },
      { icon: Video, name: 'Telemedicine', description: 'Virtual consultations', path: '/services#telemedicine' },
      { icon: Syringe, name: 'Vaccination', description: 'Immunization programs', path: '/services#vaccination' },
    ],
    featured: {
      title: 'Free Health Checkup',
      description: 'Get a comprehensive health assessment this month',
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=200&fit=crop',
      cta: 'Book Now',
      path: '/contact'
    }
  };

  const departmentsData = {
    title: 'Departments',
    description: 'Specialized medical departments with expert care',
    items: [
      { icon: Heart, name: 'Cardiology', description: 'Heart & cardiovascular care', path: '/services#cardiology' },
      { icon: Brain, name: 'Neurology', description: 'Brain & nervous system', path: '/services#neurology' },
      { icon: Bone, name: 'Orthopedics', description: 'Bone & joint specialists', path: '/services#orthopedics' },
      { icon: Baby, name: 'Pediatrics', description: 'Children\'s healthcare', path: '/services#pediatrics' },
      { icon: Eye, name: 'Ophthalmology', description: 'Eye care & vision', path: '/services#ophthalmology' },
      { icon: Activity, name: 'General Medicine', description: 'Primary healthcare', path: '/services#general' },
    ],
    featured: {
      title: 'Meet Our Specialists',
      description: 'World-class doctors dedicated to your health',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=200&fit=crop',
      cta: 'View All Doctors',
      path: '/about#team'
    }
  };

  const patientsData = {
    title: 'Patient Resources',
    description: 'Everything you need for a seamless healthcare experience',
    items: [
      { icon: Calendar, name: 'Book Appointment', description: 'Schedule your visit online', path: '/login' },
      { icon: User, name: 'Patient Portal', description: 'Access your health records', path: '/login' },
      { icon: CreditCard, name: 'Insurance & Billing', description: 'Payment & insurance info', path: '/services#billing' },
      { icon: FileText, name: 'Medical Records', description: 'Request your records', path: '/login' },
      { icon: Clock, name: 'Visiting Hours', description: 'Hospital visiting times', path: '/contact#hours' },
      { icon: Shield, name: 'Patient Rights', description: 'Know your healthcare rights', path: '/about#rights' },
    ],
    featured: {
      title: 'Download Our App',
      description: 'Manage your health on the go with our mobile app',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop',
      cta: 'Get the App',
      path: '/contact'
    }
  };

  const data = type === 'services' ? servicesData : type === 'departments' ? departmentsData : patientsData;

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border shadow-2xl animate-fade-in"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground">{data.title}</h3>
              <p className="text-muted-foreground text-sm">{data.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 text-left"
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {item.name}
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Card */}
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 h-full min-h-[280px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Featured</span>
                </div>
                <h4 className="text-xl font-bold mb-2">{data.featured.title}</h4>
                <p className="text-sm opacity-90 mb-6 flex-grow">{data.featured.description}</p>
                <button
                  onClick={() => handleNavigate(data.featured.path)}
                  className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-primary px-4 py-2.5 rounded-full font-semibold hover:bg-primary-foreground/90 transition-colors w-full"
                >
                  {data.featured.cta}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
