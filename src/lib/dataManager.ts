import { supabase } from '@/integrations/supabase/client';
import { User } from '../contexts/AuthContext';

// Data interfaces aligned with Supabase schema
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string;
  medical_history?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  status: 'active' | 'inactive' | 'discharged' | 'pending_verification';
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientRegistration {
  id: string;
  patient_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  phone?: string;
  email?: string;
  license_number: string;
  department?: string;
  department_id?: string;
  years_of_experience?: number;
  consultation_fee?: number;
  availability_schedule?: any;
  status: 'active' | 'inactive' | 'on_leave';
  created_at: string;
  updated_at: string;
}

export interface Nurse {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  license_number: string;
  department?: string;
  shift_schedule?: string;
  years_of_experience?: number;
  specialization?: string;
  status: 'active' | 'inactive' | 'on_leave';
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  symptoms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  medications?: string;
  follow_up_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
  side_effects?: string;
  drug_interactions?: string;
  date_prescribed: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface LabTest {
  id: string;
  patient_id: string;
  doctor_id: string;
  test_name: string;
  test_type?: string;
  test_date: string;
  results?: string;
  normal_range?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  cost?: number;
  lab_technician?: string;
  notes?: string;
  report_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  item_name: string;
  category?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_price?: number;
  supplier?: string;
  expiry_date?: string;
  batch_number?: string;
  location?: string;
  status: 'available' | 'out_of_stock' | 'expired' | 'discontinued';
  last_restocked?: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  current_occupancy: number;
  floor?: number;
  department?: string;
  amenities?: string[];
  daily_rate?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  patient_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_date: string;
  description?: string;
  invoice_number?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

// Data Management Class using Supabase
class DataManager {
  private static instance: DataManager;
  
  private constructor() {}

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Patient Management
  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();

    if (error) throw error;
    return data as Patient;
  }

  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Patient[];
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Patient;
  }

  async deletePatient(id: string): Promise<boolean> {
    // Soft delete - set deleted_at instead of actual deletion
    const { error } = await supabase
      .from('patients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .is('deleted_at', null)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);

    if (error) throw error;
    return (data || []) as Patient[];
  }

  async getPatientByEmail(email: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) return null;
    return data as Patient;
  }

  async getPatientByUserId(userId: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return null;
    return data as Patient;
  }

  // Patient Registration Queue Management
  async getPendingRegistrations(): Promise<PatientRegistration[]> {
    const { data, error } = await supabase
      .from('patient_registration_queue')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PatientRegistration[];
  }

  async approvePatientRegistration(registrationId: string, userId: string): Promise<boolean> {
    // Update registration queue
    const { error: queueError } = await supabase
      .from('patient_registration_queue')
      .update({
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', registrationId);

    if (queueError) throw queueError;

    // Get the patient_id from the registration
    const { data: registration } = await supabase
      .from('patient_registration_queue')
      .select('patient_id')
      .eq('id', registrationId)
      .single();

    if (registration) {
      // Update patient status to active
      await supabase
        .from('patients')
        .update({ status: 'active' })
        .eq('id', registration.patient_id);
    }

    return true;
  }

  async rejectPatientRegistration(registrationId: string, userId: string, reason: string): Promise<boolean> {
    const { error } = await supabase
      .from('patient_registration_queue')
      .update({
        status: 'rejected',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', registrationId);

    if (error) throw error;
    return true;
  }

  // Doctor Management
  async createDoctor(doctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    const { data, error } = await supabase
      .from('doctors')
      .insert([doctorData])
      .select()
      .single();

    if (error) throw error;
    return data as Doctor;
  }

  async getDoctors(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Doctor[];
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Doctor;
  }

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Doctor;
  }

  async deleteDoctor(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Nurse Management
  async createNurse(nurseData: Omit<Nurse, 'id' | 'created_at' | 'updated_at'>): Promise<Nurse> {
    const { data, error } = await supabase
      .from('nurses')
      .insert([nurseData])
      .select()
      .single();

    if (error) throw error;
    return data as Nurse;
  }

  async getNurses(): Promise<Nurse[]> {
    const { data, error } = await supabase
      .from('nurses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Nurse[];
  }

  async updateNurse(id: string, updates: Partial<Nurse>): Promise<Nurse | null> {
    const { data, error } = await supabase
      .from('nurses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Nurse;
  }

  async deleteNurse(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('nurses')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Appointment Management
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  }

  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .is('deleted_at', null)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return (data || []) as Appointment[];
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return (data || []) as Appointment[];
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .is('deleted_at', null)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return (data || []) as Appointment[];
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Appointment;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Medical Records Management
  async createMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .insert([recordData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMedicalRecords(): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .is('deleted_at', null)
      .order('visit_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data;
  }

  async deleteMedicalRecord(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Prescription Management
  async createPrescription(prescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescriptionData])
      .select()
      .single();

    if (error) throw error;
    return data as Prescription;
  }

  async getPrescriptions(): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .is('deleted_at', null)
      .order('date_prescribed', { ascending: false });

    if (error) throw error;
    return (data || []) as Prescription[];
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('date_prescribed', { ascending: false });

    if (error) throw error;
    return (data || []) as Prescription[];
  }

  async updatePrescription(id: string, updates: Partial<Prescription>): Promise<Prescription | null> {
    const { data, error } = await supabase
      .from('prescriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Prescription;
  }

  async deletePrescription(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Lab Test Management
  async createLabTest(labTestData: Omit<LabTest, 'id' | 'created_at' | 'updated_at'>): Promise<LabTest> {
    const { data, error } = await supabase
      .from('lab_tests')
      .insert([labTestData])
      .select()
      .single();

    if (error) throw error;
    return data as LabTest;
  }

  async getLabTests(): Promise<LabTest[]> {
    const { data, error } = await supabase
      .from('lab_tests')
      .select('*')
      .is('deleted_at', null)
      .order('test_date', { ascending: false });

    if (error) throw error;
    return (data || []) as LabTest[];
  }

  async getLabTestsByPatient(patientId: string): Promise<LabTest[]> {
    const { data, error } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('test_date', { ascending: false });

    if (error) throw error;
    return (data || []) as LabTest[];
  }

  async updateLabTest(id: string, updates: Partial<LabTest>): Promise<LabTest | null> {
    const { data, error } = await supabase
      .from('lab_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as LabTest;
  }

  async deleteLabTest(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('lab_tests')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Inventory Management
  async createInventory(inventoryData: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .insert([inventoryData])
      .select()
      .single();

    if (error) throw error;
    return data as Inventory;
  }

  async getInventory(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('item_name', { ascending: true });

    if (error) throw error;
    return (data || []) as Inventory[];
  }

  async updateInventory(id: string, updates: Partial<Inventory>): Promise<Inventory | null> {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Inventory;
  }

  async deleteInventory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Room Management
  async createRoom(roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  }

  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true });

    if (error) throw error;
    return (data || []) as Room[];
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Room;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Payment Management
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  }

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .is('deleted_at', null)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return (data || []) as Payment[];
  }

  async getPaymentsByPatient(patientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return (data || []) as Payment[];
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as Payment;
  }

  async deletePayment(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Analytics and Dashboard Stats
  async getDashboardStats() {
    try {
      const [patients, doctors, nurses, appointments, payments] = await Promise.all([
        this.getPatients(),
        this.getDoctors(),
        this.getNurses(),
        this.getAppointments(),
        this.getPayments()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(a => a.appointment_date === today);
      const todayPayments = payments.filter(p => p.payment_date === today);
      const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        totalPatients: patients.length,
        activePatients: patients.filter(p => p.status === 'active').length,
        totalDoctors: doctors.length,
        activeDoctors: doctors.filter(d => d.status === 'active').length,
        totalNurses: nurses.length,
        activeNurses: nurses.filter(n => n.status === 'active').length,
        todayAppointments: todayAppointments.length,
        scheduledAppointments: todayAppointments.filter(a => a.status === 'scheduled').length,
        completedAppointments: todayAppointments.filter(a => a.status === 'completed').length,
        todayRevenue,
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        pendingPayments: payments.filter(p => p.payment_status === 'pending').length,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalPatients: 0,
        activePatients: 0,
        totalDoctors: 0,
        activeDoctors: 0,
        totalNurses: 0,
        activeNurses: 0,
        todayAppointments: 0,
        scheduledAppointments: 0,
        completedAppointments: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        pendingPayments: 0,
      };
    }
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();