import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Download, 
  Printer, 
  Building,
  User,
  Calendar,
  FlaskConical,
  Stethoscope,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import QRCodeDisplay from '../shared/QRCodeDisplay';
import type { TestParameter } from '@/lib/labReportTemplates';
import { 
  generateLabReportPDF, 
  downloadLabReport, 
  printLabReport,
  type LabReportData 
} from '@/lib/labReportGenerator';
import LabResultTrending from './LabResultTrending';
interface LabReportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: LabReportData | null;
}

const LabReportPreview: React.FC<LabReportPreviewProps> = ({
  open,
  onOpenChange,
  reportData,
}) => {
  if (!reportData) return null;

  const handleDownload = () => {
    const doc = generateLabReportPDF(reportData);
    downloadLabReport(doc, reportData.reportNumber);
  };

  const handlePrint = () => {
    const doc = generateLabReportPDF(reportData);
    printLabReport(doc);
  };

  const getStatusColor = (status: TestParameter['status']) => {
    switch (status) {
      case 'critical':
        return 'text-destructive bg-destructive/10 font-bold';
      case 'high':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-primary bg-primary/10';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: TestParameter['status'], flag?: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">{flag || 'Critical'}</Badge>;
      case 'high':
        return <Badge className="bg-warning text-warning-foreground">{flag || 'H'}</Badge>;
      case 'low':
        return <Badge className="bg-primary text-primary-foreground">{flag || 'L'}</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>Lab Report Preview</DialogTitle>
          <DialogDescription>
            Preview the lab report before printing or downloading
          </DialogDescription>
        </DialogHeader>

        {/* Printable Report Content */}
        <div className="bg-white dark:bg-card rounded-lg border p-6 space-y-6 print:border-none print:p-0">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-lg print:rounded-none -mx-6 -mt-6 print:-mx-0 print:-mt-0">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">{reportData.hospitalInfo.name}</h1>
                <p className="text-sm opacity-90">{reportData.hospitalInfo.address}</p>
                <p className="text-sm opacity-90">
                  Phone: {reportData.hospitalInfo.phone}
                  {reportData.hospitalInfo.email && ` | Email: ${reportData.hospitalInfo.email}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">Report No: <strong>{reportData.reportNumber}</strong></p>
                <p className="text-sm">Date: {format(reportData.reportTime, 'dd/MM/yyyy')}</p>
              </div>
            </div>
            <h2 className="text-center font-bold mt-4 text-lg">LABORATORY INVESTIGATION REPORT</h2>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> PATIENT INFORMATION
              </h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Name:</span> <strong>{reportData.patient.name}</strong></p>
                <p><span className="text-muted-foreground">Age/Gender:</span> {reportData.patient.age} years / {reportData.patient.gender}</p>
                <p><span className="text-muted-foreground">Patient ID:</span> {reportData.patient.id}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> REFERRING PHYSICIAN
              </h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Doctor:</span> <strong>{reportData.doctor.name}</strong></p>
                <p><span className="text-muted-foreground">Department:</span> {reportData.doctor.department || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Sample Details */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> SAMPLE DETAILS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <p><span className="text-muted-foreground">Test:</span> <strong>{reportData.testName}</strong></p>
              <p><span className="text-muted-foreground">Specimen:</span> {reportData.specimenType}</p>
              <p><span className="text-muted-foreground">Collection:</span> {format(reportData.collectionTime, 'dd/MM/yyyy HH:mm')}</p>
              <p><span className="text-muted-foreground">Method:</span> {reportData.method}</p>
            </div>
          </div>

          {/* Test Results Table */}
          <div>
            <h3 className="font-semibold mb-3">TEST RESULTS</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="font-bold">Parameter</TableHead>
                    <TableHead className="font-bold text-center">Result</TableHead>
                    <TableHead className="font-bold text-center">Unit</TableHead>
                    <TableHead className="font-bold text-center">Reference Range</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.parameters.map((param, index) => (
                    <TableRow key={index} className={getStatusColor(param.status)}>
                      <TableCell className="font-medium">{param.name}</TableCell>
                      <TableCell className="text-center font-semibold">{param.value}</TableCell>
                      <TableCell className="text-center">{param.unit}</TableCell>
                      <TableCell className="text-center">{param.normalRange}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(param.status, param.flag)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Legend: L = Low | H = High | L! = Critical Low | H! = Critical High
            </p>
          </div>

          {/* Comments */}
          {reportData.comments && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">CLINICAL COMMENTS / INTERPRETATION</h3>
              <p className="text-sm whitespace-pre-wrap">{reportData.comments}</p>
            </div>
          )}

          {/* Historical Trending */}
          <LabResultTrending
            patientId={reportData.patient.id}
            testName={reportData.testName}
            currentParameters={reportData.parameters}
          />

          <Separator />

          {/* Footer Section */}
          <div className="flex justify-between items-end">
            {/* Signatures */}
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Lab Technician</p>
                <div className="border-t border-dashed w-40 pt-1">
                  <p className="text-sm font-medium">{reportData.technician.name}</p>
                </div>
              </div>
              {reportData.verifiedBy && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Verified By (Pathologist)</p>
                  <div className="border-t border-dashed w-40 pt-1">
                    <p className="text-sm font-medium">{reportData.verifiedBy.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="text-center print:block">
              <QRCodeDisplay
                data={`${window.location.origin}/verify-lab-report?id=${reportData.reportId}`}
                size={80}
                showDownload={false}
                showPrint={false}
              />
              <p className="text-xs text-muted-foreground mt-1">Scan to verify</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground italic">
            This is a computer-generated report. Signature verification indicates clinical review.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LabReportPreview;
