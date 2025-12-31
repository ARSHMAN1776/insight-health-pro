import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Users, 
  Activity, 
  Clock, 
  Heart, 
  Stethoscope,
  Shield,
  AlertTriangle,
  Bed,
  Pill,
  Droplets,
  Info
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { dataManager, Patient, Prescription } from '../../lib/dataManager';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import BloodAvailabilityWidget from '../blood-bank/BloodAvailabilityWidget';

interface RoomAssignment {
  id: string;
  patient_id: string;
  room_id: string;
  bed_number: number;
  status: string;
  admission_date: string;
  admission_reason: string | null;
  patients?: {
    first_name: string;
    last_name: string;
    status: string | null;
  };
  rooms?: {
    room_number: string;
    room_type: string;
  };
}

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);
  const [pendingMedications, setPendingMedications] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patients, prescriptions, and room assignments in parallel
        const [patientsData, prescriptionsData] = await Promise.all([
          dataManager.getPatients(),
          dataManager.getPrescriptions()
        ]);
        
        // Fetch room assignments with patient and room info
        const { data: assignments } = await supabase
          .from('room_assignments')
          .select(`
            *,
            patients:patient_id(first_name, last_name, status),
            rooms:room_id(room_number, room_type)
          `)
          .eq('status', 'active')
          .order('admission_date', { ascending: false })
          .limit(6);
        
        setPatients(patientsData);
        setPrescriptions(prescriptionsData);
        setRoomAssignments(assignments || []);
        
        // Count active prescriptions as pending medications
        const activePrescriptions = prescriptionsData.filter(p => p.status === 'active');
        setPendingMedications(activePrescriptions.length);
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

    fetchData();
  }, [toast]);

  const todayStats = [
    {
      title: 'Admitted Patients',
      value: loading ? '...' : roomAssignments.length.toString(),
      icon: Users,
      color: 'bg-medical-green'
    },
    {
      title: 'Active Patients',
      value: loading ? '...' : patients.filter(p => p.status === 'active').length.toString(),
      icon: Activity,
      color: 'bg-medical-blue'
    },
    {
      title: 'Pending Medications',
      value: loading ? '...' : pendingMedications.toString(),
      icon: Pill,
      color: 'bg-medical-purple'
    },
    {
      title: 'Active Alerts',
      value: '0',
      icon: AlertTriangle,
      color: 'bg-medical-orange'
    }
  ];

  // Use real room assignments for patient display
  const assignedPatients = roomAssignments.map((assignment) => ({
    id: assignment.id,
    name: assignment.patients 
      ? `${assignment.patients.first_name} ${assignment.patients.last_name}` 
      : 'Unknown Patient',
    room: assignment.rooms 
      ? `${assignment.rooms.room_number}` 
      : 'Unassigned',
    roomType: assignment.rooms?.room_type || 'General',
    condition: assignment.admission_reason || 'General care',
    admissionDate: new Date(assignment.admission_date).toLocaleDateString(),
    status: assignment.patients?.status || 'active',
    bedNumber: assignment.bed_number
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-success/10 text-success border-success';
      case 'monitoring': return 'bg-warning/10 text-warning border-warning';
      case 'improving': return 'bg-info/10 text-info border-info';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive';
      case 'active': return 'bg-success/10 text-success border-success';
      default: return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-medical-green to-medical-green/80 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
            <p className="text-green-100">You have {roomAssignments.length} admitted patients to care for today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-green-100">Pending Medications</p>
              <p className="text-lg font-semibold">{pendingMedications} active prescriptions</p>
            </div>
            <Heart className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Patients */}
        <Card className="card-gradient lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bed className="w-5 h-5 text-medical-green" />
              <span>Admitted Patients</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading patients...</p>
                </div>
              ) : assignedPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No admitted patients</p>
                  <p className="text-xs text-muted-foreground mt-1">Patients will appear here when assigned to rooms</p>
                </div>
              ) : (
                assignedPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-foreground">{patient.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Room {patient.room} (Bed {patient.bedNumber}) • {patient.roomType}
                        </p>
                        <p className="text-xs text-muted-foreground">{patient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Since {patient.admissionDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-medical-blue" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Prescriptions</span>
                  <Badge variant="outline">{pendingMedications}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Medications to administer</p>
              </div>
              
              <div className="p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Room Assignments</span>
                  <Badge variant="outline">{roomAssignments.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Patients currently admitted</p>
              </div>
              
              <div className="p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Patients</span>
                  <Badge variant="outline">{patients.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">In the system</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/rooms')}
              >
                <Bed className="w-4 h-4 mr-2" />
                View All Rooms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Bank Widget */}
      <BloodAvailabilityWidget compact />

      {/* Quick Actions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-medical-purple" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/medical-records')}
            >
              <Activity className="w-6 h-6" />
              <span className="text-sm">Vital Signs</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/prescriptions')}
            >
              <Pill className="w-6 h-6" />
              <span className="text-sm">Medications</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/rooms')}
            >
              <Bed className="w-6 h-6" />
              <span className="text-sm">Rounds</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => navigate('/blood-bank')}
            >
              <Droplets className="w-6 h-6 text-red-500" />
              <span className="text-sm">Blood Bank</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => {
                toast({
                  title: "Emergency Protocol",
                  description: "Emergency procedures activated. Please contact supervisor.",
                  variant: "destructive"
                });
              }}
            >
              <Shield className="w-6 h-6" />
              <span className="text-sm">Emergency</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NurseDashboard;