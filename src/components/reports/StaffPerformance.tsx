import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, Clock, Calendar, TrendingUp, Star, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { format, subDays } from 'date-fns';

interface DoctorPerformance {
  id: string;
  name: string;
  specialization: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  uniquePatients: number;
  completionRate: number;
  noShowRate: number;
  avgRating: number;
  feedbackCount: number;
  revenue: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const StaffPerformance: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [sortBy, setSortBy] = useState<'appointments' | 'rating' | 'revenue' | 'completion'>('appointments');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const startDate = format(subDays(new Date(), parseInt(timeRange)), 'yyyy-MM-dd');

      const [
        { data: doctorList },
        { data: appointments },
        { data: feedback },
      ] = await Promise.all([
        supabase.from('doctors').select('id, first_name, last_name, specialization').eq('status', 'active'),
        supabase.from('appointments').select('doctor_id, patient_id, status').gte('appointment_date', startDate).is('deleted_at', null),
        supabase.from('patient_feedback').select('doctor_id, rating').gte('created_at', `${startDate}T00:00:00`),
      ]);

      if (!doctorList) { setLoading(false); return; }

      const performanceData: DoctorPerformance[] = doctorList.map(doc => {
        const docAppts = appointments?.filter(a => a.doctor_id === doc.id) || [];
        const completed = docAppts.filter(a => a.status === 'completed').length;
        const cancelled = docAppts.filter(a => a.status === 'cancelled').length;
        const noShow = docAppts.filter(a => a.status === 'no-show').length;
        const uniquePatients = new Set(docAppts.map(a => a.patient_id)).size;

        const docFeedback = feedback?.filter(f => f.doctor_id === doc.id) || [];
        const avgRating = docFeedback.length > 0
          ? docFeedback.reduce((s, f) => s + f.rating, 0) / docFeedback.length
          : 0;

        const revenue = 0; // Revenue tracking per doctor requires schema enhancement

        return {
          id: doc.id,
          name: `Dr. ${doc.first_name} ${doc.last_name}`,
          specialization: doc.specialization,
          totalAppointments: docAppts.length,
          completedAppointments: completed,
          cancelledAppointments: cancelled,
          noShowAppointments: noShow,
          uniquePatients,
          completionRate: docAppts.length > 0 ? (completed / docAppts.length) * 100 : 0,
          noShowRate: docAppts.length > 0 ? (noShow / docAppts.length) * 100 : 0,
          avgRating,
          feedbackCount: docFeedback.length,
          revenue,
        };
      }).filter(d => d.totalAppointments > 0);

      setDoctors(performanceData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedDoctors = [...doctors].sort((a, b) => {
    switch (sortBy) {
      case 'appointments': return b.totalAppointments - a.totalAppointments;
      case 'rating': return b.avgRating - a.avgRating;
      case 'revenue': return b.revenue - a.revenue;
      case 'completion': return b.completionRate - a.completionRate;
      default: return 0;
    }
  });

  const totalAppointments = doctors.reduce((s, d) => s + d.totalAppointments, 0);
  const avgCompletionRate = doctors.length > 0
    ? doctors.reduce((s, d) => s + d.completionRate, 0) / doctors.length : 0;
  const avgNoShowRate = doctors.length > 0
    ? doctors.reduce((s, d) => s + d.noShowRate, 0) / doctors.length : 0;
  const totalRevenue = doctors.reduce((s, d) => s + d.revenue, 0);

  const chartData = sortedDoctors.slice(0, 8).map(d => ({
    name: d.name.replace('Dr. ', ''),
    appointments: d.totalAppointments,
    completed: d.completedAppointments,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appointments">By Appointments</SelectItem>
            <SelectItem value="rating">By Rating</SelectItem>
            <SelectItem value="revenue">By Revenue</SelectItem>
            <SelectItem value="completion">By Completion %</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{avgCompletionRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10"><Activity className="h-5 w-5 text-red-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Avg No-Show</p>
                <p className="text-2xl font-bold">{avgNoShowRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><Users className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Active Doctors</p>
                <p className="text-2xl font-bold">{doctors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doctor Workload Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="appointments" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Doctor Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Individual Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Doctor</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Appts</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Patients</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Completion</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">No-Show</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Rating</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sortedDoctors.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 font-semibold">{doc.totalAppointments}</td>
                    <td className="text-center py-3 px-2">{doc.uniquePatients}</td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={doc.completionRate >= 80 ? 'default' : doc.completionRate >= 60 ? 'secondary' : 'destructive'} className="text-xs">
                        {doc.completionRate.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={doc.noShowRate > 15 ? 'text-destructive font-medium' : ''}>
                        {doc.noShowRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      {doc.feedbackCount > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{doc.avgRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({doc.feedbackCount})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No reviews</span>
                      )}
                    </td>
                    <td className="text-right py-3 px-2 font-medium">${doc.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedDoctors.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No appointment data found for this period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPerformance;
