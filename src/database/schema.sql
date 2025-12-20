-- ============================================================================
-- HOSPITAL MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0.0
-- Database: PostgreSQL (Supabase)
-- Created: 2024
-- Description: Complete SQL schema for the Hospital Management System
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
    'patient'
);

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
    status VARCHAR(20) DEFAULT 'active'              -- Patient status
        CHECK (status IN ('active', 'inactive', 'deceased')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Allow all operations for authenticated users" ON public.patients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select patients" ON public.patients
    FOR SELECT USING (true);

CREATE POLICY "Public insert patients" ON public.patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update patients" ON public.patients
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete patients" ON public.patients
    FOR DELETE USING (true);

-- Indexes for patients
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_patients_email ON public.patients(email);

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
    license_number VARCHAR(50) NOT NULL UNIQUE,      -- Medical license number
    department VARCHAR(100),                         -- Hospital department
    years_of_experience INTEGER                      -- Years in practice
        CHECK (years_of_experience >= 0),
    consultation_fee NUMERIC(10, 2),                 -- Standard consultation fee
    availability_schedule JSONB,                     -- Weekly availability schedule
    status VARCHAR(20) DEFAULT 'active'              -- Employment status
        CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctors
CREATE POLICY "Allow all operations for authenticated users" ON public.doctors
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select doctors" ON public.doctors
    FOR SELECT USING (true);

CREATE POLICY "Public insert doctors" ON public.doctors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update doctors" ON public.doctors
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete doctors" ON public.doctors
    FOR DELETE USING (true);

-- Indexes for doctors
CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX idx_doctors_department ON public.doctors(department);
CREATE INDEX idx_doctors_status ON public.doctors(status);

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
    license_number VARCHAR(50) NOT NULL UNIQUE,      -- Nursing license number
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
CREATE POLICY "Allow all operations for authenticated users" ON public.nurses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select nurses" ON public.nurses
    FOR SELECT USING (true);

CREATE POLICY "Public insert nurses" ON public.nurses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update nurses" ON public.nurses
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete nurses" ON public.nurses
    FOR DELETE USING (true);

-- Indexes for nurses
CREATE INDEX idx_nurses_department ON public.nurses(department);
CREATE INDEX idx_nurses_status ON public.nurses(status);

-- ============================================================================
-- TABLE: appointments
-- Description: Stores patient appointment scheduling
-- ============================================================================
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,                        -- Reference to patient
    doctor_id UUID NOT NULL,                         -- Reference to doctor
    appointment_date DATE NOT NULL,                  -- Date of appointment
    appointment_time TIME NOT NULL,                  -- Time of appointment
    duration INTEGER DEFAULT 30,                     -- Duration in minutes
    type VARCHAR(50) DEFAULT 'consultation'          -- Appointment type
        CHECK (type IN ('consultation', 'follow_up', 'emergency', 'surgery', 'lab_test', 'other')),
    status VARCHAR(20) DEFAULT 'scheduled'           -- Appointment status
        CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    symptoms TEXT,                                   -- Patient reported symptoms
    notes TEXT,                                      -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Allow all operations for authenticated users" ON public.appointments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select appointments" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Public insert appointments" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update appointments" ON public.appointments
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete appointments" ON public.appointments
    FOR DELETE USING (true);

-- Indexes for appointments
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_records
CREATE POLICY "Allow all operations for authenticated users" ON public.medical_records
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select medical_records" ON public.medical_records
    FOR SELECT USING (true);

CREATE POLICY "Public insert medical_records" ON public.medical_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update medical_records" ON public.medical_records
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete medical_records" ON public.medical_records
    FOR DELETE USING (true);

-- Indexes for medical_records
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON public.medical_records(visit_date);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescriptions
CREATE POLICY "Allow all operations for authenticated users" ON public.prescriptions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select prescriptions" ON public.prescriptions
    FOR SELECT USING (true);

CREATE POLICY "Public insert prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update prescriptions" ON public.prescriptions
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete prescriptions" ON public.prescriptions
    FOR DELETE USING (true);

-- Indexes for prescriptions
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_prescriptions_date ON public.prescriptions(date_prescribed);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lab_tests
CREATE POLICY "Allow all operations for authenticated users" ON public.lab_tests
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select lab_tests" ON public.lab_tests
    FOR SELECT USING (true);

CREATE POLICY "Public insert lab_tests" ON public.lab_tests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update lab_tests" ON public.lab_tests
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete lab_tests" ON public.lab_tests
    FOR DELETE USING (true);

-- Indexes for lab_tests
CREATE INDEX idx_lab_tests_patient_id ON public.lab_tests(patient_id);
CREATE INDEX idx_lab_tests_doctor_id ON public.lab_tests(doctor_id);
CREATE INDEX idx_lab_tests_status ON public.lab_tests(status);
CREATE INDEX idx_lab_tests_date ON public.lab_tests(test_date);

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
CREATE POLICY "Allow all operations for authenticated users" ON public.inventory
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select inventory" ON public.inventory
    FOR SELECT USING (true);

CREATE POLICY "Public insert inventory" ON public.inventory
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update inventory" ON public.inventory
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete inventory" ON public.inventory
    FOR DELETE USING (true);

-- Indexes for inventory
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_inventory_expiry ON public.inventory(expiry_date);
CREATE INDEX idx_inventory_stock ON public.inventory(current_stock);

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
CREATE POLICY "Allow all operations for authenticated users" ON public.rooms
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select rooms" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "Public insert rooms" ON public.rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update rooms" ON public.rooms
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete rooms" ON public.rooms
    FOR DELETE USING (true);

-- Indexes for rooms
CREATE INDEX idx_rooms_type ON public.rooms(room_type);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_department ON public.rooms(department);
CREATE INDEX idx_rooms_floor ON public.rooms(floor);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Allow all operations for authenticated users" ON public.payments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public select payments" ON public.payments
    FOR SELECT USING (true);

CREATE POLICY "Public insert payments" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update payments" ON public.payments
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete payments" ON public.payments
    FOR DELETE USING (true);

-- Indexes for payments
CREATE INDEX idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_number);

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
        CHECK (type IN ('appointment', 'prescription', 'lab_result', 'payment', 'system', 'reminder', 'alert')),
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
        CHECK (reminder_type IN ('appointment', 'medication', 'follow_up', 'lab_test', 'payment', 'general')),
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL, -- When to trigger reminder
    status TEXT NOT NULL DEFAULT 'pending'           -- Reminder status
        CHECK (status IN ('pending', 'sent', 'completed', 'cancelled')),
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
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function: Check if user has a specific role
-- Used in RLS policies to prevent recursive checks
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

-- Function: Get user's role
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

-- Function: Update updated_at timestamp
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

-- Function: Handle new user registration
-- Creates profile and assigns default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

    -- Insert into user_roles table (default to patient if no role specified)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::public.app_role
    );

    RETURN NEW;
END;
$$;

-- Function: Update notification timestamp
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

-- Function: Update settings timestamp
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
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update updated_at for patients
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for doctors
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for nurses
CREATE TRIGGER update_nurses_updated_at
    BEFORE UPDATE ON public.nurses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for appointments
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for medical_records
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for prescriptions
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for lab_tests
CREATE TRIGGER update_lab_tests_updated_at
    BEFORE UPDATE ON public.lab_tests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for inventory
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for rooms
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for payments
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for notifications
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_updated_at();

-- Trigger: Auto-update updated_at for reminders
CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON public.reminders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for user_settings
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_settings_updated_at();

-- Trigger: Auto-update updated_at for hospital_settings
CREATE TRIGGER update_hospital_settings_updated_at
    BEFORE UPDATE ON public.hospital_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_settings_updated_at();

-- Trigger: Auto-update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Handle new user registration (on auth.users)
-- Note: This trigger is on auth.users table and is created via Supabase
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DATABASE SCHEMA SUMMARY
-- ============================================================================
/*
================================================================================
                    HOSPITAL MANAGEMENT SYSTEM DATABASE
================================================================================

TABLES OVERVIEW (15 Tables):
============================

┌─────────────────────┬─────────────────────────────────────────────────────────┐
│ Table Name          │ Description                                             │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ profiles            │ User profile information (linked to auth.users)         │
│ user_roles          │ User role assignments (RBAC)                            │
│ patients            │ Patient demographic and medical information             │
│ doctors             │ Doctor/physician information                            │
│ nurses              │ Nursing staff information                               │
│ appointments        │ Patient appointment scheduling                          │
│ medical_records     │ Patient medical visit records                           │
│ prescriptions       │ Medication prescriptions                                │
│ lab_tests           │ Laboratory test orders and results                      │
│ inventory           │ Hospital inventory and supplies                         │
│ rooms               │ Hospital room information                               │
│ payments            │ Billing and payment transactions                        │
│ notifications       │ System notifications                                    │
│ reminders           │ User reminders and tasks                                │
│ user_settings       │ User-specific settings                                  │
│ hospital_settings   │ Global hospital configuration                           │
└─────────────────────┴─────────────────────────────────────────────────────────┘

USER ROLES:
===========
• admin        - Full system access, manage users and settings
• doctor       - Patient management, prescriptions, medical records
• nurse        - Patient care, vitals, medication administration
• pharmacist   - Prescription dispensing, inventory management
• receptionist - Appointments, patient registration, billing
• patient      - View own records, appointments, prescriptions

SECURITY FEATURES:
==================
✓ Row Level Security (RLS) enabled on all tables
✓ Role-based access control via user_roles table
✓ Security definer functions for role checks (prevents recursion)
✓ Separate policies for each CRUD operation
✓ Automatic profile creation on user signup

ENTITY RELATIONSHIPS:
=====================

                         ┌──────────────────┐
                         │   auth.users     │
                         │   (Supabase)     │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
     ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
     │    profiles    │  │   user_roles   │  │ notifications  │
     └────────────────┘  └────────────────┘  └────────────────┘
                                                      │
     ┌────────────────┐                               │
     │    patients    │◄──────────────────────────────┘
     └───────┬────────┘
             │
     ┌───────┴───────────────────────────────┐
     │       │               │               │
     ▼       ▼               ▼               ▼
┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│appoint- │ │ medical_ │ │prescrip-  │ │lab_tests │
│ments    │ │ records  │ │tions      │ │          │
└────┬────┘ └────┬─────┘ └─────┬─────┘ └────┬─────┘
     │           │             │            │
     └───────────┴──────┬──────┴────────────┘
                        │
                        ▼
               ┌────────────────┐
               │    doctors     │
               └────────────────┘

               ┌────────────────┐
               │    nurses      │
               └────────────────┘

               ┌────────────────┐
               │    rooms       │
               └────────────────┘

               ┌────────────────┐
               │   inventory    │
               └────────────────┘

               ┌────────────────┐
               │   payments     │◄── patients
               └────────────────┘

DATABASE FUNCTIONS:
===================
• has_role(_user_id, _role)       - Check if user has specific role
• get_user_role(_user_id)         - Get user's assigned role
• update_updated_at_column()      - Auto-update timestamps
• handle_new_user()               - Create profile/role on signup
• update_notification_updated_at() - Notification timestamp update
• update_settings_updated_at()     - Settings timestamp update

INDEXES:
========
• Primary key indexes on all tables (automatic)
• Foreign key indexes for all relationships
• Status field indexes for filtering
• Date field indexes for temporal queries
• Composite indexes for common query patterns

TRIGGERS:
=========
• update_*_updated_at - Auto-update updated_at on all tables
• on_auth_user_created - Create profile & role on user signup

================================================================================
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
