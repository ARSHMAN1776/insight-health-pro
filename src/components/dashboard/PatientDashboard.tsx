import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataManager, Appointment, MedicalRecord, Prescription, LabTest } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';
import PatientPortalNav from '../patient-portal/PatientPortalNav';
import PersonalInfoSection from '../patient-portal/PersonalInfoSection';
import MedicalRecordsView from '../patient-portal/MedicalRecordsView';
import AppointmentsView from '../patient-portal/AppointmentsView';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'appointments'>('dashboard');
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
        
        setAppointments(appointmentsData);
        setMedicalRecords(recordsData);
        setPrescriptions(prescriptionsData);
        setLabTests(labTestsData);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  // Get upcoming appointment count
  const today = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) >= today
  );
  const nextAppointment = upcomingAppointments[0];

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary via-primary-hover to-primary rounded-2xl p-8 text-primary-foreground shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
            <p className="text-primary-foreground/90 text-lg">Stay on top of your health with your personalized portal</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Bell className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-primary">{upcomingAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medical Records</p>
                <p className="text-3xl font-bold text-medical-purple">{medicalRecords.length}</p>
              </div>
              <div className="w-12 h-12 bg-medical-purple/10 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-medical-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Prescriptions</p>
                <p className="text-3xl font-bold text-medical-green">{prescriptions.length}</p>
              </div>
              <div className="w-12 h-12 bg-medical-green/10 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-medical-green" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment Highlight */}
      {nextAppointment && (
        <Card className="card-gradient border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg">Next Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="font-semibold text-xl text-foreground">{nextAppointment.type}</p>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Bell className="w-4 h-4" />
                    <span>{nextAppointment.appointment_date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Bell className="w-4 h-4" />
                    <span>{nextAppointment.appointment_time}</span>
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {nextAppointment.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="bg-gradient-to-r from-medical-blue-light to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Health Portal Information</h3>
              <p className="text-sm text-muted-foreground">
                This is a secure, view-only portal for accessing your medical information. 
                To schedule appointments or update your information, please contact our reception desk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PatientPortalNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      
      <div className="container-elegant py-8">
        {activeTab === 'dashboard' && renderDashboardOverview()}
        
        {activeTab === 'records' && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Medical Records</h2>
              <p className="text-muted-foreground">View your complete medical history, prescriptions, and lab results</p>
            </div>
            <PersonalInfoSection user={user} patientInfo={patientInfo} />
            <div className="mt-6">
              <MedicalRecordsView 
                medicalRecords={medicalRecords}
                prescriptions={prescriptions}
                labTests={labTests}
                loading={loading}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'appointments' && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Appointments</h2>
              <p className="text-muted-foreground">View your appointment schedule and history</p>
            </div>
            <AppointmentsView appointments={appointments} loading={loading} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container-elegant py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Patient Portal</h3>
              <p className="text-sm text-muted-foreground">
                Secure access to your medical information
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                Phone: +92 (123) 456-7890<br />
                Email: info@hospital.com
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Privacy & Security</h3>
              <p className="text-sm text-muted-foreground">
                Your data is protected with industry-standard encryption
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Hospital Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientDashboard;