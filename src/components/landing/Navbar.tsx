import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-2xl shadow-lg border-b border-border/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-500 group-hover:scale-110">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-info rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">HealthCare</span>
              <span className="text-xs text-muted-foreground font-medium">HMS Platform</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8 py-6 text-base font-semibold rounded-2xl shadow-lg hover:shadow-glow transition-all duration-500 hover:scale-105"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
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
          <div className="md:hidden py-6 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-primary to-primary/90 py-6 text-base font-semibold rounded-2xl"
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;