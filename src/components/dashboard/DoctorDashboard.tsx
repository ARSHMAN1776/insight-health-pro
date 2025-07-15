import React from 'react';
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
  TestTube
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  const todayStats = [
    {
      title: 'Today\'s Appointments',
      value: '12',
      icon: Calendar,
      color: 'bg-medical-blue'
    },
    {
      title: 'Patients Seen',
      value: '8',
      icon: Users,
      color: 'bg-medical-green'
    },
    {
      title: 'Pending Reports',
      value: '3',
      icon: FileText,
      color: 'bg-medical-orange'
    },
    {
      title: 'Prescriptions',
      value: '15',
      icon: Pill,
      color: 'bg-medical-purple'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patient: 'John Smith',
      time: '10:00 AM',
      type: 'Follow-up',
      status: 'confirmed',
      duration: '30 min'
    },
    {
      id: 2,
      patient: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'Consultation',
      status: 'waiting',
      duration: '45 min'
    },
    {
      id: 3,
      patient: 'Michael Brown',
      time: '11:15 AM',
      type: 'Emergency',
      status: 'urgent',
      duration: '60 min'
    },
    {
      id: 4,
      patient: 'Emma Davis',
      time: '2:00 PM',
      type: 'Check-up',
      status: 'confirmed',
      duration: '30 min'
    }
  ];

  const recentPatients = [
    {
      id: 1,
      name: 'Alice Wilson',
      age: 45,
      diagnosis: 'Hypertension',
      lastVisit: '2 days ago',
      status: 'stable'
    },
    {
      id: 2,
      name: 'Robert Miller',
      age: 62,
      diagnosis: 'Diabetes Type 2',
      lastVisit: '1 week ago',
      status: 'monitoring'
    },
    {
      id: 3,
      name: 'Lisa Anderson',
      age: 38,
      diagnosis: 'Migraine',
      lastVisit: '3 days ago',
      status: 'improving'
    }
  ];

  const pendingTasks = [
    {
      id: 1,
      task: 'Review lab results for John Smith',
      priority: 'high',
      dueTime: '11:00 AM'
    },
    {
      id: 2,
      task: 'Complete discharge summary for Patient #1234',
      priority: 'medium',
      dueTime: '2:00 PM'
    },
    {
      id: 3,
      task: 'Update prescription for Sarah Johnson',
      priority: 'low',
      dueTime: '4:00 PM'
    }
  ];

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
            <p className="text-blue-100">You have 12 appointments scheduled for today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Next Patient</p>
              <p className="text-lg font-semibold">John Smith - 10:00 AM</p>
            </div>
            <Stethoscope className="w-12 h-12 text-blue-200" />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{appointment.patient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{appointment.patient}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{appointment.time}</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-medical-orange" />
              <span>Pending Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{task.task}</p>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Due: {task.dueTime}</span>
                  </div>
                </div>
              ))}
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
            {recentPatients.map((patient) => (
              <div key={patient.id} className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-foreground">{patient.name}</h4>
                    <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-medical-red" />
                    <span className="text-sm">{patient.diagnosis}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{patient.lastVisit}</span>
                    <Badge variant="outline" className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-medical-purple" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Users className="w-6 h-6" />
              <span className="text-sm">New Patient</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Pill className="w-6 h-6" />
              <span className="text-sm">Prescribe</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <TestTube className="w-6 h-6" />
              <span className="text-sm">Order Lab</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;