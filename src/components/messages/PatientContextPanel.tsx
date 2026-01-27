import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  User, 
  Calendar, 
  Pill, 
  FileText, 
  AlertCircle,
  Heart,
  Loader2,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PatientContextPanelProps {
  patientId: string;
  patientName: string;
}

interface PatientDetails {
  date_of_birth: string;
  blood_type: string | null;
  allergies: string | null;
  medical_history: string | null;
  phone: string | null;
}

interface RecentAppointment {
  id: string;
  appointment_date: string;
  type: string | null;
  status: string | null;
}

interface ActivePrescription {
  id: string;
  medication_name: string;
  dosage: string | null;
}

interface RecentDiagnosis {
  id: string;
  diagnosis: string | null;
  visit_date: string;
}

const PatientContextPanel: React.FC<PatientContextPanelProps> = ({
  patientId,
  patientName,
}) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [activePrescriptions, setActivePrescriptions] = useState<ActivePrescription[]>([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState<RecentDiagnosis[]>([]);

  useEffect(() => {
    if (patientId) {
      fetchPatientContext();
    }
  }, [patientId]);

  const fetchPatientContext = async () => {
    try {
      setLoading(true);

      const [patientResult, appointmentsResult, prescriptionsResult, recordsResult] = await Promise.all([
        supabase
          .from('patients')
          .select('date_of_birth, blood_type, allergies, medical_history, phone')
          .eq('id', patientId)
          .single(),
        supabase
          .from('appointments')
          .select('id, appointment_date, type, status')
          .eq('patient_id', patientId)
          .is('deleted_at', null)
          .order('appointment_date', { ascending: false })
          .limit(3),
        supabase
          .from('prescriptions')
          .select('id, medication_name, dosage')
          .eq('patient_id', patientId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .limit(5),
        supabase
          .from('medical_records')
          .select('id, diagnosis, visit_date')
          .eq('patient_id', patientId)
          .is('deleted_at', null)
          .not('diagnosis', 'is', null)
          .order('visit_date', { ascending: false })
          .limit(3),
      ]);

      if (patientResult.data) setPatient(patientResult.data);
      if (appointmentsResult.data) setRecentAppointments(appointmentsResult.data);
      if (prescriptionsResult.data) setActivePrescriptions(prescriptionsResult.data);
      if (recordsResult.data) setRecentDiagnoses(recordsResult.data);
    } catch (error) {
      console.error('Error fetching patient context:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Patient Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 max-h-[calc(100vh-400px)] overflow-y-auto">
        {/* Basic Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Demographics</h4>
          <div className="bg-accent/50 rounded-lg p-3 space-y-1">
            <p className="font-medium">{patientName}</p>
            {patient?.date_of_birth && (
              <p className="text-sm text-muted-foreground">
                Age: {calculateAge(patient.date_of_birth)} years
              </p>
            )}
            {patient?.blood_type && (
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-destructive" />
                <span className="text-sm">Blood: {patient.blood_type}</span>
              </div>
            )}
            {patient?.phone && (
              <p className="text-xs text-muted-foreground">{patient.phone}</p>
            )}
          </div>
        </div>

        {/* Allergies Warning */}
        {patient?.allergies && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Allergies</span>
            </div>
            <p className="text-sm text-destructive/80">{patient.allergies}</p>
          </div>
        )}

        {/* Active Prescriptions */}
        {activePrescriptions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Active Medications
            </h4>
            <div className="space-y-1">
              {activePrescriptions.map(rx => (
                <div key={rx.id} className="text-sm bg-muted/30 px-3 py-2 rounded">
                  <span className="font-medium">{rx.medication_name}</span>
                  {rx.dosage && (
                    <span className="text-muted-foreground ml-2">({rx.dosage})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Appointments */}
        {recentAppointments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Appointments
            </h4>
            <div className="space-y-1">
              {recentAppointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between text-sm bg-muted/30 px-3 py-2 rounded">
                  <div>
                    <span className="font-medium">{apt.type || 'Consultation'}</span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(apt.appointment_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Diagnoses */}
        {recentDiagnoses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recent Diagnoses
            </h4>
            <div className="space-y-1">
              {recentDiagnoses.map(record => (
                <div key={record.id} className="text-sm bg-muted/30 px-3 py-2 rounded">
                  <p className="font-medium">{record.diagnosis}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.visit_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical History Summary */}
        {patient?.medical_history && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Medical History</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              {patient.medical_history}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientContextPanel;
