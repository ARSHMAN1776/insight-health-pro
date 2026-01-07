import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Pill, TestTube, Calendar, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Doctor Messaging */}
      <DoctorMessaging patientData={patientData || null} />

      {/* Prescription Refills */}
      <PrescriptionRefillRequest 
        patientData={patientData || null} 
        prescriptions={prescriptions}
        onRefillRequested={onDataRefresh}
      />

      {/* Medical Records */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Medical History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No medical records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record, index) => (
                <div key={record.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{record.visit_date}</span>
                        </div>
                        <div className="bg-accent/50 rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                            <p className="font-medium text-foreground">{record.diagnosis}</p>
                          </div>
                          {record.symptoms && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Symptoms</p>
                              <p className="text-sm text-foreground">{record.symptoms}</p>
                            </div>
                          )}
                          {record.treatment && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Treatment</p>
                              <p className="text-sm text-foreground">{record.treatment}</p>
                            </div>
                          )}
                          {record.notes && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm text-foreground">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-medical-green" />
            <span>Prescriptions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No prescriptions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-accent/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base md:text-lg truncate">{prescription.medication_name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{prescription.dosage}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 self-start text-xs flex-shrink-0">
                      {prescription.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="font-medium">{prescription.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{prescription.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prescribed:</span>
                      <span className="font-medium">{prescription.date_prescribed}</span>
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{prescription.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Results */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-medical-purple" />
            <span>Laboratory Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {labTests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No lab results found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {labTests.map((test, index) => (
                <div key={test.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="bg-accent/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{test.test_name}</h4>
                        <p className="text-sm text-muted-foreground">{test.test_type}</p>
                      </div>
                      <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                        {test.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Test Date</p>
                        <p className="font-medium">{test.test_date}</p>
                      </div>
                      {test.normal_range && (
                        <div>
                          <p className="text-muted-foreground">Normal Range</p>
                          <p className="font-medium">{test.normal_range}</p>
                        </div>
                      )}
                    </div>
                    {test.results && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-sm text-foreground">{test.results}</p>
                      </div>
                    )}
                  </div>
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
