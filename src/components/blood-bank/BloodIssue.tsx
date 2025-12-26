import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Droplets, 
  User, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTimezone } from '@/hooks/useTimezone';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { z } from 'zod';
import {
  bloodIssueSchema,
  sanitizeInput,
  sanitizeUnits,
  validateStockAvailability,
  isAuthorizedForBloodBank,
  getAuthorizationError,
  createAuditEntry,
  formatAuditLog,
  getUserFriendlyError,
  ERROR_MESSAGES,
} from '@/lib/bloodBankValidation';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  blood_type: string | null;
}

interface BloodGroup {
  group_id: string;
  group_name: string;
}

interface BloodStock {
  stock_id: string;
  blood_group_id: string;
  total_units: number;
  blood_group?: BloodGroup;
}

interface BloodIssueRecord {
  issue_id: string;
  patient_id: string;
  blood_group_id: string;
  units_given: number;
  issue_date: string;
  issued_by: string | null;
  notes: string | null;
  created_at: string | null;
  patient?: Patient;
  blood_group?: BloodGroup;
}

// Only administrators can issue blood
const AUTHORIZED_ROLES = ['admin'] as const;

const BloodIssue: React.FC = () => {
  const { user, isRole } = useAuth();
  const { toast } = useToast();
  const { formatDate, getCurrentDate } = useTimezone();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [issueRecords, setIssueRecords] = useState<BloodIssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  
  const [formData, setFormData] = useState({
    patient_id: '',
    blood_group_id: '',
    units: '',
    notes: '',
  });
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [stockAvailability, setStockAvailability] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Authorization check
  const isAuthorized = user && AUTHORIZED_ROLES.some(role => isRole(role));
  const userRole = user ? (isRole('admin') ? 'admin' : isRole('doctor') ? 'doctor' : isRole('nurse') ? 'nurse' : null) : null;

  const fetchPatients = useCallback(async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name, blood_type')
      .eq('status', 'active')
      .order('first_name');
    
    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }
    setPatients(data || []);
  }, []);

  const fetchBloodGroups = useCallback(async () => {
    const { data, error } = await supabase
      .from('blood_groups')
      .select('*')
      .order('group_name');
    
    if (error) {
      console.error('Error fetching blood groups:', error);
      return;
    }
    setBloodGroups(data || []);
  }, []);

  const fetchStocks = useCallback(async () => {
    const { data, error } = await supabase
      .from('blood_stock')
      .select(`*, blood_group:blood_group_id (group_id, group_name)`)
      .order('blood_group_id');

    if (error) {
      console.error('Error fetching stocks:', error);
      return;
    }
    setStocks(data || []);
  }, []);

  const fetchIssueRecords = useCallback(async () => {
    const { data, error } = await supabase
      .from('blood_issues')
      .select(`
        *,
        patient:patient_id (id, first_name, last_name, blood_type),
        blood_group:blood_group_id (group_id, group_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching issue records:', error);
      return;
    }
    setIssueRecords(data || []);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPatients(), fetchBloodGroups(), fetchStocks(), fetchIssueRecords()]);
    setLoading(false);
  }, [fetchPatients, fetchBloodGroups, fetchStocks, fetchIssueRecords]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Real-time subscription for stock updates
  useEffect(() => {
    const channel = supabase
      .channel('blood-issue-stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blood_stock',
        },
        () => {
          fetchStocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStocks]);

  // Update stock availability when blood group changes
  useEffect(() => {
    if (formData.blood_group_id) {
      const stock = stocks.find(s => s.blood_group_id === formData.blood_group_id);
      setStockAvailability(stock?.total_units ?? 0);
    } else {
      setStockAvailability(null);
    }
  }, [formData.blood_group_id, stocks]);

  // Update selected patient
  useEffect(() => {
    if (formData.patient_id) {
      const patient = patients.find(p => p.id === formData.patient_id);
      setSelectedPatient(patient || null);
      
      // Auto-select patient's blood type if available
      if (patient?.blood_type && !formData.blood_group_id) {
        const matchingGroup = bloodGroups.find(bg => bg.group_name === patient.blood_type);
        if (matchingGroup) {
          setFormData(prev => ({ ...prev, blood_group_id: matchingGroup.group_id }));
        }
      }
    } else {
      setSelectedPatient(null);
    }
  }, [formData.patient_id, patients, bloodGroups, formData.blood_group_id]);

  const filteredPatients = patients.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.includes(patientSearch.toLowerCase());
  });

  const handleOpenDialog = () => {
    setFormData({ patient_id: '', blood_group_id: '', units: '', notes: '' });
    setPatientSearch('');
    setSelectedPatient(null);
    setStockAvailability(null);
    setValidationErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ patient_id: '', blood_group_id: '', units: '', notes: '' });
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Authorization check
    if (!isAuthorized) {
      toast({
        title: 'Access Denied',
        description: getAuthorizationError(userRole),
        variant: 'destructive',
      });
      return false;
    }

    // Sanitize inputs
    const sanitizedUnitsValue = sanitizeUnits(formData.units);
    const sanitizedNotes = sanitizeInput(formData.notes);
    
    try {
      bloodIssueSchema.parse({
        patient_id: formData.patient_id,
        blood_group_id: formData.blood_group_id,
        units: sanitizedUnitsValue,
        notes: sanitizedNotes || undefined,
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        e.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
      }
    }

    // Stock availability validation with safety check
    if (stockAvailability !== null) {
      const stockValidation = validateStockAvailability(stockAvailability, sanitizedUnitsValue);
      if (!stockValidation.valid) {
        errors.units = stockValidation.error || ERROR_MESSAGES.INSUFFICIENT_STOCK;
      }
    }

    // Additional safety: prevent negative results
    if (stockAvailability !== null && sanitizedUnitsValue > 0) {
      const resultingStock = stockAvailability - sanitizedUnitsValue;
      if (resultingStock < 0) {
        errors.units = ERROR_MESSAGES.NEGATIVE_STOCK;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToConfirm = () => {
    if (validateForm()) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmIssue = async () => {
    // Final authorization check
    if (!isAuthorized || !user) {
      toast({
        title: 'Access Denied',
        description: ERROR_MESSAGES.NOT_AUTHORIZED,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    // Sanitize all inputs before processing
    const units = sanitizeUnits(formData.units);
    const sanitizedNotes = sanitizeInput(formData.notes);

    // Create audit entry
    const auditEntry = createAuditEntry(
      'ISSUE',
      'blood_issues',
      formData.blood_group_id,
      user.id,
      userRole,
      {
        patient_id: formData.patient_id,
        blood_group_id: formData.blood_group_id,
        units_requested: units,
        patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Unknown',
      }
    );
    console.log(formatAuditLog(auditEntry));

    try {
      // Get current stock with fresh data
      const { data: freshStock, error: fetchError } = await supabase
        .from('blood_stock')
        .select('*')
        .eq('blood_group_id', formData.blood_group_id)
        .maybeSingle();

      if (fetchError) throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
      if (!freshStock) throw new Error('Blood stock not found for this blood group');

      // Double-check stock availability with fresh data
      const stockValidation = validateStockAvailability(freshStock.total_units, units);
      if (!stockValidation.valid) {
        throw new Error(stockValidation.error);
      }

      // Calculate new balance with safety check
      const newBalance = freshStock.total_units - units;
      
      // CRITICAL: Final negative stock prevention
      if (newBalance < 0) {
        throw new Error(ERROR_MESSAGES.NEGATIVE_STOCK);
      }

      // Update stock
      const { error: stockError } = await supabase
        .from('blood_stock')
        .update({ 
          total_units: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('stock_id', freshStock.stock_id);

      if (stockError) throw stockError;

      // Create issue record with sanitized data
      const { data: issueData, error: issueError } = await supabase
        .from('blood_issues')
        .insert({
          patient_id: formData.patient_id,
          blood_group_id: formData.blood_group_id,
          units_given: units,
          issue_date: getCurrentDate(),
          issued_by: user.id,
          notes: sanitizedNotes || null,
        })
        .select()
        .single();

      if (issueError) throw issueError;

      // Log the transaction for audit trail
      const transactionNotes = `Issued to patient: ${sanitizeInput(selectedPatient?.first_name || '')} ${sanitizeInput(selectedPatient?.last_name || '')}. Authorized by: ${userRole}`;
      
      const { error: transactionError } = await supabase
        .from('blood_stock_transactions')
        .insert({
          blood_group_id: formData.blood_group_id,
          transaction_type: 'issue',
          units: units,
          previous_balance: freshStock.total_units,
          new_balance: newBalance,
          source: 'Patient Issue',
          notes: transactionNotes,
          performed_by: user.id,
          reference_id: issueData?.issue_id || formData.patient_id,
        });

      if (transactionError) {
        console.error('[AUDIT WARNING] Transaction log failed:', transactionError);
      }

      // Success audit log
      console.log(`[AUDIT SUCCESS] Blood issue completed: ${units} units of ${bloodGroups.find(bg => bg.group_id === formData.blood_group_id)?.group_name} to patient ${selectedPatient?.first_name} ${selectedPatient?.last_name} by ${userRole} (${user.id})`);

      toast({
        title: 'Blood Issued Successfully',
        description: `${units} unit(s) of ${bloodGroups.find(bg => bg.group_id === formData.blood_group_id)?.group_name} issued to ${selectedPatient?.first_name} ${selectedPatient?.last_name}`,
      });

      setIsConfirmOpen(false);
      handleCloseDialog();
      fetchIssueRecords();
      fetchStocks();
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyError(error);
      console.error('[AUDIT FAILURE] Blood issue failed:', errorMessage, error);
      
      toast({
        title: 'Issue Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getBloodGroupColor = (groupName: string): string => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800 border-red-300',
      'A-': 'bg-red-50 text-red-700 border-red-200',
      'B+': 'bg-blue-100 text-blue-800 border-blue-300',
      'B-': 'bg-blue-50 text-blue-700 border-blue-200',
      'AB+': 'bg-purple-100 text-purple-800 border-purple-300',
      'AB-': 'bg-purple-50 text-purple-700 border-purple-200',
      'O+': 'bg-green-100 text-green-800 border-green-300',
      'O-': 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[groupName] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStockStatusColor = (units: number) => {
    if (units === 0) return 'text-destructive';
    if (units < 5) return 'text-red-500';
    if (units < 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const selectedBloodGroup = bloodGroups.find(bg => bg.group_id === formData.blood_group_id);
  const unitsValue = parseInt(formData.units, 10) || 0;
  const canIssue = stockAvailability !== null && unitsValue > 0 && unitsValue <= stockAvailability;

  return (
    <div className="space-y-6">
      {/* Authorization Status - only show for non-admins */}
      {!isAuthorized && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Only administrators can issue blood. You have view-only access to blood issue records.
          </AlertDescription>
        </Alert>
      )}

      {isAuthorized && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Authorized as <strong>Administrator</strong> for blood issue operations. All actions are logged.
          </AlertDescription>
        </Alert>
      )}

      {/* Issue Blood Card - only show button for admins */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Issue Blood
            </CardTitle>
            {isAuthorized && (
              <Button 
                onClick={handleOpenDialog} 
                className="gap-2"
              >
                <Droplets className="h-4 w-4" />
                New Blood Issue
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            {isAuthorized 
              ? 'Issue blood to patients with stock validation and complete audit trail.'
              : 'View blood issue history. Only administrators can issue blood.'}
          </p>
        </CardContent>
      </Card>

      {/* Issue History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Blood Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : issueRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No blood issues recorded yet.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead className="text-center">Units</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issueRecords.map((record) => (
                    <TableRow key={record.issue_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {record.patient 
                            ? `${record.patient.first_name} ${record.patient.last_name}`
                            : 'Unknown Patient'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getBloodGroupColor(record.blood_group?.group_name || '')}
                        >
                          {record.blood_group?.group_name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {record.units_given}
                      </TableCell>
                      <TableCell>
                        {formatDate(record.issue_date)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {record.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Issue Blood to Patient
            </DialogTitle>
            <DialogDescription>
              Select patient and blood group, then specify units to issue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label>Select Patient *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select 
                value={formData.patient_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
              >
                <SelectTrigger className={validationErrors.patient_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {filteredPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {patient.first_name} {patient.last_name}
                        {patient.blood_type && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {patient.blood_type}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.patient_id && (
                <p className="text-sm text-destructive">{validationErrors.patient_id}</p>
              )}
              {selectedPatient && (
                <div className="p-3 bg-muted rounded-md text-sm">
                  <p><strong>Patient:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
                  <p><strong>Blood Type:</strong> {selectedPatient.blood_type || 'Not recorded'}</p>
                </div>
              )}
            </div>

            {/* Blood Group Selection */}
            <div className="space-y-2">
              <Label>Blood Group *</Label>
              <Select 
                value={formData.blood_group_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, blood_group_id: value }))}
              >
                <SelectTrigger className={validationErrors.blood_group_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => {
                    const stock = stocks.find(s => s.blood_group_id === group.group_id);
                    const units = stock?.total_units ?? 0;
                    return (
                      <SelectItem key={group.group_id} value={group.group_id}>
                        <div className="flex items-center justify-between gap-4 w-full">
                          <Badge variant="outline" className={getBloodGroupColor(group.group_name)}>
                            {group.group_name}
                          </Badge>
                          <span className={`text-sm ${getStockStatusColor(units)}`}>
                            {units} units
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {validationErrors.blood_group_id && (
                <p className="text-sm text-destructive">{validationErrors.blood_group_id}</p>
              )}
              
              {/* Stock Availability Indicator */}
              {stockAvailability !== null && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  stockAvailability === 0 
                    ? 'bg-destructive/10 text-destructive' 
                    : stockAvailability < 5 
                      ? 'bg-yellow-500/10 text-yellow-600' 
                      : 'bg-green-500/10 text-green-600'
                }`}>
                  {stockAvailability === 0 ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Out of stock</span>
                    </>
                  ) : stockAvailability < 5 ? (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      <span>Low stock: {stockAvailability} units available</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{stockAvailability} units available</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Units Input */}
            <div className="space-y-2">
              <Label>Units Required *</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.units}
                onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value }))}
                placeholder="Enter units (1-10)"
                className={validationErrors.units ? 'border-destructive' : ''}
              />
              {validationErrors.units && (
                <p className="text-sm text-destructive">{validationErrors.units}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any relevant notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleProceedToConfirm}
              disabled={!canIssue || !formData.patient_id}
            >
              Proceed to Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm Blood Issue"
        description={
          <div className="space-y-3">
            <p>You are about to issue blood with the following details:</p>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <p><strong>Patient:</strong> {selectedPatient?.first_name} {selectedPatient?.last_name}</p>
              <p><strong>Blood Group:</strong> {selectedBloodGroup?.group_name}</p>
              <p><strong>Units:</strong> {formData.units}</p>
              <p><strong>Remaining Stock:</strong> {(stockAvailability ?? 0) - unitsValue} units</p>
            </div>
            <p className="text-destructive font-medium">This action cannot be undone.</p>
          </div>
        }
        confirmText={submitting ? 'Issuing...' : 'Confirm Issue'}
        cancelText="Cancel"
        onConfirm={handleConfirmIssue}
        variant="destructive"
        disabled={submitting}
      />
    </div>
  );
};

export default BloodIssue;
