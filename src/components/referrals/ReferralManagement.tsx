import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '@/components/shared/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useReferrals, Referral } from '@/hooks/useReferrals';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Stethoscope,
  Building2,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

const ReferralManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    referrals, 
    loading, 
    fetchReferrals, 
    createReferral, 
    acceptReferral, 
    declineReferral,
    completeReferral,
    cancelReferral,
    getUrgencyColor, 
    getStatusColor 
  } = useReferrals();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    receiving_doctor_id: '',
    receiving_department_id: '',
    urgency: 'routine' as 'routine' | 'urgent' | 'emergency',
    reason: '',
    clinical_notes: '',
    diagnosis: ''
  });

  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch patients, doctors, departments
      const [patientsRes, doctorsRes, departmentsRes] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name').eq('status', 'active'),
        supabase.from('doctors').select('id, first_name, last_name, specialization').eq('status', 'active'),
        supabase.from('departments').select('department_id, department_name').eq('status', 'Active')
      ]);

      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setDepartments(departmentsRes.data || []);

      // Get current doctor ID if user is a doctor
      if (user?.id) {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (doctorData) {
          setCurrentDoctorId(doctorData.id);
        }
      }

      fetchReferrals();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentDoctorId) {
      toast({ title: 'Error', description: 'Doctor profile not found', variant: 'destructive' });
      return;
    }

    try {
      await createReferral({
        ...formData,
        referring_doctor_id: currentDoctorId,
        receiving_doctor_id: formData.receiving_doctor_id || undefined,
        receiving_department_id: formData.receiving_department_id || undefined
      });
      
      toast({ title: 'Success', description: 'Referral created successfully' });
      setIsDialogOpen(false);
      resetForm();
      fetchReferrals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create referral', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      receiving_doctor_id: '',
      receiving_department_id: '',
      urgency: 'routine',
      reason: '',
      clinical_notes: '',
      diagnosis: ''
    });
  };

  const handleAccept = async () => {
    if (!selectedReferral) return;
    try {
      await acceptReferral(selectedReferral.id, responseNotes);
      toast({ title: 'Success', description: 'Referral accepted' });
      setIsResponseDialogOpen(false);
      setSelectedReferral(null);
      setResponseNotes('');
      fetchReferrals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to accept referral', variant: 'destructive' });
    }
  };

  const handleDecline = async () => {
    if (!selectedReferral || !responseNotes.trim()) {
      toast({ title: 'Error', description: 'Please provide a reason for declining', variant: 'destructive' });
      return;
    }
    try {
      await declineReferral(selectedReferral.id, responseNotes);
      toast({ title: 'Success', description: 'Referral declined' });
      setIsResponseDialogOpen(false);
      setSelectedReferral(null);
      setResponseNotes('');
      fetchReferrals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to decline referral', variant: 'destructive' });
    }
  };

  const handleComplete = async (referral: Referral) => {
    try {
      await completeReferral(referral.id);
      toast({ title: 'Success', description: 'Referral marked as completed' });
      fetchReferrals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to complete referral', variant: 'destructive' });
    }
  };

  const handleCancel = async (referral: Referral) => {
    try {
      await cancelReferral(referral.id);
      toast({ title: 'Success', description: 'Referral cancelled' });
      fetchReferrals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel referral', variant: 'destructive' });
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = 
      referral.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && referral.status === 'pending';
    if (activeTab === 'accepted') return matchesSearch && referral.status === 'accepted';
    if (activeTab === 'sent') return matchesSearch && referral.referring_doctor_id === currentDoctorId;
    if (activeTab === 'received') return matchesSearch && referral.receiving_doctor_id === currentDoctorId;
    return matchesSearch;
  });

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (referral: Referral) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{referral.patient?.first_name} {referral.patient?.last_name}</span>
        </div>
      )
    },
    {
      key: 'urgency',
      label: 'Urgency',
      render: (referral: Referral) => (
        <Badge className={getUrgencyColor(referral.urgency)}>
          {referral.urgency === 'emergency' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {referral.urgency.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'from_to',
      label: 'From → To',
      render: (referral: Referral) => (
        <div className="flex items-center gap-2 text-sm">
          <div className="text-muted-foreground">
            Dr. {referral.referring_doctor?.first_name} {referral.referring_doctor?.last_name}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div>
            {referral.receiving_doctor 
              ? `Dr. ${referral.receiving_doctor.first_name} ${referral.receiving_doctor.last_name}`
              : referral.receiving_department?.department_name || 'Pending Assignment'}
          </div>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (referral: Referral) => (
        <span className="truncate max-w-[200px] block">{referral.reason}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (referral: Referral) => (
        <Badge className={getStatusColor(referral.status)}>
          {referral.status.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (referral: Referral) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(referral.created_at), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (referral: Referral) => (
        <div className="flex gap-2">
          {referral.status === 'pending' && referral.receiving_doctor_id === currentDoctorId && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedReferral(referral);
                setIsResponseDialogOpen(true);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Respond
            </Button>
          )}
          {referral.status === 'accepted' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleComplete(referral)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
          {referral.status === 'pending' && referral.referring_doctor_id === currentDoctorId && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleCancel(referral)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    accepted: referrals.filter(r => r.status === 'accepted').length,
    completed: referrals.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Referral Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Referral
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Referral</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select 
                      value={formData.patient_id} 
                      onValueChange={(v) => setFormData({...formData, patient_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Urgency *</Label>
                    <Select 
                      value={formData.urgency} 
                      onValueChange={(v: 'routine' | 'urgent' | 'emergency') => setFormData({...formData, urgency: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Refer to Doctor</Label>
                    <Select 
                      value={formData.receiving_doctor_id} 
                      onValueChange={(v) => setFormData({...formData, receiving_doctor_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.id !== currentDoctorId).map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            Dr. {d.first_name} {d.last_name} - {d.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Or Department</Label>
                    <Select 
                      value={formData.receiving_department_id} 
                      onValueChange={(v) => setFormData({...formData, receiving_department_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (
                          <SelectItem key={d.department_id} value={d.department_id}>
                            {d.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input 
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="Current diagnosis"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reason for Referral *</Label>
                  <Textarea 
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Why is this referral needed?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Clinical Notes</Label>
                  <Textarea 
                    value={formData.clinical_notes}
                    onChange={(e) => setFormData({...formData, clinical_notes: e.target.value})}
                    placeholder="Relevant clinical information, history, test results..."
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!formData.patient_id || !formData.reason}>
                    Create Referral
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="sent">Sent by Me</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
              </TabsList>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search referrals..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              <DataTable 
                title=""
                data={filteredReferrals}
                columns={columns}
                searchable={false}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Referral</DialogTitle>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {selectedReferral.patient?.first_name} {selectedReferral.patient?.last_name}
                  </span>
                  <Badge className={getUrgencyColor(selectedReferral.urgency)}>
                    {selectedReferral.urgency}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedReferral.reason}</p>
                {selectedReferral.clinical_notes && (
                  <p className="text-sm">{selectedReferral.clinical_notes}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Response Notes</Label>
                <Textarea 
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Add notes about your response..."
                />
              </div>

              <DialogFooter className="gap-2">
                <Button variant="destructive" onClick={handleDecline}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button onClick={handleAccept}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferralManagement;
