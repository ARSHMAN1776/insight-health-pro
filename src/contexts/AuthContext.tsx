import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// User roles in the hospital system
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist' | 'pharmacist';

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: User[] = [
  {
    id: '1',
    email: 'admin@hospital.com',
    firstName: 'John',
    lastName: 'Administrator',
    role: 'admin',
    department: 'Administration',
    phone: '+1234567890',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true
  },
  {
    id: '2',
    email: 'doctor@hospital.com',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    role: 'doctor',
    department: 'Cardiology',
    specialization: 'Cardiology',
    licenseNumber: 'MD123456',
    phone: '+1234567891',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true
  },
  {
    id: '3',
    email: 'nurse@hospital.com',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'nurse',
    department: 'Emergency',
    licenseNumber: 'RN789012',
    phone: '+1234567892',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true
  },
  {
    id: '4',
    email: 'patient@hospital.com',
    firstName: 'Michael',
    lastName: 'Smith',
    role: 'patient',
    phone: '+1234567893',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true
  },
  {
    id: '5',
    email: 'receptionist@hospital.com',
    firstName: 'Lisa',
    lastName: 'Brown',
    role: 'receptionist',
    department: 'Front Desk',
    phone: '+1234567894',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true
  },
  {
    id: '6',
    email: 'pharmacist@hospital.com',
    firstName: 'David',
    lastName: 'Wilson',
    role: 'pharmacist',
    department: 'Pharmacy',
    licenseNumber: 'PH345678',
    phone: '+1234567895',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true
  }
];

// Role-based permissions
const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'], // All permissions
  doctor: [
    'view_patients',
    'manage_patients',
    'view_appointments',
    'manage_appointments',
    'view_medical_records',
    'manage_medical_records',
    'view_prescriptions',
    'manage_prescriptions',
    'view_lab_results',
    'manage_lab_results'
  ],
  nurse: [
    'view_patients',
    'manage_patients',
    'view_appointments',
    'view_medical_records',
    'view_prescriptions',
    'view_lab_results',
    'manage_vital_signs'
  ],
  patient: [
    'view_own_profile',
    'view_own_appointments',
    'view_own_medical_records',
    'view_own_prescriptions',
    'view_own_lab_results'
  ],
  receptionist: [
    'view_patients',
    'manage_patients',
    'view_appointments',
    'manage_appointments',
    'view_billing',
    'manage_billing'
  ],
  pharmacist: [
    'view_prescriptions',
    'manage_prescriptions',
    'view_inventory',
    'manage_inventory',
    'view_patients'
  ]
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Defer async database queries to avoid blocking auth state changes
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              const { data: userRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();

              const mappedUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                firstName: (profile as any)?.first_name || '',
                lastName: (profile as any)?.last_name || '',
                role: ((userRole as any)?.role as UserRole) || 'patient',
                department: (profile as any)?.department,
                specialization: (profile as any)?.specialization,
                licenseNumber: (profile as any)?.license_number,
                phone: (profile as any)?.phone,
                createdAt: new Date(session.user.created_at),
                lastLogin: new Date(),
                isActive: true
              };
              setUser(mappedUser);
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: (profile as any)?.first_name || '',
            lastName: (profile as any)?.last_name || '',
            role: ((userRole as any)?.role as UserRole) || 'patient',
            department: (profile as any)?.department,
            specialization: (profile as any)?.specialization,
            licenseNumber: (profile as any)?.license_number,
            phone: (profile as any)?.phone,
            createdAt: new Date(session.user.created_at),
            lastLogin: new Date(),
            isActive: true
          };
          setUser(mappedUser);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Check if using demo account
      const demoUser = demoUsers.find(u => u.email === email);
      if (demoUser && password === 'demo123') {
        setUser(demoUser);
        setIsLoading(false);
        return;
      }

      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // User state will be updated by onAuthStateChange listener
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'patient'): Promise<void> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      if (error) {
        throw error;
      }

      // User state will be updated by onAuthStateChange listener
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Check if it's a demo user (no session)
      if (!session) {
        setUser(null);
        return;
      }
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const userPermissions = rolePermissions[user.role];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    signup,
    logout,
    isLoading,
    hasPermission,
    isRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;