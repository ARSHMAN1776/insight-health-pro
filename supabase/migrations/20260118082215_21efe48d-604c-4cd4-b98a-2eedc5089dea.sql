-- Performance Indexes for Queue System
CREATE INDEX IF NOT EXISTS idx_queue_entries_queue_status 
  ON public.queue_entries(queue_id, status);

CREATE INDEX IF NOT EXISTS idx_queue_entries_position 
  ON public.queue_entries(queue_id, position_in_queue);

CREATE INDEX IF NOT EXISTS idx_queue_entries_patient_status 
  ON public.queue_entries(patient_id, status);

-- Performance Indexes for Registration Queue
CREATE INDEX IF NOT EXISTS idx_registration_queue_status 
  ON public.patient_registration_queue(status);

CREATE INDEX IF NOT EXISTS idx_registration_queue_user 
  ON public.patient_registration_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_registration_queue_created 
  ON public.patient_registration_queue(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date_status 
  ON public.appointments(patient_id, appointment_date, status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_status 
  ON public.appointments(doctor_id, appointment_date, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_daily_queues_date_active 
  ON public.daily_queues(queue_date, is_active);

-- Index for patient lookups by user_id
CREATE INDEX IF NOT EXISTS idx_patients_user_id 
  ON public.patients(user_id) 
  WHERE user_id IS NOT NULL;

-- Index for medical records by patient
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_date 
  ON public.medical_records(patient_id, visit_date DESC)
  WHERE deleted_at IS NULL;

-- Index for prescriptions by patient and status
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_status 
  ON public.prescriptions(patient_id, status)
  WHERE deleted_at IS NULL;

-- Index for lab tests by patient and status
CREATE INDEX IF NOT EXISTS idx_lab_tests_patient_status 
  ON public.lab_tests(patient_id, status)
  WHERE deleted_at IS NULL;

-- Index for notifications by user
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, read, created_at DESC);