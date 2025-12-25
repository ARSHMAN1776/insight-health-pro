-- First drop the existing departments table completely
DROP TABLE IF EXISTS public.departments CASCADE;

-- Create departments table with the exact requested schema
CREATE TABLE public.departments (
  department_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  department_head UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('Active', 'Inactive'))
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin full access
CREATE POLICY "Admins can manage departments"
ON public.departments
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- All users can view active departments
CREATE POLICY "Anyone can view active departments"
ON public.departments
FOR SELECT
USING (status = 'Active');

-- Indexes for performance
CREATE INDEX idx_departments_name ON public.departments(department_name);
CREATE INDEX idx_departments_status ON public.departments(status);
CREATE INDEX idx_departments_head ON public.departments(department_head);

-- Trigger for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Relationship: One Department → Many Doctors
ALTER TABLE public.doctors
ADD COLUMN department_id UUID REFERENCES public.departments(department_id) ON DELETE SET NULL;

CREATE INDEX idx_doctors_department_id ON public.doctors(department_id);

-- Relationship: One Department → Many Patients
ALTER TABLE public.patients
ADD COLUMN department_id UUID REFERENCES public.departments(department_id) ON DELETE SET NULL;

CREATE INDEX idx_patients_department_id ON public.patients(department_id);

-- Relationship: One Department → Many Appointments
ALTER TABLE public.appointments
ADD COLUMN department_id UUID REFERENCES public.departments(department_id) ON DELETE SET NULL;

CREATE INDEX idx_appointments_department_id ON public.appointments(department_id);