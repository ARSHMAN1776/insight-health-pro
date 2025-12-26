import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Pill, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Patient, Prescription } from '@/lib/dataManager';

interface RefillRequest {
  id: string;
  prescription_id: string;
  patient_id: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'denied';
  notes: string | null;
  created_at: string;
}

interface PrescriptionRefillRequestProps {
  patientData: Patient | null;
  prescriptions: Prescription[];
  onRefillRequested?: () => void;
}

const PrescriptionRefillRequest: React.FC<PrescriptionRefillRequestProps> = ({
  patientData,
  prescriptions,
  onRefillRequested,
}) => {
  const { toast } = useToast();
  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.id) {
      fetchRefillRequests();
    }
  }, [patientData?.id]);

  const fetchRefillRequests = async () => {
    if (!patientData?.id) return;

    try {
      const { data, error } = await supabase
        .from('prescription_refill_requests')
        .select('*')
        .eq('patient_id', patientData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRefillRequests((data || []) as RefillRequest[]);
    } catch (error) {
      console.error('Error fetching refill requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefillClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setReason('');
    setDialogOpen(true);
  };

  const submitRefillRequest = async () => {
    if (!selectedPrescription || !patientData?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('prescription_refill_requests')
        .insert({
          prescription_id: selectedPrescription.id,
          patient_id: patientData.id,
          reason: reason.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Refill Request Submitted',
        description: 'Your prescription refill request has been submitted for review.',
      });

      setDialogOpen(false);
      fetchRefillRequests();
      onRefillRequested?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit refill request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
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

  const hasPendingRequest = (prescriptionId: string) => {
    return refillRequests.some(
      req => req.prescription_id === prescriptionId && req.status === 'pending'
    );
  };

  // Only show active prescriptions eligible for refill
  const eligiblePrescriptions = prescriptions.filter(
    p => p.status?.toLowerCase() === 'active'
  );

  if (loading) {
    return (
      <Card className="card-gradient">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            <span>Prescription Refills</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eligiblePrescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active prescriptions</p>
              <p className="text-sm mt-2">You don't have any prescriptions eligible for refill</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Request refills for your active prescriptions. Your doctor will review and approve the request.
              </p>
              <div className="grid gap-3">
                {eligiblePrescriptions.map(prescription => (
                  <div
                    key={prescription.id}
                    className="bg-accent/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{prescription.medication_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {prescription.dosage} - {prescription.frequency}
                      </p>
                    </div>
                    {hasPendingRequest(prescription.id) ? (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <Clock className="w-3 h-3 mr-1" />
                        Request Pending
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefillClick(prescription)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Request Refill
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Past Refill Requests */}
          {refillRequests.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="font-medium mb-3">Recent Refill Requests</h4>
              <div className="space-y-2">
                {refillRequests.slice(0, 5).map(request => {
                  const prescription = prescriptions.find(p => p.id === request.prescription_id);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {prescription?.medication_name || 'Unknown Medication'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refill Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Prescription Refill</DialogTitle>
            <DialogDescription>
              Request a refill for {selectedPrescription?.medication_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="font-medium">{selectedPrescription?.medication_name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedPrescription?.dosage} - {selectedPrescription?.frequency}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Reason for refill (optional)</label>
              <Textarea
                placeholder="e.g., Running low on medication, need refill before next appointment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRefillRequest} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrescriptionRefillRequest;
