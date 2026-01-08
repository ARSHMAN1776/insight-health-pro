import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Pill, TestTube, Calendar, Clock, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your records...</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return { 
          icon: CheckCircle,
          bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
          text: 'text-emerald-600 dark:text-emerald-400', 
          border: 'border-emerald-200 dark:border-emerald-500/20' 
        };
      case 'pending':
        return { 
          icon: Clock,
          bg: 'bg-amber-50 dark:bg-amber-500/10', 
          text: 'text-amber-600 dark:text-amber-400', 
          border: 'border-amber-200 dark:border-amber-500/20' 
        };
      default:
        return { 
          icon: AlertCircle,
          bg: 'bg-gray-50 dark:bg-gray-500/10', 
          text: 'text-gray-600 dark:text-gray-400', 
          border: 'border-gray-200 dark:border-gray-500/20' 
        };
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Doctor Messaging */}
      <DoctorMessaging patientData={patientData || null} />

      {/* Prescription Refills */}
      <PrescriptionRefillRequest 
        patientData={patientData || null} 
        prescriptions={prescriptions}
        onRefillRequested={onDataRefresh}
      />

      {/* Medical Records Section */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="p-4 pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              Medical History
            </CardTitle>
            {medicalRecords.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-0 font-semibold">
                {medicalRecords.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {medicalRecords.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <FileText className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No Medical Records</h3>
              <p className="text-sm text-muted-foreground">Your medical history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicalRecords.map((record) => (
                <div 
                  key={record.id} 
                  className="p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-medium">{record.visit_date}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Diagnosis</p>
                      <p className="text-sm font-semibold text-foreground">{record.diagnosis}</p>
                    </div>
                    {record.treatment && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Treatment</p>
                        <p className="text-sm text-foreground/80">{record.treatment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions Section */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="p-4 pb-3 border-b bg-gradient-to-r from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Prescriptions
            </CardTitle>
            {prescriptions.length > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-semibold">
                {prescriptions.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Pill className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No Prescriptions</h3>
              <p className="text-sm text-muted-foreground">Your prescriptions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((prescription) => {
                const status = getStatusConfig(prescription.status || '');
                return (
                  <div 
                    key={prescription.id} 
                    className={`p-4 rounded-xl border transition-all ${status.bg} ${status.border}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-bold text-base">{prescription.medication_name}</h4>
                        <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${status.text} ${status.border} ${status.bg}`}
                      >
                        {prescription.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Frequency</p>
                        <p className="text-sm font-semibold mt-0.5 truncate">{prescription.frequency || '-'}</p>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-semibold mt-0.5">{prescription.duration || '-'}</p>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Date</p>
                        <p className="text-sm font-semibold mt-0.5">{prescription.date_prescribed || '-'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Results Section */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="p-4 pb-3 border-b bg-gradient-to-r from-purple-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TestTube className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              Lab Results
            </CardTitle>
            {labTests.length > 0 && (
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0 font-semibold">
                {labTests.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {labTests.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <TestTube className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No Lab Results</h3>
              <p className="text-sm text-muted-foreground">Your lab test results will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labTests.map((test) => {
                const status = getStatusConfig(test.status || '');
                const StatusIcon = status.icon;
                return (
                  <div 
                    key={test.id} 
                    className="p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base truncate">{test.test_name}</h4>
                        <p className="text-sm text-muted-foreground">{test.test_type}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.border} border`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${status.text}`} />
                        <span className={`text-xs font-semibold ${status.text}`}>{test.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {test.test_date}
                      </span>
                      {test.normal_range && (
                        <span className="px-2 py-0.5 bg-muted rounded-full">
                          Range: {test.normal_range}
                        </span>
                      )}
                    </div>
                    {test.results && (
                      <div className="p-3 bg-background rounded-lg border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Results</p>
                        <p className="text-sm font-medium text-foreground">{test.results}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecordsView;
