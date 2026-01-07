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
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'insurance', label: 'Insurance', icon: Receipt },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm sm:text-base">Patient Portal</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-background text-primary shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onLogout} 
            className="h-8 px-2 sm:px-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5 text-sm">Logout</span>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden pb-2 -mx-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-1 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted/50 text-muted-foreground active:bg-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
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
