import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '../ui/form';
import {
  phoneSchema,
  licenseNumberSchema,
  emailSchema,
  nameSchema,
  normalizePhoneInput,
  getLicenseFormatHint
} from '../../lib/formValidation';

interface Department {
  department_id: string;
  department_name: string;
  status: string;
}

const doctorSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  licenseNumber: licenseNumberSchema,
  specialty: z.string().min(2, 'Specialty is required'),
  departmentId: z.string().min(1, 'Department is required'),
  experience: z.string()
    .min(1, 'Experience is required')
    .regex(/^\d+$/, 'Experience must be a number')
    .refine((val) => parseInt(val) >= 0 && parseInt(val) <= 70, 'Experience must be between 0 and 70 years'),
  education: z.string().min(5, 'Education background is required').max(500, 'Education is too long'),
  schedule: z.string().max(200, 'Schedule is too long').optional(),
  consultationFee: z.string()
    .min(1, 'Consultation fee is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorRegistrationFormProps {
  onClose: () => void;
}

const DoctorRegistrationForm: React.FC<DoctorRegistrationFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  
  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      specialty: '',
      departmentId: '',
      experience: '',
      education: '',
      schedule: '',
      consultationFee: '',
    },
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('department_id, department_name, status')
        .eq('status', 'Active')
        .order('department_name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const onSubmit = async (data: DoctorFormData) => {
    try {
      // Get department name for the legacy department field
      const selectedDept = departments.find(d => d.department_id === data.departmentId);
      
      // Insert doctor (keep department_id for backward compatibility during transition)
      const { data: newDoctor, error } = await supabase
        .from('doctors')
        .insert([{
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          license_number: data.licenseNumber,
          specialization: data.specialty,
          department: selectedDept?.department_name || '',
          department_id: data.departmentId,
          years_of_experience: parseInt(data.experience),
          consultation_fee: parseFloat(data.consultationFee),
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Also insert into department_doctors junction table (primary source of truth)
      if (data.departmentId && newDoctor?.id) {
        const { error: junctionError } = await supabase
          .from('department_doctors')
          .insert({
            doctor_id: newDoctor.id,
            department_id: data.departmentId,
            role: 'member'
          });
        
        if (junctionError) {
          console.error('Warning: Failed to add department assignment:', junctionError);
          // Don't fail the whole operation, doctor is created
        }
      }
      
      toast({
        title: 'Success',
        description: `Doctor registered successfully with ID: ${newDoctor.id}`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error registering doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to register doctor',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Register New Doctor</CardTitle>
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
                        placeholder="Dr. John" 
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
                        placeholder="Smith" 
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
                      <Input type="email" placeholder="doctor@hospital.com" {...field} />
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
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field}
                        onChange={(e) => field.onChange(normalizePhoneInput(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Include country code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MD123456" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s/g, ''))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {getLicenseFormatHint('doctor')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="general">General Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Department <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingDepartments}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select department"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover z-50">
                      {departments.map((dept) => (
                        <SelectItem key={dept.department_id} value={dept.department_id}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                      {departments.length === 0 && !loadingDepartments && (
                        <SelectItem value="" disabled>No departments available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (years)</FormLabel>
                    <FormControl>
                      <Input placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="consultationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee</FormLabel>
                    <FormControl>
                      <Input placeholder="$200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Textarea placeholder="MD from Harvard Medical School..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule</FormLabel>
                  <FormControl>
                    <Input placeholder="Mon-Fri 9AM-5PM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Register Doctor
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

export default DoctorRegistrationForm;
