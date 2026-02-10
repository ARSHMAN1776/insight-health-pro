import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BrainCircuit, RefreshCw, TrendingUp, Clock, Users, AlertTriangle, 
  CheckCircle, XCircle, BarChart3, Calendar, Lightbulb, X 
} from 'lucide-react';
import { useSmartScheduling } from '@/hooks/useSmartScheduling';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
  'hsl(var(--muted-foreground))',
];

const SmartSchedulingDashboard: React.FC = () => {
  const { 
    analytics, recommendations, insights, loading, computeLoading, 
    computeAnalytics, dismissRecommendation 
  } = useSmartScheduling();

  const hourChartData = insights
    ? Object.entries(insights.hour_distribution).map(([hour, count]) => ({
        hour: `${hour}:00`,
        appointments: count,
      }))
    : [];

  const dayChartData = insights
    ? Object.entries(insights.day_distribution).map(([day, count]) => ({
        day,
        appointments: count,
      }))
    : [];

  const statusPieData = insights
    ? [
        { name: 'Completed', value: insights.status_breakdown.completed },
        { name: 'Scheduled', value: insights.status_breakdown.scheduled },
        { name: 'Cancelled', value: insights.status_breakdown.cancelled },
        { name: 'No Show', value: insights.status_breakdown.no_show },
      ].filter(s => s.value > 0)
    : [];

  const PIE_COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'no_show_risk': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'workload_balance': return <Users className="h-5 w-5 text-blue-500" />;
      case 'peak_optimization': return <Clock className="h-5 w-5 text-purple-500" />;
      case 'overbooking': return <TrendingUp className="h-5 w-5 text-green-500" />;
      default: return <Lightbulb className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Smart Scheduling
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered scheduling insights, workload balancing, and optimization recommendations
          </p>
        </div>
        <Button onClick={() => computeAnalytics()} disabled={computeLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${computeLoading ? 'animate-spin' : ''}`} />
          {computeLoading ? 'Computing...' : 'Refresh Analytics'}
        </Button>
      </div>

      {/* Summary Cards */}
      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total (30 days)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.total_appointments}</div>
              <p className="text-xs text-muted-foreground">appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.status_breakdown.completed}</div>
              <p className="text-xs text-muted-foreground">
                {insights.total_appointments > 0 
                  ? `${Math.round((insights.status_breakdown.completed / insights.total_appointments) * 100)}% rate` 
                  : 'No data'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Shows</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.status_breakdown.no_show}</div>
              <p className="text-xs text-muted-foreground">
                {insights.total_appointments > 0 
                  ? `${Math.round((insights.status_breakdown.no_show / insights.total_appointments) * 100)}% rate` 
                  : 'No data'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations.length}</div>
              <p className="text-xs text-muted-foreground">action items</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">
            <BarChart3 className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recommendations
            {recommendations.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                {recommendations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="doctors">
            <Users className="h-4 w-4 mr-2" />
            Doctor Analytics
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !insights || insights.total_appointments === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No appointment data yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Insights will appear once appointments have been recorded in the system.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Hour Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Appointments by Hour</CardTitle>
                  <CardDescription>Identify peak hours for better scheduling</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={hourChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }} 
                      />
                      <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Day Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Appointments by Day</CardTitle>
                  <CardDescription>Weekly appointment patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dayChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }} 
                      />
                      <Bar dataKey="appointments" fill="hsl(var(--chart-2, var(--primary)))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Appointment Outcomes</CardTitle>
                  <CardDescription>Status breakdown for last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusPieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Doctor Workload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Doctor Workload</CardTitle>
                  <CardDescription>Top doctors by appointment volume</CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.doctor_workload.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {insights.doctor_workload.slice(0, 6).map((doc, idx) => {
                        const maxAppts = insights.doctor_workload[0]?.appointments || 1;
                        const pct = Math.round((doc.appointments / maxAppts) * 100);
                        return (
                          <div key={doc.doctor_id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium truncate">{doc.name}</span>
                              <span className="text-muted-foreground">{doc.appointments}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">All Clear!</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  No scheduling issues detected. Click "Refresh Analytics" to check for new recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4" style={{ 
                borderLeftColor: rec.priority === 'high' 
                  ? 'hsl(var(--destructive))' 
                  : rec.priority === 'medium' 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--muted-foreground))'
              }}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="mt-0.5">{getTypeIcon(rec.recommendation_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <Badge variant={getPriorityColor(rec.priority) as any}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => dismissRecommendation(rec.id)}
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Doctor Analytics Tab */}
        <TabsContent value="doctors" className="space-y-4">
          {analytics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Analytics Data</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Click "Refresh Analytics" to compute per-doctor scheduling metrics.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {analytics.map((a) => (
                <Card key={a.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Doctor ID: {a.doctor_id.slice(0, 8)}...
                    </CardTitle>
                    <CardDescription>
                      {a.period_start} → {a.period_end}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>{' '}
                        <span className="font-medium">{a.total_appointments}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed:</span>{' '}
                        <span className="font-medium">{a.completed_appointments}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">No-show rate:</span>{' '}
                        <span className={`font-medium ${a.no_show_rate > 15 ? 'text-destructive' : ''}`}>
                          {a.no_show_rate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Utilization:</span>{' '}
                        <span className={`font-medium ${a.utilization_rate > 90 ? 'text-amber-500' : ''}`}>
                          {a.utilization_rate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg/day:</span>{' '}
                        <span className="font-medium">{a.avg_daily_appointments}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Peak hour:</span>{' '}
                        <span className="font-medium">
                          {a.peak_hour !== null ? `${a.peak_hour}:00` : '-'}
                        </span>
                      </div>
                      {a.busiest_day !== null && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Busiest day:</span>{' '}
                          <span className="font-medium">{DAY_NAMES[a.busiest_day]}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartSchedulingDashboard;
