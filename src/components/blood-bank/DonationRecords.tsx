import React, { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useBloodDonations, useBloodDonors, BloodDonation } from '@/hooks/useBloodBank';
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
import { Plus, Search, Droplets, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';
import { BLOOD_TYPES, getBloodTypeColor, generateBagNumber, calculateNextEligibleDate } from '@/lib/bloodCompatibility';

const donationSchema = z.object({
  donor_id: z.string().uuid('Please select a donor'),
  donation_date: z.string().min(1, 'Donation date is required'),
  donation_time: z.string().min(1, 'Donation time is required'),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  volume_ml: z.number().min(200, 'Minimum volume is 200 mL').max(550, 'Maximum volume is 550 mL'),
  bag_number: z.string().min(1, 'Bag number is required'),
  collected_by: z.string().min(2, 'Collector name is required'),
  hemoglobin_level: z.number().optional(),
  blood_pressure_systolic: z.number().optional(),
  blood_pressure_diastolic: z.number().optional(),
  pulse_rate: z.number().optional(),
  temperature: z.number().optional(),
  collection_site: z.string().optional(),
});

const DonationRecords: React.FC = () => {
  const { donations, loading, refetch } = useBloodDonations();
  const { donors } = useBloodDonors();
  const { formatDate, formatTime, getCurrentDate } = useTimezone();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  
  const currentDate = getCurrentDate();
  const [formData, setFormData] = useState({
    donor_id: '',
    donation_date: currentDate,
    donation_time: new Date().toTimeString().slice(0, 5),
    blood_type: 'O+' as const,
    volume_ml: 450,
    bag_number: '',
    collected_by: '',
    hemoglobin_level: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    temperature: '',
    collection_site: '',
    adverse_reactions: ''
  });

  // Generate bag number on dialog open
  React.useEffect(() => {
    if (dialogOpen && !formData.bag_number) {
      setFormData(prev => ({
        ...prev,
        bag_number: generateBagNumber()
      }));
    }
  }, [dialogOpen]);

  // Update blood type when donor is selected
  React.useEffect(() => {
    if (selectedDonor) {
      setFormData(prev => ({
        ...prev,
        blood_type: selectedDonor.blood_type
      }));
    }
  }, [selectedDonor]);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.bag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.collected_by?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDonorSelect = (donorId: string) => {
    const donor = donors.find(d => d.id === donorId);
    setSelectedDonor(donor);
    setFormData(prev => ({ ...prev, donor_id: donorId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validatedData = donationSchema.parse({
        ...formData,
        volume_ml: Number(formData.volume_ml),
        hemoglobin_level: formData.hemoglobin_level ? parseFloat(formData.hemoglobin_level) : undefined,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : undefined,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      });

      // Insert donation
      const { error: donationError } = await (supabase as any)
        .from('blood_donations')
        .insert([{
          ...validatedData,
          screening_status: 'pending',
          status: 'collected',
          adverse_reactions: formData.adverse_reactions || null
        }]);

      if (donationError) throw donationError;

      // Update donor's last donation date and increment total donations
      const nextEligible = calculateNextEligibleDate(new Date(formData.donation_date));
      await (supabase as any)
        .from('blood_donors')
        .update({
          last_donation_date: formData.donation_date,
          next_eligible_date: nextEligible.toISOString().split('T')[0],
          total_donations: (selectedDonor?.total_donations || 0) + 1
        })
        .eq('id', formData.donor_id);

      toast.success('Donation recorded successfully');
      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Error recording donation:', error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || 'Failed to record donation');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDonor(null);
    setFormData({
      donor_id: '',
      donation_date: new Date().toISOString().split('T')[0],
      donation_time: new Date().toTimeString().slice(0, 5),
      blood_type: 'O+',
      volume_ml: 450,
      bag_number: '',
      collected_by: '',
      hemoglobin_level: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      pulse_rate: '',
      temperature: '',
      collection_site: '',
      adverse_reactions: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      collected: { variant: 'secondary', className: 'bg-blue-500' },
      processing: { variant: 'secondary', className: 'bg-yellow-500' },
      tested: { variant: 'outline', className: 'border-purple-500 text-purple-500' },
      available: { variant: 'default', className: 'bg-green-500' },
      used: { variant: 'secondary', className: 'bg-gray-500' },
      discarded: { variant: 'destructive', className: '' },
      expired: { variant: 'destructive', className: '' }
    };
    const config = variants[status] || variants.collected;
    return <Badge className={config.className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getScreeningBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'quarantine':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Quarantine</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  // Get eligible donors
  const eligibleDonors = donors.filter(d => d.status === 'active' && d.is_eligible);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Donation Records
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
                  Record Donation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Record Blood Donation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="donor_id">Select Donor *</Label>
                    <Select
                      value={formData.donor_id}
                      onValueChange={handleDonorSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a donor" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleDonors.map((donor) => (
                          <SelectItem key={donor.id} value={donor.id}>
                            {donor.first_name} {donor.last_name} ({donor.blood_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {eligibleDonors.length === 0 && (
                      <p className="text-xs text-muted-foreground">No eligible donors available</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="donation_date">Date *</Label>
                      <Input
                        id="donation_date"
                        type="date"
                        value={formData.donation_date}
                        onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donation_time">Time *</Label>
                      <Input
                        id="donation_time"
                        type="time"
                        value={formData.donation_time}
                        onChange={(e) => setFormData({ ...formData, donation_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type</Label>
                      <Input
                        id="blood_type"
                        value={formData.blood_type}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bag_number">Bag Number *</Label>
                      <Input
                        id="bag_number"
                        value={formData.bag_number}
                        onChange={(e) => setFormData({ ...formData, bag_number: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="volume_ml">Volume (mL) *</Label>
                      <Input
                        id="volume_ml"
                        type="number"
                        value={formData.volume_ml}
                        onChange={(e) => setFormData({ ...formData, volume_ml: parseInt(e.target.value) || 0 })}
                        min={200}
                        max={550}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collected_by">Collected By *</Label>
                      <Input
                        id="collected_by"
                        value={formData.collected_by}
                        onChange={(e) => setFormData({ ...formData, collected_by: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Vital Signs (Optional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hemoglobin_level">Hemoglobin (g/dL)</Label>
                        <Input
                          id="hemoglobin_level"
                          type="number"
                          step="0.1"
                          value={formData.hemoglobin_level}
                          onChange={(e) => setFormData({ ...formData, hemoglobin_level: e.target.value })}
                          placeholder="12.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Blood Pressure</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={formData.blood_pressure_systolic}
                            onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                            placeholder="120"
                          />
                          <span className="self-center">/</span>
                          <Input
                            type="number"
                            value={formData.blood_pressure_diastolic}
                            onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                            placeholder="80"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <Label htmlFor="pulse_rate">Pulse (bpm)</Label>
                        <Input
                          id="pulse_rate"
                          type="number"
                          value={formData.pulse_rate}
                          onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })}
                          placeholder="72"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature (°C)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          value={formData.temperature}
                          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                          placeholder="37.0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collection_site">Collection Site</Label>
                    <Input
                      id="collection_site"
                      value={formData.collection_site}
                      onChange={(e) => setFormData({ ...formData, collection_site: e.target.value })}
                      placeholder="e.g., Main Blood Bank, Mobile Unit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adverse_reactions">Adverse Reactions</Label>
                    <Textarea
                      id="adverse_reactions"
                      value={formData.adverse_reactions}
                      onChange={(e) => setFormData({ ...formData, adverse_reactions: e.target.value })}
                      placeholder="Any adverse reactions during or after donation..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || !formData.donor_id}>
                      {submitting ? 'Recording...' : 'Record Donation'}
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
              placeholder="Search by bag number or blood type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="tested">Tested</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="discarded">Discarded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No donation records found. Record a new donation to get started.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bag Number</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Screening</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collected By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-mono text-sm">{donation.bag_number}</TableCell>
                    <TableCell>
                      {donation.donor 
                        ? `${donation.donor.first_name} ${donation.donor.last_name}`
                        : 'Unknown'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getBloodTypeColor(donation.blood_type as any)} text-white`}>
                        {donation.blood_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        {formatDate(donation.donation_date)}
                      </div>
                      <div className="text-xs text-muted-foreground">{donation.donation_time}</div>
                    </TableCell>
                    <TableCell>{donation.volume_ml} mL</TableCell>
                    <TableCell>{getScreeningBadge(donation.screening_status)}</TableCell>
                    <TableCell>{getStatusBadge(donation.status)}</TableCell>
                    <TableCell>{donation.collected_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonationRecords;
