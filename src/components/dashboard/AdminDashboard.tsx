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
  Clock,
  Heart,
  CheckCircle,
  UserPlus,
  Scissors,
  AlertCircle,
  Database,
  Loader2
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
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import BloodAvailabilityWidget from '../blood-bank/BloodAvailabilityWidget';
import PendingVerificationsWidget from './PendingVerificationsWidget';
import { demoDataSeeder, SeedProgress } from '../../lib/demoDataSeeder';

// HIPAA-compliant interface - only aggregate data, no PII
interface BedStats {
  icuTotal: number;
  icuOccupied: number;
  generalTotal: number;
  generalOccupied: number;
  privateTotal: number;
  privateOccupied: number;
  emergencyCapacity: 'normal' | 'high' | 'critical';
}

interface DailyPatientData {
  day: string;
  date: string;
  patients: number;
  appointments: number;
}

interface DepartmentData {
  department: string;
  patients: number;
  color: string;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

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
  
  // Real data states
  const [bedStats, setBedStats] = useState<BedStats>({
    icuTotal: 0,
    icuOccupied: 0,
    generalTotal: 0,
    generalOccupied: 0,
    privateTotal: 0,
    privateOccupied: 0,
    emergencyCapacity: 'normal'
  });
  const [dailyPatients, setDailyPatients] = useState<DailyPatientData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [revenueData, setRevenueData] = useState<MonthlyRevenueData[]>([]);
  
  // Demo data seeding state
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadOTStats();
    loadBedStats();
    loadDailyPatientData();
    loadDepartmentData();
    loadRevenueData();
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

  // HIPAA-compliant: Fetch aggregate bed statistics only
  const loadBedStats = async () => {
    try {
      // Get rooms with capacity info
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id, room_type, capacity, current_occupancy, status');

      if (!rooms) return;

      // Get active room assignments count per room
      const { data: assignments } = await supabase
        .from('room_assignments')
        .select('room_id')
        .eq('status', 'active');

      const occupancyMap = new Map<string, number>();
      assignments?.forEach(a => {
        occupancyMap.set(a.room_id, (occupancyMap.get(a.room_id) || 0) + 1);
      });

      // Calculate totals by room type (HIPAA-safe aggregate data)
      let icuTotal = 0, icuOccupied = 0;
      let generalTotal = 0, generalOccupied = 0;
      let privateTotal = 0, privateOccupied = 0;

      rooms.forEach(room => {
        const capacity = room.capacity || 1;
        const occupied = occupancyMap.get(room.id) || room.current_occupancy || 0;
        
        switch (room.room_type?.toLowerCase()) {
          case 'icu':
            icuTotal += capacity;
            icuOccupied += Math.min(occupied, capacity);
            break;
          case 'general':
          case 'ward':
            generalTotal += capacity;
            generalOccupied += Math.min(occupied, capacity);
            break;
          case 'private':
          case 'vip':
            privateTotal += capacity;
            privateOccupied += Math.min(occupied, capacity);
            break;
          default:
            generalTotal += capacity;
            generalOccupied += Math.min(occupied, capacity);
        }
      });

      // Calculate emergency capacity based on ICU availability
      const icuUtilization = icuTotal > 0 ? (icuOccupied / icuTotal) * 100 : 0;
      const emergencyCapacity: 'normal' | 'high' | 'critical' = 
        icuUtilization >= 90 ? 'critical' : 
        icuUtilization >= 75 ? 'high' : 'normal';

      setBedStats({
        icuTotal,
        icuOccupied,
        generalTotal,
        generalOccupied,
        privateTotal,
        privateOccupied,
        emergencyCapacity
      });
    } catch (error) {
      console.error('Error loading bed stats:', error);
    }
  };

  // HIPAA-compliant: Only aggregate patient counts by day
  const loadDailyPatientData = async () => {
    try {
      const today = new Date();
      const weekDays = eachDayOfInterval({
        start: subDays(today, 6),
        end: today
      });

      const dailyData: DailyPatientData[] = [];

      for (const day of weekDays) {
        const dateStr = format(day, 'yyyy-MM-dd');
        
        // Count appointments per day (aggregate only)
        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', dateStr)
          .is('deleted_at', null);

        // Count new patient registrations per day
        const { count: patientCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)
          .is('deleted_at', null);

        dailyData.push({
          day: format(day, 'EEE'),
          date: dateStr,
          patients: patientCount || 0,
          appointments: appointmentCount || 0
        });
      }

      setDailyPatients(dailyData);
    } catch (error) {
      console.error('Error loading daily patient data:', error);
    }
  };

  // HIPAA-compliant: Aggregate patient counts by department
  const loadDepartmentData = async () => {
    try {
      const departmentColors = [
        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
        '#ec4899', '#14b8a6', '#f97316'
      ];

      // Get departments
      const { data: departments } = await supabase
        .from('departments')
        .select('department_id, department_name')
        .eq('status', 'Active');

      if (!departments) return;

      // Count appointments per department (aggregate data only)
      const deptData: DepartmentData[] = [];
      
      for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('department_id', dept.department_id)
          .is('deleted_at', null);

        deptData.push({
          department: dept.department_name,
          patients: count || 0,
          color: departmentColors[i % departmentColors.length]
        });
      }

      // Sort by patient count and take top 5
      const sortedData = deptData
        .sort((a, b) => b.patients - a.patients)
        .slice(0, 5);

      setDepartmentData(sortedData);
    } catch (error) {
      console.error('Error loading department data:', error);
    }
  };

  // HIPAA-compliant: Aggregate revenue data only
  const loadRevenueData = async () => {
    try {
      const today = new Date();
      const monthlyData: MonthlyRevenueData[] = [];

      // Get last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        // Get total revenue for the month (aggregate only, no PII)
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, payment_status')
          .gte('payment_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('payment_date', format(monthEnd, 'yyyy-MM-dd'))
          .is('deleted_at', null);

        const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        // Estimate expenses as 60% of revenue for now (can be enhanced with actual expense tracking)
        const expenses = Math.floor(revenue * 0.6);

        monthlyData.push({
          month: format(monthDate, 'MMM'),
          revenue,
          expenses
        });
      }

      setRevenueData(monthlyData);
    } catch (error) {
      console.error('Error loading revenue data:', error);
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

  // Demo data seeding handler
  const handleSeedDemoData = async () => {
    if (isSeeding) return;
    
    setIsSeeding(true);
    setSeedProgress(null);
    
    demoDataSeeder.setProgressCallback((progress) => {
      setSeedProgress(progress);
    });

    try {
      const result = await demoDataSeeder.seedAll();
      
      if (result.success) {
        toast({
          title: 'Demo Data Created!',
          description: `Created: ${result.stats.departments || 0} departments, ${result.stats.doctors || 0} doctors, ${result.stats.patients || 0} patients, ${result.stats.appointments || 0} appointments`,
        });
        // Refresh dashboard data
        loadDashboardData();
        loadDepartmentData();
        loadDailyPatientData();
      } else {
        toast({
          title: 'Seeding Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed demo data',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
      setSeedProgress(null);
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

  // Calculate total beds for staff ratio
  const totalBeds = bedStats.icuTotal + bedStats.generalTotal + bedStats.privateTotal;
  const totalOccupied = bedStats.icuOccupied + bedStats.generalOccupied + bedStats.privateOccupied;
  const activeStaff = (dashboardData?.activeDoctors || 0) + (dashboardData?.activeNurses || 0);

  const stats = [
    {
      title: 'Total Patients',
      value: dashboardData?.totalPatients?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-medical-blue'
    },
    {
      title: 'Today\'s Appointments',
      value: dashboardData?.todayAppointments?.toString() || '0',
      icon: Calendar,
      color: 'bg-medical-green'
    },
    {
      title: 'Total Revenue',
      value: `$${dashboardData?.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'bg-medical-purple'
    },
    {
      title: 'Active Staff',
      value: `${activeStaff}`,
      icon: Stethoscope,
      color: 'bg-medical-orange'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'patient', message: `${dashboardData?.activePatients || 0} active patients in system`, time: 'Current', icon: Users },
    { id: 2, type: 'appointment', message: `${dashboardData?.scheduledAppointments || 0} appointments scheduled for today`, time: 'Today', icon: Calendar },
    { id: 3, type: 'completed', message: `${dashboardData?.completedAppointments || 0} appointments completed today`, time: 'Today', icon: CheckCircle },
    { id: 4, type: 'billing', message: `${dashboardData?.pendingPayments || 0} pending payments`, time: 'Current', icon: DollarSign },
    { id: 5, type: 'beds', message: `${totalOccupied}/${totalBeds} beds occupied`, time: 'Current', icon: Bed }
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
              onClick={handleSeedDemoData}
              className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
              disabled={isSeeding}
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {seedProgress?.step || 'Seeding...'}
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Seed Demo Data
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/staff-management')}
              className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Manage Staff
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadDashboardData}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
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

        {/* Hospital Status - HIPAA Compliant: Aggregate data only */}
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
                  <span className="text-sm text-muted-foreground">
                    {bedStats.icuOccupied}/{bedStats.icuTotal}
                  </span>
                </div>
                <Progress 
                  value={bedStats.icuTotal > 0 ? (bedStats.icuOccupied / bedStats.icuTotal) * 100 : 0} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">General Beds</span>
                  <span className="text-sm text-muted-foreground">
                    {bedStats.generalOccupied}/{bedStats.generalTotal}
                  </span>
                </div>
                <Progress 
                  value={bedStats.generalTotal > 0 ? (bedStats.generalOccupied / bedStats.generalTotal) * 100 : 0} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Private/VIP Beds</span>
                  <span className="text-sm text-muted-foreground">
                    {bedStats.privateOccupied}/{bedStats.privateTotal}
                  </span>
                </div>
                <Progress 
                  value={bedStats.privateTotal > 0 ? (bedStats.privateOccupied / bedStats.privateTotal) * 100 : 0} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Emergency Capacity</span>
                  <span className="text-sm text-muted-foreground">
                    {bedStats.emergencyCapacity === 'normal' ? 'Available' : 
                     bedStats.emergencyCapacity === 'high' ? 'Limited' : 'Critical'}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    bedStats.emergencyCapacity === 'normal' 
                      ? 'bg-success/10 text-success border-success'
                      : bedStats.emergencyCapacity === 'high'
                      ? 'bg-warning/10 text-warning border-warning'
                      : 'bg-destructive/10 text-destructive border-destructive'
                  }
                >
                  {bedStats.emergencyCapacity === 'normal' ? 'Normal' :
                   bedStats.emergencyCapacity === 'high' ? 'High Load' : 'Critical'}
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