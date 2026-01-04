import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '../../contexts/AuthContext';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Department {
  department_id: string;
  department_name: string;
}

interface StaffRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ============= Input Sanitization =============
const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/\$/g, '&#x24;');
};

const sanitizeName = (input: string): string => {
  // Allow only letters, spaces, hyphens, apostrophes
  return sanitizeString(input).replace(/[^a-zA-Z\s\-']/g, '').slice(0, 100);
};

const sanitizeSpecialization = (input: string): string => {
  // Allow letters, numbers, spaces, hyphens, commas, parentheses
  return sanitizeString(input).replace(/[^a-zA-Z0-9\s\-,()]/g, '').slice(0, 200);
};

// ============= Validation Schema =============
const staffRegistrationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .transform(val => val.toLowerCase()),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        // Accept various phone formats, normalize to E.164
        const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
        return /^\+?[1-9]\d{6,14}$/.test(cleaned);
      },
      { message: 'Please enter a valid phone number (e.g., +1234567890)' }
    )
    .transform((val) => {
      if (!val || val.trim() === '') return '';
      const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
      return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    }),
  
  role: z.enum(['doctor', 'nurse', 'receptionist', 'pharmacist', 'admin', 'lab_technician'] as const, {
    required_error: 'Role is required',
    invalid_type_error: 'Please select a valid role',
  }),
  
  department: z.string().optional(),
  
  specialization: z
    .string()
    .max(200, 'Specialization must be less than 200 characters')
    .optional()
    .transform(val => val ? sanitizeSpecialization(val) : ''),
  
  licenseNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        // License format: alphanumeric with optional hyphens, 5-20 chars
        return /^[A-Za-z0-9\-]{5,20}$/.test(val.trim());
      },
      { message: 'License number must be 5-20 alphanumeric characters (hyphens allowed)' }
    ),
});

type StaffFormData = z.infer<typeof staffRegistrationSchema>;

interface FormErrors {
  [key: string]: string;
}

// Password strength indicator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

const StaffRegistrationForm: React.FC<StaffRegistrationFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'doctor' as UserRole,
    department: '',
    specialization: '',
    licenseNumber: ''
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('department_id, department_name')
        .eq('status', 'Active')
        .order('department_name');

      if (!error && data) {
        setDepartments(data);
      }
    };

    if (open) {
      fetchDepartments();
      // Reset form when dialog opens
      setErrors({});
    }
  }, [open]);

  const validateField = (field: keyof typeof formData, value: string): string | null => {
    try {
      const partialSchema = staffRegistrationSchema.pick({ [field]: true } as any);
      partialSchema.parse({ [field]: value });
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Invalid input';
      }
      return 'Validation error';
    }
  };

  const validateForm = (): boolean => {
    try {
      staffRegistrationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sanitize all string inputs before sending
      const sanitizedData = {
        email: formData.email.trim().toLowerCase(),
        firstName: sanitizeName(formData.firstName),
        lastName: sanitizeName(formData.lastName),
        phone: formData.phone || null,
        role: formData.role,
        department: formData.department || null,
        specialization: sanitizeSpecialization(formData.specialization),
        licenseNumber: formData.licenseNumber.trim() || null
      };

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: formData.password,
        options: {
          data: {
            first_name: sanitizedData.firstName,
            last_name: sanitizedData.lastName,
            phone: sanitizedData.phone,
            role: sanitizedData.role,
            department: sanitizedData.department,
            specialization: sanitizedData.specialization,
            license_number: sanitizedData.licenseNumber
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      toast({
        title: "Success",
        description: `Staff member ${sanitizedData.firstName} ${sanitizedData.lastName} has been registered successfully.`,
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'doctor',
        department: '',
        specialization: '',
        licenseNumber: ''
      });
      setErrors({});

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error registering staff:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register staff member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const requiresLicense = ['doctor', 'nurse', 'pharmacist'].includes(formData.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Staff Member</DialogTitle>
          <DialogDescription>
            Create a new staff account with appropriate role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the validation errors below before submitting.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={errors.firstName ? 'border-destructive' : ''}
                placeholder="John"
                maxLength={50}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={errors.lastName ? 'border-destructive' : ''}
                placeholder="Doe"
                maxLength={50}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={errors.email ? 'border-destructive' : ''}
              placeholder="staff@hospital.com"
              maxLength={255}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={errors.password ? 'border-destructive' : ''}
              placeholder="Min 8 chars, uppercase, lowercase, number, special char"
              maxLength={128}
            />
            {formData.password && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                </div>
                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                  <span className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                    {formData.password.length >= 8 ? <CheckCircle2 className="inline h-3 w-3" /> : '○'} 8+ chars
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    {/[A-Z]/.test(formData.password) ? <CheckCircle2 className="inline h-3 w-3" /> : '○'} Uppercase
                  </span>
                  <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                    {/[a-z]/.test(formData.password) ? <CheckCircle2 className="inline h-3 w-3" /> : '○'} Lowercase
                  </span>
                  <span className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                    {/[0-9]/.test(formData.password) ? <CheckCircle2 className="inline h-3 w-3" /> : '○'} Number
                  </span>
                  <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                    {/[^A-Za-z0-9]/.test(formData.password) ? <CheckCircle2 className="inline h-3 w-3" /> : '○'} Special
                  </span>
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              className={errors.phone ? 'border-destructive' : ''}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
            <p className="text-xs text-muted-foreground">Enter phone in international format (e.g., +1234567890)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="lab_technician">Lab Technician</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              onBlur={() => handleBlur('specialization')}
              className={errors.specialization ? 'border-destructive' : ''}
              placeholder="e.g., Cardiologist, Pediatrician, etc."
              maxLength={200}
            />
            {errors.specialization && (
              <p className="text-sm text-destructive">{errors.specialization}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">
              License Number {requiresLicense && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              onBlur={() => handleBlur('licenseNumber')}
              className={errors.licenseNumber ? 'border-destructive' : ''}
              placeholder="e.g., MD-12345-AB"
              maxLength={20}
            />
            {errors.licenseNumber && (
              <p className="text-sm text-destructive">{errors.licenseNumber}</p>
            )}
            <p className="text-xs text-muted-foreground">5-20 alphanumeric characters (hyphens allowed)</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register Staff'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StaffRegistrationForm;