import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Building2, Plus, Edit2, Trash2, Phone, Mail, MapPin, 
  Clock, RefreshCw, Search, MoreVertical
} from 'lucide-react';
import { useSuppliers, Supplier, CreateSupplier } from '@/hooks/usePurchaseOrders';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Skeleton } from '../ui/skeleton';

const SupplierManagement: React.FC = () => {
  const { suppliers, loading, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<CreateSupplier>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    payment_terms: '',
    lead_time_days: 7,
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      payment_terms: '',
      lead_time_days: 7,
      notes: '',
    });
    setSelectedSupplier(null);
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        payment_terms: supplier.payment_terms || '',
        lead_time_days: supplier.lead_time_days,
        notes: supplier.notes || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    if (selectedSupplier) {
      await updateSupplier(selectedSupplier.id, formData);
    } else {
      await createSupplier(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selectedSupplier) {
      await deleteSupplier(selectedSupplier.id);
      setDeleteDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    await updateSupplier(supplier.id, {
      status: supplier.status === 'active' ? 'inactive' : 'active',
    });
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Suppliers</h2>
          <p className="text-muted-foreground">Manage your inventory suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSuppliers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No suppliers found</p>
            <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Supplier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    {supplier.contact_person && (
                      <CardDescription>{supplier.contact_person}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(supplier)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(supplier)}>
                          {supplier.status === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Lead time: {supplier.lead_time_days} days</span>
                </div>
                {supplier.payment_terms && (
                  <div className="pt-2">
                    <Badge variant="outline" className="text-xs">
                      {supplier.payment_terms}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier
                ? 'Update supplier information'
                : 'Add a new supplier to your inventory system'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplier Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Input
                  value={formData.payment_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_terms: e.target.value })
                  }
                  placeholder="e.g., Net 30"
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Time (days)</Label>
                <Input
                  type="number"
                  value={formData.lead_time_days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lead_time_days: parseInt(e.target.value) || 7,
                    })
                  }
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
              {selectedSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSupplier?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
