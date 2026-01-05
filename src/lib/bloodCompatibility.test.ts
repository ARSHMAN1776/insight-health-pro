import { describe, it, expect } from 'vitest';
import {
  isCompatible,
  getCompatibleDonors,
  getCompatibleRecipients,
  calculateExpiryDate,
  calculateNextEligibleDate,
  isDonorEligible,
  getBloodTypeColor,
  getPriorityColor,
  generateBagNumber,
  BLOOD_TYPES,
  COMPONENT_TYPES,
} from './bloodCompatibility';

describe('isCompatible', () => {
  describe('RBC compatibility', () => {
    it('should confirm O- is universal donor for RBC', () => {
      BLOOD_TYPES.forEach((recipientType) => {
        expect(isCompatible(recipientType, 'O-', 'packed_rbc')).toBe(true);
      });
    });

    it('should confirm AB+ is universal recipient for RBC', () => {
      BLOOD_TYPES.forEach((donorType) => {
        expect(isCompatible('AB+', donorType, 'packed_rbc')).toBe(true);
      });
    });

    it('should reject incompatible transfusions', () => {
      expect(isCompatible('A+', 'B+', 'packed_rbc')).toBe(false);
      expect(isCompatible('B-', 'A-', 'packed_rbc')).toBe(false);
      expect(isCompatible('O+', 'A+', 'packed_rbc')).toBe(false);
    });

    it('should accept same type transfusions', () => {
      BLOOD_TYPES.forEach((bloodType) => {
        expect(isCompatible(bloodType, bloodType, 'packed_rbc')).toBe(true);
      });
    });
  });

  describe('Plasma compatibility', () => {
    it('should confirm AB is universal plasma donor', () => {
      BLOOD_TYPES.forEach((recipientType) => {
        // AB+ can donate plasma to all Rh+ recipients, AB- to all
        expect(isCompatible(recipientType, 'AB-', 'fresh_frozen_plasma')).toBe(true);
      });
    });

    it('should have reversed compatibility for plasma', () => {
      // O+ can receive plasma from all positive types
      expect(isCompatible('O+', 'A+', 'fresh_frozen_plasma')).toBe(true);
      expect(isCompatible('O+', 'B+', 'fresh_frozen_plasma')).toBe(true);
      expect(isCompatible('O+', 'AB+', 'fresh_frozen_plasma')).toBe(true);
    });
  });
});

describe('getCompatibleDonors', () => {
  it('should return all blood types for AB+ RBC recipient', () => {
    const donors = getCompatibleDonors('AB+', 'packed_rbc');
    expect(donors).toHaveLength(8);
    expect(donors).toContain('O-');
    expect(donors).toContain('AB+');
  });

  it('should return only O- for O- RBC recipient', () => {
    const donors = getCompatibleDonors('O-', 'packed_rbc');
    expect(donors).toHaveLength(1);
    expect(donors).toContain('O-');
  });

  it('should return correct donors for platelets', () => {
    const donors = getCompatibleDonors('A+', 'platelets');
    expect(donors).toContain('A+');
    expect(donors).toContain('A-');
    expect(donors).toContain('O+');
    expect(donors).toContain('O-');
  });
});

describe('getCompatibleRecipients', () => {
  it('should return all blood types for O- RBC donor', () => {
    const recipients = getCompatibleRecipients('O-', 'packed_rbc');
    expect(recipients).toHaveLength(8);
  });

  it('should return only AB+ for AB+ RBC donor', () => {
    const recipients = getCompatibleRecipients('AB+', 'packed_rbc');
    expect(recipients).toContain('AB+');
    // AB+ can only donate to AB+
    expect(recipients).toHaveLength(1);
  });
});

describe('calculateExpiryDate', () => {
  const baseDate = new Date('2024-01-01');

  it('should calculate 35 days for whole blood', () => {
    const expiry = calculateExpiryDate(baseDate, 'whole_blood');
    expect(expiry.getDate()).toBe(5);
    expect(expiry.getMonth()).toBe(1); // February
  });

  it('should calculate 42 days for packed RBC', () => {
    const expiry = calculateExpiryDate(baseDate, 'packed_rbc');
    expect(expiry.getDate()).toBe(12);
    expect(expiry.getMonth()).toBe(1); // February
  });

  it('should calculate 5 days for platelets', () => {
    const expiry = calculateExpiryDate(baseDate, 'platelets');
    expect(expiry.getDate()).toBe(6);
    expect(expiry.getMonth()).toBe(0); // January
  });

  it('should calculate 1 year for fresh frozen plasma', () => {
    const expiry = calculateExpiryDate(baseDate, 'fresh_frozen_plasma');
    expect(expiry.getFullYear()).toBe(2025);
    expect(expiry.getMonth()).toBe(0);
    expect(expiry.getDate()).toBe(1);
  });

  it('should calculate 1 year for cryoprecipitate', () => {
    const expiry = calculateExpiryDate(baseDate, 'cryoprecipitate');
    expect(expiry.getFullYear()).toBe(2025);
  });
});

describe('calculateNextEligibleDate', () => {
  it('should add 56 days to last donation date', () => {
    const lastDonation = new Date('2024-01-01');
    const nextEligible = calculateNextEligibleDate(lastDonation);
    expect(nextEligible.getDate()).toBe(26);
    expect(nextEligible.getMonth()).toBe(1); // February
  });
});

describe('isDonorEligible', () => {
  it('should return true if no previous donation', () => {
    expect(isDonorEligible(null)).toBe(true);
  });

  it('should return true if last donation was more than 56 days ago', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60);
    expect(isDonorEligible(oldDate)).toBe(true);
  });

  it('should return false if last donation was less than 56 days ago', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30);
    expect(isDonorEligible(recentDate)).toBe(false);
  });
});

describe('getBloodTypeColor', () => {
  it('should return a color class for each blood type', () => {
    BLOOD_TYPES.forEach((bloodType) => {
      const color = getBloodTypeColor(bloodType);
      expect(color).toMatch(/^bg-/);
    });
  });

  it('should return different colors for different Rh factors', () => {
    expect(getBloodTypeColor('A+')).not.toBe(getBloodTypeColor('A-'));
    expect(getBloodTypeColor('B+')).not.toBe(getBloodTypeColor('B-'));
  });
});

describe('getPriorityColor', () => {
  it('should return correct colors for priorities', () => {
    expect(getPriorityColor('routine')).toBe('bg-gray-500');
    expect(getPriorityColor('urgent')).toBe('bg-yellow-500');
    expect(getPriorityColor('emergency')).toBe('bg-orange-500');
    expect(getPriorityColor('critical')).toBe('bg-red-500');
  });

  it('should return gray for unknown priority', () => {
    expect(getPriorityColor('unknown')).toBe('bg-gray-500');
  });
});

describe('generateBagNumber', () => {
  it('should generate unique bag numbers', () => {
    const bag1 = generateBagNumber();
    const bag2 = generateBagNumber();
    expect(bag1).not.toBe(bag2);
  });

  it('should start with BB-', () => {
    const bagNumber = generateBagNumber();
    expect(bagNumber).toMatch(/^BB-/);
  });

  it('should contain date in format YYYYMMDD', () => {
    const bagNumber = generateBagNumber();
    const datePattern = /BB-\d{8}-/;
    expect(bagNumber).toMatch(datePattern);
  });
});
