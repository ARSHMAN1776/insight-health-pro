import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { UserCheck, UserX, Clock, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { dataManager, PatientRegistration } from '../../lib/dataManager';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';

const PendingVerificationsWidget: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingRegistrations, setPendingRegistrations] = useState<PatientRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PatientRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const registrations = await dataManager.getPendingRegistrations();
      setPendingRegistrations(registrations);
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRegistrations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('patient-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_registration_queue'
        },
        () => {
          fetchPendingRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (registration: PatientRegistration) => {
    if (!user?.id) return;

    try {
      setProcessingId(registration.id);
      await dataManager.approvePatientRegistration(registration.id, user.id);
      toast({
        title: "Patient Approved",
        description: `${registration.patient?.first_name} ${registration.patient?.last_name} has been verified and can now access the patient portal.`,
      });
      fetchPendingRegistrations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve patient registration",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (registration: PatientRegistration) => {
    setSelectedRegistration(registration);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!user?.id || !selectedRegistration) return;

    try {
      setProcessingId(selectedRegistration.id);
      await dataManager.rejectPatientRegistration(selectedRegistration.id, user.id, rejectionReason);
      toast({
        title: "Registration Rejected",
        description: `${selectedRegistration.patient?.first_name} ${selectedRegistration.patient?.last_name}'s registration has been rejected.`,
      });
      setRejectDialogOpen(false);
      fetchPendingRegistrations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject patient registration",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Pending Patient Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Pending Patient Verifications
            </div>
            {pendingRegistrations.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingRegistrations.length} Pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No pending verifications</p>
              <p className="text-sm">All patient registrations have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="border rounded-lg p-4 bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-semibold truncate">
                          {registration.patient?.first_name} {registration.patient?.last_name}
                        </span>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {registration.patient?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{registration.patient.email}</span>
                          </div>
                        )}
                        {registration.patient?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{registration.patient.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Registered: {formatDate(registration.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRejectClick(registration)}
                        disabled={processingId === registration.id}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleApprove(registration)}
                        disabled={processingId === registration.id}
                      >
                        {processingId === registration.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Reject Patient Registration
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the registration for{' '}
              <strong>
                {selectedRegistration?.patient?.first_name} {selectedRegistration?.patient?.last_name}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Reason for rejection (optional)
            </label>
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={processingId !== null}
            >
              {processingId ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingVerificationsWidget;
