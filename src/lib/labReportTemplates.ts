// Lab Report Templates for common tests

export interface TestParameter {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  flag?: string;
}

export interface LabReportTemplate {
  id: string;
  name: string;
  category: string;
  specimenType: string;
  method: string;
  parameters: {
    name: string;
    unit: string;
    normalRange: { male?: string; female?: string; general?: string };
  }[];
}

export const labReportTemplates: LabReportTemplate[] = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    specimenType: 'Whole Blood (EDTA)',
    method: 'Automated Cell Counter',
    parameters: [
      { name: 'Hemoglobin (Hb)', unit: 'g/dL', normalRange: { male: '13.5-17.5', female: '12.0-16.0' } },
      { name: 'RBC Count', unit: 'million/µL', normalRange: { male: '4.5-5.5', female: '4.0-5.0' } },
      { name: 'WBC Count', unit: '/µL', normalRange: { male: '4000-11000', female: '4000-11000' } },
      { name: 'Platelet Count', unit: '/µL', normalRange: { male: '150000-400000', female: '150000-400000' } },
      { name: 'Hematocrit (HCT)', unit: '%', normalRange: { male: '40-54', female: '36-48' } },
      { name: 'MCV', unit: 'fL', normalRange: { male: '80-100', female: '80-100' } },
      { name: 'MCH', unit: 'pg', normalRange: { male: '27-33', female: '27-33' } },
      { name: 'MCHC', unit: 'g/dL', normalRange: { male: '32-36', female: '32-36' } },
      { name: 'RDW', unit: '%', normalRange: { male: '11.5-14.5', female: '11.5-14.5' } },
      { name: 'Neutrophils', unit: '%', normalRange: { male: '40-70', female: '40-70' } },
      { name: 'Lymphocytes', unit: '%', normalRange: { male: '20-40', female: '20-40' } },
      { name: 'Monocytes', unit: '%', normalRange: { male: '2-8', female: '2-8' } },
      { name: 'Eosinophils', unit: '%', normalRange: { male: '1-4', female: '1-4' } },
      { name: 'Basophils', unit: '%', normalRange: { male: '0-1', female: '0-1' } },
    ],
  },
  {
    id: 'lipid-profile',
    name: 'Lipid Profile',
    category: 'Biochemistry',
    specimenType: 'Serum (Fasting)',
    method: 'Enzymatic/Colorimetric',
    parameters: [
      { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: { general: '<200' } },
      { name: 'Triglycerides', unit: 'mg/dL', normalRange: { general: '<150' } },
      { name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: { male: '>40', female: '>50' } },
      { name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: { general: '<100' } },
      { name: 'VLDL Cholesterol', unit: 'mg/dL', normalRange: { general: '<30' } },
      { name: 'Total/HDL Ratio', unit: '', normalRange: { general: '<5.0' } },
      { name: 'LDL/HDL Ratio', unit: '', normalRange: { general: '<3.5' } },
    ],
  },
  {
    id: 'lft',
    name: 'Liver Function Tests (LFT)',
    category: 'Biochemistry',
    specimenType: 'Serum',
    method: 'Spectrophotometric',
    parameters: [
      { name: 'Total Bilirubin', unit: 'mg/dL', normalRange: { general: '0.2-1.2' } },
      { name: 'Direct Bilirubin', unit: 'mg/dL', normalRange: { general: '0.0-0.4' } },
      { name: 'Indirect Bilirubin', unit: 'mg/dL', normalRange: { general: '0.2-0.8' } },
      { name: 'SGOT (AST)', unit: 'U/L', normalRange: { general: '5-40' } },
      { name: 'SGPT (ALT)', unit: 'U/L', normalRange: { general: '5-40' } },
      { name: 'Alkaline Phosphatase', unit: 'U/L', normalRange: { general: '44-147' } },
      { name: 'GGT', unit: 'U/L', normalRange: { male: '10-71', female: '6-42' } },
      { name: 'Total Protein', unit: 'g/dL', normalRange: { general: '6.0-8.3' } },
      { name: 'Albumin', unit: 'g/dL', normalRange: { general: '3.5-5.0' } },
      { name: 'Globulin', unit: 'g/dL', normalRange: { general: '2.0-3.5' } },
      { name: 'A/G Ratio', unit: '', normalRange: { general: '1.0-2.5' } },
    ],
  },
  {
    id: 'kft',
    name: 'Kidney Function Tests (KFT)',
    category: 'Biochemistry',
    specimenType: 'Serum',
    method: 'Spectrophotometric',
    parameters: [
      { name: 'Blood Urea', unit: 'mg/dL', normalRange: { general: '15-45' } },
      { name: 'Blood Urea Nitrogen', unit: 'mg/dL', normalRange: { general: '7-20' } },
      { name: 'Serum Creatinine', unit: 'mg/dL', normalRange: { male: '0.7-1.3', female: '0.6-1.1' } },
      { name: 'Uric Acid', unit: 'mg/dL', normalRange: { male: '3.5-7.2', female: '2.6-6.0' } },
      { name: 'eGFR', unit: 'mL/min/1.73m²', normalRange: { general: '>90' } },
      { name: 'BUN/Creatinine Ratio', unit: '', normalRange: { general: '10-20' } },
      { name: 'Sodium', unit: 'mEq/L', normalRange: { general: '136-145' } },
      { name: 'Potassium', unit: 'mEq/L', normalRange: { general: '3.5-5.0' } },
      { name: 'Chloride', unit: 'mEq/L', normalRange: { general: '98-106' } },
    ],
  },
  {
    id: 'thyroid-profile',
    name: 'Thyroid Profile',
    category: 'Endocrinology',
    specimenType: 'Serum',
    method: 'Chemiluminescence Immunoassay',
    parameters: [
      { name: 'TSH', unit: 'µIU/mL', normalRange: { general: '0.4-4.0' } },
      { name: 'T3 (Total)', unit: 'ng/dL', normalRange: { general: '80-200' } },
      { name: 'T4 (Total)', unit: 'µg/dL', normalRange: { general: '5.0-12.0' } },
      { name: 'Free T3', unit: 'pg/mL', normalRange: { general: '2.3-4.2' } },
      { name: 'Free T4', unit: 'ng/dL', normalRange: { general: '0.8-1.8' } },
    ],
  },
  {
    id: 'blood-sugar',
    name: 'Blood Sugar Profile',
    category: 'Biochemistry',
    specimenType: 'Plasma (Fluoride)',
    method: 'Hexokinase/GOD-POD',
    parameters: [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', normalRange: { general: '70-100' } },
      { name: 'Post Prandial Blood Sugar', unit: 'mg/dL', normalRange: { general: '<140' } },
      { name: 'Random Blood Sugar', unit: 'mg/dL', normalRange: { general: '<200' } },
    ],
  },
  {
    id: 'hba1c',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Biochemistry',
    specimenType: 'Whole Blood (EDTA)',
    method: 'HPLC',
    parameters: [
      { name: 'HbA1c', unit: '%', normalRange: { general: '<5.7 (Normal), 5.7-6.4 (Pre-diabetic), ≥6.5 (Diabetic)' } },
      { name: 'Estimated Average Glucose', unit: 'mg/dL', normalRange: { general: '70-126' } },
    ],
  },
  {
    id: 'urinalysis',
    name: 'Complete Urinalysis',
    category: 'Clinical Pathology',
    specimenType: 'Urine (Mid-stream)',
    method: 'Dipstick/Microscopy',
    parameters: [
      { name: 'Color', unit: '', normalRange: { general: 'Pale Yellow to Amber' } },
      { name: 'Appearance', unit: '', normalRange: { general: 'Clear' } },
      { name: 'Specific Gravity', unit: '', normalRange: { general: '1.005-1.030' } },
      { name: 'pH', unit: '', normalRange: { general: '5.0-8.0' } },
      { name: 'Protein', unit: '', normalRange: { general: 'Negative' } },
      { name: 'Glucose', unit: '', normalRange: { general: 'Negative' } },
      { name: 'Ketones', unit: '', normalRange: { general: 'Negative' } },
      { name: 'Bilirubin', unit: '', normalRange: { general: 'Negative' } },
      { name: 'Urobilinogen', unit: 'EU/dL', normalRange: { general: '0.2-1.0' } },
      { name: 'Blood', unit: '', normalRange: { general: 'Negative' } },
      { name: 'Nitrite', unit: '', normalRange: { general: 'Negative' } },
      { name: 'WBC/HPF', unit: '/HPF', normalRange: { general: '0-5' } },
      { name: 'RBC/HPF', unit: '/HPF', normalRange: { general: '0-2' } },
      { name: 'Epithelial Cells', unit: '/HPF', normalRange: { general: 'Few' } },
      { name: 'Casts', unit: '', normalRange: { general: 'None' } },
      { name: 'Crystals', unit: '', normalRange: { general: 'None' } },
      { name: 'Bacteria', unit: '', normalRange: { general: 'Absent' } },
    ],
  },
  {
    id: 'coagulation',
    name: 'Coagulation Profile',
    category: 'Hematology',
    specimenType: 'Citrated Plasma',
    method: 'Coagulometry',
    parameters: [
      { name: 'Prothrombin Time (PT)', unit: 'seconds', normalRange: { general: '11-13.5' } },
      { name: 'INR', unit: '', normalRange: { general: '0.8-1.2' } },
      { name: 'aPTT', unit: 'seconds', normalRange: { general: '25-35' } },
      { name: 'Bleeding Time', unit: 'minutes', normalRange: { general: '2-7' } },
      { name: 'Clotting Time', unit: 'minutes', normalRange: { general: '4-9' } },
    ],
  },
  {
    id: 'electrolytes',
    name: 'Serum Electrolytes',
    category: 'Biochemistry',
    specimenType: 'Serum',
    method: 'Ion-Selective Electrode',
    parameters: [
      { name: 'Sodium', unit: 'mEq/L', normalRange: { general: '136-145' } },
      { name: 'Potassium', unit: 'mEq/L', normalRange: { general: '3.5-5.0' } },
      { name: 'Chloride', unit: 'mEq/L', normalRange: { general: '98-106' } },
      { name: 'Bicarbonate', unit: 'mEq/L', normalRange: { general: '22-29' } },
      { name: 'Calcium', unit: 'mg/dL', normalRange: { general: '8.5-10.5' } },
      { name: 'Phosphorus', unit: 'mg/dL', normalRange: { general: '2.5-4.5' } },
      { name: 'Magnesium', unit: 'mg/dL', normalRange: { general: '1.7-2.2' } },
    ],
  },
];

export const getTemplateById = (id: string): LabReportTemplate | undefined => {
  return labReportTemplates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): LabReportTemplate[] => {
  return labReportTemplates.filter(t => t.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(labReportTemplates.map(t => t.category))];
};

export const determineParameterStatus = (
  value: string,
  normalRange: string
): { status: TestParameter['status']; flag?: string } => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    // For non-numeric values, assume normal unless explicitly different
    const lowerValue = value.toLowerCase().trim();
    if (['negative', 'absent', 'none', 'nil', 'clear', 'normal'].includes(lowerValue)) {
      return { status: 'normal' };
    }
    if (['positive', 'present', 'detected', 'abnormal'].includes(lowerValue)) {
      return { status: 'high', flag: 'ABN' };
    }
    return { status: 'normal' };
  }

  // Parse range
  const rangeMatch = normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const [, min, max] = rangeMatch;
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);

    if (numValue < minVal * 0.8) {
      return { status: 'critical', flag: 'L!' };
    }
    if (numValue < minVal) {
      return { status: 'low', flag: 'L' };
    }
    if (numValue > maxVal * 1.2) {
      return { status: 'critical', flag: 'H!' };
    }
    if (numValue > maxVal) {
      return { status: 'high', flag: 'H' };
    }
    return { status: 'normal' };
  }

  // Handle < or > ranges
  const lessThanMatch = normalRange.match(/<\s*([\d.]+)/);
  if (lessThanMatch) {
    const maxVal = parseFloat(lessThanMatch[1]);
    if (numValue >= maxVal * 1.2) {
      return { status: 'critical', flag: 'H!' };
    }
    if (numValue >= maxVal) {
      return { status: 'high', flag: 'H' };
    }
    return { status: 'normal' };
  }

  const greaterThanMatch = normalRange.match(/>\s*([\d.]+)/);
  if (greaterThanMatch) {
    const minVal = parseFloat(greaterThanMatch[1]);
    if (numValue <= minVal * 0.8) {
      return { status: 'critical', flag: 'L!' };
    }
    if (numValue <= minVal) {
      return { status: 'low', flag: 'L' };
    }
    return { status: 'normal' };
  }

  return { status: 'normal' };
};
