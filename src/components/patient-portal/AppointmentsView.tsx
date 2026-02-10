import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar, Clock, X, RefreshCw, AlertCircle, MapPin, User, ChevronRight, TicketCheck, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Appointment, Patient } from '../../lib/dataManager';
import PatientAppointmentBooking from './PatientAppointmentBooking';
import WaitlistSignup from '../appointments/WaitlistSignup';
import QueueStatusView from './QueueStatusView';
import AppointmentFeedback from './AppointmentFeedback';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueue } from '@/hooks/useQueue';

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
  const { checkInPatient } = useQueue();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackAppointment, setFeedbackAppointment] = useState<Appointment | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { 
          bg: 'bg-emerald-500', 
          text: 'text-emerald-500',
          light: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/20'
        };
      case 'pending':
        return { 
          bg: 'bg-amber-500', 
          text: 'text-amber-500',
          light: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/20'
        };
      case 'scheduled':
        return { 
          bg: 'bg-blue-500', 
          text: 'text-blue-500',
          light: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/20'
        };
      case 'cancelled':
        return { 
          bg: 'bg-red-500', 
          text: 'text-red-500',
          light: 'bg-red-50 dark:bg-red-500/10',
          border: 'border-red-200 dark:border-red-500/20'
        };
      case 'completed':
        return { 
          bg: 'bg-gray-400', 
          text: 'text-gray-500',
          light: 'bg-gray-50 dark:bg-gray-500/10',
          border: 'border-gray-200 dark:border-gray-500/20'
        };
      default:
        return { 
          bg: 'bg-gray-400', 
          text: 'text-gray-500',
          light: 'bg-gray-50 dark:bg-gray-500/10',
          border: 'border-gray-200 dark:border-gray-500/20'
        };
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

  // Check if patient can self-check-in (within 30 mins of appointment time)
  const canSelfCheckIn = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const minsUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60);
    const isToday = appointment.appointment_date === now.toISOString().split('T')[0];
    
    return isToday && 
           ['scheduled', 'confirmed'].includes(appointment.status) && 
           minsUntil <= 30 && 
           minsUntil >= -15; // Allow up to 15 mins late
  };

  const handleSelfCheckIn = async (appointment: Appointment) => {
    if (!patientData) return;
    
    setCheckingIn(appointment.id);
    
    try {
      const result = await checkInPatient({
        patientId: patientData.id,
        doctorId: (appointment as any).doctor_id || (appointment as any).doctor?.id,
        departmentId: (appointment as any).department_id,
        appointmentId: appointment.id,
        entryType: 'appointment',
        priority: 'normal',
        symptoms: appointment.symptoms || undefined
      });

      if (result) {
        // Update appointment status
        await supabase
          .from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', appointment.id);

        toast({
          title: 'Checked In Successfully! 🎉',
          description: `Your token is ${result.token}. Please wait to be called.`,
        });
        
        onAppointmentBooked?.();
      }
    } catch (error) {
      toast({
        title: 'Check-in Failed',
        description: 'Unable to check in. Please visit the reception desk.',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const getModificationBlockedReason = (appointment: Appointment): string | null => {
    if (appointment.status === 'cancelled') return null;
    if (appointment.status === 'completed') return 'Completed';
    
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const hoursUntil = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntil <= 0) return 'Past';
    if (hoursUntil <= 24) return 'Within 24h - call to modify';
    
    return null;
  };

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Queue Status - Shows when patient is checked in */}
      {patientData && <QueueStatusView patientId={patientData.id} />}

      {/* Quick Actions - Premium Cards */}
      <div className="grid grid-cols-1 gap-4">
        <PatientAppointmentBooking 
          patientData={patientData || null} 
          onAppointmentBooked={onAppointmentBooked}
        />
        <WaitlistSignup 
          patientData={patientData || null}
          onWaitlistJoined={onAppointmentBooked}
        />
      </div>

      {/* Upcoming Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Upcoming
          </h2>
          {upcomingAppointments.length > 0 && (
            <Badge className="bg-primary/10 text-primary border-0 font-semibold">
              {upcomingAppointments.length}
            </Badge>
          )}
        </div>

        {upcomingAppointments.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No Upcoming Appointments</h3>
              <p className="text-sm text-muted-foreground">Book your first appointment to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment, index) => {
              const status = getStatusConfig(appointment.status);
              const dateInfo = formatDateFull(appointment.appointment_date);
              const canModify = canModifyAppointment(appointment);
              const blockedReason = getModificationBlockedReason(appointment);
              
              return (
                <Card 
                  key={appointment.id} 
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    index === 0 ? 'ring-2 ring-primary/20 shadow-md' : ''
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Date Badge */}
                      <div className={`w-20 sm:w-24 flex-shrink-0 ${status.light} flex flex-col items-center justify-center py-4 border-r ${status.border}`}>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {dateInfo.month}
                        </span>
                        <span className={`text-2xl sm:text-3xl font-bold ${status.text}`}>
                          {dateInfo.day}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {dateInfo.weekday}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base truncate">
                              {appointment.type || 'General Consultation'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">
                                {formatTime(appointment.appointment_time)}
                              </span>
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.light} ${status.text} ${status.border} border`}>
                            {appointment.status}
                          </div>
                        </div>

                        {/* Symptoms */}
                        {appointment.symptoms && (
                          <div className="mb-3 p-2.5 bg-muted/50 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {appointment.symptoms}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {canSelfCheckIn(appointment) ? (
                          <Button
                            onClick={() => handleSelfCheckIn(appointment)}
                            disabled={checkingIn === appointment.id}
                            className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-xl"
                          >
                            {checkingIn === appointment.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                                Checking In...
                              </>
                            ) : (
                              <>
                                <TicketCheck className="w-4 h-4 mr-2" />
                                Check In Now
                              </>
                            )}
                          </Button>
                        ) : canModify ? (
                          <div className="flex flex-col xs:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRescheduleClick(appointment)}
                              className="flex-1 h-11 xs:h-10 text-sm font-semibold bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all rounded-xl"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelClick(appointment)}
                              className="flex-1 h-11 xs:h-10 text-sm font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-300 transition-all rounded-xl"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        ) : blockedReason ? (
                          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-2.5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-medium">{blockedReason}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            History
            <Badge variant="outline" className="text-xs font-normal">
              {pastAppointments.length}
            </Badge>
          </h2>

          <div className="space-y-2">
            {pastAppointments.slice(0, 5).map((appointment) => {
              const status = getStatusConfig(appointment.status);
              const isCancelled = appointment.status === 'cancelled';
              const dateInfo = formatDateFull(appointment.appointment_date);
              
              return (
                <Card 
                  key={appointment.id} 
                  className={`overflow-hidden ${isCancelled ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-gray-300'}`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Date Badge */}
                      <div className={`w-16 flex-shrink-0 ${status.light} flex flex-col items-center justify-center py-3 border-r ${status.border}`}>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">
                          {dateInfo.month}
                        </span>
                        <span className={`text-xl font-bold ${status.text}`}>
                          {dateInfo.day}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium truncate">
                              {appointment.type || 'Consultation'}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(appointment.appointment_time)}
                          </p>
                        </div>
                        
                        {/* Status Badge + Feedback */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!isCancelled && appointment.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setFeedbackAppointment(appointment);
                                setFeedbackOpen(true);
                              }}
                              title="Rate this visit"
                            >
                              <Star className="h-4 w-4 text-yellow-500" />
                            </Button>
                          )}
                          <Badge 
                            variant={isCancelled ? 'destructive' : 'secondary'}
                            className={`text-[10px] px-2 py-0.5 ${
                              isCancelled 
                                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-0' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300 border-0'
                            }`}
                          >
                            {isCancelled && <X className="w-3 h-3 mr-1" />}
                            {isCancelled ? 'Cancelled' : 'Completed'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
          <DialogHeader className="pb-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold">Cancel Appointment</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your appointment slot will be released.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl"
            />
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row pt-2">
            <Button 
              variant="destructive" 
              onClick={handleCancelConfirm}
              disabled={processing}
              className="w-full sm:w-auto h-12 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white"
            >
              {processing ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
              className="w-full sm:w-auto h-12 rounded-xl font-semibold border-2 hover:bg-primary/5"
            >
              Keep Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time. Your current appointment will be cancelled automatically.
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

      {/* Feedback Dialog */}
      {feedbackAppointment && patientData && (
        <AppointmentFeedback
          open={feedbackOpen}
          onOpenChange={setFeedbackOpen}
          appointmentId={feedbackAppointment.id}
          patientId={patientData.id}
          doctorId={(feedbackAppointment as any).doctor_id || ''}
          onSubmitted={onAppointmentBooked}
        />
      )}
    </div>
  );
};

export default AppointmentsView;
