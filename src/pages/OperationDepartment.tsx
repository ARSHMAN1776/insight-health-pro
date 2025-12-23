import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, Building, ClipboardList, HeartPulse, Calendar, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import OperationTheatres from '@/components/operations/OperationTheatres';
import SurgeryScheduler from '@/components/operations/SurgeryScheduler';
import SurgeryList from '@/components/operations/SurgeryList';
import PostOperation from '@/components/operations/PostOperation';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalOTs: number;
  availableOTs: number;
  todaySurgeries: number;
  inProgressSurgeries: number;
  completedSurgeries: number;
}

const OperationDepartment: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalOTs: 0,
    availableOTs: 0,
    todaySurgeries: 0,
    inProgressSurgeries: 0,
    completedSurgeries: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [otsRes, todayRes, inProgressRes, completedRes] = await Promise.all([
        supabase.from('operation_theatres').select('status'),
        supabase.from('surgeries').select('id').eq('surgery_date', today),
        supabase.from('surgeries').select('id').eq('status', 'in_progress'),
        supabase.from('surgeries').select('id').eq('status', 'completed')
      ]);

      const ots = otsRes.data || [];
      setStats({
        totalOTs: ots.length,
        availableOTs: ots.filter(ot => ot.status === 'available').length,
        todaySurgeries: (todayRes.data || []).length,
        inProgressSurgeries: (inProgressRes.data || []).length,
        completedSurgeries: (completedRes.data || []).length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSurgeryScheduled = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const canSchedule = ['admin', 'receptionist', 'doctor'].includes(user?.role || '');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            Operation Department
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage operation theatres, surgeries, and post-operative care
          </p>
        </div>
        {canSchedule && (
          <SurgeryScheduler onSurgeryScheduled={handleSurgeryScheduled} />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total OTs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOTs}</div>
            <p className="text-xs text-muted-foreground">Operation theatres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableOTs}</div>
            <p className="text-xs text-muted-foreground">Ready for surgery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Surgeries</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todaySurgeries}</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Scissors className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.inProgressSurgeries}</div>
            <p className="text-xs text-muted-foreground">Ongoing surgeries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <HeartPulse className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSurgeries}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="surgeries" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="surgeries" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Surgeries</span>
          </TabsTrigger>
          <TabsTrigger value="theatres" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">OT Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="post-op" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            <span className="hidden sm:inline">Post-Op</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="surgeries" className="mt-6">
          <SurgeryList refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="theatres" className="mt-6">
          <OperationTheatres />
        </TabsContent>

        <TabsContent value="post-op" className="mt-6">
          <PostOperation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationDepartment;
