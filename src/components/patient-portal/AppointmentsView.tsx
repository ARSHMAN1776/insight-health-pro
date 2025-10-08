import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock, User, MapPin, FileText } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Appointment } from '../../lib/dataManager';

interface AppointmentsViewProps {
  appointments: Appointment[];
  loading: boolean;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ appointments, loading }) => {
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
    (apt) => new Date(apt.appointment_date) >= today
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) < today
  );

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
    </div>
  );
};

export default AppointmentsView;
