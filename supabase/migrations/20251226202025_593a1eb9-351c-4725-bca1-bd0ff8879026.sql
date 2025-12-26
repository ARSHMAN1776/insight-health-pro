-- Create room_assignments table for inpatient bed assignments
CREATE TABLE public.room_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  bed_number integer NOT NULL,
  admission_date date NOT NULL DEFAULT CURRENT_DATE,
  discharge_date date,
  status varchar NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred')),
  notes text,
  assigned_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(room_id, bed_number, status) -- Only one active assignment per bed
);

-- Enable RLS
ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view room assignments" ON public.room_assignments
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'doctor') OR 
    has_role(auth.uid(), 'nurse') OR 
    has_role(auth.uid(), 'receptionist')
  );

CREATE POLICY "Admins and nurses can manage room assignments" ON public.room_assignments
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'nurse')
  ) WITH CHECK (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'nurse')
  );

-- Create index for faster lookups
CREATE INDEX idx_room_assignments_room_id ON public.room_assignments(room_id);
CREATE INDEX idx_room_assignments_patient_id ON public.room_assignments(patient_id);
CREATE INDEX idx_room_assignments_status ON public.room_assignments(status);

-- Add trigger for updated_at
CREATE TRIGGER update_room_assignments_updated_at
  BEFORE UPDATE ON public.room_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();