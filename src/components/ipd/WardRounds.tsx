import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  Plus, Search, Stethoscope, Calendar, Clock,
  AlertTriangle, Activity, User, FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WardRound {
  id: string;
  admission_id: string;
  doctor_id: string;
  round_date: string;
  round_type: string;
  patient_condition: string;
  vitals: any;
  subjective_notes: string | null;
  objective_notes: string | null;
  assessment: string | null;
  plan: string | null;
  medication_changes: string | null;
  next_review_date: string | null;
  admission?: {
    admission_number: string;
    patient: { first_name: string; last_name: string; };
  };
  doctor?: { first_name: string; last_name: string; };
}

const conditionColors: Record<string, string> = {
  critical: 'destructive',
  serious: 'destructive',
  stable: 'default',
  improving: 'default',
  deteriorating: 'destructive',
};

const WardRounds: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rounds, setRounds] = useState<WardRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeAdmissions, setActiveAdmissions] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    admission_id: '',
    doctor_id: '',
    round_type: 'routine',
    patient_condition: 'stable',
    bp_systolic: '',
    bp_diastolic: '',
    heart_rate: '',
    temperature: '',
    spo2: '',
    respiratory_rate: '',
    subjective_notes: '',
    objective_notes: '',
    assessment: '',
    plan: '',
    medication_changes: '',
    next_review_date: '',
  });

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ward_rounds')
        .select(`
          *,
          admission:ipd_admissions(admission_number, patient:patients(first_name, last_name)),
          doctor:doctors(first_name, last_name)
        `)
        .order('round_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRounds((data as any) || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchLookups = useCallback(async () => {
    const [admRes, docRes] = await Promise.all([
      supabase
        .from('ipd_admissions')
        .select('id, admission_number, patient:patients(first_name, last_name)')
        .in('status', ['admitted', 'under_treatment'])
        .order('admission_date', { ascending: false }),
      supabase.from('doctors').select('id, first_name, last_name').eq('status', 'active').order('first_name'),
    ]);
    setActiveAdmissions((admRes.data as any) || []);
    setDoctors(docRes.data || []);
  }, []);

  useEffect(() => { fetchRounds(); }, [fetchRounds]);
  useEffect(() => { fetchLookups(); }, [fetchLookups]);

  const handleSubmit = async () => {
    if (!formData.admission_id || !formData.doctor_id) {
      toast({ title: 'Validation Error', description: 'Admission and Doctor are required', variant: 'destructive' });
      return;
    }

    const vitals: any = {};
    if (formData.bp_systolic) vitals.bp_systolic = Number(formData.bp_systolic);
    if (formData.bp_diastolic) vitals.bp_diastolic = Number(formData.bp_diastolic);
    if (formData.heart_rate) vitals.heart_rate = Number(formData.heart_rate);
    if (formData.temperature) vitals.temperature = Number(formData.temperature);
    if (formData.spo2) vitals.spo2 = Number(formData.spo2);
    if (formData.respiratory_rate) vitals.respiratory_rate = Number(formData.respiratory_rate);

    try {
      const { error } = await supabase.from('ward_rounds').insert({
        admission_id: formData.admission_id,
        doctor_id: formData.doctor_id,
        round_type: formData.round_type,
        patient_condition: formData.patient_condition,
        vitals: Object.keys(vitals).length > 0 ? vitals : null,
        subjective_notes: formData.subjective_notes || null,
        objective_notes: formData.objective_notes || null,
        assessment: formData.assessment || null,
        plan: formData.plan || null,
        medication_changes: formData.medication_changes || null,
        next_review_date: formData.next_review_date || null,
      });

      if (error) throw error;

      toast({ title: 'Ward Round Recorded', description: 'Round notes saved successfully' });
      setShowAddDialog(false);
      setFormData({
        admission_id: '', doctor_id: '', round_type: 'routine', patient_condition: 'stable',
        bp_systolic: '', bp_diastolic: '', heart_rate: '', temperature: '',
        spo2: '', respiratory_rate: '', subjective_notes: '', objective_notes: '',
        assessment: '', plan: '', medication_changes: '', next_review_date: '',
      });
      fetchRounds();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Ward Rounds</h2>
          <p className="text-sm text-muted-foreground">Daily patient assessment and SOAP notes</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Round
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="animate-pulse h-24 bg-muted rounded" /></CardContent></Card>
          ))
        ) : rounds.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No ward rounds recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          rounds.map((round) => (
            <Card key={round.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        {round.admission?.admission_number}
                      </Badge>
                      <Badge variant={conditionColors[round.patient_condition] as any || 'secondary'}>
                        {round.patient_condition.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">{round.round_type}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(round.round_date), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {round.admission?.patient?.first_name} {round.admission?.patient?.last_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3 text-muted-foreground" />
                      Dr. {round.doctor?.first_name} {round.doctor?.last_name}
                    </span>
                  </div>

                  {/* Vitals summary */}
                  {round.vitals && (
                    <div className="flex flex-wrap gap-3 text-xs">
                      {round.vitals.bp_systolic && (
                        <span className="px-2 py-1 bg-muted rounded">
                          BP: {round.vitals.bp_systolic}/{round.vitals.bp_diastolic}
                        </span>
                      )}
                      {round.vitals.heart_rate && (
                        <span className="px-2 py-1 bg-muted rounded">HR: {round.vitals.heart_rate}</span>
                      )}
                      {round.vitals.temperature && (
                        <span className="px-2 py-1 bg-muted rounded">Temp: {round.vitals.temperature}°F</span>
                      )}
                      {round.vitals.spo2 && (
                        <span className="px-2 py-1 bg-muted rounded">SpO2: {round.vitals.spo2}%</span>
                      )}
                    </div>
                  )}

                  {/* SOAP notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {round.subjective_notes && (
                      <div><span className="font-medium text-primary">S:</span> {round.subjective_notes}</div>
                    )}
                    {round.objective_notes && (
                      <div><span className="font-medium text-primary">O:</span> {round.objective_notes}</div>
                    )}
                    {round.assessment && (
                      <div><span className="font-medium text-primary">A:</span> {round.assessment}</div>
                    )}
                    {round.plan && (
                      <div><span className="font-medium text-primary">P:</span> {round.plan}</div>
                    )}
                  </div>

                  {round.medication_changes && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Medication Change: {round.medication_changes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Round Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Record Ward Round
            </DialogTitle>
            <DialogDescription>Document patient assessment with SOAP format</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Admission *</Label>
              <Select value={formData.admission_id} onValueChange={(v) => setFormData({ ...formData, admission_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select admission" /></SelectTrigger>
                <SelectContent>
                  {activeAdmissions.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.admission_number} - {a.patient?.first_name} {a.patient?.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Doctor *</Label>
              <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Round Type</Label>
              <Select value={formData.round_type} onValueChange={(v) => setFormData({ ...formData, round_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="night">Night Round</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Patient Condition</Label>
              <Select value={formData.patient_condition} onValueChange={(v) => setFormData({ ...formData, patient_condition: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="improving">Improving</SelectItem>
                  <SelectItem value="deteriorating">Deteriorating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vitals */}
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold flex items-center gap-1 mb-3">
                <Activity className="h-4 w-4" /> Vitals
              </Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <div>
                  <Label className="text-xs">BP Sys</Label>
                  <Input type="number" placeholder="120" value={formData.bp_systolic}
                    onChange={(e) => setFormData({ ...formData, bp_systolic: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">BP Dia</Label>
                  <Input type="number" placeholder="80" value={formData.bp_diastolic}
                    onChange={(e) => setFormData({ ...formData, bp_diastolic: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">HR</Label>
                  <Input type="number" placeholder="72" value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Temp °F</Label>
                  <Input type="number" step="0.1" placeholder="98.6" value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">SpO2 %</Label>
                  <Input type="number" placeholder="98" value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">RR</Label>
                  <Input type="number" placeholder="16" value={formData.respiratory_rate}
                    onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })} />
                </div>
              </div>
            </div>

            {/* SOAP Notes */}
            <div className="space-y-2">
              <Label>Subjective (S)</Label>
              <Textarea value={formData.subjective_notes} rows={2}
                onChange={(e) => setFormData({ ...formData, subjective_notes: e.target.value })}
                placeholder="Patient complaints, symptoms..." />
            </div>
            <div className="space-y-2">
              <Label>Objective (O)</Label>
              <Textarea value={formData.objective_notes} rows={2}
                onChange={(e) => setFormData({ ...formData, objective_notes: e.target.value })}
                placeholder="Examination findings..." />
            </div>
            <div className="space-y-2">
              <Label>Assessment (A)</Label>
              <Textarea value={formData.assessment} rows={2}
                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                placeholder="Clinical assessment, diagnosis..." />
            </div>
            <div className="space-y-2">
              <Label>Plan (P)</Label>
              <Textarea value={formData.plan} rows={2}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                placeholder="Treatment plan, investigations..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Medication Changes</Label>
              <Textarea value={formData.medication_changes} rows={2}
                onChange={(e) => setFormData({ ...formData, medication_changes: e.target.value })}
                placeholder="Any changes to medications..." />
            </div>

            <div className="space-y-2">
              <Label>Next Review Date</Label>
              <Input type="datetime-local" value={formData.next_review_date}
                onChange={(e) => setFormData({ ...formData, next_review_date: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              <FileText className="h-4 w-4 mr-2" />
              Save Round
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardRounds;
