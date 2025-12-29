import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, Pill, Calendar, User, Stethoscope, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VerifyPrescription = () => {
  const [searchParams] = useSearchParams();
  const prescriptionId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      if (!prescriptionId) {
        setError('No prescription ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patients:patient_id (first_name, last_name),
            doctors:doctor_id (first_name, last_name)
          `)
          .eq('id', prescriptionId)
          .single();

        if (fetchError) throw fetchError;
        setPrescription(data);
      } catch (err) {
        console.error('Error fetching prescription:', err);
        setError('Prescription not found or invalid');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  const getStatusIcon = () => {
    if (loading) return <AlertCircle className="w-16 h-16 text-muted-foreground animate-pulse" />;
    if (error || !prescription) return <XCircle className="w-16 h-16 text-destructive" />;
    return <CheckCircle2 className="w-16 h-16 text-medical-green" />;
  };

  const getStatusMessage = () => {
    if (loading) return 'Verifying prescription...';
    if (error) return error;
    if (!prescription) return 'Prescription not found';
    return 'Prescription Verified Successfully';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-medical-green text-white">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'discontinued':
        return <Badge variant="destructive">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate if prescription is expired
  const isExpired = () => {
    if (!prescription?.date_prescribed || !prescription?.duration) return false;
    const startDate = new Date(prescription.date_prescribed);
    const durationDays = parseInt(prescription.duration) || 30;
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    return new Date() > expiryDate;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border-2">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl ${error ? 'text-destructive' : prescription ? 'text-medical-green' : ''}`}>
              {getStatusMessage()}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {prescription && !error && (
              <div className="space-y-6">
                {/* Verification Badge */}
                <div className={`rounded-lg p-4 text-center ${isExpired() ? 'bg-warning/10 border border-warning/20' : 'bg-medical-green/10 border border-medical-green/20'}`}>
                  <p className={`text-sm font-medium ${isExpired() ? 'text-warning' : 'text-medical-green'}`}>
                    {isExpired() 
                      ? '⚠️ This prescription has expired'
                      : '✓ This is an authentic prescription from MedCare Hospital'
                    }
                  </p>
                </div>

                {/* Prescription Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Pill className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Medication</p>
                      <p className="font-medium">{prescription.medication_name}</p>
                      {prescription.dosage && (
                        <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Patient Name</p>
                      <p className="font-medium">
                        {prescription.patients?.first_name} {prescription.patients?.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Prescribing Doctor</p>
                      <p className="font-medium">
                        Dr. {prescription.doctors?.first_name} {prescription.doctors?.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="font-medium">{prescription.quantity || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">{prescription.duration || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date Prescribed</p>
                      <p className="font-medium">
                        {prescription.date_prescribed ? new Date(prescription.date_prescribed).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(prescription.status)}
                  </div>

                  {prescription.frequency && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Dosage Instructions</p>
                      <p className="text-sm font-medium">{prescription.frequency}</p>
                      {prescription.instructions && (
                        <p className="text-sm text-muted-foreground mt-1">{prescription.instructions}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Prescription ID */}
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Prescription ID</p>
                  <p className="font-mono text-sm">{prescription.id}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  The prescription could not be verified. Please ensure you have scanned the correct QR code.
                </p>
              </div>
            )}

            {/* Back Button */}
            <div className="mt-6">
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          MedCare Hospital • Prescription Verification System
        </p>
      </div>
    </div>
  );
};

export default VerifyPrescription;
