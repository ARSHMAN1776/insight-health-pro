import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Droplets, 
  Users, 
  Package, 
  AlertTriangle,
  Database,
  FileOutput,
  BarChart3,
  ChevronRight
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'stock',
    label: 'Blood Stock',
    icon: Database,
    description: 'Manage blood inventory'
  },
  {
    id: 'donors',
    label: 'Donors',
    icon: Users,
    description: 'Manage donor records'
  },
  {
    id: 'issue',
    label: 'Issue Blood',
    icon: FileOutput,
    description: 'Issue blood to patients'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    description: 'View analytics & reports'
  }
];

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

  const renderContent = () => {
    switch (activeSection) {
      case 'stock':
        return <BloodStockManagement />;
      case 'donors':
        return <DonorManagement />;
      case 'issue':
        return <BloodIssue />;
      case 'reports':
        return <BloodBankReports />;
      default:
        return <BloodStockManagement />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-shrink-0 hidden md:flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Blood Bank</h2>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Stock</span>
            <span className="font-semibold">{loading ? '...' : stats.totalStock}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Critical</span>
            <Badge 
              variant={stats.criticalGroups > 0 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {loading ? '...' : stats.criticalGroups}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Donors</span>
            <span className="font-semibold text-green-600">{loading ? '...' : stats.activeDonors}</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'w-full justify-start h-auto py-3 px-3',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mr-3', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex-1 text-left">
                    <div className={cn('text-sm font-medium', !isActive && 'text-foreground')}>
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Low Stock Warning */}
        {stats.criticalGroups > 0 && (
          <div className="p-4 border-t border-border">
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Low Stock Alert</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.criticalGroups} blood group(s) below threshold
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex-col h-auto py-2 px-3 gap-1',
                  isActive && 'text-primary'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 pb-20 md:pb-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default BloodBankDashboard;
