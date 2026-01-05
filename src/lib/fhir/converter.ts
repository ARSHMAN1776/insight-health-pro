/**
 * FHIR R4 Data Converter
 * Converts internal data models to FHIR R4 format
 */

import { format } from 'date-fns';
import type {
  FHIRPatient,
  FHIRObservation,
  FHIRCondition,
  FHIRMedicationRequest,
  FHIRDiagnosticReport,
  FHIRBundle,
  FHIRComposition,
  FHIRReference,
  FHIRCodeableConcept,
} from './types';

const SYSTEM_URI = 'urn:hospital-management-system';
const LOINC_SYSTEM = 'http://loinc.org';
const SNOMED_SYSTEM = 'http://snomed.info/sct';
const HL7_SYSTEM = 'http://terminology.hl7.org';

/**
 * Generate a unique FHIR resource ID
 */
function generateFhirId(): string {
  return `urn:uuid:${crypto.randomUUID()}`;
}

/**
 * Convert patient data to FHIR Patient resource
 */
export function patientToFHIR(patient: any): FHIRPatient {
  const genderMap: Record<string, 'male' | 'female' | 'other' | 'unknown'> = {
    Male: 'male',
    Female: 'female',
    Other: 'other',
    male: 'male',
    female: 'female',
    other: 'other',
  };

  return {
    resourceType: 'Patient',
    id: patient.id,
    meta: {
      lastUpdated: patient.updated_at || new Date().toISOString(),
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
    },
    identifier: [
      {
        use: 'usual',
        system: SYSTEM_URI,
        value: patient.id,
      },
      ...(patient.insurance_policy_number ? [{
        use: 'secondary' as const,
        type: {
          coding: [{
            system: `${HL7_SYSTEM}/CodeSystem/v2-0203`,
            code: 'MB',
            display: 'Member Number',
          }],
        },
        value: patient.insurance_policy_number,
      }] : []),
    ],
    active: patient.status === 'active' || patient.status === 'verified',
    name: [{
      use: 'official',
      family: patient.last_name,
      given: [patient.first_name],
    }],
    telecom: [
      ...(patient.phone ? [{
        system: 'phone' as const,
        value: patient.phone,
        use: 'mobile' as const,
      }] : []),
      ...(patient.email ? [{
        system: 'email' as const,
        value: patient.email,
        use: 'home' as const,
      }] : []),
    ],
    gender: genderMap[patient.gender] || 'unknown',
    birthDate: patient.date_of_birth,
    address: patient.address ? [{
      use: 'home',
      text: patient.address,
    }] : undefined,
    contact: patient.emergency_contact_name ? [{
      relationship: [{
        coding: [{
          system: `${HL7_SYSTEM}/CodeSystem/v2-0131`,
          code: 'C',
          display: 'Emergency Contact',
        }],
      }],
      name: {
        text: patient.emergency_contact_name,
      },
      telecom: patient.emergency_contact_phone ? [{
        system: 'phone',
        value: patient.emergency_contact_phone,
      }] : undefined,
    }] : undefined,
  };
}

/**
 * Convert vital signs to FHIR Observation resources
 */
export function vitalsToFHIR(vitals: any, patientRef: FHIRReference): FHIRObservation[] {
  const observations: FHIRObservation[] = [];
  const baseObservation = {
    status: 'final' as const,
    subject: patientRef,
    effectiveDateTime: vitals.recorded_at,
    issued: vitals.created_at,
  };

  // Blood Pressure
  if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
    observations.push({
      ...baseObservation,
      resourceType: 'Observation',
      id: `${vitals.id}-bp`,
      category: [{
        coding: [{
          system: `${HL7_SYSTEM}/CodeSystem/observation-category`,
          code: 'vital-signs',
          display: 'Vital Signs',
        }],
      }],
      code: {
        coding: [{
          system: LOINC_SYSTEM,
          code: '85354-9',
          display: 'Blood pressure panel',
        }],
      },
      component: [
        {
          code: {
            coding: [{
              system: LOINC_SYSTEM,
              code: '8480-6',
              display: 'Systolic blood pressure',
            }],
          },
          valueQuantity: {
            value: vitals.blood_pressure_systolic,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]',
          },
        },
        {
          code: {
            coding: [{
              system: LOINC_SYSTEM,
              code: '8462-4',
              display: 'Diastolic blood pressure',
            }],
          },
          valueQuantity: {
            value: vitals.blood_pressure_diastolic,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]',
          },
        },
      ],
    } as FHIRObservation & { component: any[] });
  }

  // Heart Rate
  if (vitals.heart_rate) {
    observations.push({
      ...baseObservation,
      resourceType: 'Observation',
      id: `${vitals.id}-hr`,
      category: [{
        coding: [{
          system: `${HL7_SYSTEM}/CodeSystem/observation-category`,
          code: 'vital-signs',
        }],
      }],
      code: {
        coding: [{
          system: LOINC_SYSTEM,
          code: '8867-4',
          display: 'Heart rate',
        }],
      },
      valueQuantity: {
        value: vitals.heart_rate,
        unit: '/min',
        system: 'http://unitsofmeasure.org',
        code: '/min',
      },
    });
  }

  // Temperature
  if (vitals.temperature) {
    observations.push({
      ...baseObservation,
      resourceType: 'Observation',
      id: `${vitals.id}-temp`,
      category: [{
        coding: [{
          system: `${HL7_SYSTEM}/CodeSystem/observation-category`,
          code: 'vital-signs',
        }],
      }],
      code: {
        coding: [{
          system: LOINC_SYSTEM,
          code: '8310-5',
          display: 'Body temperature',
        }],
      },
      valueQuantity: {
        value: vitals.temperature,
        unit: '°F',
        system: 'http://unitsofmeasure.org',
        code: '[degF]',
      },
    });
  }

  // SpO2
  if (vitals.spo2) {
    observations.push({
      ...baseObservation,
      resourceType: 'Observation',
      id: `${vitals.id}-spo2`,
      category: [{
        coding: [{
          system: `${HL7_SYSTEM}/CodeSystem/observation-category`,
          code: 'vital-signs',
        }],
      }],
      code: {
        coding: [{
          system: LOINC_SYSTEM,
          code: '59408-5',
          display: 'Oxygen saturation',
        }],
      },
      valueQuantity: {
        value: vitals.spo2,
        unit: '%',
        system: 'http://unitsofmeasure.org',
        code: '%',
      },
    });
  }

  return observations;
}

/**
 * Convert medical record to FHIR Condition resource
 */
export function conditionToFHIR(record: any, patientRef: FHIRReference): FHIRCondition | null {
  if (!record.diagnosis) return null;

  return {
    resourceType: 'Condition',
    id: record.id,
    meta: {
      lastUpdated: record.updated_at || new Date().toISOString(),
    },
    clinicalStatus: {
      coding: [{
        system: `${HL7_SYSTEM}/CodeSystem/condition-clinical`,
        code: 'active',
        display: 'Active',
      }],
    },
    verificationStatus: {
      coding: [{
        system: `${HL7_SYSTEM}/CodeSystem/condition-ver-status`,
        code: 'confirmed',
        display: 'Confirmed',
      }],
    },
    code: {
      coding: record.diagnosis_code ? [{
        system: 'http://hl7.org/fhir/sid/icd-10-cm',
        code: record.diagnosis_code,
      }] : undefined,
      text: record.diagnosis,
    },
    subject: patientRef,
    recordedDate: record.visit_date,
    note: record.notes ? [{ text: record.notes }] : undefined,
  };
}

/**
 * Convert prescription to FHIR MedicationRequest resource
 */
export function prescriptionToFHIR(prescription: any, patientRef: FHIRReference): FHIRMedicationRequest {
  return {
    resourceType: 'MedicationRequest',
    id: prescription.id,
    meta: {
      lastUpdated: prescription.updated_at || new Date().toISOString(),
    },
    status: prescription.status === 'active' ? 'active' : 'completed',
    intent: 'order',
    medicationCodeableConcept: {
      text: prescription.medication_name,
    },
    subject: patientRef,
    authoredOn: prescription.date_prescribed,
    dosageInstruction: [{
      text: `${prescription.dosage || ''} ${prescription.frequency || ''} for ${prescription.duration || ''}`.trim(),
      timing: prescription.frequency ? {
        repeat: {
          frequency: 1,
          period: 1,
          periodUnit: 'd',
        },
      } : undefined,
    }],
  };
}

/**
 * Convert lab test to FHIR DiagnosticReport resource
 */
export function labTestToFHIR(labTest: any, patientRef: FHIRReference): FHIRDiagnosticReport {
  const statusMap: Record<string, FHIRDiagnosticReport['status']> = {
    ordered: 'registered',
    'sample-collected': 'partial',
    processing: 'preliminary',
    completed: 'final',
    cancelled: 'cancelled',
  };

  return {
    resourceType: 'DiagnosticReport',
    id: labTest.id,
    meta: {
      lastUpdated: labTest.updated_at || new Date().toISOString(),
    },
    identifier: [{
      system: SYSTEM_URI,
      value: labTest.id,
    }],
    status: statusMap[labTest.status] || 'unknown',
    category: [{
      coding: [{
        system: `${HL7_SYSTEM}/CodeSystem/v2-0074`,
        code: 'LAB',
        display: 'Laboratory',
      }],
    }],
    code: {
      text: labTest.test_name,
    },
    subject: patientRef,
    effectiveDateTime: labTest.test_date,
    issued: labTest.created_at,
    conclusion: labTest.results,
  };
}

/**
 * Generate a CCD (Continuity of Care Document) as FHIR Bundle
 */
export function generateCCD(
  patient: any,
  medicalRecords: any[],
  prescriptions: any[],
  labTests: any[],
  vitals: any[]
): FHIRBundle {
  const patientFhir = patientToFHIR(patient);
  const patientRef: FHIRReference = {
    reference: `Patient/${patient.id}`,
    display: `${patient.first_name} ${patient.last_name}`,
  };

  const entries: { fullUrl: string; resource: any }[] = [];

  // Add patient
  entries.push({
    fullUrl: `urn:uuid:${patient.id}`,
    resource: patientFhir,
  });

  // Add conditions from medical records
  medicalRecords.forEach(record => {
    const condition = conditionToFHIR(record, patientRef);
    if (condition) {
      entries.push({
        fullUrl: `urn:uuid:${record.id}`,
        resource: condition,
      });
    }
  });

  // Add medications
  prescriptions.forEach(prescription => {
    entries.push({
      fullUrl: `urn:uuid:${prescription.id}`,
      resource: prescriptionToFHIR(prescription, patientRef),
    });
  });

  // Add lab results
  labTests.forEach(labTest => {
    entries.push({
      fullUrl: `urn:uuid:${labTest.id}`,
      resource: labTestToFHIR(labTest, patientRef),
    });
  });

  // Add vitals
  vitals.forEach(vital => {
    const vitalObservations = vitalsToFHIR(vital, patientRef);
    vitalObservations.forEach(obs => {
      entries.push({
        fullUrl: `urn:uuid:${obs.id}`,
        resource: obs,
      });
    });
  });

  // Create composition
  const composition: FHIRComposition = {
    resourceType: 'Composition',
    id: generateFhirId(),
    status: 'final',
    type: {
      coding: [{
        system: LOINC_SYSTEM,
        code: '34133-9',
        display: 'Summarization of Episode Note',
      }],
    },
    subject: patientRef,
    date: new Date().toISOString(),
    author: [{
      display: 'Hospital Management System',
    }],
    title: 'Continuity of Care Document',
    section: [
      {
        title: 'Problems',
        code: {
          coding: [{
            system: LOINC_SYSTEM,
            code: '11450-4',
            display: 'Problem list',
          }],
        },
        entry: medicalRecords.map(r => ({ reference: `Condition/${r.id}` })),
      },
      {
        title: 'Medications',
        code: {
          coding: [{
            system: LOINC_SYSTEM,
            code: '10160-0',
            display: 'History of Medication use',
          }],
        },
        entry: prescriptions.map(p => ({ reference: `MedicationRequest/${p.id}` })),
      },
      {
        title: 'Results',
        code: {
          coding: [{
            system: LOINC_SYSTEM,
            code: '30954-2',
            display: 'Results',
          }],
        },
        entry: labTests.map(l => ({ reference: `DiagnosticReport/${l.id}` })),
      },
    ],
  };

  entries.unshift({
    fullUrl: `urn:uuid:${composition.id}`,
    resource: composition,
  });

  return {
    resourceType: 'Bundle',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: entries,
  };
}

/**
 * Export patient data as FHIR JSON
 */
export function exportPatientFHIR(
  patient: any,
  options: { 
    includeMedicalRecords?: boolean;
    includePrescriptions?: boolean;
    includeLabTests?: boolean;
    includeVitals?: boolean;
  } = {}
): string {
  const bundle: FHIRBundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: [{
      fullUrl: `urn:uuid:${patient.id}`,
      resource: patientToFHIR(patient),
    }],
  };

  return JSON.stringify(bundle, null, 2);
}
