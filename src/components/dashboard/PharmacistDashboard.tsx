import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Pill, Package, AlertTriangle, Clock, Activity, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { dataManager, Prescription, Inventory } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';

const PharmacistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prescriptionsData, inventoryData] = await Promise.all([
          dataManager.getPrescriptions(),
          dataManager.getInventory()
        ]);
        
        setPrescriptions(prescriptionsData);
        setInventory(inventoryData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const lowStockItems = inventory.filter(item => item.current_stock <= (item.minimum_stock || 10));
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'active').slice(0, 8);

  const todayStats = [
    { title: 'Prescriptions', value: loading ? '...' : prescriptions.length.toString(), icon: Pill, color: 'bg-medical-green' },
    { title: 'Inventory Items', value: loading ? '...' : inventory.length.toString(), icon: Package, color: 'bg-medical-blue' },
    { title: 'Low Stock', value: loading ? '...' : lowStockItems.length.toString(), icon: AlertTriangle, color: 'bg-medical-orange' },
    { title: 'Pending Orders', value: loading ? '...' : pendingPrescriptions.length.toString(), icon: Clock, color: 'bg-medical-purple' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-medical-green to-medical-green/80 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-green-100">Pharmacy operations dashboard - {prescriptions.length} prescriptions to process.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Pill className="w-6 h-6" />
              <span className="text-sm">Dispense</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Package className="w-6 h-6" />
              <span className="text-sm">Inventory</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Activity className="w-6 h-6" />
              <span className="text-sm">Stock Check</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Users className="w-6 h-6" />
              <span className="text-sm">Consultations</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacistDashboard;