import React from 'react';
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

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();

  const todayStats = [
    {
      title: 'Patients Assigned',
      value: '18',
      icon: Users,
      color: 'bg-medical-green'
    },
    {
      title: 'Vital Signs Checked',
      value: '45',
      icon: Activity,
      color: 'bg-medical-blue'
    },
    {
      title: 'Medications Given',
      value: '32',
      icon: Pill,
      color: 'bg-medical-purple'
    },
    {
      title: 'Alerts',
      value: '3',
      icon: AlertTriangle,
      color: 'bg-medical-orange'
    }
  ];

  const assignedPatients = [
    {
      id: 1,
      name: 'John Smith',
      room: '101A',
      condition: 'Post-surgery',
      lastVitals: '2 hours ago',
      status: 'stable',
      priority: 'medium'
    },
    {
      id: 2,
      name: 'Mary Johnson',
      room: '102B',
      condition: 'Pneumonia',
      lastVitals: '1 hour ago',
      status: 'monitoring',
      priority: 'high'
    },
    {
      id: 3,
      name: 'Robert Brown',
      room: '103A',
      condition: 'Recovery',
      lastVitals: '30 min ago',
      status: 'improving',
      priority: 'low'
    },
    {
      id: 4,
      name: 'Sarah Davis',
      room: '104A',
      condition: 'Observation',
      lastVitals: '45 min ago',
      status: 'stable',
      priority: 'medium'
    }
  ];

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
      task: 'Vital signs check - Room 102B',
      time: '10:30 AM',
      type: 'vitals',
      priority: 'high'
    },
    {
      id: 3,
      task: 'Wound dressing - Room 101A',
      time: '11:00 AM',
      type: 'procedure',
      priority: 'medium'
    },
    {
      id: 4,
      task: 'Patient discharge prep - Room 105',
      time: '2:00 PM',
      type: 'discharge',
      priority: 'medium'
    }
  ];

  const criticalAlerts = [
    {
      id: 1,
      patient: 'Mary Johnson',
      room: '102B',
      alert: 'High temperature detected',
      time: '5 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      patient: 'John Smith',
      room: '101A',
      alert: 'Blood pressure irregularity',
      time: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 3,
      patient: 'Sarah Davis',
      room: '104A',
      alert: 'Medication due',
      time: '20 minutes ago',
      severity: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-success/10 text-success border-success';
      case 'monitoring': return 'bg-warning/10 text-warning border-warning';
      case 'improving': return 'bg-info/10 text-info border-info';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive';
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
            <p className="text-green-100">You have 18 patients assigned to you today.</p>
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
              {assignedPatients.map((patient) => (
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
              ))}
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
              {criticalAlerts.map((alert) => (
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
              ))}
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