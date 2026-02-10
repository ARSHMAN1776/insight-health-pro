import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, TrendingUp, Users, ThumbsUp, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface FeedbackStats {
  totalFeedback: number;
  avgRating: number;
  ratingDistribution: { rating: number; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  topDoctors: { name: string; avgRating: number; count: number }[];
  recentFeedback: { rating: number; comments: string; created_at: string; doctor_name: string }[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

const SatisfactionAnalytics: React.FC = () => {
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    avgRating: 0,
    ratingDistribution: [],
    categoryBreakdown: [],
    topDoctors: [],
    recentFeedback: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: feedback } = await supabase
        .from('patient_feedback')
        .select(`
          *,
          doctors:doctor_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (!feedback || feedback.length === 0) {
        setLoading(false);
        return;
      }

      const totalFeedback = feedback.length;
      const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;

      // Rating distribution
      const ratingDistribution = [1, 2, 3, 4, 5].map(r => ({
        rating: r,
        count: feedback.filter(f => f.rating === r).length,
      }));

      // Category breakdown
      const catMap: Record<string, number> = {};
      feedback.forEach(f => {
        (f.categories as string[] || []).forEach(c => {
          catMap[c] = (catMap[c] || 0) + 1;
        });
      });
      const categoryBreakdown = Object.entries(catMap)
        .map(([category, count]) => ({ category: category.replace(/_/g, ' '), count }))
        .sort((a, b) => b.count - a.count);

      // Top doctors
      const doctorMap: Record<string, { name: string; total: number; count: number }> = {};
      feedback.forEach(f => {
        const doc = f.doctors as any;
        if (doc) {
          const name = `Dr. ${doc.first_name} ${doc.last_name}`;
          if (!doctorMap[f.doctor_id]) doctorMap[f.doctor_id] = { name, total: 0, count: 0 };
          doctorMap[f.doctor_id].total += f.rating;
          doctorMap[f.doctor_id].count++;
        }
      });
      const topDoctors = Object.values(doctorMap)
        .map(d => ({ name: d.name, avgRating: d.total / d.count, count: d.count }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 5);

      // Recent feedback with comments
      const recentFeedback = feedback
        .filter(f => f.comments)
        .slice(0, 5)
        .map(f => ({
          rating: f.rating,
          comments: f.comments!,
          created_at: f.created_at,
          doctor_name: (f.doctors as any)
            ? `Dr. ${(f.doctors as any).first_name} ${(f.doctors as any).last_name}`
            : 'Unknown',
        }));

      setStats({ totalFeedback, avgRating, ratingDistribution, categoryBreakdown, topDoctors, recentFeedback });
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (stats.totalFeedback === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">No Feedback Yet</h3>
          <p className="text-sm text-muted-foreground">Patient feedback will appear here once submitted.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.totalFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ThumbsUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">
                  {((stats.ratingDistribution.filter(r => r.rating >= 4).reduce((s, r) => s + r.count, 0) / stats.totalFeedback) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">5-Star Rate</p>
                <p className="text-2xl font-bold">
                  {((stats.ratingDistribution.find(r => r.rating === 5)?.count || 0) / stats.totalFeedback * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.ratingDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="rating" type="category" tickFormatter={(v) => `${v} ★`} width={50} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))">
                  {stats.ratingDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Rated Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Rated Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topDoctors.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.count} reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm">{doc.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              {stats.topDoctors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      {stats.recentFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentFeedback.map((fb, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{fb.comments}</p>
                  <p className="text-xs text-muted-foreground mt-2">About {fb.doctor_name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SatisfactionAnalytics;
