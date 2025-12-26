import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { dataManager, Patient } from '../../lib/dataManager';
import PaymentsList from '../payments/PaymentsList';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';

const paymentSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  serviceType: z.string().min(2, 'Service type is required'),
  amount: z.string().min(1, 'Amount is required'),
  paymentMethod: z.string().min(2, 'Payment method is required'),
  paymentStatus: z.string().min(2, 'Payment status is required'),
  insuranceCovered: z.string().optional(),
  copayAmount: z.string().optional(),
  notes: z.string().optional(),
  billingDate: z.string().min(1, 'Billing date is required'),
  dueDate: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentManagementFormProps {
  onClose: () => void;
  onPaymentAdded?: () => void;
}

const PaymentManagementForm: React.FC<PaymentManagementFormProps> = ({ onClose, onPaymentAdded }) => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      patientId: '',
      serviceType: '',
      amount: '',
      paymentMethod: '',
      paymentStatus: '',
      insuranceCovered: '',
      copayAmount: '',
      notes: '',
      billingDate: new Date().toISOString().split('T')[0],
      dueDate: '',
    },
  });

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientsData = await dataManager.getPatients();
        setPatients(patientsData);
      } catch (error) {
        console.error('Failed to load patients:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patients list',
          variant: 'destructive',
        });
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatients();
  }, [toast]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const paymentData = {
        patient_id: data.patientId,
        amount: parseFloat(data.amount),
        payment_method: data.paymentMethod as 'cash' | 'credit_card' | 'debit_card' | 'check' | 'insurance' | 'bank_transfer',
        payment_status: data.paymentStatus as 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded',
        description: `${data.serviceType}${data.notes ? ' - ' + data.notes : ''}`,
        payment_date: data.billingDate,
        invoice_number: `INV-${Date.now()}`,
        transaction_id: `TXN-${Date.now()}`,
      };

      await dataManager.createPayment(paymentData);
      
      toast({
        title: 'Success',
        description: 'Payment record saved successfully',
      });
      
      form.reset();
      if (onPaymentAdded) {
        onPaymentAdded();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save payment record. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Payment Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name} {patient.email ? `(${patient.email})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="diagnostic">Diagnostic Test</SelectItem>
                        <SelectItem value="emergency">Emergency Care</SelectItem>
                        <SelectItem value="lab">Laboratory Tests</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="radiology">Radiology</SelectItem>
                        <SelectItem value="therapy">Therapy</SelectItem>
                        <SelectItem value="room">Room Charges</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="250.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Save Payment
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Payments</h3>
          <div className="max-h-60 overflow-y-auto">
            <PaymentsList />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentManagementForm;
