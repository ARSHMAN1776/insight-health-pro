import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, Stethoscope, Plus, Filter } from 'lucide-react';
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
import { dataManager, Appointment } from '../../lib/dataManager';
import DataTable, { Column } from '../shared/DataTable';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  type: z.enum(['consultation', 'follow-up', 'emergency', 'surgery', 'checkup']),
  symptoms: z.string().min(1, 'Symptoms/reason is required'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const AppointmentScheduler: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState(dataManager.getPatients());
  const [doctors, setDoctors] = useState(dataManager.getDoctors());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize sample data and load all data
    dataManager.initializeSampleData();
    setAppointments(dataManager.getAppointments());
    setPatients(dataManager.getPatients());
    setDoctors(dataManager.getDoctors());
  }, []);

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
        // Update existing appointment
        const updated = dataManager.updateAppointment(selectedAppointment.id, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        if (updated) {
          setAppointments(dataManager.getAppointments());
          toast({
            title: 'Success',
            description: 'Appointment updated successfully',
          });
        }
      } else {
        // Create new appointment
      const newAppointment = dataManager.createAppointment({
        ...(data as Required<AppointmentFormData>),
        followUpRequired: false,
        createdBy: 'current_user',
      });
        setAppointments(dataManager.getAppointments());
        toast({
          title: 'Success',
          description: 'Appointment scheduled successfully',
        });
      }
      
      form.reset();
      setIsDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save appointment',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    form.reset({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      symptoms: appointment.symptoms,
      notes: appointment.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = (appointment: Appointment, newStatus: Appointment['status']) => {
    const updated = dataManager.updateAppointment(appointment.id, { status: newStatus });
    if (updated) {
      setAppointments(dataManager.getAppointments());
      toast({
        title: 'Success',
        description: `Appointment marked as ${newStatus}`,
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'secondary';
      case 'in-progress': return 'outline';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      case 'no-show': return 'destructive';
      default: return 'default';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'surgery': return 'default';
      case 'consultation': return 'secondary';
      case 'follow-up': return 'outline';
      case 'checkup': return 'outline';
      default: return 'default';
    }
  };

  const columns: Column[] = [
    {
      key: 'appointmentId',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'patientId',
      label: 'Patient',
      render: (patientId, appointment) => {
        if (!appointment || !appointment.patientId) return 'Unknown';
        const patient = patients.find(p => p?.id === appointment.patientId);
        return patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'Unknown';
      },
    },
    {
      key: 'doctorId',
      label: 'Doctor',
      render: (doctorId, appointment) => {
        if (!appointment || !appointment.doctorId) return 'Unknown';
        const doctor = doctors.find(d => d?.id === appointment.doctorId);
        return doctor ? `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() : 'Unknown';
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: 'time',
      label: 'Time',
      sortable: true,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (duration) => `${duration} min`,
    },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <Badge variant={getTypeBadgeVariant(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status, appointment) => (
        <Select
          value={status}
          onValueChange={(newStatus) => handleStatusUpdate(appointment, newStatus as Appointment['status'])}
        >
          <SelectTrigger className="w-32">
            <SelectValue>
              <Badge variant={getStatusBadgeVariant(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-medical-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-xl font-bold">
                  {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-medical-green" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-xl font-bold">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-medical-purple" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">
                  {appointments.filter(a => a.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-medical-orange" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Table */}
      <DataTable
        title="Appointments"
        columns={columns}
        data={appointments}
        onEdit={handleEdit}
        onDelete={(appointment) => {
          dataManager.deleteAppointment(appointment.id);
          setAppointments(dataManager.getAppointments());
          toast({
            title: 'Success',
            description: 'Appointment deleted successfully',
          });
        }}
        onAdd={() => {
          setSelectedAppointment(null);
          form.reset();
          setIsDialogOpen(true);
        }}
        addButtonText="Schedule Appointment"
      />

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName} ({patient.patientId})
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
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          step="15" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms/Reason for Visit</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe symptoms or reason for appointment..."
                        {...field}
                      />
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
                      <Textarea 
                        placeholder="Any additional notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {selectedAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                </Button>
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
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentScheduler;