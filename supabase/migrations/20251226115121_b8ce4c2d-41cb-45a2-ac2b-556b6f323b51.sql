-- Create staff_schedules table for managing staff availability
CREATE TABLE public.staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  staff_type VARCHAR(20) NOT NULL CHECK (staff_type IN ('doctor', 'nurse')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER DEFAULT 30,
  is_available BOOLEAN DEFAULT true,
  break_start TIME,
  break_end TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, staff_type, day_of_week)
);

-- Enable RLS
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

-- Anyone can view schedules (needed for booking)
CREATE POLICY "Anyone can view staff schedules"
ON public.staff_schedules
FOR SELECT
USING (true);

-- Only admins can manage schedules
CREATE POLICY "Admins can insert staff schedules"
ON public.staff_schedules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update staff schedules"
ON public.staff_schedules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete staff schedules"
ON public.staff_schedules
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_staff_schedules_updated_at
BEFORE UPDATE ON public.staff_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for staff_schedules
ALTER TABLE public.staff_schedules REPLICA IDENTITY FULL;