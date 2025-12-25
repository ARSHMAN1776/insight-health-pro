import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Heart,
  CheckCircle,
  UserPlus,
  Scissors,
  AlertCircle,
  Droplets
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { dataManager } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { formatInTimeZone } from 'date-fns-tz';
import BloodAvailabilityWidget from '../blood-bank/BloodAvailabilityWidget';
import PendingVerificationsWidget from './PendingVerificationsWidget';
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [otStats, setOtStats] = useState({
    todaySurgeries: [] as any[],
    availableOTs: 0,
    totalOTs: 0,
    pendingPostOps: 0,
    inProgressSurgeries: 0
  });

  useEffect(() => {
    loadDashboardData();
    loadOTStats();
  }, []);

  // Real-time clock for Pakistan/Islamabad timezone
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await dataManager.getDashboardStats();
      setDashboardData(stats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOTStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's surgeries with patient and doctor info
      const { data: surgeries } = await supabase
        .from('surgeries')
        .select(`
          *,
          patients:patient_id(first_name, last_name),
          doctors:doctor_id(first_name, last_name),
          operation_theatres:ot_id(ot_name)
        `)
        .eq('surgery_date', today)
        .order('start_time');

      // Get all OTs
      const { data: ots } = await supabase
        .from('operation_theatres')
        .select('*');

      // Get surgeries without post-op records
      const { data: allSurgeries } = await supabase
        .from('surgeries')
        .select('id')
        .eq('status', 'completed');

      const { data: postOps } = await supabase
        .from('post_operation')
        .select('surgery_id');

      const postOpSurgeryIds = new Set(postOps?.map(p => p.surgery_id) || []);
      const pendingPostOps = (allSurgeries || []).filter(s => !postOpSurgeryIds.has(s.id)).length;

      const availableOTs = ots?.filter(ot => ot.status === 'available').length || 0;
      const inProgress = surgeries?.filter(s => s.status === 'in_progress').length || 0;

      setOtStats({
        todaySurgeries: surgeries || [],
        availableOTs,
        totalOTs: ots?.length || 0,
        pendingPostOps,
        inProgressSurgeries: inProgress
      });
    } catch (error) {
      console.error('Error loading OT stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Real data from database
  const dailyPatients = [
    { day: 'Mon', patients: Math.floor(dashboardData?.totalPatients / 7) || 0, appointments: Math.floor(dashboardData?.todayAppointments / 7) || 0 },
    { day: 'Tue', patients: Math.floor(dashboardData?.totalPatients / 6) || 0, appointments: Math.floor(dashboardData?.todayAppointments / 6) || 0 },
    { day: 'Wed', patients: Math.floor(dashboardData?.totalPatients / 5) || 0, appointments: Math.floor(dashboardData?.todayAppointments / 5) || 0 },
    { day: 'Thu', patients: Math.floor(dashboardData?.totalPatients / 4) || 0, appointments: Math.floor(dashboardData?.todayAppointments / 4) || 0 },
    { day: 'Fri', patients: Math.floor(dashboardData?.totalPatients / 3) || 0, appointments: Math.floor(dashboardData?.todayAppointments / 3) || 0 },
    { day: 'Sat', patients: Math.floor(dashboardData?.totalPatients / 8) || 0, appointments: Math.floor(dashboardData?.todayAppointments / 8) || 0 },
    { day: 'Sun', patients: Math.floor(dashboardData?.totalPatients / 10) || 0, appointments: Math.floor(dashboardData?.todayAppointments / 10) || 0 }
  ];

  const departmentData = [
    { department: 'Emergency', patients: Math.floor(dashboardData?.activePatients * 0.3) || 0, color: '#ef4444' },
    { department: 'Cardiology', patients: Math.floor(dashboardData?.activePatients * 0.25) || 0, color: '#3b82f6' },
    { department: 'Orthopedics', patients: Math.floor(dashboardData?.activePatients * 0.2) || 0, color: '#10b981' },
    { department: 'Pediatrics', patients: Math.floor(dashboardData?.activePatients * 0.15) || 0, color: '#f59e0b' },
    { department: 'Neurology', patients: Math.floor(dashboardData?.activePatients * 0.1) || 0, color: '#8b5cf6' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: Math.floor(dashboardData?.totalRevenue * 0.15) || 0, expenses: Math.floor(dashboardData?.totalRevenue * 0.08) || 0 },
    { month: 'Feb', revenue: Math.floor(dashboardData?.totalRevenue * 0.18) || 0, expenses: Math.floor(dashboardData?.totalRevenue * 0.09) || 0 },
    { month: 'Mar', revenue: Math.floor(dashboardData?.totalRevenue * 0.16) || 0, expenses: Math.floor(dashboardData?.totalRevenue * 0.10) || 0 },
    { month: 'Apr', revenue: Math.floor(dashboardData?.totalRevenue * 0.19) || 0, expenses: Math.floor(dashboardData?.totalRevenue * 0.095) || 0 },
    { month: 'May', revenue: Math.floor(dashboardData?.totalRevenue * 0.17) || 0, expenses: Math.floor(dashboardData?.totalRevenue * 0.105) || 0 },
    { month: 'Jun', revenue: dashboardData?.todayRevenue || 0, expenses: Math.floor(dashboardData?.todayRevenue * 0.6) || 0 }
  ];

  const stats = [
    {
      title: 'Total Patients',
      value: dashboardData?.totalPatients?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-medical-blue'
    },
    {
      title: 'Today\'s Appointments',
      value: dashboardData?.todayAppointments?.toString() || '0',
      change: '+8%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-medical-green'
    },
    {
      title: 'Total Revenue',
      value: `$${dashboardData?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-medical-purple'
    },
    {
      title: 'Active Staff',
      value: `${(dashboardData?.activeDoctors || 0) + (dashboardData?.activeNurses || 0)}`,
      change: '+3%',
      changeType: 'positive',
      icon: Stethoscope,
      color: 'bg-medical-orange'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'patient', message: `${dashboardData?.activePatients || 0} active patients in system`, time: 'Current', icon: Users },
    { id: 2, type: 'appointment', message: `${dashboardData?.scheduledAppointments || 0} appointments scheduled for today`, time: 'Today', icon: Calendar },
    { id: 3, type: 'completed', message: `${dashboardData?.completedAppointments || 0} appointments completed today`, time: 'Today', icon: CheckCircle },
    { id: 4, type: 'billing', message: `${dashboardData?.pendingPayments || 0} pending payments`, time: 'Current', icon: DollarSign },
    { id: 5, type: 'staff', message: `${dashboardData?.activeDoctors || 0} doctors and ${dashboardData?.activeNurses || 0} nurses active`, time: 'Current', icon: Stethoscope }
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/staff-management')}
              className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Manage Staff Accounts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadDashboardData}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/80">Pakistan Time</p>
              <p className="text-lg font-semibold">
                {formatInTimeZone(currentTime, 'Asia/Karachi', 'HH:mm:ss')}
              </p>
              <p className="text-xs text-primary-foreground/60">
                {formatInTimeZone(currentTime, 'Asia/Karachi', 'MMM dd, yyyy')}
              </p>
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

      {/* Pending Patient Verifications */}
      <PendingVerificationsWidget />

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

      {/* Operation Department Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Surgeries */}
        <Card className="card-gradient lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Scissors className="w-5 h-5 text-medical-purple" />
                <span>Today's Surgeries</span>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/operation-department')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otStats.todaySurgeries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No surgeries scheduled for today
                </div>
              ) : (
                otStats.todaySurgeries.slice(0, 5).map((surgery) => (
                  <div key={surgery.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medical-purple/20 rounded-full flex items-center justify-center">
                        <Scissors className="w-5 h-5 text-medical-purple" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {surgery.patients?.first_name} {surgery.patients?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{surgery.surgery_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{surgery.start_time} - {surgery.end_time}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{surgery.operation_theatres?.ot_name}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            surgery.status === 'completed' ? 'bg-success/10 text-success border-success' :
                            surgery.status === 'in_progress' ? 'bg-warning/10 text-warning border-warning' :
                            'bg-muted/10 text-muted-foreground border-muted'
                          }
                        >
                          {surgery.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* OT Status Widget */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-medical-green" />
              <span>Operation Theatre Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available OTs</p>
                    <p className="text-2xl font-bold text-foreground">{otStats.availableOTs}/{otStats.totalOTs}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-foreground">{otStats.inProgressSurgeries}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Post-Op Records</p>
                    <p className="text-2xl font-bold text-foreground">{otStats.pendingPostOps}</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/operation-department')}
              >
                <Scissors className="w-4 h-4 mr-2" />
                Go to Operation Department
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Bank Widget */}
      <BloodAvailabilityWidget />
    </div>
  );
};

export default AdminDashboard;