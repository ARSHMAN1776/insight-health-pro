import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, User, Heart, AlertTriangle, Phone, ArrowLeft } from 'lucide-react';

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  blood_type: string | null;
  allergies: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  gender: string | null;
}

const VerifyPatient: React.FC = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setError('No patient ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('patients')
          .select('id, first_name, last_name, blood_type, allergies, emergency_contact_name, emergency_contact_phone, gender')
          .eq('id', patientId)
          .is('deleted_at', null)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setPatient(data);
        } else {
          setError('Patient not found or has been removed');
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Unable to verify patient information');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
    if (error || !patient) return <XCircle className="w-12 h-12 text-destructive" />;
    return <CheckCircle className="w-12 h-12 text-medical-green" />;
  };

  const getStatusMessage = () => {
    if (loading) return 'Verifying patient...';
    if (error) return error;
    return 'Patient Verified';
  };

  const allergiesList = patient?.allergies?.split(',').map(a => a.trim()).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">{getStatusMessage()}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {patient && !error && (
            <>
              {/* Patient Info */}
              <div className="bg-gradient-to-r from-primary to-primary-hover rounded-lg p-4 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center text-lg font-bold">
                    {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{patient.first_name} {patient.last_name}</h3>
                    <p className="text-primary-foreground/80 text-sm">
                      ID: {patient.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  {patient.blood_type && (
                    <Badge className="bg-medical-red text-white">
                      <Heart className="w-3 h-3 mr-1" />
                      {patient.blood_type}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Allergies
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergiesList.length > 0 ? (
                    allergiesList.map((allergy, idx) => (
                      <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        {allergy}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-medical-green">No known allergies</span>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-destructive font-medium mb-2">
                  <Phone className="w-4 h-4" />
                  Emergency Contact
                </div>
                <p className="font-medium">{patient.emergency_contact_name || 'Not provided'}</p>
                <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone || 'Not provided'}</p>
              </div>

              {/* Verification Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-medical-green bg-medical-green/10 rounded-lg p-3">
                <CheckCircle className="w-4 h-4" />
                <span>This is a verified patient of MedFlow Hospital</span>
              </div>
            </>
          )}

          {error && (
            <div className="text-center text-muted-foreground">
              <p className="mb-4">The patient information could not be verified. This may be because:</p>
              <ul className="text-sm text-left list-disc list-inside space-y-1">
                <li>The patient ID is invalid</li>
                <li>The patient record has been removed</li>
                <li>There was a connection error</li>
              </ul>
            </div>
          )}

          <div className="pt-4 border-t">
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            MedFlow Hospital Management System
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPatient;
