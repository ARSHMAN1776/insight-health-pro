import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Clock, User, Stethoscope, Building2, AlertCircle, Loader2, Globe, Zap, Plus, CheckCircle, ChevronRight } from 'lucide-react';
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
      {/* Trigger Card - Premium Design */}
      <Card className="overflow-hidden border bg-gradient-to-br from-primary/5 via-background to-primary/10 hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild disabled={!isVerified}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 group-hover:shadow-primary/40 transition-all flex-shrink-0">
                  <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg">Book Appointment</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isVerified ? 'Schedule a visit with your doctor' : 'Account verification required'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </CardContent>
          </DialogTrigger>

          <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl p-0">
            <DialogHeader className="p-5 pb-3 border-b sticky top-0 bg-background z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Book Appointment</DialogTitle>
                  <DialogDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                    <Globe className="w-3 h-3" />
                    Times in {getTimezoneDisplay()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 space-y-5">
                {/* Department */}
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Department
                      </FormLabel>
                      <Select 
                        onValueChange={handleDepartmentChange} 
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl text-sm">
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

                {/* Doctor */}
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-muted-foreground" />
                        Doctor
                      </FormLabel>
                      <Select 
                        onValueChange={handleDoctorChange} 
                        value={field.value}
                        disabled={loading || !form.getValues('departmentId')}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl text-sm">
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredDoctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Dr. {doctor.first_name} {doctor.last_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Emergency Toggle */}
                <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-200 dark:border-red-500/20">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Same-Day Emergency</p>
                        <p className="text-[11px] text-red-600/80 dark:text-red-400/80">For urgent medical needs</p>
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
                        <FormItem className="mt-3">
                          <FormControl>
                            <Textarea 
                              placeholder="Briefly describe why this is urgent..."
                              className="min-h-[70px] text-sm resize-none rounded-lg border-red-300 dark:border-red-500/30 focus-visible:ring-red-500"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            min={getMinDate()}
                            max={getMaxDate()}
                            value={field.value}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="h-12 rounded-xl text-sm"
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
                        <FormLabel className="text-sm font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          Time
                          {availableSlotsCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                              {availableSlotsCount} slots
                            </Badge>
                          )}
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={loadingSlots || availableSlots.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl text-sm">
                              <SelectValue placeholder={loadingSlots ? "Loading..." : "Select time"} />
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {noScheduleMessage && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{noScheduleMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Appointment Type */}
                {!isEmergencyMode && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Appointment Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl text-sm">
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
                      <FormLabel className="text-sm font-semibold">Symptoms / Reason for Visit</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your symptoms or reason for visit..."
                          className="min-h-[100px] resize-none rounded-xl text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || !form.getValues('time')}
                  className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/30"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl text-center">
          <div className="py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Appointment Booked!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your appointment has been scheduled successfully. You'll receive a confirmation shortly.
            </p>
            <Button 
              onClick={() => setSuccessDialogOpen(false)}
              className="w-full h-11 rounded-xl font-semibold"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientAppointmentBooking;
