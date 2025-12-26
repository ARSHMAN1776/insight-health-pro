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
import { Eye, Edit, ClipboardList, UserPlus, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTimezone } from '@/hooks/useTimezone';
import SurgeryTeam from './SurgeryTeam';

interface Surgery {
  id: string;
  patient_id: string;
  doctor_id: string;
  ot_id: string;
  surgery_type: string;
  surgery_date: string;
  start_time: string;
  end_time: string;
  status: string;
  priority: string;
  notes: string | null;
  patients: { first_name: string; last_name: string } | null;
  doctors: { first_name: string; last_name: string; specialization: string } | null;
  operation_theatres: { ot_name: string } | null;
}

interface SurgeryListProps {
  refreshTrigger?: number;
}

const SurgeryList: React.FC<SurgeryListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { formatDate, formatTime } = useTimezone();
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: '',
    notes: ''
  });

  const canEdit = ['admin', 'doctor'].includes(user?.role || '');
  const canManageTeam = user?.role === 'admin';

  useEffect(() => {
    fetchSurgeries();
  }, [refreshTrigger]);

  const fetchSurgeries = async () => {
    try {
      const { data, error } = await supabase
        .from('surgeries')
        .select(`
          *,
          patients:patient_id (first_name, last_name),
          doctors:doctor_id (first_name, last_name, specialization),
          operation_theatres:ot_id (ot_name)
        `)
        .order('surgery_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSurgeries(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch surgeries',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (surgeryId: string, newStatus: string, otId: string) => {
    try {
      // Update surgery status
      const { error: surgeryError } = await supabase
        .from('surgeries')
        .update({ status: newStatus })
        .eq('id', surgeryId);

      if (surgeryError) throw surgeryError;

      // Update OT status based on surgery status
      let otStatus = 'available';
      if (newStatus === 'in_progress') {
        otStatus = 'in_use';
      }

      const { error: otError } = await supabase
        .from('operation_theatres')
        .update({ status: otStatus })
        .eq('id', otId);

      if (otError) console.error('Failed to update OT status:', otError);

      toast({ title: 'Success', description: 'Surgery status updated' });
      fetchSurgeries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleEditSave = async () => {
    if (!selectedSurgery) return;

    try {
      const { error } = await supabase
        .from('surgeries')
        .update({
          status: editFormData.status,
          notes: editFormData.notes
        })
        .eq('id', selectedSurgery.id);

      if (error) throw error;

      // Update OT status if needed
      if (editFormData.status === 'in_progress') {
        await supabase
          .from('operation_theatres')
          .update({ status: 'in_use' })
          .eq('id', selectedSurgery.ot_id);
      } else if (['completed', 'cancelled'].includes(editFormData.status)) {
        await supabase
          .from('operation_theatres')
          .update({ status: 'available' })
          .eq('id', selectedSurgery.ot_id);
      }

      toast({ title: 'Success', description: 'Surgery updated' });
      setIsEditOpen(false);
      fetchSurgeries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update surgery',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'secondary',
      in_progress: 'default',
      completed: 'outline',
      cancelled: 'destructive'
    };
    const labels: Record<string, string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      normal: 'outline',
      urgent: 'secondary',
      emergency: 'destructive'
    };
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  const filteredSurgeries = surgeries.filter((surgery) => {
    const matchesSearch = 
      surgery.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgery.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgery.surgery_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgery.doctors?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgery.doctors?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || surgery.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Surgery List
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, doctor, or surgery type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Surgery Type</TableHead>
                <TableHead>OT</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurgeries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No surgeries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSurgeries.map((surgery) => (
                  <TableRow key={surgery.id}>
                    <TableCell className="font-medium">
                      {surgery.patients?.first_name} {surgery.patients?.last_name}
                    </TableCell>
                    <TableCell>
                      Dr. {surgery.doctors?.first_name} {surgery.doctors?.last_name}
                    </TableCell>
                    <TableCell>{surgery.surgery_type}</TableCell>
                    <TableCell>{surgery.operation_theatres?.ot_name}</TableCell>
                    <TableCell>{formatDate(surgery.surgery_date)}</TableCell>
                    <TableCell>{formatTime(surgery.start_time)} - {formatTime(surgery.end_time)}</TableCell>
                    <TableCell>{getPriorityBadge(surgery.priority)}</TableCell>
                    <TableCell>{getStatusBadge(surgery.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSurgery(surgery);
                            setIsViewOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && surgery.status !== 'completed' && surgery.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSurgery(surgery);
                              setEditFormData({
                                status: surgery.status,
                                notes: surgery.notes || ''
                              });
                              setIsEditOpen(true);
                            }}
                            title="Edit Surgery"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canManageTeam && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSurgery(surgery);
                              setIsTeamOpen(true);
                            }}
                            title="Manage Team"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Surgery Details</DialogTitle>
            </DialogHeader>
            {selectedSurgery && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Patient</Label>
                    <p className="font-medium">
                      {selectedSurgery.patients?.first_name} {selectedSurgery.patients?.last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Doctor</Label>
                    <p className="font-medium">
                      Dr. {selectedSurgery.doctors?.first_name} {selectedSurgery.doctors?.last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Surgery Type</Label>
                    <p className="font-medium">{selectedSurgery.surgery_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Operation Theatre</Label>
                    <p className="font-medium">{selectedSurgery.operation_theatres?.ot_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">
                      {formatDate(selectedSurgery.surgery_date, 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time</Label>
                    <p className="font-medium">
                      {formatTime(selectedSurgery.start_time)} - {formatTime(selectedSurgery.end_time)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <p>{getPriorityBadge(selectedSurgery.priority)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p>{getStatusBadge(selectedSurgery.status)}</p>
                  </div>
                </div>
                {selectedSurgery.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="text-sm">{selectedSurgery.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Surgery</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Update notes..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Dialog */}
        {selectedSurgery && (
          <SurgeryTeam
            isOpen={isTeamOpen}
            onClose={() => setIsTeamOpen(false)}
            surgeryId={selectedSurgery.id}
            surgeryType={selectedSurgery.surgery_type}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SurgeryList;
