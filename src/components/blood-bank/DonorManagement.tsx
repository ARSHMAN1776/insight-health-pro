import React, { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface BloodGroup {
  group_id: string;
  group_name: string;
}

interface Donor {
  donor_id: string;
  name: string;
  blood_group_id: string;
  contact: string | null;
  last_donation_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  blood_group?: BloodGroup;
}

const donorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  blood_group_id: z.string().uuid('Please select a blood group'),
  contact: z.string().max(50, 'Contact too long').optional(),
  status: z.enum(['Eligible', 'Ineligible', 'Deferred']),
});

const ELIGIBILITY_DAYS = 56; // 8 weeks between donations

const DonorManagement: React.FC = () => {
  const { toast } = useToast();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    blood_group_id: '',
    contact: '',
    status: 'Eligible' as 'Eligible' | 'Ineligible' | 'Deferred',
    last_donation_date: '',
  });

  const fetchBloodGroups = useCallback(async () => {
    const { data, error } = await supabase
      .from('blood_groups')
      .select('*')
      .order('group_name');
    
    if (error) {
      console.error('Error fetching blood groups:', error);
      return;
    }
    setBloodGroups(data || []);
  }, []);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donors')
        .select(`
          *,
          blood_group:blood_group_id (group_id, group_name)
        `)
        .order('name');

      if (error) throw error;
      setDonors(data || []);
    } catch (error: any) {
      console.error('Error fetching donors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch donors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBloodGroups();
    fetchDonors();
  }, [fetchBloodGroups, fetchDonors]);

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.contact?.includes(searchTerm) ||
      donor.blood_group?.group_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodGroup = filterBloodGroup === 'all' || donor.blood_group_id === filterBloodGroup;
    const matchesStatus = filterStatus === 'all' || donor.status === filterStatus;
    return matchesSearch && matchesBloodGroup && matchesStatus;
  });

  const handleOpenDialog = (donor?: Donor) => {
    if (donor) {
      setSelectedDonor(donor);
      setFormData({
        name: donor.name,
        blood_group_id: donor.blood_group_id,
        contact: donor.contact || '',
        status: donor.status as 'Eligible' | 'Ineligible' | 'Deferred',
        last_donation_date: donor.last_donation_date || '',
      });
    } else {
      setSelectedDonor(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDonor(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      blood_group_id: '',
      contact: '',
      status: 'Eligible' as 'Eligible' | 'Ineligible' | 'Deferred',
      last_donation_date: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validatedData = donorSchema.parse({
        name: formData.name.trim(),
        blood_group_id: formData.blood_group_id,
        contact: formData.contact.trim() || undefined,
        status: formData.status,
      });

      const donorData: {
        name: string;
        blood_group_id: string;
        contact?: string;
        status: string;
        last_donation_date: string | null;
      } = {
        name: validatedData.name,
        blood_group_id: validatedData.blood_group_id,
        contact: validatedData.contact,
        status: validatedData.status,
        last_donation_date: formData.last_donation_date || null,
      };

      if (selectedDonor) {
        // Update existing donor
        const { error } = await supabase
          .from('donors')
          .update(donorData)
          .eq('donor_id', selectedDonor.donor_id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Donor updated successfully',
        });
      } else {
        // Create new donor
        const { error } = await supabase
          .from('donors')
          .insert([donorData]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Donor registered successfully',
        });
      }

      handleCloseDialog();
      fetchDonors();
    } catch (error: any) {
      console.error('Error saving donor:', error);
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save donor',
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (donor: Donor) => {
    setSelectedDonor(donor);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDonor) return;

    try {
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('donor_id', selectedDonor.donor_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Donor deleted successfully',
      });

      setDeleteDialogOpen(false);
      setSelectedDonor(null);
      fetchDonors();
    } catch (error: any) {
      console.error('Error deleting donor:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete donor',
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

  const getEligibilityStatus = (donor: Donor) => {
    // Check manual status first
    if (donor.status === 'Ineligible') {
      return { 
        eligible: false, 
        icon: XCircle, 
        color: 'text-red-500', 
        label: 'Ineligible',
        reason: 'Marked as ineligible'
      };
    }
    
    if (donor.status === 'Deferred') {
      return { 
        eligible: false, 
        icon: Clock, 
        color: 'text-yellow-500', 
        label: 'Deferred',
        reason: 'Temporarily deferred'
      };
    }
    
    // Check donation date eligibility
    if (donor.last_donation_date) {
      const daysSinceDonation = differenceInDays(new Date(), new Date(donor.last_donation_date));
      if (daysSinceDonation < ELIGIBILITY_DAYS) {
        const nextEligibleDate = addDays(new Date(donor.last_donation_date), ELIGIBILITY_DAYS);
        return { 
          eligible: false, 
          icon: Clock, 
          color: 'text-yellow-500', 
          label: 'Waiting',
          reason: `Eligible after ${format(nextEligibleDate, 'MMM dd, yyyy')}`
        };
      }
    }
    
    return { 
      eligible: true, 
      icon: CheckCircle2, 
      color: 'text-green-500', 
      label: 'Eligible',
      reason: 'Ready to donate'
    };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'default';
      case 'Ineligible':
        return 'destructive';
      case 'Deferred':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const eligibleCount = donors.filter(d => getEligibilityStatus(d).eligible).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Donor Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {donors.length} total donors • {eligibleCount} eligible
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={fetchDonors}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              Add Donor
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, or blood group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {bloodGroups.map((group) => (
                <SelectItem key={group.group_id} value={group.group_id}>
                  {group.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Eligible">Eligible</SelectItem>
              <SelectItem value="Ineligible">Ineligible</SelectItem>
              <SelectItem value="Deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Donors Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterBloodGroup !== 'all' || filterStatus !== 'all'
                ? 'No donors match your filters.'
                : 'Register a new donor to get started.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map((donor) => {
                  const eligibility = getEligibilityStatus(donor);
                  const EligibilityIcon = eligibility.icon;
                  const groupName = donor.blood_group?.group_name || 'Unknown';
                  return (
                    <TableRow key={donor.donor_id}>
                      <TableCell className="font-medium">{donor.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`font-semibold ${getBloodGroupColor(groupName)}`}
                        >
                          {groupName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {donor.contact || '-'}
                      </TableCell>
                      <TableCell>
                        {donor.last_donation_date 
                          ? format(new Date(donor.last_donation_date), 'MMM dd, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${eligibility.color}`}>
                          <EligibilityIcon className="h-4 w-4" />
                          <span className="text-sm">{eligibility.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{eligibility.reason}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(donor.status)}>
                          {donor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(donor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(donor)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDonor ? 'Edit Donor' : 'Register New Donor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter donor's full name"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group *</Label>
                  <Select
                    value={formData.blood_group_id}
                    onValueChange={(value) => setFormData({ ...formData, blood_group_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group.group_id} value={group.group_id}>
                          {group.group_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact (Phone/Email)</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Enter phone or email"
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_donation_date">Last Donation Date</Label>
                  <Input
                    id="last_donation_date"
                    type="date"
                    value={formData.last_donation_date}
                    onChange={(e) => setFormData({ ...formData, last_donation_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Donors must wait 56 days (8 weeks) between donations
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Eligibility Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'Eligible' | 'Ineligible' | 'Deferred') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eligible">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Eligible
                        </div>
                      </SelectItem>
                      <SelectItem value="Ineligible">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Ineligible
                        </div>
                      </SelectItem>
                      <SelectItem value="Deferred">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Deferred
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : selectedDonor ? 'Update Donor' : 'Register Donor'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Donor"
          description={
            <div className="space-y-2">
              <p>Are you sure you want to delete donor <strong>{selectedDonor?.name}</strong>?</p>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>This action cannot be undone. All donation history for this donor will be lost.</span>
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

export default DonorManagement;
