import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Menu, 
  X, 
  ChevronDown,
  Building2,
  Stethoscope,
  TestTube,
  Pill,
  Calendar,
  Users,
  FileText,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', path: '/#features' },
    { name: 'Departments', path: '/#departments' },
    { name: 'Pricing', path: '/#pricing' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const solutions = [
    { 
      name: 'For Hospitals', 
      description: 'Complete HMS for large healthcare facilities',
      icon: Building2,
      path: '/services#hospitals' 
    },
    { 
      name: 'For Clinics', 
      description: 'Streamlined solution for outpatient care',
      icon: Stethoscope,
      path: '/services#clinics' 
    },
    { 
      name: 'For Laboratories', 
      description: 'Lab management and reporting system',
      icon: TestTube,
      path: '/services#labs' 
    },
    { 
      name: 'For Pharmacies', 
      description: 'Inventory and prescription management',
      icon: Pill,
      path: '/services#pharmacies' 
    },
  ];

  const modules = [
    { name: 'Patient Management', icon: Users },
    { name: 'Appointment Scheduling', icon: Calendar },
    { name: 'Medical Records', icon: FileText },
    { name: 'Security & Compliance', icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      const sectionId = path.substring(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'backdrop-blur-xl bg-background/90 shadow-lg' 
        : 'bg-transparent'
    }`}>
      {/* Animated border line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_3s_ease-in-out_infinite]" 
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Heart className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">HealthCare HMS</h1>
              <p className="text-xs text-muted-foreground">Hospital Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Solutions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-4 py-2.5 rounded-full font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all duration-300">
                  Solutions
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2" align="start">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                  By Facility Type
                </DropdownMenuLabel>
                {solutions.map((solution) => {
                  const Icon = solution.icon;
                  return (
                    <DropdownMenuItem 
                      key={solution.name}
                      onClick={() => handleNavClick(solution.path)}
                      className="flex items-start gap-3 p-3 cursor-pointer rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{solution.name}</p>
                        <p className="text-xs text-muted-foreground">{solution.description}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                  Key Modules
                </DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-1 p-1">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div 
                        key={module.name}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleNavClick('/#features')}
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{module.name}</span>
                      </div>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((link) => (
              <button 
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`relative px-4 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            ))}
            
            <div className="w-px h-8 bg-border/50 mx-2" />
            
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            >
              Request Demo
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary px-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Login</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-border/30 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {/* Solutions Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Solutions</p>
                <div className="grid grid-cols-2 gap-2">
                  {solutions.map((solution) => {
                    const Icon = solution.icon;
                    return (
                      <button 
                        key={solution.name}
                        onClick={() => handleNavClick(solution.path)}
                        className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 text-left"
                      >
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{solution.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border/30 my-2" />

              {navLinks.map((link) => (
                <button 
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive(link.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              
              <div className="pt-4 space-y-2 px-4">
                <Button 
                  variant="outline"
                  onClick={() => { navigate('/contact'); setIsMobileMenuOpen(false); }}
                  className="w-full rounded-full border-primary/30 text-primary"
                >
                  Request Demo
                </Button>
                <Button 
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
