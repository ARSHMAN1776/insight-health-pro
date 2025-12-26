import { z } from 'zod';

// ============================================
// Shared Form Validation Utilities
// ============================================

/**
 * Phone number validation with optional country code
 * Accepts formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
 * Normalizes to E.164 format when possible
 */
export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number is too long')
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    'Please enter a valid phone number (e.g., +1 555-123-4567)'
  )
  .transform((val) => {
    // Remove all non-digit characters except leading +
    const cleaned = val.replace(/[^\d+]/g, '');
    // If no country code, assume US (+1)
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  });

/**
 * Optional phone schema for non-required fields
 */
export const optionalPhoneSchema = z.string()
  .optional()
  .refine((val) => {
    if (!val || val.trim() === '') return true;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phoneRegex.test(val) && val.replace(/\D/g, '').length >= 10;
  }, 'Please enter a valid phone number')
  .transform((val) => {
    if (!val || val.trim() === '') return undefined;
    const cleaned = val.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  });

/**
 * Medical license number validation
 * Supports common formats: MD123456, NP-12345, RN123456, PHARM-12345, etc.
 */
export const licenseNumberSchema = z.string()
  .min(5, 'License number must be at least 5 characters')
  .max(20, 'License number is too long')
  .regex(
    /^[A-Z]{2,5}[-]?[0-9]{4,10}$/i,
    'License format: 2-5 letters followed by 4-10 digits (e.g., MD123456, NP-12345)'
  )
  .transform((val) => val.toUpperCase().replace(/\s/g, ''));

/**
 * Date of birth validation - prevents future dates and unrealistic past dates
 */
export const dateOfBirthSchema = z.string()
  .min(1, 'Date of birth is required')
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Please enter a valid date')
  .refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, 'Date of birth cannot be in the future')
  .refine((val) => {
    const date = new Date(val);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 150); // Max age 150 years
    return date > minDate;
  }, 'Please enter a valid date of birth');

/**
 * Future date validation (for appointments, follow-ups)
 */
export const futureDateSchema = z.string()
  .min(1, 'Date is required')
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Please enter a valid date')
  .refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Date cannot be in the past');

/**
 * Email validation with proper format checking
 */
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long')
  .transform((val) => val.toLowerCase().trim());

/**
 * Name validation - letters, spaces, hyphens, apostrophes
 */
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name is too long')
  .regex(
    /^[a-zA-Z\s\-']+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .transform((val) => val.trim());

/**
 * Helper function to format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Format US numbers
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    const number = cleaned.slice(2);
    return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  
  // Return as-is for international
  return cleaned;
}

/**
 * Helper function to validate and normalize phone on input
 */
export function normalizePhoneInput(phone: string): string {
  // Allow typing with formatting characters
  return phone.replace(/[^\d\s\-+()]/g, '');
}

/**
 * Validate license number format based on role
 */
export function getLicensePattern(role: string): RegExp {
  const patterns: Record<string, RegExp> = {
    doctor: /^MD[-]?[0-9]{5,10}$/i,
    nurse: /^(RN|NP|LPN)[-]?[0-9]{5,10}$/i,
    pharmacist: /^(PHARM|RPH)[-]?[0-9]{5,10}$/i,
    default: /^[A-Z]{2,5}[-]?[0-9]{4,10}$/i,
  };
  return patterns[role] || patterns.default;
}

/**
 * Get license format hint based on role
 */
export function getLicenseFormatHint(role: string): string {
  const hints: Record<string, string> = {
    doctor: 'Format: MD followed by 5-10 digits (e.g., MD123456)',
    nurse: 'Format: RN/NP/LPN followed by 5-10 digits (e.g., RN123456)',
    pharmacist: 'Format: PHARM/RPH followed by 5-10 digits (e.g., PHARM12345)',
    default: 'Format: 2-5 letters followed by 4-10 digits',
  };
  return hints[role] || hints.default;
}
