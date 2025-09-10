import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { dataManager, Inventory } from '../../lib/dataManager';
import { Package, Plus, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../shared/DataTable';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';

const inventorySchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  current_stock: z.number().min(0, 'Stock must be non-negative'),
  minimum_stock: z.number().min(0, 'Minimum stock must be non-negative'),
  maximum_stock: z.number().min(1, 'Maximum stock must be positive'),
  unit_price: z.number().min(0, 'Price must be non-negative').optional(),
  supplier: z.string().optional(),
  expiry_date: z.string().optional(),
  batch_number: z.string().optional(),
  location: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const { toast } = useToast();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      item_name: '',
      category: '',
      current_stock: 0,
      minimum_stock: 0,
      maximum_stock: 100,
      unit_price: 0,
      supplier: '',
      expiry_date: '',
      batch_number: '',
      location: '',
    },
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const items = await dataManager.getInventory();
      setInventory(items);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: InventoryFormData) => {
    try {
      if (selectedItem) {
        // Update existing item
        const updated = await dataManager.updateInventory(selectedItem.id, data);
        if (updated) {
          setInventory(prev => prev.map(item => item.id === selectedItem.id ? updated : item));
          toast({
            title: 'Success',
            description: 'Inventory item updated successfully',
          });
        }
      } else {
        // Create new item
        const newItem = await dataManager.createInventory({
          ...data,
          status: 'available' as const,
        } as Omit<Inventory, 'id' | 'created_at' | 'updated_at'>);
        setInventory(prev => [...prev, newItem]);
        toast({
          title: 'Success',
          description: 'Inventory item added successfully',
        });
      }
      
      form.reset();
      setSelectedItem(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedItem ? 'update' : 'add'} inventory item`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: Inventory) => {
    setSelectedItem(item);
    form.reset({
      item_name: item.item_name,
      category: item.category || '',
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      maximum_stock: item.maximum_stock,
      unit_price: item.unit_price || 0,
      supplier: item.supplier || '',
      expiry_date: item.expiry_date || '',
      batch_number: item.batch_number || '',
      location: item.location || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Inventory) => {
    try {
      const success = await dataManager.deleteInventory(item.id);
      if (success) {
        setInventory(prev => prev.filter(i => i.id !== item.id));
        toast({
          title: 'Success',
          description: 'Inventory item deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item',
        variant: 'destructive',
      });
    }
  };

  const getStockStatus = (item: Inventory) => {
    if (item.current_stock === 0) {
      return { status: 'Out of Stock', color: 'bg-red-500' };
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: 'Low Stock', color: 'bg-yellow-500' };
    } else {
      return { status: 'In Stock', color: 'bg-green-500' };
    }
  };

  const columns = [
    {
      key: 'item_name',
      label: 'Item Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
    },
    {
      key: 'current_stock',
      label: 'Current Stock',
      sortable: true,
    },
    {
      key: 'minimum_stock',
      label: 'Min Stock',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, item: Inventory) => {
        const { status, color } = getStockStatus(item);
        return (
          <Badge className={`${color} text-white`}>
            {status}
          </Badge>
        );
      },
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (value: number) => value ? `$${value.toFixed(2)}` : 'N/A',
    },
    {
      key: 'expiry_date',
      label: 'Expiry Date',
      render: (value: string) => value || 'N/A',
    },
  ];

  const lowStockItems = inventory.filter(item => 
    item.current_stock <= item.minimum_stock && item.current_stock > 0
  );
  const outOfStockItems = inventory.filter(item => item.current_stock === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">
                  {inventory.filter(item => item.current_stock > item.minimum_stock).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="font-semibold text-yellow-800">Low Stock Alert</h4>
                <p className="text-sm text-yellow-700">
                  {lowStockItems.length} item(s) are running low on stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <DataTable
        title="Inventory Management"
        data={inventory}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setSelectedItem(null);
          form.reset();
          setIsDialogOpen(true);
        }}
        addButtonText="Add Item"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="item_name"
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
                      <FormControl>
                        <Input placeholder="Medication" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="current_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
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
                  name="minimum_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
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
                  name="maximum_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
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
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Medical Supplies" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batch_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input placeholder="BATCH001" {...field} />
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
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Shelf A1" {...field} />
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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