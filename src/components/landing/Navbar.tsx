import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MegaMenu from "./MegaMenu";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services", hasDropdown: true, dropdownType: "services" },
    { name: "Departments", path: "/services", hasDropdown: true, dropdownType: "departments" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IH</span>
            </div>
            <span className="font-semibold text-lg text-foreground">InsightHealth</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.dropdownType || null)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.path}
                  className={cn(
                    "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1",
                    activeDropdown === link.dropdownType && "text-foreground"
                  )}
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      activeDropdown === link.dropdownType && "rotate-180"
                    )} />
                  )}
                </Link>
                
                {link.hasDropdown && (
                  <MegaMenu
                    type={link.dropdownType as 'services' | 'departments' | 'patients'}
                    isOpen={activeDropdown === link.dropdownType}
                    onClose={() => setActiveDropdown(null)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-48 h-9 px-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Login */}
            <Button
              variant="ghost"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>

            {/* Primary CTA */}
            <Button
              onClick={() => navigate("/login")}
              className="h-9 px-4 text-sm font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-10 pl-10 pr-4 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Mobile Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Login
              </Button>
              <Button
                className="w-full justify-center"
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>

            {/* Emergency Contact */}
            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">Emergency Helpline</p>
              <a href="tel:1-800-HEALTH" className="text-sm font-semibold text-primary">
                1-800-HEALTH
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
