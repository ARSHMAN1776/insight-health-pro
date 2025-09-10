import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Patient } from '../../lib/dataManager';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../ui/form';

const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  emergencyContact: z.string().min(10, 'Emergency contact must be at least 10 characters'),
  medicalHistory: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientRegistrationFormProps {
  onClose: () => void;
  editData?: Patient;
  mode?: 'create' | 'edit';
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ 
  onClose, 
  editData, 
  mode = 'create' 
}) => {
  const { toast } = useToast();
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: editData ? {
      firstName: editData.first_name,
      lastName: editData.last_name,
      email: editData.email,
      phone: editData.phone,
      dateOfBirth: editData.date_of_birth,
      gender: editData.gender?.toLowerCase() as 'male' | 'female' | 'other',
      address: editData.address,
      emergencyContact: editData.emergency_contact_name,
      medicalHistory: editData.medical_history || '',
      insuranceProvider: editData.insurance_provider,
      insuranceId: editData.insurance_policy_number,
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      emergencyContact: '',
      medicalHistory: '',
      insuranceProvider: '',
      insuranceId: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      // Import dataManager
      const { dataManager } = await import('../../lib/dataManager');
      
      if (mode === 'edit' && editData) {
        // Update existing patient
        const updatedPatient = await dataManager.updatePatient(editData.id, {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1) as 'Male' | 'Female' | 'Other',
          address: data.address,
          emergency_contact_name: data.emergencyContact,
          medical_history: data.medicalHistory,
          insurance_provider: data.insuranceProvider,
          insurance_policy_number: data.insuranceId,
        });
        
        toast({
          title: 'Success',
          description: `Patient updated successfully`,
        });
      } else {
        // Create new patient
        const newPatient = await dataManager.createPatient({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1) as 'Male' | 'Female' | 'Other',
          address: data.address,
          emergency_contact_name: data.emergencyContact,
          medical_history: data.medicalHistory,
          insurance_provider: data.insuranceProvider,
          insurance_policy_number: data.insuranceId,
          status: 'active' as const,
        });
        
        toast({
          title: 'Success',
          description: `Patient registered successfully with ID: ${newPatient.id}`,
        });
      }
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode === 'edit' ? 'update' : 'register'} patient`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === 'edit' ? 'Edit Patient' : 'Register New Patient'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto scroll-smooth px-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        {...field} 
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        {...field} 
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, City, State, ZIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Name: Phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insuranceProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="Blue Cross Blue Shield" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance ID</FormLabel>
                    <FormControl>
                      <Input placeholder="INS123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical History</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any relevant medical history..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {mode === 'edit' ? 'Update Patient' : 'Register Patient'}
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

export default PatientRegistrationForm;