import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package,
  Users,
  FileOutput,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface StockSummary {
  group_name: string;
  total_units: number;
}

interface TransactionSummary {
  transaction_type: string;
  count: number;
  total_units: number;
}

const BloodBankReports: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary[]>([]);
  const [donorStats, setDonorStats] = useState({ total: 0, eligible: 0, ineligible: 0 });
  const [issueStats, setIssueStats] = useState({ totalIssued: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch stock summary
      const { data: stockData } = await supabase
        .from('blood_stock')
        .select(`
          total_units,
          blood_group:blood_group_id (group_name)
        `)
        .order('blood_group_id');

      if (stockData) {
        setStockSummary(
          stockData.map((s: any) => ({
            group_name: s.blood_group?.group_name || 'Unknown',
            total_units: s.total_units,
          }))
        );
      }

      // Fetch transaction summary based on period
      let startDate: string | null = null;
      if (period === 'week') {
        startDate = subDays(new Date(), 7).toISOString();
      } else if (period === 'month') {
        startDate = startOfMonth(new Date()).toISOString();
      }

      let transactionQuery = supabase
        .from('blood_stock_transactions')
        .select('transaction_type, units');

      if (startDate) {
        transactionQuery = transactionQuery.gte('created_at', startDate);
      }

      const { data: transactionData } = await transactionQuery;

      if (transactionData) {
        const summary: Record<string, { count: number; total_units: number }> = {};
        transactionData.forEach((t) => {
          if (!summary[t.transaction_type]) {
            summary[t.transaction_type] = { count: 0, total_units: 0 };
          }
          summary[t.transaction_type].count += 1;
          summary[t.transaction_type].total_units += t.units;
        });

        setTransactionSummary(
          Object.entries(summary).map(([type, data]) => ({
            transaction_type: type,
            count: data.count,
            total_units: data.total_units,
          }))
        );
      }

      // Fetch donor stats
      const { data: donorData } = await supabase
        .from('donors')
        .select('status');

      if (donorData) {
        setDonorStats({
          total: donorData.length,
          eligible: donorData.filter((d) => d.status === 'Eligible').length,
          ineligible: donorData.filter((d) => d.status !== 'Eligible').length,
        });
      }

      // Fetch issue stats
      let issueQuery = supabase
        .from('blood_issues')
        .select('units_given, patient_id');

      if (startDate) {
        issueQuery = issueQuery.gte('created_at', startDate);
      }

      const { data: issueData } = await issueQuery;

      if (issueData) {
        const uniquePatients = new Set(issueData.map((i) => i.patient_id));
        setIssueStats({
          totalIssued: issueData.reduce((sum, i) => sum + i.units_given, 0),
          totalPatients: uniquePatients.size,
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const getStockStatusColor = (units: number) => {
    if (units === 0) return 'bg-destructive text-destructive-foreground';
    if (units < 5) return 'bg-red-500 text-white';
    if (units < 10) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const totalStock = stockSummary.reduce((sum, s) => sum + s.total_units, 0);
  const criticalGroups = stockSummary.filter((s) => s.total_units < 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Blood Bank Reports
          </h2>
          <p className="text-muted-foreground text-sm">
            Overview of blood bank operations and statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchReports}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Units available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Critical Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalGroups.length}</div>
            <p className="text-xs text-muted-foreground">Groups below 5 units</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileOutput className="h-4 w-4" />
              Units Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issueStats.totalIssued}</div>
            <p className="text-xs text-muted-foreground">To {issueStats.totalPatients} patients</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorStats.eligible}</div>
            <p className="text-xs text-muted-foreground">
              Eligible of {donorStats.total} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Blood Group */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock by Blood Group</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blood Group</TableHead>
                      <TableHead className="text-center">Units</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockSummary.map((stock) => (
                      <TableRow key={stock.group_name}>
                        <TableCell className="font-medium">{stock.group_name}</TableCell>
                        <TableCell className="text-center">{stock.total_units}</TableCell>
                        <TableCell>
                          <Badge className={getStockStatusColor(stock.total_units)}>
                            {stock.total_units === 0
                              ? 'Out'
                              : stock.total_units < 5
                              ? 'Critical'
                              : stock.total_units < 10
                              ? 'Low'
                              : 'OK'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : transactionSummary.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions in this period
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Count</TableHead>
                      <TableHead className="text-center">Total Units</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionSummary.map((t) => (
                      <TableRow key={t.transaction_type}>
                        <TableCell className="capitalize font-medium">
                          <div className="flex items-center gap-2">
                            {t.transaction_type === 'addition' || t.transaction_type === 'donation' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            {t.transaction_type}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{t.count}</TableCell>
                        <TableCell className="text-center font-semibold">
                          {t.total_units}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {criticalGroups.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {criticalGroups.map((stock) => (
                <Badge key={stock.group_name} variant="destructive" className="text-sm">
                  {stock.group_name}: {stock.total_units} units
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BloodBankReports;
