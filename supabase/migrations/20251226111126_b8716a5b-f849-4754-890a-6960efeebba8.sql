-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint with 'patient_registration' included
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'appointment'::text, 
  'medication'::text, 
  'lab_result'::text, 
  'system'::text, 
  'critical'::text, 
  'general'::text,
  'patient_registration'::text
]));