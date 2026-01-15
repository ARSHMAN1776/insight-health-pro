import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Pill, TestTube, Calendar, Clock, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { MedicalRecord, Prescription, LabTest, Patient } from '../../lib/dataManager';
import PrescriptionRefillRequest from './PrescriptionRefillRequest';

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
      {/* Prescription Refills */}
      <PrescriptionRefillRequest 
        patientData={patientData || null} 
        prescriptions={prescriptions}
        onRefillRequested={onDataRefresh}
      />

      {/* Medical Records Section */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span>Medical History</span>
            </CardTitle>
            {medicalRecords.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-0 font-semibold text-xs">
                {medicalRecords.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {medicalRecords.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">No Medical Records</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your medical history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicalRecords.map((record) => (
                <div 
                  key={record.id} 
                  className="p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted/20 hover:from-muted/70 hover:to-muted/30 rounded-xl border border-border/50 transition-all"
                >
                  {/* Date Badge */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg text-xs font-medium text-primary">
                      <Calendar className="w-3 h-3" />
                      {record.visit_date}
                    </div>
                  </div>
                  
                  {/* Diagnosis */}
                  <div className="mb-2">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Diagnosis</p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">{record.diagnosis}</p>
                  </div>
                  
                  {/* Treatment */}
                  {record.treatment && (
                    <div className="p-2.5 sm:p-3 bg-background/60 rounded-lg border border-border/30">
                      <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Treatment</p>
                      <p className="text-xs sm:text-sm text-foreground/80">{record.treatment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions Section */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-gradient-to-r from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span>Prescriptions</span>
            </CardTitle>
            {prescriptions.length > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-semibold text-xs">
                {prescriptions.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Pill className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">No Prescriptions</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your prescriptions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((prescription) => {
                const status = getStatusConfig(prescription.status || '');
                return (
                  <div 
                    key={prescription.id} 
                    className={`p-3 sm:p-4 rounded-xl border transition-all ${status.bg} ${status.border}`}
                  >
                    {/* Header with name and status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base truncate">{prescription.medication_name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{prescription.dosage}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 flex-shrink-0 ${status.text} ${status.border} ${status.bg}`}
                      >
                        {prescription.status}
                      </Badge>
                    </div>
                    
                    {/* Info grid - 2 cols on mobile, 3 on larger */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="p-2 bg-background/60 rounded-lg text-center">
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Frequency</p>
                        <p className="text-xs sm:text-sm font-semibold mt-0.5 truncate">{prescription.frequency || '-'}</p>
                      </div>
                      <div className="p-2 bg-background/60 rounded-lg text-center">
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
                        <p className="text-xs sm:text-sm font-semibold mt-0.5">{prescription.duration || '-'}</p>
                      </div>
                      <div className="p-2 bg-background/60 rounded-lg text-center col-span-2 sm:col-span-1">
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Prescribed</p>
                        <p className="text-xs sm:text-sm font-semibold mt-0.5">{prescription.date_prescribed || '-'}</p>
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
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-gradient-to-r from-purple-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TestTube className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span>Lab Results</span>
            </CardTitle>
            {labTests.length > 0 && (
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0 font-semibold text-xs">
                {labTests.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {labTests.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <TestTube className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">No Lab Results</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your lab test results will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labTests.map((test) => {
                const status = getStatusConfig(test.status || '');
                const StatusIcon = status.icon;
                return (
                  <div 
                    key={test.id} 
                    className="p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted/20 hover:from-muted/70 hover:to-muted/30 rounded-xl border border-border/50 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base truncate">{test.test_name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{test.test_type}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg} ${status.border} border`}>
                        <StatusIcon className={`w-3 h-3 ${status.text}`} />
                        <span className={`text-[10px] sm:text-xs font-semibold ${status.text}`}>{test.status}</span>
                      </div>
                    </div>
                    
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                        <Calendar className="w-3 h-3" />
                        {test.test_date}
                      </span>
                      {test.normal_range && (
                        <span className="bg-muted/50 px-2 py-1 rounded-lg text-[10px] sm:text-xs">
                          Range: {test.normal_range}
                        </span>
                      )}
                    </div>
                    
                    {/* Results */}
                    {test.results && (
                      <div className="p-2.5 sm:p-3 bg-background/60 rounded-lg border border-border/30">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Results</p>
                        <p className="text-xs sm:text-sm font-medium text-foreground">{test.results}</p>
                      </div>
                    )}
                    
                    {/* Report Image/Document */}
                    {(test as any).report_image_url && (
                      <div className="mt-2">
                        <a 
                          href={(test as any).report_image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View Full Report
                        </a>
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
