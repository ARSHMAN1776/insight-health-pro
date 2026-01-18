import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Session timeout duration in milliseconds (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// User roles in the hospital system
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist' | 'pharmacist' | 'lab_technician';

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

// Patient signup data interface
export interface PatientSignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

// Staff signup data interface
export interface StaffSignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signupPatient: (data: PatientSignupData) => Promise<void>;
  signupStaff: (data: StaffSignupData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
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
  ],
  lab_technician: [
    'view_lab_tests',
    'manage_lab_results',
    'view_patients',
    'view_doctors'
  ]
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timeout if user is logged in
    if (session) {
      timeoutRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
      }, SESSION_TIMEOUT_MS);
    }
  }, [session]);

  // Set up activity listeners for session timeout
  useEffect(() => {
    if (!session) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the timer
    resetInactivityTimer();

    return () => {
      // Remove listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, resetInactivityTimer]);

  const fetchUserData = async (userId: string, email: string, createdAt: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const mappedUser: User = {
        id: userId,
        email: email || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        role: (userRole?.role as UserRole) || 'patient',
        department: profile?.department,
        specialization: profile?.specialization,
        licenseNumber: profile?.license_number,
        phone: profile?.phone,
        createdAt: new Date(createdAt),
        lastLogin: new Date(),
        isActive: true
      };
      setUser(mappedUser);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Continue with basic user info - profile fetch is not critical for auth
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Defer async database queries to avoid blocking auth state changes
          setTimeout(() => {
            fetchUserData(session.user.id, session.user.email || '', session.user.created_at);
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
        await fetchUserData(session.user.id, session.user.email || '', session.user.created_at);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address. Check your inbox for the confirmation link.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signupPatient = async (data: PatientSignupData): Promise<void> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            date_of_birth: data.dateOfBirth,
            gender: data.gender,
            role: 'patient'
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signupStaff = async (data: StaffSignupData): Promise<void> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            department: data.department,
            specialization: data.specialization,
            license_number: data.licenseNumber,
            role: data.role
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists.');
        }
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Staff signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear local state even if server logout fails
      setUser(null);
      setSession(null);
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
    signupPatient,
    signupStaff,
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
