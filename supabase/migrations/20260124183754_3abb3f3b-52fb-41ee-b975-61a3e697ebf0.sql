-- Create storage bucket for hospital branding (logos, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hospital-branding', 'hospital-branding', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for hospital branding bucket
CREATE POLICY "Hospital branding images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hospital-branding');

CREATE POLICY "Admins can upload hospital branding"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hospital-branding' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id
  )
);

CREATE POLICY "Admins can update hospital branding"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hospital-branding')
WITH CHECK (bucket_id = 'hospital-branding');

CREATE POLICY "Admins can delete hospital branding"
ON storage.objects FOR DELETE
USING (bucket_id = 'hospital-branding');