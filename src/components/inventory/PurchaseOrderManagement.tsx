import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Package, Plus, Eye, Check, X, Clock, Truck, 
  RefreshCw, FileText, Building2, Calendar, DollarSign
} from 'lucide-react';
import { usePurchaseOrders, useSuppliers, PurchaseOrder, PurchaseOrderItem } from '@/hooks/usePurchaseOrders';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';

interface InventoryItem {
  id: string;
  item_name: string;
  current_stock: number;
  minimum_stock: number | null;
  unit_price: number | null;
}

const PurchaseOrderManagement: React.FC = () => {
  const { orders, loading, stats, fetchOrders, createOrder, updateOrderStatus, getOrderItems } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{
    inventory_item_id?: string;
    item_name: string;
    quantity: number;
    unit_price: number;
  }[]>([{ item_name: '', quantity: 1, unit_price: 0 }]);

  // Load inventory items
  useEffect(() => {
    const loadInventory = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('id, item_name, current_stock, minimum_stock, unit_price')
        .order('item_name');
      if (data) setInventoryItems(data as InventoryItem[]);
    };
    loadInventory();
  }, []);

  const resetForm = () => {
    setSupplierId('');
    setExpectedDelivery('');
    setNotes('');
    setItems([{ item_name: '', quantity: 1, unit_price: 0 }]);
  };

  const handleViewOrder = async (order: PurchaseOrder) => {
    setSelectedOrder(order);
    const items = await getOrderItems(order.id);
    setOrderItems(items);
    setViewDialogOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { item_name: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price if inventory item selected
    if (field === 'inventory_item_id' && value) {
      const invItem = inventoryItems.find(i => i.id === value);
      if (invItem) {
        newItems[index].item_name = invItem.item_name;
        newItems[index].unit_price = invItem.unit_price || 0;
      }
    }
    
    setItems(newItems);
  };

  const handleCreateOrder = async () => {
    if (!supplierId || items.length === 0 || !items[0].item_name) return;

    await createOrder({
      supplier_id: supplierId,
      expected_delivery: expectedDelivery || undefined,
      notes: notes || undefined,
      items: items.filter(i => i.item_name && i.quantity > 0),
    });

    setCreateDialogOpen(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      draft: { variant: 'outline', icon: <FileText className="h-3 w-3" /> },
      submitted: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      approved: { variant: 'default', icon: <Check className="h-3 w-3" /> },
      received: { variant: 'secondary', icon: <Truck className="h-3 w-3" /> },
      cancelled: { variant: 'destructive', icon: <X className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.draft;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.received}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Manage inventory purchase orders</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No purchase orders found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.po_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {order.supplier?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {order.expected_delivery 
                          ? format(new Date(order.expected_delivery), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {order.total_amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'submitted')}
                            >
                              Submit
                            </Button>
                          )}
                          {order.status === 'submitted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'approved')}
                              className="text-green-600"
                            >
                              Approve
                            </Button>
                          )}
                          {order.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'received')}
                            >
                              Receive
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for inventory items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.filter(s => s.status === 'active').map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery</Label>
                <Input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={item.inventory_item_id || ''}
                        onValueChange={(v) => handleItemChange(index, 'inventory_item_id', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item or type custom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Custom Item</SelectItem>
                          {inventoryItems.map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.item_name} (Stock: {inv.current_stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!item.inventory_item_id && (
                      <div className="flex-1">
                        <Input
                          placeholder="Item name"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        />
                      </div>
                    )}
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        min={1}
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="w-24 text-right font-medium">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t">
                <div className="text-lg font-bold">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrder}
              disabled={!supplierId || !items[0]?.item_name}
            >
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Purchase Order #{selectedOrder?.po_number}
            </DialogTitle>
            <DialogDescription>
              Order details and items
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{selectedOrder.supplier?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.order_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Delivery</p>
                  <p className="font-medium">
                    {selectedOrder.expected_delivery 
                      ? format(new Date(selectedOrder.expected_delivery), 'MMM d, yyyy')
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${selectedOrder.total_amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderManagement;
