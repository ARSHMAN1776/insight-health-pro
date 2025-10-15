import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  signup: (email: string, password: string, userData: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
}

interface SignupData {
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          // Defer profile and role fetching
          setTimeout(() => {
            fetchUserProfile(session.user);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) throw profileError;

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      if (roleError) throw roleError;

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: roleData.role as UserRole,
        phone: profile.phone,
        department: profile.department,
        specialization: profile.specialization,
        licenseNumber: profile.license_number,
        createdAt: new Date(supabaseUser.created_at),
        lastLogin: new Date(),
        isActive: true
      };

      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // User profile will be fetched automatically by onAuthStateChange
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: SignupData): Promise<void> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            phone: userData.phone,
            department: userData.department,
            specialization: userData.specialization,
            license_number: userData.licenseNumber
          }
        }
      });
      
      if (error) throw error;
      
      // User profile will be created automatically by database trigger
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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