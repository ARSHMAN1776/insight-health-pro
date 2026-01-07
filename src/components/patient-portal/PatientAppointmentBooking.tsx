import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Clock, User, Stethoscope, Building2, AlertCircle, Loader2, Globe, Zap, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
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
import { useTimezone } from '@/hooks/useTimezone';
import { Switch } from '../ui/switch';

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
  isEmergency: z.boolean().optional(),
  emergencyReason: z.string().max(300, 'Emergency reason too long').optional(),
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
  const { timezone, getCurrentDate, getTimezoneDisplay } = useTimezone();
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
  const [departmentDoctorsMap, setDepartmentDoctorsMap] = useState<{department_id: string; doctor_id: string}[]>([]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

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
      isEmergency: false,
      emergencyReason: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deptResult, doctorResult, deptDoctorsResult] = await Promise.all([
          supabase
            .from('departments')
            .select('department_id, department_name')
            .eq('status', 'Active')
            .order('department_name'),
          supabase
            .from('doctors')
            .select('id, first_name, last_name, specialization, department_id, consultation_fee')
            .eq('status', 'active')
            .order('last_name'),
          supabase
            .from('department_doctors')
            .select('department_id, doctor_id')
        ]);

        if (deptResult.data) setDepartments(deptResult.data);
        if (doctorResult.data) {
          setDoctors(doctorResult.data);
          setFilteredDoctors(doctorResult.data);
        }
        if (deptDoctorsResult.data) setDepartmentDoctorsMap(deptDoctorsResult.data);
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

  const handleDepartmentChange = (departmentId: string) => {
    form.setValue('departmentId', departmentId);
    form.setValue('doctorId', '');
    form.setValue('time', '');
    setAvailableSlots([]);
    setNoScheduleMessage(null);
    
    if (departmentId) {
      const assignedDoctorIds = departmentDoctorsMap
        .filter(dd => dd.department_id === departmentId)
        .map(dd => dd.doctor_id);
      
      const filtered = doctors.filter(d => 
        d.department_id === departmentId || 
        assignedDoctorIds.includes(d.id)
      );
      setFilteredDoctors(filtered.length > 0 ? filtered : []);
    } else {
      setFilteredDoctors(doctors);
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    form.setValue('doctorId', doctorId);
    form.setValue('time', '');
    setAvailableSlots([]);
    setNoScheduleMessage(null);
    
    const selectedDate = form.getValues('date');
    if (selectedDate && doctorId) {
      fetchAvailableSlots(doctorId, selectedDate);
    }
  };

  const handleDateChange = (date: string) => {
    form.setValue('date', date);
    form.setValue('time', '');
    setAvailableSlots([]);
    setNoScheduleMessage(null);
    
    const selectedDoctorId = form.getValues('doctorId');
    if (selectedDoctorId && date) {
      fetchAvailableSlots(selectedDoctorId, date);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    setNoScheduleMessage(null);
    
    try {
      const slots = await getAvailableTimeSlots(doctorId, date);
      
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

  const getMinDate = () => {
    const currentDate = getCurrentDate();
    if (isEmergencyMode) {
      return currentDate;
    }
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const currentDate = getCurrentDate();
    const maxDate = new Date(currentDate);
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

      const appointmentStatus = data.isEmergency ? 'pending' : 'scheduled';
      const appointmentNotes = data.isEmergency && data.emergencyReason
        ? `EMERGENCY REQUEST: ${data.emergencyReason}\n\n${data.notes?.trim() || ''}`
        : data.notes?.trim() || null;
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.id,
          doctor_id: data.doctorId,
          department_id: data.departmentId,
          appointment_date: data.date,
          appointment_time: data.time,
          type: data.isEmergency ? 'emergency' : data.type,
          symptoms: data.symptoms.trim(),
          notes: appointmentNotes,
          status: appointmentStatus,
          duration: 30
        });

      if (error) throw error;

      setIsDialogOpen(false);
      setSuccessDialogOpen(true);
      setIsEmergencyMode(false);
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

  const availableSlotsCount = availableSlots.filter(s => s.available).length;
  const isVerified = patientData?.status === 'active';

  return (
    <>
      {/* Trigger Card */}
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">Book Appointment</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {isVerified ? 'Schedule a visit' : 'Account verification required'}
                </p>
              </div>
            </CardContent>
          </DialogTrigger>

          <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-4 pb-2 border-b sticky top-0 bg-background z-10">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Book Appointment
              </DialogTitle>
              <DialogDescription className="text-xs flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                Times shown in {getTimezoneDisplay()}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
                {/* Department & Doctor */}
                <div className="grid grid-cols-1 gap-3">
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          Department
                        </FormLabel>
                        <Select 
                          onValueChange={handleDepartmentChange} 
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5" />
                          Doctor
                        </FormLabel>
                        <Select 
                          onValueChange={handleDoctorChange} 
                          value={field.value}
                          disabled={loading || !form.getValues('departmentId')}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredDoctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.first_name} {doctor.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Emergency Toggle */}
                <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/20">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-destructive" />
                      <div>
                        <p className="text-sm font-medium">Emergency Same-Day</p>
                        <p className="text-[10px] text-muted-foreground">Request urgent care</p>
                      </div>
                    </div>
                    <Switch 
                      checked={isEmergencyMode}
                      onCheckedChange={(checked) => {
                        setIsEmergencyMode(checked);
                        form.setValue('isEmergency', checked);
                        if (checked) {
                          form.setValue('type', 'emergency');
                          form.setValue('date', getCurrentDate());
                        } else {
                          form.setValue('type', '');
                          form.setValue('date', '');
                        }
                        form.setValue('time', '');
                        setAvailableSlots([]);
                      }}
                    />
                  </div>
                  {isEmergencyMode && (
                    <FormField
                      control={form.control}
                      name="emergencyReason"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <Textarea 
                              placeholder="Why is this an emergency?"
                              className="min-h-[60px] text-sm resize-none border-destructive/30"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            min={getMinDate()}
                            max={getMaxDate()}
                            value={field.value}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="h-10 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Time
                          {!loadingSlots && availableSlotsCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] ml-1">
                              {availableSlotsCount}
                            </Badge>
                          )}
                        </FormLabel>
                        
                        {noScheduleMessage ? (
                          <Alert className="py-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              {noScheduleMessage}
                            </AlertDescription>
                          </Alert>
                        ) : !form.getValues('doctorId') || !form.getValues('date') ? (
                          <Select disabled>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select date first" />
                              </SelectTrigger>
                            </FormControl>
                          </Select>
                        ) : loadingSlots ? (
                          <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-xs text-muted-foreground">Loading...</span>
                          </div>
                        ) : (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableSlots.filter(s => s.available).map((slot) => (
                                <SelectItem key={slot.time} value={slot.time}>
                                  {slot.time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Type */}
                {!isEmergencyMode && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Appointment Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select type" />
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Symptoms */}
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Symptoms / Reason <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your symptoms..."
                          className="min-h-[80px] text-sm resize-none"
                          maxLength={500}
                          {...field} 
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage className="text-xs" />
                        <span className="text-[10px] text-muted-foreground">
                          {field.value?.length || 0}/500
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={submitting}
                    className="flex-1 h-10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 h-10"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Book Appointment'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-sm mx-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <DialogTitle className="text-lg">Appointment Requested!</DialogTitle>
          <DialogDescription className="text-sm">
            Your appointment request has been submitted. You'll receive a confirmation soon.
          </DialogDescription>
          <Button onClick={() => setSuccessDialogOpen(false)} className="w-full mt-4">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientAppointmentBooking;
