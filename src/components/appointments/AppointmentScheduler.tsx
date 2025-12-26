import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, Stethoscope, Plus, Building2, Filter, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
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
import { Separator } from '../ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { dataManager, Appointment, Patient, Doctor } from '../../lib/dataManager';
import DataTable, { Column } from '../shared/DataTable';

interface Department {
  department_id: string;
  department_name: string;
  status: string;
}

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  departmentId: z.string().min(1, 'Department is required'),
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  const { toast } = useToast();
  const { isRole } = useAuth();
  
  // Only administrators can approve/change appointment status
  const isAdmin = isRole('admin');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [appointmentsData, patientsData, doctorsData] = await Promise.all([
          dataManager.getAppointments(),
          dataManager.getPatients(),
          dataManager.getDoctors()
        ]);
        
        // Fetch departments
        const { data: deptData } = await supabase
          .from('departments')
          .select('department_id, department_name, status')
          .eq('status', 'Active')
          .order('department_name');
        
        setAppointments(appointmentsData);
        setPatients(patientsData);
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
        setDepartments(deptData || []);
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
      departmentId: '',
      doctorId: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      symptoms: '',
      notes: '',
    },
  });

  // Watch department selection to filter doctors
  const selectedDepartmentId = form.watch('departmentId');

  useEffect(() => {
    if (selectedDepartmentId) {
      // Filter doctors by department_id
      const filtered = doctors.filter(d => d.department_id === selectedDepartmentId);
      setFilteredDoctors(filtered);
      // Reset doctor selection when department changes
      form.setValue('doctorId', '');
    } else {
      setFilteredDoctors(doctors);
    }
  }, [selectedDepartmentId, doctors, form]);

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
        
        // Update department_id in appointments table
        await supabase
          .from('appointments')
          .update({ department_id: data.departmentId })
          .eq('id', selectedAppointment.id);
        
        toast({
          title: 'Success',
          description: 'Appointment updated successfully',
        });
      } else {
        // Create appointment with department_id
        const { error } = await supabase
          .from('appointments')
          .insert([{
            patient_id: data.patientId,
            doctor_id: data.doctorId,
            department_id: data.departmentId,
            appointment_date: data.date,
            appointment_time: data.time,
            duration: data.duration,
            type: data.type,
            symptoms: data.symptoms,
            notes: data.notes,
            status: 'scheduled',
          }]);
        
        if (error) throw error;
        
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
    
    // Find department from doctor
    const doctor = doctors.find(d => d.id === appointment.doctor_id);
    const deptId = doctor?.department_id || '';
    
    form.reset({
      patientId: appointment.patient_id,
      departmentId: deptId,
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

  const handleDelete = async (appointment: Appointment) => {
    try {
      const success = await dataManager.deleteAppointment(appointment.id);
      if (success) {
        const updatedAppointments = await dataManager.getAppointments();
        setAppointments(updatedAppointments);
        toast({
          title: 'Success',
          description: 'Appointment deleted successfully',
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete appointment.',
        variant: 'destructive',
      });
    }
  };

  // Get department name for a doctor
  const getDepartmentName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor?.department_id) {
      const dept = departments.find(d => d.department_id === doctor.department_id);
      return dept?.department_name || doctor.department || '-';
    }
    return doctor?.department || '-';
  };

  // Filter appointments by department
  const filteredAppointments = selectedDepartmentFilter === 'all' 
    ? appointments 
    : appointments.filter(a => {
        const doctor = doctors.find(d => d.id === a.doctor_id);
        return doctor?.department_id === selectedDepartmentFilter;
      });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = filteredAppointments.filter(a => a.appointment_date === today);
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
      key: 'department',
      label: 'Department',
      render: (_, appointment) => (
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <Building2 className="h-3 w-3" />
          {getDepartmentName(appointment.doctor_id)}
        </Badge>
      ),
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
        isAdmin ? (
          <Select
            value={appointment.status}
            onValueChange={(value) => handleStatusUpdate(appointment.id, value as Appointment['status'])}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={
            appointment.status === 'confirmed' ? 'default' :
            appointment.status === 'completed' ? 'secondary' :
            appointment.status === 'cancelled' ? 'destructive' :
            'outline'
          }>
            {appointment.status}
          </Badge>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authorization Status */}
      {!isAdmin && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Only administrators can approve or change appointment status. You have view-only access to appointment records.
          </AlertDescription>
        </Alert>
      )}

      {isAdmin && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Authorized as <strong>Administrator</strong> for appointment management. You can approve and manage all appointments.
          </AlertDescription>
        </Alert>
      )}

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Manage and schedule patient appointments</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Department Filter */}
              <Select value={selectedDepartmentFilter} onValueChange={setSelectedDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scroll-smooth">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                    </DialogTitle>
                    <DialogDescription>
                      Select a department first to see available doctors.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Separator />
                  
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
                              <SelectContent className="bg-popover z-50">
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
                      
                      {/* Department Selection - First */}
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              Department <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department first" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-popover z-50">
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
                      
                      {/* Doctor Selection - Filtered by Department */}
                      <FormField
                        control={form.control}
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={!selectedDepartmentId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={
                                    selectedDepartmentId 
                                      ? (filteredDoctors.length > 0 ? "Select a doctor" : "No doctors in this department")
                                      : "Select department first"
                                  } />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-popover z-50">
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
                                <SelectContent className="bg-popover z-50">
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                  <SelectItem value="follow_up">Follow-up</SelectItem>
                                  <SelectItem value="checkup">Check-up</SelectItem>
                                  <SelectItem value="emergency">Emergency</SelectItem>
                                  <SelectItem value="procedure">Procedure</SelectItem>
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
                          {selectedAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          form.reset();
                          setSelectedAppointment(null);
                          setIsDialogOpen(false);
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Appointments"
            data={filteredAppointments}
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
