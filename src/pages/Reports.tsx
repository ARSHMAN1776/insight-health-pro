import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, TrendingUp, Users, Activity, DollarSign, FileText, Download, Bed, UserCheck, Clock, Briefcase, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimezone } from '@/hooks/useTimezone';
import { exportToCSV, patientColumns, appointmentColumns, paymentColumns } from '@/lib/exportUtils';
import { generatePDFReport, downloadPDF, exportToCSV as exportCSVNew } from '@/lib/reportGenerator';
import { dataManager } from '@/lib/dataManager';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
const StaffPerformance = lazy(() => import('@/components/reports/StaffPerformance'));
const SatisfactionAnalytics = lazy(() => import('@/components/reports/SatisfactionAnalytics'));

interface CensusData {
  currentInpatients: number;
  admissionsToday: number;
  dischargesToday: number;
  availableBeds: number;
  totalBeds: number;
  occupancyRate: number;
  roomOccupancy: { room: string; type: string; occupied: number; capacity: number }[];
}

interface AppointmentAnalytics {
  totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  completionRate: number;
  noShowRate: number;
  avgPerDay: number;
  byDayOfWeek: { day: string; count: number }[];
  byType: { type: string; count: number }[];
  trend: { date: string; appointments: number; completed: number }[];
}

interface RevenueAnalytics {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  avgTransactionValue: number;
  byMethod: { method: string; amount: number; count: number }[];
  byMonth: { month: string; revenue: number; paid: number; pending: number }[];
  topServices: { service: string; amount: number }[];
}

interface StaffWorkload {
  doctors: { id: string; name: string; specialization: string; appointments: number; patients: number; avgPerDay: number }[];
  departmentLoad: { department: string; appointments: number; doctors: number; avgPerDoctor: number }[];
  busyHours: { hour: string; appointments: number }[];
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentDate } = useTimezone();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  
  const [censusData, setCensusData] = useState<CensusData>({
    currentInpatients: 0,
    admissionsToday: 0,
    dischargesToday: 0,
    availableBeds: 0,
    totalBeds: 0,
    occupancyRate: 0,
    roomOccupancy: []
  });

  const [appointmentAnalytics, setAppointmentAnalytics] = useState<AppointmentAnalytics>({
    totalAppointments: 0,
    completedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    completionRate: 0,
    noShowRate: 0,
    avgPerDay: 0,
    byDayOfWeek: [],
    byType: [],
    trend: []
  });

  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics>({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    overdueRevenue: 0,
    avgTransactionValue: 0,
    byMethod: [],
    byMonth: [],
    topServices: []
  });

  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload>({
    doctors: [],
    departmentLoad: [],
    busyHours: []
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  useEffect(() => {
    fetchAllReportData();
  }, [timeRange]);

  const fetchAllReportData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCensusData(),
        fetchAppointmentAnalytics(),
        fetchRevenueAnalytics(),
        fetchStaffWorkload()
      ]);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCensusData = async () => {
    const today = new Date(getCurrentDate()).toISOString().split('T')[0];
    
    // Get rooms data
    const { data: rooms } = await supabase.from('rooms').select('*');
    
    // Get current room assignments
    const { data: assignments } = await supabase
      .from('room_assignments')
      .select('*, rooms(room_number, room_type, capacity)')
      .eq('status', 'active');

    // Get today's admissions and discharges
    const { data: todayAdmissions } = await supabase
      .from('room_assignments')
      .select('*')
      .eq('admission_date', today);

    const { data: todayDischarges } = await supabase
      .from('room_assignments')
      .select('*')
      .eq('discharge_date', today);

    const totalBeds = rooms?.reduce((sum, r) => sum + (r.capacity || 0), 0) || 0;
    const occupiedBeds = assignments?.length || 0;
    const availableBeds = totalBeds - occupiedBeds;

    // Room occupancy breakdown
    const roomOccupancy = rooms?.map(room => {
      const roomAssignments = assignments?.filter(a => a.room_id === room.id) || [];
      return {
        room: room.room_number,
        type: room.room_type,
        occupied: roomAssignments.length,
        capacity: room.capacity || 0
      };
    }) || [];

    setCensusData({
      currentInpatients: occupiedBeds,
      admissionsToday: todayAdmissions?.length || 0,
      dischargesToday: todayDischarges?.length || 0,
      availableBeds,
      totalBeds,
      occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
      roomOccupancy
    });
  };

  const fetchAppointmentAnalytics = async () => {
    const currentDate = getCurrentDate();
    const daysAgo = new Date(currentDate);
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    const daysAgoStr = daysAgo.toISOString().split('T')[0];

    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', daysAgoStr);

    if (!appointments) return;

    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShow = appointments.filter(a => a.status === 'no-show').length;

    // By day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDayOfWeek = dayNames.map(day => ({
      day: day.slice(0, 3),
      count: appointments.filter(a => new Date(a.appointment_date).getDay() === dayNames.indexOf(day)).length
    }));

    // By type
    const typeGroups: Record<string, number> = {};
    appointments.forEach(a => {
      const type = a.type || 'Consultation';
      typeGroups[type] = (typeGroups[type] || 0) + 1;
    });
    const byType = Object.entries(typeGroups).map(([type, count]) => ({ type, count }));

    // Daily trend
    const dateGroups: Record<string, { appointments: number; completed: number }> = {};
    appointments.forEach(a => {
      const date = a.appointment_date;
      if (!dateGroups[date]) dateGroups[date] = { appointments: 0, completed: 0 };
      dateGroups[date].appointments++;
      if (a.status === 'completed') dateGroups[date].completed++;
    });
    const trend = Object.entries(dateGroups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, data]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ...data }));

    setAppointmentAnalytics({
      totalAppointments: total,
      completedCount: completed,
      cancelledCount: cancelled,
      noShowCount: noShow,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0,
      avgPerDay: parseInt(timeRange) > 0 ? total / parseInt(timeRange) : 0,
      byDayOfWeek,
      byType,
      trend
    });
  };

  const fetchRevenueAnalytics = async () => {
    const currentDate = getCurrentDate();
    const daysAgo = new Date(currentDate);
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    const daysAgoStr = daysAgo.toISOString().split('T')[0];

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .gte('payment_date', daysAgoStr);

    if (!payments) return;

    const total = payments.reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0);
    const paid = payments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0);
    const pending = payments.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0);
    const overdue = payments.filter(p => p.payment_status === 'overdue').reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0);

    // By payment method
    const methodGroups: Record<string, { amount: number; count: number }> = {};
    payments.forEach(p => {
      const method = p.payment_method || 'cash';
      if (!methodGroups[method]) methodGroups[method] = { amount: 0, count: 0 };
      methodGroups[method].amount += parseFloat(String(p.amount || 0));
      methodGroups[method].count++;
    });
    const byMethod = Object.entries(methodGroups).map(([method, data]) => ({ method: method.charAt(0).toUpperCase() + method.slice(1), ...data }));

    // By month
    const monthGroups: Record<string, { revenue: number; paid: number; pending: number }> = {};
    payments.forEach(p => {
      const month = new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthGroups[month]) monthGroups[month] = { revenue: 0, paid: 0, pending: 0 };
      const amount = parseFloat(String(p.amount || 0));
      monthGroups[month].revenue += amount;
      if (p.payment_status === 'paid') monthGroups[month].paid += amount;
      else monthGroups[month].pending += amount;
    });
    const byMonth = Object.entries(monthGroups).map(([month, data]) => ({ month, ...data }));

    // Top services
    const serviceGroups: Record<string, number> = {};
    payments.forEach(p => {
      const service = p.description || 'General Service';
      serviceGroups[service] = (serviceGroups[service] || 0) + parseFloat(String(p.amount || 0));
    });
    const topServices = Object.entries(serviceGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service, amount]) => ({ service, amount }));

    setRevenueAnalytics({
      totalRevenue: total,
      paidRevenue: paid,
      pendingRevenue: pending,
      overdueRevenue: overdue,
      avgTransactionValue: payments.length > 0 ? total / payments.length : 0,
      byMethod,
      byMonth,
      topServices
    });
  };

  const fetchStaffWorkload = async () => {
    const currentDate = getCurrentDate();
    const daysAgo = new Date(currentDate);
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    const daysAgoStr = daysAgo.toISOString().split('T')[0];

    const { data: doctors } = await supabase.from('doctors').select('*').eq('status', 'active');
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', daysAgoStr);

    if (!doctors || !appointments) return;

    // Doctor workload
    const doctorWorkload = doctors.map(doc => {
      const docAppointments = appointments.filter(a => a.doctor_id === doc.id);
      const uniquePatients = new Set(docAppointments.map(a => a.patient_id)).size;
      return {
        id: doc.id,
        name: `Dr. ${doc.first_name} ${doc.last_name}`,
        specialization: doc.specialization,
        appointments: docAppointments.length,
        patients: uniquePatients,
        avgPerDay: parseInt(timeRange) > 0 ? docAppointments.length / parseInt(timeRange) : 0
      };
    }).sort((a, b) => b.appointments - a.appointments);

    // Department load
    const deptGroups: Record<string, { appointments: number; doctors: Set<string> }> = {};
    appointments.forEach(apt => {
      const doc = doctors.find(d => d.id === apt.doctor_id);
      const dept = doc?.department || 'Unassigned';
      if (!deptGroups[dept]) deptGroups[dept] = { appointments: 0, doctors: new Set() };
      deptGroups[dept].appointments++;
      deptGroups[dept].doctors.add(apt.doctor_id);
    });
    const departmentLoad = Object.entries(deptGroups).map(([department, data]) => ({
      department,
      appointments: data.appointments,
      doctors: data.doctors.size,
      avgPerDoctor: data.doctors.size > 0 ? data.appointments / data.doctors.size : 0
    }));

    // Busy hours
    const hourGroups: Record<string, number> = {};
    appointments.forEach(apt => {
      const hour = apt.appointment_time?.split(':')[0] || '09';
      const hourLabel = `${parseInt(hour) % 12 || 12}${parseInt(hour) >= 12 ? 'PM' : 'AM'}`;
      hourGroups[hourLabel] = (hourGroups[hourLabel] || 0) + 1;
    });
    const busyHours = Object.entries(hourGroups)
      .map(([hour, appointments]) => ({ hour, appointments }))
      .sort((a, b) => {
        const getHourValue = (h: string) => {
          const num = parseInt(h);
          return h.includes('PM') && num !== 12 ? num + 12 : num;
        };
        return getHourValue(a.hour) - getHourValue(b.hour);
      });

    setStaffWorkload({
      doctors: doctorWorkload,
      departmentLoad,
      busyHours
    });
  };

  const handleExport = async (type: 'patients' | 'appointments' | 'payments') => {
    try {
      let data;
      let columns;
      let filename;

      switch (type) {
        case 'patients':
          data = await dataManager.getPatients();
          columns = patientColumns;
          filename = 'patients_export';
          break;
        case 'appointments':
          data = await dataManager.getAppointments();
          columns = appointmentColumns;
          filename = 'appointments_export';
          break;
        case 'payments':
          data = await dataManager.getPayments();
          columns = paymentColumns;
          filename = 'payments_export';
          break;
      }

      exportToCSV(data, filename, columns);
      toast({
        title: 'Export Successful',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} data exported to CSV`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePDFExport = (reportType: 'appointments' | 'revenue' | 'census' | 'workload') => {
    try {
      const currentDate = getCurrentDate();
      const daysAgo = new Date(currentDate);
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
      
      const dateRange = {
        start: daysAgo.toISOString().split('T')[0],
        end: currentDate
      };

      let doc;

      switch (reportType) {
        case 'appointments':
          doc = generatePDFReport(
            {
              title: 'Appointment Analytics Report',
              dateRange,
              hospitalName: 'Hospital Management System'
            },
            {
              headers: ['Metric', 'Value'],
              rows: [
                ['Total Appointments', appointmentAnalytics.totalAppointments],
                ['Completed', appointmentAnalytics.completedCount],
                ['Cancelled', appointmentAnalytics.cancelledCount],
                ['No Shows', appointmentAnalytics.noShowCount],
                ['Completion Rate', `${appointmentAnalytics.completionRate.toFixed(1)}%`],
                ['Average Per Day', appointmentAnalytics.avgPerDay.toFixed(1)],
              ]
            },
            [
              { label: 'Total', value: appointmentAnalytics.totalAppointments },
              { label: 'Completed', value: appointmentAnalytics.completedCount },
              { label: 'Completion Rate', value: `${appointmentAnalytics.completionRate.toFixed(1)}%` },
              { label: 'No-Show Rate', value: `${appointmentAnalytics.noShowRate.toFixed(1)}%` },
            ]
          );
          downloadPDF(doc, 'appointment_report');
          break;

        case 'revenue':
          doc = generatePDFReport(
            {
              title: 'Revenue Analytics Report',
              dateRange,
              hospitalName: 'Hospital Management System'
            },
            {
              headers: ['Payment Method', 'Amount', 'Transactions'],
              rows: revenueAnalytics.byMethod.map(m => [m.method, `$${m.amount.toFixed(2)}`, m.count])
            },
            [
              { label: 'Total Revenue', value: `$${revenueAnalytics.totalRevenue.toFixed(2)}` },
              { label: 'Paid', value: `$${revenueAnalytics.paidRevenue.toFixed(2)}` },
              { label: 'Pending', value: `$${revenueAnalytics.pendingRevenue.toFixed(2)}` },
              { label: 'Avg Transaction', value: `$${revenueAnalytics.avgTransactionValue.toFixed(2)}` },
            ]
          );
          downloadPDF(doc, 'revenue_report');
          break;

        case 'census':
          doc = generatePDFReport(
            {
              title: 'Daily Census Report',
              hospitalName: 'Hospital Management System'
            },
            {
              headers: ['Room', 'Type', 'Occupied', 'Capacity', 'Occupancy %'],
              rows: censusData.roomOccupancy.map(r => [
                r.room,
                r.type,
                r.occupied,
                r.capacity,
                r.capacity > 0 ? `${((r.occupied / r.capacity) * 100).toFixed(0)}%` : '0%'
              ])
            },
            [
              { label: 'Current Inpatients', value: censusData.currentInpatients },
              { label: 'Available Beds', value: censusData.availableBeds },
              { label: 'Total Beds', value: censusData.totalBeds },
              { label: 'Occupancy Rate', value: `${censusData.occupancyRate.toFixed(1)}%` },
            ]
          );
          downloadPDF(doc, 'census_report');
          break;

        case 'workload':
          doc = generatePDFReport(
            {
              title: 'Staff Workload Report',
              dateRange,
              hospitalName: 'Hospital Management System'
            },
            {
              headers: ['Doctor', 'Specialization', 'Appointments', 'Patients', 'Avg/Day'],
              rows: staffWorkload.doctors.slice(0, 15).map(d => [
                d.name,
                d.specialization,
                d.appointments,
                d.patients,
                d.avgPerDay.toFixed(1)
              ])
            },
            [
              { label: 'Active Doctors', value: staffWorkload.doctors.length },
              { label: 'Total Appointments', value: staffWorkload.doctors.reduce((s, d) => s + d.appointments, 0) },
              { label: 'Departments', value: staffWorkload.departmentLoad.length },
            ]
          );
          downloadPDF(doc, 'workload_report');
          break;
      }

      toast({
        title: 'PDF Generated',
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive insights into hospital operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleExport('patients')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Patients (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('appointments')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Appointments (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('payments')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Payments (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePDFExport('census')}>
                <FileText className="h-4 w-4 mr-2" />
                Census Report (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePDFExport('appointments')}>
                <FileText className="h-4 w-4 mr-2" />
                Appointments Report (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePDFExport('revenue')}>
                <FileText className="h-4 w-4 mr-2" />
                Revenue Report (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePDFExport('workload')}>
                <FileText className="h-4 w-4 mr-2" />
                Workload Report (PDF)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="census" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="census">Census</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        {/* Daily Census Tab */}
        <TabsContent value="census" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Inpatients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{censusData.currentInpatients}</div>
                <p className="text-xs text-muted-foreground">Currently admitted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Admissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{censusData.admissionsToday}</div>
                <p className="text-xs text-muted-foreground">New admissions today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Discharges</CardTitle>
                <UserCheck className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">{censusData.dischargesToday}</div>
                <p className="text-xs text-muted-foreground">Discharged today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{censusData.occupancyRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{censusData.availableBeds} of {censusData.totalBeds} beds available</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Room Occupancy Status</CardTitle>
              <CardDescription>Current occupancy by room</CardDescription>
            </CardHeader>
            <CardContent>
              {censusData.roomOccupancy.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No room data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {censusData.roomOccupancy.map((room, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{room.room}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>{room.occupied}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>
                          <Badge variant={room.occupied >= room.capacity ? 'destructive' : room.occupied > 0 ? 'default' : 'secondary'}>
                            {room.occupied >= room.capacity ? 'Full' : room.occupied > 0 ? 'Partial' : 'Empty'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Analytics Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentAnalytics.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">~{appointmentAnalytics.avgPerDay.toFixed(1)}/day avg</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Activity className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{appointmentAnalytics.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{appointmentAnalytics.completedCount} completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <Activity className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{appointmentAnalytics.cancelledCount}</div>
                <p className="text-xs text-muted-foreground">{((appointmentAnalytics.cancelledCount / (appointmentAnalytics.totalAppointments || 1)) * 100).toFixed(1)}% rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
                <Activity className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{appointmentAnalytics.noShowCount}</div>
                <p className="text-xs text-muted-foreground">{appointmentAnalytics.noShowRate.toFixed(1)}% rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Trend</CardTitle>
                <CardDescription>Daily appointments over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={appointmentAnalytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="appointments" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total" />
                    <Area type="monotone" dataKey="completed" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointments by Day</CardTitle>
                <CardDescription>Distribution across weekdays</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={appointmentAnalytics.byDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointments by Type</CardTitle>
                <CardDescription>Breakdown by appointment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentAnalytics.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {appointmentAnalytics.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenueAnalytics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">In selected period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${revenueAnalytics.paidRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{((revenueAnalytics.paidRevenue / (revenueAnalytics.totalRevenue || 1)) * 100).toFixed(1)}% collected</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">${revenueAnalytics.pendingRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">${revenueAnalytics.overdueRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Needs follow-up</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueAnalytics.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="paid" stackId="a" fill="#10b981" name="Paid" />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueAnalytics.byMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percent }) => `${method}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="method"
                    >
                      {revenueAnalytics.byMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Services by Revenue</CardTitle>
                <CardDescription>Highest revenue generating services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueAnalytics.topServices.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{idx + 1}</span>
                        </div>
                        <span className="font-medium">{service.service}</span>
                      </div>
                      <span className="text-lg font-bold">${service.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {revenueAnalytics.topServices.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No revenue data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Workload Tab */}
        <TabsContent value="workload" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Workload</CardTitle>
                <CardDescription>Appointments handled per doctor</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Patients</TableHead>
                      <TableHead>Avg/Day</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffWorkload.doctors.slice(0, 10).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{doc.specialization}</TableCell>
                        <TableCell>{doc.appointments}</TableCell>
                        <TableCell>{doc.patients}</TableCell>
                        <TableCell>{doc.avgPerDay.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                    {staffWorkload.doctors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Load</CardTitle>
                <CardDescription>Workload distribution by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffWorkload.departmentLoad} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="appointments" fill="#3b82f6" name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>Busiest appointment times</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={staffWorkload.busyHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="appointments" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Appointments" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Performance Tab */}
        <TabsContent value="performance">
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <StaffPerformance />
          </Suspense>
        </TabsContent>

        {/* Patient Satisfaction Tab */}
        <TabsContent value="satisfaction">
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <SatisfactionAnalytics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;