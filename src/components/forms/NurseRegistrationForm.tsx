import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
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
  emailSchema,
  nameSchema,
  normalizePhoneInput,
  getLicenseFormatHint
} from '../../lib/formValidation';

// Create nurse-specific license schema
const nurseLicenseSchema = z.string()
  .min(5, 'License number must be at least 5 characters')
  .max(20, 'License number is too long')
  .regex(
    /^(RN|NP|LPN)[-]?[0-9]{5,10}$/i,
    'License format: RN/NP/LPN followed by 5-10 digits (e.g., RN123456)'
  )
  .transform((val) => val.toUpperCase().replace(/\s/g, ''));

const nurseSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  licenseNumber: nurseLicenseSchema,
  nurseType: z.string().min(2, 'Nurse type is required'),
  department: z.string().min(2, 'Department is required'),
  shift: z.string().min(2, 'Shift is required'),
  experience: z.string()
    .min(1, 'Experience is required')
    .regex(/^\d+$/, 'Experience must be a number')
    .refine((val) => parseInt(val) >= 0 && parseInt(val) <= 50, 'Experience must be between 0 and 50 years'),
  certification: z.string().max(100, 'Certification is too long').optional(),
});

type NurseFormData = z.infer<typeof nurseSchema>;

interface NurseRegistrationFormProps {
  onClose: () => void;
}

const NurseRegistrationForm: React.FC<NurseRegistrationFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  
  const form = useForm<NurseFormData>({
    resolver: zodResolver(nurseSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      nurseType: '',
      department: '',
      shift: '',
      experience: '',
      certification: '',
    },
  });

  const onSubmit = async (data: NurseFormData) => {
    try {
      // Import dataManager
      const { dataManager } = await import('../../lib/dataManager');
      
      // Create new nurse
      const newNurse = await dataManager.createNurse({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        license_number: data.licenseNumber,
        department: data.department,
        years_of_experience: parseInt(data.experience),
        specialization: data.nurseType,
        shift_schedule: data.shift,
        status: 'active' as const,
      });
      
      toast({
        title: 'Success',
        description: `Nurse registered successfully with ID: ${newNurse.id}`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register nurse',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Register New Nurse</CardTitle>
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
                        placeholder="Jane" 
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
                      <Input type="email" placeholder="nurse@hospital.com" {...field} />
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
                        placeholder="RN123456" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s/g, ''))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {getLicenseFormatHint('nurse')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nurseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nurse Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nurse type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="registered">Registered Nurse (RN)</SelectItem>
                        <SelectItem value="licensed">Licensed Practical Nurse (LPN)</SelectItem>
                        <SelectItem value="nurse-practitioner">Nurse Practitioner (NP)</SelectItem>
                        <SelectItem value="critical-care">Critical Care Nurse</SelectItem>
                        <SelectItem value="emergency">Emergency Nurse</SelectItem>
                        <SelectItem value="pediatric">Pediatric Nurse</SelectItem>
                        <SelectItem value="surgical">Surgical Nurse</SelectItem>
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="general">General Ward</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="day">Day Shift (7AM-7PM)</SelectItem>
                        <SelectItem value="night">Night Shift (7PM-7AM)</SelectItem>
                        <SelectItem value="rotating">Rotating Shift</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
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
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (years)</FormLabel>
                    <FormControl>
                      <Input placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="certification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification</FormLabel>
                    <FormControl>
                      <Input placeholder="BSN, MSN, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Register Nurse
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

export default NurseRegistrationForm;