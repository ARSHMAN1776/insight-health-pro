import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Droplets, 
  Users, 
  Package, 
  AlertTriangle,
  Database,
  FileOutput,
  BarChart3
} from 'lucide-react';
import DonorManagement from './DonorManagement';
import BloodStockManagement from './BloodStockManagement';
import BloodIssue from './BloodIssue';
import BloodBankReports from './BloodBankReports';
import { supabase } from '@/integrations/supabase/client';

interface BloodBankStats {
  totalStock: number;
  criticalGroups: number;
  activeDonors: number;
}

const BloodBankDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('stock');
  const [stats, setStats] = useState<BloodBankStats>({ totalStock: 0, criticalGroups: 0, activeDonors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: stockData } = await supabase
          .from('blood_stock')
          .select('total_units');
        
        const totalStock = stockData?.reduce((sum, s) => sum + s.total_units, 0) || 0;
        const criticalGroups = stockData?.filter(s => s.total_units < 5).length || 0;

        const { count: donorCount } = await supabase
          .from('donors')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Eligible');

        setStats({
          totalStock,
          criticalGroups,
          activeDonors: donorCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const channel = supabase
      .channel('dashboard-stock-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_stock' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Droplets className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blood Bank</h1>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Stock</p>
                <p className="font-semibold">{loading ? '...' : stats.totalStock} units</p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Active Donors</p>
                <p className="font-semibold text-green-600">{loading ? '...' : stats.activeDonors}</p>
              </div>
            </div>
          </Card>
          {stats.criticalGroups > 0 && (
            <Card className="px-4 py-2 border-destructive/50 bg-destructive/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Critical</p>
                  <p className="font-semibold text-destructive">{stats.criticalGroups} groups</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="stock" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Blood Stock</span>
            <span className="sm:hidden">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="donors" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Donors</span>
            <span className="sm:hidden">Donors</span>
          </TabsTrigger>
          <TabsTrigger value="issue" className="gap-2">
            <FileOutput className="h-4 w-4" />
            <span className="hidden sm:inline">Issue Blood</span>
            <span className="sm:hidden">Issue</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
            <span className="sm:hidden">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-6">
          <BloodStockManagement />
        </TabsContent>
        <TabsContent value="donors" className="mt-6">
          <DonorManagement />
        </TabsContent>
        <TabsContent value="issue" className="mt-6">
          <BloodIssue />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <BloodBankReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodBankDashboard;
