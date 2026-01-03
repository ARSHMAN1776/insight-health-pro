import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';

interface InsuranceClaim {
  id: string;
  claim_number: string | null;
  insurance_provider: string;
  policy_number: string;
  service_date: string;
  total_amount: number;
  approved_amount: number | null;
  patient_responsibility: number | null;
  status: string;
  denial_reason: string | null;
  appeal_submitted: boolean;
  appeal_deadline: string | null;
  appeal_notes: string | null;
  submission_date: string | null;
  created_at: string;
  updated_at: string;
}

interface InsuranceClaimsViewProps {
  patientId: string;
}

const InsuranceClaimsView: React.FC<InsuranceClaimsViewProps> = ({ patientId }) => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching insurance claims:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchClaims();
    }
  }, [patientId]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { 
          label: 'Draft', 
          color: 'bg-muted text-muted-foreground',
          icon: FileText,
          progress: 10
        };
      case 'submitted':
        return { 
          label: 'Submitted', 
          color: 'bg-blue-500/20 text-blue-600',
          icon: Clock,
          progress: 30
        };
      case 'under_review':
        return { 
          label: 'Under Review', 
          color: 'bg-warning/20 text-warning',
          icon: Clock,
          progress: 50
        };
      case 'approved':
        return { 
          label: 'Approved', 
          color: 'bg-success/20 text-success',
          icon: CheckCircle,
          progress: 80
        };
      case 'denied':
        return { 
          label: 'Denied', 
          color: 'bg-destructive/20 text-destructive',
          icon: XCircle,
          progress: 100
        };
      case 'appealed':
        return { 
          label: 'Appeal Pending', 
          color: 'bg-orange-500/20 text-orange-600',
          icon: AlertCircle,
          progress: 60
        };
      case 'paid':
        return { 
          label: 'Paid', 
          color: 'bg-success/20 text-success',
          icon: CheckCircle,
          progress: 100
        };
      default:
        return { 
          label: status, 
          color: 'bg-muted text-muted-foreground',
          icon: FileText,
          progress: 0
        };
    }
  };

  const getClaimStats = () => {
    const total = claims.length;
    const approved = claims.filter(c => c.status === 'approved' || c.status === 'paid').length;
    const pending = claims.filter(c => ['submitted', 'under_review', 'appealed'].includes(c.status)).length;
    const denied = claims.filter(c => c.status === 'denied').length;
    const totalAmount = claims.reduce((sum, c) => sum + c.total_amount, 0);
    const approvedAmount = claims.reduce((sum, c) => sum + (c.approved_amount || 0), 0);

    return { total, approved, pending, denied, totalAmount, approvedAmount };
  };

  const stats = getClaimStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Insurance Claims</h2>
          <p className="text-muted-foreground">Track your insurance claims and reimbursements</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchClaims}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-success">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Approved</p>
                <p className="text-xl font-bold text-foreground">${stats.approvedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card className="card-gradient">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Insurance Claims</h3>
            <p className="text-muted-foreground">
              You don't have any insurance claims yet. Claims will appear here once they are submitted.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const statusConfig = getStatusConfig(claim.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedClaim === claim.id;

            return (
              <Card 
                key={claim.id} 
                className="card-gradient hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Main Row */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {claim.claim_number || 'Pending Number'}
                            </h3>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {claim.insurance_provider}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(claim.service_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            ${claim.total_amount.toLocaleString()}
                          </p>
                          {claim.approved_amount && (
                            <p className="text-sm text-success">
                              ${claim.approved_amount.toLocaleString()} approved
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Claim Progress</span>
                        <span>{statusConfig.progress}%</span>
                      </div>
                      <Progress value={statusConfig.progress} className="h-2" />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-muted/30 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-foreground">Claim Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Policy Number</span>
                              <span className="font-medium">{claim.policy_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Submission Date</span>
                              <span className="font-medium">
                                {claim.submission_date 
                                  ? format(new Date(claim.submission_date), 'MMM d, yyyy')
                                  : 'Not submitted'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Amount</span>
                              <span className="font-medium">${claim.total_amount.toLocaleString()}</span>
                            </div>
                            {claim.approved_amount !== null && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Approved Amount</span>
                                <span className="font-medium text-success">
                                  ${claim.approved_amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {claim.patient_responsibility !== null && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Your Responsibility</span>
                                <span className="font-medium text-warning">
                                  ${claim.patient_responsibility.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {claim.status === 'denied' && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-destructive">Denial Information</h4>
                              <p className="text-sm text-muted-foreground">
                                {claim.denial_reason || 'No reason provided'}
                              </p>
                              {claim.appeal_deadline && (
                                <div className="flex items-center gap-2 text-sm">
                                  <AlertCircle className="w-4 h-4 text-warning" />
                                  <span className="text-warning">
                                    Appeal deadline: {format(new Date(claim.appeal_deadline), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              )}
                              {claim.appeal_submitted && (
                                <Badge className="bg-orange-500/20 text-orange-600">
                                  Appeal Submitted
                                </Badge>
                              )}
                            </div>
                          )}

                          {claim.status === 'appealed' && claim.appeal_notes && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground">Appeal Notes</h4>
                              <p className="text-sm text-muted-foreground">{claim.appeal_notes}</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">Timeline</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-muted-foreground">Created:</span>
                                <span>{format(new Date(claim.created_at), 'MMM d, yyyy h:mm a')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                <span className="text-muted-foreground">Last Updated:</span>
                                <span>{format(new Date(claim.updated_at), 'MMM d, yyyy h:mm a')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InsuranceClaimsView;
