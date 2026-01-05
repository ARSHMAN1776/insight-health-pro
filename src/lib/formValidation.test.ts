import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  optionalPhoneSchema,
  licenseNumberSchema,
  dateOfBirthSchema,
  futureDateSchema,
  emailSchema,
  nameSchema,
  formatPhoneForDisplay,
  normalizePhoneInput,
  getLicensePattern,
  getLicenseFormatHint,
} from './formValidation';

describe('phoneSchema', () => {
  it('should accept valid US phone numbers', () => {
    const result = phoneSchema.safeParse('555-123-4567');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('+15551234567');
    }
  });

  it('should accept valid international phone numbers', () => {
    const result = phoneSchema.safeParse('+44 20 7946 0958');
    expect(result.success).toBe(true);
  });

  it('should reject too short phone numbers', () => {
    const result = phoneSchema.safeParse('123');
    expect(result.success).toBe(false);
  });

  it('should normalize phone numbers to E.164 format', () => {
    const result = phoneSchema.safeParse('(555) 123-4567');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('+15551234567');
    }
  });
});

describe('optionalPhoneSchema', () => {
  it('should accept empty string', () => {
    const result = optionalPhoneSchema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('should accept undefined', () => {
    const result = optionalPhoneSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('should validate non-empty phone numbers', () => {
    const result = optionalPhoneSchema.safeParse('555-123-4567');
    expect(result.success).toBe(true);
  });
});

describe('licenseNumberSchema', () => {
  it('should accept valid license numbers', () => {
    const validLicenses = ['MD123456', 'NP-12345', 'RN123456', 'PHARM12345'];
    validLicenses.forEach((license) => {
      const result = licenseNumberSchema.safeParse(license);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid license numbers', () => {
    const invalidLicenses = ['123', 'M12', 'ABCDEFGHIJKLMNOP12345678'];
    invalidLicenses.forEach((license) => {
      const result = licenseNumberSchema.safeParse(license);
      expect(result.success).toBe(false);
    });
  });

  it('should transform to uppercase', () => {
    const result = licenseNumberSchema.safeParse('md123456');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('MD123456');
    }
  });
});

describe('dateOfBirthSchema', () => {
  it('should accept valid past dates', () => {
    const result = dateOfBirthSchema.safeParse('1990-01-15');
    expect(result.success).toBe(true);
  });

  it('should reject future dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = dateOfBirthSchema.safeParse(futureDate.toISOString().split('T')[0]);
    expect(result.success).toBe(false);
  });

  it('should reject dates more than 150 years ago', () => {
    const result = dateOfBirthSchema.safeParse('1800-01-01');
    expect(result.success).toBe(false);
  });

  it('should reject empty strings', () => {
    const result = dateOfBirthSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('futureDateSchema', () => {
  it('should accept future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const result = futureDateSchema.safeParse(futureDate.toISOString().split('T')[0]);
    expect(result.success).toBe(true);
  });

  it('should accept today', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = futureDateSchema.safeParse(today);
    expect(result.success).toBe(true);
  });

  it('should reject past dates', () => {
    const result = futureDateSchema.safeParse('2020-01-01');
    expect(result.success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('should accept valid emails', () => {
    const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@gmail.com'];
    validEmails.forEach((email) => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid emails', () => {
    const invalidEmails = ['notanemail', 'missing@tld', '@nodomain.com', 'spaces in@email.com'];
    invalidEmails.forEach((email) => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
    });
  });

  it('should transform to lowercase', () => {
    const result = emailSchema.safeParse('TEST@EXAMPLE.COM');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });
});

describe('nameSchema', () => {
  it('should accept valid names', () => {
    const validNames = ['John', 'Mary Jane', "O'Connor", 'Smith-Jones'];
    validNames.forEach((name) => {
      const result = nameSchema.safeParse(name);
      expect(result.success).toBe(true);
    });
  });

  it('should reject names with numbers', () => {
    const result = nameSchema.safeParse('John123');
    expect(result.success).toBe(false);
  });

  it('should reject too short names', () => {
    const result = nameSchema.safeParse('J');
    expect(result.success).toBe(false);
  });

  it('should trim whitespace', () => {
    const result = nameSchema.safeParse('  John  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('John');
    }
  });
});

describe('formatPhoneForDisplay', () => {
  it('should format US phone numbers', () => {
    expect(formatPhoneForDisplay('+15551234567')).toBe('+1 (555) 123-4567');
  });

  it('should return international numbers as-is', () => {
    expect(formatPhoneForDisplay('+442079460958')).toBe('+442079460958');
  });

  it('should handle empty input', () => {
    expect(formatPhoneForDisplay('')).toBe('');
  });
});

describe('normalizePhoneInput', () => {
  it('should allow digits and formatting characters', () => {
    expect(normalizePhoneInput('(555) 123-4567')).toBe('(555) 123-4567');
  });

  it('should remove invalid characters', () => {
    expect(normalizePhoneInput('555abc123')).toBe('555123');
  });
});

describe('getLicensePattern', () => {
  it('should return correct pattern for doctor', () => {
    const pattern = getLicensePattern('doctor');
    expect(pattern.test('MD123456')).toBe(true);
    expect(pattern.test('RN123456')).toBe(false);
  });

  it('should return correct pattern for nurse', () => {
    const pattern = getLicensePattern('nurse');
    expect(pattern.test('RN123456')).toBe(true);
    expect(pattern.test('NP123456')).toBe(true);
    expect(pattern.test('LPN123456')).toBe(true);
  });

  it('should return default pattern for unknown roles', () => {
    const pattern = getLicensePattern('unknown');
    expect(pattern.test('XX12345')).toBe(true);
  });
});

describe('getLicenseFormatHint', () => {
  it('should return correct hint for doctor', () => {
    expect(getLicenseFormatHint('doctor')).toContain('MD');
  });

  it('should return correct hint for nurse', () => {
    expect(getLicenseFormatHint('nurse')).toContain('RN');
  });

  it('should return default hint for unknown roles', () => {
    expect(getLicenseFormatHint('unknown')).toContain('2-5 letters');
  });
});
