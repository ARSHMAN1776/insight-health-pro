import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, Stethoscope, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '../../hooks/use-toast';
import { dataManager, Appointment, Patient, Doctor } from '../../lib/dataManager';
import DataTable, { Column } from '../shared/DataTable';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  type: z.string().min(1, 'Type is required'),
  symptoms: z.string().min(1, 'Symptoms/reason is required'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const AppointmentScheduler: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [appointmentsData, patientsData, doctorsData] = await Promise.all([
          dataManager.getAppointments(),
          dataManager.getPatients(),
          dataManager.getDoctors()
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      symptoms: '',
      notes: '',
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (selectedAppointment) {
        await dataManager.updateAppointment(selectedAppointment.id, {
          patient_id: data.patientId,
          doctor_id: data.doctorId,
          appointment_date: data.date,
          appointment_time: data.time,
          duration: data.duration,
          type: data.type,
          symptoms: data.symptoms,
          notes: data.notes,
        });
        toast({
          title: 'Success',
          description: 'Appointment updated successfully',
        });
      } else {
        await dataManager.createAppointment({
          patient_id: data.patientId,
          doctor_id: data.doctorId,
          appointment_date: data.date,
          appointment_time: data.time,
          duration: data.duration,
          type: data.type,
          symptoms: data.symptoms,
          notes: data.notes,
          status: 'scheduled',
        });
        toast({
          title: 'Success',
          description: 'Appointment scheduled successfully',
        });
      }
      
      // Refresh appointments list
      const updatedAppointments = await dataManager.getAppointments();
      setAppointments(updatedAppointments);
      
      // Reset form and close dialog
      form.reset();
      setSelectedAppointment(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    form.reset({
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      duration: appointment.duration,
      type: appointment.type,
      symptoms: appointment.symptoms,
      notes: appointment.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await dataManager.updateAppointment(appointmentId, { status: newStatus });
      const updatedAppointments = await dataManager.getAppointments();
      setAppointments(updatedAppointments);
      toast({
        title: 'Success',
        description: `Appointment marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update appointment status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (appointmentId: string) => {
    try {
      await dataManager.deleteAppointment(appointmentId);
      const updatedAppointments = await dataManager.getAppointments();
      setAppointments(updatedAppointments);
      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete appointment.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'confirmed':
        return 'secondary';
      case 'in_progress':
        return 'outline';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'no_show':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const confirmedToday = todayAppointments.filter(a => a.status === 'confirmed');
  const inProgressToday = todayAppointments.filter(a => a.status === 'in_progress');
  const completedToday = todayAppointments.filter(a => a.status === 'completed');

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (_, appointment) => appointment.id.slice(0, 8),
    },
    {
      key: 'patient_id',
      label: 'Patient',
      render: (_, appointment) => {
        const patient = patients.find(p => p.id === appointment.patient_id);
        return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
      },
    },
    {
      key: 'doctor_id',
      label: 'Doctor',
      render: (_, appointment) => {
        const doctor = doctors.find(d => d.id === appointment.doctor_id);
        return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Unknown Doctor';
      },
    },
    {
      key: 'appointment_date',
      label: 'Date',
      sortable: true,
      render: (_, appointment) => new Date(appointment.appointment_date).toLocaleDateString(),
    },
    {
      key: 'appointment_time',
      label: 'Time',
      render: (_, appointment) => appointment.appointment_time,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (_, appointment) => `${appointment.duration} min`,
    },
    {
      key: 'type',
      label: 'Type',
      render: (_, appointment) => (
        <Badge variant="outline">{appointment.type}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, appointment) => (
        <Select
          value={appointment.status}
          onValueChange={(value) => handleStatusUpdate(appointment.id, value as Appointment['status'])}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedToday.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressToday.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Appointments</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a patient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name}
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
                          <FormLabel>Doctor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors.map((doctor) => (
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="consultation">Consultation</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="surgery">Surgery</SelectItem>
                                <SelectItem value="checkup">Checkup</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="symptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symptoms/Reason</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe symptoms or reason for visit" {...field} />
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
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedAppointment(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedAppointment ? 'Update' : 'Schedule'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
        <DataTable
          title="Appointments"
          data={appointments}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentScheduler;