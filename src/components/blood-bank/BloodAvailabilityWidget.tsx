import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Droplets, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface BloodStock {
  blood_group_id: string;
  total_units: number;
  blood_group?: {
    group_id: string;
    group_name: string;
  };
}

interface BloodAvailabilityWidgetProps {
  compact?: boolean;
  showActions?: boolean;
}

const BloodAvailabilityWidget: React.FC<BloodAvailabilityWidgetProps> = ({ 
  compact = false,
  showActions = true 
}) => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blood_stock')
        .select(`
          blood_group_id,
          total_units,
          blood_group:blood_group_id (group_id, group_name)
        `)
        .order('blood_group_id');

      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      console.error('Error fetching blood stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();

    // Real-time subscription
    const channel = supabase
      .channel('blood-availability-widget')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_stock' },
        () => fetchStocks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (units: number) => {
    if (units === 0) return 'bg-destructive text-destructive-foreground';
    if (units < 5) return 'bg-red-500 text-white';
    if (units < 10) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
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

  const totalUnits = stocks.reduce((sum, s) => sum + s.total_units, 0);
  const criticalGroups = stocks.filter(s => s.total_units < 5);
  const hasLowStock = criticalGroups.length > 0;

  if (compact) {
    return (
      <Card className={`card-gradient ${hasLowStock ? 'border-destructive/50' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4 text-red-500" />
              Blood Availability
            </CardTitle>
            {hasLowStock && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Stock
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold">{totalUnits}</span>
            <span className="text-sm text-muted-foreground">Total Units</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {stocks.slice(0, 4).map((stock) => (
              <Badge 
                key={stock.blood_group_id}
                variant="outline"
                className={`text-xs ${getBloodGroupColor(stock.blood_group?.group_name || '')}`}
              >
                {stock.blood_group?.group_name}: {stock.total_units}
              </Badge>
            ))}
            {stocks.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{stocks.length - 4} more
              </Badge>
            )}
          </div>
          {showActions && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => navigate('/blood-bank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Blood Bank
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-gradient ${hasLowStock ? 'border-destructive/50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-red-500" />
            Blood Availability
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchStocks}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {showActions && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/blood-bank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Blood Bank
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold">{totalUnits}</p>
                <p className="text-xs text-muted-foreground">Total Units</p>
              </div>
              <div className={`text-center p-3 rounded-lg ${hasLowStock ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                <p className="text-2xl font-bold">{criticalGroups.length}</p>
                <p className="text-xs text-muted-foreground">Critical Groups</p>
              </div>
            </div>

            {/* Blood Groups Grid */}
            <div className="grid grid-cols-4 gap-2">
              {stocks.map((stock) => {
                const groupName = stock.blood_group?.group_name || 'Unknown';
                const units = stock.total_units;
                
                return (
                  <div 
                    key={stock.blood_group_id}
                    className="text-center p-2 rounded-lg border bg-card"
                  >
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-semibold mb-1 ${getBloodGroupColor(groupName)}`}
                    >
                      {groupName}
                    </Badge>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{units}</span>
                      <Badge 
                        className={`text-[10px] mt-1 ${getStatusColor(units)}`}
                      >
                        {units === 0 ? 'Out' : units < 5 ? 'Low' : units < 10 ? 'Med' : 'OK'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Low Stock Alert */}
            {hasLowStock && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium text-sm">Low Stock Alert</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {criticalGroups.map((stock) => (
                    <Badge key={stock.blood_group_id} variant="destructive" className="text-xs">
                      {stock.blood_group?.group_name}: {stock.total_units} units
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BloodAvailabilityWidget;
