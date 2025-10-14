import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Heart, Eye, EyeOff, Users, Stethoscope, Shield, UserCheck, Pill, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, signup, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
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
      await signup(email, password, firstName, lastName);
      toast({
        title: 'Account Created',
        description: 'Please check your email to verify your account',
      });
      setIsSignup(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">HMS</h1>
                <p className="text-sm text-muted-foreground">Hospital Management System</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Your Healthcare Hub
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Streamline hospital operations with our comprehensive management system designed for modern healthcare.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="stat-card">
                <Activity className="w-8 h-8 text-medical-blue mb-2" />
                <h3 className="text-xl font-bold text-foreground">10,000+</h3>
                <p className="text-sm text-muted-foreground">Patients Served</p>
              </div>
              <div className="stat-card">
                <Stethoscope className="w-8 h-8 text-medical-green mb-2" />
                <h3 className="text-xl font-bold text-foreground">50+</h3>
                <p className="text-sm text-muted-foreground">Medical Staff</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Signup Form */}
        <div className="flex flex-col justify-center">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isSignup ? 'Create Account' : 'Sign In'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignup 
                  ? 'Register for a new patient account'
                  : 'Enter your credentials to access the system'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                {isSignup && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isSignup ? 'Min. 6 characters' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              {/* Toggle between Login and Signup */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }}
                >
                  {isSignup 
                    ? 'Already have an account? Sign in'
                    : 'New patient? Create an account'}
                </Button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-success mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Your data is secure</p>
                    <p>We use industry-standard encryption to protect your health information.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;