import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  Plus, FileOutput, Calendar, CheckCircle, Clock,
  User, Stethoscope, Printer, FileText, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DischargeSummary {
  id: string;
  admission_id: string;
  discharge_date: string;
  discharge_type: string;
  diagnosis_at_discharge: string;
  treatment_summary: string;
  course_in_hospital: string | null;
  condition_at_discharge: string;
  follow_up_instructions: string | null;
  follow_up_date: string | null;
  medications_at_discharge: any;
  diet_advice: string | null;
  activity_restrictions: string | null;
  warning_signs: string | null;
  status: string;
  admission?: {
    admission_number: string;
    admission_date: string;
    patient: { first_name: string; last_name: string; };
    doctor: { first_name: string; last_name: string; };
  };
}

const statusColors: Record<string, string> = {
  draft: 'secondary',
  pending_approval: 'outline',
  approved: 'default',
  finalized: 'default',
};

const DischargeSummaries: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<DischargeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [dischargeableAdmissions, setDischargeableAdmissions] = useState<any[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<DischargeSummary | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const [formData, setFormData] = useState({
    admission_id: '',
    discharge_type: 'normal',
    diagnosis_at_discharge: '',
    treatment_summary: '',
    course_in_hospital: '',
    condition_at_discharge: 'stable',
    follow_up_instructions: '',
    follow_up_date: '',
    diet_advice: '',
    activity_restrictions: '',
    warning_signs: '',
  });

  const fetchSummaries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discharge_summaries')
        .select(`
          *,
          admission:ipd_admissions(
            admission_number, admission_date,
            patient:patients(first_name, last_name),
            doctor:doctors(first_name, last_name)
          )
        `)
        .order('discharge_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSummaries((data as any) || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchDischargeableAdmissions = useCallback(async () => {
    const { data } = await supabase
      .from('ipd_admissions')
      .select('id, admission_number, patient:patients(first_name, last_name)')
      .in('status', ['ready_for_discharge', 'discharged', 'under_treatment'])
      .order('admission_date', { ascending: false });
    setDischargeableAdmissions((data as any) || []);
  }, []);

  useEffect(() => { fetchSummaries(); }, [fetchSummaries]);
  useEffect(() => { fetchDischargeableAdmissions(); }, [fetchDischargeableAdmissions]);

  const handleCreate = async () => {
    if (!formData.admission_id || !formData.diagnosis_at_discharge || !formData.treatment_summary) {
      toast({ title: 'Validation Error', description: 'Admission, Diagnosis, and Treatment Summary are required', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('discharge_summaries').insert({
        admission_id: formData.admission_id,
        prepared_by: user?.id || '',
        discharge_type: formData.discharge_type,
        diagnosis_at_discharge: formData.diagnosis_at_discharge,
        treatment_summary: formData.treatment_summary,
        course_in_hospital: formData.course_in_hospital || null,
        condition_at_discharge: formData.condition_at_discharge,
        follow_up_instructions: formData.follow_up_instructions || null,
        follow_up_date: formData.follow_up_date || null,
        diet_advice: formData.diet_advice || null,
        activity_restrictions: formData.activity_restrictions || null,
        warning_signs: formData.warning_signs || null,
        status: 'draft',
      });

      if (error) throw error;

      toast({ title: 'Discharge Summary Created', description: 'Summary saved as draft' });
      setShowCreateDialog(false);
      setFormData({
        admission_id: '', discharge_type: 'normal', diagnosis_at_discharge: '',
        treatment_summary: '', course_in_hospital: '', condition_at_discharge: 'stable',
        follow_up_instructions: '', follow_up_date: '', diet_advice: '',
        activity_restrictions: '', warning_signs: '',
      });
      fetchSummaries();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('discharge_summaries').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Status Updated' });
      fetchSummaries();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handlePrint = (summary: DischargeSummary) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Discharge Summary - ${summary.admission?.admission_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section { margin: 15px 0; }
        .section h3 { color: #333; margin-bottom: 5px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .field { margin: 5px 0; }
        .label { font-weight: bold; color: #555; }
        .warning { color: #d32f2f; font-weight: bold; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <h1>DISCHARGE SUMMARY</h1>
        <div class="grid">
          <div class="field"><span class="label">Admission #:</span> ${summary.admission?.admission_number || 'N/A'}</div>
          <div class="field"><span class="label">Discharge Date:</span> ${format(new Date(summary.discharge_date), 'MMM dd, yyyy')}</div>
          <div class="field"><span class="label">Patient:</span> ${summary.admission?.patient?.first_name || ''} ${summary.admission?.patient?.last_name || ''}</div>
          <div class="field"><span class="label">Doctor:</span> Dr. ${summary.admission?.doctor?.first_name || ''} ${summary.admission?.doctor?.last_name || ''}</div>
          <div class="field"><span class="label">Discharge Type:</span> ${summary.discharge_type}</div>
          <div class="field"><span class="label">Condition:</span> ${summary.condition_at_discharge}</div>
        </div>
        <div class="section"><h3>Diagnosis at Discharge</h3><p>${summary.diagnosis_at_discharge}</p></div>
        <div class="section"><h3>Treatment Summary</h3><p>${summary.treatment_summary}</p></div>
        ${summary.course_in_hospital ? `<div class="section"><h3>Course in Hospital</h3><p>${summary.course_in_hospital}</p></div>` : ''}
        ${summary.follow_up_instructions ? `<div class="section"><h3>Follow-up Instructions</h3><p>${summary.follow_up_instructions}</p></div>` : ''}
        ${summary.follow_up_date ? `<div class="section"><h3>Follow-up Date</h3><p>${format(new Date(summary.follow_up_date), 'MMM dd, yyyy')}</p></div>` : ''}
        ${summary.diet_advice ? `<div class="section"><h3>Diet Advice</h3><p>${summary.diet_advice}</p></div>` : ''}
        ${summary.activity_restrictions ? `<div class="section"><h3>Activity Restrictions</h3><p>${summary.activity_restrictions}</p></div>` : ''}
        ${summary.warning_signs ? `<div class="section"><h3 class="warning">⚠ Warning Signs - When to Contact Hospital</h3><p>${summary.warning_signs}</p></div>` : ''}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Discharge Summaries</h2>
          <p className="text-sm text-muted-foreground">Create and manage patient discharge documentation</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Summary
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="animate-pulse h-20 bg-muted rounded" /></CardContent></Card>
          ))
        ) : summaries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileOutput className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No discharge summaries yet</p>
            </CardContent>
          </Card>
        ) : (
          summaries.map((summary) => (
            <Card key={summary.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        {summary.admission?.admission_number}
                      </Badge>
                      <Badge variant={statusColors[summary.status] as any || 'secondary'}>
                        {summary.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">{summary.discharge_type}</Badge>
                      <Badge variant={summary.condition_at_discharge === 'improved' ? 'default' : 'secondary'} className="capitalize">
                        {summary.condition_at_discharge}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {summary.admission?.patient?.first_name} {summary.admission?.patient?.last_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(summary.discharge_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      <span className="font-medium">Dx:</span> {summary.diagnosis_at_discharge}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedSummary(summary); setShowViewDialog(true); }}>
                      <FileText className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrint(summary)}>
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                    {summary.status === 'draft' && (
                      <Button size="sm" onClick={() => updateStatus(summary.id, 'pending_approval')}>
                        Submit for Approval
                      </Button>
                    )}
                    {summary.status === 'pending_approval' && (
                      <Button size="sm" onClick={() => updateStatus(summary.id, 'approved')}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    )}
                    {summary.status === 'approved' && (
                      <Button size="sm" onClick={() => updateStatus(summary.id, 'finalized')}>
                        Finalize
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Discharge Summary</DialogTitle>
          </DialogHeader>
          {selectedSummary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-muted-foreground">Admission #:</span> {selectedSummary.admission?.admission_number}</div>
                <div><span className="font-medium text-muted-foreground">Date:</span> {format(new Date(selectedSummary.discharge_date), 'MMM dd, yyyy')}</div>
                <div><span className="font-medium text-muted-foreground">Patient:</span> {selectedSummary.admission?.patient?.first_name} {selectedSummary.admission?.patient?.last_name}</div>
                <div><span className="font-medium text-muted-foreground">Doctor:</span> Dr. {selectedSummary.admission?.doctor?.first_name} {selectedSummary.admission?.doctor?.last_name}</div>
                <div><span className="font-medium text-muted-foreground">Type:</span> <span className="capitalize">{selectedSummary.discharge_type}</span></div>
                <div><span className="font-medium text-muted-foreground">Condition:</span> <span className="capitalize">{selectedSummary.condition_at_discharge}</span></div>
              </div>
              <div className="space-y-3">
                <div><h4 className="font-semibold text-sm">Diagnosis at Discharge</h4><p className="text-sm text-muted-foreground">{selectedSummary.diagnosis_at_discharge}</p></div>
                <div><h4 className="font-semibold text-sm">Treatment Summary</h4><p className="text-sm text-muted-foreground">{selectedSummary.treatment_summary}</p></div>
                {selectedSummary.course_in_hospital && <div><h4 className="font-semibold text-sm">Course in Hospital</h4><p className="text-sm text-muted-foreground">{selectedSummary.course_in_hospital}</p></div>}
                {selectedSummary.follow_up_instructions && <div><h4 className="font-semibold text-sm">Follow-up Instructions</h4><p className="text-sm text-muted-foreground">{selectedSummary.follow_up_instructions}</p></div>}
                {selectedSummary.diet_advice && <div><h4 className="font-semibold text-sm">Diet Advice</h4><p className="text-sm text-muted-foreground">{selectedSummary.diet_advice}</p></div>}
                {selectedSummary.activity_restrictions && <div><h4 className="font-semibold text-sm">Activity Restrictions</h4><p className="text-sm text-muted-foreground">{selectedSummary.activity_restrictions}</p></div>}
                {selectedSummary.warning_signs && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <h4 className="font-semibold text-sm flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Warning Signs
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedSummary.warning_signs}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileOutput className="h-5 w-5" />
              Create Discharge Summary
            </DialogTitle>
            <DialogDescription>Prepare discharge documentation for the patient</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Admission *</Label>
              <Select value={formData.admission_id} onValueChange={(v) => setFormData({ ...formData, admission_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select admission" /></SelectTrigger>
                <SelectContent>
                  {dischargeableAdmissions.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.admission_number} - {a.patient?.first_name} {a.patient?.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discharge Type</Label>
              <Select value={formData.discharge_type} onValueChange={(v) => setFormData({ ...formData, discharge_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lama">LAMA (Against Medical Advice)</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="absconded">Absconded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Diagnosis at Discharge *</Label>
              <Textarea value={formData.diagnosis_at_discharge} rows={2}
                onChange={(e) => setFormData({ ...formData, diagnosis_at_discharge: e.target.value })}
                placeholder="Final diagnosis..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Treatment Summary *</Label>
              <Textarea value={formData.treatment_summary} rows={3}
                onChange={(e) => setFormData({ ...formData, treatment_summary: e.target.value })}
                placeholder="Summary of treatment provided..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Course in Hospital</Label>
              <Textarea value={formData.course_in_hospital} rows={3}
                onChange={(e) => setFormData({ ...formData, course_in_hospital: e.target.value })}
                placeholder="Detailed course during hospital stay..." />
            </div>

            <div className="space-y-2">
              <Label>Condition at Discharge</Label>
              <Select value={formData.condition_at_discharge} onValueChange={(v) => setFormData({ ...formData, condition_at_discharge: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="improved">Improved</SelectItem>
                  <SelectItem value="unchanged">Unchanged</SelectItem>
                  <SelectItem value="deteriorated">Deteriorated</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Input type="date" value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Follow-up Instructions</Label>
              <Textarea value={formData.follow_up_instructions} rows={2}
                onChange={(e) => setFormData({ ...formData, follow_up_instructions: e.target.value })}
                placeholder="Instructions for follow-up visits..." />
            </div>

            <div className="space-y-2">
              <Label>Diet Advice</Label>
              <Textarea value={formData.diet_advice} rows={2}
                onChange={(e) => setFormData({ ...formData, diet_advice: e.target.value })}
                placeholder="Dietary recommendations..." />
            </div>

            <div className="space-y-2">
              <Label>Activity Restrictions</Label>
              <Textarea value={formData.activity_restrictions} rows={2}
                onChange={(e) => setFormData({ ...formData, activity_restrictions: e.target.value })}
                placeholder="Physical activity limitations..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Warning Signs</Label>
              <Textarea value={formData.warning_signs} rows={2}
                onChange={(e) => setFormData({ ...formData, warning_signs: e.target.value })}
                placeholder="When to contact hospital immediately..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate}>
              <FileOutput className="h-4 w-4 mr-2" />
              Create Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DischargeSummaries;
