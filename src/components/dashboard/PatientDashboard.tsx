import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataManager, Appointment, MedicalRecord, Prescription, LabTest, Patient } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';
import PatientPortalNav from '../patient-portal/PatientPortalNav';
import PersonalInfoSection from '../patient-portal/PersonalInfoSection';
import MedicalRecordsView from '../patient-portal/MedicalRecordsView';
import AppointmentsView from '../patient-portal/AppointmentsView';
import DoctorMessaging from '../patient-portal/DoctorMessaging';
import InsuranceClaimsView from '../patient-portal/InsuranceClaimsView';
import QueueStatusView from '../patient-portal/QueueStatusView';
import PatientSymptomChecker from '../patient-portal/PatientSymptomChecker';
import { DashboardSkeleton } from '../shared/CardSkeleton';
import { Bell, Clock, Calendar, Shield, FileText, Pill, LayoutDashboard, Phone, Mail, MapPin, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '../ui/progress';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'appointments' | 'messages' | 'insurance' | 'symptom-check'>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<{
    queuePosition: number;
    totalPending: number;
    estimatedWaitTime: string;
    submittedAt: string | null;
  } | null>(null);

  const fetchVerificationStatus = async (userId: string) => {
    try {
      // Get user's registration in queue
      const { data: userRegistration, error: userError } = await supabase
        .from('patient_registration_queue')
        .select('id, created_at, status')
        .eq('user_id', userId)
        .maybeSingle();

      if (userError || !userRegistration || userRegistration.status !== 'pending') {
        setVerificationInfo(null);
        return;
      }

      // Get count of pending registrations submitted before this one
      const { count: pendingBefore, error: countError } = await supabase
        .from('patient_registration_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('created_at', userRegistration.created_at);

      // Get total pending count
      const { count: totalPending, error: totalError } = await supabase
        .from('patient_registration_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (countError || totalError) {
        return;
      }

      const position = (pendingBefore || 0) + 1;
      const total = totalPending || 1;

      // Estimate wait time based on position (assume ~2 hours per registration during business hours)
      const hoursPerRegistration = 2;
      const estimatedHours = position * hoursPerRegistration;
      
      let estimatedWaitTime: string;
      if (estimatedHours < 24) {
        estimatedWaitTime = estimatedHours <= 1 
          ? 'Within a few hours' 
          : `~${estimatedHours} hours`;
      } else {
        const days = Math.ceil(estimatedHours / 8); // ~8 working hours per day
        estimatedWaitTime = days === 1 ? '~1 business day' : `~${days} business days`;
      }

      setVerificationInfo({
        queuePosition: position,
        totalPending: total,
        estimatedWaitTime,
        submittedAt: userRegistration.created_at,
      });
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
      // Non-critical - don't show error toast, just log
    }
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // First try to fetch patient data by user_id (new method)
      let patient = null;
      if (user?.id) {
        patient = await dataManager.getPatientByUserId(user.id);
      }
      
      // Fallback to email lookup for existing patients without user_id
      if (!patient && user?.email) {
        patient = await dataManager.getPatientByEmail(user.email);
      }
      
      setPatientData(patient);
      
      // If patient found, fetch their specific data
      if (patient) {
        const [appointmentsData, recordsData, prescriptionsData, labTestsData] = await Promise.all([
          dataManager.getAppointmentsByPatient(patient.id),
          dataManager.getMedicalRecordsByPatient(patient.id),
          dataManager.getPrescriptionsByPatient(patient.id),
          dataManager.getLabTestsByPatient(patient.id)
        ]);
        
        setAppointments(appointmentsData);
        setMedicalRecords(recordsData);
        setPrescriptions(prescriptionsData);
        setLabTests(labTestsData);
        
        // Check verification status for pending patients
        if (patient.status === 'pending_verification' && user?.id) {
          await fetchVerificationStatus(user.id);
        }
        
        // Show helpful message for new patients with no records yet
        if (recordsData.length === 0 && appointmentsData.length === 0 && prescriptionsData.length === 0) {
          // Only show if patient is verified but has no data
          if (patient.status === 'active') {
            toast({
              title: "Welcome to Your Portal!",
              description: "Your account is ready. Book your first appointment to get started.",
              variant: "default"
            });
          }
        }
      } else {
        // No patient record found at all - likely a new registration
        if (user?.id) {
          await fetchVerificationStatus(user.id);
        }
        toast({
          title: "Registration Pending",
          description: "Your account is being set up. Please wait for hospital staff to complete your registration.",
          variant: "default"
        });
      }
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
    // Use FULL UUID for QR verification + DB lookups
    patientId: patientData.id,
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

  // Get upcoming appointment count (exclude cancelled appointments)
  const today = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) >= today && apt.status !== 'cancelled'
  );
  const nextAppointment = upcomingAppointments[0];
  
  // Get recently cancelled appointments (within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === 'cancelled' && new Date(apt.appointment_date) >= thirtyDaysAgo
  );

  const isVerified = patientData?.status === 'active';

  const renderDashboardOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Verification Status Banner */}
      {patientData && !isVerified && (
        <Card className="bg-warning/5 border-warning/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning text-lg mb-2">Account Pending Verification</h3>
                <p className="text-muted-foreground mb-4">
                  Your account is being reviewed by our staff. Once verified, you'll be able to book appointments 
                  and access all portal features.
                </p>
                {verificationInfo && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Users className="w-4 h-4" />
                          <span>Queue Position</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          #{verificationInfo.queuePosition}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            of {verificationInfo.totalPending}
                          </span>
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="w-4 h-4" />
                          <span>Estimated Wait</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {verificationInfo.estimatedWaitTime}
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted</span>
                        </div>
                        <p className="text-lg font-medium text-foreground">
                          {verificationInfo.submittedAt 
                            ? new Date(verificationInfo.submittedAt).toLocaleDateString()
                            : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Verification Progress</span>
                        <span className="text-muted-foreground">
                          {Math.max(10, 100 - (verificationInfo.queuePosition * 20))}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.max(10, 100 - (verificationInfo.queuePosition * 20))} 
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
                {!verificationInfo && (
                  <p className="text-sm text-muted-foreground">
                    This usually takes 1-2 business days.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-primary-hover to-medical-blue-dark p-5 sm:p-7 md:p-10 text-primary-foreground shadow-elegant">
        <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-primary-foreground/10 rounded-full -mr-16 sm:-mr-24 md:-mr-32 -mt-16 sm:-mt-24 md:-mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary-foreground/10 rounded-full -ml-24 sm:-ml-36 md:-ml-48 -mb-24 sm:-mb-36 md:-mb-48 blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
              Welcome back, {patientData?.first_name || user?.firstName || 'Patient'}!
            </h1>
            <p className="text-primary-foreground/90 text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6">
              Your health journey at a glance
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-primary-foreground/80">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center justify-center">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-12 h-12 lg:w-16 lg:h-16 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Status - Shows when patient is checked in */}
      {patientData && <QueueStatusView patientId={patientData.id} />}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <Card className="card-gradient border-l-4 border-l-primary hover:shadow-xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">Active</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Upcoming Appointments</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">{upcomingAppointments.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Next visit scheduled</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-l-4 border-l-medical-purple hover:shadow-xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-medical-purple/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-medical-purple" />
              </div>
              <Badge variant="outline" className="bg-medical-purple/10 text-medical-purple border-medical-purple/20 text-[10px] sm:text-xs">Records</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Medical Records</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-medical-purple mb-1">{medicalRecords.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total health records</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-l-4 border-l-medical-green hover:shadow-xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-medical-green/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Pill className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-medical-green" />
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] sm:text-xs">Active</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Prescriptions</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-medical-green mb-1">{prescriptions.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Current medications</p>
          </CardContent>
        </Card>
      </div>

            {/* Next Appointment Highlight */}
            {nextAppointment && (
              <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent overflow-hidden">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Icon + Badge */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs sm:hidden">
                        {nextAppointment.status}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                          Next Appointment
                        </h3>
                        <Badge variant="outline" className="hidden sm:inline-flex bg-success/10 text-success border-success/20 text-xs">
                          {nextAppointment.status}
                        </Badge>
                      </div>
                      
                      <p className="font-bold text-lg sm:text-xl md:text-2xl text-primary">
                        {nextAppointment.type || 'General Consultation'}
                      </p>
                      
                      {/* Date/Time - stacked on mobile */}
                      <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{format(new Date(nextAppointment.appointment_date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{nextAppointment.appointment_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

      {/* Cancelled Appointments Section */}
      {cancelledAppointments.length > 0 && (
        <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 via-background to-transparent overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Recently Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-3">
              {cancelledAppointments.map((apt) => (
                <div key={apt.id} className="p-3 sm:p-4 bg-muted/50 rounded-xl border border-border/50">
                  <div className="flex items-start gap-3">
                    {/* Smaller icon on mobile */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Appointment type with badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {apt.type || 'Appointment'}
                        </p>
                        <Badge className="text-[10px] sm:text-xs bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-0 px-2 py-0.5">
                          Cancelled
                        </Badge>
                      </div>
                      
                      {/* Date and time stacked on mobile */}
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="font-medium">{format(new Date(apt.appointment_date), 'MMM d, yyyy')}</span>
                        <span className="hidden xs:inline">•</span>
                        <span>{apt.appointment_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Showing appointments cancelled in the last 30 days
            </p>
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
                <h3 className="font-semibold text-foreground mb-2 text-lg">Your Patient Portal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Welcome to your personal health portal. You can view your medical records, 
                  schedule appointments, request prescription refills, and message your doctors directly.
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

  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PatientPortalNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
        <main className="container-elegant py-12">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

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

        {activeTab === 'messages' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">Messages</h2>
              <p className="text-muted-foreground text-lg">
                Communicate securely with your healthcare providers
              </p>
            </div>
            <DoctorMessaging patientData={patientData} />
          </div>
        )}

        {activeTab === 'insurance' && patientData && (
          <div className="animate-fade-in">
            <InsuranceClaimsView patientId={patientData.id} />
          </div>
        )}

        {activeTab === 'symptom-check' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-3">AI Symptom Checker</h2>
              <p className="text-muted-foreground text-lg">
                Get AI-powered health guidance and find the right doctor for your symptoms
              </p>
            </div>
            <PatientSymptomChecker 
              patientAge={patientData ? calculateAge(patientData.date_of_birth) : undefined}
              patientGender={patientData?.gender}
              onBookAppointment={(doctorId) => {
                setActiveTab('appointments');
                toast({
                  title: "Ready to Book",
                  description: "You can now book an appointment with your recommended doctor.",
                });
              }}
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