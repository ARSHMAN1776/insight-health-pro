import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Users, 
  Activity, 
  Clock, 
  Heart, 
  Thermometer,
  Stethoscope,
  Shield,
  AlertTriangle,
  Bed,
  Pill
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { dataManager, Patient, Prescription } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsData, prescriptionsData] = await Promise.all([
          dataManager.getPatients(),
          dataManager.getPrescriptions()
        ]);
        
        setPatients(patientsData.slice(0, 4)); // Show only first 4
        setPrescriptions(prescriptionsData);
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
      title: 'Patients Assigned',
      value: loading ? '...' : patients.length.toString(),
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
      title: 'Medications',
      value: loading ? '...' : prescriptions.length.toString(),
      icon: Pill,
      color: 'bg-medical-purple'
    },
    {
      title: 'Alerts',
      value: loading ? '...' : '0',
      icon: AlertTriangle,
      color: 'bg-medical-orange'
    }
  ];

  const assignedPatients = patients.map((patient, index) => ({
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    room: `${101 + index}A`,
    condition: patient.medical_history || 'General care',
    lastVitals: '1 hour ago',
    status: patient.status,
    priority: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low'
  }));

  const upcomingTasks = [
    {
      id: 1,
      task: 'Medication round - Ward A',
      time: '10:00 AM',
      type: 'medication',
      priority: 'high'
    },
    {
      id: 2,
      task: 'Vital signs check - Next patient',
      time: '10:30 AM',
      type: 'vitals',
      priority: 'high'
    },
    {
      id: 3,
      task: 'Patient care rounds',
      time: '11:00 AM',
      type: 'procedure',
      priority: 'medium'
    },
    {
      id: 4,
      task: 'Chart updates',
      time: '2:00 PM',
      type: 'documentation',
      priority: 'medium'
    }
  ];

  const criticalAlerts = patients.length > 0 ? [
    {
      id: 1,
      patient: patients[0]?.first_name + ' ' + patients[0]?.last_name,
      room: '102B',
      alert: 'Medication due',
      time: '5 minutes ago',
      severity: 'medium'
    }
  ] : [];

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive';
      case 'medium': return 'bg-warning/10 text-warning border-warning';
      case 'low': return 'bg-success/10 text-success border-success';
      default: return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive';
      case 'medium': return 'bg-warning/10 text-warning border-warning';
      case 'low': return 'bg-info/10 text-info border-info';
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
            <p className="text-green-100">You have {patients.length} patients assigned to you today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-green-100">Next Task</p>
              <p className="text-lg font-semibold">Medication Round - 10:00 AM</p>
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
              <Users className="w-5 h-5 text-medical-green" />
              <span>Assigned Patients</span>
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
                  <p className="text-muted-foreground">No patients assigned</p>
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
                        <p className="text-sm text-muted-foreground">Room {patient.room} • {patient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(patient.priority)}>
                          {patient.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Last vitals: {patient.lastVitals}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-medical-orange" />
              <span>Critical Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading alerts...</p>
                </div>
              ) : criticalAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No critical alerts</p>
                </div>
              ) : (
                criticalAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{alert.patient}</p>
                        <p className="text-xs text-muted-foreground">Room {alert.room}</p>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground mb-1">{alert.alert}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-medical-blue" />
            <span>Upcoming Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">{task.task}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{task.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-medical-purple" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Activity className="w-6 h-6" />
              <span className="text-sm">Vital Signs</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Pill className="w-6 h-6" />
              <span className="text-sm">Medications</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Bed className="w-6 h-6" />
              <span className="text-sm">Rounds</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
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