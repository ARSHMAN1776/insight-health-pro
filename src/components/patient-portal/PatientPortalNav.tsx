import React from 'react';
import { LayoutDashboard, FileText, Calendar, LogOut, MessageCircle, Receipt, Brain, Heart } from 'lucide-react';
import { Button } from '../ui/button';

interface PatientPortalNavProps {
  activeTab: 'dashboard' | 'records' | 'appointments' | 'messages' | 'insurance' | 'symptom-check';
  onTabChange: (tab: 'dashboard' | 'records' | 'appointments' | 'messages' | 'insurance' | 'symptom-check') => void;
  onLogout: () => void;
}

const PatientPortalNav: React.FC<PatientPortalNavProps> = ({ activeTab, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'symptom-check', label: 'AI Health', shortLabel: 'AI', icon: Brain },
    { id: 'appointments', label: 'Appointments', shortLabel: 'Appts', icon: Calendar },
    { id: 'records', label: 'Records', shortLabel: 'Records', icon: FileText },
    { id: 'messages', label: 'Messages', shortLabel: 'Chat', icon: MessageCircle },
    { id: 'insurance', label: 'Insurance', shortLabel: 'Claims', icon: Receipt },
  ] as const;

  return (
    <>
      {/* Desktop Navigation - Full Width Header */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-base font-semibold text-foreground leading-tight">
                  HealthCare <span className="text-primary">HMS</span>
                </span>
                <span className="text-[11px] text-muted-foreground">Patient Portal</span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 bg-muted/40 backdrop-blur-sm rounded-2xl p-1.5 border border-border/30 shadow-inner">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`
                        relative flex items-center gap-2.5 px-4 lg:px-5 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-300 ease-out
                        ${isActive 
                          ? 'bg-background text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : ''}`} />
                      <span className="hidden lg:inline">{item.label}</span>
                      <span className="lg:hidden">{item.shortLabel}</span>
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={onLogout} 
                className="h-10 px-4 border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 rounded-xl transition-all duration-200 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe">
        <div className="px-2 py-2">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-[52px] rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground active:text-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-20" />
    </>
  );
};

export default PatientPortalNav;
