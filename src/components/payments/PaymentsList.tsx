import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DollarSign, Calendar, CreditCard, Receipt, Trash2, FileText, Printer } from 'lucide-react';
import { dataManager } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';
import { useTimezone } from '@/hooks/useTimezone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface Payment {
  id: string;
  patient_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  description: string | null;
  invoice_number: string | null;
  transaction_id: string | null;
  patient?: {
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
}

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { formatDate } = useTimezone();
  const { user } = useAuth();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const canDeletePayments = user?.role === 'admin' || user?.role === 'receptionist';

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Fetch payments with patient data
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          patient:patients(first_name, last_name, email, phone, address)
        `)
        .is('deleted_at', null)
        .order('payment_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', selectedPayment.id);

      if (error) throw error;

      toast({
        title: 'Payment Deleted',
        description: 'The payment record has been removed.',
      });

      setDeleteDialogOpen(false);
      loadPayments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payment',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleViewInvoice = (payment: Payment) => {
    setSelectedPayment(payment);
    setInvoiceDialogOpen(true);
  };

  const handlePrintInvoice = () => {
    if (invoiceRef.current) {
      const printContent = invoiceRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${selectedPayment?.invoice_number || 'N/A'}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .invoice-header h1 { margin: 0; color: #333; }
                .invoice-header p { margin: 5px 0; color: #666; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .invoice-section { margin-bottom: 20px; }
                .invoice-section h3 { margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .invoice-section p { margin: 5px 0; color: #555; }
                .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .invoice-table th { background-color: #f5f5f5; font-weight: bold; }
                .total-row { font-weight: bold; font-size: 1.2em; }
                .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                .status-completed { background-color: #d4edda; color: #155724; }
                .status-pending { background-color: #fff3cd; color: #856404; }
                .status-failed { background-color: #f8d7da; color: #721c24; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      case 'refunded': return 'outline';
      default: return 'secondary';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return CreditCard;
      case 'cash':
        return DollarSign;
      default:
        return Receipt;
    }
  };

  const generateInvoiceNumber = (payment: Payment) => {
    return payment.invoice_number || `INV-${payment.id.slice(0, 8).toUpperCase()}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-medical-green" />
            <span>Recent Payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-medical-green" />
              <span>Recent Payments</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadPayments}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payments found</p>
              <p className="text-sm text-muted-foreground">Payments will appear here once created</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const PaymentIcon = getPaymentMethodIcon(payment.payment_method);
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medical-green/10 rounded-full flex items-center justify-center">
                        <PaymentIcon className="h-5 w-5 text-medical-green" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                          <Badge variant={getStatusBadgeVariant(payment.payment_status)}>
                            {payment.payment_status}
                          </Badge>
                        </div>
                        {payment.patient && (
                          <div className="text-sm font-medium text-foreground">
                            {payment.patient.first_name} {payment.patient.last_name}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {payment.description || 'Payment transaction'}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(payment.payment_date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Receipt className="h-3 w-3" />
                            <span>{generateInvoiceNumber(payment)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium text-medical-green">
                          {payment.payment_method.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.transaction_id || 'N/A'}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(payment)}
                        title="View Invoice"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {canDeletePayments && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(payment)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Delete Payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment of ${selectedPayment?.amount.toFixed(2)}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice</span>
              <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div ref={invoiceRef} className="space-y-6 p-4">
              {/* Invoice Header */}
              <div className="invoice-header text-center border-b-2 border-primary pb-4">
                <h1 className="text-2xl font-bold text-foreground">HOSPITAL INVOICE</h1>
                <p className="text-muted-foreground">Hospital Management System</p>
                <p className="text-sm text-muted-foreground">123 Medical Center Drive, Healthcare City</p>
              </div>

              {/* Invoice Details */}
              <div className="invoice-details grid grid-cols-2 gap-6">
                <div className="invoice-section">
                  <h3 className="font-semibold text-foreground border-b pb-2 mb-2">Bill To:</h3>
                  {selectedPayment.patient ? (
                    <>
                      <p className="font-medium">{selectedPayment.patient.first_name} {selectedPayment.patient.last_name}</p>
                      {selectedPayment.patient.email && <p className="text-sm text-muted-foreground">{selectedPayment.patient.email}</p>}
                      {selectedPayment.patient.phone && <p className="text-sm text-muted-foreground">{selectedPayment.patient.phone}</p>}
                      {selectedPayment.patient.address && <p className="text-sm text-muted-foreground">{selectedPayment.patient.address}</p>}
                    </>
                  ) : (
                    <p className="text-muted-foreground">Patient information not available</p>
                  )}
                </div>
                <div className="invoice-section text-right">
                  <h3 className="font-semibold text-foreground border-b pb-2 mb-2">Invoice Details:</h3>
                  <p><span className="text-muted-foreground">Invoice #:</span> <span className="font-medium">{generateInvoiceNumber(selectedPayment)}</span></p>
                  <p><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formatDate(selectedPayment.payment_date)}</span></p>
                  <p>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <Badge variant={getStatusBadgeVariant(selectedPayment.payment_status)} className="ml-1">
                      {selectedPayment.payment_status.toUpperCase()}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Invoice Items Table */}
              <div className="invoice-table">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Description</th>
                      <th className="border p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3">{selectedPayment.description || 'Medical Services'}</td>
                      <td className="border p-3 text-right">${selectedPayment.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted font-bold">
                      <td className="border p-3">Total</td>
                      <td className="border p-3 text-right text-lg">${selectedPayment.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Information */}
              <div className="invoice-section bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Payment Information:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-muted-foreground">Payment Method:</span> <span className="font-medium">{selectedPayment.payment_method.replace('_', ' ').toUpperCase()}</span></p>
                  <p><span className="text-muted-foreground">Transaction ID:</span> <span className="font-medium">{selectedPayment.transaction_id || 'N/A'}</span></p>
                </div>
              </div>

              {/* Footer */}
              <div className="footer text-center pt-4 border-t text-sm text-muted-foreground">
                <p>Thank you for choosing our hospital for your healthcare needs.</p>
                <p>For any questions regarding this invoice, please contact our billing department.</p>
                <p className="mt-2">Generated on: {new Date().toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentsList;
