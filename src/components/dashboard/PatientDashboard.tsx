import React, { useState, useEffect } from 'react';
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
import { dataManager, Appointment, MedicalRecord, Prescription, LabTest } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsData, recordsData, prescriptionsData, labTestsData] = await Promise.all([
          dataManager.getAppointments(),
          dataManager.getMedicalRecords(),
          dataManager.getPrescriptions(),
          dataManager.getLabTests()
        ]);
        
        setAppointments(appointmentsData.slice(0, 3)); // Show only first 3
        setMedicalRecords(recordsData.slice(0, 3));
        setPrescriptions(prescriptionsData.slice(0, 2));
        setLabTests(labTestsData.slice(0, 3));
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
              <p className="text-lg font-semibold">
                {appointments.length > 0 ? `${appointments[0].appointment_date}` : 'No upcoming appointments'}
              </p>
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
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
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
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming appointments</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">Appointment #{appointment.id.slice(0, 8)}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{appointment.appointment_date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
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
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading records...</p>
                </div>
              ) : medicalRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No medical records found</p>
                </div>
              ) : (
                medicalRecords.map((record) => (
                  <div key={record.id} className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">Medical Record</h4>
                        <p className="text-sm text-muted-foreground">Visit #{record.id.slice(0, 8)}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{record.visit_date}</span>
                    </div>
                    <p className="text-sm text-foreground mb-1">{record.diagnosis}</p>
                    <p className="text-xs text-muted-foreground">{record.notes}</p>
                  </div>
                ))
              )}
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
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading prescriptions...</p>
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active prescriptions</p>
                </div>
              ) : (
                prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{prescription.medication_name}</h4>
                        <p className="text-sm text-muted-foreground">{prescription.dosage} • {prescription.frequency}</p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {prescription.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Duration: {prescription.duration}</p>
                      <p>Prescribed: {prescription.date_prescribed}</p>
                    </div>
                  </div>
                ))
              )}
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
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading lab results...</p>
                </div>
              ) : labTests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No lab results available</p>
                </div>
              ) : (
                labTests.map((result) => (
                  <div key={result.id} className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{result.test_name}</h4>
                        <p className="text-sm text-muted-foreground">{result.test_type}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-success/10 text-success border-success">
                          {result.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{result.test_date}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  </div>
                ))
              )}
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