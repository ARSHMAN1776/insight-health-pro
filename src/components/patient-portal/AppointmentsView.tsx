import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock, X, RefreshCw, AlertCircle, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
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

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

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
      onAppointmentBooked?.();
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
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const hoursUntil = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    return ['scheduled', 'confirmed', 'pending'].includes(appointment.status) && hoursUntil > 24;
  };

  const getModificationBlockedReason = (appointment: Appointment): string | null => {
    if (appointment.status === 'cancelled') return null;
    if (appointment.status === 'completed') return 'This appointment has already been completed.';
    
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const hoursUntil = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntil <= 0) return 'This appointment has already passed.';
    if (hoursUntil <= 24) return 'Cannot modify appointments within 24 hours. Please call the hospital.';
    if (!['scheduled', 'confirmed', 'pending'].includes(appointment.status)) {
      return `Cannot modify appointments with status "${appointment.status}".`;
    }
    
    return null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PatientAppointmentBooking 
          patientData={patientData || null} 
          onAppointmentBooked={onAppointmentBooked}
        />
        <WaitlistSignup 
          patientData={patientData || null}
          onWaitlistJoined={onAppointmentBooked}
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming
          {upcomingAppointments.length > 0 && (
            <Badge variant="secondary" className="text-xs">{upcomingAppointments.length}</Badge>
          )}
        </h2>

        {upcomingAppointments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Book an appointment to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Date Column */}
                    <div className="bg-primary/5 dark:bg-primary/10 p-3 sm:p-4 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] border-r border-border/50">
                      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {new Date(appointment.appointment_date).getDate()}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 sm:p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{appointment.type || 'General Consultation'}</h3>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] sm:text-xs flex-shrink-0 ${getStatusStyle(appointment.status)}`}>
                          {appointment.status}
                        </Badge>
                      </div>

                      {appointment.symptoms && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2 bg-muted/50 rounded px-2 py-1">
                          {appointment.symptoms}
                        </p>
                      )}

                      {/* Actions */}
                      {canModifyAppointment(appointment) ? (
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRescheduleClick(appointment)}
                            className="flex-1 h-8 text-xs"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelClick(appointment)}
                            className="flex-1 h-8 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : getModificationBlockedReason(appointment) ? (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>{getModificationBlockedReason(appointment)}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
            History
            <Badge variant="outline" className="text-xs">{pastAppointments.length}</Badge>
          </h2>

          <div className="space-y-2">
            {pastAppointments.slice(0, 5).map((appointment) => (
              <Card key={appointment.id} className="bg-muted/30">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <span className="text-xs text-muted-foreground block">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{appointment.type || 'Consultation'}</p>
                    <p className="text-xs text-muted-foreground">{appointment.appointment_time}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${getStatusStyle(appointment.status)}`}>
                    {appointment.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Cancel Appointment</DialogTitle>
            <DialogDescription className="text-sm">
              This action cannot be undone. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelConfirm}
              disabled={processing}
              className="w-full sm:w-auto"
            >
              {processing ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Reschedule Appointment</DialogTitle>
            <DialogDescription className="text-sm">
              Book a new time, then your current appointment will be cancelled.
            </DialogDescription>
          </DialogHeader>
          <PatientAppointmentBooking 
            patientData={patientData || null} 
            onAppointmentBooked={() => {
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
