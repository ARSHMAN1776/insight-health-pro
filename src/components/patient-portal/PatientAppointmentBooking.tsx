import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Clock, User, Stethoscope, Building2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Patient } from '../../lib/dataManager';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { TimeSlot, getAvailableTimeSlots, DAY_NAMES } from '@/lib/scheduleUtils';

interface Department {
  department_id: string;
  department_name: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  department_id?: string;
  consultation_fee?: number;
}

const appointmentSchema = z.object({
  departmentId: z.string().min(1, 'Please select a department'),
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  type: z.string().min(1, 'Please select appointment type'),
  symptoms: z.string()
    .min(10, 'Please describe your symptoms (at least 10 characters)')
    .max(500, 'Symptoms description too long (max 500 characters)'),
  notes: z.string().max(500, 'Notes too long (max 500 characters)').optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface PatientAppointmentBookingProps {
  patientData: Patient | null;
  onAppointmentBooked?: () => void;
}

const PatientAppointmentBooking: React.FC<PatientAppointmentBookingProps> = ({ 
  patientData, 
  onAppointmentBooked 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [noScheduleMessage, setNoScheduleMessage] = useState<string | null>(null);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      departmentId: '',
      doctorId: '',
      date: '',
      time: '',
      type: '',
      symptoms: '',
      notes: '',
    },
  });

  // Fetch departments and doctors on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deptResult, doctorResult] = await Promise.all([
          supabase
            .from('departments')
            .select('department_id, department_name')
            .eq('status', 'Active')
            .order('department_name'),
          supabase
            .from('doctors')
            .select('id, first_name, last_name, specialization, department_id, consultation_fee')
            .eq('status', 'active')
            .order('last_name')
        ]);

        if (deptResult.data) setDepartments(deptResult.data);
        if (doctorResult.data) {
          setDoctors(doctorResult.data);
          setFilteredDoctors(doctorResult.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isDialogOpen) {
      loadData();
    }
  }, [isDialogOpen]);

  // Filter doctors when department changes
  const handleDepartmentChange = (departmentId: string) => {
    form.setValue('departmentId', departmentId);
    form.setValue('doctorId', ''); // Reset doctor selection
    form.setValue('time', ''); // Reset time selection
    setAvailableSlots([]);
    setNoScheduleMessage(null);
    
    if (departmentId) {
      const filtered = doctors.filter(d => d.department_id === departmentId);
      setFilteredDoctors(filtered.length > 0 ? filtered : doctors);
    } else {
      setFilteredDoctors(doctors);
    }
  };

  // Handle doctor change - reset time slots
  const handleDoctorChange = (doctorId: string) => {
    form.setValue('doctorId', doctorId);
    form.setValue('time', ''); // Reset time when doctor changes
    setAvailableSlots([]);
    setNoScheduleMessage(null);
    
    // If date is already selected, fetch available slots
    const selectedDate = form.getValues('date');
    if (selectedDate && doctorId) {
      fetchAvailableSlots(doctorId, selectedDate);
    }
  };

  // Handle date change - fetch available slots
  const handleDateChange = (date: string) => {
    form.setValue('date', date);
    form.setValue('time', ''); // Reset time when date changes
    setAvailableSlots([]);
    setNoScheduleMessage(null);
    
    const selectedDoctorId = form.getValues('doctorId');
    if (selectedDoctorId && date) {
      fetchAvailableSlots(selectedDoctorId, date);
    }
  };

  // Fetch available time slots based on doctor schedule
  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    setNoScheduleMessage(null);
    
    try {
      const slots = await getAvailableTimeSlots(doctorId, date);
      
      // Check if no schedule is set
      if (slots.length === 1 && !slots[0].available && !slots[0].time) {
        setNoScheduleMessage(slots[0].reason || 'No schedule available');
        setAvailableSlots([]);
      } else {
        setAvailableSlots(slots);
        setNoScheduleMessage(null);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setNoScheduleMessage('Error loading available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!patientData?.id) {
      toast({
        title: "Error",
        description: "Patient record not found. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      // Create appointment with 'requested' status (pending confirmation)
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.id,
          doctor_id: data.doctorId,
          department_id: data.departmentId,
          appointment_date: data.date,
          appointment_time: data.time,
          type: data.type,
          symptoms: data.symptoms.trim(),
          notes: data.notes?.trim() || null,
          status: 'scheduled', // Will be confirmed by staff
          duration: 30
        });

      if (error) throw error;

      // Create notification for the doctor and receptionists
      const { data: staffUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['receptionist', 'admin']);

      if (staffUsers) {
        const notifications = staffUsers.map(staff => ({
          user_id: staff.user_id,
          title: 'New Appointment Request',
          message: `${patientData.first_name} ${patientData.last_name} has requested an appointment for ${data.date} at ${data.time}.`,
          type: 'appointment_request',
          priority: 'normal',
          action_url: '/appointments',
          metadata: {
            patient_name: `${patientData.first_name} ${patientData.last_name}`,
            appointment_date: data.date,
            appointment_time: data.time,
            appointment_type: data.type
          }
        }));

        await supabase.from('notifications').insert(notifications);
      }

      setIsDialogOpen(false);
      setSuccessDialogOpen(true);
      form.reset();
      onAppointmentBooked?.();

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'check-up', label: 'Routine Check-up' },
    { value: 'specialist', label: 'Specialist Consultation' },
    { value: 'emergency', label: 'Urgent Care' },
  ];

  // Fallback time slots (used if no schedule is set)
  const fallbackTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Get available slot count for display
  const availableSlotsCount = availableSlots.filter(s => s.available).length;

  // Check if patient is verified
  const isVerified = patientData?.status === 'active';

  return (
    <>
      <Card className="card-gradient border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Book an Appointment</h3>
                <p className="text-sm text-muted-foreground">
                  {isVerified 
                    ? 'Schedule a visit with one of our healthcare professionals'
                    : 'Your account must be verified to book appointments'
                  }
                </p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-hover"
                  disabled={!isVerified}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="w-6 h-6 text-primary" />
                    Request an Appointment
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details below to request an appointment. Our staff will confirm your booking.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    {/* Department & Doctor Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              Department
                            </FormLabel>
                            <Select 
                              onValueChange={handleDepartmentChange} 
                              value={field.value}
                              disabled={loading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.department_id} value={dept.department_id}>
                                    {dept.department_name}
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
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4" />
                              Doctor
                            </FormLabel>
                            <Select 
                              onValueChange={handleDoctorChange} 
                              value={field.value}
                              disabled={loading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select doctor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredDoctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Date & Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Preferred Date
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={getMinDate()}
                                max={getMaxDate()}
                                value={field.value}
                                onChange={(e) => handleDateChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Available Time Slots
                              {loadingSlots && <Loader2 className="w-3 h-3 animate-spin" />}
                              {!loadingSlots && availableSlots.length > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                  {availableSlotsCount} available
                                </Badge>
                              )}
                            </FormLabel>
                            
                            {noScheduleMessage ? (
                              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
                                  {noScheduleMessage}
                                </AlertDescription>
                              </Alert>
                            ) : !form.getValues('doctorId') || !form.getValues('date') ? (
                              <Select disabled>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select doctor and date first" />
                                  </SelectTrigger>
                                </FormControl>
                              </Select>
                            ) : loadingSlots ? (
                              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Loading available slots...</span>
                              </div>
                            ) : availableSlots.length === 0 ? (
                              <Alert className="bg-muted">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  No time slots available. Please try a different date.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time slot" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableSlots.map((slot) => (
                                    <SelectItem 
                                      key={slot.time} 
                                      value={slot.time}
                                      disabled={!slot.available}
                                    >
                                      <span className={!slot.available ? 'line-through text-muted-foreground' : ''}>
                                        {slot.time}
                                      </span>
                                      {!slot.available && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                          ({slot.reason})
                                        </span>
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Appointment Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Appointment Type
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select appointment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {appointmentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Symptoms */}
                    <FormField
                      control={form.control}
                      name="symptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Symptoms / Reason for Visit <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe your symptoms or reason for this appointment..."
                              className="min-h-[100px] resize-none"
                              maxLength={500}
                              {...field} 
                            />
                          </FormControl>
                          <div className="flex justify-between">
                            <FormMessage />
                            <span className="text-xs text-muted-foreground">
                              {field.value?.length || 0}/500
                            </span>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Additional Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information you'd like to share..."
                              className="min-h-[80px] resize-none"
                              maxLength={500}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Alert className="bg-info/10 border-info/20">
                      <AlertCircle className="h-4 w-4 text-info" />
                      <AlertDescription className="text-sm">
                        Your appointment request will be reviewed by our staff. You'll receive a confirmation
                        once it's approved. Please arrive 15 minutes before your scheduled time.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="min-w-[140px]"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          'Request Appointment'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {!isVerified && (
            <Alert className="mt-4 bg-warning/10 border-warning/20">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>
                Your account is pending verification. Please wait for hospital staff to approve your registration.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md text-center">
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-xl mb-2">Appointment Requested!</DialogTitle>
            <DialogDescription className="text-center">
              Your appointment request has been submitted successfully. Our staff will review and confirm 
              your booking shortly. You'll see the status update in your appointments list.
            </DialogDescription>
          </div>
          <DialogFooter className="justify-center">
            <Button onClick={() => setSuccessDialogOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientAppointmentBooking;
