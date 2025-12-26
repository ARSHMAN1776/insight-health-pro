-- Create junction table for doctors assigned to departments
CREATE TABLE public.department_doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id uuid NOT NULL REFERENCES public.departments(department_id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  assigned_at timestamp with time zone DEFAULT now(),
  notes text,
  UNIQUE(department_id, doctor_id)
);

-- Enable RLS
ALTER TABLE public.department_doctors ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view department doctors"
ON public.department_doctors
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage department doctors"
ON public.department_doctors
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add index for performance
CREATE INDEX idx_department_doctors_department ON public.department_doctors(department_id);
CREATE INDEX idx_department_doctors_doctor ON public.department_doctors(doctor_id);