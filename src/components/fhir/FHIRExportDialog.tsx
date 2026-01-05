import React, { useState } from 'react';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { patientToFHIR, generateCCD } from '@/lib/fhir/converter';

interface FHIRExportDialogProps {
  patientId: string;
  patientName: string;
}

export const FHIRExportDialog: React.FC<FHIRExportDialogProps> = ({
  patientId,
  patientName,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<'patient' | 'ccd'>('patient');
  const [includeOptions, setIncludeOptions] = useState({
    medicalRecords: true,
    prescriptions: true,
    labTests: true,
    vitals: true,
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch patient data
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError || !patient) {
        throw new Error('Failed to fetch patient data');
      }

      let fhirData: any;

      if (exportType === 'ccd') {
        // Fetch all related data for CCD
        const [
          { data: medicalRecords },
          { data: prescriptions },
          { data: labTests },
          { data: vitals },
        ] = await Promise.all([
          includeOptions.medicalRecords
            ? supabase.from('medical_records').select('*').eq('patient_id', patientId).is('deleted_at', null)
            : Promise.resolve({ data: [] }),
          includeOptions.prescriptions
            ? supabase.from('prescriptions').select('*').eq('patient_id', patientId).is('deleted_at', null)
            : Promise.resolve({ data: [] }),
          includeOptions.labTests
            ? supabase.from('lab_tests').select('*').eq('patient_id', patientId).is('deleted_at', null)
            : Promise.resolve({ data: [] }),
          includeOptions.vitals
            ? supabase.from('patient_vitals').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }).limit(10)
            : Promise.resolve({ data: [] }),
        ]);

        fhirData = generateCCD(
          patient,
          medicalRecords || [],
          prescriptions || [],
          labTests || [],
          vitals || []
        );
      } else {
        fhirData = {
          resourceType: 'Bundle',
          type: 'collection',
          timestamp: new Date().toISOString(),
          entry: [{
            fullUrl: `urn:uuid:${patient.id}`,
            resource: patientToFHIR(patient),
          }],
        };
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(fhirData, null, 2)], {
        type: 'application/fhir+json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patientName.replace(/\s+/g, '_')}_${exportType === 'ccd' ? 'CCD' : 'FHIR'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `FHIR ${exportType === 'ccd' ? 'CCD document' : 'patient data'} exported successfully`,
      });
      setOpen(false);
    } catch (error) {
      console.error('FHIR export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export FHIR data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileJson className="h-4 w-4 mr-2" />
          FHIR Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export FHIR Data</DialogTitle>
          <DialogDescription>
            Export patient data in FHIR R4 format for interoperability with other healthcare systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Export Type</Label>
            <RadioGroup value={exportType} onValueChange={(v) => setExportType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patient" id="patient" />
                <Label htmlFor="patient" className="font-normal cursor-pointer">
                  Patient Resource Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ccd" id="ccd" />
                <Label htmlFor="ccd" className="font-normal cursor-pointer">
                  CCD (Continuity of Care Document)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {exportType === 'ccd' && (
            <div className="space-y-3">
              <Label>Include in CCD</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medicalRecords"
                    checked={includeOptions.medicalRecords}
                    onCheckedChange={(checked) =>
                      setIncludeOptions({ ...includeOptions, medicalRecords: !!checked })
                    }
                  />
                  <Label htmlFor="medicalRecords" className="font-normal cursor-pointer">
                    Medical Records & Diagnoses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prescriptions"
                    checked={includeOptions.prescriptions}
                    onCheckedChange={(checked) =>
                      setIncludeOptions({ ...includeOptions, prescriptions: !!checked })
                    }
                  />
                  <Label htmlFor="prescriptions" className="font-normal cursor-pointer">
                    Prescriptions & Medications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="labTests"
                    checked={includeOptions.labTests}
                    onCheckedChange={(checked) =>
                      setIncludeOptions({ ...includeOptions, labTests: !!checked })
                    }
                  />
                  <Label htmlFor="labTests" className="font-normal cursor-pointer">
                    Lab Test Results
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vitals"
                    checked={includeOptions.vitals}
                    onCheckedChange={(checked) =>
                      setIncludeOptions({ ...includeOptions, vitals: !!checked })
                    }
                  />
                  <Label htmlFor="vitals" className="font-normal cursor-pointer">
                    Vital Signs (last 10 readings)
                  </Label>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About FHIR Export</p>
            <p>
              FHIR (Fast Healthcare Interoperability Resources) is an international standard for
              exchanging healthcare information electronically. The exported file can be imported
              into other FHIR-compliant healthcare systems.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FHIRExportDialog;
