import React from 'react';
import { LayoutDashboard, FileText, Calendar, LogOut, MessageCircle, Receipt } from 'lucide-react';
import { Button } from '../ui/button';

interface PatientPortalNavProps {
  activeTab: 'dashboard' | 'records' | 'appointments' | 'messages' | 'insurance';
  onTabChange: (tab: 'dashboard' | 'records' | 'appointments' | 'messages' | 'insurance') => void;
  onLogout: () => void;
}

const PatientPortalNav: React.FC<PatientPortalNavProps> = ({ activeTab, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'insurance', label: 'Insurance', icon: Receipt },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/95 border-b border-border/50 shadow-md">
      <div className="container-elegant">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo/Branding */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">Patient Portal</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Secure Health Information</p>
            </div>
          </div>

          {/* Navigation Tabs - Desktop */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-muted/50 rounded-xl p-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 min-h-[40px]
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-md scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button 
            variant="outline" 
            onClick={onLogout} 
            className="flex items-center gap-1.5 sm:gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300 h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4"
            size="sm"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-xs sm:text-sm">Logout</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-3 -mx-2 px-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap min-h-[40px]
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-md' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted active:bg-muted/80'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PatientPortalNav;
