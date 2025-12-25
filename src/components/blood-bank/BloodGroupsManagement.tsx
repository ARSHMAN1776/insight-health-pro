import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Droplets, Plus, Pencil, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface BloodGroup {
  group_id: string;
  group_name: string;
  created_at: string | null;
}

const BloodGroupsManagement: React.FC = () => {
  const { user, isRole } = useAuth();
  const { toast } = useToast();
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | null>(null);
  const [formData, setFormData] = useState({ group_name: '' });

  const isAdmin = isRole('admin');

  const fetchBloodGroups = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blood_groups')
        .select('*')
        .order('group_name', { ascending: true });

      if (error) throw error;
      setBloodGroups(data || []);
    } catch (error: any) {
      console.error('Error fetching blood groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blood groups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBloodGroups();
  }, [fetchBloodGroups]);

  const handleOpenDialog = (group?: BloodGroup) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can manage blood groups',
        variant: 'destructive',
      });
      return;
    }
    
    if (group) {
      setSelectedGroup(group);
      setFormData({ group_name: group.group_name });
    } else {
      setSelectedGroup(null);
      setFormData({ group_name: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedGroup(null);
    setFormData({ group_name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can manage blood groups',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.group_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Blood group name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedGroup) {
        // Update existing
        const { error } = await supabase
          .from('blood_groups')
          .update({ group_name: formData.group_name.trim() })
          .eq('group_id', selectedGroup.group_id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blood group updated successfully',
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('blood_groups')
          .insert({ group_name: formData.group_name.trim() });

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blood group added successfully',
        });
      }

      handleCloseDialog();
      fetchBloodGroups();
    } catch (error: any) {
      console.error('Error saving blood group:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blood group',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (group: BloodGroup) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete blood groups',
        variant: 'destructive',
      });
      return;
    }
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('blood_groups')
        .delete()
        .eq('group_id', selectedGroup.group_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Blood group deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      setSelectedGroup(null);
      fetchBloodGroups();
    } catch (error: any) {
      console.error('Error deleting blood group:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete blood group. It may be in use.',
        variant: 'destructive',
      });
    }
  };

  const getBloodGroupColor = (groupName: string): string => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800 border-red-300',
      'A-': 'bg-red-50 text-red-700 border-red-200',
      'B+': 'bg-blue-100 text-blue-800 border-blue-300',
      'B-': 'bg-blue-50 text-blue-700 border-blue-200',
      'AB+': 'bg-purple-100 text-purple-800 border-purple-300',
      'AB-': 'bg-purple-50 text-purple-700 border-purple-200',
      'O+': 'bg-green-100 text-green-800 border-green-300',
      'O-': 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[groupName] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Droplets className="h-5 w-5 text-red-500" />
            Blood Groups
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin 
              ? 'Manage blood group types used across the system'
              : 'View blood group types used across the system'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Blood Group
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Admin Notice */}
        {!isAdmin && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Only administrators can add, edit, or delete blood groups.
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : bloodGroups.length === 0 ? (
          <div className="text-center py-8">
            <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Blood Groups</h3>
            <p className="text-muted-foreground">
              {isAdmin 
                ? 'Start by adding blood group types.'
                : 'No blood groups have been configured yet.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Created</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodGroups.map((group) => (
                  <TableRow key={group.group_id}>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`font-semibold text-sm px-3 py-1 ${getBloodGroupColor(group.group_name)}`}
                      >
                        {group.group_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.created_at 
                        ? new Date(group.created_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(group)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(group)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedGroup ? 'Edit Blood Group' : 'Add Blood Group'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group_name">Blood Group Name</Label>
                  <Input
                    id="group_name"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ group_name: e.target.value })}
                    placeholder="e.g., A+, B-, O+, AB-"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Standard blood groups: A+, A-, B+, B-, AB+, AB-, O+, O-
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedGroup ? 'Update' : 'Add'} Blood Group
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Blood Group"
          description={
            <div className="space-y-2">
              <p>Are you sure you want to delete the blood group <strong>{selectedGroup?.group_name}</strong>?</p>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>This action cannot be undone. Deleting a blood group may affect related records.</span>
              </div>
            </div>
          }
          onConfirm={handleConfirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
};

export default BloodGroupsManagement;
