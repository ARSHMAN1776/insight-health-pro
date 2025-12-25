-- Create storage bucket for lab test reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-reports', 'lab-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Add report_image_url column to lab_tests table
ALTER TABLE public.lab_tests
ADD COLUMN IF NOT EXISTS report_image_url TEXT;

-- Create storage policies for lab reports bucket
CREATE POLICY "Anyone can view lab reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'lab-reports');

CREATE POLICY "Authenticated users can upload lab reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lab-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update lab reports"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lab-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete lab reports"
ON storage.objects FOR DELETE
USING (bucket_id = 'lab-reports' AND auth.role() = 'authenticated');