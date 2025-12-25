import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Minus, 
  History, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BloodGroup {
  group_id: string;
  group_name: string;
}

interface BloodStock {
  stock_id: string;
  blood_group_id: string;
  total_units: number;
  updated_at: string | null;
  blood_group?: BloodGroup;
}

interface StockTransaction {
  transaction_id: string;
  blood_group_id: string;
  transaction_type: string;
  units: number;
  previous_balance: number;
  new_balance: number;
  source: string | null;
  notes: string | null;
  created_at: string;
  blood_group?: BloodGroup;
}

const BloodStockManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'issue'>('add');
  const [activeTab, setActiveTab] = useState('stock');
  
  const [formData, setFormData] = useState({
    blood_group_id: '',
    units: '',
    source: '',
    notes: '',
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

  const fetchStocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blood_stock')
        .select(`
          *,
          blood_group:blood_group_id (group_id, group_name)
        `)
        .order('blood_group_id');

      if (error) throw error;
      setStocks(data || []);
    } catch (error: any) {
      console.error('Error fetching stocks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blood stock',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blood_stock_transactions')
        .select(`
          *,
          blood_group:blood_group_id (group_id, group_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBloodGroups(), fetchStocks(), fetchTransactions()]);
    setLoading(false);
  }, [fetchBloodGroups, fetchStocks, fetchTransactions]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Real-time subscription for stock updates
  useEffect(() => {
    const channel = supabase
      .channel('blood-stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blood_stock',
        },
        (payload) => {
          console.log('Stock change received:', payload);
          fetchStocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStocks]);

  const handleOpenDialog = (mode: 'add' | 'issue') => {
    setDialogMode(mode);
    setFormData({
      blood_group_id: '',
      units: '',
      source: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      blood_group_id: '',
      units: '',
      source: '',
      notes: '',
    });
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const units = parseInt(formData.units, 10);
    
    // Validate inputs
    if (!formData.blood_group_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a blood group',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(units) || units <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Units must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    if (units > 1000) {
      toast({
        title: 'Validation Error',
        description: 'Maximum 1000 units per transaction',
        variant: 'destructive',
      });
      return;
    }

    // Find current stock
    const currentStock = stocks.find(s => s.blood_group_id === formData.blood_group_id);
    const currentUnits = currentStock?.total_units || 0;

    // For issuing, check if enough stock
    if (dialogMode === 'issue' && units > currentUnits) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${currentUnits} units available. Cannot issue ${units} units.`,
        variant: 'destructive',
      });
      return;
    }

    const newBalance = dialogMode === 'add' 
      ? currentUnits + units 
      : currentUnits - units;

    // Ensure stock never goes negative
    if (newBalance < 0) {
      toast({
        title: 'Error',
        description: 'Stock cannot go negative',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Update stock
      if (currentStock) {
        const { error: updateError } = await supabase
          .from('blood_stock')
          .update({ 
            total_units: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('stock_id', currentStock.stock_id);

        if (updateError) throw updateError;
      } else {
        // Create new stock entry if doesn't exist
        const { error: insertError } = await supabase
          .from('blood_stock')
          .insert({
            blood_group_id: formData.blood_group_id,
            total_units: newBalance,
          });

        if (insertError) throw insertError;
      }

      // Log the transaction
      const { error: transactionError } = await supabase
        .from('blood_stock_transactions')
        .insert({
          blood_group_id: formData.blood_group_id,
          transaction_type: dialogMode === 'add' ? 'addition' : 'issue',
          units: units,
          previous_balance: currentUnits,
          new_balance: newBalance,
          source: formData.source.trim() || null,
          notes: formData.notes.trim() || null,
          performed_by: user?.id || null,
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Success',
        description: `Successfully ${dialogMode === 'add' ? 'added' : 'issued'} ${units} units`,
      });

      handleCloseDialog();
      fetchTransactions();
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock',
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

  const getStockStatus = (units: number) => {
    if (units === 0) return { label: 'Out of Stock', color: 'bg-destructive text-destructive-foreground' };
    if (units < 5) return { label: 'Critical', color: 'bg-red-500 text-white' };
    if (units < 10) return { label: 'Low', color: 'bg-yellow-500 text-white' };
    return { label: 'Adequate', color: 'bg-green-500 text-white' };
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'addition':
      case 'donation':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'issue':
      case 'expired':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
    }
  };

  const totalUnits = stocks.reduce((sum, s) => sum + s.total_units, 0);
  const criticalGroups = stocks.filter(s => s.total_units < 5).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Blood Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">Across all blood groups</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalGroups}</div>
            <p className="text-xs text-muted-foreground">Blood groups below 5 units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => handleOpenDialog('add')} className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
            <Button onClick={() => handleOpenDialog('issue')} variant="outline" className="flex-1 gap-2">
              <Minus className="h-4 w-4" />
              Issue Stock
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Blood Stock Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="stock" className="gap-2">
                <Package className="h-4 w-4" />
                Current Stock
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Transaction History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blood Group</TableHead>
                        <TableHead className="text-center">Units Available</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No stock data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        stocks.map((stock) => {
                          const status = getStockStatus(stock.total_units);
                          const groupName = stock.blood_group?.group_name || 'Unknown';
                          return (
                            <TableRow key={stock.stock_id}>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`font-semibold text-sm px-3 py-1 ${getBloodGroupColor(groupName)}`}
                                >
                                  {groupName}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-xl font-bold">{stock.total_units}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {stock.updated_at 
                                  ? format(new Date(stock.updated_at), 'MMM dd, yyyy HH:mm')
                                  : 'Never'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead className="text-center">Units</TableHead>
                      <TableHead>Balance Change</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No transactions recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => {
                        const groupName = tx.blood_group?.group_name || 'Unknown';
                        return (
                          <TableRow key={tx.transaction_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(tx.transaction_type)}
                                <span className="capitalize">{tx.transaction_type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`font-semibold ${getBloodGroupColor(groupName)}`}
                              >
                                {groupName}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {tx.transaction_type === 'issue' || tx.transaction_type === 'expired' 
                                ? `-${tx.units}` 
                                : `+${tx.units}`}
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">{tx.previous_balance}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">{tx.new_balance}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[150px] truncate">
                              {tx.source || '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(tx.created_at), 'MMM dd, HH:mm')}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Issue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogMode === 'add' ? (
                <>
                  <Plus className="h-5 w-5 text-green-500" />
                  Add Blood Stock
                </>
              ) : (
                <>
                  <Minus className="h-5 w-5 text-red-500" />
                  Issue Blood Stock
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={validateAndSubmit}>
            <div className="grid gap-4 py-4">
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
                    {bloodGroups.map((group) => {
                      const stock = stocks.find(s => s.blood_group_id === group.group_id);
                      return (
                        <SelectItem key={group.group_id} value={group.group_id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{group.group_name}</span>
                            <span className="text-muted-foreground text-xs">
                              ({stock?.total_units || 0} units)
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="units">Units *</Label>
                <Input
                  id="units"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  placeholder="Enter number of units"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">
                  {dialogMode === 'add' ? 'Source' : 'Recipient/Purpose'}
                </Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder={dialogMode === 'add' 
                    ? 'e.g., Donor: John Doe, External: Red Cross' 
                    : 'e.g., Patient: Jane Smith, Surgery Room 1'}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              {dialogMode === 'issue' && formData.blood_group_id && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Current stock: </span>
                    <span className="font-medium">
                      {stocks.find(s => s.blood_group_id === formData.blood_group_id)?.total_units || 0} units
                    </span>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className={dialogMode === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {dialogMode === 'add' ? 'Add Stock' : 'Issue Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodStockManagement;
