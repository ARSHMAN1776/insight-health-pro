import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  MessageCircle,
  Thermometer,
  ArrowRightLeft,
  GitPullRequest,
  FileCheck,
  ListPlus,
  TicketCheck,
  CreditCard,
  Lock
} from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useModules } from '@/hooks/useModules';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import type { ModuleKey } from '@/types/organization';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
  moduleKey?: ModuleKey; // Maps sidebar item to module for gating
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist', 'pharmacist', 'lab_technician'],
    moduleKey: 'dashboard',
  },
  {
    label: 'Patients',
    icon: Users,
    path: '/patients',
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    moduleKey: 'patients',
  },
  {
    label: 'Patient Registry',
    icon: ClipboardList,
    path: '/patient-registry',
    roles: ['admin'],
    moduleKey: 'patients',
  },
  {
    label: 'Appointments',
    icon: Calendar,
    path: '/appointments',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
    moduleKey: 'appointments',
  },
  {
    label: 'Waitlist',
    icon: ListPlus,
    path: '/waitlist',
    roles: ['admin', 'receptionist'],
    moduleKey: 'appointments',
  },
  {
    label: 'Queue',
    icon: TicketCheck,
    path: '/queue',
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    moduleKey: 'queue',
  },
  {
    label: 'Departments',
    icon: Building,
    path: '/departments',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist', 'pharmacist'],
    moduleKey: 'departments',
  },
  {
    label: 'Medical Records',
    icon: FileText,
    path: '/medical-records',
    roles: ['admin', 'doctor', 'nurse', 'patient'],
    moduleKey: 'patients', // Part of patient management
  },
  {
    label: 'Prescriptions',
    icon: Pill,
    path: '/prescriptions',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'pharmacist'],
    moduleKey: 'prescriptions',
  },
  {
    label: 'Lab Tests',
    icon: TestTube,
    path: '/lab-tests',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'lab_technician'],
    moduleKey: 'lab_tests',
  },
  {
    label: 'Referrals',
    icon: GitPullRequest,
    path: '/referrals',
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    moduleKey: 'referrals',
  },
  {
    label: 'Blood Bank',
    icon: Droplets,
    path: '/blood-bank',
    roles: ['admin', 'doctor', 'nurse'],
    moduleKey: 'blood_bank',
  },
  {
    label: 'Vitals',
    icon: Thermometer,
    path: '/vitals',
    roles: ['admin', 'nurse', 'doctor'],
    moduleKey: 'vitals',
  },
  {
    label: 'Shift Handover',
    icon: ArrowRightLeft,
    path: '/shift-handovers',
    roles: ['admin', 'nurse'],
    moduleKey: 'shift_handover',
  },
  {
    label: 'Rooms & Beds',
    icon: Bed,
    path: '/rooms',
    roles: ['admin', 'nurse', 'receptionist'],
    moduleKey: 'rooms',
  },
  {
    label: 'Billing',
    icon: DollarSign,
    path: '/billing',
    roles: ['admin', 'receptionist'],
    moduleKey: 'billing',
  },
  {
    label: 'Insurance Claims',
    icon: FileCheck,
    path: '/insurance-claims',
    roles: ['admin', 'receptionist'],
    moduleKey: 'insurance',
  },
  {
    label: 'Pharmacy',
    icon: Pill,
    path: '/pharmacy',
    roles: ['admin', 'pharmacist'],
    moduleKey: 'pharmacy',
  },
  {
    label: 'Inventory',
    icon: ClipboardList,
    path: '/inventory',
    roles: ['admin', 'pharmacist'],
    moduleKey: 'inventory',
  },
  {
    label: 'Staff',
    icon: Stethoscope,
    path: '/staff',
    roles: ['admin'],
    // No moduleKey - always available
  },
  {
    label: 'Operation Department',
    icon: Scissors,
    path: '/operation-department',
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    moduleKey: 'operation_dept',
  },
  {
    label: 'Reports',
    icon: BarChart,
    path: '/reports',
    roles: ['admin'],
    moduleKey: 'reports',
  },
  {
    label: 'PHI Audit Logs',
    icon: Shield,
    path: '/audit-logs',
    roles: ['admin'],
    moduleKey: 'audit_logs',
  },
  {
    label: 'Payment Settings',
    icon: CreditCard,
    path: '/payment-settings',
    roles: ['admin'],
    moduleKey: 'billing',
  },
  {
    label: 'Patient Messages',
    icon: MessageCircle,
    path: '/patient-messages',
    roles: ['doctor'],
    moduleKey: 'messages',
  },
  {
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist', 'pharmacist', 'lab_technician'],
    // No moduleKey - always available
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const { user, logout } = useAuth();
  const { isEnabled, isMultiTenantMode, requiresUpgrade, getRequiredPlanName } = useModules();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
      // Silent fail for unread count
    }
  };

  if (!user) return null;

  // Filter by role first
  const roleFilteredItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  // Check module enablement for each item
  const getItemModuleStatus = (item: SidebarItem) => {
    if (!item.moduleKey) return { enabled: true, locked: false };
    if (!isMultiTenantMode) return { enabled: true, locked: false };
    
    const moduleEnabled = isEnabled(item.moduleKey);
    const needsUpgrade = requiresUpgrade(item.moduleKey);
    
    return {
      enabled: moduleEnabled,
      locked: !moduleEnabled,
      needsUpgrade,
      requiredPlan: needsUpgrade ? getRequiredPlanName(item.moduleKey) : undefined,
    };
  };

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
        <TooltipProvider delayDuration={100}>
          <ul className="space-y-1 px-2">
            {roleFilteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const showBadge = item.path === '/patient-messages' && unreadMessageCount > 0;
              const moduleStatus = getItemModuleStatus(item);
              
              // If module is locked, show disabled state
              if (moduleStatus.locked) {
                const tooltipText = moduleStatus.needsUpgrade 
                  ? `Upgrade to ${moduleStatus.requiredPlan} to unlock`
                  : 'Enable this module in settings';
                
                return (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="sidebar-item opacity-50 cursor-not-allowed"
                          title={collapsed ? item.label : undefined}
                        >
                          <div className="relative">
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {collapsed && (
                              <Lock className="absolute -top-1 -right-1 w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          {!collapsed && (
                            <div className="flex items-center justify-between flex-1">
                              <span className="text-sm font-medium">{item.label}</span>
                              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{tooltipText}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }
              
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
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
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
