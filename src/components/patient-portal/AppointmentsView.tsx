import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock, User, MapPin, FileText, X, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Appointment, Patient, dataManager } from '../../lib/dataManager';
import PatientAppointmentBooking from './PatientAppointmentBooking';
import WaitlistSignup from '../appointments/WaitlistSignup';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentsViewProps {
  appointments: Appointment[];
  loading: boolean;
  patientData?: Patient | null;
  onAppointmentBooked?: () => void;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ 
  appointments, 
  loading, 
  patientData,
  onAppointmentBooked 
}) => {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'scheduled':
        return 'bg-info/10 text-info border-info/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'completed':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant="outline" className={getStatusColor(status)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Separate upcoming and past appointments
  const today = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) >= today && apt.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) < today || apt.status === 'cancelled'
  );

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      setProcessing(true);
      
      // Update appointment status to cancelled
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          notes: selectedAppointment.notes 
            ? `${selectedAppointment.notes}\n\nCancelled by patient: ${cancelReason}`
            : `Cancelled by patient: ${cancelReason}`
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });

      setCancelDialogOpen(false);
      onAppointmentBooked?.(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const canModifyAppointment = (appointment: Appointment) => {
    // Can only modify if scheduled/confirmed and more than 24 hours away
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const hoursUntil = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    return ['scheduled', 'confirmed', 'pending'].includes(appointment.status) && hoursUntil > 24;
  };

  const getModificationBlockedReason = (appointment: Appointment): string | null => {
    if (appointment.status === 'cancelled') return null;
    if (appointment.status === 'completed') return 'This appointment has already been completed.';
    
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const hoursUntil = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntil <= 0) {
      return 'This appointment has already passed.';
    }
    
    if (hoursUntil <= 24) {
      const hoursLeft = Math.max(0, Math.floor(hoursUntil));
      const minutesLeft = Math.max(0, Math.floor((hoursUntil - hoursLeft) * 60));
      return `Appointments can only be cancelled or rescheduled more than 24 hours in advance. Your appointment is in ${hoursLeft}h ${minutesLeft}m. Please contact the hospital directly if you need to make changes.`;
    }
    
    if (!['scheduled', 'confirmed', 'pending'].includes(appointment.status)) {
      return `Appointments with status "${appointment.status}" cannot be modified. Please contact the hospital for assistance.`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Appointment Booking */}
      <PatientAppointmentBooking 
        patientData={patientData || null} 
        onAppointmentBooked={onAppointmentBooked}
      />

      {/* Waitlist Signup */}
      <WaitlistSignup 
        patientData={patientData || null}
        onWaitlistJoined={onAppointmentBooked}
      />

      {/* Upcoming Appointments */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Upcoming Appointments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming appointments</p>
              <p className="text-sm mt-2">Contact your healthcare provider to schedule an appointment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={appointment.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-foreground">{appointment.type}</h4>
                            <p className="text-sm text-muted-foreground">Appointment #{appointment.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium">{appointment.appointment_date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="font-medium">{appointment.appointment_time}</p>
                        </div>
                      </div>
                    </div>

                    {appointment.symptoms && (
                      <div className="bg-accent/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
                        <p className="text-sm text-foreground">{appointment.symptoms}</p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="bg-accent/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm text-foreground">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Cancel/Reschedule Buttons */}
                    {canModifyAppointment(appointment) && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleClick(appointment)}
                          className="flex-1"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelClick(appointment)}
                          className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                    {!canModifyAppointment(appointment) && getModificationBlockedReason(appointment) && (
                      <Alert variant="default" className="mt-3 bg-warning/10 border-warning/30">
                        <Info className="h-4 w-4 text-warning" />
                        <AlertTitle className="text-warning">Cannot Modify Appointment</AlertTitle>
                        <AlertDescription className="text-warning/80 text-sm">
                          {getModificationBlockedReason(appointment)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span>Appointment History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No past appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastAppointments.map((appointment, index) => (
                <div key={appointment.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="bg-accent/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{appointment.type}</h4>
                        <p className="text-xs text-muted-foreground">#{appointment.id.slice(0, 8)}</p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{appointment.appointment_date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelConfirm}
              disabled={processing}
            >
              {processing ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog - Opens booking form */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Book a new appointment, then your current one will be cancelled.
            </DialogDescription>
          </DialogHeader>
          <PatientAppointmentBooking 
            patientData={patientData || null} 
            onAppointmentBooked={() => {
              // Cancel the old appointment
              if (selectedAppointment) {
                supabase
                  .from('appointments')
                  .update({ status: 'cancelled', notes: 'Rescheduled by patient' })
                  .eq('id', selectedAppointment.id)
                  .then(() => {
                    setRescheduleDialogOpen(false);
                    onAppointmentBooked?.();
                  });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsView;
