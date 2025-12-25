import React, { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useBloodInventory, BloodInventoryItem } from '@/hooks/useBloodBank';
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
import { 
  Plus, 
  Search, 
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { 
  BLOOD_TYPES, 
  COMPONENT_TYPES, 
  COMPONENT_LABELS, 
  getBloodTypeColor,
  generateBagNumber,
  calculateExpiryDate
} from '@/lib/bloodCompatibility';

const inventorySchema = z.object({
  bag_number: z.string().min(1, 'Bag number is required'),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  component_type: z.enum(['whole_blood', 'packed_rbc', 'platelets', 'fresh_frozen_plasma', 'cryoprecipitate']),
  volume_ml: z.number().min(1, 'Volume must be greater than 0'),
  collection_date: z.string().min(1, 'Collection date is required'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  storage_location: z.string().optional(),
  storage_temperature: z.string().optional(),
  status: z.enum(['quarantine', 'available', 'reserved', 'issued', 'used', 'expired', 'discarded']),
});

const BloodInventory: React.FC = () => {
  const { inventory, loading, refetch } = useBloodInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bag_number: '',
    blood_type: 'O+' as const,
    component_type: 'whole_blood' as const,
    volume_ml: 450,
    collection_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    storage_location: '',
    storage_temperature: '',
    status: 'quarantine' as const,
    notes: ''
  });

  // Auto-calculate expiry date when collection date or component type changes
  React.useEffect(() => {
    if (formData.collection_date && formData.component_type) {
      const expiry = calculateExpiryDate(
        new Date(formData.collection_date), 
        formData.component_type
      );
      setFormData(prev => ({
        ...prev,
        expiry_date: expiry.toISOString().split('T')[0]
      }));
    }
  }, [formData.collection_date, formData.component_type]);

  // Generate bag number on dialog open
  React.useEffect(() => {
    if (dialogOpen && !formData.bag_number) {
      setFormData(prev => ({
        ...prev,
        bag_number: generateBagNumber()
      }));
    }
  }, [dialogOpen]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.bag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.blood_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodType = filterBloodType === 'all' || item.blood_type === filterBloodType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesBloodType && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validatedData = inventorySchema.parse({
        ...formData,
        volume_ml: Number(formData.volume_ml)
      });

      const { error } = await (supabase as any)
        .from('blood_inventory')
        .insert([{
          ...validatedData,
          testing_status: 'pending',
          hiv_status: 'pending',
          hbv_status: 'pending',
          hcv_status: 'pending',
          syphilis_status: 'pending',
          malaria_status: 'pending',
          notes: formData.notes || null
        }]);

      if (error) throw error;

      toast.success('Blood unit added to inventory');
      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Error adding inventory:', error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || 'Failed to add inventory');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bag_number: '',
      blood_type: 'O+',
      component_type: 'whole_blood',
      volume_ml: 450,
      collection_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      storage_location: '',
      storage_temperature: '',
      status: 'quarantine',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      available: { variant: 'default', className: 'bg-green-500' },
      quarantine: { variant: 'secondary', className: 'bg-yellow-500' },
      reserved: { variant: 'outline', className: 'border-blue-500 text-blue-500' },
      issued: { variant: 'outline', className: 'border-purple-500 text-purple-500' },
      used: { variant: 'secondary', className: 'bg-gray-500' },
      expired: { variant: 'destructive', className: '' },
      discarded: { variant: 'destructive', className: '' }
    };
    const config = variants[status] || variants.quarantine;
    return <Badge className={config.className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { color: 'text-red-500', icon: XCircle, label: 'Expired' };
    if (days <= 7) return { color: 'text-yellow-500', icon: AlertTriangle, label: `${days}d left` };
    return { color: 'text-green-500', icon: CheckCircle2, label: `${days}d left` };
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('blood_inventory')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Blood Inventory
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
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Blood Unit to Inventory</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bag_number">Bag Number</Label>
                      <Input
                        id="bag_number"
                        value={formData.bag_number}
                        onChange={(e) => setFormData({ ...formData, bag_number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type</Label>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="component_type">Component Type</Label>
                      <Select
                        value={formData.component_type}
                        onValueChange={(value: any) => setFormData({ ...formData, component_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPONENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {COMPONENT_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volume_ml">Volume (mL)</Label>
                      <Input
                        id="volume_ml"
                        type="number"
                        value={formData.volume_ml}
                        onChange={(e) => setFormData({ ...formData, volume_ml: parseInt(e.target.value) || 0 })}
                        min={1}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collection_date">Collection Date</Label>
                      <Input
                        id="collection_date"
                        type="date"
                        value={formData.collection_date}
                        onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry_date">Expiry Date</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storage_location">Storage Location</Label>
                      <Input
                        id="storage_location"
                        value={formData.storage_location}
                        onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                        placeholder="e.g., Refrigerator A-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storage_temperature">Temperature</Label>
                      <Input
                        id="storage_temperature"
                        value={formData.storage_temperature}
                        onChange={(e) => setFormData({ ...formData, storage_temperature: e.target.value })}
                        placeholder="e.g., 2-6°C"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Unit'}
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
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="quarantine">Quarantine</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="discarded">Discarded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No blood units found. Add some to get started.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bag Number</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiry_date);
                  const ExpiryIcon = expiryStatus.icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.bag_number}</TableCell>
                      <TableCell>
                        <Badge className={`${getBloodTypeColor(item.blood_type as any)} text-white`}>
                          {item.blood_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{COMPONENT_LABELS[item.component_type as keyof typeof COMPONENT_LABELS]}</TableCell>
                      <TableCell>{item.volume_ml} mL</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${expiryStatus.color}`}>
                          <ExpiryIcon className="h-4 w-4" />
                          <span className="text-sm">{expiryStatus.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.expiry_date), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>{item.storage_location || '-'}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        {item.status === 'quarantine' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(item.id, 'available')}
                          >
                            Release
                          </Button>
                        )}
                        {item.status === 'available' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(item.id, 'reserved')}
                          >
                            Reserve
                          </Button>
                        )}
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

export default BloodInventory;
