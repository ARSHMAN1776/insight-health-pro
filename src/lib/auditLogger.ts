import { supabase } from '@/integrations/supabase/client';

/**
 * PHI Audit Logger - HIPAA Compliance
 * Logs all access and modifications to Protected Health Information
 */

export type AuditAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'print';

export type AuditTableName = 
  | 'medical_records' 
  | 'prescriptions' 
  | 'lab_tests' 
  | 'patients'
  | 'appointments';

interface AuditLogEntry {
  table_name: AuditTableName;
  record_id: string;
  patient_id?: string;
  action: AuditAction;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_fields?: string[];
  reason?: string;
}

interface UserContext {
  userId: string;
  userRole?: string;
  userName?: string;
}

/**
 * Get the fields that changed between old and new values
 */
function getChangedFields(
  oldValues: Record<string, any> | undefined,
  newValues: Record<string, any> | undefined
): string[] {
  if (!oldValues || !newValues) return [];
  
  const changedFields: string[] = [];
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
  
  for (const key of allKeys) {
    // Skip internal fields
    if (['created_at', 'updated_at', 'id'].includes(key)) continue;
    
    const oldVal = JSON.stringify(oldValues[key]);
    const newVal = JSON.stringify(newValues[key]);
    
    if (oldVal !== newVal) {
      changedFields.push(key);
    }
  }
  
  return changedFields;
}

/**
 * Sanitize values for logging - remove sensitive data that shouldn't be in logs
 */
function sanitizeForLog(values: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!values) return undefined;
  
  // Create a copy to avoid mutating original
  const sanitized = { ...values };
  
  // Remove any fields that shouldn't be logged in plain text
  // (Add any additional sensitive field names here)
  const sensitiveFields = ['password', 'password_hash', 'ssn', 'social_security'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Log a PHI access or modification event
 */
export async function logPhiAccess(
  entry: AuditLogEntry,
  userContext: UserContext
): Promise<void> {
  try {
    const changedFields = entry.action === 'update' 
      ? getChangedFields(entry.old_values, entry.new_values)
      : entry.changed_fields;

    const { error } = await supabase
      .from('phi_audit_log')
      .insert({
        table_name: entry.table_name,
        record_id: entry.record_id,
        patient_id: entry.patient_id || null,
        action: entry.action,
        performed_by: userContext.userId,
        performer_role: userContext.userRole || null,
        performer_name: userContext.userName || null,
        old_values: sanitizeForLog(entry.old_values) || null,
        new_values: sanitizeForLog(entry.new_values) || null,
        changed_fields: changedFields || null,
        reason: entry.reason || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

    if (error) {
      // Log to console but don't throw - audit failures shouldn't break the app
      console.error('[AUDIT LOG ERROR] Failed to log PHI access:', error);
    }
  } catch (err) {
    // Silent failure - audit logging should never break the main operation
    console.error('[AUDIT LOG ERROR] Exception during logging:', err);
  }
}

/**
 * Log viewing of a medical record
 */
export async function logMedicalRecordView(
  recordId: string,
  patientId: string,
  userContext: UserContext
): Promise<void> {
  return logPhiAccess(
    {
      table_name: 'medical_records',
      record_id: recordId,
      patient_id: patientId,
      action: 'view',
    },
    userContext
  );
}

/**
 * Log creation of a medical record
 */
export async function logMedicalRecordCreate(
  recordId: string,
  patientId: string,
  newValues: Record<string, any>,
  userContext: UserContext
): Promise<void> {
  return logPhiAccess(
    {
      table_name: 'medical_records',
      record_id: recordId,
      patient_id: patientId,
      action: 'create',
      new_values: newValues,
    },
    userContext
  );
}

/**
 * Log update of a medical record
 */
export async function logMedicalRecordUpdate(
  recordId: string,
  patientId: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  userContext: UserContext
): Promise<void> {
  return logPhiAccess(
    {
      table_name: 'medical_records',
      record_id: recordId,
      patient_id: patientId,
      action: 'update',
      old_values: oldValues,
      new_values: newValues,
    },
    userContext
  );
}

/**
 * Log deletion of a medical record
 */
export async function logMedicalRecordDelete(
  recordId: string,
  patientId: string,
  oldValues: Record<string, any>,
  userContext: UserContext
): Promise<void> {
  return logPhiAccess(
    {
      table_name: 'medical_records',
      record_id: recordId,
      patient_id: patientId,
      action: 'delete',
      old_values: oldValues,
    },
    userContext
  );
}

/**
 * Log prescription access
 */
export async function logPrescriptionAccess(
  recordId: string,
  patientId: string,
  action: AuditAction,
  userContext: UserContext,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> {
  return logPhiAccess(
    {
      table_name: 'prescriptions',
      record_id: recordId,
      patient_id: patientId,
      action,
      old_values: oldValues,
      new_values: newValues,
    },
    userContext
  );
}

/**
 * Log lab test access
 */
export async function logLabTestAccess(
  recordId: string,
  patientId: string,
  action: AuditAction,
  userContext: UserContext,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> {
  return logPhiAccess(
    {
      table_name: 'lab_tests',
      record_id: recordId,
      patient_id: patientId,
      action,
      old_values: oldValues,
      new_values: newValues,
    },
    userContext
  );
}

/**
 * Hook to get current user context for audit logging
 */
export function getUserContextFromAuth(
  user: { id: string } | null,
  userRole?: string,
  profile?: { first_name?: string; last_name?: string } | null
): UserContext | null {
  if (!user) return null;
  
  return {
    userId: user.id,
    userRole: userRole,
    userName: profile 
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
      : undefined,
  };
}
