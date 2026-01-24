-- Add lab report fields to lab_tests table
ALTER TABLE public.lab_tests 
ADD COLUMN IF NOT EXISTS test_parameters JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS specimen_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS specimen_collection_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reporting_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS method_used VARCHAR(255),
ADD COLUMN IF NOT EXISTS comments TEXT,
ADD COLUMN IF NOT EXISTS report_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS technician_signature TEXT,
ADD COLUMN IF NOT EXISTS pathologist_signature TEXT,
ADD COLUMN IF NOT EXISTS is_report_finalized BOOLEAN DEFAULT false;

-- Create index for report lookup
CREATE INDEX IF NOT EXISTS idx_lab_tests_report_number ON public.lab_tests(report_number);

-- Add comment for documentation
COMMENT ON COLUMN public.lab_tests.test_parameters IS 'JSONB array of test parameters with name, value, unit, normalRange, status, flag';