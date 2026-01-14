import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, ChevronDown, Calendar, Search as SearchIcon } from 'lucide-react';
import MegaMenu from './MegaMenu';
import NavSearch from './NavSearch';
import MobileBottomNav from './MobileBottomNav';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services', hasDropdown: true, dropdownType: 'services' as const },
    { name: 'Departments', path: '/services', hasDropdown: true, dropdownType: 'departments' as const },
    { name: 'Patients', path: '/login', hasDropdown: true, dropdownType: 'patients' as const },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleMouseEnter = (dropdownType: string) => {
    setActiveDropdown(dropdownType);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-background/95 shadow-lg border-b border-border/50' 
          : 'bg-background/50 backdrop-blur-sm'
      }`}>
        {/* Animated gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

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
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">HealthCare HMS</h1>
                <p className="text-xs text-muted-foreground">Hospital Management System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <div
                  key={link.path + link.name}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && handleMouseEnter(link.dropdownType!)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button 
                    onClick={() => !link.hasDropdown && navigate(link.path)}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-full font-medium transition-all duration-300 ${
                      isActive(link.path) && !link.hasDropdown
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === link.dropdownType ? 'rotate-180' : ''
                      }`} />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <NavSearch />

              {/* Divider */}
              <div className="w-px h-8 bg-border/50" />

              {/* Find Doctor Button */}
              <Button 
                variant="outline"
                onClick={() => navigate('/about#team')}
                className="rounded-full border-2 hover:border-primary hover:text-primary transition-all"
              >
                Find a Doctor
              </Button>

              {/* Book Appointment Button */}
              <Button 
                onClick={() => navigate('/login')}
                className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary px-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 group"
              >
                <Calendar className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                <span>Book Appointment</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdowns */}
        <MegaMenu 
          type="services" 
          isOpen={activeDropdown === 'services'} 
          onClose={() => setActiveDropdown(null)} 
        />
        <MegaMenu 
          type="departments" 
          isOpen={activeDropdown === 'departments'} 
          onClose={() => setActiveDropdown(null)} 
        />
        <MegaMenu 
          type="patients" 
          isOpen={activeDropdown === 'patients'} 
          onClose={() => setActiveDropdown(null)} 
        />

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search services, doctors..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Nav Links */}
              <div className="flex flex-col space-y-1 mb-6">
                {navLinks.map((link) => (
                  <button 
                    key={link.path + link.name}
                    onClick={() => { navigate(link.path); setIsMobileMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive(link.path)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              {/* Mobile CTAs */}
              <div className="space-y-3">
                <Button 
                  variant="outline"
                  onClick={() => { navigate('/about#team'); setIsMobileMenuOpen(false); }}
                  className="w-full rounded-full border-2"
                >
                  Find a Doctor
                </Button>
                <Button 
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
    </>
  );
};

export default Navbar;
