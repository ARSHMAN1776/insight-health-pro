import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { dataManager } from '../../lib/dataManager';
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
  patientName: z.string().min(2, 'Patient name is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  serviceType: z.string().min(2, 'Service type is required'),
  amount: z.string().min(1, 'Amount is required'),
  paymentMethod: z.string().min(2, 'Payment method is required'),
  paymentStatus: z.string().min(2, 'Payment status is required'),
  insuranceCovered: z.string().optional(),
  copayAmount: z.string().optional(),
  notes: z.string().optional(),
  billingDate: z.string(),
  dueDate: z.string(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentManagementFormProps {
  onClose: () => void;
}

const PaymentManagementForm: React.FC<PaymentManagementFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      patientName: '',
      patientId: '',
      serviceType: '',
      amount: '',
      paymentMethod: '',
      paymentStatus: '',
      insuranceCovered: '',
      copayAmount: '',
      notes: '',
      billingDate: '',
      dueDate: '',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      // Map form data to database schema
      const paymentData = {
        patient_id: data.patientId, // This should ideally be a UUID from patient selection
        amount: parseFloat(data.amount),
        payment_method: data.paymentMethod as 'cash' | 'credit_card' | 'debit_card' | 'check' | 'insurance' | 'bank_transfer',
        payment_status: data.paymentStatus as 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded',
        description: `${data.serviceType} - ${data.notes || 'Payment processed'}`,
        payment_date: data.billingDate,
        invoice_number: `INV-${Date.now()}`, // Generate invoice number
        transaction_id: `TXN-${Date.now()}`, // Generate transaction ID
      };

      await dataManager.createPayment(paymentData);
      
      toast({
        title: 'Success',
        description: 'Payment record saved successfully',
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Payment creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save payment record',
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                      <Input placeholder="PT001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Input placeholder="$250.00" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        <SelectItem value="debit-card">Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                        <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                name="insuranceCovered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Covered</FormLabel>
                    <FormControl>
                      <Input placeholder="$150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="copayAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copay Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="$25.00" {...field} />
                    </FormControl>
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
                    <FormLabel>Due Date</FormLabel>
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
                  <FormLabel>Notes</FormLabel>
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
        
        {/* Add Recent Payments List */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4 text-medical-blue">Recent Payments</h3>
          <div className="max-h-60 overflow-y-auto">
            <PaymentsList />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentManagementForm;