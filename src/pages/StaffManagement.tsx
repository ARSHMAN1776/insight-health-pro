import React, { useState } from 'react';
import { useAuth, UserRole, StaffSignupData } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { UserPlus, Shield, Stethoscope, Users, Pill, UserCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

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
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                Only administrators can create staff accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const staffRoles: { value: UserRole; label: string; icon: React.ElementType }[] = [
    { value: 'doctor', label: 'Doctor', icon: Stethoscope },
    { value: 'nurse', label: 'Nurse', icon: UserCheck },
    { value: 'receptionist', label: 'Receptionist', icon: Users },
    { value: 'pharmacist', label: 'Pharmacist', icon: Pill },
    { value: 'admin', label: 'Administrator', icon: Shield }
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Staff Account Management</h1>
            <p className="text-muted-foreground">Create accounts for hospital staff members</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create Staff Account
            </CardTitle>
            <CardDescription>
              Fill in the details to create a new staff account. The staff member will receive login credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Staff Role *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {staffRoles.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      type="button"
                      variant={formData.role === value ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => handleChange('role', value)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="staff@hospital.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Front Desk">Front Desk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    placeholder="e.g., Cardiology, Pediatrics"
                  />
                </div>
              </div>

              {/* License Number */}
              {['doctor', 'nurse', 'pharmacist'].includes(formData.role) && (
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    placeholder="e.g., MD123456"
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Staff Account'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Staff accounts are created with immediate access - no email verification required for testing.</p>
            <p>• License numbers are required for medical professionals (doctors, nurses, pharmacists).</p>
            <p>• Share the login credentials securely with the new staff member.</p>
            <p>• Staff members can change their password after first login.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StaffManagement;
