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
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface OperationTheatre {
  id: string;
  ot_name: string;
  status: string;
  floor: number | null;
  equipment: string[] | null;
  notes: string | null;
  created_at: string | null;
}

const OperationTheatres: React.FC = () => {
  const { user } = useAuth();
  const [theatres, setTheatres] = useState<OperationTheatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<OperationTheatre | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [theatreToDelete, setTheatreToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    ot_name: '',
    status: 'available',
    floor: '',
    equipment: '',
    notes: ''
  });

  const canManage = user?.role === 'admin';

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    try {
      const { data, error } = await supabase
        .from('operation_theatres')
        .select('*')
        .order('ot_name');
      
      if (error) throw error;
      setTheatres(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch operation theatres',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.ot_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'OT name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const theatreData = {
        ot_name: formData.ot_name.trim(),
        status: formData.status,
        floor: formData.floor ? parseInt(formData.floor) : null,
        equipment: formData.equipment ? formData.equipment.split(',').map(e => e.trim()) : null,
        notes: formData.notes.trim() || null
      };

      if (editingTheatre) {
        const { error } = await supabase
          .from('operation_theatres')
          .update(theatreData)
          .eq('id', editingTheatre.id);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Operation theatre updated' });
      } else {
        const { error } = await supabase
          .from('operation_theatres')
          .insert(theatreData);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Operation theatre added' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTheatres();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save operation theatre',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (theatre: OperationTheatre) => {
    setEditingTheatre(theatre);
    setFormData({
      ot_name: theatre.ot_name,
      status: theatre.status,
      floor: theatre.floor?.toString() || '',
      equipment: theatre.equipment?.join(', ') || '',
      notes: theatre.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!theatreToDelete) return;

    try {
      const { error } = await supabase
        .from('operation_theatres')
        .delete()
        .eq('id', theatreToDelete);
      
      if (error) throw error;
      toast({ title: 'Success', description: 'Operation theatre deleted' });
      fetchTheatres();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete operation theatre',
        variant: 'destructive'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setTheatreToDelete(null);
    }
  };

  const handleStatusChange = async (theatreId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('operation_theatres')
        .update({ status: newStatus })
        .eq('id', theatreId);
      
      if (error) throw error;
      toast({ title: 'Success', description: 'OT status updated' });
      fetchTheatres();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      ot_name: '',
      status: 'available',
      floor: '',
      equipment: '',
      notes: ''
    });
    setEditingTheatre(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      available: 'default',
      in_use: 'destructive',
      maintenance: 'secondary'
    };
    const labels: Record<string, string> = {
      available: 'Available',
      in_use: 'In Use',
      maintenance: 'Maintenance'
    };
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Operation Theatres
        </CardTitle>
        {canManage && (
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add OT
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OT Name</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Notes</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {theatres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5} className="text-center text-muted-foreground">
                  No operation theatres found
                </TableCell>
              </TableRow>
            ) : (
              theatres.map((theatre) => (
                <TableRow key={theatre.id}>
                  <TableCell className="font-medium">{theatre.ot_name}</TableCell>
                  <TableCell>{theatre.floor || '-'}</TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select
                        value={theatre.status}
                        onValueChange={(value) => handleStatusChange(theatre.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="in_use">In Use</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(theatre.status)
                    )}
                  </TableCell>
                  <TableCell>
                    {theatre.equipment?.join(', ') || '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {theatre.notes || '-'}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(theatre)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setTheatreToDelete(theatre.id);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTheatre ? 'Edit Operation Theatre' : 'Add Operation Theatre'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ot_name">OT Name *</Label>
                <Input
                  id="ot_name"
                  value={formData.ot_name}
                  onChange={(e) => setFormData({ ...formData, ot_name: e.target.value })}
                  placeholder="e.g., OT-1, Main Surgery Room"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g., 2"
                />
              </div>
              <div>
                <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                <Input
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="e.g., Ventilator, Anesthesia Machine, ECG"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingTheatre ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleDelete}
          title="Delete Operation Theatre"
          description="Are you sure you want to delete this operation theatre? This action cannot be undone."
          confirmText="Delete"
        />
      </CardContent>
    </Card>
  );
};

export default OperationTheatres;
