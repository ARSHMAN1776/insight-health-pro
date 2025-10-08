import React from 'react';
import { LayoutDashboard, FileText, Calendar, LogOut } from 'lucide-react';
import { Button } from '../ui/button';

interface PatientPortalNavProps {
  activeTab: 'dashboard' | 'records' | 'appointments';
  onTabChange: (tab: 'dashboard' | 'records' | 'appointments') => void;
  onLogout: () => void;
}

const PatientPortalNav: React.FC<PatientPortalNavProps> = ({ activeTab, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ] as const;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/95">
      <div className="container-elegant">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-primary">Patient Portal</h1>
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    onClick={() => onTabChange(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default PatientPortalNav;
