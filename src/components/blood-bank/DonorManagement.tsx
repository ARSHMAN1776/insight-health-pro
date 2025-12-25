import React, { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useBloodDonors, BloodDonor } from '@/hooks/useBloodBank';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, Users, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { BLOOD_TYPES, getBloodTypeColor, isDonorEligible, calculateNextEligibleDate } from '@/lib/bloodCompatibility';

const donorSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  weight_kg: z.number().min(45, 'Minimum weight is 45 kg').optional(),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),
});

const DonorManagement: React.FC = () => {
  const { donors, loading, refetch } = useBloodDonors();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male' as const,
    blood_type: 'O+' as const,
    phone: '',
    email: '',
    address: '',
    weight_kg: '',
    medical_conditions: '',
    medications: ''
  });

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = 
      `${donor.first_name} ${donor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone?.includes(searchTerm);
    const matchesBloodType = filterBloodType === 'all' || donor.blood_type === filterBloodType;
    const matchesStatus = filterStatus === 'all' || donor.status === filterStatus;
    return matchesSearch && matchesBloodType && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validatedData = donorSchema.parse({
        ...formData,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        email: formData.email || undefined
      });

      const { error } = await (supabase as any)
        .from('blood_donors')
        .insert([{
          ...validatedData,
          is_eligible: true,
          total_donations: 0,
          status: 'active'
        }]);

      if (error) throw error;

      toast.success('Donor registered successfully');
      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Error adding donor:', error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || 'Failed to register donor');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'Male',
      blood_type: 'O+',
      phone: '',
      email: '',
      address: '',
      weight_kg: '',
      medical_conditions: '',
      medications: ''
    });
  };

  const getEligibilityStatus = (donor: BloodDonor) => {
    if (!donor.is_eligible) {
      return { 
        eligible: false, 
        icon: XCircle, 
        color: 'text-red-500', 
        label: 'Not Eligible',
        reason: donor.eligibility_notes || 'Deferred'
      };
    }
    
    if (donor.last_donation_date) {
      const isEligible = isDonorEligible(new Date(donor.last_donation_date));
      if (!isEligible) {
        const nextDate = calculateNextEligibleDate(new Date(donor.last_donation_date));
        return { 
          eligible: false, 
          icon: Clock, 
          color: 'text-yellow-500', 
          label: 'Waiting',
          reason: `Eligible after ${format(nextDate, 'MMM dd, yyyy')}`
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Donor Management
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Register Donor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register New Donor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth *</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type *</Label>
                      <Select
                        value={formData.blood_type}
                        onValueChange={(value: any) => setFormData({ ...formData, blood_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight_kg">Weight (kg)</Label>
                      <Input
                        id="weight_kg"
                        type="number"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                        min={45}
                        placeholder="Min 45 kg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medical_conditions">Medical Conditions</Label>
                    <Textarea
                      id="medical_conditions"
                      value={formData.medical_conditions}
                      onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                      placeholder="Any relevant medical history..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                      placeholder="List of current medications..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Registering...' : 'Register Donor'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, blood type, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterBloodType} onValueChange={setFilterBloodType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Blood Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No donors found. Register a new donor to get started.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Total Donations</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map((donor) => {
                  const eligibility = getEligibilityStatus(donor);
                  const EligibilityIcon = eligibility.icon;
                  return (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{donor.first_name} {donor.last_name}</div>
                          <div className="text-xs text-muted-foreground">{donor.gender}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getBloodTypeColor(donor.blood_type as any)} text-white`}>
                          {donor.blood_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {donor.phone && <div>{donor.phone}</div>}
                          {donor.email && <div className="text-muted-foreground">{donor.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {donor.last_donation_date 
                          ? format(new Date(donor.last_donation_date), 'MMM dd, yyyy')
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {donor.total_donations}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${eligibility.color}`}>
                          <EligibilityIcon className="h-4 w-4" />
                          <span className="text-sm">{eligibility.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{eligibility.reason}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={donor.status === 'active' ? 'default' : 'secondary'}>
                          {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonorManagement;
