import React from 'react';
import { Phone, Globe, User, Sun, Moon, Monitor, Bell } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TopBar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-10 text-sm">
          {/* Left Side - Emergency & Announcement */}
          <div className="flex items-center gap-6">
            <a 
              href="tel:+1-800-HEALTH" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Emergency: 1-800-HEALTH</span>
              <span className="sm:hidden font-medium">1-800-HEALTH</span>
            </a>
            
            {/* Scrolling Announcement - Hidden on mobile */}
            <div className="hidden lg:block overflow-hidden max-w-md">
              <div className="animate-marquee whitespace-nowrap">
                <span className="mx-4">🏥 Now accepting new patients</span>
                <span className="mx-4">•</span>
                <span className="mx-4">✨ 24/7 Emergency Services Available</span>
                <span className="mx-4">•</span>
                <span className="mx-4">🩺 Free Health Checkup This Month</span>
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary-foreground/10 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">EN</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary-foreground/10 transition-colors">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
                <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2 cursor-pointer">
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2 cursor-pointer">
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2 cursor-pointer">
                  <Monitor className="w-4 h-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="w-px h-5 bg-primary-foreground/30 hidden sm:block" />

            {/* Patient Portal */}
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Patient Portal</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TopBar;
