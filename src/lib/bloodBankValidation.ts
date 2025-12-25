import { z } from 'zod';

// ============================================
// BLOOD BANK VALIDATION & SAFETY RULES
// Medical System Best Practices
// ============================================

// Allowed user roles for blood bank operations
export const BLOOD_BANK_ROLES = ['admin', 'doctor', 'nurse'] as const;
export type BloodBankRole = typeof BLOOD_BANK_ROLES[number];

// ============================================
// INPUT SANITIZATION UTILITIES
// ============================================

/**
 * Sanitize string input - remove dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize numeric input - ensure valid positive integer
 */
export function sanitizeUnits(input: string | number): number {
  const num = typeof input === 'string' ? parseInt(input, 10) : input;
  
  if (isNaN(num) || !isFinite(num)) return 0;
  if (num < 0) return 0;
  if (num > 10000) return 10000; // Reasonable max limit
  
  return Math.floor(num);
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * Blood issue validation schema
 */
export const bloodIssueSchema = z.object({
  patient_id: z.string()
    .min(1, 'Patient is required')
    .refine(isValidUUID, 'Invalid patient ID format'),
  blood_group_id: z.string()
    .min(1, 'Blood group is required')
    .refine(isValidUUID, 'Invalid blood group ID format'),
  units: z.number()
    .min(1, 'At least 1 unit is required')
    .max(10, 'Maximum 10 units per single issue for safety')
    .int('Units must be a whole number'),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : undefined),
});

/**
 * Stock addition validation schema
 */
export const stockAdditionSchema = z.object({
  blood_group_id: z.string()
    .min(1, 'Blood group is required')
    .refine(isValidUUID, 'Invalid blood group ID format'),
  units: z.number()
    .min(1, 'At least 1 unit is required')
    .max(1000, 'Maximum 1000 units per transaction')
    .int('Units must be a whole number'),
  source: z.string()
    .max(200, 'Source must be less than 200 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : undefined),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : undefined),
});

/**
 * Donor registration validation schema
 */
export const donorSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeInput),
  blood_group_id: z.string()
    .min(1, 'Blood group is required')
    .refine(isValidUUID, 'Invalid blood group ID format'),
  contact: z.string()
    .max(50, 'Contact must be less than 50 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : undefined),
});

// ============================================
// STOCK VALIDATION FUNCTIONS
// ============================================

/**
 * Validate that stock won't go negative after an issue
 */
export function validateStockAvailability(
  currentStock: number,
  requestedUnits: number
): { valid: boolean; error?: string } {
  const sanitizedCurrent = sanitizeUnits(currentStock);
  const sanitizedRequested = sanitizeUnits(requestedUnits);

  if (sanitizedRequested <= 0) {
    return { valid: false, error: 'Units must be a positive number' };
  }

  if (sanitizedRequested > sanitizedCurrent) {
    return { 
      valid: false, 
      error: `Insufficient stock. Only ${sanitizedCurrent} units available, cannot issue ${sanitizedRequested} units.`
    };
  }

  // Ensure result won't be negative (double-check)
  const resultingStock = sanitizedCurrent - sanitizedRequested;
  if (resultingStock < 0) {
    return { valid: false, error: 'Operation would result in negative stock' };
  }

  return { valid: true };
}

/**
 * Calculate new stock balance with safety checks
 */
export function calculateNewBalance(
  currentStock: number,
  units: number,
  operation: 'add' | 'issue'
): { newBalance: number; valid: boolean; error?: string } {
  const sanitizedCurrent = sanitizeUnits(currentStock);
  const sanitizedUnits = sanitizeUnits(units);

  if (sanitizedUnits <= 0) {
    return { newBalance: sanitizedCurrent, valid: false, error: 'Units must be positive' };
  }

  let newBalance: number;

  if (operation === 'add') {
    newBalance = sanitizedCurrent + sanitizedUnits;
    // Check for overflow
    if (newBalance > 100000) {
      return { newBalance: sanitizedCurrent, valid: false, error: 'Maximum stock limit exceeded' };
    }
  } else {
    newBalance = sanitizedCurrent - sanitizedUnits;
    if (newBalance < 0) {
      return { 
        newBalance: sanitizedCurrent, 
        valid: false, 
        error: `Insufficient stock. Only ${sanitizedCurrent} units available.`
      };
    }
  }

  return { newBalance, valid: true };
}

// ============================================
// AUTHORIZATION HELPERS
// ============================================

/**
 * Check if user role is authorized for blood bank operations
 */
export function isAuthorizedForBloodBank(userRole: string | undefined | null): boolean {
  if (!userRole) return false;
  return BLOOD_BANK_ROLES.includes(userRole as BloodBankRole);
}

/**
 * Get authorization error message
 */
export function getAuthorizationError(userRole: string | undefined | null): string {
  if (!userRole) {
    return 'Authentication required. Please log in to access blood bank features.';
  }
  return `Access denied. Your role "${userRole}" is not authorized for blood bank operations. Required roles: ${BLOOD_BANK_ROLES.join(', ')}.`;
}

// ============================================
// AUDIT LOG HELPERS
// ============================================

export interface AuditLogEntry {
  action: string;
  entity: string;
  entity_id: string;
  user_id: string | null;
  user_role: string | null;
  details: Record<string, unknown>;
  timestamp: string;
  ip_address?: string;
}

/**
 * Create an audit log entry object
 */
export function createAuditEntry(
  action: 'ISSUE' | 'ADD_STOCK' | 'REMOVE_STOCK' | 'CREATE_DONOR' | 'UPDATE_DONOR',
  entity: string,
  entityId: string,
  userId: string | null,
  userRole: string | null,
  details: Record<string, unknown>
): AuditLogEntry {
  return {
    action,
    entity,
    entity_id: entityId,
    user_id: userId,
    user_role: userRole,
    details: {
      ...details,
      sanitized: true, // Flag that input was sanitized
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format audit log for console/storage
 */
export function formatAuditLog(entry: AuditLogEntry): string {
  return `[AUDIT] ${entry.timestamp} | Action: ${entry.action} | Entity: ${entry.entity} | ID: ${entry.entity_id} | User: ${entry.user_id || 'anonymous'} | Role: ${entry.user_role || 'none'} | Details: ${JSON.stringify(entry.details)}`;
}

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  // Stock errors
  INSUFFICIENT_STOCK: 'Insufficient blood stock available for this request',
  NEGATIVE_STOCK: 'Stock cannot go below zero',
  INVALID_UNITS: 'Please enter a valid number of units',
  MAX_UNITS_EXCEEDED: 'Maximum units per transaction exceeded',
  
  // Authorization errors
  NOT_AUTHENTICATED: 'Please log in to perform this action',
  NOT_AUTHORIZED: 'You do not have permission to perform this action',
  
  // Validation errors
  INVALID_PATIENT: 'Please select a valid patient',
  INVALID_BLOOD_GROUP: 'Please select a valid blood group',
  INVALID_INPUT: 'Please check your input and try again',
  
  // System errors
  DATABASE_ERROR: 'A database error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors.map(e => e.message).join('. ');
  }
  
  if (error instanceof Error) {
    // Check for common Supabase errors
    if (error.message.includes('row-level security')) {
      return ERROR_MESSAGES.NOT_AUTHORIZED;
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// ============================================
// CRITICAL STOCK THRESHOLDS
// ============================================

export const STOCK_THRESHOLDS = {
  OUT_OF_STOCK: 0,
  CRITICAL: 5,
  LOW: 10,
  ADEQUATE: 20,
} as const;

export function getStockLevel(units: number): 'out_of_stock' | 'critical' | 'low' | 'adequate' {
  if (units <= STOCK_THRESHOLDS.OUT_OF_STOCK) return 'out_of_stock';
  if (units < STOCK_THRESHOLDS.CRITICAL) return 'critical';
  if (units < STOCK_THRESHOLDS.LOW) return 'low';
  return 'adequate';
}
