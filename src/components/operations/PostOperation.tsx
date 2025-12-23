import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Eye, HeartPulse, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Surgery {
  id: string;
  surgery_type: string;
  surgery_date: string;
  status: string;
  patients: { first_name: string; last_name: string } | null;
  doctors: { first_name: string; last_name: string } | null;
}

interface PostOpRecord {
  id: string;
  surgery_id: string;
  recovery_notes: string | null;
  complications: string | null;
  discharge_status: string;
  medication_notes: string | null;
  follow_up_date: string | null;
  created_at: string | null;
  surgeries: Surgery | null;
}

const PostOperation: React.FC = () => {
  const { user } = useAuth();
  const [postOpRecords, setPostOpRecords] = useState<PostOpRecord[]>([]);
  const [completedSurgeries, setCompletedSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PostOpRecord | null>(null);
  
  const [formData, setFormData] = useState({
    surgery_id: '',
    recovery_notes: '',
    complications: '',
    discharge_status: 'stable',
    medication_notes: '',
    follow_up_date: ''
  });

  const canManage = ['admin', 'doctor', 'nurse'].includes(user?.role || '');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, surgeriesRes] = await Promise.all([
        supabase
          .from('post_operation')
          .select(`
            *,
            surgeries:surgery_id (
              id,
              surgery_type,
              surgery_date,
              status,
              patients:patient_id (first_name, last_name),
              doctors:doctor_id (first_name, last_name)
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('surgeries')
          .select(`
            id,
            surgery_type,
            surgery_date,
            status,
            patients:patient_id (first_name, last_name),
            doctors:doctor_id (first_name, last_name)
          `)
          .eq('status', 'completed')
          .order('surgery_date', { ascending: false })
      ]);

      if (recordsRes.error) throw recordsRes.error;
      if (surgeriesRes.error) throw surgeriesRes.error;

      setPostOpRecords(recordsRes.data || []);
      
      // Filter out surgeries that already have post-op records
      const existingIds = (recordsRes.data || []).map(r => r.surgery_id);
      const availableSurgeries = (surgeriesRes.data || []).filter(
        s => !existingIds.includes(s.id)
      );
      setCompletedSurgeries(availableSurgeries);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.surgery_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a surgery',
        variant: 'destructive'
      });
      return;
    }

    try {
      const postOpData = {
        surgery_id: formData.surgery_id,
        recovery_notes: formData.recovery_notes.trim() || null,
        complications: formData.complications.trim() || null,
        discharge_status: formData.discharge_status,
        medication_notes: formData.medication_notes.trim() || null,
        follow_up_date: formData.follow_up_date || null
      };

      const { error } = await supabase
        .from('post_operation')
        .insert(postOpData);

      if (error) throw error;

      toast({ title: 'Success', description: 'Post-operation record added' });
      setIsAddOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add record',
        variant: 'destructive'
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedRecord) return;

    try {
      const { error } = await supabase
        .from('post_operation')
        .update({
          recovery_notes: formData.recovery_notes.trim() || null,
          complications: formData.complications.trim() || null,
          discharge_status: formData.discharge_status,
          medication_notes: formData.medication_notes.trim() || null,
          follow_up_date: formData.follow_up_date || null
        })
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Record updated' });
      setIsEditOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update record',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      surgery_id: '',
      recovery_notes: '',
      complications: '',
      discharge_status: 'stable',
      medication_notes: '',
      follow_up_date: ''
    });
    setSelectedRecord(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      stable: 'default',
      critical: 'destructive',
      discharged: 'outline',
      monitoring: 'secondary'
    };
    const labels: Record<string, string> = {
      stable: 'Stable',
      critical: 'Critical',
      discharged: 'Discharged',
      monitoring: 'Monitoring'
    };
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const filteredRecords = postOpRecords.filter((record) => {
    const patientName = `${record.surgeries?.patients?.first_name} ${record.surgeries?.patients?.last_name}`.toLowerCase();
    const surgeryType = record.surgeries?.surgery_type?.toLowerCase() || '';
    return patientName.includes(searchTerm.toLowerCase()) || surgeryType.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5" />
          Post-Operation Records
        </CardTitle>
        {canManage && completedSurgeries.length > 0 && (
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or surgery type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Surgery</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Discharge Status</TableHead>
              <TableHead>Complications</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No post-operation records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.surgeries?.patients?.first_name} {record.surgeries?.patients?.last_name}
                  </TableCell>
                  <TableCell>{record.surgeries?.surgery_type}</TableCell>
                  <TableCell>
                    {record.surgeries?.surgery_date 
                      ? format(new Date(record.surgeries.surgery_date), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.discharge_status)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.complications || 'None'}
                  </TableCell>
                  <TableCell>
                    {record.follow_up_date 
                      ? format(new Date(record.follow_up_date), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setFormData({
                              surgery_id: record.surgery_id,
                              recovery_notes: record.recovery_notes || '',
                              complications: record.complications || '',
                              discharge_status: record.discharge_status,
                              medication_notes: record.medication_notes || '',
                              follow_up_date: record.follow_up_date || ''
                            });
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Add Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Post-Operation Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Surgery *</Label>
                <Select
                  value={formData.surgery_id}
                  onValueChange={(value) => setFormData({ ...formData, surgery_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select completed surgery" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedSurgeries.map((surgery) => (
                      <SelectItem key={surgery.id} value={surgery.id}>
                        {surgery.patients?.first_name} {surgery.patients?.last_name} - {surgery.surgery_type} ({format(new Date(surgery.surgery_date), 'MMM dd')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discharge Status</Label>
                <Select
                  value={formData.discharge_status}
                  onValueChange={(value) => setFormData({ ...formData, discharge_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recovery Notes</Label>
                <Textarea
                  value={formData.recovery_notes}
                  onChange={(e) => setFormData({ ...formData, recovery_notes: e.target.value })}
                  placeholder="Patient recovery progress, observations..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Complications</Label>
                <Textarea
                  value={formData.complications}
                  onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                  placeholder="Any complications or issues..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Medication Notes</Label>
                <Textarea
                  value={formData.medication_notes}
                  onChange={(e) => setFormData({ ...formData, medication_notes: e.target.value })}
                  placeholder="Post-operative medications..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Post-Operation Details</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Patient</Label>
                    <p className="font-medium">
                      {selectedRecord.surgeries?.patients?.first_name} {selectedRecord.surgeries?.patients?.last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Surgery</Label>
                    <p className="font-medium">{selectedRecord.surgeries?.surgery_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Discharge Status</Label>
                    <p>{getStatusBadge(selectedRecord.discharge_status)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Follow-up Date</Label>
                    <p className="font-medium">
                      {selectedRecord.follow_up_date 
                        ? format(new Date(selectedRecord.follow_up_date), 'MMMM dd, yyyy')
                        : 'Not scheduled'}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Recovery Notes</Label>
                  <p className="text-sm">{selectedRecord.recovery_notes || 'None'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Complications</Label>
                  <p className="text-sm">{selectedRecord.complications || 'None'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Medication Notes</Label>
                  <p className="text-sm">{selectedRecord.medication_notes || 'None'}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Post-Operation Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Discharge Status</Label>
                <Select
                  value={formData.discharge_status}
                  onValueChange={(value) => setFormData({ ...formData, discharge_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recovery Notes</Label>
                <Textarea
                  value={formData.recovery_notes}
                  onChange={(e) => setFormData({ ...formData, recovery_notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Complications</Label>
                <Textarea
                  value={formData.complications}
                  onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Medication Notes</Label>
                <Textarea
                  value={formData.medication_notes}
                  onChange={(e) => setFormData({ ...formData, medication_notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PostOperation;
