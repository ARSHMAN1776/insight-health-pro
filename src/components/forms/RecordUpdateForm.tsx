import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';

const recordSchema = z.object({
  recordType: z.string().min(1, 'Record type is required'),
  recordId: z.string().min(1, 'Record ID is required'),
  patientName: z.string().optional(),
  doctorName: z.string().optional(),
  nurseName: z.string().optional(),
  updateField: z.string().min(1, 'Field to update is required'),
  newValue: z.string().min(1, 'New value is required'),
  reason: z.string().min(5, 'Reason for update is required'),
  notes: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface RecordUpdateFormProps {
  onClose: () => void;
}

const RecordUpdateForm: React.FC<RecordUpdateFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [recordType, setRecordType] = useState('');
  
  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      recordType: '',
      recordId: '',
      patientName: '',
      doctorName: '',
      nurseName: '',
      updateField: '',
      newValue: '',
      reason: '',
      notes: '',
    },
  });

  const onSubmit = async (data: RecordFormData) => {
    try {
      toast({
        title: 'Success',
        description: 'Record updated successfully',
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update record',
        variant: 'destructive',
      });
    }
  };

  const getFieldsForRecordType = (type: string) => {
    switch (type) {
      case 'patient':
        return [
          { value: 'firstName', label: 'First Name' },
          { value: 'lastName', label: 'Last Name' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'address', label: 'Address' },
          { value: 'emergencyContact', label: 'Emergency Contact' },
          { value: 'insuranceProvider', label: 'Insurance Provider' },
          { value: 'insuranceId', label: 'Insurance ID' },
          { value: 'medicalHistory', label: 'Medical History' },
        ];
      case 'doctor':
        return [
          { value: 'firstName', label: 'First Name' },
          { value: 'lastName', label: 'Last Name' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'specialty', label: 'Specialty' },
          { value: 'department', label: 'Department' },
          { value: 'schedule', label: 'Schedule' },
          { value: 'consultationFee', label: 'Consultation Fee' },
        ];
      case 'nurse':
        return [
          { value: 'firstName', label: 'First Name' },
          { value: 'lastName', label: 'Last Name' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'department', label: 'Department' },
          { value: 'shift', label: 'Shift' },
          { value: 'nurseType', label: 'Nurse Type' },
        ];
      case 'appointment':
        return [
          { value: 'appointmentDate', label: 'Appointment Date' },
          { value: 'appointmentTime', label: 'Appointment Time' },
          { value: 'status', label: 'Status' },
          { value: 'notes', label: 'Notes' },
        ];
      case 'payment':
        return [
          { value: 'amount', label: 'Amount' },
          { value: 'paymentMethod', label: 'Payment Method' },
          { value: 'paymentStatus', label: 'Payment Status' },
          { value: 'dueDate', label: 'Due Date' },
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Update Record</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setRecordType(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="patient">Patient Record</SelectItem>
                        <SelectItem value="doctor">Doctor Record</SelectItem>
                        <SelectItem value="nurse">Nurse Record</SelectItem>
                        <SelectItem value="appointment">Appointment Record</SelectItem>
                        <SelectItem value="payment">Payment Record</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recordId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter record ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {recordType === 'patient' && (
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
            )}

            {recordType === 'doctor' && (
              <FormField
                control={form.control}
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {recordType === 'nurse' && (
              <FormField
                control={form.control}
                name="nurseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nurse Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="updateField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field to Update</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field to update" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getFieldsForRecordType(recordType).map((fieldOption) => (
                        <SelectItem key={fieldOption.value} value={fieldOption.value}>
                          {fieldOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter new value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Update</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Please explain why this update is needed..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Update Record
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RecordUpdateForm;