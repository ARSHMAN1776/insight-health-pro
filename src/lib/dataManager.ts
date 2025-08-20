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
  }
}

export const dataManager = DataManager.getInstance();