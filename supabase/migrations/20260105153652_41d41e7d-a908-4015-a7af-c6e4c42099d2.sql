-- PHI Audit Log table for HIPAA compliance tracking
CREATE TABLE IF NOT EXISTS public.phi_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export', 'print')),
    performed_by UUID NOT NULL,
    performer_role TEXT,
    performer_name TEXT,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_phi_audit_log_patient_id ON public.phi_audit_log(patient_id);
CREATE INDEX idx_phi_audit_log_performed_by ON public.phi_audit_log(performed_by);
CREATE INDEX idx_phi_audit_log_table_name ON public.phi_audit_log(table_name);
CREATE INDEX idx_phi_audit_log_created_at ON public.phi_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.phi_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (they should not be modifiable)
CREATE POLICY "Admins can view audit logs"
ON public.phi_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone authenticated can insert audit logs (for tracking their own actions)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.phi_audit_log
FOR INSERT
TO authenticated
WITH CHECK (performed_by = auth.uid());

-- No update or delete allowed - audit logs are immutable
-- This is enforced by not creating UPDATE or DELETE policies

COMMENT ON TABLE public.phi_audit_log IS 'HIPAA-compliant audit log for PHI access tracking';