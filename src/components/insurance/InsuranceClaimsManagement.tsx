import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInsuranceClaims, CreateClaimData, InsuranceClaim } from '@/hooks/useInsuranceClaims';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  FileText, 
  Plus, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  Eye,
  RotateCcw
} from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
}

export function InsuranceClaimsManagement() {
  const { 
    claims, 
    loading, 
    createClaim, 
    submitClaim, 
    approveClaim, 
    denyClaim, 
    submitAppeal 
  } = useInsuranceClaims();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDenialDialog, setShowDenialDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newClaim, setNewClaim] = useState<CreateClaimData>({
    patient_id: '',
    insurance_provider: '',
    policy_number: '',
    service_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    diagnosis_codes: [],
    procedure_codes: [],
    notes: '',
  });

  const [denialData, setDenialData] = useState({
    reason: '',
    code: '',
    appealDeadline: '',
  });

  const [approvalData, setApprovalData] = useState({
    approvedAmount: 0,
    patientResponsibility: 0,
  });

  const [appealNotes, setAppealNotes] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name, insurance_provider, insurance_policy_number')
      .eq('status', 'active')
      .order('last_name');
    
    if (data) setPatients(data);
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setNewClaim(prev => ({
        ...prev,
        patient_id: patientId,
        insurance_provider: patient.insurance_provider || '',
        policy_number: patient.insurance_policy_number || '',
      }));
    }
  };

  const handleCreateClaim = async () => {
    if (!newClaim.patient_id || !newClaim.insurance_provider || !newClaim.total_amount) return;
    
    const result = await createClaim(newClaim);
    if (result) {
      setShowCreateDialog(false);
      setNewClaim({
        patient_id: '',
        insurance_provider: '',
        policy_number: '',
        service_date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        diagnosis_codes: [],
        procedure_codes: [],
        notes: '',
      });
    }
  };

  const handleDenyClaim = async () => {
    if (!selectedClaim || !denialData.reason) return;
    await denyClaim(selectedClaim.id, denialData.reason, denialData.code, denialData.appealDeadline);
    setShowDenialDialog(false);
    setDenialData({ reason: '', code: '', appealDeadline: '' });
    setSelectedClaim(null);
  };

  const handleApproveClaim = async () => {
    if (!selectedClaim) return;
    await approveClaim(selectedClaim.id, approvalData.approvedAmount, approvalData.patientResponsibility);
    setShowApprovalDialog(false);
    setApprovalData({ approvedAmount: 0, patientResponsibility: 0 });
    setSelectedClaim(null);
  };

  const handleSubmitAppeal = async () => {
    if (!selectedClaim || !appealNotes) return;
    await submitAppeal(selectedClaim.id, appealNotes);
    setShowAppealDialog(false);
    setAppealNotes('');
    setSelectedClaim(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      draft: { variant: 'secondary', icon: <FileText className="h-3 w-3" /> },
      submitted: { variant: 'default', icon: <Send className="h-3 w-3" /> },
      under_review: { variant: 'outline', icon: <Clock className="h-3 w-3" /> },
      approved: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      denied: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      appealed: { variant: 'outline', icon: <RotateCcw className="h-3 w-3" /> },
      paid: { variant: 'default', icon: <DollarSign className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || { variant: 'secondary', icon: null };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter(c => ['draft', 'submitted', 'under_review'].includes(c.status)).length,
    approved: claims.filter(c => c.status === 'approved' || c.status === 'paid').length,
    denied: claims.filter(c => c.status === 'denied').length,
    totalAmount: claims.reduce((sum, c) => sum + Number(c.total_amount), 0),
    approvedAmount: claims.reduce((sum, c) => sum + Number(c.approved_amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.totalAmount.toLocaleString()} total billed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.approvedAmount.toLocaleString()} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.denied}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Insurance Claims</CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Claim
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Insurance Claim</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Patient</Label>
                      <Select onValueChange={handlePatientSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.first_name} {patient.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Service Date</Label>
                      <Input
                        type="date"
                        value={newClaim.service_date}
                        onChange={e => setNewClaim(prev => ({ ...prev, service_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Insurance Provider</Label>
                      <Input
                        value={newClaim.insurance_provider}
                        onChange={e => setNewClaim(prev => ({ ...prev, insurance_provider: e.target.value }))}
                        placeholder="e.g., Blue Cross Blue Shield"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Policy Number</Label>
                      <Input
                        value={newClaim.policy_number}
                        onChange={e => setNewClaim(prev => ({ ...prev, policy_number: e.target.value }))}
                        placeholder="Policy number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Total Amount ($)</Label>
                    <Input
                      type="number"
                      value={newClaim.total_amount}
                      onChange={e => setNewClaim(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newClaim.notes || ''}
                      onChange={e => setNewClaim(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <Button onClick={handleCreateClaim}>Create Claim</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="appealed">Appealed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Claims Table */}
          {loading ? (
            <div className="text-center py-8">Loading claims...</div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No claims found. Create a new claim to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map(claim => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-mono">{claim.claim_number}</TableCell>
                    <TableCell>
                      {claim.patient?.first_name} {claim.patient?.last_name}
                    </TableCell>
                    <TableCell>{claim.insurance_provider}</TableCell>
                    <TableCell>{format(new Date(claim.service_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>${Number(claim.total_amount).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {claim.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => submitClaim(claim.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                        )}

                        {claim.status === 'submitted' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setApprovalData({
                                  approvedAmount: Number(claim.total_amount),
                                  patientResponsibility: 0,
                                });
                                setShowApprovalDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setShowDenialDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Deny
                            </Button>
                          </>
                        )}

                        {claim.status === 'denied' && !claim.appeal_submitted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedClaim(claim);
                              setShowAppealDialog(true);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Appeal
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details - {selectedClaim?.claim_number}</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">
                    {selectedClaim.patient?.first_name} {selectedClaim.patient?.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Insurance Provider</Label>
                  <p className="font-medium">{selectedClaim.insurance_provider}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Policy Number</Label>
                  <p className="font-medium">{selectedClaim.policy_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service Date</Label>
                  <p className="font-medium">
                    {format(new Date(selectedClaim.service_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submission Date</Label>
                  <p className="font-medium">
                    {selectedClaim.submission_date 
                      ? format(new Date(selectedClaim.submission_date), 'MMMM d, yyyy')
                      : 'Not submitted'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Amount</Label>
                  <p className="font-medium text-lg">${Number(selectedClaim.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Approved Amount</Label>
                  <p className="font-medium text-lg text-green-600">
                    {selectedClaim.approved_amount 
                      ? `$${Number(selectedClaim.approved_amount).toLocaleString()}`
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedClaim.status === 'denied' && (
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Claim Denied</span>
                  </div>
                  <p className="text-sm"><strong>Reason:</strong> {selectedClaim.denial_reason}</p>
                  {selectedClaim.denial_code && (
                    <p className="text-sm"><strong>Denial Code:</strong> {selectedClaim.denial_code}</p>
                  )}
                  {selectedClaim.appeal_deadline && (
                    <p className="text-sm">
                      <strong>Appeal Deadline:</strong> {format(new Date(selectedClaim.appeal_deadline), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}

              {selectedClaim.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{selectedClaim.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Denial Dialog */}
      <Dialog open={showDenialDialog} onOpenChange={setShowDenialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Denial Reason *</Label>
              <Textarea
                value={denialData.reason}
                onChange={e => setDenialData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter the reason for denial..."
              />
            </div>
            <div className="space-y-2">
              <Label>Denial Code</Label>
              <Input
                value={denialData.code}
                onChange={e => setDenialData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., CO-45"
              />
            </div>
            <div className="space-y-2">
              <Label>Appeal Deadline</Label>
              <Input
                type="date"
                value={denialData.appealDeadline}
                onChange={e => setDenialData(prev => ({ ...prev, appealDeadline: e.target.value }))}
              />
            </div>
            <Button onClick={handleDenyClaim} variant="destructive" className="w-full">
              Confirm Denial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Approved Amount ($)</Label>
              <Input
                type="number"
                value={approvalData.approvedAmount}
                onChange={e => setApprovalData(prev => ({ ...prev, approvedAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Patient Responsibility ($)</Label>
              <Input
                type="number"
                value={approvalData.patientResponsibility}
                onChange={e => setApprovalData(prev => ({ ...prev, patientResponsibility: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <Button onClick={handleApproveClaim} className="w-full">
              Confirm Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appeal Dialog */}
      <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Appeal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedClaim?.denial_reason && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm"><strong>Original Denial Reason:</strong></p>
                <p className="text-sm text-muted-foreground">{selectedClaim.denial_reason}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Appeal Notes *</Label>
              <Textarea
                value={appealNotes}
                onChange={e => setAppealNotes(e.target.value)}
                placeholder="Explain why this claim should be reconsidered..."
                rows={4}
              />
            </div>
            <Button onClick={handleSubmitAppeal} className="w-full">
              Submit Appeal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
