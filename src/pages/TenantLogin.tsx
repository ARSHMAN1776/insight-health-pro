import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Heart, Eye, EyeOff, Stethoscope, Shield, Lock, CheckCircle, User, Phone, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const TenantLogin: React.FC = () => {
  const { tenant, isLoading: tenantLoading, error: tenantError } = useTenant();
  const [activeTab, setActiveTab] = useState<'patient' | 'staff'>('staff');
  const [isSignup, setIsSignup] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Patient signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signupPatient, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Get branding colors or defaults
  const primaryColor = tenant?.branding.primaryColor || 'hsl(var(--primary))';
  const hospitalName = tenant?.name || 'Hospital Portal';
  const logoUrl = tenant?.branding.logoUrl;
  const tagline = tenant?.branding.tagline || 'Welcome to your healthcare portal';

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const normalizePhoneInput = (phone: string): string => {
    return phone.replace(/[^\d\s\-+()]/g, '');
  };

  const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await login(email, password);
      toast({
        title: 'Login Successful',
        description: `Welcome to ${hospitalName}`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast({
        title: 'Login Failed',
        description: err.message || 'Invalid credentials',
        variant: 'destructive'
      });
    }
  };

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !firstName || !lastName || !phone || !dateOfBirth || !gender) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signupPatient({
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth,
        gender
      });
      
      toast({
        title: 'Account Created Successfully!',
        description: 'You can now sign in with your credentials.',
      });
      
      setIsSignup(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setDateOfBirth('');
      setGender('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  // Show loading state
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  // Show error if tenant not found
  if (tenantError || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Organization Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The hospital portal you're looking for doesn't exist or has been deactivated.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = 'https://insight-health-pro.lovable.app'}
            >
              Go to Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branded Hero */}
      <div 
        className="hidden lg:flex lg:w-[50%] relative overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Header with Logo */}
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={hospitalName}
                className="w-16 h-16 object-contain rounded-xl bg-white/10 p-2"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Heart className="w-9 h-9 text-white" fill="currentColor" />
              </div>
            )}
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold tracking-tight">{hospitalName}</h1>
              {tenant?.branding.tagline && (
                <p className="text-white/70 text-sm">{tenant.branding.tagline}</p>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="space-y-8 max-w-md">
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                Welcome to Your
                <span className="block text-white/90">Healthcare Portal</span>
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Access your medical records, book appointments, and connect with our healthcare team.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {['Secure medical records access', 'Easy appointment booking', 'Direct messaging with doctors', 'View lab results instantly'].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer with Contact Info */}
          <div className="space-y-4">
            {tenant?.branding.address && (
              <p className="text-white/60 text-sm">{tenant.branding.address}</p>
            )}
            <div className="flex gap-4 text-sm text-white/70">
              {tenant?.branding.phone && <span>{tenant.branding.phone}</span>}
              {tenant?.branding.email && <span>{tenant.branding.email}</span>}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-medium">256-bit SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={hospitalName}
                className="w-16 h-16 mx-auto mb-4 object-contain"
              />
            ) : (
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Heart className="w-9 h-9 text-white" fill="currentColor" />
              </div>
            )}
            <h1 className="text-xl font-bold">{hospitalName}</h1>
            {tenant?.branding.tagline && (
              <p className="text-sm text-muted-foreground">{tenant.branding.tagline}</p>
            )}
          </div>

          {/* Form Card */}
          <Card className="border shadow-xl">
            <CardContent className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {isSignup ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isSignup 
                    ? 'Register as a new patient'
                    : 'Access your healthcare portal'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'patient' | 'staff'); setIsSignup(false); setError(''); }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="staff" className="gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Staff
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="gap-2">
                    <User className="w-4 h-4" />
                    Patient
                  </TabsTrigger>
                </TabsList>

                {/* Staff Login */}
                <TabsContent value="staff">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff-email">Email</Label>
                      <Input
                        id="staff-email"
                        type="email"
                        placeholder="staff@hospital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="staff-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>

                {/* Patient Tab */}
                <TabsContent value="patient">
                  {isSignup ? (
                    <form onSubmit={handlePatientSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="h-10"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupEmail">Email</Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={phone}
                          onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                          className="h-10"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            max={getTodayDateString()}
                            className="h-10"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signupPassword">Password</Label>
                        <Input
                          id="signupPassword"
                          type="password"
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-10"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-10"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full h-11" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setIsSignup(false)}
                          className="text-primary font-medium hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient-email">Email</Label>
                        <Input
                          id="patient-email"
                          type="email"
                          placeholder="patient@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="patient-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="patient-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-11" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        New patient?{' '}
                        <button
                          type="button"
                          onClick={() => setIsSignup(true)}
                          className="text-primary font-medium hover:underline"
                        >
                          Create an account
                        </button>
                      </p>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Powered by footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Powered by <a href="https://insight-health-pro.lovable.app" className="font-medium hover:text-primary">HealthCare HMS</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantLogin;
