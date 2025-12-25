import React, { useState } from 'react';
import { useAuth, UserRole, StaffSignupData } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { 
  UserPlus, 
  Shield, 
  Stethoscope, 
  Users, 
  Pill, 
  UserCheck, 
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Award,
  Lock,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Separator } from '../components/ui/separator';

const StaffManagement: React.FC = () => {
  const { user, signupStaff, isLoading, isRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<StaffSignupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'doctor',
    phone: '',
    department: '',
    specialization: '',
    licenseNumber: ''
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Only admins can access this page
  if (!user || !isRole('admin')) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md shadow-elegant">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                Only administrators can create staff accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const staffRoles: { value: UserRole; label: string; icon: React.ElementType; description: string; color: string }[] = [
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Medical practitioner', color: 'bg-primary/10 text-primary border-primary/20' },
    { value: 'nurse', label: 'Nurse', icon: UserCheck, description: 'Patient care specialist', color: 'bg-success/10 text-success border-success/20' },
    { value: 'receptionist', label: 'Receptionist', icon: Users, description: 'Front desk staff', color: 'bg-info/10 text-info border-info/20' },
    { value: 'pharmacist', label: 'Pharmacist', icon: Pill, description: 'Medication specialist', color: 'bg-warning/10 text-warning border-warning/20' },
    { value: 'admin', label: 'Administrator', icon: Shield, description: 'System administrator', color: 'bg-destructive/10 text-destructive border-destructive/20' }
  ];

  const departments = [
    'Administration',
    'Emergency',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Surgery',
    'Pharmacy',
    'Laboratory',
    'Radiology',
    'Front Desk'
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // License number required for doctors, nurses, pharmacists
    if (['doctor', 'nurse', 'pharmacist'].includes(formData.role) && !formData.licenseNumber) {
      setError('License number is required for this role');
      return;
    }

    try {
      await signupStaff({
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      });
      
      toast({
        title: 'Staff Account Created',
        description: `Account for ${formData.firstName} ${formData.lastName} (${formData.role}) has been created successfully.`,
      });
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'doctor',
        phone: '',
        department: '',
        specialization: '',
        licenseNumber: ''
      });
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to create staff account');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create staff account',
        variant: 'destructive'
      });
    }
  };

  const handleChange = (field: keyof StaffSignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedRole = staffRoles.find(r => r.value === formData.role);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Staff Account Management</h1>
              <p className="text-muted-foreground mt-1">Create and manage hospital staff accounts</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Access</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-elegant border-border/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Create Staff Account</CardTitle>
                    <CardDescription>
                      Fill in the details to create a new staff account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Role Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Select Role
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {staffRoles.map(({ value, label, icon: Icon, description, color }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleChange('role', value)}
                          className={`
                            relative p-4 rounded-xl border-2 text-left transition-all duration-200
                            ${formData.role === value 
                              ? `${color} border-current shadow-md scale-[1.02]` 
                              : 'border-border hover:border-primary/30 hover:bg-muted/50'
                            }
                          `}
                        >
                          {formData.role === value && (
                            <CheckCircle2 className="absolute top-2 right-2 w-4 h-4" />
                          )}
                          <Icon className="w-6 h-6 mb-2" />
                          <p className="font-semibold text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-muted-foreground" />
                      Personal Information
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm">First Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          placeholder="John"
                          className="h-11 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm">Last Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          placeholder="Smith"
                          className="h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Contact Information
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">Email Address <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="staff@hospital.com"
                            className="h-11 pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+1234567890"
                            className="h-11 pl-10 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      Professional Details
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm">Department</Label>
                        <Select 
                          value={formData.department} 
                          onValueChange={(value) => handleChange('department', value)}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border shadow-lg z-50">
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization" className="text-sm">Specialization</Label>
                        <Input
                          id="specialization"
                          value={formData.specialization}
                          onChange={(e) => handleChange('specialization', e.target.value)}
                          placeholder="e.g., Cardiology, Pediatrics"
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* License Number */}
                  {['doctor', 'nurse', 'pharmacist'].includes(formData.role) && (
                    <div className="space-y-4">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        License Information
                      </Label>
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber" className="text-sm">License Number <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={(e) => handleChange('licenseNumber', e.target.value)}
                            placeholder="e.g., MD123456"
                            className="h-11 pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Password */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Set Password
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm">Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="Min. 6 characters"
                            className="h-11 pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm">Confirm Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="h-11 pl-10 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Create Staff Account
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/dashboard')}
                      className="h-12 px-6 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Selected Role Preview */}
            {selectedRole && (
              <Card className="shadow-md border-border/50 overflow-hidden">
                <CardHeader className={`${selectedRole.color} border-b`}>
                  <div className="flex items-center gap-3">
                    <selectedRole.icon className="w-8 h-8" />
                    <div>
                      <CardTitle className="text-lg">{selectedRole.label}</CardTitle>
                      <CardDescription className="text-current/70">{selectedRole.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedRole.value === 'doctor' && 'Full access to patient records, prescriptions, lab tests, and medical documentation.'}
                    {selectedRole.value === 'nurse' && 'Access to patient care, vitals monitoring, medication administration, and room management.'}
                    {selectedRole.value === 'receptionist' && 'Manages appointments, patient registration, billing, and front desk operations.'}
                    {selectedRole.value === 'pharmacist' && 'Handles prescriptions, medication inventory, drug interactions, and pharmacy operations.'}
                    {selectedRole.value === 'admin' && 'Full system access including user management, settings, reports, and all hospital operations.'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Instructions Card */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Staff accounts are created with immediate access</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">License numbers required for medical professionals</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Share credentials securely with staff</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Password can be changed after first login</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-md border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Logged in as</p>
                  <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-primary font-medium uppercase mt-1">{user.role}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffManagement;
