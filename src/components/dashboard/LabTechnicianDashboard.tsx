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
  Activity
} from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';

interface LabTest {
  id: string;
  test_name: string;
  test_date: string;
  priority: string;
  status: string;
  patient_id: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
}

const LabTechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { formatDate, getCurrentDate } = useTimezone();
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

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
          priority,
          status,
          patient_id,
          patients (
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
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
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
            <p className="text-muted-foreground">Manage and update lab test results</p>
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
                <p className="text-3xl font-bold text-yellow-600">{pendingTests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
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
                <p className="text-3xl font-bold text-green-600">{todayCompleted.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                  <Badge className={getPriorityColor(test.priority)}>
                    {test.priority.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tests */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
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
            <CardDescription>Tests waiting to be processed</CardDescription>
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
                    <div>
                      <p className="font-medium">{test.test_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.patients?.first_name} {test.patients?.last_name}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(test.priority)}>
                      {test.priority}
                    </Badge>
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
                    <div>
                      <p className="font-medium">{test.test_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.patients?.first_name} {test.patients?.last_name}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(test.priority)}>
                      {test.priority}
                    </Badge>
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
    </div>
  );
};

export default LabTechnicianDashboard;
