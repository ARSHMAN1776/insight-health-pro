import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DollarSign, Calendar, CreditCard, Receipt, Eye } from 'lucide-react';
import { dataManager } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';
import { useTimezone } from '@/hooks/useTimezone';

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { formatDate } = useTimezone();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentsData = await dataManager.getPayments();
      setPayments(paymentsData.slice(0, 10)); // Show latest 10 payments
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
                          <span>{payment.invoice_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-medical-green">
                      {payment.payment_method.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.transaction_id || 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsList;