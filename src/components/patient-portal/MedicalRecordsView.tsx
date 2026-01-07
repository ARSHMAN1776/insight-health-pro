import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Pill, TestTube, Calendar, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { MedicalRecord, Prescription, LabTest, Patient } from '../../lib/dataManager';
import PrescriptionRefillRequest from './PrescriptionRefillRequest';
import DoctorMessaging from './DoctorMessaging';

interface MedicalRecordsViewProps {
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  labTests: LabTest[];
  loading: boolean;
  patientData?: Patient | null;
  onDataRefresh?: () => void;
}

const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({
  medicalRecords,
  prescriptions,
  labTests,
  loading,
  patientData,
  onDataRefresh,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading records...</p>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Doctor Messaging */}
      <DoctorMessaging patientData={patientData || null} />

      {/* Prescription Refills */}
      <PrescriptionRefillRequest 
        patientData={patientData || null} 
        prescriptions={prescriptions}
        onRefillRequested={onDataRefresh}
      />

      {/* Medical Records */}
      <Card>
        <CardHeader className="p-3 sm:p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Medical History
            {medicalRecords.length > 0 && (
              <Badge variant="secondary" className="text-xs">{medicalRecords.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          {medicalRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No medical records</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicalRecords.map((record) => (
                <div key={record.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{record.visit_date}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Diagnosis</p>
                    <p className="text-sm font-medium">{record.diagnosis}</p>
                  </div>
                  {record.treatment && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Treatment</p>
                      <p className="text-sm">{record.treatment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions */}
      <Card>
        <CardHeader className="p-3 sm:p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-500" />
            Prescriptions
            {prescriptions.length > 0 && (
              <Badge variant="secondary" className="text-xs">{prescriptions.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          {prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No prescriptions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate">{prescription.medication_name}</h4>
                      <p className="text-xs text-muted-foreground">{prescription.dosage}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${getStatusStyle(prescription.status || '')}`}>
                      {prescription.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Frequency</span>
                      <p className="font-medium truncate">{prescription.frequency}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">{prescription.duration}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date</span>
                      <p className="font-medium">{prescription.date_prescribed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Results */}
      <Card>
        <CardHeader className="p-3 sm:p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TestTube className="w-4 h-4 text-purple-500" />
            Lab Results
            {labTests.length > 0 && (
              <Badge variant="secondary" className="text-xs">{labTests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          {labTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TestTube className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No lab results</p>
            </div>
          ) : (
            <div className="space-y-2">
              {labTests.map((test) => (
                <div key={test.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate">{test.test_name}</h4>
                      <p className="text-xs text-muted-foreground">{test.test_type}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${getStatusStyle(test.status || '')}`}>
                      {test.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {test.test_date}
                    </span>
                    {test.normal_range && (
                      <span>Range: {test.normal_range}</span>
                    )}
                  </div>
                  {test.results && (
                    <p className="text-sm mt-2 p-2 bg-background rounded border text-foreground">
                      {test.results}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecordsView;
