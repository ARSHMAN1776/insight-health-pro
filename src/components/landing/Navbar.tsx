import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X } from 'lucide-react';

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
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <button 
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
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
              onClick={() => navigate('/login')}
              className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Login</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
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
          <div className="md:hidden py-6 border-t border-border/30 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <button 
                  key={link.path}
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
              <div className="pt-4">
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
