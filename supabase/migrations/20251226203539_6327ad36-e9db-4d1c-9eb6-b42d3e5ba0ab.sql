-- Add surgery_id to room_assignments to link post-op room assignment
ALTER TABLE public.room_assignments 
ADD COLUMN IF NOT EXISTS surgery_id uuid REFERENCES public.surgeries(id);

-- Create index for surgery lookup
CREATE INDEX IF NOT EXISTS idx_room_assignments_surgery ON public.room_assignments(surgery_id);

-- Add reason column for admission type
ALTER TABLE public.room_assignments
ADD COLUMN IF NOT EXISTS admission_reason text DEFAULT 'general' CHECK (admission_reason IN ('general', 'post_surgery', 'emergency', 'observation', 'planned'));