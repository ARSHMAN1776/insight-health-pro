-- Create daily_queues table - Master queue for each doctor per day
CREATE TABLE public.daily_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_date DATE NOT NULL,
  department_id UUID REFERENCES public.departments(department_id),
  doctor_id UUID REFERENCES public.doctors(id),
  current_token_number INTEGER DEFAULT 0,
  token_prefix VARCHAR(10) DEFAULT 'T',
  is_active BOOLEAN DEFAULT true,
  avg_consultation_mins INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(queue_date, doctor_id)
);

-- Create queue_entries table - Individual patient entries in queue
CREATE TABLE public.queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES public.daily_queues(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  token_number VARCHAR(20) NOT NULL,
  entry_type VARCHAR(20) DEFAULT 'walk_in' CHECK (entry_type IN ('appointment', 'walk_in', 'emergency')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'priority', 'emergency')),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_consultation', 'completed', 'no_show', 'cancelled', 'transferred')),
  symptoms TEXT,
  notes TEXT,
  estimated_wait_mins INTEGER,
  position_in_queue INTEGER,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  called_at TIMESTAMPTZ,
  consultation_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE TRIGGER update_daily_queues_updated_at
  BEFORE UPDATE ON public.daily_queues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_queue_entries_updated_at
  BEFORE UPDATE ON public.queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for daily_queues
CREATE POLICY "Admins have full access to daily_queues"
  ON public.daily_queues FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Receptionists have full access to daily_queues"
  ON public.daily_queues FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'))
  WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Doctors can view their own queues"
  ON public.daily_queues FOR SELECT
  TO authenticated
  USING (
    doctor_id = public.get_doctor_id_for_user(auth.uid())
    OR public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Doctors can update their own queues"
  ON public.daily_queues FOR UPDATE
  TO authenticated
  USING (doctor_id = public.get_doctor_id_for_user(auth.uid()))
  WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));

-- RLS Policies for queue_entries
CREATE POLICY "Admins have full access to queue_entries"
  ON public.queue_entries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Receptionists have full access to queue_entries"
  ON public.queue_entries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'receptionist'))
  WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Doctors can view entries in their queues"
  ON public.queue_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_queues dq
      WHERE dq.id = queue_id
      AND dq.doctor_id = public.get_doctor_id_for_user(auth.uid())
    )
    OR public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Doctors can update entries in their queues"
  ON public.queue_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_queues dq
      WHERE dq.id = queue_id
      AND dq.doctor_id = public.get_doctor_id_for_user(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_queues dq
      WHERE dq.id = queue_id
      AND dq.doctor_id = public.get_doctor_id_for_user(auth.uid())
    )
  );

CREATE POLICY "Patients can view their own queue entries"
  ON public.queue_entries FOR SELECT
  TO authenticated
  USING (patient_id = public.get_patient_id_for_user(auth.uid()));

-- Function to get or create today's queue for a doctor
CREATE OR REPLACE FUNCTION public.get_or_create_daily_queue(
  _doctor_id UUID,
  _department_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _queue_id UUID;
  _today DATE := CURRENT_DATE;
BEGIN
  -- Try to get existing queue
  SELECT id INTO _queue_id
  FROM public.daily_queues
  WHERE doctor_id = _doctor_id AND queue_date = _today;
  
  -- Create if not exists
  IF _queue_id IS NULL THEN
    INSERT INTO public.daily_queues (doctor_id, department_id, queue_date)
    VALUES (_doctor_id, _department_id, _today)
    RETURNING id INTO _queue_id;
  END IF;
  
  RETURN _queue_id;
END;
$$;

-- Function to generate next token number
CREATE OR REPLACE FUNCTION public.generate_next_token(_queue_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _next_number INTEGER;
  _prefix VARCHAR(10);
  _token TEXT;
BEGIN
  -- Lock the queue row and increment
  UPDATE public.daily_queues
  SET current_token_number = current_token_number + 1
  WHERE id = _queue_id
  RETURNING current_token_number, token_prefix INTO _next_number, _prefix;
  
  -- Format token with leading zeros
  _token := _prefix || '-' || LPAD(_next_number::TEXT, 3, '0');
  
  RETURN _token;
END;
$$;

-- Function to calculate queue position
CREATE OR REPLACE FUNCTION public.calculate_queue_position(_queue_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER + 1
  FROM public.queue_entries
  WHERE queue_id = _queue_id
  AND status IN ('waiting', 'called')
$$;

-- Function to estimate wait time
CREATE OR REPLACE FUNCTION public.estimate_wait_time(_queue_id UUID, _position INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(avg_consultation_mins, 15) * (_position - 1)
  FROM public.daily_queues
  WHERE id = _queue_id
$$;

-- Function to update positions after status change
CREATE OR REPLACE FUNCTION public.update_queue_positions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update positions for all waiting entries in the queue
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY 
      CASE priority 
        WHEN 'emergency' THEN 1 
        WHEN 'priority' THEN 2 
        ELSE 3 
      END,
      checked_in_at
    ) as new_position
    FROM public.queue_entries
    WHERE queue_id = NEW.queue_id
    AND status IN ('waiting', 'called')
  )
  UPDATE public.queue_entries qe
  SET position_in_queue = ranked.new_position,
      estimated_wait_mins = public.estimate_wait_time(NEW.queue_id, ranked.new_position::INTEGER)
  FROM ranked
  WHERE qe.id = ranked.id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_queue_positions_trigger
  AFTER INSERT OR UPDATE OF status ON public.queue_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_queue_positions();

-- Enable realtime for queue tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_queues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;