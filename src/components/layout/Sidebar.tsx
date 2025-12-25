import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Users,
  FileText,
  Pill,
  TestTube,
  Bed,
  DollarSign,
  Settings,
  LogOut,
  Home,
  UserPlus,
  Stethoscope,
  Heart,
  Shield,
  ClipboardList,
  Building,
  Bell,
  BarChart,
  Scissors
} from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist', 'pharmacist']
  },
  {
    label: 'Patients',
    icon: Users,
    path: '/patients',
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    label: 'Patient Registry',
    icon: ClipboardList,
    path: '/patient-registry',
    roles: ['admin']
  },
  {
    label: 'Appointments',
    icon: Calendar,
    path: '/appointments',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist']
  },
  {
    label: 'Departments',
    icon: Building,
    path: '/departments',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist', 'pharmacist']
  },
  {
    label: 'Medical Records',
    icon: FileText,
    path: '/medical-records',
    roles: ['admin', 'doctor', 'nurse', 'patient']
  },
  {
    label: 'Prescriptions',
    icon: Pill,
    path: '/prescriptions',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'pharmacist']
  },
  {
    label: 'Lab Tests',
    icon: TestTube,
    path: '/lab-tests',
    roles: ['admin', 'doctor', 'nurse', 'patient']
  },
  {
    label: 'Rooms & Beds',
    icon: Bed,
    path: '/rooms',
    roles: ['admin', 'nurse', 'receptionist']
  },
  {
    label: 'Billing',
    icon: DollarSign,
    path: '/billing',
    roles: ['admin', 'receptionist']
  },
  {
    label: 'Pharmacy',
    icon: Pill,
    path: '/pharmacy',
    roles: ['admin', 'pharmacist']
  },
  {
    label: 'Staff',
    icon: Stethoscope,
    path: '/staff',
    roles: ['admin']
  },
  {
    label: 'Operation Department',
    icon: Scissors,
    path: '/operation-department',
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    label: 'Reports',
    icon: BarChart,
    path: '/reports',
    roles: ['admin', 'doctor']
  },
  {
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist', 'pharmacist']
  }
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border h-screen flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">HMS</h1>
              <p className="text-xs text-sidebar-foreground/70">Hospital Management</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {user.role}
              </p>
              {user.department && (
                <p className="text-xs text-sidebar-foreground/50">
                  {user.department}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;