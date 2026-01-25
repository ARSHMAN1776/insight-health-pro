import { supabase } from '@/integrations/supabase/client';

// Demo data seeder for demonstration and testing purposes
// Creates realistic sample data for all major system features

export interface SeedProgress {
  step: string;
  current: number;
  total: number;
}

export type ProgressCallback = (progress: SeedProgress) => void;

// Department configurations
const DEPARTMENTS = [
  { name: 'Cardiology', description: 'Heart and cardiovascular care', head: 'Dr. Sarah Ahmed' },
  { name: 'Orthopedics', description: 'Bone, joint, and muscle care', head: 'Dr. Imran Khan' },
  { name: 'Pediatrics', description: 'Child and infant healthcare', head: 'Dr. Fatima Malik' },
  { name: 'Neurology', description: 'Brain and nervous system care', head: 'Dr. Usman Ali' },
  { name: 'General Medicine', description: 'Primary care and internal medicine', head: 'Dr. Ayesha Hassan' },
  { name: 'Dermatology', description: 'Skin, hair, and nail care', head: 'Dr. Bilal Raza' },
  { name: 'Gynecology', description: 'Women\'s reproductive health', head: 'Dr. Nadia Qureshi' },
  { name: 'ENT', description: 'Ear, nose, and throat care', head: 'Dr. Hassan Mahmood' },
];

// Doctor configurations with specializations
const DOCTORS = [
  { firstName: 'Sarah', lastName: 'Ahmed', specialization: 'Interventional Cardiology', department: 'Cardiology', fee: 2500, experience: 12 },
  { firstName: 'Imran', lastName: 'Khan', specialization: 'Sports Medicine', department: 'Orthopedics', fee: 2000, experience: 15 },
  { firstName: 'Fatima', lastName: 'Malik', specialization: 'Neonatology', department: 'Pediatrics', fee: 1800, experience: 10 },
  { firstName: 'Usman', lastName: 'Ali', specialization: 'Epilepsy & Stroke', department: 'Neurology', fee: 3000, experience: 18 },
  { firstName: 'Ayesha', lastName: 'Hassan', specialization: 'Internal Medicine', department: 'General Medicine', fee: 1500, experience: 8 },
  { firstName: 'Bilal', lastName: 'Raza', specialization: 'Cosmetic Dermatology', department: 'Dermatology', fee: 2200, experience: 9 },
  { firstName: 'Nadia', lastName: 'Qureshi', specialization: 'Obstetrics', department: 'Gynecology', fee: 2500, experience: 14 },
  { firstName: 'Hassan', lastName: 'Mahmood', specialization: 'Audiology', department: 'ENT', fee: 1800, experience: 11 },
  { firstName: 'Zainab', lastName: 'Shah', specialization: 'Pediatric Cardiology', department: 'Cardiology', fee: 2800, experience: 13 },
  { firstName: 'Ahmad', lastName: 'Farooq', specialization: 'Joint Replacement', department: 'Orthopedics', fee: 2500, experience: 16 },
];

// Sample patient data
const PATIENTS = [
  { firstName: 'Ali', lastName: 'Ahmed', gender: 'Male', dob: '1985-03-15', phone: '+92 300 1234567', bloodType: 'A+' },
  { firstName: 'Fatima', lastName: 'Khan', gender: 'Female', dob: '1990-07-22', phone: '+92 301 2345678', bloodType: 'B+' },
  { firstName: 'Omar', lastName: 'Malik', gender: 'Male', dob: '1978-11-08', phone: '+92 302 3456789', bloodType: 'O+' },
  { firstName: 'Aisha', lastName: 'Hassan', gender: 'Female', dob: '1995-02-14', phone: '+92 303 4567890', bloodType: 'AB+' },
  { firstName: 'Hamza', lastName: 'Ali', gender: 'Male', dob: '1982-09-30', phone: '+92 304 5678901', bloodType: 'A-' },
  { firstName: 'Zara', lastName: 'Raza', gender: 'Female', dob: '1988-05-18', phone: '+92 305 6789012', bloodType: 'B-' },
  { firstName: 'Bilal', lastName: 'Shah', gender: 'Male', dob: '1970-12-25', phone: '+92 306 7890123', bloodType: 'O-' },
  { firstName: 'Sana', lastName: 'Qureshi', gender: 'Female', dob: '1992-08-03', phone: '+92 307 8901234', bloodType: 'AB-' },
  { firstName: 'Usman', lastName: 'Farooq', gender: 'Male', dob: '1965-04-11', phone: '+92 308 9012345', bloodType: 'A+' },
  { firstName: 'Maryam', lastName: 'Iqbal', gender: 'Female', dob: '1998-01-28', phone: '+92 309 0123456', bloodType: 'B+' },
  { firstName: 'Yasir', lastName: 'Hussain', gender: 'Male', dob: '1975-06-17', phone: '+92 310 1234567', bloodType: 'O+' },
  { firstName: 'Hira', lastName: 'Nawaz', gender: 'Female', dob: '2000-10-05', phone: '+92 311 2345678', bloodType: 'A+' },
  { firstName: 'Kamran', lastName: 'Akram', gender: 'Male', dob: '1980-07-12', phone: '+92 312 3456789', bloodType: 'B+' },
  { firstName: 'Noor', lastName: 'Fatima', gender: 'Female', dob: '1993-03-21', phone: '+92 313 4567890', bloodType: 'O+' },
  { firstName: 'Danish', lastName: 'Malik', gender: 'Male', dob: '1987-11-09', phone: '+92 314 5678901', bloodType: 'AB+' },
];

// Lab test types
const LAB_TESTS = [
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 500 },
  { name: 'Lipid Profile', category: 'Biochemistry', price: 800 },
  { name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 1200 },
  { name: 'Kidney Function Test (KFT)', category: 'Biochemistry', price: 1000 },
  { name: 'Thyroid Panel (TSH, T3, T4)', category: 'Endocrinology', price: 1500 },
  { name: 'Blood Sugar Fasting', category: 'Biochemistry', price: 200 },
  { name: 'HbA1c', category: 'Biochemistry', price: 600 },
  { name: 'Urine Complete Examination', category: 'Clinical Pathology', price: 300 },
  { name: 'ECG', category: 'Cardiology', price: 400 },
  { name: 'Chest X-Ray', category: 'Radiology', price: 700 },
];

// Appointment types
const APPOINTMENT_TYPES = ['new_consultation', 'follow_up', 'routine_checkup', 'emergency'];

// Prescription medications
const MEDICATIONS = [
  { name: 'Amlodipine 5mg', dosage: 'Once daily', duration: '30 days' },
  { name: 'Metformin 500mg', dosage: 'Twice daily with meals', duration: '60 days' },
  { name: 'Omeprazole 20mg', dosage: 'Before breakfast', duration: '14 days' },
  { name: 'Paracetamol 500mg', dosage: 'As needed, max 4 times daily', duration: '7 days' },
  { name: 'Azithromycin 500mg', dosage: 'Once daily', duration: '5 days' },
  { name: 'Losartan 50mg', dosage: 'Once daily', duration: '30 days' },
  { name: 'Atorvastatin 10mg', dosage: 'At bedtime', duration: '30 days' },
  { name: 'Vitamin D3 2000IU', dosage: 'Once weekly', duration: '12 weeks' },
];

class DemoDataSeeder {
  private departmentIds: Map<string, string> = new Map();
  private doctorIds: string[] = [];
  private patientIds: string[] = [];
  private progressCallback?: ProgressCallback;

  setProgressCallback(callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  private reportProgress(step: string, current: number, total: number) {
    if (this.progressCallback) {
      this.progressCallback({ step, current, total });
    }
  }

  async seedAll(): Promise<{ success: boolean; message: string; stats: Record<string, number> }> {
    const stats: Record<string, number> = {};
    
    try {
      // Step 1: Seed departments
      this.reportProgress('Creating departments...', 1, 8);
      stats.departments = await this.seedDepartments();
      
      // Step 2: Seed doctors
      this.reportProgress('Creating doctors...', 2, 8);
      stats.doctors = await this.seedDoctors();
      
      // Step 3: Seed doctor schedules
      this.reportProgress('Setting up doctor schedules...', 3, 8);
      stats.schedules = await this.seedDoctorSchedules();
      
      // Step 4: Seed patients
      this.reportProgress('Creating patients...', 4, 8);
      stats.patients = await this.seedPatients();
      
      // Step 5: Seed appointments
      this.reportProgress('Creating appointments...', 5, 8);
      stats.appointments = await this.seedAppointments();
      
      // Step 6: Seed lab tests
      this.reportProgress('Creating lab tests...', 6, 8);
      stats.labTests = await this.seedLabTests();
      
      // Step 7: Seed prescriptions
      this.reportProgress('Creating prescriptions...', 7, 8);
      stats.prescriptions = await this.seedPrescriptions();
      
      // Step 8: Seed blood bank
      this.reportProgress('Setting up blood bank inventory...', 8, 8);
      stats.bloodStock = await this.seedBloodBank();

      return {
        success: true,
        message: 'Demo data seeded successfully!',
        stats
      };
    } catch (error: any) {
      console.error('Seeding error:', error);
      return {
        success: false,
        message: `Seeding failed: ${error.message}`,
        stats
      };
    }
  }

  private async seedDepartments(): Promise<number> {
    let created = 0;
    
    for (const dept of DEPARTMENTS) {
      // Check if department already exists
      const { data: existing } = await supabase
        .from('departments')
        .select('department_id')
        .eq('department_name', dept.name)
        .single();
      
      if (existing) {
        this.departmentIds.set(dept.name, existing.department_id);
        continue;
      }

      const { data, error } = await supabase
        .from('departments')
        .insert({
          department_name: dept.name,
          description: dept.description,
          department_head: dept.head,
          status: 'Active'
        })
        .select('department_id')
        .single();

      if (error) {
        console.error(`Failed to create department ${dept.name}:`, error);
        continue;
      }

      this.departmentIds.set(dept.name, data.department_id);
      created++;
    }

    return created;
  }

  private async seedDoctors(): Promise<number> {
    let created = 0;

    for (const doc of DOCTORS) {
      // Check if doctor already exists
      const { data: existing } = await supabase
        .from('doctors')
        .select('id')
        .eq('email', `${doc.firstName.toLowerCase()}.${doc.lastName.toLowerCase()}@hospital.pk`)
        .single();

      if (existing) {
        this.doctorIds.push(existing.id);
        continue;
      }

      const email = `${doc.firstName.toLowerCase()}.${doc.lastName.toLowerCase()}@hospital.pk`;
      const departmentId = this.departmentIds.get(doc.department);

      const { data, error } = await supabase
        .from('doctors')
        .insert({
          first_name: doc.firstName,
          last_name: doc.lastName,
          email,
          phone: `+92 3${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(1000000 + Math.random() * 9000000)}`,
          specialization: doc.specialization,
          department: doc.department,
          license_number: `PMC-${2020 + Math.floor(Math.random() * 5)}-${10000 + Math.floor(Math.random() * 90000)}`,
          consultation_fee: doc.fee,
          experience: doc.experience,
          status: 'active',
          education: 'MBBS, FCPS'
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Failed to create doctor ${doc.firstName} ${doc.lastName}:`, error);
        continue;
      }

      this.doctorIds.push(data.id);

      // Link doctor to department
      if (departmentId) {
        await supabase.from('department_doctors').insert({
          department_id: departmentId,
          doctor_id: data.id,
          is_head: doc.firstName === 'Sarah' && doc.department === 'Cardiology'
        });
      }

      created++;
    }

    return created;
  }

  private async seedDoctorSchedules(): Promise<number> {
    let created = 0;

    for (const doctorId of this.doctorIds) {
      // Get doctor's user_id if exists
      const { data: doctor } = await supabase
        .from('doctors')
        .select('user_id')
        .eq('id', doctorId)
        .single();

      const staffId = doctor?.user_id || doctorId;

      // Check if schedule already exists
      const { data: existing } = await supabase
        .from('staff_schedules')
        .select('id')
        .eq('staff_id', staffId)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Create schedule for Monday to Friday
      for (let day = 1; day <= 5; day++) {
        const { error } = await supabase
          .from('staff_schedules')
          .insert({
            staff_id: staffId,
            staff_type: 'doctor',
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            slot_duration_mins: 20,
            break_start: '13:00',
            break_end: '14:00',
            is_active: true
          });

        if (!error) created++;
      }
    }

    return created;
  }

  private async seedPatients(): Promise<number> {
    let created = 0;

    for (const patient of PATIENTS) {
      // Check if patient already exists
      const { data: existing } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', patient.phone)
        .single();

      if (existing) {
        this.patientIds.push(existing.id);
        continue;
      }

      const email = `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@email.com`;

      const { data, error } = await supabase
        .from('patients')
        .insert({
          first_name: patient.firstName,
          last_name: patient.lastName,
          email,
          phone: patient.phone,
          date_of_birth: patient.dob,
          gender: patient.gender,
          blood_type: patient.bloodType,
          address: `${Math.floor(100 + Math.random() * 900)} Street ${Math.floor(1 + Math.random() * 50)}, Islamabad`,
          status: 'active'
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Failed to create patient ${patient.firstName} ${patient.lastName}:`, error);
        continue;
      }

      this.patientIds.push(data.id);
      created++;
    }

    return created;
  }

  private async seedAppointments(): Promise<number> {
    if (this.doctorIds.length === 0 || this.patientIds.length === 0) return 0;

    let created = 0;
    const today = new Date();
    const departmentIdsArray = Array.from(this.departmentIds.values());

    // Create appointments for the past week and next week
    for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const dateStr = date.toISOString().split('T')[0];
      const appointmentsPerDay = dayOffset < 0 ? 3 : 5;

      for (let i = 0; i < appointmentsPerDay; i++) {
        const patientId = this.patientIds[Math.floor(Math.random() * this.patientIds.length)];
        const doctorId = this.doctorIds[Math.floor(Math.random() * this.doctorIds.length)];
        const departmentId = departmentIdsArray[Math.floor(Math.random() * departmentIdsArray.length)];
        const hour = 9 + Math.floor(Math.random() * 7);
        const minute = Math.random() > 0.5 ? '00' : '30';
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;

        // Determine status based on date
        let status = 'scheduled';
        if (dayOffset < 0) {
          status = Math.random() > 0.2 ? 'completed' : 'no_show';
        } else if (dayOffset === 0 && hour < new Date().getHours()) {
          status = 'completed';
        }

        const { error } = await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            department_id: departmentId,
            appointment_date: dateStr,
            appointment_time: time,
            type: APPOINTMENT_TYPES[Math.floor(Math.random() * APPOINTMENT_TYPES.length)],
            status,
            symptoms: 'Demo appointment for testing',
            notes: 'Created by demo data seeder'
          });

        if (!error) created++;
      }
    }

    return created;
  }

  private async seedLabTests(): Promise<number> {
    if (this.doctorIds.length === 0 || this.patientIds.length === 0) return 0;

    let created = 0;

    // Create 15 lab tests
    for (let i = 0; i < 15; i++) {
      const patientId = this.patientIds[Math.floor(Math.random() * this.patientIds.length)];
      const doctorId = this.doctorIds[Math.floor(Math.random() * this.doctorIds.length)];
      const test = LAB_TESTS[Math.floor(Math.random() * LAB_TESTS.length)];
      
      const daysAgo = Math.floor(Math.random() * 14);
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - daysAgo);

      const statuses = ['pending', 'in_progress', 'completed', 'completed', 'completed'];
      const status = daysAgo > 3 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)];

      const { error } = await supabase
        .from('lab_tests')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          test_name: test.name,
          test_type: test.category,
          test_date: testDate.toISOString().split('T')[0],
          status,
          results: status === 'completed' ? 'Normal values within reference range' : null,
          notes: 'Demo lab test for testing purposes'
        });

      if (!error) created++;
    }

    return created;
  }

  private async seedPrescriptions(): Promise<number> {
    if (this.doctorIds.length === 0 || this.patientIds.length === 0) return 0;

    let created = 0;

    // Create prescriptions - one medication per row
    for (let i = 0; i < 20; i++) {
      const patientId = this.patientIds[Math.floor(Math.random() * this.patientIds.length)];
      const doctorId = this.doctorIds[Math.floor(Math.random() * this.doctorIds.length)];
      const med = MEDICATIONS[Math.floor(Math.random() * MEDICATIONS.length)];
      
      const daysAgo = Math.floor(Math.random() * 30);
      const prescDate = new Date();
      prescDate.setDate(prescDate.getDate() - daysAgo);

      const { error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          medication_name: med.name,
          dosage: med.dosage,
          frequency: 'As directed',
          duration: med.duration,
          instructions: 'Take as directed. Demo prescription.',
          date_prescribed: prescDate.toISOString().split('T')[0],
          status: daysAgo > 14 ? 'dispensed' : 'active'
        });

      if (!error) created++;
    }

    return created;
  }

  private async seedBloodBank(): Promise<number> {
    let created = 0;
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Get blood group IDs
    const { data: groups } = await supabase
      .from('blood_groups')
      .select('group_id, group_name');

    if (!groups) return 0;

    const groupMap = new Map(groups.map(g => [g.group_name, g.group_id]));

    for (const bloodGroup of bloodGroups) {
      const groupId = groupMap.get(bloodGroup);
      if (!groupId) continue;

      // Check if stock already exists
      const { data: existing } = await supabase
        .from('blood_stock')
        .select('stock_id')
        .eq('blood_group_id', groupId)
        .single();

      if (existing) continue;

      // Add random stock units (5-30 units per group)
      const units = 5 + Math.floor(Math.random() * 26);

      const { error } = await supabase
        .from('blood_stock')
        .insert({
          blood_group_id: groupId,
          total_units: units
        });

      if (!error) created++;
    }

    return created;
  }

  async clearDemoData(): Promise<{ success: boolean; message: string }> {
    try {
      // Delete in reverse order of dependencies
      await supabase.from('prescriptions').delete().ilike('notes', '%demo%');
      await supabase.from('lab_tests').delete().ilike('notes', '%demo%');
      await supabase.from('appointments').delete().ilike('notes', '%demo%');
      
      return { success: true, message: 'Demo data cleared successfully' };
    } catch (error: any) {
      return { success: false, message: `Failed to clear demo data: ${error.message}` };
    }
  }
}

export const demoDataSeeder = new DemoDataSeeder();
export default demoDataSeeder;
