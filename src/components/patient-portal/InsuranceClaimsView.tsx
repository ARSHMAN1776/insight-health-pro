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
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-6">
      {/* Page Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Insurance Claims</h2>
          <p className="text-sm text-muted-foreground">Track claims & reimbursements</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchClaims}
          className="w-full sm:w-auto h-10 sm:h-9 flex items-center justify-center gap-2 rounded-xl font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview - Mobile Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Claims</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Approved</p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Approved $</p>
                <p className="text-base sm:text-xl font-bold text-foreground">${stats.approvedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Insurance Claims</h3>
            <p className="text-sm text-muted-foreground">
              Claims will appear here once submitted.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {claims.map((claim) => {
            const statusConfig = getStatusConfig(claim.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedClaim === claim.id;

            return (
              <Card 
                key={claim.id} 
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Main Row - Mobile Optimized */}
                  <div 
                    className="p-3 sm:p-4 cursor-pointer active:bg-muted/50 transition-colors"
                    onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.color}`}>
                        <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                              {claim.claim_number || 'Pending Number'}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {claim.insurance_provider}
                            </p>
                          </div>
                          <Badge className={`text-[10px] sm:text-xs px-2 py-0.5 flex-shrink-0 ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        
                        {/* Amount and Date Row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(claim.service_date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm sm:text-base font-bold text-foreground">
                              ${claim.total_amount.toLocaleString()}
                            </p>
                            {claim.approved_amount && (
                              <p className="text-[10px] sm:text-xs text-emerald-600">
                                ${claim.approved_amount.toLocaleString()} approved
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{statusConfig.progress}%</span>
                          </div>
                          <Progress value={statusConfig.progress} className="h-1.5 sm:h-2" />
                        </div>
                      </div>
                      
                      {/* Expand Icon */}
                      <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8 sm:w-9 sm:h-9">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details - Mobile Optimized */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-border/50 bg-muted/30 animate-fade-in">
                      <div className="space-y-4">
                        {/* Claim Details */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-foreground">Claim Details</h4>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between p-2 bg-background/60 rounded-lg">
                              <span className="text-muted-foreground">Policy Number</span>
                              <span className="font-medium">{claim.policy_number}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-background/60 rounded-lg">
                              <span className="text-muted-foreground">Submitted</span>
                              <span className="font-medium">
                                {claim.submission_date 
                                  ? format(new Date(claim.submission_date), 'MMM d, yyyy')
                                  : 'Not submitted'}
                              </span>
                            </div>
                            <div className="flex justify-between p-2 bg-background/60 rounded-lg">
                              <span className="text-muted-foreground">Total Amount</span>
                              <span className="font-medium">${claim.total_amount.toLocaleString()}</span>
                            </div>
                            {claim.approved_amount !== null && (
                              <div className="flex justify-between p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                <span className="text-muted-foreground">Approved</span>
                                <span className="font-medium text-emerald-600">
                                  ${claim.approved_amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {claim.patient_responsibility !== null && (
                              <div className="flex justify-between p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                                <span className="text-muted-foreground">Your Cost</span>
                                <span className="font-medium text-amber-600">
                                  ${claim.patient_responsibility.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Denial Info */}
                        {claim.status === 'denied' && (
                          <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 space-y-2">
                            <h4 className="font-semibold text-sm text-red-600 dark:text-red-400">Denial Reason</h4>
                            <p className="text-xs sm:text-sm text-red-600/80 dark:text-red-300">
                              {claim.denial_reason || 'No reason provided'}
                            </p>
                            {claim.appeal_deadline && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm mt-2">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span className="text-amber-600 font-medium">
                                  Appeal by: {format(new Date(claim.appeal_deadline), 'MMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            {claim.appeal_submitted && (
                              <Badge className="bg-orange-500/20 text-orange-600 text-xs mt-2">
                                Appeal Submitted
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Appeal Notes */}
                        {claim.status === 'appealed' && claim.appeal_notes && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20">
                            <h4 className="font-semibold text-sm text-orange-600 mb-1">Appeal Notes</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{claim.appeal_notes}</p>
                          </div>
                        )}

                        {/* Timeline */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-foreground">Timeline</h4>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 p-2 bg-background/60 rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-muted-foreground">Created:</span>
                              <span className="font-medium">{format(new Date(claim.created_at), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-background/60 rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">Updated:</span>
                              <span className="font-medium">{format(new Date(claim.updated_at), 'MMM d, yyyy')}</span>
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
