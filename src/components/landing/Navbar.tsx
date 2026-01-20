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
  Shield,
  Activity,
  Bed,
  CreditCard,
  Bell,
  BarChart3,
  ClipboardList
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  const features = [
    { name: 'Patient Management', icon: Users, description: 'Complete patient registry and records' },
    { name: 'Appointment Scheduling', icon: Calendar, description: 'Smart scheduling with queue management' },
    { name: 'Medical Records', icon: FileText, description: 'Electronic health records (EHR)' },
    { name: 'Billing & Payments', icon: CreditCard, description: 'Integrated billing and invoicing' },
    { name: 'Lab & Diagnostics', icon: Activity, description: 'Lab test ordering and results' },
    { name: 'Bed Management', icon: Bed, description: 'Room and bed allocation system' },
    { name: 'Notifications', icon: Bell, description: 'Real-time alerts and reminders' },
    { name: 'Reports & Analytics', icon: BarChart3, description: 'Comprehensive reporting dashboard' },
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
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-500 border-b",
      isScrolled 
        ? 'bg-background/95 backdrop-blur-xl shadow-lg border-border/50' 
        : 'bg-background/80 backdrop-blur-sm border-transparent'
    )}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                HealthCare HMS
              </h1>
              <p className="text-[10px] lg:text-xs text-muted-foreground leading-tight">
                Hospital Management System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-0">
                {/* Solutions Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 px-4 text-sm font-medium text-foreground/80 hover:text-foreground bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[500px] p-4 bg-popover">
                      <div className="grid grid-cols-2 gap-3">
                        {solutions.map((solution) => {
                          const Icon = solution.icon;
                          return (
                            <NavigationMenuLink
                              key={solution.name}
                              onClick={() => handleNavClick(solution.path)}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{solution.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{solution.description}</p>
                              </div>
                            </NavigationMenuLink>
                          );
                        })}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Features Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 px-4 text-sm font-medium text-foreground/80 hover:text-foreground bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] p-4 bg-popover">
                      <div className="grid grid-cols-2 gap-2">
                        {features.map((feature) => {
                          const Icon = feature.icon;
                          return (
                            <NavigationMenuLink
                              key={feature.name}
                              onClick={() => handleNavClick('/#features')}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{feature.name}</p>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                              </div>
                            </NavigationMenuLink>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <button
                          onClick={() => handleNavClick('/#features')}
                          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                        >
                          View all features
                          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Regular Nav Links */}
                {navLinks.slice(1).map((link) => (
                  <NavigationMenuItem key={link.path}>
                    <button 
                      onClick={() => handleNavClick(link.path)}
                      className={cn(
                        "h-10 px-4 text-sm font-medium transition-colors rounded-md",
                        isActive(link.path)
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {link.name}
                    </button>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden xl:flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => navigate('/contact')}
              className="h-10 px-5 text-sm font-medium text-primary hover:text-primary hover:bg-primary/10 rounded-full"
            >
              Request Demo
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              className="h-10 px-6 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              Login
            </Button>
          </div>

          {/* Tablet Navigation (md to xl) */}
          <div className="hidden lg:flex xl:hidden items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors">
                  Solutions
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-popover" align="start">
                {solutions.map((solution) => {
                  const Icon = solution.icon;
                  return (
                    <DropdownMenuItem 
                      key={solution.name}
                      onClick={() => handleNavClick(solution.path)}
                      className="flex items-start gap-3 p-3 cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{solution.name}</p>
                        <p className="text-xs text-muted-foreground">{solution.description}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((link) => (
              <button 
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                )}
              >
                {link.name}
              </button>
            ))}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate('/contact')}
              className="text-sm font-medium text-primary hover:text-primary hover:bg-primary/10"
            >
              Demo
            </Button>
            
            <Button 
              size="sm"
              onClick={() => navigate('/login')}
              className="text-sm font-medium bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/30 animate-fade-in">
            <div className="flex flex-col gap-1">
              {/* Solutions Section */}
              <div className="px-2 py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Solutions</p>
                <div className="grid grid-cols-2 gap-2">
                  {solutions.map((solution) => {
                    const Icon = solution.icon;
                    return (
                      <button 
                        key={solution.name}
                        onClick={() => handleNavClick(solution.path)}
                        className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 text-left transition-colors"
                      >
                        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{solution.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border/30 mx-2" />

              {/* Navigation Links */}
              <div className="py-2">
                {navLinks.map((link) => (
                  <button 
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl font-medium transition-colors",
                      isActive(link.path)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
              
              {/* CTA Buttons */}
              <div className="pt-4 space-y-2 px-2">
                <Button 
                  variant="outline"
                  onClick={() => { navigate('/contact'); setIsMobileMenuOpen(false); }}
                  className="w-full h-12 rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-medium"
                >
                  Request Demo
                </Button>
                <Button 
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-medium"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
