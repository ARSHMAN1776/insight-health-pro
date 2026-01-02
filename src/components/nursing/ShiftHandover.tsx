import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { 
  ClipboardList, 
  Clock, 
  Users, 
  AlertTriangle,
  Plus,
  CheckCircle,
  ArrowRight,
  FileText,
  Pill,
  Wrench,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ShiftHandover {
  id: string;
  outgoing_nurse_id: string;
  incoming_nurse_id: string | null;
  shift_date: string;
  shift_type: string;
  handover_time: string;
  status: string;
  general_notes: string | null;
  critical_patients: string | null;
  pending_tasks: any;
  medication_notes: string | null;
  equipment_issues: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

interface HandoverPatient {
  id: string;
  handover_id: string;
  patient_id: string;
  room_number: string | null;
  bed_number: number | null;
  condition_summary: string | null;
  pending_medications: string | null;
  pending_tests: string | null;
  special_instructions: string | null;
  priority: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
}

interface RoomAssignment {
  id: string;
  patient_id: string;
  bed_number: number;
  patients: {
    id: string;
    first_name: string;
    last_name: string;
  };
  rooms: {
    room_number: string;
  };
}

const ShiftHandover: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [handovers, setHandovers] = useState<ShiftHandover[]>([]);
  const [pendingHandovers, setPendingHandovers] = useState<ShiftHandover[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState<ShiftHandover | null>(null);
  const [handoverPatients, setHandoverPatients] = useState<HandoverPatient[]>([]);
  const [admittedPatients, setAdmittedPatients] = useState<RoomAssignment[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    shift_type: '',
    general_notes: '',
    critical_patients: '',
    medication_notes: '',
    equipment_issues: '',
    pending_tasks: [] as { task: string; priority: string }[]
  });

  // Patient details form
  const [patientDetails, setPatientDetails] = useState<Record<string, {
    condition_summary: string;
    pending_medications: string;
    pending_tests: string;
    special_instructions: string;
    priority: string;
  }>>({});

  useEffect(() => {
    fetchHandovers();
    fetchAdmittedPatients();
  }, []);

  const fetchHandovers = async () => {
    try {
      const { data, error } = await supabase
        .from('shift_handovers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setHandovers(data || []);
      setPendingHandovers((data || []).filter(h => h.status === 'pending'));
    } catch (error) {
      console.error('Error fetching handovers:', error);
      toast({
        title: "Error",
        description: "Failed to load handover data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmittedPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('room_assignments')
        .select(`
          id,
          patient_id,
          bed_number,
          patients:patient_id(id, first_name, last_name),
          rooms:room_id(room_number)
        `)
        .eq('status', 'active');

      if (error) throw error;
      setAdmittedPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchHandoverPatients = async (handoverId: string) => {
    try {
      const { data, error } = await supabase
        .from('shift_handover_patients')
        .select(`
          *,
          patients:patient_id(first_name, last_name)
        `)
        .eq('handover_id', handoverId);

      if (error) throw error;
      setHandoverPatients(data || []);
    } catch (error) {
      console.error('Error fetching handover patients:', error);
    }
  };

  const handleCreateHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shift_type) {
      toast({
        title: "Error",
        description: "Please select a shift type",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create handover
      const { data: handover, error: handoverError } = await supabase
        .from('shift_handovers')
        .insert({
          outgoing_nurse_id: user?.id,
          shift_type: formData.shift_type,
          general_notes: formData.general_notes || null,
          critical_patients: formData.critical_patients || null,
          medication_notes: formData.medication_notes || null,
          equipment_issues: formData.equipment_issues || null,
          pending_tasks: formData.pending_tasks
        })
        .select()
        .single();

      if (handoverError) throw handoverError;

      // Create patient handover details
      if (selectedPatients.length > 0 && handover) {
        const patientRecords = selectedPatients.map(patientId => {
          const assignment = admittedPatients.find(a => a.patient_id === patientId);
          const details = patientDetails[patientId];
          
          return {
            handover_id: handover.id,
            patient_id: patientId,
            room_number: assignment?.rooms?.room_number || null,
            bed_number: assignment?.bed_number || null,
            condition_summary: details?.condition_summary || null,
            pending_medications: details?.pending_medications || null,
            pending_tests: details?.pending_tests || null,
            special_instructions: details?.special_instructions || null,
            priority: details?.priority || 'normal'
          };
        });

        const { error: patientsError } = await supabase
          .from('shift_handover_patients')
          .insert(patientRecords);

        if (patientsError) throw patientsError;
      }

      toast({
        title: "Success",
        description: "Shift handover created successfully"
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchHandovers();
    } catch (error) {
      console.error('Error creating handover:', error);
      toast({
        title: "Error",
        description: "Failed to create handover",
        variant: "destructive"
      });
    }
  };

  const handleAcknowledge = async (handoverId: string) => {
    try {
      const { error } = await supabase
        .from('shift_handovers')
        .update({
          incoming_nurse_id: user?.id,
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', handoverId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Handover acknowledged successfully"
      });

      fetchHandovers();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error acknowledging handover:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge handover",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      shift_type: '',
      general_notes: '',
      critical_patients: '',
      medication_notes: '',
      equipment_issues: '',
      pending_tasks: []
    });
    setSelectedPatients([]);
    setPatientDetails({});
  };

  const viewHandover = async (handover: ShiftHandover) => {
    setSelectedHandover(handover);
    await fetchHandoverPatients(handover.id);
    setIsViewDialogOpen(true);
  };

  const addPendingTask = () => {
    setFormData({
      ...formData,
      pending_tasks: [...formData.pending_tasks, { task: '', priority: 'normal' }]
    });
  };

  const updatePendingTask = (index: number, field: string, value: string) => {
    const updated = [...formData.pending_tasks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, pending_tasks: updated });
  };

  const removePendingTask = (index: number) => {
    setFormData({
      ...formData,
      pending_tasks: formData.pending_tasks.filter((_, i) => i !== index)
    });
  };

  const getShiftLabel = (type: string) => {
    switch (type) {
      case 'morning': return 'Morning Shift (7AM - 3PM)';
      case 'afternoon': return 'Afternoon Shift (3PM - 11PM)';
      case 'night': return 'Night Shift (11PM - 7AM)';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'acknowledged':
        return <Badge className="bg-success text-success-foreground">Acknowledged</Badge>;
      case 'completed':
        return <Badge className="bg-info text-info-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-warning text-warning-foreground">High</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Handover</h1>
          <p className="text-muted-foreground">Manage nursing shift transitions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-green hover:bg-medical-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Handover
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Shift Handover Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateHandover} className="space-y-6">
              {/* Shift Type */}
              <div className="space-y-2">
                <Label>Shift Type *</Label>
                <Select value={formData.shift_type} onValueChange={(val) => setFormData({...formData, shift_type: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning Shift (7AM - 3PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon Shift (3PM - 11PM)</SelectItem>
                    <SelectItem value="night">Night Shift (11PM - 7AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Critical Patients */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Critical Patients
                </Label>
                <Textarea 
                  placeholder="List any critical patients requiring immediate attention..."
                  value={formData.critical_patients}
                  onChange={(e) => setFormData({...formData, critical_patients: e.target.value})}
                  className="border-destructive/50"
                />
              </div>

              {/* Patient Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Patients to Hand Over
                </Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {admittedPatients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No admitted patients</p>
                  ) : (
                    admittedPatients.map((assignment) => (
                      <div key={assignment.patient_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`patient-${assignment.patient_id}`}
                          checked={selectedPatients.includes(assignment.patient_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPatients([...selectedPatients, assignment.patient_id]);
                            } else {
                              setSelectedPatients(selectedPatients.filter(id => id !== assignment.patient_id));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`patient-${assignment.patient_id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {assignment.patients?.first_name} {assignment.patients?.last_name} 
                          <span className="text-muted-foreground ml-2">
                            (Room {assignment.rooms?.room_number}, Bed {assignment.bed_number})
                          </span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Patient Details (if selected) */}
              {selectedPatients.length > 0 && (
                <div className="space-y-4">
                  <Label>Patient Details</Label>
                  {selectedPatients.map(patientId => {
                    const assignment = admittedPatients.find(a => a.patient_id === patientId);
                    const details = patientDetails[patientId] || {
                      condition_summary: '',
                      pending_medications: '',
                      pending_tests: '',
                      special_instructions: '',
                      priority: 'normal'
                    };

                    return (
                      <Card key={patientId} className="p-4">
                        <h4 className="font-medium mb-3">
                          {assignment?.patients?.first_name} {assignment?.patients?.last_name}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Condition Summary</Label>
                            <Textarea 
                              placeholder="Current condition..."
                              value={details.condition_summary}
                              onChange={(e) => setPatientDetails({
                                ...patientDetails,
                                [patientId]: { ...details, condition_summary: e.target.value }
                              })}
                              className="h-20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Priority</Label>
                            <Select 
                              value={details.priority}
                              onValueChange={(val) => setPatientDetails({
                                ...patientDetails,
                                [patientId]: { ...details, priority: val }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Pending Medications</Label>
                            <Input 
                              placeholder="Medications due..."
                              value={details.pending_medications}
                              onChange={(e) => setPatientDetails({
                                ...patientDetails,
                                [patientId]: { ...details, pending_medications: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Pending Tests</Label>
                            <Input 
                              placeholder="Tests scheduled..."
                              value={details.pending_tests}
                              onChange={(e) => setPatientDetails({
                                ...patientDetails,
                                [patientId]: { ...details, pending_tests: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                        <div className="mt-2 space-y-2">
                          <Label className="text-xs">Special Instructions</Label>
                          <Input 
                            placeholder="Any special care instructions..."
                            value={details.special_instructions}
                            onChange={(e) => setPatientDetails({
                              ...patientDetails,
                              [patientId]: { ...details, special_instructions: e.target.value }
                            })}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Pending Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Pending Tasks
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPendingTask}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.pending_tasks.map((task, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        placeholder="Task description..."
                        value={task.task}
                        onChange={(e) => updatePendingTask(index, 'task', e.target.value)}
                        className="flex-1"
                      />
                      <Select 
                        value={task.priority}
                        onValueChange={(val) => updatePendingTask(index, 'priority', val)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removePendingTask(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medication Notes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medication Notes
                </Label>
                <Textarea 
                  placeholder="Important medication information..."
                  value={formData.medication_notes}
                  onChange={(e) => setFormData({...formData, medication_notes: e.target.value})}
                />
              </div>

              {/* Equipment Issues */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Equipment Issues
                </Label>
                <Textarea 
                  placeholder="Any equipment problems or maintenance needed..."
                  value={formData.equipment_issues}
                  onChange={(e) => setFormData({...formData, equipment_issues: e.target.value})}
                />
              </div>

              {/* General Notes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  General Notes
                </Label>
                <Textarea 
                  placeholder="Any other information for the incoming shift..."
                  value={formData.general_notes}
                  onChange={(e) => setFormData({...formData, general_notes: e.target.value})}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-green hover:bg-medical-green/90">
                  Create Handover
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={pendingHandovers.length > 0 ? "border-warning" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Handovers</p>
                <p className="text-2xl font-bold">{pendingHandovers.length}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Handovers</p>
                <p className="text-2xl font-bold">{handovers.filter(h => 
                  new Date(h.shift_date).toDateString() === new Date().toDateString()
                ).length}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold">{handovers.filter(h => h.status === 'acknowledged').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total This Week</p>
                <p className="text-2xl font-bold">{handovers.length}</p>
              </div>
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingHandovers.length > 0 && (
              <Badge className="ml-2 bg-warning text-warning-foreground h-5 min-w-5">
                {pendingHandovers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Handovers</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Pending Handovers - Requires Acknowledgment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingHandovers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
                  <p>No pending handovers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingHandovers.map((handover) => (
                    <div 
                      key={handover.id} 
                      className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                      onClick={() => viewHandover(handover)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{getShiftLabel(handover.shift_type)}</Badge>
                          {getStatusBadge(handover.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(handover.handover_time), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      {handover.critical_patients && (
                        <div className="flex items-center gap-2 text-destructive text-sm mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{handover.critical_patients.substring(0, 100)}...</span>
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledge(handover.id);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Acknowledge
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Shift Handovers</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : handovers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No handovers recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {handovers.map((handover) => (
                    <div 
                      key={handover.id} 
                      className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                      onClick={() => viewHandover(handover)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{getShiftLabel(handover.shift_type)}</Badge>
                          {getStatusBadge(handover.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(handover.shift_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {handover.general_notes && (
                        <p className="text-sm text-muted-foreground mt-2 truncate">
                          {handover.general_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Handover Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Handover Report
              {selectedHandover && getStatusBadge(selectedHandover.status)}
            </DialogTitle>
          </DialogHeader>
          {selectedHandover && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Shift</Label>
                  <p className="font-medium">{getShiftLabel(selectedHandover.shift_type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{format(new Date(selectedHandover.shift_date), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {selectedHandover.critical_patients && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <Label className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Patients
                  </Label>
                  <p className="mt-1">{selectedHandover.critical_patients}</p>
                </div>
              )}

              {handoverPatients.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    Patient Details
                  </Label>
                  <div className="space-y-2">
                    {handoverPatients.map((patient) => (
                      <Card key={patient.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {patient.patients?.first_name} {patient.patients?.last_name}
                          </h4>
                          {getPriorityBadge(patient.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Room {patient.room_number}, Bed {patient.bed_number}
                        </p>
                        {patient.condition_summary && (
                          <p className="text-sm mt-1">{patient.condition_summary}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {patient.pending_medications && (
                            <Badge variant="outline">Meds: {patient.pending_medications}</Badge>
                          )}
                          {patient.pending_tests && (
                            <Badge variant="outline">Tests: {patient.pending_tests}</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedHandover.pending_tasks && selectedHandover.pending_tasks.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-4 h-4" />
                    Pending Tasks
                  </Label>
                  <div className="space-y-2">
                    {selectedHandover.pending_tasks.map((task: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-accent/50 rounded">
                        <span className="flex-1">{task.task}</span>
                        {getPriorityBadge(task.priority)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHandover.medication_notes && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Medication Notes
                  </Label>
                  <p className="mt-1 text-sm">{selectedHandover.medication_notes}</p>
                </div>
              )}

              {selectedHandover.equipment_issues && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Equipment Issues
                  </Label>
                  <p className="mt-1 text-sm">{selectedHandover.equipment_issues}</p>
                </div>
              )}

              {selectedHandover.general_notes && (
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    General Notes
                  </Label>
                  <p className="mt-1 text-sm">{selectedHandover.general_notes}</p>
                </div>
              )}

              {selectedHandover.status === 'pending' && (
                <Button 
                  className="w-full bg-medical-green hover:bg-medical-green/90"
                  onClick={() => handleAcknowledge(selectedHandover.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Acknowledge Handover
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftHandover;