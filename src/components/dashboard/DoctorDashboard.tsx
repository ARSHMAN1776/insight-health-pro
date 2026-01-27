import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  Activity, 
  AlertTriangle,
  Stethoscope,
  Heart,
  Pill,
  TestTube,
  Scissors,
  CheckCircle,
  AlertCircle,
  Droplets,
  Filter
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { dataManager, Appointment, Patient, MedicalRecord, Prescription } from '../../lib/dataManager';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import BloodAvailabilityWidget from '../blood-bank/BloodAvailabilityWidget';
import DoctorQueueWidget from '../queue/DoctorQueueWidget';
import { useTimezone } from '@/hooks/useTimezone';
import RefillRequestReview from '../prescriptions/RefillRequestReview';
import MessagesPreviewWidget from './MessagesPreviewWidget';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getCurrentDate, formatDate, formatTime } = useTimezone();
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [surgeryStats, setSurgeryStats] = useState({
    todaySurgeries: [] as any[],
    mySurgeries: [] as any[],
    pendingPostOps: 0
  });

  // Get doctor ID for current user
  useEffect(() => {
    const fetchDoctorId = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setDoctorId(data.id);
      }
    };
    
    fetchDoctorId();
  }, [user?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (showOnlyMine && doctorId) {
          // Fetch only doctor's own data
          const [appointmentsData, recordsData, prescriptionsData] = await Promise.all([
            dataManager.getAppointmentsByDoctor(doctorId),
            dataManager.getMedicalRecordsByDoctor(doctorId),
            dataManager.getPrescriptionsByDoctor(doctorId)
          ]);
          
          // Get unique patient IDs
          const patientIds = new Set([
            ...appointmentsData.map(a => a.patient_id),
            ...recordsData.map(r => r.patient_id),
            ...prescriptionsData.map(p => p.patient_id)
          ]);
          
          // Fetch those patients
          const patientPromises = Array.from(patientIds).map(id => dataManager.getPatientById(id));
          const patientsData = (await Promise.all(patientPromises)).filter(Boolean) as Patient[];
          
          setAppointments(appointmentsData.slice(0, 4));
          setPatients(patientsData.slice(0, 3));
          setMedicalRecords(recordsData);
          setPrescriptions(prescriptionsData);
        } else {
          // Fetch all data
          const [appointmentsData, patientsData, recordsData, prescriptionsData] = await Promise.all([
            dataManager.getAppointments(),
            dataManager.getPatients(),
            dataManager.getMedicalRecords(),
            dataManager.getPrescriptions()
          ]);
          
          setAppointments(appointmentsData.slice(0, 4));
          setPatients(patientsData.slice(0, 3));
          setMedicalRecords(recordsData);
          setPrescriptions(prescriptionsData);
        }

        // Load surgery stats
        await loadSurgeryStats();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (!showOnlyMine || doctorId) {
      fetchData();
    }
  }, [toast, showOnlyMine, doctorId]);

  const loadSurgeryStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's surgeries
      const { data: surgeries } = await supabase
        .from('surgeries')
        .select(`
          *,
          patients:patient_id(first_name, last_name),
          operation_theatres:ot_id(ot_name)
        `)
        .eq('surgery_date', today)
        .order('start_time');

      // Get completed surgeries without post-op
      const { data: completedSurgeries } = await supabase
        .from('surgeries')
        .select('id')
        .eq('status', 'completed');

      const { data: postOps } = await supabase
        .from('post_operation')
        .select('surgery_id');

      const postOpIds = new Set(postOps?.map(p => p.surgery_id) || []);
      const pending = (completedSurgeries || []).filter(s => !postOpIds.has(s.id)).length;

      setSurgeryStats({
        todaySurgeries: surgeries || [],
        mySurgeries: surgeries || [],
        pendingPostOps: pending
      });
    } catch (error) {
      // Silent fail for surgery stats
    }
  };

  const todayDate = getCurrentDate();
  const todayAppointments = appointments.filter(apt => 
    apt.appointment_date === todayDate
  );

  const todayStats = [
    {
      title: 'Today\'s Appointments',
      value: loading ? '...' : todayAppointments.length.toString(),
      icon: Calendar,
      color: 'bg-medical-blue'
    },
    {
      title: 'Total Patients',
      value: loading ? '...' : patients.length.toString(),
      icon: Users,
      color: 'bg-medical-green'
    },
    {
      title: 'Medical Records',
      value: loading ? '...' : medicalRecords.length.toString(),
      icon: FileText,
      color: 'bg-medical-orange'
    },
    {
      title: 'Prescriptions',
      value: loading ? '...' : prescriptions.length.toString(),
      icon: Pill,
      color: 'bg-medical-purple'
    }
  ];

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  const recentPatients = patients.slice(0, 3);

  // Get actual next upcoming appointment (filter by current time)
  const getNextPatient = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const upcomingToday = todayAppointments.filter(apt => 
      apt.appointment_time > currentTime && 
      (apt.status === 'scheduled' || apt.status === 'confirmed')
    );
    
    if (upcomingToday.length > 0) {
      const nextApt = upcomingToday[0];
      return `${getPatientName(nextApt.patient_id)} - ${nextApt.appointment_time}`;
    }
    return 'No more appointments today';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success';
      case 'waiting': return 'bg-warning/10 text-warning border-warning';
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive';
      default: return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive';
      case 'medium': return 'bg-warning/10 text-warning border-warning';
      case 'low': return 'bg-success/10 text-success border-success';
      default: return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-medical-blue to-medical-blue-dark rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good morning, Dr. {user?.lastName}!</h1>
            <p className="text-blue-100">You have {todayAppointments.length} appointments scheduled for today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Next Patient</p>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : getNextPatient()}
              </p>
            </div>
            <Stethoscope className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Data Filter</span>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="my-data-filter" className="text-sm text-muted-foreground">
              {showOnlyMine ? 'My Patients/Appointments Only' : 'All Patients/Appointments'}
            </Label>
            <Switch
              id="my-data-filter"
              checked={showOnlyMine}
              onCheckedChange={setShowOnlyMine}
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => {
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Widget */}
        <DoctorQueueWidget />

        {/* Upcoming Appointments */}
        <Card className="card-gradient lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-medical-blue" />
              <span>Today's Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading appointments...</p>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{getPatientName(appointment.patient_id).split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-foreground">{getPatientName(appointment.patient_id)}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{appointment.appointment_time}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-medical-green" />
            <span>Recent Patients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Loading patients...</p>
              </div>
            ) : recentPatients.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No patients found</p>
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{patient.first_name[0]}{patient.last_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{patient.first_name} {patient.last_name}</h4>
                      <p className="text-sm text-muted-foreground">Age: {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-medical-red" />
                      <span className="text-sm">{patient.medical_history || 'No medical history'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Blood Type: {patient.blood_type || 'Unknown'}
                      </span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {patient.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages & Refill Requests Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MessagesPreviewWidget doctorId={doctorId} />
        <RefillRequestReview doctorId={doctorId || undefined} maxItems={3} compact />
      </div>

      {/* Operation Department Widget */}
      <Card className="card-gradient">
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
          <div className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-medical-purple/10 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{surgeryStats.todaySurgeries.length}</p>
                <p className="text-xs text-muted-foreground">Total Today</p>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {surgeryStats.todaySurgeries.filter(s => s.status === 'in_progress').length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{surgeryStats.pendingPostOps}</p>
                <p className="text-xs text-muted-foreground">Pending Post-Op</p>
              </div>
            </div>

            {/* Surgery List */}
            <div className="space-y-2">
              {surgeryStats.todaySurgeries.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No surgeries scheduled for today
                </div>
              ) : (
                surgeryStats.todaySurgeries.slice(0, 3).map((surgery) => (
                  <div key={surgery.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-medical-purple/20 rounded-full flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-medical-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {surgery.patients?.first_name} {surgery.patients?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{surgery.surgery_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{surgery.start_time}</p>
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
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Availability Widget */}
      <BloodAvailabilityWidget />

      {/* Quick Actions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-medical-purple" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/patients')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">New Patient</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/appointments')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/prescriptions')}
            >
              <Pill className="w-6 h-6" />
              <span className="text-sm">Prescribe</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/lab-tests')}
            >
              <TestTube className="w-6 h-6" />
              <span className="text-sm">Order Lab</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/operation-department')}
            >
              <Scissors className="w-6 h-6" />
              <span className="text-sm">Surgeries</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => navigate('/blood-bank')}
            >
              <Droplets className="w-6 h-6 text-red-500" />
              <span className="text-sm">Blood Bank</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;