import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Package, AlertTriangle, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '../../hooks/use-toast';
import { dataManager, Inventory } from '../../lib/dataManager';
import DataTable, { Column } from '../shared/DataTable';

const inventorySchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['medication', 'equipment', 'supplies', 'consumables']),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  minStockLevel: z.number().min(0, 'Minimum stock level must be non-negative'),
  maxStockLevel: z.number().min(1, 'Maximum stock level must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  supplier: z.string().min(1, 'Supplier is required'),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>(dataManager.loadData('inventory'));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const { toast } = useToast();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      category: 'supplies',
      description: '',
      quantity: 0,
      unit: '',
      minStockLevel: 0,
      maxStockLevel: 100,
      unitPrice: 0,
      supplier: '',
      expiryDate: '',
      batchNumber: '',
      location: '',
    },
  });

  const createInventoryItem = (itemData: InventoryFormData): Inventory => {
    const newItem: Inventory = {
      ...(itemData as Required<InventoryFormData>),
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      itemId: `ITM${Date.now().toString().substr(-8)}`,
      status: itemData.quantity <= itemData.minStockLevel ? 'low_stock' : 
              itemData.quantity === 0 ? 'out_of_stock' : 'available',
      lastRestocked: new Date().toISOString(),
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check expiry date
    if (itemData.expiryDate && new Date(itemData.expiryDate) <= new Date()) {
      newItem.status = 'expired';
    }

    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<Inventory>): Inventory | null => {
    const items = [...inventory];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update status based on quantity
    if (updatedItem.quantity <= updatedItem.minStockLevel) {
      updatedItem.status = 'low_stock';
    } else if (updatedItem.quantity === 0) {
      updatedItem.status = 'out_of_stock';
    } else {
      updatedItem.status = 'available';
    }

    // Check expiry date
    if (updatedItem.expiryDate && new Date(updatedItem.expiryDate) <= new Date()) {
      updatedItem.status = 'expired';
    }

    items[index] = updatedItem;
    dataManager.saveData('inventory', items);
    return updatedItem;
  };

  const onSubmit = async (data: InventoryFormData) => {
    try {
      if (selectedItem) {
        // Update existing item
        const updated = updateInventoryItem(selectedItem.id, data);
        if (updated) {
          setInventory([...inventory]);
          toast({
            title: 'Success',
            description: 'Inventory item updated successfully',
          });
        }
      } else {
        // Create new item
        const newItem = createInventoryItem(data);
        const updatedInventory = [...inventory, newItem];
        dataManager.saveData('inventory', updatedInventory);
        setInventory(updatedInventory);
        
        toast({
          title: 'Success',
          description: `Inventory item added successfully with ID: ${newItem.itemId}`,
        });
      }
      
      form.reset();
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save inventory item',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: Inventory) => {
    setSelectedItem(item);
    form.reset({
      name: item.name,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
      expiryDate: item.expiryDate || '',
      batchNumber: item.batchNumber || '',
      location: item.location,
    });
    setIsDialogOpen(true);
  };

  const handleRestock = (item: Inventory, additionalQuantity: number) => {
    const updated = updateInventoryItem(item.id, {
      quantity: item.quantity + additionalQuantity,
      lastRestocked: new Date().toISOString(),
    });
    
    if (updated) {
      setInventory(dataManager.loadData('inventory'));
      toast({
        title: 'Success',
        description: `${item.name} restocked with ${additionalQuantity} ${item.unit}`,
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'low_stock': return 'outline';
      case 'out_of_stock': return 'destructive';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'medication': return 'default';
      case 'equipment': return 'secondary';
      case 'supplies': return 'outline';
      case 'consumables': return 'outline';
      default: return 'secondary';
    }
  };

  // Calculate stats
  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(item => item.status === 'low_stock').length,
    outOfStock: inventory.filter(item => item.status === 'out_of_stock').length,
    expired: inventory.filter(item => item.status === 'expired').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
  };

  const columns: Column[] = [
    {
      key: 'itemId',
      label: 'Item ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      render: (category) => (
        <Badge variant={getCategoryBadgeVariant(category)}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (quantity, item) => (
        <div className="flex items-center space-x-2">
          <span>{quantity} {item.unit}</span>
          {item.status === 'low_stock' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          {item.status === 'out_of_stock' && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
      ),
    },
    {
      key: 'minStockLevel',
      label: 'Min Stock',
      render: (minStock, item) => `${minStock} ${item.unit}`,
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      sortable: true,
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      key: 'supplier',
      label: 'Supplier',
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-medical-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-xl font-bold text-red-600">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-medical-green" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.lowStock > 0 || stats.outOfStock > 0 || stats.expired > 0) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Inventory Alerts</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {stats.outOfStock > 0 && `${stats.outOfStock} items out of stock. `}
                  {stats.lowStock > 0 && `${stats.lowStock} items low on stock. `}
                  {stats.expired > 0 && `${stats.expired} items expired.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <DataTable
        title="Inventory Management"
        columns={columns}
        data={inventory}
        onEdit={handleEdit}
        onAdd={() => {
          setSelectedItem(null);
          form.reset();
          setIsDialogOpen(true);
        }}
        addButtonText="Add Item"
      />

      {/* Add/Edit Inventory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Inventory Item' : 'Add New Item'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Paracetamol 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="supplies">Supplies</SelectItem>
                          <SelectItem value="consumables">Consumables</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Item description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="tablets, boxes, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="Supplier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Pharmacy, Storage Room A, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Batch/Lot number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {selectedItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedItem(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;