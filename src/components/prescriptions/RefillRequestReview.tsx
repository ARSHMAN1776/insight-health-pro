import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '../ui/dialog';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Pill,
  Calendar,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '../ui/alert';

interface RefillRequestWithDetails {
  id: string;
  prescription_id: string;
  patient_id: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'denied';
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  prescription?: {
    id: string;
    medication_name: string;
    dosage: string | null;
    frequency: string | null;
    quantity: number | null;
    instructions: string | null;
    doctor_id: string;
    doctors?: {
      first_name: string;
      last_name: string;
    };
  };
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    phone: string | null;
    allergies: string | null;
  };
}

interface RefillRequestReviewProps {
  doctorId?: string;
  showAll?: boolean;
  maxItems?: number;
  compact?: boolean;
}

const RefillRequestReview: React.FC<RefillRequestReviewProps> = ({
  doctorId,
  showAll = false,
  maxItems = 5,
  compact = false,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RefillRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RefillRequestWithDetails | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'deny'>('approve');

  useEffect(() => {
    fetchRefillRequests();
  }, [doctorId, showAll]);

  const fetchRefillRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('prescription_refill_requests')
        .select(`
          *,
          prescription:prescription_id (
            id,
            medication_name,
            dosage,
            frequency,
            quantity,
            instructions,
            doctor_id,
            doctors (first_name, last_name)
          ),
          patient:patient_id (
            id,
            first_name,
            last_name,
            date_of_birth,
            phone,
            allergies
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by doctor's prescriptions if doctorId provided
      if (doctorId && !showAll) {
        // Get prescriptions by this doctor first
        const { data: doctorPrescriptions } = await supabase
          .from('prescriptions')
          .select('id')
          .eq('doctor_id', doctorId);
        
        const prescriptionIds = doctorPrescriptions?.map(p => p.id) || [];
        if (prescriptionIds.length > 0) {
          query = query.in('prescription_id', prescriptionIds);
        } else {
          setRequests([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests((data || []) as RefillRequestWithDetails[]);
    } catch (error) {
      console.error('Error fetching refill requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load refill requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (request: RefillRequestWithDetails, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setActionType(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedRequest || !user?.id) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('prescription_refill_requests')
        .update({
          status: actionType === 'approve' ? 'approved' : 'denied',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes.trim() || null,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Create notification for patient
      if (selectedRequest.patient) {
        const patientUserId = await getPatientUserId(selectedRequest.patient_id);
        if (patientUserId) {
          await supabase.from('notifications').insert({
            user_id: patientUserId,
            title: actionType === 'approve' 
              ? 'Prescription Refill Approved' 
              : 'Prescription Refill Denied',
            message: actionType === 'approve'
              ? `Your refill request for ${selectedRequest.prescription?.medication_name} has been approved.`
              : `Your refill request for ${selectedRequest.prescription?.medication_name} was denied. ${reviewNotes ? `Reason: ${reviewNotes}` : ''}`,
            type: 'prescription_refill',
            priority: actionType === 'approve' ? 'normal' : 'high',
            action_url: '/prescriptions',
            metadata: {
              refill_request_id: selectedRequest.id,
              prescription_id: selectedRequest.prescription_id,
              status: actionType === 'approve' ? 'approved' : 'denied',
            },
          });
        }
      }

      toast({
        title: actionType === 'approve' ? 'Refill Approved' : 'Refill Denied',
        description: `The refill request has been ${actionType === 'approve' ? 'approved' : 'denied'}.`,
      });

      setReviewDialogOpen(false);
      fetchRefillRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refill request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPatientUserId = async (patientId: string): Promise<string | null> => {
    const { data } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', patientId)
      .single();
    return data?.user_id || null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return null;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const displayRequests = pendingRequests.slice(0, maxItems);

  if (loading) {
    return (
      <Card className="card-gradient">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-gradient">
        <CardHeader className={compact ? 'pb-2' : undefined}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCw className="w-5 h-5 text-primary" />
                Refill Requests
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingRequests.length}
                  </Badge>
                )}
              </CardTitle>
              {!compact && (
                <CardDescription>Review and approve prescription refill requests</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No pending refill requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayRequests.map(request => (
                <div
                  key={request.id}
                  className="bg-muted/30 rounded-lg p-4 border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {request.patient?.first_name} {request.patient?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Pill className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {request.prescription?.medication_name}
                        </span>
                        {request.prescription?.dosage && (
                          <span className="text-muted-foreground">
                            - {request.prescription.dosage}
                          </span>
                        )}
                      </div>
                      {request.reason && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{request.reason}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Requested {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {request.prescription?.doctors && (
                          <>
                            <span>•</span>
                            <span>
                              Dr. {request.prescription.doctors.first_name} {request.prescription.doctors.last_name}
                            </span>
                          </>
                        )}
                      </div>
                      {request.patient?.allergies && (
                        <Alert className="mt-2 py-2 bg-warning/10 border-warning/20">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <AlertDescription className="text-xs text-warning">
                            Allergies: {request.patient.allergies}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(request.status)}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-success hover:bg-success/10 hover:text-success"
                          onClick={() => handleReviewClick(request, 'approve')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleReviewClick(request, 'deny')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingRequests.length > maxItems && (
                <p className="text-sm text-center text-muted-foreground pt-2">
                  +{pendingRequests.length - maxItems} more pending requests
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Deny'} Refill Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Confirm approval of this prescription refill'
                : 'Provide a reason for denying this refill request'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {selectedRequest.patient?.first_name} {selectedRequest.patient?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {selectedRequest.prescription?.medication_name}
                  </span>
                  {selectedRequest.prescription?.dosage && (
                    <span className="text-muted-foreground">
                      ({selectedRequest.prescription.dosage})
                    </span>
                  )}
                </div>
                {selectedRequest.prescription?.frequency && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRequest.prescription.frequency}</span>
                  </div>
                )}
                {selectedRequest.reason && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <span className="italic">"{selectedRequest.reason}"</span>
                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div>
                <label className="text-sm font-medium">
                  {actionType === 'approve' ? 'Notes (optional)' : 'Reason for denial'}
                </label>
                <Textarea
                  placeholder={
                    actionType === 'approve'
                      ? 'Add any notes for the patient...'
                      : 'Please provide a reason for denying this request...'
                  }
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={processing || (actionType === 'deny' && !reviewNotes.trim())}
              className={
                actionType === 'approve'
                  ? 'bg-success hover:bg-success/90'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'approve' ? (
                'Approve Refill'
              ) : (
                'Deny Refill'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RefillRequestReview;
