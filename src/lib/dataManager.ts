import { User } from '../contexts/AuthContext';

// Data interfaces for the HMS
export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  insuranceProvider: string;
  insuranceId: string;
  bloodType?: string;
  allergies?: string;
  currentMedications?: string;
  chronicConditions?: string;
  admissionDate: string;
  status: 'active' | 'discharged' | 'deceased';
  assignedDoctor?: string;
  roomNumber?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialty: string;
  department: string;
  experience: string;
  education: string;
  schedule: string;
  consultationFee: string;
  availability: boolean;
  patients: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Nurse {
  id: string;
  nurseId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  nurseType: string;
  department: string;
  shift: string;
  experience: string;
  certification: string;
  availability: boolean;
  assignedPatients: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery' | 'checkup';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  symptoms: string;
  diagnosis?: string;
  prescription?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  patientId: string;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'bank_transfer' | 'check';
  paymentType: 'consultation' | 'surgery' | 'medication' | 'room_charges' | 'lab_tests' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  insuranceClaimed: boolean;
  insuranceAmount?: number;
  discount?: number;
  tax?: number;
  receiptNumber: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  recordId: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  visitType: 'emergency' | 'routine' | 'follow-up' | 'surgery' | 'consultation';
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  labResults?: string;
  vitalSigns?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
  };
  notes: string;
  followUpRequired: boolean;
  followUpDate?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  itemId: string;
  name: string;
  category: 'medication' | 'equipment' | 'supplies' | 'consumables';
  description: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  supplier: string;
  expiryDate?: string;
  batchNumber?: string;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  lastRestocked: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  refills: number;
  refillsUsed: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  pharmacyNotes?: string;
  sideEffects?: string;
  interactions?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabTest {
  id: string;
  testId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  testType: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'culture' | 'other';
  category: 'hematology' | 'biochemistry' | 'microbiology' | 'pathology' | 'radiology' | 'cardiology';
  orderDate: string;
  sampleCollectedDate?: string;
  reportDate?: string;
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
  results?: string;
  normalRange?: string;
  interpretation?: string;
  attachments?: string[];
  priority: 'routine' | 'urgent' | 'stat';
  fastingRequired: boolean;
  instructions: string;
  cost: number;
  labTechnician?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: string;
  type: 'general' | 'private' | 'icu' | 'emergency' | 'surgery' | 'pediatric';
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  amenities: string[];
  dailyRate: number;
  assignedPatients: string[];
  assignedNurse?: string;
  equipment: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Data Management Class
class DataManager {
  private static instance: DataManager;
  
  private constructor() {}

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Generate unique IDs
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generatePatientId(): string {
    const existing = this.getPatients();
    const nextNumber = existing.length + 1;
    return `P${nextNumber.toString().padStart(6, '0')}`;
  }

  private generateDoctorId(): string {
    const existing = this.getDoctors();
    const nextNumber = existing.length + 1;
    return `D${nextNumber.toString().padStart(6, '0')}`;
  }

  private generateNurseId(): string {
    const existing = this.getNurses();
    const nextNumber = existing.length + 1;
    return `N${nextNumber.toString().padStart(6, '0')}`;
  }

  private generateAppointmentId(): string {
    const existing = this.getAppointments();
    const nextNumber = existing.length + 1;
    return `A${nextNumber.toString().padStart(6, '0')}`;
  }

  private generatePaymentId(): string {
    const existing = this.getPayments();
    const nextNumber = existing.length + 1;
    return `PAY${nextNumber.toString().padStart(6, '0')}`;
  }

  private generateReceiptNumber(): string {
    return `R${Date.now().toString().substr(-8)}`;
  }

  // Generic CRUD operations
  public saveData<T>(key: string, data: T[]): void {
    localStorage.setItem(`hms_${key}`, JSON.stringify(data));
  }

  public loadData<T>(key: string): T[] {
    const data = localStorage.getItem(`hms_${key}`);
    return data ? JSON.parse(data) : [];
  }

  // Patient Management
  createPatient(patientData: Omit<Patient, 'id' | 'patientId' | 'admissionDate' | 'status' | 'createdAt' | 'updatedAt'>): Patient {
    const patients = this.getPatients();
    const newPatient: Patient = {
      ...patientData,
      id: this.generateId(),
      patientId: this.generatePatientId(),
      admissionDate: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    this.saveData('patients', patients);
    return newPatient;
  }

  getPatients(): Patient[] {
    return this.loadData<Patient>('patients');
  }

  getPatientById(id: string): Patient | null {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('patients', patients);
    return patients[index];
  }

  deletePatient(id: string): boolean {
    const patients = this.getPatients();
    const filteredPatients = patients.filter(p => p.id !== id);
    if (filteredPatients.length === patients.length) return false;
    this.saveData('patients', filteredPatients);
    return true;
  }

  searchPatients(query: string): Patient[] {
    const patients = this.getPatients();
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(p => 
      p.firstName.toLowerCase().includes(lowercaseQuery) ||
      p.lastName.toLowerCase().includes(lowercaseQuery) ||
      p.patientId.toLowerCase().includes(lowercaseQuery) ||
      p.email.toLowerCase().includes(lowercaseQuery) ||
      p.phone.includes(query)
    );
  }

  // Doctor Management
  createDoctor(doctorData: Omit<Doctor, 'id' | 'doctorId' | 'availability' | 'patients' | 'createdAt' | 'updatedAt'>): Doctor {
    const doctors = this.getDoctors();
    const newDoctor: Doctor = {
      ...doctorData,
      id: this.generateId(),
      doctorId: this.generateDoctorId(),
      availability: true,
      patients: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    doctors.push(newDoctor);
    this.saveData('doctors', doctors);
    return newDoctor;
  }

  getDoctors(): Doctor[] {
    return this.loadData<Doctor>('doctors');
  }

  getDoctorById(id: string): Doctor | null {
    const doctors = this.getDoctors();
    return doctors.find(d => d.id === id) || null;
  }

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const doctors = this.getDoctors();
    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) return null;

    doctors[index] = {
      ...doctors[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('doctors', doctors);
    return doctors[index];
  }

  deleteDoctor(id: string): boolean {
    const doctors = this.getDoctors();
    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) return false;

    doctors.splice(index, 1);
    this.saveData('doctors', doctors);
    return true;
  }

  // Nurse Management
  createNurse(nurseData: Omit<Nurse, 'id' | 'nurseId' | 'availability' | 'assignedPatients' | 'createdAt' | 'updatedAt'>): Nurse {
    const nurses = this.getNurses();
    const newNurse: Nurse = {
      ...nurseData,
      id: this.generateId(),
      nurseId: this.generateNurseId(),
      availability: true,
      assignedPatients: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    nurses.push(newNurse);
    this.saveData('nurses', nurses);
    return newNurse;
  }

  getNurses(): Nurse[] {
    return this.loadData<Nurse>('nurses');
  }

  updateNurse(id: string, updates: Partial<Nurse>): Nurse | null {
    const nurses = this.getNurses();
    const index = nurses.findIndex(n => n.id === id);
    if (index === -1) return null;

    nurses[index] = {
      ...nurses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('nurses', nurses);
    return nurses[index];
  }

  deleteNurse(id: string): boolean {
    const nurses = this.getNurses();
    const index = nurses.findIndex(n => n.id === id);
    if (index === -1) return false;

    nurses.splice(index, 1);
    this.saveData('nurses', nurses);
    return true;
  }

  // Appointment Management
  createAppointment(appointmentData: Omit<Appointment, 'id' | 'appointmentId' | 'status' | 'createdAt' | 'updatedAt'>): Appointment {
    const appointments = this.getAppointments();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      appointmentId: this.generateAppointmentId(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    this.saveData('appointments', appointments);
    return newAppointment;
  }

  getAppointments(): Appointment[] {
    return this.loadData<Appointment>('appointments');
  }

  getAppointmentsByPatient(patientId: string): Appointment[] {
    return this.getAppointments().filter(a => a.patientId === patientId);
  }

  getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getAppointments().filter(a => a.doctorId === doctorId);
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return null;

    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('appointments', appointments);
    return appointments[index];
  }

  deleteAppointment(id: string): boolean {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return false;

    appointments.splice(index, 1);
    this.saveData('appointments', appointments);
    return true;
  }

  // Payment Management
  createPayment(paymentData: Omit<Payment, 'id' | 'paymentId' | 'receiptNumber' | 'createdAt' | 'updatedAt'>): Payment {
    const payments = this.getPayments();
    const newPayment: Payment = {
      ...paymentData,
      id: this.generateId(),
      paymentId: this.generatePaymentId(),
      receiptNumber: this.generateReceiptNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    payments.push(newPayment);
    this.saveData('payments', payments);
    return newPayment;
  }

  getPayments(): Payment[] {
    return this.loadData<Payment>('payments');
  }

  getPaymentsByPatient(patientId: string): Payment[] {
    return this.getPayments().filter(p => p.patientId === patientId);
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return null;

    payments[index] = {
      ...payments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('payments', payments);
    return payments[index];
  }

  deletePayment(id: string): boolean {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return false;

    payments.splice(index, 1);
    this.saveData('payments', payments);
    return true;
  }

  // Medical Records Management
  createMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt'>): MedicalRecord {
    const records = this.getMedicalRecords();
    const newRecord: MedicalRecord = {
      ...recordData,
      id: this.generateId(),
      recordId: `MR${Date.now().toString().substr(-8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    this.saveData('medical_records', records);
    return newRecord;
  }

  getMedicalRecords(): MedicalRecord[] {
    return this.loadData<MedicalRecord>('medical_records');
  }

  getMedicalRecordsByPatient(patientId: string): MedicalRecord[] {
    return this.getMedicalRecords().filter(r => r.patientId === patientId);
  }

  updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): MedicalRecord | null {
    const records = this.getMedicalRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('medical_records', records);
    return records[index];
  }

  deleteMedicalRecord(id: string): boolean {
    const records = this.getMedicalRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;

    records.splice(index, 1);
    this.saveData('medical_records', records);
    return true;
  }

  // Prescription Management
  createPrescription(prescriptionData: Omit<Prescription, 'id' | 'prescriptionId' | 'refillsUsed' | 'status' | 'createdAt' | 'updatedAt'>): Prescription {
    const prescriptions = this.getPrescriptions();
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: this.generateId(),
      prescriptionId: `RX${Date.now().toString().substr(-8)}`,
      refillsUsed: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    prescriptions.push(newPrescription);
    this.saveData('prescriptions', prescriptions);
    return newPrescription;
  }

  getPrescriptions(): Prescription[] {
    return this.loadData<Prescription>('prescriptions');
  }

  getPrescriptionsByPatient(patientId: string): Prescription[] {
    return this.getPrescriptions().filter(p => p.patientId === patientId);
  }

  updatePrescription(id: string, updates: Partial<Prescription>): Prescription | null {
    const prescriptions = this.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return null;

    prescriptions[index] = {
      ...prescriptions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('prescriptions', prescriptions);
    return prescriptions[index];
  }

  deletePrescription(id: string): boolean {
    const prescriptions = this.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return false;

    prescriptions.splice(index, 1);
    this.saveData('prescriptions', prescriptions);
    return true;
  }

  // Lab Test Management
  createLabTest(labTestData: Omit<LabTest, 'id' | 'testId' | 'status' | 'createdAt' | 'updatedAt'>): LabTest {
    const labTests = this.getLabTests();
    const newLabTest: LabTest = {
      ...labTestData,
      id: this.generateId(),
      testId: `LT${Date.now().toString().substr(-8)}`,
      status: 'ordered',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    labTests.push(newLabTest);
    this.saveData('lab_tests', labTests);
    return newLabTest;
  }

  getLabTests(): LabTest[] {
    return this.loadData<LabTest>('lab_tests');
  }

  getLabTestsByPatient(patientId: string): LabTest[] {
    return this.getLabTests().filter(l => l.patientId === patientId);
  }

  updateLabTest(id: string, updates: Partial<LabTest>): LabTest | null {
    const labTests = this.getLabTests();
    const index = labTests.findIndex(l => l.id === id);
    if (index === -1) return null;

    labTests[index] = {
      ...labTests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData('lab_tests', labTests);
    return labTests[index];
  }

  deleteLabTest(id: string): boolean {
    const labTests = this.getLabTests();
    const index = labTests.findIndex(l => l.id === id);
    if (index === -1) return false;

    labTests.splice(index, 1);
    this.saveData('lab_tests', labTests);
    return true;
  }

  // Analytics and Reports
  getDashboardStats() {
    const patients = this.getPatients();
    const doctors = this.getDoctors();
    const nurses = this.getNurses();
    const appointments = this.getAppointments();
    const payments = this.getPayments();
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    const todayPayments = payments.filter(p => p.createdAt.startsWith(today));
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPatients: patients.length,
      activePatients: patients.filter(p => p.status === 'active').length,
      totalDoctors: doctors.length,
      availableDoctors: doctors.filter(d => d.availability).length,
      totalNurses: nurses.length,
      availableNurses: nurses.filter(n => n.availability).length,
      todayAppointments: todayAppointments.length,
      scheduledAppointments: todayAppointments.filter(a => a.status === 'scheduled').length,
      completedAppointments: todayAppointments.filter(a => a.status === 'completed').length,
      todayRevenue,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: payments.filter(p => p.status === 'pending').length,
    };
  }

  // Initialize with sample data
  initializeSampleData() {
    // Only initialize if no data exists
    if (this.getPatients().length === 0) {
      // Sample patients
      const samplePatients = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0101',
          dateOfBirth: '1985-03-15',
          gender: 'male' as const,
          address: '123 Main St, City, State 12345',
          emergencyContact: 'Jane Doe: +1-555-0102',
          medicalHistory: 'Hypertension, Diabetes Type 2',
          insuranceProvider: 'Blue Cross',
          insuranceId: 'BC123456789',
          bloodType: 'O+',
          allergies: 'Penicillin',
          createdBy: 'system',
        },
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@email.com',
          phone: '+1-555-0103',
          dateOfBirth: '1992-08-22',
          gender: 'female' as const,
          address: '456 Oak Ave, City, State 12345',
          emergencyContact: 'Mike Johnson: +1-555-0104',
          medicalHistory: 'Asthma',
          insuranceProvider: 'Aetna',
          insuranceId: 'AET987654321',
          bloodType: 'A-',
          allergies: 'None',
          createdBy: 'system',
        }
      ];

      samplePatients.forEach(patient => this.createPatient(patient));
    }

    if (this.getDoctors().length === 0) {
      // Sample doctors
      const sampleDoctors = [
        {
          firstName: 'Dr. Michael',
          lastName: 'Smith',
          email: 'dr.smith@hospital.com',
          phone: '+1-555-0201',
          licenseNumber: 'MD12345',
          specialty: 'cardiology',
          department: 'Cardiology',
          experience: '15',
          education: 'MD from Harvard Medical School, Cardiology Fellowship at Mayo Clinic',
          schedule: 'Mon-Fri 8AM-5PM',
          consultationFee: '$300',
          createdBy: 'system',
        },
        {
          firstName: 'Dr. Emily',
          lastName: 'Davis',
          email: 'dr.davis@hospital.com',
          phone: '+1-555-0202',
          licenseNumber: 'MD67890',
          specialty: 'pediatrics',
          department: 'Pediatrics',
          experience: '10',
          education: 'MD from Johns Hopkins, Pediatrics Residency at Children\'s Hospital',
          schedule: 'Mon-Fri 9AM-6PM',
          consultationFee: '$250',
          createdBy: 'system',
        }
      ];

      sampleDoctors.forEach(doctor => this.createDoctor(doctor));
    }

    if (this.getNurses().length === 0) {
      // Sample nurses
      const sampleNurses = [
        {
          firstName: 'Nancy',
          lastName: 'Wilson',
          email: 'nancy.wilson@hospital.com',
          phone: '+1-555-0301',
          licenseNumber: 'RN12345',
          nurseType: 'registered',
          department: 'emergency',
          shift: 'day',
          experience: '8',
          certification: 'BSN, CCRN',
          createdBy: 'system',
        },
        {
          firstName: 'Robert',
          lastName: 'Brown',
          email: 'robert.brown@hospital.com',
          phone: '+1-555-0302',
          licenseNumber: 'RN67890',
          nurseType: 'critical-care',
          department: 'icu',
          shift: 'night',
          experience: '12',
          certification: 'MSN, CCRN',
          createdBy: 'system',
        }
      ];

      sampleNurses.forEach(nurse => this.createNurse(nurse));
    }

    if (this.getAppointments().length === 0) {
      // Sample appointments
      const patients = this.getPatients();
      const doctors = this.getDoctors();
      
      if (patients.length > 0 && doctors.length > 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sampleAppointments = [
          {
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            date: today.toISOString().split('T')[0],
            time: '10:00',
            duration: 30,
            type: 'consultation' as const,
            notes: 'Regular checkup for hypertension',
            symptoms: 'High blood pressure, fatigue',
            followUpRequired: true,
            createdBy: 'system',
          },
          {
            patientId: patients[1]?.id || patients[0].id,
            doctorId: doctors[1]?.id || doctors[0].id,
            date: tomorrow.toISOString().split('T')[0],
            time: '14:00',
            duration: 45,
            type: 'follow-up' as const,
            notes: 'Follow-up for asthma treatment',
            symptoms: 'Shortness of breath, wheezing',
            followUpRequired: false,
            createdBy: 'system',
          }
        ];

        sampleAppointments.forEach(appointment => this.createAppointment(appointment));
      }
    }

    if (this.getPayments().length === 0) {
      // Sample payments
      const patients = this.getPatients();
      
      if (patients.length > 0) {
        const samplePayments = [
          {
            patientId: patients[0].id,
            amount: 300,
            currency: 'USD',
            paymentMethod: 'card' as const,
            paymentType: 'consultation' as const,
            description: 'Cardiology consultation with Dr. Smith',
            status: 'completed' as const,
            insuranceClaimed: false,
            createdBy: 'system',
          },
          {
            patientId: patients[1]?.id || patients[0].id,
            amount: 150,
            currency: 'USD',
            paymentMethod: 'insurance' as const,
            paymentType: 'medication' as const,
            description: 'Asthma medication prescription',
            status: 'pending' as const,
            insuranceClaimed: true,
            insuranceAmount: 120,
            createdBy: 'system',
          }
        ];

        samplePayments.forEach(payment => this.createPayment(payment));
      }
    }

    if (this.getMedicalRecords().length === 0) {
      // Sample medical records
      const patients = this.getPatients();
      const doctors = this.getDoctors();
      
      if (patients.length > 0 && doctors.length > 0) {
        const sampleRecords = [
          {
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            visitDate: new Date().toISOString().split('T')[0],
            visitType: 'consultation' as const,
            notes: 'Patient presents with elevated blood pressure. Prescribed medication and lifestyle changes.',
            symptoms: 'Headache, dizziness, fatigue',
            diagnosis: 'Essential hypertension',
            treatment: 'Lisinopril 10mg daily, dietary changes, exercise program',
            prescription: 'Lisinopril 10mg - Take one tablet daily with food',
            followUpRequired: true,
            followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vitalSigns: {
              bloodPressure: '150/95',
              heartRate: '85',
              temperature: '98.6',
              weight: '175',
              height: '5ft 10in',
            },
            labResults: 'Complete Blood Count - Normal, Lipid Panel - Elevated cholesterol',
            createdBy: 'system',
          },
          {
            patientId: patients[1]?.id || patients[0].id,
            doctorId: doctors[1]?.id || doctors[0].id,
            visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            visitType: 'follow-up' as const,
            notes: 'Asthma follow-up visit. Patient responding well to treatment.',
            symptoms: 'Mild wheezing, improved breathing',
            diagnosis: 'Asthma - well controlled',
            treatment: 'Continue current inhaler regimen, pulmonary function test',
            prescription: 'Albuterol inhaler - 2 puffs as needed for shortness of breath',
            followUpRequired: false,
            vitalSigns: {
              bloodPressure: '120/80',
              heartRate: '72',
              temperature: '98.4',
              weight: '140',
              height: '5ft 6in',
            },
            labResults: 'Peak flow measurement - 380 L/min (improved from 320)',
            createdBy: 'system',
          }
        ];

        sampleRecords.forEach(record => this.createMedicalRecord(record));
      }
    }

    if (this.getPrescriptions().length === 0) {
      // Sample prescriptions
      const patients = this.getPatients();
      const doctors = this.getDoctors();
      
      if (patients.length > 0 && doctors.length > 0) {
        const samplePrescriptions = [
          {
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            medication: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food. Monitor blood pressure regularly.',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            refills: 2,
            sideEffects: 'May cause dizziness, dry cough',
            interactions: ['NSAIDs', 'Potassium supplements'],
            createdBy: 'system',
          },
          {
            patientId: patients[1]?.id || patients[0].id,
            doctorId: doctors[1]?.id || doctors[0].id,
            medication: 'Albuterol Inhaler',
            dosage: '90mcg/puff',
            frequency: 'As needed',
            duration: '90 days',
            instructions: 'Use for shortness of breath. Rinse mouth after use.',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            refills: 3,
            sideEffects: 'Tremor, nervousness, headache',
            interactions: ['Beta-blockers'],
            createdBy: 'system',
          }
        ];

        samplePrescriptions.forEach(prescription => this.createPrescription(prescription));
      }
    }

    if (this.getLabTests().length === 0) {
      // Sample lab tests
      const patients = this.getPatients();
      const doctors = this.getDoctors();
      
      if (patients.length > 0 && doctors.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const sampleLabTests = [
          {
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            testName: 'Complete Blood Count',
            testType: 'blood' as const,
            category: 'hematology' as const,
            orderDate: yesterday,
            sampleCollectedDate: yesterday,
            reportDate: today,
            results: 'WBC: 7.2 K/uL, RBC: 4.5 M/uL, Hemoglobin: 14.2 g/dL, Hematocrit: 42.1%',
            normalRange: 'WBC: 4.5-11.0, RBC: 4.2-5.4, Hemoglobin: 12.0-15.5, Hematocrit: 36-45%',
            interpretation: 'Normal',
            priority: 'routine' as const,
            fastingRequired: false,
            instructions: 'No special preparation required',
            cost: 85.00,
            labTechnician: 'Sarah Martinez, MLT',
            createdBy: 'system',
          },
          {
            patientId: patients[1]?.id || patients[0].id,
            doctorId: doctors[1]?.id || doctors[0].id,
            testName: 'Chest X-Ray',
            testType: 'imaging' as const,
            category: 'radiology' as const,
            orderDate: today,
            priority: 'urgent' as const,
            fastingRequired: false,
            instructions: 'Remove all metal objects from chest area',
            cost: 150.00,
            createdBy: 'system',
          }
        ];

        sampleLabTests.forEach(test => this.createLabTest(test));
      }
    }
  }
}

export const dataManager = DataManager.getInstance();