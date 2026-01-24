import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import TestParameterTable from './TestParameterTable';
import { 
  labReportTemplates, 
  getTemplateById, 
  determineParameterStatus,
  type TestParameter,
  type LabReportTemplate
} from '@/lib/labReportTemplates';
import { 
  generateLabReportPDF, 
  downloadLabReport, 
  printLabReport,
  generateReportNumber,
  type LabReportData 
} from '@/lib/labReportGenerator';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Save, 
  FlaskConical,
  User,
  Stethoscope,
  Building,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface LabTest {
  id: string;
  test_name: string;
  test_date: string;
  test_type: string | null;
  priority: string;
  status: string;
  patient_id: string;
  doctor_id: string;
  results: string | null;
  normal_range: string | null;
  notes: string | null;
  report_image_url?: string | null;
  test_parameters?: TestParameter[];
  specimen_type?: string | null;
  specimen_collection_time?: string | null;
  reporting_time?: string | null;
  verified_by?: string | null;
  method_used?: string | null;
  comments?: string | null;
  report_number?: string | null;
  technician_signature?: string | null;
  pathologist_signature?: string | null;
  is_report_finalized?: boolean;
}

interface PatientInfo {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
}

interface DoctorInfo {
  id: string;
  first_name: string;
  last_name: string;
  department?: string;
  specialization?: string;
}

interface LabReportEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labTest: LabTest | null;
  patient: PatientInfo | null;
  doctor: DoctorInfo | null;
  onSave: () => void;
}

const LabReportEditor: React.FC<LabReportEditorProps> = ({
  open,
  onOpenChange,
  labTest,
  patient,
  doctor,
  onSave,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getSetting } = useSettings();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [specimenType, setSpecimenType] = useState('');
  const [method, setMethod] = useState('');
  const [comments, setComments] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [collectionTime, setCollectionTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Calculate patient age
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

  // Initialize form with existing data
  useEffect(() => {
    if (labTest && open) {
      const existingParams = labTest.test_parameters || [];
      setParameters(existingParams);
      setSpecimenType(labTest.specimen_type || '');
      setMethod(labTest.method_used || '');
      setComments(labTest.comments || labTest.notes || '');
      setVerifiedBy(labTest.verified_by || '');
      setCollectionTime(labTest.specimen_collection_time || labTest.test_date || '');
    }
  }, [labTest, open]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = getTemplateById(templateId);
    if (template) {
      setSpecimenType(template.specimenType);
      setMethod(template.method);
      
      // Create parameters from template (with empty values)
      const gender = patient?.gender?.toLowerCase() || 'male';
      const newParams: TestParameter[] = template.parameters.map(p => ({
        name: p.name,
        value: '',
        unit: p.unit,
        normalRange: p.normalRange.general || p.normalRange[gender as 'male' | 'female'] || '',
        status: 'normal' as const,
      }));
      setParameters(newParams);
    }
  };

  // Generate report data
  const generateReportData = (): LabReportData => {
    const hospitalName = getSetting('hospital_name', 'hospital') || 'Hospital Management System';
    const hospitalAddress = getSetting('hospital_address', 'hospital') || '123 Medical Center Drive';
    const hospitalPhone = getSetting('hospital_phone', 'hospital') || '+1 (555) 123-4567';
    const hospitalEmail = getSetting('hospital_email', 'hospital') || 'info@hospital.com';

    return {
      reportId: labTest?.id || '',
      reportNumber: labTest?.report_number || generateReportNumber(),
      patient: {
        name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
        age: patient ? calculateAge(patient.date_of_birth) : 0,
        gender: patient?.gender || 'Unknown',
        id: patient?.id.substring(0, 8).toUpperCase() || 'N/A',
        phone: patient?.phone,
      },
      doctor: {
        name: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Unknown Doctor',
        department: doctor?.department || doctor?.specialization,
      },
      testName: labTest?.test_name || 'Unknown Test',
      testType: labTest?.test_type || 'General',
      specimenType: specimenType || 'Not specified',
      collectionTime: collectionTime ? new Date(collectionTime) : new Date(),
      reportTime: new Date(),
      parameters,
      method: method || 'Standard Method',
      comments,
      technician: {
        name: user ? `${user.firstName} ${user.lastName}` : 'Lab Technician',
      },
      verifiedBy: verifiedBy ? { name: verifiedBy } : undefined,
      hospitalInfo: {
        name: hospitalName,
        address: hospitalAddress,
        phone: hospitalPhone,
        email: hospitalEmail,
      },
    };
  };

  // Save report
  const handleSave = async (finalize: boolean = false) => {
    if (!labTest) return;

    setSaving(true);
    try {
      const reportNumber = labTest.report_number || generateReportNumber();
      
      const updateData: Record<string, unknown> = {
        test_parameters: parameters,
        specimen_type: specimenType,
        method_used: method,
        comments,
        verified_by: verifiedBy || null,
        specimen_collection_time: collectionTime || null,
        report_number: reportNumber,
        reporting_time: new Date().toISOString(),
        is_report_finalized: finalize,
        lab_technician: user ? `${user.firstName} ${user.lastName}` : null,
      };

      if (finalize) {
        updateData.status = 'completed';
        updateData.results = parameters.map(p => `${p.name}: ${p.value} ${p.unit}`).join('; ');
      }

      const { error } = await supabase
        .from('lab_tests')
        .update(updateData)
        .eq('id', labTest.id);

      if (error) throw error;

      toast({
        title: finalize ? 'Report Finalized' : 'Report Saved',
        description: finalize 
          ? 'The lab report has been finalized and marked as complete.'
          : 'Draft saved successfully.',
      });

      onSave();
      if (finalize) {
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save report',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate PDF
  const handleGeneratePDF = () => {
    const reportData = generateReportData();
    const doc = generateLabReportPDF(reportData);
    downloadLabReport(doc, reportData.reportNumber);
  };

  // Print report
  const handlePrint = () => {
    const reportData = generateReportData();
    const doc = generateLabReportPDF(reportData);
    printLabReport(doc);
  };

  if (!labTest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Lab Report Editor
          </DialogTitle>
          <DialogDescription>
            Create and customize the lab report for {labTest.test_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient & Test Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Name:</span> <strong>{patient?.first_name} {patient?.last_name}</strong></p>
                <p><span className="text-muted-foreground">Age:</span> {patient ? calculateAge(patient.date_of_birth) : 'N/A'} years</p>
                <p><span className="text-muted-foreground">Gender:</span> {patient?.gender}</p>
                <p><span className="text-muted-foreground">ID:</span> {patient?.id.substring(0, 8).toUpperCase()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Test:</span> <strong>{labTest.test_name}</strong></p>
                <p><span className="text-muted-foreground">Referring Doctor:</span> Dr. {doctor?.first_name} {doctor?.last_name}</p>
                <p><span className="text-muted-foreground">Priority:</span> <Badge variant={labTest.priority === 'urgent' ? 'destructive' : 'secondary'}>{labTest.priority}</Badge></p>
                <p><span className="text-muted-foreground">Report #:</span> {labTest.report_number || 'Will be generated'}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Use Template (Optional)
            </Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a test template to auto-fill parameters..." />
              </SelectTrigger>
              <SelectContent>
                {labReportTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sample Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Specimen Type</Label>
              <Input
                value={specimenType}
                onChange={(e) => setSpecimenType(e.target.value)}
                placeholder="e.g., Whole Blood (EDTA)"
              />
            </div>
            <div className="space-y-2">
              <Label>Collection Date/Time</Label>
              <Input
                type="datetime-local"
                value={collectionTime}
                onChange={(e) => setCollectionTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Method/Equipment</Label>
              <Input
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                placeholder="e.g., Automated Cell Counter"
              />
            </div>
          </div>

          <Separator />

          {/* Test Parameters Table */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Test Parameters & Results
            </Label>
            <TestParameterTable
              parameters={parameters}
              onChange={setParameters}
              readOnly={previewMode}
            />
          </div>

          <Separator />

          {/* Comments */}
          <div className="space-y-2">
            <Label>Clinical Comments / Interpretation</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter clinical interpretation, recommendations, or additional notes..."
              rows={3}
            />
          </div>

          {/* Verification */}
          <div className="space-y-2">
            <Label>Verified By (Pathologist Name)</Label>
            <Input
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              placeholder="Enter pathologist name for verification"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            <Button variant="outline" onClick={handleGeneratePDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving || parameters.length === 0}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalize Report
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LabReportEditor;
