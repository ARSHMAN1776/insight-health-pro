-- ============================================================================
-- HOSPITAL MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Version: 2.1.0
-- Database: PostgreSQL (Supabase)
-- Last Updated: December 2025
-- Description: Complete SQL schema for the Hospital Management System
-- Total Tables: 30
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM TYPES / ENUMS
-- ============================================================================

-- User roles enum for role-based access control
CREATE TYPE public.app_role AS ENUM (
    'admin',
    'doctor',
    'nurse',
    'pharmacist',
    'receptionist',
    'patient',
    'lab_technician'
);

-- ============================================================================
-- SECTION 1: USER MANAGEMENT TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: profiles
-- Description: Stores user profile information linked to auth.users
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY,                    -- References auth.users(id)
    first_name TEXT NOT NULL,                        -- User's first name
    last_name TEXT NOT NULL,                         -- User's last name
    phone TEXT,                                      -- Contact phone number
    department TEXT,                                 -- Department assignment
    specialization TEXT,                             -- Medical specialization (for doctors)
    license_number TEXT,                             -- Professional license number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow signup to create profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for profiles
CREATE INDEX idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX idx_profiles_last_name ON public.profiles(last_name);

-- ============================================================================
-- TABLE: user_roles
-- Description: Stores user role assignments for RBAC
-- ============================================================================
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,                           -- References auth.users(id)
    role public.app_role NOT NULL,                   -- Assigned role
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)                           -- One role per user
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow signup to create role" ON public.user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for user_roles
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- ============================================================================
-- TABLE: user_settings
-- Description: Stores user-specific application settings
-- ============================================================================
CREATE TABLE public.user_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,                           -- Reference to user
    setting_key TEXT NOT NULL,                       -- Setting identifier
    setting_value JSONB NOT NULL,                    -- Setting value (JSON)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, setting_key)                    -- One value per setting per user
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON public.user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for user_settings
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_user_settings_key ON public.user_settings(setting_key);

-- ============================================================================
-- TABLE: hospital_settings
-- Description: Stores global hospital configuration settings
-- ============================================================================
CREATE TABLE public.hospital_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_category TEXT NOT NULL,                  -- Setting category
    setting_key TEXT NOT NULL,                       -- Setting identifier
    setting_value JSONB NOT NULL,                    -- Setting value (JSON)
    updated_by UUID,                                 -- Last updated by user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (setting_category, setting_key)           -- Unique per category
);

-- Enable RLS
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospital_settings (Admin only)
CREATE POLICY "Admins can view hospital settings" ON public.hospital_settings
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert hospital settings" ON public.hospital_settings
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hospital settings" ON public.hospital_settings
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for hospital_settings
CREATE INDEX idx_hospital_settings_category ON public.hospital_settings(setting_category);
CREATE INDEX idx_hospital_settings_key ON public.hospital_settings(setting_key);

-- ============================================================================
-- SECTION 2: DEPARTMENT & STAFF TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: departments
-- Description: Stores hospital department information
-- ============================================================================
CREATE TABLE public.departments (
    department_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,           -- Department name
    description TEXT,                                -- Department description
    department_head UUID,                            -- Reference to doctor (department head)
    status VARCHAR(20) NOT NULL DEFAULT 'Active'     -- Department status
        CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "Anyone can view active departments" ON public.departments
    FOR SELECT USING (status = 'Active');

CREATE POLICY "Admins can manage departments" ON public.departments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for departments
CREATE INDEX idx_departments_status ON public.departments(status);
CREATE INDEX idx_departments_name ON public.departments(department_name);

-- ============================================================================
-- TABLE: doctors
-- Description: Stores doctor/physician information
-- ============================================================================
CREATE TABLE public.doctors (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,                -- Doctor first name
    last_name VARCHAR(100) NOT NULL,                 -- Doctor last name
    specialization VARCHAR(100) NOT NULL,            -- Medical specialization
    phone VARCHAR(20),                               -- Contact phone
    email VARCHAR(255),                              -- Email address
    license_number VARCHAR(50) NOT NULL,             -- Medical license number
    department VARCHAR(100),                         -- Hospital department (legacy)
    department_id UUID,                              -- Reference to departments table
    years_of_experience INTEGER                      -- Years in practice
        CHECK (years_of_experience >= 0),
    consultation_fee NUMERIC(10, 2),                 -- Standard consultation fee
    availability_schedule JSONB,                     -- Weekly availability schedule
    user_id UUID REFERENCES auth.users(id),          -- Link to auth user for doctor login
    status VARCHAR(20) DEFAULT 'active'              -- Employment status
        CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctors
CREATE POLICY "Anyone can view active doctors" ON public.doctors
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all doctors" ON public.doctors
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can update own profile" ON public.doctors
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Lab technicians can view doctors" ON public.doctors
    FOR SELECT USING (public.has_role(auth.uid(), 'lab_technician'));

-- Indexes for doctors
CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX idx_doctors_department ON public.doctors(department);
CREATE INDEX idx_doctors_department_id ON public.doctors(department_id);
CREATE INDEX idx_doctors_status ON public.doctors(status);
CREATE INDEX idx_doctors_user_id ON public.doctors(user_id);

-- ============================================================================
-- TABLE: department_doctors
-- Description: Many-to-many relationship between departments and doctors
-- ============================================================================
CREATE TABLE public.department_doctors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID NOT NULL,                     -- Reference to department
    doctor_id UUID NOT NULL,                         -- Reference to doctor
    role TEXT DEFAULT 'member',                      -- Role in department (member, head, consultant)
    notes TEXT,                                      -- Additional notes
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (department_id, doctor_id)                -- Prevent duplicates
);

-- Enable RLS
ALTER TABLE public.department_doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for department_doctors
CREATE POLICY "Anyone can view department doctors" ON public.department_doctors
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage department doctors" ON public.department_doctors
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for department_doctors
CREATE INDEX idx_department_doctors_department ON public.department_doctors(department_id);
CREATE INDEX idx_department_doctors_doctor ON public.department_doctors(doctor_id);

-- ============================================================================
-- TABLE: nurses
-- Description: Stores nursing staff information
-- ============================================================================
CREATE TABLE public.nurses (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,                -- Nurse first name
    last_name VARCHAR(100) NOT NULL,                 -- Nurse last name
    phone VARCHAR(20),                               -- Contact phone
    email VARCHAR(255),                              -- Email address
    license_number VARCHAR(50) NOT NULL,             -- Nursing license number
    department VARCHAR(100),                         -- Hospital department
    shift_schedule VARCHAR(50),                      -- Work shift (day/night/rotating)
    specialization VARCHAR(100),                     -- Nursing specialization
    years_of_experience INTEGER                      -- Years in practice
        CHECK (years_of_experience >= 0),
    status VARCHAR(20) DEFAULT 'active'              -- Employment status
        CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nurses
CREATE POLICY "Staff can view nurses" ON public.nurses
    FOR SELECT USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'doctor') OR
        public.has_role(auth.uid(), 'nurse') OR
        public.has_role(auth.uid(), 'receptionist')
    );

CREATE POLICY "Admins can manage all nurses" ON public.nurses
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for nurses
CREATE INDEX idx_nurses_department ON public.nurses(department);
CREATE INDEX idx_nurses_status ON public.nurses(status);

-- ============================================================================
-- TABLE: staff_schedules
-- Description: Stores staff work schedules
-- ============================================================================
CREATE TABLE public.staff_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID NOT NULL,                          -- Reference to staff member
    staff_type VARCHAR(20) NOT NULL                  -- Type of staff (doctor, nurse)
        CHECK (staff_type IN ('doctor', 'nurse', 'receptionist', 'pharmacist')),
    day_of_week INTEGER NOT NULL                     -- Day of week (0=Sunday, 6=Saturday)
        CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,                        -- Shift start time
    end_time TIME NOT NULL,                          -- Shift end time
    is_available BOOLEAN DEFAULT true,               -- Is staff available this slot
    notes TEXT,                                      -- Schedule notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_schedules
CREATE POLICY "Staff can view schedules" ON public.staff_schedules
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage schedules" ON public.staff_schedules
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for staff_schedules
CREATE INDEX idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX idx_staff_schedules_day ON public.staff_schedules(day_of_week);

-- ============================================================================
-- SECTION 3: PATIENT MANAGEMENT TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: patients
-- Description: Stores patient demographic and medical information
-- ============================================================================
CREATE TABLE public.patients (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,                -- Patient first name
    last_name VARCHAR(100) NOT NULL,                 -- Patient last name
    date_of_birth DATE NOT NULL,                     -- Date of birth
    gender VARCHAR(10) NOT NULL                      -- Gender (Male/Female/Other)
        CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(20),                               -- Contact phone
    email VARCHAR(255),                              -- Email address
    address TEXT,                                    -- Residential address
    emergency_contact_name VARCHAR(200),             -- Emergency contact name
    emergency_contact_phone VARCHAR(20),             -- Emergency contact phone
    blood_type VARCHAR(5)                            -- Blood type
        CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    allergies TEXT,                                  -- Known allergies
    medical_history TEXT,                            -- Past medical history
    insurance_provider VARCHAR(255),                 -- Insurance company name
    insurance_policy_number VARCHAR(100),            -- Insurance policy number
    department_id UUID,                              -- Assigned department
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to auth user
    status VARCHAR(30) DEFAULT 'active'              -- Patient status
        CHECK (status IN ('active', 'inactive', 'deceased', 'pending_verification')),
    deleted_at TIMESTAMP WITH TIME ZONE,             -- Soft delete timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Patients can view own record" ON public.patients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Patients can update own record" ON public.patients
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert patients" ON public.patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all patients" ON public.patients
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Receptionists can view all patients" ON public.patients
    FOR SELECT USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can insert patients" ON public.patients
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can update patients" ON public.patients
    FOR UPDATE USING (public.has_role(auth.uid(), 'receptionist'))
    WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Nurses can view all patients" ON public.patients
    FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Doctors can view their patients" ON public.patients
    FOR SELECT USING (
        public.has_role(auth.uid(), 'doctor') AND 
        public.doctor_has_patient_relationship(public.get_doctor_id_for_user(auth.uid()), id)
    );

CREATE POLICY "Lab technicians can view patients" ON public.patients
    FOR SELECT USING (public.has_role(auth.uid(), 'lab_technician'));

-- Indexes for patients
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_patients_department ON public.patients(department_id);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_deleted_at ON public.patients(deleted_at);

-- ============================================================================
-- TABLE: patient_registration_queue
-- Description: Tracks new patient registrations pending verification
-- ============================================================================
CREATE TABLE public.patient_registration_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,                        -- Reference to patient
    user_id UUID NOT NULL,                           -- Reference to auth user
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID,                                -- Staff who reviewed
    reviewed_at TIMESTAMP WITH TIME ZONE,            -- When reviewed
    rejection_reason TEXT,                           -- Reason if rejected
    notes TEXT,                                      -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_registration_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_registration_queue
CREATE POLICY "Staff can view all patient registrations" 
ON public.patient_registration_queue 
FOR SELECT 
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
);

CREATE POLICY "System can insert patient registrations" 
ON public.patient_registration_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can update patient registrations" 
ON public.patient_registration_queue 
FOR UPDATE 
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'receptionist')
);

CREATE POLICY "Patients can view their own registration" 
ON public.patient_registration_queue 
FOR SELECT 
USING (auth.uid() = user_id);

-- Indexes for patient_registration_queue
CREATE INDEX idx_patient_registration_queue_status ON public.patient_registration_queue(status);
CREATE INDEX idx_patient_registration_queue_patient ON public.patient_registration_queue(patient_id);
CREATE INDEX idx_patient_registration_queue_user ON public.patient_registration_queue(user_id);

-- ============================================================================
-- TABLE: patient_messages
-- Description: Stores messages between patients and doctors
-- ============================================================================
CREATE TABLE public.patient_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    doctor_id UUID NOT NULL,                         -- Reference to doctor
    message TEXT NOT NULL,                           -- Message content
    sender_type TEXT NOT NULL                        -- Who sent the message
        CHECK (sender_type IN ('patient', 'doctor')),
    read BOOLEAN DEFAULT false,                      -- Read status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_messages
CREATE POLICY "Patients can view their own messages" ON public.patient_messages
    FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can send messages" ON public.patient_messages
    FOR INSERT WITH CHECK (
        patient_id = public.get_patient_id_for_user(auth.uid()) AND 
        sender_type = 'patient'
    );

CREATE POLICY "Doctors can view messages from their patients" ON public.patient_messages
    FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Doctors can send messages" ON public.patient_messages
    FOR INSERT WITH CHECK (
        doctor_id = public.get_doctor_id_for_user(auth.uid()) AND 
        sender_type = 'doctor'
    );

CREATE POLICY "Message participants can update read status" ON public.patient_messages
    FOR UPDATE USING (
        patient_id = public.get_patient_id_for_user(auth.uid()) OR
        doctor_id = public.get_doctor_id_for_user(auth.uid())
    );

CREATE POLICY "Admins can manage all messages" ON public.patient_messages
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for patient_messages
CREATE INDEX idx_patient_messages_patient ON public.patient_messages(patient_id);
CREATE INDEX idx_patient_messages_doctor ON public.patient_messages(doctor_id);
CREATE INDEX idx_patient_messages_read ON public.patient_messages(read);
CREATE INDEX idx_patient_messages_created ON public.patient_messages(created_at DESC);

-- ============================================================================
-- SECTION 4: CLINICAL TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: appointments
-- Description: Stores patient appointment scheduling
-- ============================================================================
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    doctor_id UUID NOT NULL,                         -- Reference to doctor
    department_id UUID,                              -- Reference to department
    appointment_date DATE NOT NULL,                  -- Date of appointment
    appointment_time TIME NOT NULL,                  -- Time of appointment
    duration INTEGER DEFAULT 30,                     -- Duration in minutes
    type VARCHAR(50) DEFAULT 'consultation'          -- Appointment type
        CHECK (type IN ('consultation', 'follow_up', 'emergency', 'surgery', 'lab_test', 'other')),
    status VARCHAR(20) DEFAULT 'scheduled'           -- Appointment status
        CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    symptoms TEXT,                                   -- Patient reported symptoms
    notes TEXT,                                      -- Additional notes
    deleted_at TIMESTAMP WITH TIME ZONE,             -- Soft delete timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Patients can view own appointments" ON public.appointments
    FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can create own appointments" ON public.appointments
    FOR INSERT WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Doctors can view own appointments" ON public.appointments
    FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Doctors can update own appointments" ON public.appointments
    FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid()))
    WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Nurses can view all appointments" ON public.appointments
    FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Receptionists can view all appointments" ON public.appointments
    FOR SELECT USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can insert appointments" ON public.appointments
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can update appointments" ON public.appointments
    FOR UPDATE USING (public.has_role(auth.uid(), 'receptionist'))
    WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can delete appointments" ON public.appointments
    FOR DELETE USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Admins can manage all appointments" ON public.appointments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for appointments
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_department_id ON public.appointments(department_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_deleted_at ON public.appointments(deleted_at);

-- ============================================================================
-- TABLE: medical_records
-- Description: Stores patient medical visit records
-- ============================================================================
CREATE TABLE public.medical_records (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    doctor_id UUID NOT NULL,                         -- Reference to treating doctor
    visit_date DATE NOT NULL,                        -- Date of visit
    diagnosis TEXT,                                  -- Medical diagnosis
    symptoms TEXT,                                   -- Reported symptoms
    treatment TEXT,                                  -- Treatment prescribed
    medications TEXT,                                -- Medications prescribed
    notes TEXT,                                      -- Doctor's notes
    follow_up_date DATE,                             -- Scheduled follow-up date
    deleted_at TIMESTAMP WITH TIME ZONE,             -- Soft delete timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_records
CREATE POLICY "Patients can view own medical records" ON public.medical_records
    FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Doctors can view own medical records" ON public.medical_records
    FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Doctors can create medical records" ON public.medical_records
    FOR INSERT WITH CHECK (
        public.has_role(auth.uid(), 'doctor') AND 
        doctor_id = public.get_doctor_id_for_user(auth.uid())
    );

CREATE POLICY "Doctors can update own medical records" ON public.medical_records
    FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid()))
    WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Nurses can view all medical records" ON public.medical_records
    FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Admins can manage all medical records" ON public.medical_records
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for medical_records
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON public.medical_records(visit_date);
CREATE INDEX idx_medical_records_deleted_at ON public.medical_records(deleted_at);

-- ============================================================================
-- TABLE: prescriptions
-- Description: Stores medication prescriptions
-- ============================================================================
CREATE TABLE public.prescriptions (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    doctor_id UUID NOT NULL,                         -- Reference to prescribing doctor
    medication_name VARCHAR(255) NOT NULL,           -- Name of medication
    dosage VARCHAR(100),                             -- Dosage instructions
    frequency VARCHAR(100),                          -- How often to take
    duration VARCHAR(100),                           -- Duration of prescription
    quantity INTEGER,                                -- Quantity prescribed
    instructions TEXT,                               -- Special instructions
    side_effects TEXT,                               -- Known side effects
    drug_interactions TEXT,                          -- Drug interaction warnings
    date_prescribed DATE DEFAULT CURRENT_DATE,       -- Date prescribed
    status VARCHAR(20) DEFAULT 'active'              -- Prescription status
        CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    deleted_at TIMESTAMP WITH TIME ZONE,             -- Soft delete timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Doctors can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (
        public.has_role(auth.uid(), 'doctor') AND 
        doctor_id = public.get_doctor_id_for_user(auth.uid())
    );

CREATE POLICY "Doctors can update own prescriptions" ON public.prescriptions
    FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid()))
    WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Nurses can view all prescriptions" ON public.prescriptions
    FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Pharmacists can view all prescriptions" ON public.prescriptions
    FOR SELECT USING (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update prescriptions" ON public.prescriptions
    FOR UPDATE USING (public.has_role(auth.uid(), 'pharmacist'))
    WITH CHECK (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Admins can manage all prescriptions" ON public.prescriptions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for prescriptions
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_prescriptions_date ON public.prescriptions(date_prescribed);
CREATE INDEX idx_prescriptions_deleted_at ON public.prescriptions(deleted_at);

-- ============================================================================
-- TABLE: prescription_refill_requests
-- Description: Stores patient prescription refill requests
-- ============================================================================
CREATE TABLE public.prescription_refill_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID NOT NULL,                   -- Reference to original prescription
    patient_id UUID NOT NULL,                        -- Reference to patient
    status TEXT NOT NULL DEFAULT 'pending'           -- Request status
        CHECK (status IN ('pending', 'approved', 'denied', 'completed')),
    reason TEXT,                                     -- Reason for refill
    notes TEXT,                                      -- Additional notes
    reviewed_by UUID,                                -- Staff who reviewed
    reviewed_at TIMESTAMP WITH TIME ZONE,            -- When reviewed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescription_refill_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescription_refill_requests
CREATE POLICY "Patients can view their own refill requests" ON public.prescription_refill_requests
    FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Patients can create refill requests" ON public.prescription_refill_requests
    FOR INSERT WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Doctors can view refill requests for their prescriptions" ON public.prescription_refill_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p 
            WHERE p.id = prescription_id 
            AND p.doctor_id = public.get_doctor_id_for_user(auth.uid())
        )
    );

CREATE POLICY "Doctors can update refill requests for their prescriptions" ON public.prescription_refill_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p 
            WHERE p.id = prescription_id 
            AND p.doctor_id = public.get_doctor_id_for_user(auth.uid())
        )
    );

CREATE POLICY "Pharmacists can view all refill requests" ON public.prescription_refill_requests
    FOR SELECT USING (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update refill requests" ON public.prescription_refill_requests
    FOR UPDATE USING (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Admins can manage all refill requests" ON public.prescription_refill_requests
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for prescription_refill_requests
CREATE INDEX idx_refill_requests_prescription ON public.prescription_refill_requests(prescription_id);
CREATE INDEX idx_refill_requests_patient ON public.prescription_refill_requests(patient_id);
CREATE INDEX idx_refill_requests_status ON public.prescription_refill_requests(status);

-- ============================================================================
-- TABLE: lab_tests
-- Description: Stores laboratory test orders and results
-- ============================================================================
CREATE TABLE public.lab_tests (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    doctor_id UUID NOT NULL,                         -- Reference to ordering doctor
    test_name VARCHAR(255) NOT NULL,                 -- Name of laboratory test
    test_type VARCHAR(100),                          -- Category of test
    test_date DATE DEFAULT CURRENT_DATE,             -- Date test was conducted
    results TEXT,                                    -- Test results
    normal_range VARCHAR(100),                       -- Normal reference range
    status VARCHAR(20) DEFAULT 'pending'             -- Test status
        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal'            -- Priority level
        CHECK (priority IN ('normal', 'urgent', 'stat')),
    lab_technician VARCHAR(200),                     -- Technician who performed test
    cost NUMERIC(10, 2),                             -- Cost of test
    notes TEXT,                                      -- Additional notes
    report_image_url TEXT,                           -- URL to lab report image
    deleted_at TIMESTAMP WITH TIME ZONE,             -- Soft delete timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lab_tests
CREATE POLICY "Patients can view own lab tests" ON public.lab_tests
    FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Doctors can view own lab tests" ON public.lab_tests
    FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Doctors can create lab tests" ON public.lab_tests
    FOR INSERT WITH CHECK (
        public.has_role(auth.uid(), 'doctor') AND 
        doctor_id = public.get_doctor_id_for_user(auth.uid())
    );

CREATE POLICY "Doctors can update own lab tests" ON public.lab_tests
    FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid()))
    WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));

CREATE POLICY "Nurses can view all lab tests" ON public.lab_tests
    FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Nurses can update lab tests" ON public.lab_tests
    FOR UPDATE USING (public.has_role(auth.uid(), 'nurse'))
    WITH CHECK (public.has_role(auth.uid(), 'nurse'));

CREATE POLICY "Admins can manage all lab tests" ON public.lab_tests
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lab technicians can view all lab tests" ON public.lab_tests
    FOR SELECT USING (public.has_role(auth.uid(), 'lab_technician'));

CREATE POLICY "Lab technicians can update lab tests" ON public.lab_tests
    FOR UPDATE USING (public.has_role(auth.uid(), 'lab_technician'))
    WITH CHECK (public.has_role(auth.uid(), 'lab_technician'));

-- Indexes for lab_tests
CREATE INDEX idx_lab_tests_patient_id ON public.lab_tests(patient_id);
CREATE INDEX idx_lab_tests_doctor_id ON public.lab_tests(doctor_id);
CREATE INDEX idx_lab_tests_status ON public.lab_tests(status);
CREATE INDEX idx_lab_tests_date ON public.lab_tests(test_date);
CREATE INDEX idx_lab_tests_deleted_at ON public.lab_tests(deleted_at);

-- ============================================================================
-- SECTION 5: FACILITY MANAGEMENT TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: rooms
-- Description: Stores hospital room information
-- ============================================================================
CREATE TABLE public.rooms (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,         -- Room number/identifier
    room_type VARCHAR(50) NOT NULL                   -- Type of room
        CHECK (room_type IN ('general', 'private', 'icu', 'operating', 'emergency', 'maternity', 'pediatric')),
    department VARCHAR(100),                         -- Department assignment
    capacity INTEGER DEFAULT 1,                      -- Maximum patient capacity
    current_occupancy INTEGER DEFAULT 0,             -- Current occupancy
    floor INTEGER,                                   -- Floor number
    amenities TEXT[],                                -- Array of amenities
    daily_rate NUMERIC(10, 2),                       -- Daily room rate
    status VARCHAR(20) DEFAULT 'available'           -- Room status
        CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')),
    notes TEXT,                                      -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Staff can view rooms" ON public.rooms
    FOR SELECT USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'doctor') OR
        public.has_role(auth.uid(), 'nurse') OR
        public.has_role(auth.uid(), 'receptionist')
    );

CREATE POLICY "Admins and nurses can manage rooms" ON public.rooms
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'nurse')
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'nurse')
    );

-- Indexes for rooms
CREATE INDEX idx_rooms_type ON public.rooms(room_type);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_department ON public.rooms(department);
CREATE INDEX idx_rooms_floor ON public.rooms(floor);

-- ============================================================================
-- TABLE: room_assignments
-- Description: Stores patient room/bed assignments
-- ============================================================================
CREATE TABLE public.room_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL,                           -- Reference to room
    patient_id UUID NOT NULL,                        -- Reference to patient
    bed_number INTEGER NOT NULL,                     -- Bed number in room
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Admission date
    discharge_date DATE,                             -- Discharge date (null if current)
    admission_reason TEXT DEFAULT 'general',         -- Reason for admission
    surgery_id UUID,                                 -- Reference to surgery (if surgical admission)
    assigned_by UUID,                                -- Staff who made assignment
    status VARCHAR(20) NOT NULL DEFAULT 'active'     -- Assignment status
        CHECK (status IN ('active', 'discharged', 'transferred')),
    notes TEXT,                                      -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_assignments
CREATE POLICY "Staff can view room assignments" ON public.room_assignments
    FOR SELECT USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'doctor') OR
        public.has_role(auth.uid(), 'nurse') OR
        public.has_role(auth.uid(), 'receptionist')
    );

CREATE POLICY "Admins and nurses can manage room assignments" ON public.room_assignments
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'nurse')
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'nurse')
    );

-- Indexes for room_assignments
CREATE INDEX idx_room_assignments_room ON public.room_assignments(room_id);
CREATE INDEX idx_room_assignments_patient ON public.room_assignments(patient_id);
CREATE INDEX idx_room_assignments_status ON public.room_assignments(status);
CREATE INDEX idx_room_assignments_surgery ON public.room_assignments(surgery_id);

-- ============================================================================
-- TABLE: inventory
-- Description: Stores hospital inventory and medical supplies
-- ============================================================================
CREATE TABLE public.inventory (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,                 -- Name of inventory item
    category VARCHAR(100),                           -- Item category
    current_stock INTEGER NOT NULL DEFAULT 0,        -- Current stock quantity
    minimum_stock INTEGER DEFAULT 10,                -- Minimum stock threshold
    maximum_stock INTEGER DEFAULT 1000,              -- Maximum stock capacity
    unit_price NUMERIC(10, 2),                       -- Price per unit
    supplier VARCHAR(255),                           -- Supplier name
    batch_number VARCHAR(100),                       -- Batch/lot number
    expiry_date DATE,                                -- Expiration date
    location VARCHAR(100),                           -- Storage location
    last_restocked DATE,                             -- Last restock date
    status VARCHAR(20) DEFAULT 'available'           -- Item status
        CHECK (status IN ('available', 'low_stock', 'out_of_stock', 'expired', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory
CREATE POLICY "Staff can view inventory" ON public.inventory
    FOR SELECT USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'pharmacist') OR
        public.has_role(auth.uid(), 'nurse')
    );

CREATE POLICY "Pharmacists can insert inventory" ON public.inventory
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update inventory" ON public.inventory
    FOR UPDATE USING (public.has_role(auth.uid(), 'pharmacist'))
    WITH CHECK (public.has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Admins can manage all inventory" ON public.inventory
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for inventory
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_inventory_expiry ON public.inventory(expiry_date);
CREATE INDEX idx_inventory_stock ON public.inventory(current_stock);

-- ============================================================================
-- SECTION 6: FINANCIAL TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: payments
-- Description: Stores billing and payment transactions
-- ============================================================================
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    amount NUMERIC(12, 2) NOT NULL,                  -- Payment amount
    payment_date DATE DEFAULT CURRENT_DATE,          -- Date of payment
    payment_method VARCHAR(50) DEFAULT 'cash'        -- Payment method
        CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'insurance', 'bank_transfer', 'check')),
    payment_status VARCHAR(20) DEFAULT 'pending'     -- Payment status
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'partial')),
    description TEXT,                                -- Payment description
    invoice_number VARCHAR(50),                      -- Invoice reference number
    transaction_id VARCHAR(100),                     -- Transaction ID for electronic payments
    deleted_at TIMESTAMP WITH TIME ZONE,             -- Soft delete timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Patients can view own payments" ON public.payments
    FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));

CREATE POLICY "Receptionists can view all payments" ON public.payments
    FOR SELECT USING (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can insert payments" ON public.payments
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Receptionists can update payments" ON public.payments
    FOR UPDATE USING (public.has_role(auth.uid(), 'receptionist'))
    WITH CHECK (public.has_role(auth.uid(), 'receptionist'));

CREATE POLICY "Admins can manage all payments" ON public.payments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for payments
CREATE INDEX idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_number);
CREATE INDEX idx_payments_deleted_at ON public.payments(deleted_at);

-- ============================================================================
-- SECTION 7: BLOOD BANK TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: blood_groups
-- Description: Stores blood group reference data
-- ============================================================================
CREATE TABLE public.blood_groups (
    group_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name VARCHAR(10) NOT NULL UNIQUE,          -- Blood group name (A+, A-, B+, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blood_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_groups
CREATE POLICY "Anyone can view blood groups" ON public.blood_groups
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blood groups" ON public.blood_groups
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- TABLE: blood_stock
-- Description: Stores current blood inventory levels
-- ============================================================================
CREATE TABLE public.blood_stock (
    stock_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_group_id UUID NOT NULL,                    -- Reference to blood group
    total_units INTEGER NOT NULL DEFAULT 0,          -- Current stock units
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blood_stock ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_stock
CREATE POLICY "Authenticated users can view blood stock" ON public.blood_stock
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage blood stock" ON public.blood_stock
    FOR ALL USING (true) WITH CHECK (true);

-- Indexes for blood_stock
CREATE INDEX idx_blood_stock_group ON public.blood_stock(blood_group_id);

-- ============================================================================
-- TABLE: donors
-- Description: Stores blood donor information
-- ============================================================================
CREATE TABLE public.donors (
    donor_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,                      -- Donor name
    contact VARCHAR(20),                             -- Contact number
    blood_group_id UUID NOT NULL,                    -- Reference to blood group
    last_donation_date DATE,                         -- Last donation date
    status VARCHAR(20) NOT NULL DEFAULT 'Eligible'   -- Donor status
        CHECK (status IN ('Eligible', 'Deferred', 'Ineligible')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donors
CREATE POLICY "Authenticated users can view donors" ON public.donors
    FOR SELECT USING (true);

CREATE POLICY "Staff can insert donors" ON public.donors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update donors" ON public.donors
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete donors" ON public.donors
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for donors
CREATE INDEX idx_donors_blood_group ON public.donors(blood_group_id);
CREATE INDEX idx_donors_status ON public.donors(status);

-- ============================================================================
-- TABLE: blood_issues
-- Description: Stores blood issue/transfusion records
-- ============================================================================
CREATE TABLE public.blood_issues (
    issue_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    blood_group_id UUID NOT NULL,                    -- Reference to blood group
    units_given INTEGER NOT NULL,                    -- Units issued
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,   -- Date of issue
    issued_by UUID,                                  -- Staff who issued
    notes TEXT,                                      -- Clinical notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blood_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_issues
CREATE POLICY "Authenticated users can view blood issues" ON public.blood_issues
    FOR SELECT USING (true);

CREATE POLICY "Staff can create blood issues" ON public.blood_issues
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update blood issues" ON public.blood_issues
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete blood issues" ON public.blood_issues
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for blood_issues
CREATE INDEX idx_blood_issues_patient ON public.blood_issues(patient_id);
CREATE INDEX idx_blood_issues_group ON public.blood_issues(blood_group_id);
CREATE INDEX idx_blood_issues_date ON public.blood_issues(issue_date);

-- ============================================================================
-- TABLE: blood_stock_transactions
-- Description: Logs all blood stock changes for audit
-- ============================================================================
CREATE TABLE public.blood_stock_transactions (
    transaction_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_group_id UUID NOT NULL,                    -- Reference to blood group
    transaction_type VARCHAR(20) NOT NULL,           -- add, issue, expired, adjustment
    units INTEGER NOT NULL,                          -- Units changed
    previous_balance INTEGER NOT NULL,               -- Balance before
    new_balance INTEGER NOT NULL,                    -- Balance after
    source VARCHAR(100),                             -- Source of change
    reference_id UUID,                               -- Reference to related record
    performed_by UUID,                               -- Staff who performed
    notes TEXT,                                      -- Transaction notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blood_stock_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_stock_transactions
CREATE POLICY "Authenticated users can view stock transactions" ON public.blood_stock_transactions
    FOR SELECT USING (true);

CREATE POLICY "Staff can insert stock transactions" ON public.blood_stock_transactions
    FOR INSERT WITH CHECK (true);

-- Indexes for blood_stock_transactions
CREATE INDEX idx_blood_transactions_group ON public.blood_stock_transactions(blood_group_id);
CREATE INDEX idx_blood_transactions_date ON public.blood_stock_transactions(created_at);
CREATE INDEX idx_blood_transactions_type ON public.blood_stock_transactions(transaction_type);

-- ============================================================================
-- SECTION 8: OPERATION DEPARTMENT TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: operation_theatres
-- Description: Stores operation theatre information
-- ============================================================================
CREATE TABLE public.operation_theatres (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ot_name VARCHAR(100) NOT NULL,                   -- OT name/number
    floor INTEGER,                                   -- Floor location
    equipment TEXT[],                                -- Available equipment
    status VARCHAR(20) NOT NULL DEFAULT 'available'  -- OT status
        CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
    notes TEXT,                                      -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operation_theatres ENABLE ROW LEVEL SECURITY;

-- RLS Policies for operation_theatres
CREATE POLICY "Public select operation_theatres" ON public.operation_theatres
    FOR SELECT USING (true);

CREATE POLICY "Public insert operation_theatres" ON public.operation_theatres
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update operation_theatres" ON public.operation_theatres
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete operation_theatres" ON public.operation_theatres
    FOR DELETE USING (true);

-- Indexes for operation_theatres
CREATE INDEX idx_ot_status ON public.operation_theatres(status);
CREATE INDEX idx_ot_floor ON public.operation_theatres(floor);

-- ============================================================================
-- TABLE: surgeries
-- Description: Stores surgery/operation records
-- ============================================================================
CREATE TABLE public.surgeries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    doctor_id UUID NOT NULL,                         -- Reference to lead surgeon
    theatre_id UUID,                                 -- Reference to operation theatre
    surgery_type VARCHAR(200) NOT NULL,              -- Type of surgery
    scheduled_date DATE NOT NULL,                    -- Scheduled date
    scheduled_time TIME NOT NULL,                    -- Scheduled time
    actual_start_time TIMESTAMP WITH TIME ZONE,      -- Actual start time
    actual_end_time TIMESTAMP WITH TIME ZONE,        -- Actual end time
    estimated_duration INTEGER,                      -- Estimated duration in minutes
    anesthesia_type VARCHAR(50),                     -- Type of anesthesia
    pre_operative_diagnosis TEXT,                    -- Pre-op diagnosis
    post_operative_diagnosis TEXT,                   -- Post-op diagnosis
    procedure_notes TEXT,                            -- Procedure notes
    complications TEXT,                              -- Any complications
    blood_units_used INTEGER DEFAULT 0,              -- Blood units used
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'  -- Surgery status
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
    priority VARCHAR(20) DEFAULT 'normal'            -- Priority level
        CHECK (priority IN ('normal', 'urgent', 'emergency')),
    consent_signed BOOLEAN DEFAULT false,            -- Consent form signed
    consent_signed_at TIMESTAMP WITH TIME ZONE,      -- When consent was signed
    consent_signature_url TEXT,                      -- URL to signature image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surgeries
CREATE POLICY "Public select surgeries" ON public.surgeries
    FOR SELECT USING (true);

CREATE POLICY "Public insert surgeries" ON public.surgeries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update surgeries" ON public.surgeries
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete surgeries" ON public.surgeries
    FOR DELETE USING (true);

-- Indexes for surgeries
CREATE INDEX idx_surgeries_patient ON public.surgeries(patient_id);
CREATE INDEX idx_surgeries_doctor ON public.surgeries(doctor_id);
CREATE INDEX idx_surgeries_theatre ON public.surgeries(theatre_id);
CREATE INDEX idx_surgeries_status ON public.surgeries(status);
CREATE INDEX idx_surgeries_date ON public.surgeries(scheduled_date);

-- ============================================================================
-- TABLE: surgery_team
-- Description: Stores surgery team member assignments
-- ============================================================================
CREATE TABLE public.surgery_team (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    surgery_id UUID NOT NULL,                        -- Reference to surgery
    staff_id UUID NOT NULL,                          -- Reference to staff member
    staff_type VARCHAR(50) NOT NULL,                 -- Type of staff (doctor, nurse, anesthetist)
    role VARCHAR(100) NOT NULL,                      -- Role in surgery
    notes TEXT,                                      -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.surgery_team ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surgery_team
CREATE POLICY "Public select surgery_team" ON public.surgery_team
    FOR SELECT USING (true);

CREATE POLICY "Public insert surgery_team" ON public.surgery_team
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update surgery_team" ON public.surgery_team
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete surgery_team" ON public.surgery_team
    FOR DELETE USING (true);

-- Indexes for surgery_team
CREATE INDEX idx_surgery_team_surgery ON public.surgery_team(surgery_id);
CREATE INDEX idx_surgery_team_staff ON public.surgery_team(staff_id);

-- ============================================================================
-- TABLE: post_operation
-- Description: Stores post-operative care records
-- ============================================================================
CREATE TABLE public.post_operation (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    surgery_id UUID NOT NULL,                        -- Reference to surgery
    vital_signs JSONB,                               -- Post-op vital signs
    recovery_notes TEXT,                             -- Recovery notes
    complications TEXT,                              -- Any complications
    medication_notes TEXT,                           -- Post-op medications
    discharge_status VARCHAR(20) NOT NULL DEFAULT 'stable'
        CHECK (discharge_status IN ('stable', 'critical', 'discharged', 'transferred')),
    follow_up_date DATE,                             -- Follow-up appointment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_operation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_operation
CREATE POLICY "Public select post_operation" ON public.post_operation
    FOR SELECT USING (true);

CREATE POLICY "Public insert post_operation" ON public.post_operation
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update post_operation" ON public.post_operation
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete post_operation" ON public.post_operation
    FOR DELETE USING (true);

-- Indexes for post_operation
CREATE INDEX idx_post_op_surgery ON public.post_operation(surgery_id);

-- ============================================================================
-- SECTION 9: NOTIFICATION & COMMUNICATION TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: notifications
-- Description: Stores system notifications for users
-- ============================================================================
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,                           -- Reference to user
    title TEXT NOT NULL,                             -- Notification title
    message TEXT NOT NULL,                           -- Notification message body
    type TEXT NOT NULL                               -- Notification type
        CHECK (type IN (
            'appointment', 'prescription', 'lab_result', 'payment', 
            'system', 'reminder', 'alert', 'medication', 'critical', 
            'general', 'patient_registration', 'surgery', 'blood_bank'
        )),
    priority TEXT NOT NULL DEFAULT 'normal'          -- Priority level
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read BOOLEAN NOT NULL DEFAULT false,             -- Read status
    action_url TEXT,                                 -- URL for action button
    metadata JSONB DEFAULT '{}'::jsonb,              -- Additional metadata
    expires_at TIMESTAMP WITH TIME ZONE,             -- Expiration timestamp
    sent_via_email BOOLEAN DEFAULT false,            -- Email sent flag
    sent_via_sms BOOLEAN DEFAULT false,              -- SMS sent flag
    sent_via_push BOOLEAN DEFAULT false,             -- Push notification flag
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON public.notifications(priority);

-- ============================================================================
-- TABLE: reminders
-- Description: Stores user reminders and scheduled tasks
-- ============================================================================
CREATE TABLE public.reminders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,                           -- Reference to user
    title TEXT NOT NULL,                             -- Reminder title
    description TEXT,                                -- Reminder description
    reminder_type TEXT NOT NULL                      -- Type of reminder
        CHECK (reminder_type IN ('appointment', 'medication', 'follow_up', 'lab_test', 'payment', 'general', 'custom')),
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL, -- When to trigger reminder
    status TEXT NOT NULL DEFAULT 'pending'           -- Reminder status
        CHECK (status IN ('pending', 'sent', 'completed', 'cancelled', 'dismissed', 'expired')),
    recurring BOOLEAN DEFAULT false,                 -- Is this recurring?
    recurring_pattern TEXT,                          -- Recurring pattern (daily, weekly, monthly)
    related_table TEXT,                              -- Related table name
    related_id UUID,                                 -- Related record ID
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reminders
CREATE POLICY "Users can view their own reminders" ON public.reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" ON public.reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON public.reminders
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON public.reminders
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reminders" ON public.reminders
    FOR ALL USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for reminders
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_time ON public.reminders(reminder_time);
CREATE INDEX idx_reminders_status ON public.reminders(status);

-- ============================================================================
-- SECTION 10: AUDIT & COMPLIANCE TABLES
-- ============================================================================

-- ============================================================================
-- TABLE: phi_audit_log
-- Description: HIPAA-compliant audit log for PHI access
-- ============================================================================
CREATE TABLE public.phi_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    performed_by UUID NOT NULL,                      -- User who performed action
    performer_name TEXT,                             -- Name of performer
    performer_role TEXT,                             -- Role of performer
    action TEXT NOT NULL                             -- Action performed
        CHECK (action IN ('view', 'create', 'update', 'delete', 'export', 'print')),
    table_name TEXT NOT NULL,                        -- Table accessed
    record_id UUID NOT NULL,                         -- Record accessed
    patient_id UUID,                                 -- Patient if applicable
    old_values JSONB,                                -- Previous values (for updates)
    new_values JSONB,                                -- New values (for creates/updates)
    changed_fields TEXT[],                           -- Fields that changed
    reason TEXT,                                     -- Reason for access
    ip_address TEXT,                                 -- Client IP address
    user_agent TEXT,                                 -- Client user agent
    session_id TEXT,                                 -- Session identifier
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phi_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phi_audit_log
CREATE POLICY "Admins can view all audit logs" ON public.phi_audit_log
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs" ON public.phi_audit_log
    FOR INSERT WITH CHECK (true);

-- Indexes for phi_audit_log
CREATE INDEX idx_phi_audit_performed_by ON public.phi_audit_log(performed_by);
CREATE INDEX idx_phi_audit_table ON public.phi_audit_log(table_name);
CREATE INDEX idx_phi_audit_record ON public.phi_audit_log(record_id);
CREATE INDEX idx_phi_audit_patient ON public.phi_audit_log(patient_id);
CREATE INDEX idx_phi_audit_action ON public.phi_audit_log(action);
CREATE INDEX idx_phi_audit_created_at ON public.phi_audit_log(created_at DESC);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- ============================================================================
-- Function: has_role
-- Description: Check if user has a specific role
-- Used in RLS policies to prevent recursive checks
-- ============================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- ============================================================================
-- Function: get_user_role
-- Description: Get user's assigned role
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- ============================================================================
-- Function: get_patient_id_for_user
-- Description: Get patient ID for a given user ID
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_patient_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.patients WHERE user_id = _user_id LIMIT 1
$$;

-- ============================================================================
-- Function: get_doctor_id_for_user
-- Description: Get doctor ID for a given user ID
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_doctor_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.doctors WHERE user_id = _user_id LIMIT 1
$$;

-- ============================================================================
-- Function: doctor_has_patient_relationship
-- Description: Check if a doctor has any relationship with a patient
-- ============================================================================
CREATE OR REPLACE FUNCTION public.doctor_has_patient_relationship(_doctor_id UUID, _patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.appointments WHERE doctor_id = _doctor_id AND patient_id = _patient_id
        UNION
        SELECT 1 FROM public.medical_records WHERE doctor_id = _doctor_id AND patient_id = _patient_id
        UNION
        SELECT 1 FROM public.prescriptions WHERE doctor_id = _doctor_id AND patient_id = _patient_id
        UNION
        SELECT 1 FROM public.lab_tests WHERE doctor_id = _doctor_id AND patient_id = _patient_id
    )
$$;

-- ============================================================================
-- Function: get_doctor_departments
-- Description: Get all departments a doctor belongs to
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_doctor_departments(_doctor_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT department_id FROM public.department_doctors WHERE doctor_id = _doctor_id
$$;

-- ============================================================================
-- Function: update_updated_at_column
-- Description: Auto-update updated_at timestamp on row update
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Function: update_notification_updated_at
-- Description: Update notification timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Function: update_settings_updated_at
-- Description: Update settings timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Function: handle_new_user
-- Description: Create profile, assign role, and handle role-specific records on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_patient_id uuid;
    staff_user record;
    user_role text;
BEGIN
    -- Get the role from metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
    
    -- Insert into profiles table
    INSERT INTO public.profiles (id, first_name, last_name, phone, department, specialization, license_number)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE(NEW.raw_user_meta_data->>'department', NULL),
        COALESCE(NEW.raw_user_meta_data->>'specialization', NULL),
        COALESCE(NEW.raw_user_meta_data->>'license_number', NULL)
    );

    -- Insert into user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        user_role::app_role
    );

    -- Handle different roles
    IF user_role = 'patient' THEN
        -- Create patient record
        INSERT INTO public.patients (
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            status,
            user_id
        )
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
            COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, CURRENT_DATE),
            COALESCE(NEW.raw_user_meta_data->>'gender', 'Other'),
            'pending_verification',
            NEW.id
        )
        RETURNING id INTO new_patient_id;

        -- Create registration queue entry
        INSERT INTO public.patient_registration_queue (patient_id, user_id, status)
        VALUES (new_patient_id, NEW.id, 'pending');

        -- Create notifications for admins and receptionists
        FOR staff_user IN 
            SELECT ur.user_id 
            FROM public.user_roles ur 
            WHERE ur.role IN ('admin', 'receptionist')
        LOOP
            INSERT INTO public.notifications (
                user_id,
                title,
                message,
                type,
                priority,
                action_url,
                metadata
            )
            VALUES (
                staff_user.user_id,
                'New Patient Registration',
                'New patient ' || COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '') || ' has registered and requires verification.',
                'patient_registration',
                'high',
                '/patients',
                jsonb_build_object(
                    'patient_id', new_patient_id,
                    'patient_name', COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
                    'patient_email', NEW.email,
                    'registration_time', now()
                )
            );
        END LOOP;
        
    ELSIF user_role = 'doctor' THEN
        -- Create doctor record with user_id link
        INSERT INTO public.doctors (
            first_name,
            last_name,
            email,
            phone,
            specialization,
            license_number,
            department,
            status,
            user_id
        )
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
            COALESCE(NEW.raw_user_meta_data->>'specialization', 'General'),
            COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
            COALESCE(NEW.raw_user_meta_data->>'department', NULL),
            'active',
            NEW.id
        );
        
    ELSIF user_role = 'nurse' THEN
        -- Create nurse record
        INSERT INTO public.nurses (
            first_name,
            last_name,
            email,
            phone,
            specialization,
            license_number,
            department,
            status
        )
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
            COALESCE(NEW.raw_user_meta_data->>'specialization', NULL),
            COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
            COALESCE(NEW.raw_user_meta_data->>'department', NULL),
            'active'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at triggers for all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON public.patients 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_registration_queue_updated_at 
    BEFORE UPDATE ON public.patient_registration_queue 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_messages_updated_at 
    BEFORE UPDATE ON public.patient_messages 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at 
    BEFORE UPDATE ON public.doctors 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nurses_updated_at 
    BEFORE UPDATE ON public.nurses 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_schedules_updated_at 
    BEFORE UPDATE ON public.staff_schedules 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON public.departments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON public.appointments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at 
    BEFORE UPDATE ON public.medical_records 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at 
    BEFORE UPDATE ON public.prescriptions 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescription_refill_requests_updated_at 
    BEFORE UPDATE ON public.prescription_refill_requests 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_tests_updated_at 
    BEFORE UPDATE ON public.lab_tests 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON public.rooms 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_assignments_updated_at 
    BEFORE UPDATE ON public.room_assignments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at 
    BEFORE UPDATE ON public.inventory 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_stock_updated_at 
    BEFORE UPDATE ON public.blood_stock 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donors_updated_at 
    BEFORE UPDATE ON public.donors 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operation_theatres_updated_at 
    BEFORE UPDATE ON public.operation_theatres 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surgeries_updated_at 
    BEFORE UPDATE ON public.surgeries 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_operation_updated_at 
    BEFORE UPDATE ON public.post_operation 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON public.notifications 
    FOR EACH ROW EXECUTE FUNCTION public.update_notification_updated_at();

CREATE TRIGGER update_reminders_updated_at 
    BEFORE UPDATE ON public.reminders 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION public.update_settings_updated_at();

CREATE TRIGGER update_hospital_settings_updated_at 
    BEFORE UPDATE ON public.hospital_settings 
    FOR EACH ROW EXECUTE FUNCTION public.update_settings_updated_at();

-- Handle new user registration trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Patient Registration Queue
ALTER TABLE public.patient_registration_queue 
    ADD CONSTRAINT fk_patient_registration_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.patient_registration_queue 
    ADD CONSTRAINT fk_patient_registration_user 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Patient Messages
ALTER TABLE public.patient_messages 
    ADD CONSTRAINT fk_patient_messages_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.patient_messages 
    ADD CONSTRAINT fk_patient_messages_doctor 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Department Doctors
ALTER TABLE public.department_doctors 
    ADD CONSTRAINT fk_department_doctors_department 
    FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;

ALTER TABLE public.department_doctors 
    ADD CONSTRAINT fk_department_doctors_doctor 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Appointments
ALTER TABLE public.appointments 
    ADD CONSTRAINT fk_appointments_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

ALTER TABLE public.appointments 
    ADD CONSTRAINT fk_appointments_doctor 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);

ALTER TABLE public.appointments 
    ADD CONSTRAINT fk_appointments_department 
    FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

-- Medical Records
ALTER TABLE public.medical_records 
    ADD CONSTRAINT fk_medical_records_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

ALTER TABLE public.medical_records 
    ADD CONSTRAINT fk_medical_records_doctor 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);

-- Prescriptions
ALTER TABLE public.prescriptions 
    ADD CONSTRAINT fk_prescriptions_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

ALTER TABLE public.prescriptions 
    ADD CONSTRAINT fk_prescriptions_doctor 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);

-- Prescription Refill Requests
ALTER TABLE public.prescription_refill_requests 
    ADD CONSTRAINT fk_refill_requests_prescription 
    FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;

ALTER TABLE public.prescription_refill_requests 
    ADD CONSTRAINT fk_refill_requests_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

-- Lab Tests
ALTER TABLE public.lab_tests 
    ADD CONSTRAINT fk_lab_tests_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

ALTER TABLE public.lab_tests 
    ADD CONSTRAINT fk_lab_tests_doctor 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);

-- Room Assignments
ALTER TABLE public.room_assignments 
    ADD CONSTRAINT fk_room_assignments_room 
    FOREIGN KEY (room_id) REFERENCES public.rooms(id);

ALTER TABLE public.room_assignments 
    ADD CONSTRAINT fk_room_assignments_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

ALTER TABLE public.room_assignments 
    ADD CONSTRAINT fk_room_assignments_surgery 
    FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id);

-- Payments
ALTER TABLE public.payments 
    ADD CONSTRAINT fk_payments_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

-- Departments
ALTER TABLE public.departments 
    ADD CONSTRAINT fk_departments_head 
    FOREIGN KEY (department_head) REFERENCES public.doctors(id);

-- Patients
ALTER TABLE public.patients 
    ADD CONSTRAINT fk_patients_department 
    FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

-- Doctors
ALTER TABLE public.doctors 
    ADD CONSTRAINT fk_doctors_department 
    FOREIGN KEY (department_id) REFERENCES public.departments(department_id);

-- Blood Bank
ALTER TABLE public.blood_stock 
    ADD CONSTRAINT fk_blood_stock_group 
    FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id);

ALTER TABLE public.donors 
    ADD CONSTRAINT fk_donors_blood_group 
    FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id);

ALTER TABLE public.blood_issues 
    ADD CONSTRAINT fk_blood_issues_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

ALTER TABLE public.blood_issues 
    ADD CONSTRAINT fk_blood_issues_blood_group 
    FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id);

ALTER TABLE public.blood_stock_transactions 
    ADD CONSTRAINT fk_blood_transactions_blood_group 
    FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id);

-- Operation Department
ALTER TABLE public.surgeries 
    ADD CONSTRAINT fk_surgeries_patient 
    FOREIGN KEY (patient_id) REFERENCES public.patients(id);

ALTER TABLE public.surgeries 
    ADD CONSTRAINT fk_surgeries_doctor 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);

ALTER TABLE public.surgeries 
    ADD CONSTRAINT fk_surgeries_theatre 
    FOREIGN KEY (theatre_id) REFERENCES public.operation_theatres(id);

ALTER TABLE public.surgery_team 
    ADD CONSTRAINT fk_surgery_team_surgery 
    FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id) ON DELETE CASCADE;

ALTER TABLE public.post_operation 
    ADD CONSTRAINT fk_post_operation_surgery 
    FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id) ON DELETE CASCADE;

-- ============================================================================
-- SEED DATA: Blood Groups
-- ============================================================================
INSERT INTO public.blood_groups (group_name) VALUES
    ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')
ON CONFLICT (group_name) DO NOTHING;

-- ============================================================================
-- DATABASE SCHEMA SUMMARY
-- ============================================================================
/*
================================================================================
                    HOSPITAL MANAGEMENT SYSTEM DATABASE v2.1
================================================================================

TABLES OVERVIEW (30 Tables):
============================

┌─────────────────────────────┬────────────────────────────────────────────────────┐
│ Section                     │ Tables                                             │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 1. User Management          │ profiles, user_roles, user_settings,               │
│                             │ hospital_settings                                  │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 2. Department & Staff       │ departments, doctors, department_doctors,          │
│                             │ nurses, staff_schedules                            │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 3. Patient Management       │ patients, patient_registration_queue,              │
│                             │ patient_messages                                   │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 4. Clinical                 │ appointments, medical_records, prescriptions,      │
│                             │ prescription_refill_requests, lab_tests            │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 5. Facility Management      │ rooms, room_assignments, inventory                 │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 6. Financial                │ payments                                           │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 7. Blood Bank               │ blood_groups, blood_stock, donors,                 │
│                             │ blood_issues, blood_stock_transactions             │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 8. Operation Department     │ operation_theatres, surgeries, surgery_team,       │
│                             │ post_operation                                     │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 9. Notifications            │ notifications, reminders                           │
├─────────────────────────────┼────────────────────────────────────────────────────┤
│ 10. Audit & Compliance      │ phi_audit_log                                      │
└─────────────────────────────┴────────────────────────────────────────────────────┘

USER ROLES (6 Roles):
=====================
┌─────────────────┬────────────────────────────────────────────────────────────────┐
│ Role            │ Permissions                                                     │
├─────────────────┼────────────────────────────────────────────────────────────────┤
│ admin           │ Full system access, manage users, settings, staff, all data    │
│ doctor          │ Patient care, prescriptions, medical records, surgeries        │
│ nurse           │ Patient care, vitals, medication, blood bank, surgery assist   │
│ pharmacist      │ Prescription dispensing, inventory management                  │
│ receptionist    │ Appointments, patient registration, billing, scheduling        │
│ patient         │ View own records, appointments, prescriptions, messages        │
└─────────────────┴────────────────────────────────────────────────────────────────┘

DATABASE FUNCTIONS (9 Functions):
=================================
• has_role(_user_id, _role)                    - Check if user has specific role
• get_user_role(_user_id)                      - Get user's assigned role
• get_patient_id_for_user(_user_id)            - Get patient ID for user
• get_doctor_id_for_user(_user_id)             - Get doctor ID for user
• doctor_has_patient_relationship(dr, pt)       - Check doctor-patient relationship
• get_doctor_departments(_doctor_id)           - Get doctor's departments
• update_updated_at_column()                   - Auto-update timestamps
• update_notification_updated_at()             - Notification timestamp update
• update_settings_updated_at()                 - Settings timestamp update
• handle_new_user()                            - Create profile/role on signup

SECURITY FEATURES:
==================
✓ Row Level Security (RLS) enabled on all 30 tables
✓ Role-based access control via user_roles table
✓ Security definer functions for role checks (prevents recursion)
✓ Separate policies for each CRUD operation per role
✓ Automatic profile and role creation on user signup
✓ Admin-only access for sensitive settings
✓ HIPAA-compliant PHI audit logging
✓ Soft delete support for critical tables

TRIGGERS (26 Triggers):
=======================
• Auto-update updated_at on all tables with timestamp
• on_auth_user_created for automatic profile creation

================================================================================
                               END OF SCHEMA v2.1
================================================================================
*/
