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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Minus, 
  History, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  stockAdditionSchema,
  sanitizeInput,
  sanitizeUnits,
  calculateNewBalance,
  isValidUUID,
  createAuditEntry,
  formatAuditLog,
  getUserFriendlyError,
  ERROR_MESSAGES,
  getAuthorizationError,
} from '@/lib/bloodBankValidation';
import { z } from 'zod';

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

// Allowed roles for stock management
const AUTHORIZED_ROLES = ['admin', 'doctor', 'nurse'] as const;

const BloodStockManagement: React.FC = () => {
  const { user, isRole } = useAuth();
  const { toast } = useToast();
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'issue'>('add');
  const [activeTab, setActiveTab] = useState('stock');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    blood_group_id: '',
    units: '',
    source: '',
    notes: '',
  });

  // Authorization check
  const isAuthorized = user && AUTHORIZED_ROLES.some(role => isRole(role));
  const userRole = user ? (isRole('admin') ? 'admin' : isRole('doctor') ? 'doctor' : isRole('nurse') ? 'nurse' : null) : null;

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
    setValidationErrors({});

    // Authorization check
    if (!isAuthorized || !user) {
      toast({
        title: 'Access Denied',
        description: getAuthorizationError(userRole),
        variant: 'destructive',
      });
      return;
    }

    // Sanitize inputs
    const sanitizedUnitsValue = sanitizeUnits(formData.units);
    const sanitizedSource = sanitizeInput(formData.source);
    const sanitizedNotes = sanitizeInput(formData.notes);

    const errors: Record<string, string> = {};
    
    // Validate blood group ID
    if (!formData.blood_group_id || !isValidUUID(formData.blood_group_id)) {
      errors.blood_group_id = 'Please select a valid blood group';
    }

    // Validate units
    if (sanitizedUnitsValue <= 0) {
      errors.units = ERROR_MESSAGES.INVALID_UNITS;
    } else if (sanitizedUnitsValue > 1000) {
      errors.units = ERROR_MESSAGES.MAX_UNITS_EXCEEDED;
    }

    // Find current stock
    const currentStock = stocks.find(s => s.blood_group_id === formData.blood_group_id);
    const currentUnits = currentStock?.total_units || 0;

    // For issuing, validate stock availability
    if (dialogMode === 'issue') {
      if (sanitizedUnitsValue > currentUnits) {
        errors.units = `${ERROR_MESSAGES.INSUFFICIENT_STOCK} Only ${currentUnits} units available.`;
      }
    }

    // Calculate new balance with safety check
    const balanceResult = calculateNewBalance(
      currentUnits,
      sanitizedUnitsValue,
      dialogMode
    );

    if (!balanceResult.valid) {
      errors.units = balanceResult.error || ERROR_MESSAGES.INVALID_UNITS;
    }

    // CRITICAL: Final negative stock check
    if (balanceResult.newBalance < 0) {
      errors.units = ERROR_MESSAGES.NEGATIVE_STOCK;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: 'Validation Error',
        description: Object.values(errors)[0],
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    // Create audit entry
    const auditEntry = createAuditEntry(
      dialogMode === 'add' ? 'ADD_STOCK' : 'REMOVE_STOCK',
      'blood_stock',
      formData.blood_group_id,
      user.id,
      userRole,
      {
        operation: dialogMode,
        units: sanitizedUnitsValue,
        previous_balance: currentUnits,
        new_balance: balanceResult.newBalance,
        source: sanitizedSource,
      }
    );
    console.log(formatAuditLog(auditEntry));

    try {
      // Get fresh stock data to prevent race conditions
      const { data: freshStock, error: fetchError } = await supabase
        .from('blood_stock')
        .select('*')
        .eq('blood_group_id', formData.blood_group_id)
        .maybeSingle();

      if (fetchError) throw new Error(ERROR_MESSAGES.DATABASE_ERROR);

      const freshUnits = freshStock?.total_units || 0;
      
      // Recalculate with fresh data
      const freshBalanceResult = calculateNewBalance(
        freshUnits,
        sanitizedUnitsValue,
        dialogMode
      );

      if (!freshBalanceResult.valid) {
        throw new Error(freshBalanceResult.error);
      }

      // CRITICAL: Final negative stock prevention
      if (freshBalanceResult.newBalance < 0) {
        throw new Error(ERROR_MESSAGES.NEGATIVE_STOCK);
      }

      // Update stock
      if (freshStock) {
        const { error: updateError } = await supabase
          .from('blood_stock')
          .update({ 
            total_units: freshBalanceResult.newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('stock_id', freshStock.stock_id);

        if (updateError) throw updateError;
      } else {
        // Create new stock entry if doesn't exist (only for additions)
        if (dialogMode === 'issue') {
          throw new Error('Cannot issue from non-existent stock');
        }
        
        const { error: insertError } = await supabase
          .from('blood_stock')
          .insert({
            blood_group_id: formData.blood_group_id,
            total_units: freshBalanceResult.newBalance,
          });

        if (insertError) throw insertError;
      }

      // Log the transaction for audit trail
      const transactionNotes = `${dialogMode === 'add' ? 'Added' : 'Issued'} by ${userRole}. ${sanitizedNotes}`.trim();
      
      const { error: transactionError } = await supabase
        .from('blood_stock_transactions')
        .insert({
          blood_group_id: formData.blood_group_id,
          transaction_type: dialogMode === 'add' ? 'addition' : 'issue',
          units: sanitizedUnitsValue,
          previous_balance: freshUnits,
          new_balance: freshBalanceResult.newBalance,
          source: sanitizedSource || null,
          notes: transactionNotes || null,
          performed_by: user.id,
        });

      if (transactionError) {
        console.error('[AUDIT WARNING] Transaction log failed:', transactionError);
      }

      // Success audit log
      console.log(`[AUDIT SUCCESS] Stock ${dialogMode}: ${sanitizedUnitsValue} units by ${userRole} (${user.id}). Balance: ${freshUnits} → ${freshBalanceResult.newBalance}`);

      toast({
        title: 'Success',
        description: `Successfully ${dialogMode === 'add' ? 'added' : 'issued'} ${sanitizedUnitsValue} units`,
      });

      handleCloseDialog();
      fetchTransactions();
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyError(error);
      console.error(`[AUDIT FAILURE] Stock ${dialogMode} failed:`, errorMessage, error);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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
      {/* Authorization Status */}
      {!isAuthorized && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            {user ? getAuthorizationError(userRole) : ERROR_MESSAGES.NOT_AUTHENTICATED}
          </AlertDescription>
        </Alert>
      )}

      {isAuthorized && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Authorized as <strong>{userRole}</strong> for stock management. All actions are logged.
          </AlertDescription>
        </Alert>
      )}

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
            <Button 
              onClick={() => handleOpenDialog('add')} 
              className="flex-1 gap-2"
              disabled={!isAuthorized}
            >
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
            <Button 
              onClick={() => handleOpenDialog('issue')} 
              variant="outline" 
              className="flex-1 gap-2"
              disabled={!isAuthorized}
            >
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
                <Label htmlFor="units">Units * {dialogMode === 'add' ? '(max 1000)' : '(max available)'}</Label>
                <Input
                  id="units"
                  type="number"
                  min="1"
                  max={dialogMode === 'add' ? '1000' : '100'}
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  placeholder="Enter number of units"
                  className={validationErrors.units ? 'border-destructive' : ''}
                  required
                />
                {validationErrors.units && (
                  <p className="text-sm text-destructive">{validationErrors.units}</p>
                )}
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
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className={dialogMode === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                disabled={!isAuthorized || submitting}
              >
                {submitting ? 'Processing...' : dialogMode === 'add' ? 'Add Stock' : 'Issue Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodStockManagement;
