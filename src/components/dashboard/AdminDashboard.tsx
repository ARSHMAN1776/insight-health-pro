import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Bed, 
  Stethoscope, 
  AlertTriangle,
  Clock,
  Heart
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for charts
  const dailyPatients = [
    { day: 'Mon', patients: 45, appointments: 52 },
    { day: 'Tue', patients: 52, appointments: 48 },
    { day: 'Wed', patients: 48, appointments: 61 },
    { day: 'Thu', patients: 61, appointments: 55 },
    { day: 'Fri', patients: 55, appointments: 67 },
    { day: 'Sat', patients: 67, appointments: 44 },
    { day: 'Sun', patients: 44, appointments: 38 }
  ];

  const departmentData = [
    { department: 'Emergency', patients: 85, color: '#ef4444' },
    { department: 'Cardiology', patients: 65, color: '#3b82f6' },
    { department: 'Orthopedics', patients: 45, color: '#10b981' },
    { department: 'Pediatrics', patients: 55, color: '#f59e0b' },
    { department: 'Neurology', patients: 35, color: '#8b5cf6' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 85000, expenses: 45000 },
    { month: 'Feb', revenue: 92000, expenses: 48000 },
    { month: 'Mar', revenue: 78000, expenses: 52000 },
    { month: 'Apr', revenue: 98000, expenses: 49000 },
    { month: 'May', revenue: 105000, expenses: 54000 },
    { month: 'Jun', revenue: 112000, expenses: 58000 }
  ];

  const stats = [
    {
      title: 'Total Patients',
      value: '2,845',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-medical-blue'
    },
    {
      title: 'Today\'s Appointments',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-medical-green'
    },
    {
      title: 'Monthly Revenue',
      value: '$112,000',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-medical-purple'
    },
    {
      title: 'Bed Occupancy',
      value: '89%',
      change: '+3%',
      changeType: 'positive',
      icon: Bed,
      color: 'bg-medical-orange'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'patient', message: 'New patient John Doe registered', time: '2 minutes ago', icon: Users },
    { id: 2, type: 'appointment', message: 'Dr. Smith appointment confirmed', time: '5 minutes ago', icon: Calendar },
    { id: 3, type: 'emergency', message: 'Emergency case admitted to ICU', time: '10 minutes ago', icon: AlertTriangle },
    { id: 4, type: 'billing', message: 'Invoice #1234 payment received', time: '15 minutes ago', icon: DollarSign },
    { id: 5, type: 'staff', message: 'New nurse Emily Johnson joined', time: '1 hour ago', icon: Stethoscope }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
            <p className="text-primary-foreground/80">Here's what's happening at your hospital today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-primary-foreground/80">Current Time</p>
              <p className="text-lg font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
            <Heart className="w-12 h-12 text-primary-foreground/80" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className={`text-sm ${stat.changeType === 'positive' ? 'text-success' : 'text-destructive'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">from last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Patients Chart */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-medical-blue" />
              <span>Daily Patient Flow</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyPatients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="hsl(var(--medical-blue))" strokeWidth={2} />
                <Line type="monotone" dataKey="appointments" stroke="hsl(var(--medical-green))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-medical-green" />
              <span>Department Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="patients"
                  label={({ department, patients }) => `${department}: ${patients}`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-medical-purple" />
            <span>Revenue vs Expenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(var(--medical-blue))" />
              <Bar dataKey="expenses" fill="hsl(var(--medical-red))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-medical-orange" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hospital Status */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bed className="w-5 h-5 text-medical-red" />
              <span>Hospital Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">ICU Beds</span>
                  <span className="text-sm text-muted-foreground">12/15</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">General Beds</span>
                  <span className="text-sm text-muted-foreground">145/180</span>
                </div>
                <Progress value={81} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Staff on Duty</span>
                  <span className="text-sm text-muted-foreground">85/100</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Emergency Capacity</span>
                  <span className="text-sm text-muted-foreground">Available</span>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  Normal
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;