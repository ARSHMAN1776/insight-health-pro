import React from 'react';
import { LayoutDashboard, FileText, Calendar, LogOut, MessageCircle, Receipt, Brain } from 'lucide-react';
import { Button } from '../ui/button';

interface PatientPortalNavProps {
  activeTab: 'dashboard' | 'records' | 'appointments' | 'messages' | 'insurance' | 'symptom-check';
  onTabChange: (tab: 'dashboard' | 'records' | 'appointments' | 'messages' | 'insurance' | 'symptom-check') => void;
  onLogout: () => void;
}

const PatientPortalNav: React.FC<PatientPortalNavProps> = ({ activeTab, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'symptom-check', label: 'AI Health', shortLabel: 'AI', icon: Brain },
    { id: 'appointments', label: 'Appointments', shortLabel: 'Appts', icon: Calendar },
    { id: 'records', label: 'Records', shortLabel: 'Records', icon: FileText },
    { id: 'messages', label: 'Messages', shortLabel: 'Chat', icon: MessageCircle },
    { id: 'insurance', label: 'Insurance', shortLabel: 'Claims', icon: Receipt },
  ] as const;

  return (
    <>
      {/* Sticky Top Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg leading-tight">Patient Portal</h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Healthcare HMS</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 bg-muted/60 rounded-xl p-1.5 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-background text-primary shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLogout} 
              className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2 text-sm font-medium">Logout</span>
            </Button>
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
