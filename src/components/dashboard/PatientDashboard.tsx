import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataManager, Appointment, MedicalRecord, Prescription, LabTest, Patient } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';
import PatientPortalNav from '../patient-portal/PatientPortalNav';
import PersonalInfoSection from '../patient-portal/PersonalInfoSection';
import MedicalRecordsView from '../patient-portal/MedicalRecordsView';
import AppointmentsView from '../patient-portal/AppointmentsView';
import { Bell, Clock, Calendar, Shield, FileText, Pill, LayoutDashboard, Phone, Mail, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

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
  const [patientData, setPatientData] = useState<Patient | null>(null);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching patient data for user:', user?.id, user?.email);
      
      // First try to fetch patient data by user_id (new method)
      let patient = null;
      if (user?.id) {
        patient = await dataManager.getPatientByUserId(user.id);
        console.log('Patient record found by user_id:', patient);
      }
      
      // Fallback to email lookup for existing patients without user_id
      if (!patient && user?.email) {
        patient = await dataManager.getPatientByEmail(user.email);
        console.log('Patient record found by email:', patient);
      }
      
      setPatientData(patient);
      
      // If patient found, fetch their specific data
      if (patient) {
        console.log('Fetching patient-specific data for patient ID:', patient.id);
        const [appointmentsData, recordsData, prescriptionsData, labTestsData] = await Promise.all([
          dataManager.getAppointmentsByPatient(patient.id),
          dataManager.getMedicalRecordsByPatient(patient.id),
          dataManager.getPrescriptionsByPatient(patient.id),
          dataManager.getLabTestsByPatient(patient.id)
        ]);
        
        console.log('Fetched data:', {
          appointments: appointmentsData.length,
          records: recordsData.length,
          prescriptions: prescriptionsData.length,
          labTests: labTestsData.length
        });
        
        setAppointments(appointmentsData);
        setMedicalRecords(recordsData);
        setPrescriptions(prescriptionsData);
        setLabTests(labTestsData);
      } else {
        console.warn('No patient record found for user:', user?.id, user?.email);
        toast({
          title: "Patient Record Not Found",
          description: "Your registration is pending verification. Please wait for hospital staff to approve your account.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [user?.id, user?.email]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Parse allergies from text field
  const parseAllergies = (allergiesText?: string): string[] => {
    if (!allergiesText) return [];
    return allergiesText.split(',').map(a => a.trim()).filter(a => a.length > 0);
  };

  // Build patient info from real database data
  const patientInfo = patientData ? {
    patientId: patientData.id.slice(0, 8).toUpperCase(),
    age: calculateAge(patientData.date_of_birth),
    bloodType: patientData.blood_type || 'N/A',
    allergies: parseAllergies(patientData.allergies),
    emergencyContact: {
      name: patientData.emergency_contact_name || 'Not provided',
      relationship: 'Emergency Contact',
      phone: patientData.emergency_contact_phone || 'Not provided'
    }
  } : {
    patientId: 'N/A',
    age: 0,
    bloodType: 'N/A',
    allergies: [],
    emergencyContact: {
      name: 'Not provided',
      relationship: 'Emergency Contact',
      phone: 'Not provided'
    }
  };

  // Get upcoming appointment count
  const today = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) >= today
  );
  const nextAppointment = upcomingAppointments[0];

  const isVerified = patientData?.status === 'active';

  const renderDashboardOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Verification Status Banner */}
      {patientData && !isVerified && (
        <Alert className="bg-warning/10 border-warning/30">
          <AlertCircle className="h-5 w-5 text-warning" />
          <AlertTitle className="text-warning font-semibold">Account Pending Verification</AlertTitle>
          <AlertDescription className="text-warning/80">
            Your account is being reviewed by our staff. Once verified, you'll be able to book appointments 
            and access all portal features. This usually takes 1-2 business days.
          </AlertDescription>
        </Alert>
      )}

      {patientData && isVerified && (
        <Alert className="bg-success/10 border-success/30">
          <CheckCircle className="h-5 w-5 text-success" />
          <AlertTitle className="text-success font-semibold">Account Verified</AlertTitle>
          <AlertDescription className="text-success/80">
            Your account is verified. You can book appointments and access all portal features.
          </AlertDescription>
        </Alert>
      )}
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-hover to-medical-blue-dark p-10 text-primary-foreground shadow-elegant">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-foreground/10 rounded-full -ml-48 -mb-48 blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Welcome back, {patientData?.first_name || user?.firstName || 'Patient'}!
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-6">
              Your health journey at a glance
            </p>
            <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-32 h-32 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-16 h-16 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-gradient border-l-4 border-l-primary hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="w-7 h-7 text-primary" />
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Upcoming Appointments</p>
            <p className="text-4xl font-bold text-primary mb-1">{upcomingAppointments.length}</p>
            <p className="text-xs text-muted-foreground">Next visit scheduled</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-l-4 border-l-medical-purple hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-medical-purple/10 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-medical-purple" />
              </div>
              <Badge variant="outline" className="bg-medical-purple/10 text-medical-purple border-medical-purple/20">Records</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Medical Records</p>
            <p className="text-4xl font-bold text-medical-purple mb-1">{medicalRecords.length}</p>
            <p className="text-xs text-muted-foreground">Total health records</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-l-4 border-l-medical-green hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-medical-green/10 rounded-2xl flex items-center justify-center">
                <Pill className="w-7 h-7 text-medical-green" />
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Prescriptions</p>
            <p className="text-4xl font-bold text-medical-green mb-1">{prescriptions.length}</p>
            <p className="text-xs text-muted-foreground">Current medications</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment Highlight */}
      {nextAppointment && (
        <Card className="card-gradient border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">Next Appointment</h3>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {nextAppointment.status}
                    </Badge>
                  </div>
                  <p className="font-semibold text-2xl text-primary mb-3">{nextAppointment.type}</p>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{nextAppointment.appointment_date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{nextAppointment.appointment_time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-medical-blue-light to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">View-Only Portal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a secure, read-only portal for accessing your medical information. 
                  To schedule appointments or update records, please contact our reception.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-medical-green-light to-background border-success/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your health information is protected with industry-standard encryption. 
                  All access is logged and monitored for your security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Don't block access if no patient record - just show basic info

  return (
    <div className="min-h-screen bg-background">
      <PatientPortalNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      
      <main className="container-elegant py-12">
        {activeTab === 'dashboard' && renderDashboardOverview()}
        
        {activeTab === 'records' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">Medical Records</h2>
              <p className="text-muted-foreground text-lg">
                Complete overview of your medical history, prescriptions, and lab results
              </p>
            </div>
            <PersonalInfoSection 
              user={{
                firstName: patientData?.first_name || user?.firstName,
                lastName: patientData?.last_name || user?.lastName,
                email: patientData?.email || user?.email,
                phone: patientData?.phone || user?.phone
              }} 
              patientInfo={patientInfo} 
            />
            <div className="mt-8">
              <MedicalRecordsView 
                medicalRecords={medicalRecords}
                prescriptions={prescriptions}
                labTests={labTests}
                loading={loading}
                patientData={patientData}
                onDataRefresh={fetchPatientData}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'appointments' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">Appointments</h2>
              <p className="text-muted-foreground text-lg">
                Book new appointments and view your schedule
              </p>
            </div>
            <AppointmentsView 
              appointments={appointments} 
              loading={loading} 
              patientData={patientData}
              onAppointmentBooked={fetchPatientData}
            />
          </div>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border mt-20">
        <div className="container-elegant py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">Patient Portal</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Secure, professional healthcare management system providing patients with 
                convenient access to their medical information anytime, anywhere.
              </p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-success" />
                <span>HIPAA Compliant • End-to-End Encrypted</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Information</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+92 (123) 456-7890</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@hospital.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Healthcare Center</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-primary transition-colors">Help & Support</a>
                <a href="#" className="block hover:text-primary transition-colors">FAQs</a>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <p className="text-sm text-muted-foreground">
                © 2025 Hospital Management System. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>Powered by Modern Healthcare Technology</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientDashboard;