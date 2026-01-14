import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Stethoscope, User, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const quickLinks = [
    { icon: Stethoscope, label: 'Find a Doctor', path: '/about#team' },
    { icon: User, label: 'Patient Portal', path: '/login' },
    { icon: MapPin, label: 'Locations', path: '/contact' },
    { icon: Clock, label: 'Emergency', path: '/contact' },
  ];

  const suggestions = [
    'Cardiology',
    'Pediatrics',
    'Emergency Services',
    'Lab Tests',
    'Vaccination',
    'Telemedicine',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/services?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-foreground/70" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Search Panel */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-2xl animate-fade-in">
            <div className="container mx-auto px-4 lg:px-8 py-6">
              {/* Search Input */}
              <form onSubmit={handleSearch} className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctors, services, or conditions..."
                  className="w-full pl-14 pr-14 py-4 text-lg bg-muted/50 border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </form>

              {/* Quick Links */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Links</h4>
                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(link.path);
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Searches */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion);
                        navigate(`/services?search=${encodeURIComponent(suggestion)}`);
                        setIsOpen(false);
                      }}
                      className="px-4 py-2 rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NavSearch;
