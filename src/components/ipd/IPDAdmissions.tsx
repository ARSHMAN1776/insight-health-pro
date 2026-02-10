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
  Plus, Search, UserPlus, Calendar, Bed, AlertTriangle, 
  Clock, CheckCircle, User, Stethoscope, Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Admission {
  id: string;
  admission_number: string;
  patient_id: string;
  doctor_id: string;
  department_id: string | null;
  admission_date: string;
  expected_discharge_date: string | null;
  actual_discharge_date: string | null;
  admission_type: string;
  admission_reason: string;
  diagnosis_at_admission: string | null;
  status: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string | null;
  diet_instructions: string | null;
  special_instructions: string | null;
  patient?: { first_name: string; last_name: string; };
  doctor?: { first_name: string; last_name: string; specialization: string; };
  department?: { department_name: string; };
}

const statusColors: Record<string, string> = {
  admitted: 'default',
  under_treatment: 'secondary',
  ready_for_discharge: 'outline',
  discharged: 'default',
  transferred: 'secondary',
  deceased: 'destructive',
  lama: 'destructive',
};

const IPDAdmissions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showAdmitDialog, setShowAdmitDialog] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    department_id: '',
    admission_type: 'planned',
    admission_reason: '',
    diagnosis_at_admission: '',
    expected_discharge_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    allergies: '',
    diet_instructions: '',
    special_instructions: '',
  });

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ipd_admissions')
        .select(`
          *,
          patient:patients(first_name, last_name),
          doctor:doctors(first_name, last_name, specialization),
          department:departments(department_name)
        `)
        .order('admission_date', { ascending: false });

      if (statusFilter === 'active') {
        query = query.in('status', ['admitted', 'under_treatment', 'ready_for_discharge']);
      } else if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setAdmissions((data as any) || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchLookups = useCallback(async () => {
    const [pRes, dRes, depRes] = await Promise.all([
      supabase.from('patients').select('id, first_name, last_name').order('first_name').limit(200),
      supabase.from('doctors').select('id, first_name, last_name, specialization').eq('status', 'active').order('first_name'),
      supabase.from('departments').select('department_id, department_name').eq('status', 'active').order('department_name'),
    ]);
    setPatients(pRes.data || []);
    setDoctors(dRes.data || []);
    setDepartments(depRes.data || []);
  }, []);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);
  useEffect(() => { fetchLookups(); }, [fetchLookups]);

  const handleAdmit = async () => {
    if (!formData.patient_id || !formData.doctor_id || !formData.admission_reason) {
      toast({ title: 'Validation Error', description: 'Patient, Doctor, and Reason are required', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('ipd_admissions').insert({
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        department_id: formData.department_id || null,
        admission_type: formData.admission_type,
        admission_reason: formData.admission_reason,
        diagnosis_at_admission: formData.diagnosis_at_admission || null,
        expected_discharge_date: formData.expected_discharge_date || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
        allergies: formData.allergies || null,
        diet_instructions: formData.diet_instructions || null,
        special_instructions: formData.special_instructions || null,
        admission_number: '',
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: 'Patient Admitted', description: 'IPD admission created successfully' });
      setShowAdmitDialog(false);
      setFormData({
        patient_id: '', doctor_id: '', department_id: '', admission_type: 'planned',
        admission_reason: '', diagnosis_at_admission: '', expected_discharge_date: '',
        emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
        allergies: '', diet_instructions: '', special_instructions: '',
      });
      fetchAdmissions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'discharged') {
        updateData.actual_discharge_date = new Date().toISOString();
      }
      const { error } = await supabase.from('ipd_admissions').update(updateData).eq('id', id);
      if (error) throw error;
      toast({ title: 'Status Updated' });
      fetchAdmissions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filtered = admissions.filter(a => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.admission_number?.toLowerCase().includes(term) ||
      a.patient?.first_name?.toLowerCase().includes(term) ||
      a.patient?.last_name?.toLowerCase().includes(term) ||
      a.doctor?.first_name?.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: admissions.length,
    admitted: admissions.filter(a => a.status === 'admitted').length,
    underTreatment: admissions.filter(a => a.status === 'under_treatment').length,
    readyForDischarge: admissions.filter(a => a.status === 'ready_for_discharge').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admitted}</p>
              <p className="text-xs text-muted-foreground">Admitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.underTreatment}</p>
              <p className="text-xs text-muted-foreground">Under Treatment</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.readyForDischarge}</p>
              <p className="text-xs text-muted-foreground">Ready to Discharge</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, doctor, or admission #"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="under_treatment">Under Treatment</SelectItem>
              <SelectItem value="ready_for_discharge">Ready for Discharge</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAdmitDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Admission
        </Button>
      </div>

      {/* Admissions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="p-6"><div className="animate-pulse h-20 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bed className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No admissions found</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((admission) => (
            <Card key={admission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        {admission.admission_number}
                      </Badge>
                      <Badge variant={statusColors[admission.status] as any || 'secondary'}>
                        {admission.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {admission.admission_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {admission.patient?.first_name} {admission.patient?.last_name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" />
                        Dr. {admission.doctor?.first_name} {admission.doctor?.last_name}
                      </span>
                      {admission.department?.department_name && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {admission.department.department_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(admission.admission_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {admission.diagnosis_at_admission && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Diagnosis:</span> {admission.diagnosis_at_admission}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {admission.status === 'admitted' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(admission.id, 'under_treatment')}>
                        Start Treatment
                      </Button>
                    )}
                    {admission.status === 'under_treatment' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(admission.id, 'ready_for_discharge')}>
                        Ready for Discharge
                      </Button>
                    )}
                    {admission.status === 'ready_for_discharge' && (
                      <Button size="sm" onClick={() => updateStatus(admission.id, 'discharged')}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Discharge
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Admit Dialog */}
      <Dialog open={showAdmitDialog} onOpenChange={setShowAdmitDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              New IPD Admission
            </DialogTitle>
            <DialogDescription>Admit a patient to inpatient care</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Attending Doctor *</Label>
              <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.specialization}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.department_id} value={d.department_id}>{d.department_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admission Type *</Label>
              <Select value={formData.admission_type} onValueChange={(v) => setFormData({ ...formData, admission_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Reason for Admission *</Label>
              <Textarea
                value={formData.admission_reason}
                onChange={(e) => setFormData({ ...formData, admission_reason: e.target.value })}
                placeholder="Describe reason for admission..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Diagnosis at Admission</Label>
              <Input
                value={formData.diagnosis_at_admission}
                onChange={(e) => setFormData({ ...formData, diagnosis_at_admission: e.target.value })}
                placeholder="Initial diagnosis"
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Discharge Date</Label>
              <Input
                type="date"
                value={formData.expected_discharge_date}
                onChange={(e) => setFormData({ ...formData, expected_discharge_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                placeholder="Contact name"
              />
            </div>

            <div className="space-y-2">
              <Label>Emergency Contact Phone</Label>
              <Input
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Known Allergies</Label>
              <Input
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="List known allergies"
              />
            </div>

            <div className="space-y-2">
              <Label>Diet Instructions</Label>
              <Input
                value={formData.diet_instructions}
                onChange={(e) => setFormData({ ...formData, diet_instructions: e.target.value })}
                placeholder="e.g., Diabetic diet, Soft diet"
              />
            </div>

            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Input
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                placeholder="Any special care instructions"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdmitDialog(false)}>Cancel</Button>
            <Button onClick={handleAdmit}>
              <UserPlus className="h-4 w-4 mr-2" />
              Admit Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPDAdmissions;
