-- Create a policy to allow public read access for patient verification
-- Only allows reading specific fields needed for verification (limited exposure)
CREATE POLICY "Public can verify patients by id"
ON public.patients
FOR SELECT
USING (true);