import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Heart, Eye, EyeOff, Users, Stethoscope, Shield, UserCheck, Pill, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome to Hospital Management System',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const demoAccounts = [
    { email: 'admin@hospital.com', role: 'Administrator', icon: Shield, color: 'text-medical-purple' },
    { email: 'doctor@hospital.com', role: 'Doctor', icon: Stethoscope, color: 'text-medical-blue' },
    { email: 'nurse@hospital.com', role: 'Nurse', icon: Heart, color: 'text-medical-green' },
    { email: 'patient@hospital.com', role: 'Patient', icon: Users, color: 'text-medical-orange' },
    { email: 'receptionist@hospital.com', role: 'Receptionist', icon: UserCheck, color: 'text-medical-blue' },
    { email: 'pharmacist@hospital.com', role: 'Pharmacist', icon: Pill, color: 'text-medical-red' }
  ];

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

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
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
                      placeholder="Enter your password"
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
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {demoAccounts.map((account, index) => {
                    const Icon = account.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => {
                          setEmail(account.email);
                          setPassword('password123');
                        }}
                      >
                        <Icon className={`w-3 h-3 mr-1 ${account.color}`} />
                        {account.role}
                      </Button>
                    );
                  })}
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Password for all demo accounts: <code className="bg-muted px-1 rounded">password123</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;