-- =====================================================
-- PHI Audit Trail Table for HIPAA Compliance
-- Tracks all access and modifications to medical records
-- =====================================================

-- Create audit trail table for medical records and other PHI
CREATE TABLE public.phi_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was accessed/modified
  table_name TEXT NOT NULL,                          -- e.g., 'medical_records', 'prescriptions', 'lab_tests'
  record_id UUID NOT NULL,                           -- ID of the affected record
  patient_id UUID,                                   -- Patient whose data was accessed (for easy filtering)
  
  -- What action was taken
  action TEXT NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export', 'print')),
  
  -- Who performed the action
  performed_by UUID NOT NULL,                        -- User ID who performed the action
  performer_role TEXT,                               -- Role at time of action (admin, doctor, nurse, etc.)
  performer_name TEXT,                               -- Name for easier audit review
  
  -- What changed (for updates)
  old_values JSONB,                                  -- Previous values (for updates)
  new_values JSONB,                                  -- New values (for creates/updates)
  changed_fields TEXT[],                             -- List of fields that were modified
  
  -- Context
  reason TEXT,                                       -- Optional reason for access/change
  ip_address TEXT,                                   -- Client IP (if available)
  user_agent TEXT,                                   -- Browser/client info
  session_id TEXT,                                   -- Session identifier
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_phi_audit_patient_id ON public.phi_audit_log(patient_id);
CREATE INDEX idx_phi_audit_performed_by ON public.phi_audit_log(performed_by);
CREATE INDEX idx_phi_audit_table_name ON public.phi_audit_log(table_name);
CREATE INDEX idx_phi_audit_action ON public.phi_audit_log(action);
CREATE INDEX idx_phi_audit_created_at ON public.phi_audit_log(created_at DESC);
CREATE INDEX idx_phi_audit_record_id ON public.phi_audit_log(record_id);

-- Composite index for common queries
CREATE INDEX idx_phi_audit_patient_time ON public.phi_audit_log(patient_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.phi_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can view audit logs, system can insert
CREATE POLICY "Admins can view all audit logs"
  ON public.phi_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.phi_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Prevent modification or deletion of audit logs (immutable for compliance)
-- No UPDATE or DELETE policies = logs cannot be modified

-- =====================================================
-- Add comments for documentation
-- =====================================================
COMMENT ON TABLE public.phi_audit_log IS 'HIPAA-compliant audit trail for all PHI access and modifications';
COMMENT ON COLUMN public.phi_audit_log.action IS 'Type of action: view, create, update, delete, export, print';
COMMENT ON COLUMN public.phi_audit_log.old_values IS 'Previous field values before update (JSON)';
COMMENT ON COLUMN public.phi_audit_log.new_values IS 'New field values after create/update (JSON)';
COMMENT ON COLUMN public.phi_audit_log.changed_fields IS 'Array of field names that were modified';