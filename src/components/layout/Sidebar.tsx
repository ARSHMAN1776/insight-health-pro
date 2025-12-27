import React, { useState, useEffect } from 'react';
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
  Scissors,
  Droplets,
  MessageCircle
} from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
    label: 'Blood Bank',
    icon: Droplets,
    path: '/blood-bank',
    roles: ['admin', 'doctor', 'nurse']
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
    label: 'Patient Messages',
    icon: MessageCircle,
    path: '/patient-messages',
    roles: ['doctor']
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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread message count for doctors
  useEffect(() => {
    if (user?.role === 'doctor' && user?.id) {
      fetchUnreadCount();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('sidebar-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patient_messages'
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.role, user?.id]);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      // First get the doctor ID
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorData?.id) {
        // Count unread messages from patients
        const { count, error } = await supabase
          .from('patient_messages')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorData.id)
          .eq('sender_type', 'patient')
          .eq('read', false);

        if (!error) {
          setUnreadMessageCount(count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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
            const showBadge = item.path === '/patient-messages' && unreadMessageCount > 0;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''} relative`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {showBadge && collapsed && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      {showBadge && (
                        <Badge variant="destructive" className="h-5 min-w-5 text-xs flex items-center justify-center">
                          {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                        </Badge>
                      )}
                    </div>
                  )}
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
