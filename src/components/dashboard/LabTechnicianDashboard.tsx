import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  TestTube, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Activity,
  Play,
  FileText,
  Loader2,
  History,
  X
} from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface LabTest {
  id: string;
  test_name: string;
  test_date: string;
  test_type: string | null;
  priority: string;
  status: string;
  patient_id: string;
  doctor_id: string;
  results: string | null;
  normal_range: string | null;
  notes: string | null;
  created_at: string | null;
  patients?: {
    first_name: string;
    last_name: string;
  };
  doctors?: {
    first_name: string;
    last_name: string;
  };
}

const LabTechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { formatDate, getCurrentDate } = useTimezone();
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [patientHistory, setPatientHistory] = useState<LabTest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [resultForm, setResultForm] = useState({
    results: '',
    normalRange: '',
    notes: ''
  });

  useEffect(() => {
    loadLabTests();
  }, []);

  const loadLabTests = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_tests')
        .select(`
          id,
          test_name,
          test_date,
          test_type,
          priority,
          status,
          patient_id,
          doctor_id,
          results,
          normal_range,
          notes,
          created_at,
          patients (
            first_name,
            last_name
          ),
          doctors (
            first_name,
            last_name
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabTests(data || []);
    } catch (error) {
      console.error('Error loading lab tests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lab tests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId: string, newStatus: string) => {
    try {
      setUpdating(testId);
      
      const updateData: any = { 
        status: newStatus,
        lab_technician: `${user?.firstName} ${user?.lastName}`
      };
      
      const { error } = await supabase
        .from('lab_tests')
        .update(updateData)
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Test status changed to ${newStatus}`,
      });

      loadLabTests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update test status',
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
    }
  };

  const openResultDialog = (test: LabTest) => {
    setSelectedTest(test);
    setResultForm({
      results: test.results || '',
      normalRange: test.normal_range || '',
      notes: test.notes || ''
    });
    setResultDialogOpen(true);
  };

  const submitResults = async () => {
    if (!selectedTest) return;
    
    try {
      setUpdating(selectedTest.id);
      
      const { error } = await supabase
        .from('lab_tests')
        .update({
          status: 'completed',
          results: resultForm.results,
          normal_range: resultForm.normalRange,
          notes: resultForm.notes,
          lab_technician: `${user?.firstName} ${user?.lastName}`
        })
        .eq('id', selectedTest.id);

      if (error) throw error;

      toast({
        title: 'Results Submitted',
        description: 'Test results have been recorded successfully',
      });

      setResultDialogOpen(false);
      loadLabTests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit results',
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
    }
  };

  const loadPatientHistory = async (patientId: string, currentTestId: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('lab_tests')
        .select(`
          id,
          test_name,
          test_date,
          test_type,
          priority,
          status,
          patient_id,
          doctor_id,
          results,
          normal_range,
          notes,
          created_at
        `)
        .eq('patient_id', patientId)
        .neq('id', currentTestId)
        .is('deleted_at', null)
        .order('test_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPatientHistory(data || []);
    } catch (error) {
      console.error('Error loading patient history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openHistoryDialog = (test: LabTest) => {
    setSelectedTest(test);
    loadPatientHistory(test.patient_id, test.id);
    setHistoryDialogOpen(true);
  };

  const pendingTests = labTests.filter(t => t.status === 'pending');
  const inProgressTests = labTests.filter(t => t.status === 'in_progress');
  const todayCompleted = labTests.filter(t => 
    t.status === 'completed' && t.test_date === getCurrentDate()
  );
  const urgentTests = labTests.filter(t => 
    t.priority === 'urgent' && t.status !== 'completed' && t.status !== 'cancelled'
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning border-warning/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'in_progress': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <TestTube className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lab Technician Dashboard</h1>
            <p className="text-muted-foreground">
              {pendingTests.length} test{pendingTests.length !== 1 ? 's' : ''} pending • 
              {inProgressTests.length} in progress
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tests</p>
                <p className="text-3xl font-bold text-warning">{pendingTests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressTests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold text-success">{todayCompleted.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Tests</p>
                <p className="text-3xl font-bold text-destructive">{urgentTests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tests Alert */}
      {urgentTests.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Urgent Tests Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTests.slice(0, 5).map((test) => (
                <div 
                  key={test.id} 
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.test_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.patients?.first_name} {test.patients?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(test.priority)}>
                      {test.priority.toUpperCase()}
                    </Badge>
                    {test.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTestStatus(test.id, 'in_progress')}
                        disabled={updating === test.id}
                      >
                        {updating === test.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    )}
                    {test.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => openResultDialog(test)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Enter Results
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tests with Inline Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tests */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Pending Tests
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/lab-tests')}
                className="gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>Tests waiting to be started</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending tests</p>
            ) : (
              <div className="space-y-3">
                {pendingTests.slice(0, 5).map((test) => (
                  <div 
                    key={test.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{test.test_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.patients?.first_name} {test.patients?.last_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(test.priority)}>
                        {test.priority}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openHistoryDialog(test)}
                        className="h-8 w-8 p-0"
                        title="View patient history"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'in_progress')}
                        disabled={updating === test.id}
                      >
                        {updating === test.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Tests */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                In Progress
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/lab-tests')}
                className="gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>Tests currently being processed</CardDescription>
          </CardHeader>
          <CardContent>
            {inProgressTests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No tests in progress</p>
            ) : (
              <div className="space-y-3">
                {inProgressTests.slice(0, 5).map((test) => (
                  <div 
                    key={test.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{test.test_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.patients?.first_name} {test.patients?.last_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(test.priority)}>
                        {test.priority}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openHistoryDialog(test)}
                        className="h-8 w-8 p-0"
                        title="View patient history"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => openResultDialog(test)}
                        disabled={updating === test.id}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Ready to Process Tests?</h3>
              <p className="text-muted-foreground">View all lab tests and update results</p>
            </div>
            <Button onClick={() => navigate('/lab-tests')} className="gap-2">
              <TestTube className="w-4 h-4" />
              Go to Lab Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Entry Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Enter Test Results
            </DialogTitle>
            <DialogDescription>
              Record the results for {selectedTest?.test_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-4">
              {/* Test Info */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Test Name</span>
                  <span className="font-medium">{selectedTest.test_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Patient</span>
                  <span>{selectedTest.patients?.first_name} {selectedTest.patients?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ordering Doctor</span>
                  <span>Dr. {selectedTest.doctors?.first_name} {selectedTest.doctors?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Test Date</span>
                  <span>{selectedTest.test_date}</span>
                </div>
              </div>

              <Separator />

              {/* Result Entry Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="results">Test Results *</Label>
                  <Textarea 
                    id="results"
                    placeholder="Enter the test results..."
                    value={resultForm.results}
                    onChange={(e) => setResultForm(prev => ({ ...prev, results: e.target.value }))}
                    className="min-h-[100px] mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="normalRange">Normal Range</Label>
                  <Input 
                    id="normalRange"
                    placeholder="e.g., 70-100 mg/dL"
                    value={resultForm.normalRange}
                    onChange={(e) => setResultForm(prev => ({ ...prev, normalRange: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Any observations or recommendations..."
                    value={resultForm.notes}
                    onChange={(e) => setResultForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="min-h-[60px] mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setResultDialogOpen(false)}
              disabled={updating !== null}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitResults}
              disabled={!resultForm.results.trim() || updating !== null}
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Submit Results
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Patient Test History
            </DialogTitle>
            <DialogDescription>
              Previous tests for {selectedTest?.patients?.first_name} {selectedTest?.patients?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : patientHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No previous test history found for this patient
              </p>
            ) : (
              patientHistory.map((test) => (
                <div 
                  key={test.id} 
                  className="p-4 bg-muted/30 rounded-lg border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{test.test_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.test_date} • {test.test_type || 'General'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                  {test.results && (
                    <div className="bg-background rounded p-2 text-sm">
                      <span className="text-muted-foreground">Results: </span>
                      {test.results}
                      {test.normal_range && (
                        <span className="text-muted-foreground ml-2">
                          (Normal: {test.normal_range})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabTechnicianDashboard;