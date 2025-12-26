import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import PaymentsList from '../components/payments/PaymentsList';
import PaymentManagementForm from '../components/forms/PaymentManagementForm';
import { supabase } from '../integrations/supabase/client';

interface PaymentStats {
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

const Billing: React.FC = () => {
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, payment_status');

      if (error) throw error;

      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const paidCount = payments?.filter(p => p.payment_status === 'completed').length || 0;
      const pendingCount = payments?.filter(p => p.payment_status === 'pending').length || 0;
      const overdueCount = payments?.filter(p => p.payment_status === 'overdue').length || 0;

      setStats({ totalRevenue, paidCount, pendingCount, overdueCount });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshKey]);

  const handlePaymentAdded = () => {
    setShowPaymentForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage patient billing and payment records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-medical-blue rounded-lg flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-3xl font-bold text-foreground">{stats.paidCount}</p>
              </div>
              <div className="w-14 h-14 bg-medical-green rounded-lg flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingCount}</p>
              </div>
              <div className="w-14 h-14 bg-medical-orange rounded-lg flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-foreground">{stats.overdueCount}</p>
              </div>
              <div className="w-14 h-14 bg-medical-red rounded-lg flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPaymentForm ? (
        <PaymentManagementForm onClose={() => setShowPaymentForm(false)} onPaymentAdded={handlePaymentAdded} />
      ) : (
        <>
          <PaymentsList key={refreshKey} />
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowPaymentForm(true)}>
              Add New Payment
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Billing;
