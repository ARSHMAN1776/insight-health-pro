import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Droplets, 
  Users, 
  Package, 
  ClipboardList, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings2
} from 'lucide-react';
import BloodInventory from './BloodInventory';
import DonorManagement from './DonorManagement';
import DonationRecords from './DonationRecords';
import BloodRequests from './BloodRequests';
import TransfusionRecords from './TransfusionRecords';
import BloodGroupsManagement from './BloodGroupsManagement';
import { useBloodBankStats } from '@/hooks/useBloodBank';
import { useAuth } from '@/contexts/AuthContext';

const BloodBankDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const { stats, loading } = useBloodBankStats();
  const { isRole } = useAuth();
  const isAdmin = isRole('admin');
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Droplets className="h-7 w-7 text-red-500" />
          Blood Bank Management
        </h1>
        <p className="text-muted-foreground">
          Manage blood inventory, donors, donations, and transfusions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Available Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : stats.availableUnits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for transfusion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : stats.expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : stats.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Donors
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
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="donors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Donors</span>
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span className="hidden sm:inline">Donations</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Requests</span>
          </TabsTrigger>
          <TabsTrigger value="transfusions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Transfusions</span>
          </TabsTrigger>
          <TabsTrigger value="blood-groups" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Blood Groups</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <BloodInventory />
        </TabsContent>

        <TabsContent value="donors">
          <DonorManagement />
        </TabsContent>

        <TabsContent value="donations">
          <DonationRecords />
        </TabsContent>

        <TabsContent value="requests">
          <BloodRequests />
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
