import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Heart, Eye, EyeOff, Stethoscope, Shield, ArrowRight, Calendar, Phone, User, ArrowLeft, Lock, CheckCircle, Sparkles, Activity, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'patient' | 'staff'>('patient');
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phoneRegex.test(phone);
  };

  const normalizePhoneInput = (phone: string): string => {
    return phone.replace(/[^\d\s\-+()]/g, '');
  };

  const getTodayDateString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
        description: 'Welcome back to Hospital Management System',
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

    const dob = new Date(dateOfBirth);
    const today = new Date();
    if (dob >= today) {
      setError('Please enter a valid date of birth');
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
      toast({
        title: 'Signup Failed',
        description: err.message || 'Could not create account',
        variant: 'destructive'
      });
    }
  };

  const stats = [
    { icon: Users, value: '10,000+', label: 'Patients' },
    { icon: Activity, value: '50+', label: 'Specialists' },
    { icon: Clock, value: '24/7', label: 'Support' },
  ];

  const features = [
    'Access medical records anytime',
    'Book appointments online',
    'Secure messaging with doctors',
    'View lab results instantly',
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Enhanced Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=1600&fit=crop&q=80" 
            alt="Healthcare professionals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/75" />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-10 w-40 h-40 border border-white/20 rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-20 h-20 border border-white/10 rounded-full" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Trusted by 500+ Hospitals</span>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="space-y-10 max-w-xl">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/30">
                <Heart className="w-9 h-9 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-3xl xl:text-4xl font-bold tracking-tight">HealthCare HMS</h1>
                <p className="text-white/70 text-sm font-medium">Hospital Management System</p>
              </div>
            </div>
            
            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-[1.1]">
                Your Health Journey,
                <span className="block text-white/90 mt-1">Simplified.</span>
              </h2>
              <p className="text-lg xl:text-xl text-white/80 leading-relaxed max-w-md">
                Access your medical records, book appointments, and connect with healthcare professionals - all in one secure platform.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white/90" />
                    </div>
                    <div className="text-2xl xl:text-3xl font-bold">{stat.value}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Footer Trust Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-6 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-primary-foreground" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HealthCare HMS</h1>
                <p className="text-xs text-muted-foreground">Hospital Management</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-2xl shadow-primary/5 bg-card">
            <CardContent className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-muted-foreground">
                  {isSignup 
                    ? 'Register as a new patient'
                    : 'Sign in to access your healthcare portal'}
                </p>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'patient' | 'staff'); setIsSignup(false); setError(''); }}>
                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 h-12 bg-muted/50">
                  <TabsTrigger 
                    value="patient" 
                    className="gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-medium"
                  >
                    <User className="w-4 h-4" />
                    Patient
                  </TabsTrigger>
                  <TabsTrigger 
                    value="staff" 
                    className="gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-medium"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Staff
                  </TabsTrigger>
                </TabsList>

                {/* Patient Tab */}
                <TabsContent value="patient" className="mt-0">
                  {isSignup ? (
                    <form onSubmit={handlePatientSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="John"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="signupEmail" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                            className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={dateOfBirth}
                              onChange={(e) => setDateOfBirth(e.target.value)}
                              max={getTodayDateString()}
                              className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger className="h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="signupPassword" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signupPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <Alert variant="destructive" className="py-3">
                          <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary text-base"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                          <Button 
                            type="button" 
                            variant="link" 
                            className="text-xs text-primary p-0 h-auto font-medium"
                            onClick={() => navigate('/forgot-password')}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary text-base"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </div>

                      {error && (
                        <Alert variant="destructive" className="py-3">
                          <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  )}
                  
                  {/* Toggle Signup/Login */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isSignup ? 'Already have an account?' : "Don't have an account?"}
                      <Button
                        type="button"
                        variant="link"
                        className="text-primary font-semibold ml-1 p-0"
                        onClick={() => { setIsSignup(!isSignup); setError(''); }}
                      >
                        {isSignup ? 'Sign In' : 'Create one'}
                      </Button>
                    </p>
                  </div>
                </TabsContent>

                {/* Staff Tab */}
                <TabsContent value="staff" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="staffEmail" className="text-sm font-medium">Staff Email</Label>
                      <Input
                        id="staffEmail"
                        type="email"
                        placeholder="staff@hospital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="staffPassword" className="text-sm font-medium">Password</Label>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="text-xs text-primary p-0 h-auto font-medium"
                          onClick={() => navigate('/forgot-password')}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="staffPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary text-base"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="py-3">
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Staff Sign In'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                  
                  <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-sm text-muted-foreground text-center">
                      <Stethoscope className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      Staff accounts are created by administrators.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 text-center">
                      Contact your system administrator for access.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Security Notice */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-primary" />
                    </div>
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <span>HIPAA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in, you agree to our{' '}
            <Button variant="link" className="p-0 h-auto text-xs text-primary">Terms of Service</Button>
            {' '}and{' '}
            <Button variant="link" className="p-0 h-auto text-xs text-primary">Privacy Policy</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
