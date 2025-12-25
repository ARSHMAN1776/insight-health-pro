-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  head_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  floor INTEGER,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin: Full access
CREATE POLICY "Admins can manage departments"
ON public.departments
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Everyone can view active departments (for appointment booking, etc.)
CREATE POLICY "Anyone can view active departments"
ON public.departments
FOR SELECT
USING (is_active = true);

-- Create index for performance
CREATE INDEX idx_departments_name ON public.departments(name);
CREATE INDEX idx_departments_is_active ON public.departments(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();