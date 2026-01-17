import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, Receipt, 
  AlertTriangle, Package, DollarSign, Printer, CheckCircle,
  X, Calendar, Hash, User, CreditCard, Banknote
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface InventoryItem {
  id: string;
  item_name: string;
  current_stock: number;
  unit_price: number | null;
  batch_number: string | null;
  expiry_date: string | null;
  category: string | null;
  status: string | null;
}

interface BillItem {
  id: string;
  inventory_id: string;
  item_name: string;
  batch_number: string | null;
  expiry_date: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  available_stock: number;
}

interface Bill {
  items: BillItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  customerName: string;
  patientId: string | null;
  paymentMethod: string;
}

const PharmacyBilling: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bill, setBill] = useState<Bill>({
    items: [],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 0,
    customerName: '',
    patientId: null,
    paymentMethod: 'cash'
  });
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [completedBill, setCompletedBill] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search medicines
  const searchMedicines = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .ilike('item_name', `%${query}%`)
        .gt('current_stock', 0)
        .order('item_name')
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      // Silently handle search errors - user will see empty results
      setSearchResults([]);
      toast.error('Failed to search medicines');
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchMedicines(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchMedicines]);

  // Calculate bill totals
  const calculateTotals = useCallback((items: BillItem[], discountPercent: number, taxPercent: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxPercent) / 100;
    const totalAmount = afterDiscount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, totalAmount };
  }, []);

  // Add item to bill
  const handleAddToBill = (item: InventoryItem) => {
    // Check if already in bill
    const existingIndex = bill.items.findIndex(i => i.inventory_id === item.id);
    if (existingIndex >= 0) {
      toast.info('Item already in bill. Adjust quantity instead.');
      return;
    }
    
    setSelectedItem(item);
    setQuantity(1);
    setShowQuantityDialog(true);
  };

  const confirmAddItem = () => {
    if (!selectedItem) return;
    
    if (quantity > selectedItem.current_stock) {
      toast.error(`Only ${selectedItem.current_stock} units available`);
      return;
    }

    const newItem: BillItem = {
      id: crypto.randomUUID(),
      inventory_id: selectedItem.id,
      item_name: selectedItem.item_name,
      batch_number: selectedItem.batch_number,
      expiry_date: selectedItem.expiry_date,
      quantity: quantity,
      unit_price: selectedItem.unit_price || 0,
      total_price: (selectedItem.unit_price || 0) * quantity,
      available_stock: selectedItem.current_stock
    };

    const newItems = [...bill.items, newItem];
    const totals = calculateTotals(newItems, bill.discountPercent, bill.taxPercent);
    
    setBill(prev => ({
      ...prev,
      items: newItems,
      ...totals
    }));

    setShowQuantityDialog(false);
    setSelectedItem(null);
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`Added ${quantity} x ${selectedItem.item_name}`);
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, delta: number) => {
    setBill(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(1, Math.min(item.quantity + delta, item.available_stock));
          return {
            ...item,
            quantity: newQty,
            total_price: item.unit_price * newQty
          };
        }
        return item;
      });
      const totals = calculateTotals(newItems, prev.discountPercent, prev.taxPercent);
      return { ...prev, items: newItems, ...totals };
    });
  };

  // Remove item from bill
  const removeItem = (itemId: string) => {
    setBill(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      const totals = calculateTotals(newItems, prev.discountPercent, prev.taxPercent);
      return { ...prev, items: newItems, ...totals };
    });
  };

  // Update discount
  const updateDiscount = (percent: number) => {
    setBill(prev => {
      const totals = calculateTotals(prev.items, percent, prev.taxPercent);
      return { ...prev, discountPercent: percent, ...totals };
    });
  };

  // Update tax
  const updateTax = (percent: number) => {
    setBill(prev => {
      const totals = calculateTotals(prev.items, prev.discountPercent, percent);
      return { ...prev, taxPercent: percent, ...totals };
    });
  };

  // Clear bill
  const clearBill = () => {
    setBill({
      items: [],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      totalAmount: 0,
      customerName: '',
      patientId: null,
      paymentMethod: 'cash'
    });
  };

  // Complete bill
  const completeBill = async () => {
    if (bill.items.length === 0) {
      toast.error('Add items to the bill first');
      return;
    }

    setIsProcessing(true);
    try {
      // Create bill record
      const { data: billData, error: billError } = await supabase
        .from('pharmacy_bills')
        .insert({
          bill_number: '', // Will be auto-generated by trigger
          patient_id: bill.patientId,
          patient_name: bill.customerName || 'Walk-in Customer',
          subtotal: bill.subtotal,
          discount_percent: bill.discountPercent,
          discount_amount: bill.discountAmount,
          tax_percent: bill.taxPercent,
          tax_amount: bill.taxAmount,
          total_amount: bill.totalAmount,
          payment_method: bill.paymentMethod,
          payment_status: 'paid',
          created_by: user?.id
        })
        .select()
        .single();

      if (billError) throw billError;

      // Create bill items
      const billItems = bill.items.map(item => ({
        bill_id: billData.id,
        inventory_id: item.inventory_id,
        item_name: item.item_name,
        batch_number: item.batch_number,
        expiry_date: item.expiry_date,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('pharmacy_bill_items')
        .insert(billItems);

      if (itemsError) throw itemsError;

      // Deduct from inventory
      for (const item of bill.items) {
        const { error: stockError } = await supabase
          .from('inventory')
          .update({ 
            current_stock: item.available_stock - item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.inventory_id);

        if (stockError) {
          // Log stock update failure but don't expose to console in production
          toast.error(`Warning: Stock update failed for ${item.item_name}`);
        }
      }

      setCompletedBill({
        ...billData,
        items: bill.items,
        customerName: bill.customerName || 'Walk-in Customer'
      });
      setShowReceiptDialog(true);
      clearBill();
      toast.success('Bill completed successfully!');

    } catch (error) {
      // Handle bill completion error without exposing details to console
      toast.error('Failed to complete bill. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if item is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  // Print receipt
  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Pharmacy Billing</h2>
          <p className="text-sm text-muted-foreground">Search medicines and create bills</p>
        </div>
        {bill.items.length > 0 && (
          <Badge variant="secondary" className="w-fit text-sm px-3 py-1">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {bill.items.length} items
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Search Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Search Medicine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by medicine name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 sm:h-12 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-muted/30 to-transparent hover:from-muted/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{item.item_name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge variant={item.current_stock <= 10 ? 'destructive' : 'secondary'} className="text-xs">
                              <Package className="w-3 h-3 mr-1" />
                              Stock: {item.current_stock}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="w-3 h-3 mr-0.5" />
                              Rs. {item.unit_price?.toFixed(2) || '0.00'}
                            </Badge>
                          </div>
                          {item.expiry_date && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className={`text-xs ${isExpiringSoon(item.expiry_date) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                Exp: {format(new Date(item.expiry_date), 'MMM yyyy')}
                                {isExpiringSoon(item.expiry_date) && ' ⚠️'}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToBill(item)}
                          className="flex-shrink-0"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground mt-2">No medicines found</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground mt-2">Type to search medicines</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              Current Bill
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4">
              {/* Customer Name */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Customer Name (Optional)</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Walk-in Customer"
                    value={bill.customerName}
                    onChange={(e) => setBill(prev => ({ ...prev, customerName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bill Items */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {bill.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl">
                    <ShoppingCart className="w-10 h-10 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground mt-2">No items in bill</p>
                    <p className="text-xs text-muted-foreground">Search and add medicines</p>
                  </div>
                ) : (
                  bill.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-lg border bg-background/50 flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Rs. {item.unit_price.toFixed(2)} × {item.quantity} = Rs. {item.total_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateItemQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateItemQuantity(item.id, 1)}
                          disabled={item.quantity >= item.available_stock}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount & Tax */}
              {bill.items.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={bill.discountPercent}
                      onChange={(e) => updateDiscount(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tax %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={bill.taxPercent}
                      onChange={(e) => updateTax(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Totals */}
              {bill.items.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs. {bill.subtotal.toFixed(2)}</span>
                  </div>
                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount ({bill.discountPercent}%)</span>
                      <span>-Rs. {bill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {bill.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax ({bill.taxPercent}%)</span>
                      <span>+Rs. {bill.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">Rs. {bill.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {bill.items.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                  <Select 
                    value={bill.paymentMethod} 
                    onValueChange={(value) => setBill(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Card
                        </div>
                      </SelectItem>
                      <SelectItem value="insurance">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Insurance
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {bill.items.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={clearBill}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
                <Button 
                  onClick={completeBill}
                  disabled={bill.items.length === 0 || isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Bill
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quantity Dialog */}
      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Bill</DialogTitle>
            <DialogDescription>
              {selectedItem?.item_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Available Stock</span>
              <Badge variant="secondary">{selectedItem?.current_stock} units</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Unit Price</span>
              <span className="font-medium">Rs. {selectedItem?.unit_price?.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <Label>Quantity</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={selectedItem?.current_stock || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(Number(e.target.value) || 1, selectedItem?.current_stock || 1))}
                  className="text-center w-20"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.min(quantity + 1, selectedItem?.current_stock || 1))}
                  disabled={quantity >= (selectedItem?.current_stock || 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold text-primary">
                Rs. {((selectedItem?.unit_price || 0) * quantity).toFixed(2)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Bill Completed
            </DialogTitle>
          </DialogHeader>
          {completedBill && (
            <div className="space-y-4 py-4" id="receipt-content">
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-bold">Pharmacy Receipt</h3>
                <p className="text-sm text-muted-foreground">Bill #: {completedBill.bill_number}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(completedBill.created_at), 'PPpp')}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm"><span className="text-muted-foreground">Customer:</span> {completedBill.customerName}</p>
                <p className="text-sm"><span className="text-muted-foreground">Payment:</span> {completedBill.payment_method}</p>
              </div>

              <div className="border-t border-b py-3 space-y-2">
                {completedBill.items?.map((item: BillItem, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.item_name} × {item.quantity}</span>
                    <span>Rs. {item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {Number(completedBill.subtotal).toFixed(2)}</span>
                </div>
                {Number(completedBill.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-Rs. {Number(completedBill.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                {Number(completedBill.tax_amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>+Rs. {Number(completedBill.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>Rs. {Number(completedBill.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Thank you for your purchase!
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Close
            </Button>
            <Button onClick={printReceipt}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyBilling;