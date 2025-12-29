import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, FlaskConical, Calendar, User, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VerifyLabReport = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError('No report ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('lab_tests')
          .select(`
            *,
            patients:patient_id (first_name, last_name),
            doctors:doctor_id (first_name, last_name)
          `)
          .eq('id', reportId)
          .single();

        if (fetchError) throw fetchError;
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Report not found or invalid');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const getStatusIcon = () => {
    if (loading) return <AlertCircle className="w-16 h-16 text-muted-foreground animate-pulse" />;
    if (error || !report) return <XCircle className="w-16 h-16 text-destructive" />;
    return <CheckCircle2 className="w-16 h-16 text-medical-green" />;
  };

  const getStatusMessage = () => {
    if (loading) return 'Verifying report...';
    if (error) return error;
    if (!report) return 'Report not found';
    return 'Report Verified Successfully';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-medical-green text-white">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border-2">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl ${error ? 'text-destructive' : report ? 'text-medical-green' : ''}`}>
              {getStatusMessage()}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {report && !error && (
              <div className="space-y-6">
                {/* Verification Badge */}
                <div className="bg-medical-green/10 border border-medical-green/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-medical-green font-medium">
                    ✓ This is an authentic lab report from MedCare Hospital
                  </p>
                </div>

                {/* Report Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Test Name</p>
                      <p className="font-medium">{report.test_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Patient Name</p>
                      <p className="font-medium">
                        {report.patients?.first_name} {report.patients?.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ordering Doctor</p>
                      <p className="font-medium">
                        Dr. {report.doctors?.first_name} {report.doctors?.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Test Date</p>
                      <p className="font-medium">
                        {report.test_date ? new Date(report.test_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(report.status)}
                  </div>
                </div>

                {/* Report ID */}
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Report ID</p>
                  <p className="font-mono text-sm">{report.id}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  The report could not be verified. Please ensure you have scanned the correct QR code.
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
          MedCare Hospital • Lab Report Verification System
        </p>
      </div>
    </div>
  );
};

export default VerifyLabReport;
