
-- Table to store computed scheduling analytics per doctor
CREATE TABLE public.scheduling_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  no_show_appointments INTEGER DEFAULT 0,
  no_show_rate NUMERIC(5,2) DEFAULT 0,
  avg_daily_appointments NUMERIC(5,2) DEFAULT 0,
  peak_hour INTEGER, -- hour of day (0-23) with most appointments
  busiest_day INTEGER, -- day of week (0-6) with most appointments
  avg_wait_time_mins NUMERIC(5,2) DEFAULT 0,
  utilization_rate NUMERIC(5,2) DEFAULT 0, -- % of available slots used
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, period_start, period_end)
);

-- Enable RLS
ALTER TABLE public.scheduling_analytics ENABLE ROW LEVEL SECURITY;

-- Admin and doctor can view analytics
CREATE POLICY "Admins can view all scheduling analytics"
ON public.scheduling_analytics FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view their own analytics"
ON public.scheduling_analytics FOR SELECT
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- Only system/admin can insert/update analytics
CREATE POLICY "Admins can manage scheduling analytics"
ON public.scheduling_analytics FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Table to store scheduling recommendations
CREATE TABLE public.scheduling_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'overbooking', 'workload_balance', 'peak_optimization', 'no_show_risk'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  metadata JSONB DEFAULT '{}',
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.scheduling_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all recommendations"
ON public.scheduling_recommendations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view their own recommendations"
ON public.scheduling_recommendations FOR SELECT
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage recommendations"
ON public.scheduling_recommendations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can dismiss their own recommendations"
ON public.scheduling_recommendations FOR UPDATE
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
