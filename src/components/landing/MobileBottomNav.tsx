import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Stethoscope, Calendar, User, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Stethoscope, label: 'Services', path: '/services' },
    { icon: Calendar, label: 'Book', path: '/login', highlight: true },
    { icon: User, label: 'Portal', path: '/login' },
    { icon: Menu, label: 'Menu', action: onMenuClick },
  ];

  const isActive = (path?: string) => path && location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.action ? item.action() : navigate(item.path!)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              item.highlight 
                ? 'relative' 
                : isActive(item.path) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.highlight ? (
              <div className="absolute -top-5">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30">
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
            ) : (
              <>
                <item.icon className={`w-5 h-5 mb-1 ${isActive(item.path) ? 'text-primary' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive(item.path) ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
            {item.highlight && (
              <span className="text-[10px] font-medium text-muted-foreground mt-5">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </div>

      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
