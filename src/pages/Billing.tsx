import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import PaymentsList from '../components/payments/PaymentsList';
import PaymentManagementForm from '../components/forms/PaymentManagementForm';

const Billing: React.FC = () => {
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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
                <p className="text-3xl font-bold text-foreground">$0</p>
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
                <p className="text-3xl font-bold text-foreground">0</p>
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
                <p className="text-3xl font-bold text-foreground">0</p>
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
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <div className="w-14 h-14 bg-medical-red rounded-lg flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPaymentForm ? (
        <PaymentManagementForm onClose={() => setShowPaymentForm(false)} />
      ) : (
        <>
          <PaymentsList />
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
