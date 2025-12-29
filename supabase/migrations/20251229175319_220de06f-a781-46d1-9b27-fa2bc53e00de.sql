-- Add RLS policies for lab_tests table for lab technicians
CREATE POLICY "Lab technicians can view all lab tests"
ON public.lab_tests
FOR SELECT
USING (has_role(auth.uid(), 'lab_technician'::app_role));

CREATE POLICY "Lab technicians can update lab tests"
ON public.lab_tests
FOR UPDATE
USING (has_role(auth.uid(), 'lab_technician'::app_role))
WITH CHECK (has_role(auth.uid(), 'lab_technician'::app_role));

-- Lab technicians need to view patients for context
CREATE POLICY "Lab technicians can view patients"
ON public.patients
FOR SELECT
USING (has_role(auth.uid(), 'lab_technician'::app_role));

-- Lab technicians need to view doctors for context  
CREATE POLICY "Lab technicians can view doctors"
ON public.doctors
FOR SELECT
USING (has_role(auth.uid(), 'lab_technician'::app_role));