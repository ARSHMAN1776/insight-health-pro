import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('hms_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('hms_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (demo implementation)
      const foundUser = demoUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('User not found');
      }
      
      // In a real app, you would verify the password here
      if (password !== 'password123') {
        throw new Error('Invalid password');
      }
      
      // Update last login
      const userWithLastLogin = {
        ...foundUser,
        lastLogin: new Date()
      };
      
      setUser(userWithLastLogin);
      localStorage.setItem('hms_user', JSON.stringify(userWithLastLogin));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('hms_user');
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
    login,
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