// Blood Type Compatibility Utilities for Safe Transfusions

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodType = typeof BLOOD_TYPES[number];

export const COMPONENT_TYPES = [
  'whole_blood',
  'packed_rbc',
  'platelets',
  'fresh_frozen_plasma',
  'cryoprecipitate'
] as const;
export type ComponentType = typeof COMPONENT_TYPES[number];

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  whole_blood: 'Whole Blood',
  packed_rbc: 'Packed RBC',
  platelets: 'Platelets',
  fresh_frozen_plasma: 'Fresh Frozen Plasma',
  cryoprecipitate: 'Cryoprecipitate'
};

// RBC Compatibility: Who can receive from whom
// Key = Recipient, Value = Compatible Donors
const RBC_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal donor
};

// Plasma Compatibility (reverse of RBC)
// Key = Recipient, Value = Compatible Donors
const PLASMA_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  'A+': ['A+', 'A-', 'AB+', 'AB-'],
  'A-': ['A-', 'AB-'],
  'B+': ['B+', 'B-', 'AB+', 'AB-'],
  'B-': ['B-', 'AB-'],
  'AB+': ['AB+', 'AB-'], // Universal plasma donor
  'AB-': ['AB-'],
  'O+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'O-': ['O-', 'A-', 'B-', 'AB-']
};

// Platelet Compatibility (same as RBC for simplicity in most cases)
const PLATELET_COMPATIBILITY = RBC_COMPATIBILITY;

/**
 * Check if donor blood is compatible with recipient for a given component
 */
export function isCompatible(
  recipientBloodType: BloodType,
  donorBloodType: BloodType,
  componentType: ComponentType
): boolean {
  let compatibilityMap: Record<BloodType, BloodType[]>;
  
  switch (componentType) {
    case 'fresh_frozen_plasma':
    case 'cryoprecipitate':
      compatibilityMap = PLASMA_COMPATIBILITY;
      break;
    case 'platelets':
      compatibilityMap = PLATELET_COMPATIBILITY;
      break;
    case 'whole_blood':
    case 'packed_rbc':
    default:
      compatibilityMap = RBC_COMPATIBILITY;
  }
  
  return compatibilityMap[recipientBloodType]?.includes(donorBloodType) ?? false;
}

/**
 * Get all compatible donor blood types for a recipient
 */
export function getCompatibleDonors(
  recipientBloodType: BloodType,
  componentType: ComponentType
): BloodType[] {
  switch (componentType) {
    case 'fresh_frozen_plasma':
    case 'cryoprecipitate':
      return PLASMA_COMPATIBILITY[recipientBloodType] || [];
    case 'platelets':
      return PLATELET_COMPATIBILITY[recipientBloodType] || [];
    case 'whole_blood':
    case 'packed_rbc':
    default:
      return RBC_COMPATIBILITY[recipientBloodType] || [];
  }
}

/**
 * Get all compatible recipients for a donor blood type
 */
export function getCompatibleRecipients(
  donorBloodType: BloodType,
  componentType: ComponentType
): BloodType[] {
  const compatibilityMap = componentType === 'fresh_frozen_plasma' || componentType === 'cryoprecipitate'
    ? PLASMA_COMPATIBILITY
    : RBC_COMPATIBILITY;
  
  return BLOOD_TYPES.filter(recipient => 
    compatibilityMap[recipient]?.includes(donorBloodType)
  );
}

/**
 * Calculate expiry date based on component type
 */
export function calculateExpiryDate(collectionDate: Date, componentType: ComponentType): Date {
  const expiryDate = new Date(collectionDate);
  
  switch (componentType) {
    case 'whole_blood':
      expiryDate.setDate(expiryDate.getDate() + 35); // 35 days
      break;
    case 'packed_rbc':
      expiryDate.setDate(expiryDate.getDate() + 42); // 42 days
      break;
    case 'platelets':
      expiryDate.setDate(expiryDate.getDate() + 5); // 5 days
      break;
    case 'fresh_frozen_plasma':
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year
      break;
    case 'cryoprecipitate':
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year
      break;
    default:
      expiryDate.setDate(expiryDate.getDate() + 35);
  }
  
  return expiryDate;
}

/**
 * Calculate next eligible donation date (56 days for whole blood)
 */
export function calculateNextEligibleDate(lastDonationDate: Date): Date {
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + 56); // 56 days minimum gap
  return nextDate;
}

/**
 * Check if donor is eligible based on last donation date
 */
export function isDonorEligible(lastDonationDate: Date | null): boolean {
  if (!lastDonationDate) return true;
  
  const nextEligible = calculateNextEligibleDate(new Date(lastDonationDate));
  return new Date() >= nextEligible;
}

/**
 * Get blood type color for UI
 */
export function getBloodTypeColor(bloodType: BloodType): string {
  const colors: Record<BloodType, string> = {
    'A+': 'bg-red-500',
    'A-': 'bg-red-600',
    'B+': 'bg-blue-500',
    'B-': 'bg-blue-600',
    'AB+': 'bg-purple-500',
    'AB-': 'bg-purple-600',
    'O+': 'bg-green-500',
    'O-': 'bg-green-600'
  };
  return colors[bloodType] || 'bg-gray-500';
}

/**
 * Get priority color for UI
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    routine: 'bg-gray-500',
    urgent: 'bg-yellow-500',
    emergency: 'bg-orange-500',
    critical: 'bg-red-500'
  };
  return colors[priority] || 'bg-gray-500';
}

/**
 * Generate unique bag number
 */
export function generateBagNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BB-${dateStr}-${random}`;
}
