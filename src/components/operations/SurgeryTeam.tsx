import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  surgery_id: string;
  staff_name: string;
  role: string;
  notes: string | null;
}

interface SurgeryTeamProps {
  isOpen: boolean;
  onClose: () => void;
  surgeryId: string;
  surgeryType: string;
}

const SurgeryTeam: React.FC<SurgeryTeamProps> = ({ isOpen, onClose, surgeryId, surgeryType }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    staff_name: '',
    role: 'surgeon',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen, surgeryId]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('surgery_team')
        .select('*')
        .eq('surgery_id', surgeryId)
        .order('role');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch team members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!formData.staff_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Staff name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('surgery_team')
        .insert({
          surgery_id: surgeryId,
          staff_name: formData.staff_name.trim(),
          role: formData.role,
          notes: formData.notes.trim() || null
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Team member added' });
      setIsAddOpen(false);
      setFormData({ staff_name: '', role: 'surgeon', notes: '' });
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add team member',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('surgery_team')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Team member removed' });
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team member',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      surgeon: 'default',
      nurse: 'secondary',
      anesthetist: 'destructive',
      assistant: 'outline'
    };
    const labels: Record<string, string> = {
      surgeon: 'Surgeon',
      nurse: 'Nurse',
      anesthetist: 'Anesthetist',
      assistant: 'Assistant'
    };
    return <Badge variant={variants[role] || 'outline'}>{labels[role] || role}</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Surgery Team - {surgeryType}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>

            {loading ? (
              <div className="text-center p-4">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No team members assigned yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.staff_name}</TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {member.notes || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff_name">Staff Name *</Label>
              <Input
                id="staff_name"
                value={formData.staff_name}
                onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                placeholder="e.g., Dr. John Smith"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surgeon">Surgeon</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="anesthetist">Anesthetist</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SurgeryTeam;
