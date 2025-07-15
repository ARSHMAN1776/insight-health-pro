import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Calendar, 
  FileText, 
  Pill, 
  TestTube, 
  Heart, 
  Clock,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  const patientInfo = {
    patientId: 'P001234',
    age: 35,
    bloodType: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '+1-555-0123'
    }
  };

  const upcomingAppointments = [
    {
      id: 1,
      date: '2024-01-20',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      type: 'Follow-up',
      status: 'confirmed'
    },
    {
      id: 2,
      date: '2024-01-25',
      time: '2:30 PM',
      doctor: 'Dr. Michael Brown',
      department: 'General Practice',
      type: 'Check-up',
      status: 'pending'
    },
    {
      id: 3,
      date: '2024-02-01',
      time: '11:15 AM',
      doctor: 'Dr. Lisa Anderson',
      department: 'Dermatology',
      type: 'Consultation',
      status: 'scheduled'
    }
  ];

  const recentRecords = [
    {
      id: 1,
      date: '2024-01-10',
      type: 'Consultation',
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Hypertension monitoring',
      notes: 'Blood pressure stable, continue current medication'
    },
    {
      id: 2,
      date: '2024-01-05',
      type: 'Lab Results',
      doctor: 'Dr. Michael Brown',
      diagnosis: 'Blood work results',
      notes: 'All values within normal range'
    },
    {
      id: 3,
      date: '2023-12-28',
      type: 'Prescription',
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Medication adjustment',
      notes: 'Increased dosage of blood pressure medication'
    }
  ];

  const currentPrescriptions = [
    {
      id: 1,
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      prescribedBy: 'Dr. Sarah Johnson',
      startDate: '2024-01-01',
      endDate: '2024-03-01',
      refillsLeft: 2
    },
    {
      id: 2,
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      prescribedBy: 'Dr. Michael Brown',
      startDate: '2023-12-15',
      endDate: '2024-06-15',
      refillsLeft: 4
    }
  ];

  const labResults = [
    {
      id: 1,
      test: 'Complete Blood Count',
      date: '2024-01-05',
      status: 'Normal',
      doctor: 'Dr. Michael Brown'
    },
    {
      id: 2,
      test: 'Cholesterol Panel',
      date: '2024-01-05',
      status: 'Normal',
      doctor: 'Dr. Sarah Johnson'
    },
    {
      id: 3,
      test: 'Blood Glucose',
      date: '2024-01-05',
      status: 'Normal',
      doctor: 'Dr. Michael Brown'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success';
      case 'pending': return 'bg-warning/10 text-warning border-warning';
      case 'scheduled': return 'bg-info/10 text-info border-info';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive';
      default: return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-medical-blue to-medical-blue-dark rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
            <p className="text-blue-100">Manage your health records and appointments.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Next Appointment</p>
              <p className="text-lg font-semibold">Jan 20, 10:00 AM</p>
            </div>
            <Heart className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-medical-blue" />
            <span>Patient Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">
                  {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-muted-foreground">Patient ID: {patientInfo.patientId}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Age: {patientInfo.age}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Blood Type: {patientInfo.bloodType}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user?.phone}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Allergies:</p>
              <div className="flex flex-wrap gap-1">
                {patientInfo.allergies.map((allergy, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments and Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-medical-green" />
              <span>Upcoming Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{appointment.doctor}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.department}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Medical Records */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-medical-purple" />
              <span>Recent Medical Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{record.type}</h4>
                      <p className="text-sm text-muted-foreground">{record.doctor}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{record.date}</span>
                  </div>
                  <p className="text-sm text-foreground mb-1">{record.diagnosis}</p>
                  <p className="text-xs text-muted-foreground">{record.notes}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions and Lab Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Prescriptions */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-medical-red" />
              <span>Current Prescriptions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{prescription.medication}</h4>
                      <p className="text-sm text-muted-foreground">{prescription.dosage} • {prescription.frequency}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success">
                      {prescription.refillsLeft} refills left
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Prescribed by: {prescription.prescribedBy}</p>
                    <p>Duration: {prescription.startDate} - {prescription.endDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lab Results */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5 text-medical-orange" />
              <span>Recent Lab Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {labResults.map((result) => (
                <div key={result.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{result.test}</h4>
                      <p className="text-sm text-muted-foreground">{result.doctor}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {result.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{result.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Report
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-medical-blue" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Book Appointment</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Medical Records</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Pill className="w-6 h-6" />
              <span className="text-sm">Prescriptions</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <TestTube className="w-6 h-6" />
              <span className="text-sm">Lab Results</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;