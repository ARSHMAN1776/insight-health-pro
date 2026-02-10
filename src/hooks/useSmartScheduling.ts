import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SchedulingAnalytics {
  id: string;
  doctor_id: string;
  period_start: string;
  period_end: string;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  no_show_rate: number;
  avg_daily_appointments: number;
  peak_hour: number | null;
  busiest_day: number | null;
  utilization_rate: number;
  computed_at: string;
}

interface SchedulingRecommendation {
  id: string;
  doctor_id: string | null;
  recommendation_type: string;
  title: string;
  description: string;
  priority: string;
  metadata: Record<string, any>;
  is_dismissed: boolean;
  created_at: string;
}

interface SchedulingInsights {
  total_appointments: number;
  hour_distribution: Record<number, number>;
  day_distribution: Record<string, number>;
  doctor_workload: { doctor_id: string; name: string; appointments: number }[];
  status_breakdown: {
    completed: number;
    cancelled: number;
    no_show: number;
    scheduled: number;
  };
}

export const useSmartScheduling = () => {
  const [analytics, setAnalytics] = useState<SchedulingAnalytics[]>([]);
  const [recommendations, setRecommendations] = useState<SchedulingRecommendation[]>([]);
  const [insights, setInsights] = useState<SchedulingInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [computeLoading, setComputeLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    const { data, error } = await supabase
      .from('scheduling_analytics')
      .select('*')
      .order('computed_at', { ascending: false });

    if (!error && data) {
      setAnalytics(data as SchedulingAnalytics[]);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    const { data, error } = await supabase
      .from('scheduling_recommendations')
      .select('*')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecommendations(data as SchedulingRecommendation[]);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-scheduling', {
        body: { action: 'get_insights' },
      });

      if (error) throw error;
      if (data?.insights) {
        setInsights(data.insights);
      }
    } catch (error: any) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const computeAnalytics = useCallback(async (doctorId?: string) => {
    setComputeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-scheduling', {
        body: { action: 'compute_analytics', doctor_id: doctorId },
      });

      if (error) throw error;

      // Generate recommendations after computing analytics
      await supabase.functions.invoke('smart-scheduling', {
        body: { action: 'generate_recommendations', doctor_id: doctorId },
      });

      toast({ title: 'Analytics Computed', description: 'Scheduling insights have been updated.' });
      await Promise.all([fetchAnalytics(), fetchRecommendations()]);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to compute analytics.', variant: 'destructive' });
    } finally {
      setComputeLoading(false);
    }
  }, [fetchAnalytics, fetchRecommendations]);

  const dismissRecommendation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('scheduling_recommendations')
      .update({ is_dismissed: true })
      .eq('id', id);

    if (!error) {
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchRecommendations();
    fetchInsights();
  }, [fetchAnalytics, fetchRecommendations, fetchInsights]);

  return {
    analytics,
    recommendations,
    insights,
    loading,
    computeLoading,
    computeAnalytics,
    dismissRecommendation,
    refetch: () => Promise.all([fetchAnalytics(), fetchRecommendations(), fetchInsights()]),
  };
};
