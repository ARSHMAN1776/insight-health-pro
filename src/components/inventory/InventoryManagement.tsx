import React, { useState, useEffect, useMemo } from 'react';
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
import { Package, Plus, Search, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, ShoppingCart } from 'lucide-react';
import DataTable from '../shared/DataTable';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

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
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState(0);
  const { toast } = useToast();

  // Calculate expiring items (within 30 days)
  const expiringItems = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const today = new Date();
    
    return inventory.filter(item => {
      if (!item.expiry_date || item.current_stock === 0) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    });
  }, [inventory]);

  // Calculate expired items
  const expiredItems = useMemo(() => {
    const today = new Date();
    return inventory.filter(item => {
      if (!item.expiry_date || item.current_stock === 0) return false;
      return new Date(item.expiry_date) < today;
    });
  }, [inventory]);

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

  const getExpiryStatus = (item: Inventory) => {
    if (!item.expiry_date) return null;
    const today = new Date();
    const expiryDate = new Date(item.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (expiryDate < today) {
      return { status: 'Expired', color: 'bg-red-500' };
    } else if (expiryDate <= thirtyDaysFromNow) {
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { status: `${daysLeft}d left`, color: 'bg-orange-500' };
    }
    return null;
  };

  const handleReorder = (item: Inventory) => {
    setSelectedItem(item);
    // Suggest reorder quantity to reach maximum stock
    setReorderQuantity(item.maximum_stock - item.current_stock);
    setIsReorderDialogOpen(true);
  };

  const handleReorderSubmit = async () => {
    if (!selectedItem || reorderQuantity <= 0) return;
    
    try {
      const newStock = selectedItem.current_stock + reorderQuantity;
      const updated = await dataManager.updateInventory(selectedItem.id, {
        current_stock: newStock,
        last_restocked: new Date().toISOString().split('T')[0],
      });
      
      if (updated) {
        setInventory(prev => prev.map(item => 
          item.id === selectedItem.id ? { ...item, current_stock: newStock, last_restocked: new Date().toISOString().split('T')[0] } : item
        ));
        toast({
          title: 'Stock Restocked',
          description: `Added ${reorderQuantity} units to ${selectedItem.item_name}`,
        });
      }
      setIsReorderDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restock item',
        variant: 'destructive',
      });
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
      label: 'Stock',
      sortable: true,
      render: (_: number, item: Inventory) => (
        <div className="flex items-center gap-2">
          <span>{item.current_stock} / {item.minimum_stock}</span>
          {item.current_stock <= item.minimum_stock && item.current_stock > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleReorder(item);
              }}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, item: Inventory) => {
        const { status, color } = getStockStatus(item);
        return (
          <Badge className={`${color} text-white`}>
            {status}
          </Badge>
        );
      },
    },
    {
      key: 'expiry_date',
      label: 'Expiry',
      render: (value: string, item: Inventory) => {
        const expiryStatus = getExpiryStatus(item);
        if (!value) return <span className="text-muted-foreground">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <span>{value}</span>
            {expiryStatus && (
              <Badge className={`${expiryStatus.color} text-white`}>
                {expiryStatus.status}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'unit_price',
      label: 'Price',
      render: (value: number) => value ? `$${value.toFixed(2)}` : 'N/A',
    },
    {
      key: 'supplier',
      label: 'Supplier',
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

      {/* Alert Cards */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0 || expiringItems.length > 0 || expiredItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Low Stock Alert</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {lowStockItems.length} item(s) need restocking
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {lowStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm bg-white/50 dark:bg-black/20 rounded p-2">
                      <span className="font-medium">{item.item_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-700 dark:text-yellow-300">{item.current_stock}/{item.minimum_stock}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2"
                          onClick={() => handleReorder(item)}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      +{lowStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Out of Stock Alert */}
          {outOfStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Out of Stock</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {outOfStockItems.length} item(s) need immediate restocking
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {outOfStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm bg-white/50 dark:bg-black/20 rounded p-2">
                      <span className="font-medium">{item.item_name}</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2"
                        onClick={() => handleReorder(item)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiring Soon Alert */}
          {expiringItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">Expiring Soon</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {expiringItems.length} item(s) expire within 30 days
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {expiringItems.slice(0, 3).map(item => {
                    const daysLeft = Math.ceil((new Date(item.expiry_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-white/50 dark:bg-black/20 rounded p-2">
                        <span className="font-medium">{item.item_name}</span>
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                          {daysLeft} days left
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expired Alert */}
          {expiredItems.length > 0 && (
            <Card className="border-red-300 bg-red-100 dark:bg-red-950/30 dark:border-red-700">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-700 mr-2" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100">Expired Items</h4>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {expiredItems.length} item(s) have expired and should be removed
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {expiredItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm bg-white/50 dark:bg-black/20 rounded p-2">
                      <span className="font-medium">{item.item_name}</span>
                      <Badge variant="destructive">Expired</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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

      {/* Reorder Dialog */}
      <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Restock Item
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold">{selectedItem.item_name}</h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current Stock:</span>
                    <span className="ml-2 font-medium">{selectedItem.current_stock}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Minimum:</span>
                    <span className="ml-2 font-medium">{selectedItem.minimum_stock}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Maximum:</span>
                    <span className="ml-2 font-medium">{selectedItem.maximum_stock}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="ml-2 font-medium">{selectedItem.supplier || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder-qty">Quantity to Add</Label>
                <Input
                  id="reorder-qty"
                  type="number"
                  min={1}
                  max={selectedItem.maximum_stock - selectedItem.current_stock}
                  value={reorderQuantity}
                  onChange={(e) => setReorderQuantity(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  New stock will be: {selectedItem.current_stock + reorderQuantity} units
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleReorderSubmit} 
                  className="flex-1"
                  disabled={reorderQuantity <= 0}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Confirm Restock
                </Button>
                <Button variant="outline" onClick={() => setIsReorderDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;