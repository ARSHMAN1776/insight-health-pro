import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Droplets, 
  Users, 
  Package, 
  ClipboardList, 
  Activity,
  AlertTriangle,
  Clock,
  Settings2,
  Database,
  FileOutput
} from 'lucide-react';
import BloodInventory from './BloodInventory';
import DonorManagement from './DonorManagement';
import DonationRecords from './DonationRecords';
import BloodRequests from './BloodRequests';
import TransfusionRecords from './TransfusionRecords';
import BloodGroupsManagement from './BloodGroupsManagement';
import BloodStockManagement from './BloodStockManagement';
import BloodIssue from './BloodIssue';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BloodBankStats {
  totalStock: number;
  criticalGroups: number;
  activeDonors: number;
}

const BloodBankDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [stats, setStats] = useState<BloodBankStats>({ totalStock: 0, criticalGroups: 0, activeDonors: 0 });
  const [loading, setLoading] = useState(true);
  const { isRole } = useAuth();
  const isAdmin = isRole('admin');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total stock
        const { data: stockData } = await supabase
          .from('blood_stock')
          .select('total_units');
        
        const totalStock = stockData?.reduce((sum, s) => sum + s.total_units, 0) || 0;
        const criticalGroups = stockData?.filter(s => s.total_units < 5).length || 0;

        // Fetch active donors
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

    // Real-time subscription for stock updates
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Droplets className="h-7 w-7 text-red-500" />
          Blood Bank Management
        </h1>
        <p className="text-muted-foreground">
          Manage blood stock, donors, and transfusions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Blood Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : stats.totalStock}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Units across all blood groups</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : stats.criticalGroups}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Blood groups below 5 units</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Eligible Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : stats.activeDonors}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registered donors</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="donors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Donors</span>
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span className="hidden sm:inline">Donations</span>
          </TabsTrigger>
          <TabsTrigger value="issue" className="flex items-center gap-2">
            <FileOutput className="h-4 w-4" />
            <span className="hidden sm:inline">Issue Blood</span>
          </TabsTrigger>
          <TabsTrigger value="transfusions" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Transfusions</span>
          </TabsTrigger>
          <TabsTrigger value="blood-groups" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Blood Groups</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <BloodStockManagement />
        </TabsContent>

        <TabsContent value="donors">
          <DonorManagement />
        </TabsContent>

        <TabsContent value="donations">
          <DonationRecords />
        </TabsContent>

        <TabsContent value="issue">
          <BloodIssue />
        </TabsContent>

        <TabsContent value="transfusions">
          <TransfusionRecords />
        </TabsContent>

        <TabsContent value="blood-groups">
          <BloodGroupsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodBankDashboard;
