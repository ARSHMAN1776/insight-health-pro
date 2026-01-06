-- ============================================================================
-- HOSPITAL MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Version: 2.3.0
-- Database: PostgreSQL (Supabase)
-- Last Updated: January 2026
-- Description: Complete SQL schema for the Hospital Management System
-- Total Tables: 45+
-- 
-- IMPORTANT: This schema is designed for fresh database setup.
-- Execute in order: Extensions -> Types -> Functions -> Tables -> RLS -> FK
-- ============================================================================

-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: CUSTOM TYPES / ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
        'admin',
        'doctor',
        'nurse',
        'pharmacist',
        'receptionist',
        'patient',
        'lab_technician'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 3: HELPER FUNCTIONS (MUST BE CREATED BEFORE TABLES WITH RLS)
-- ============================================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    );
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

-- Function to get patient ID for a user
CREATE OR REPLACE FUNCTION public.get_patient_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.patients WHERE user_id = _user_id LIMIT 1;
$$;

-- Function to get doctor ID for a user
CREATE OR REPLACE FUNCTION public.get_doctor_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.doctors WHERE user_id = _user_id LIMIT 1;
$$;

-- Function to check if doctor has relationship with patient
CREATE OR REPLACE FUNCTION public.doctor_has_patient_relationship(_doctor_id UUID, _patient_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = _doctor_id AND patient_id = _patient_id AND deleted_at IS NULL
        UNION
        SELECT 1 FROM public.medical_records
        WHERE doctor_id = _doctor_id AND patient_id = _patient_id AND deleted_at IS NULL
        UNION
        SELECT 1 FROM public.prescriptions
        WHERE doctor_id = _doctor_id AND patient_id = _patient_id AND deleted_at IS NULL
    );
$$;

-- Function to get doctor's departments
CREATE OR REPLACE FUNCTION public.get_doctor_departments(_doctor_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT department_id FROM public.department_doctors WHERE doctor_id = _doctor_id;
$$;

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 4: CREATE ALL TABLES (WITHOUT RLS POLICIES)
-- ============================================================================

-- ============================================================================
-- SECTION 1: USER MANAGEMENT TABLES
-- ============================================================================

-- TABLE: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    department TEXT,
    specialization TEXT,
    license_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- TABLE: user_settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, setting_key)
);

-- TABLE: hospital_settings
CREATE TABLE IF NOT EXISTS public.hospital_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_category TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (setting_category, setting_key)
);

-- ============================================================================
-- SECTION 2: DEPARTMENT & STAFF TABLES
-- ============================================================================

-- TABLE: departments
CREATE TABLE IF NOT EXISTS public.departments (
    department_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    department_head UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: doctors
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    license_number VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    department_id UUID,
    years_of_experience INTEGER CHECK (years_of_experience >= 0),
    consultation_fee NUMERIC(10, 2),
    availability_schedule JSONB,
    user_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: department_doctors
CREATE TABLE IF NOT EXISTS public.department_doctors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    role TEXT DEFAULT 'member',
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (department_id, doctor_id)
);

-- TABLE: nurses
CREATE TABLE IF NOT EXISTS public.nurses (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    license_number VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    shift_schedule VARCHAR(50),
    specialization VARCHAR(100),
    years_of_experience INTEGER CHECK (years_of_experience >= 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: staff_schedules
CREATE TABLE IF NOT EXISTS public.staff_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID NOT NULL,
    staff_type VARCHAR(20) NOT NULL CHECK (staff_type IN ('doctor', 'nurse', 'receptionist', 'pharmacist')),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    slot_duration INTEGER DEFAULT 30,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 3: PATIENT MANAGEMENT TABLES
-- ============================================================================

-- TABLE: patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_history TEXT,
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(50),
    user_id UUID,
    department_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged', 'deceased')),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: patient_registration_queue
CREATE TABLE IF NOT EXISTS public.patient_registration_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    rejection_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TABLE: patient_messages
CREATE TABLE IF NOT EXISTS public.patient_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    message TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'doctor')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: patient_vitals
CREATE TABLE IF NOT EXISTS public.patient_vitals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    recorded_by UUID NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature NUMERIC(4, 1),
    spo2 INTEGER,
    respiratory_rate INTEGER,
    weight NUMERIC(5, 2),
    height NUMERIC(5, 2),
    bmi NUMERIC(4, 1),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    blood_glucose NUMERIC(6, 2),
    is_abnormal BOOLEAN DEFAULT false,
    abnormal_flags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 4: CLINICAL TABLES
-- ============================================================================

-- TABLE: appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    department_id UUID,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER DEFAULT 30,
    type VARCHAR(50) DEFAULT 'consultation',
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    symptoms TEXT,
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: appointment_waitlist
CREATE TABLE IF NOT EXISTS public.appointment_waitlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID,
    department_id UUID,
    preferred_date_start DATE NOT NULL,
    preferred_date_end DATE,
    preferred_time_slots JSONB DEFAULT '[]'::jsonb,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'scheduled', 'cancelled', 'expired')),
    reason TEXT,
    notes TEXT,
    notified_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TABLE: medical_records
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    visit_date DATE NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    diagnosis_code VARCHAR(20),
    procedure_codes TEXT[],
    treatment TEXT,
    medications TEXT,
    notes TEXT,
    follow_up_date DATE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity INTEGER,
    instructions TEXT,
    side_effects TEXT,
    drug_interactions TEXT,
    date_prescribed DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: prescription_items
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity INTEGER,
    route VARCHAR(50),
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: prescription_refill_requests
CREATE TABLE IF NOT EXISTS public.prescription_refill_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    reason TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: prescription_templates
CREATE TABLE IF NOT EXISTS public.prescription_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID,
    template_name VARCHAR(200) NOT NULL,
    description TEXT,
    diagnosis_category VARCHAR(100),
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: lab_tests
CREATE TABLE IF NOT EXISTS public.lab_tests (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    test_type VARCHAR(100),
    test_date DATE DEFAULT CURRENT_DATE,
    results TEXT,
    normal_range VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    lab_technician VARCHAR(200),
    report_image_url TEXT,
    cost NUMERIC(10, 2),
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: referrals
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    referring_doctor_id UUID NOT NULL,
    receiving_doctor_id UUID,
    receiving_department_id UUID,
    appointment_id UUID,
    reason TEXT NOT NULL,
    diagnosis TEXT,
    clinical_notes TEXT,
    urgency VARCHAR(20) NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
    response_notes TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 5: FACILITY MANAGEMENT TABLES
-- ============================================================================

-- TABLE: rooms
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('general', 'private', 'icu', 'emergency', 'operating', 'recovery')),
    department VARCHAR(100),
    floor INTEGER,
    capacity INTEGER DEFAULT 1,
    current_occupancy INTEGER DEFAULT 0,
    daily_rate NUMERIC(10, 2),
    amenities TEXT[],
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: room_assignments
CREATE TABLE IF NOT EXISTS public.room_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    bed_number INTEGER NOT NULL,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    admission_reason TEXT,
    discharge_date DATE,
    surgery_id UUID,
    assigned_by UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: inventory
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER DEFAULT 10,
    maximum_stock INTEGER DEFAULT 1000,
    reorder_point INTEGER DEFAULT 10,
    unit_price NUMERIC(10, 2),
    batch_number VARCHAR(50),
    expiry_date DATE,
    supplier VARCHAR(200),
    supplier_id UUID,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock', 'expired')),
    last_restocked DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 6: FINANCIAL TABLES
-- ============================================================================

-- TABLE: payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'insurance', 'bank_transfer', 'online')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    invoice_number VARCHAR(50),
    transaction_id VARCHAR(100),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: insurance_claims
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    appointment_id UUID,
    insurance_provider VARCHAR(200) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    claim_number VARCHAR(100),
    service_date DATE NOT NULL,
    submission_date DATE DEFAULT CURRENT_DATE,
    total_amount NUMERIC(12, 2) NOT NULL,
    approved_amount NUMERIC(12, 2),
    patient_responsibility NUMERIC(12, 2),
    diagnosis_codes TEXT[] DEFAULT '{}',
    procedure_codes TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'denied', 'appealed', 'paid')),
    denial_code VARCHAR(20),
    denial_reason TEXT,
    appeal_deadline DATE,
    appeal_submitted BOOLEAN DEFAULT false,
    appeal_notes TEXT,
    notes TEXT,
    submitted_by UUID,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: insurance_claim_items
CREATE TABLE IF NOT EXISTS public.insurance_claim_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID NOT NULL,
    procedure_code VARCHAR(20) NOT NULL,
    procedure_description TEXT,
    diagnosis_code VARCHAR(20),
    service_date DATE NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    denial_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 7: BLOOD BANK TABLES
-- ============================================================================

-- TABLE: blood_groups
CREATE TABLE IF NOT EXISTS public.blood_groups (
    group_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: blood_stock
CREATE TABLE IF NOT EXISTS public.blood_stock (
    stock_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_group_id UUID NOT NULL,
    total_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: donors
CREATE TABLE IF NOT EXISTS public.donors (
    donor_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    blood_group_id UUID NOT NULL,
    contact VARCHAR(20),
    last_donation_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Eligible' CHECK (status IN ('Eligible', 'Deferred', 'Permanent Deferral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: blood_issues
CREATE TABLE IF NOT EXISTS public.blood_issues (
    issue_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    blood_group_id UUID NOT NULL,
    units_given INTEGER NOT NULL,
    issued_by UUID,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: blood_stock_transactions
CREATE TABLE IF NOT EXISTS public.blood_stock_transactions (
    transaction_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_group_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('donation', 'issue', 'expired', 'transfer_in', 'transfer_out', 'adjustment')),
    units INTEGER NOT NULL,
    previous_balance INTEGER NOT NULL,
    new_balance INTEGER NOT NULL,
    source VARCHAR(100),
    reference_id UUID,
    performed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 8: OPERATION DEPARTMENT TABLES
-- ============================================================================

-- TABLE: operation_theatres
CREATE TABLE IF NOT EXISTS public.operation_theatres (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ot_name VARCHAR(100) NOT NULL,
    floor INTEGER,
    equipment TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: surgeries
CREATE TABLE IF NOT EXISTS public.surgeries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    ot_id UUID NOT NULL,
    surgery_type VARCHAR(200) NOT NULL,
    surgery_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    priority VARCHAR(20) DEFAULT 'scheduled' CHECK (priority IN ('emergency', 'urgent', 'scheduled')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: surgery_team
CREATE TABLE IF NOT EXISTS public.surgery_team (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    surgery_id UUID NOT NULL,
    staff_name VARCHAR(200) NOT NULL,
    role VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: post_operation
CREATE TABLE IF NOT EXISTS public.post_operation (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    surgery_id UUID NOT NULL,
    recovery_notes TEXT,
    complications TEXT,
    vital_signs JSONB,
    medication_notes TEXT,
    discharge_status VARCHAR(20) NOT NULL DEFAULT 'recovering' CHECK (discharge_status IN ('recovering', 'stable', 'critical', 'discharged')),
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 9: SHIFT HANDOVER TABLES
-- ============================================================================

-- TABLE: shift_handovers
CREATE TABLE IF NOT EXISTS public.shift_handovers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    outgoing_nurse_id UUID NOT NULL,
    incoming_nurse_id UUID,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_type VARCHAR(20) NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'night')),
    handover_time TIME NOT NULL DEFAULT CURRENT_TIME,
    critical_patients TEXT,
    medication_notes TEXT,
    equipment_issues TEXT,
    general_notes TEXT,
    pending_tasks JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'completed')),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: shift_handover_patients
CREATE TABLE IF NOT EXISTS public.shift_handover_patients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    handover_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    room_number VARCHAR(20),
    bed_number INTEGER,
    condition_summary TEXT,
    pending_medications TEXT,
    pending_tests TEXT,
    special_instructions TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 10: NOTIFICATIONS & REMINDERS TABLES
-- ============================================================================

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    action_url TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE,
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_sms BOOLEAN DEFAULT false,
    sent_via_push BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TABLE: reminders
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_type TEXT NOT NULL,
    related_table TEXT,
    related_id UUID,
    recurring BOOLEAN DEFAULT false,
    recurring_pattern TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed', 'snoozed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 11: HIPAA AUDIT LOG
-- ============================================================================

-- TABLE: phi_audit_log
CREATE TABLE IF NOT EXISTS public.phi_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    performed_by UUID NOT NULL,
    performer_name TEXT,
    performer_role TEXT,
    action TEXT NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export', 'print')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    patient_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 12: CLINICAL CODES TABLES
-- ============================================================================

-- TABLE: diagnosis_codes
CREATE TABLE IF NOT EXISTS public.diagnosis_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: procedure_codes
CREATE TABLE IF NOT EXISTS public.procedure_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    base_price NUMERIC(10, 2),
    modifier_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLE: drug_interactions
CREATE TABLE IF NOT EXISTS public.drug_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_a VARCHAR(200) NOT NULL,
    drug_b VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'contraindicated')),
    description TEXT NOT NULL,
    mechanism TEXT,
    management TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- SECTION 13: SUPPLY CHAIN TABLES
-- ============================================================================

-- TABLE: suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    payment_terms VARCHAR(100),
    lead_time_days INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TABLE: purchase_orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'ordered', 'partially_received', 'received', 'cancelled')),
    notes TEXT,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TABLE: purchase_order_items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID NOT NULL,
    inventory_item_id UUID,
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_received', 'received', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_registration_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_refill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_theatres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_operation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_handover_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phi_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================================================

-- PROFILES POLICIES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES POLICIES
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles_insert_own" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_roles_admin" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- USER_SETTINGS POLICIES
CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- HOSPITAL_SETTINGS POLICIES
CREATE POLICY "hospital_settings_admin_select" ON public.hospital_settings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "hospital_settings_admin_insert" ON public.hospital_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "hospital_settings_admin_update" ON public.hospital_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DEPARTMENTS POLICIES
CREATE POLICY "departments_select_active" ON public.departments FOR SELECT USING (status = 'Active');
CREATE POLICY "departments_admin" ON public.departments FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DOCTORS POLICIES
CREATE POLICY "doctors_select_active" ON public.doctors FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'pharmacist') OR
    public.has_role(auth.uid(), 'lab_technician') OR
    status = 'active'
);
CREATE POLICY "doctors_admin" ON public.doctors FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "doctors_update_own" ON public.doctors FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- DEPARTMENT_DOCTORS POLICIES
CREATE POLICY "department_doctors_select" ON public.department_doctors FOR SELECT USING (true);
CREATE POLICY "department_doctors_admin" ON public.department_doctors FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- NURSES POLICIES
CREATE POLICY "nurses_select_staff" ON public.nurses FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "nurses_admin" ON public.nurses FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- STAFF_SCHEDULES POLICIES
CREATE POLICY "staff_schedules_select" ON public.staff_schedules FOR SELECT USING (true);
CREATE POLICY "staff_schedules_admin" ON public.staff_schedules FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PATIENTS POLICIES
CREATE POLICY "patients_select_own" ON public.patients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "patients_update_own" ON public.patients FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "patients_admin" ON public.patients FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "patients_nurse_select" ON public.patients FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "patients_lab_select" ON public.patients FOR SELECT USING (public.has_role(auth.uid(), 'lab_technician'));
CREATE POLICY "patients_doctor_select" ON public.patients FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') AND
    public.doctor_has_patient_relationship(public.get_doctor_id_for_user(auth.uid()), id)
);

-- PATIENT_REGISTRATION_QUEUE POLICIES
CREATE POLICY "patient_registration_queue_own" ON public.patient_registration_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "patient_registration_queue_staff_select" ON public.patient_registration_queue FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "patient_registration_queue_staff_update" ON public.patient_registration_queue FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "patient_registration_queue_insert" ON public.patient_registration_queue FOR INSERT WITH CHECK (true);

-- PATIENT_MESSAGES POLICIES
CREATE POLICY "patient_messages_patient_select" ON public.patient_messages FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "patient_messages_doctor_select" ON public.patient_messages FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "patient_messages_patient_insert" ON public.patient_messages FOR INSERT WITH CHECK (
    patient_id = public.get_patient_id_for_user(auth.uid()) AND sender_type = 'patient'
);
CREATE POLICY "patient_messages_doctor_insert" ON public.patient_messages FOR INSERT WITH CHECK (
    doctor_id = public.get_doctor_id_for_user(auth.uid()) AND sender_type = 'doctor'
);
CREATE POLICY "patient_messages_update" ON public.patient_messages FOR UPDATE USING (
    patient_id = public.get_patient_id_for_user(auth.uid()) OR
    doctor_id = public.get_doctor_id_for_user(auth.uid())
);
CREATE POLICY "patient_messages_admin" ON public.patient_messages FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PATIENT_VITALS POLICIES
CREATE POLICY "patient_vitals_patient_select" ON public.patient_vitals FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "patient_vitals_nurse_select" ON public.patient_vitals FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "patient_vitals_nurse_insert" ON public.patient_vitals FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "patient_vitals_nurse_update" ON public.patient_vitals FOR UPDATE USING (public.has_role(auth.uid(), 'nurse')) WITH CHECK (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "patient_vitals_doctor_select" ON public.patient_vitals FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') AND
    public.doctor_has_patient_relationship(public.get_doctor_id_for_user(auth.uid()), patient_id)
);
CREATE POLICY "patient_vitals_admin" ON public.patient_vitals FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- APPOINTMENTS POLICIES
CREATE POLICY "appointments_patient_select" ON public.appointments FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "appointments_patient_insert" ON public.appointments FOR INSERT WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "appointments_patient_update" ON public.appointments FOR UPDATE USING (patient_id = public.get_patient_id_for_user(auth.uid())) WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "appointments_doctor_select" ON public.appointments FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "appointments_doctor_update" ON public.appointments FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid())) WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "appointments_nurse_select" ON public.appointments FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "appointments_receptionist" ON public.appointments FOR ALL USING (public.has_role(auth.uid(), 'receptionist')) WITH CHECK (public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "appointments_admin" ON public.appointments FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- APPOINTMENT_WAITLIST POLICIES
CREATE POLICY "appointment_waitlist_patient_select" ON public.appointment_waitlist FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "appointment_waitlist_patient_insert" ON public.appointment_waitlist FOR INSERT WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "appointment_waitlist_patient_update" ON public.appointment_waitlist FOR UPDATE USING (patient_id = public.get_patient_id_for_user(auth.uid())) WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "appointment_waitlist_patient_delete" ON public.appointment_waitlist FOR DELETE USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "appointment_waitlist_doctor_select" ON public.appointment_waitlist FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "appointment_waitlist_receptionist" ON public.appointment_waitlist FOR ALL USING (public.has_role(auth.uid(), 'receptionist')) WITH CHECK (public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "appointment_waitlist_admin" ON public.appointment_waitlist FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- MEDICAL_RECORDS POLICIES
CREATE POLICY "medical_records_patient_select" ON public.medical_records FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "medical_records_doctor_select" ON public.medical_records FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "medical_records_doctor_insert" ON public.medical_records FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') AND doctor_id = public.get_doctor_id_for_user(auth.uid())
);
CREATE POLICY "medical_records_doctor_update" ON public.medical_records FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid())) WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "medical_records_nurse_select" ON public.medical_records FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "medical_records_admin" ON public.medical_records FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PRESCRIPTIONS POLICIES
CREATE POLICY "prescriptions_patient_select" ON public.prescriptions FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "prescriptions_doctor_select" ON public.prescriptions FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "prescriptions_doctor_insert" ON public.prescriptions FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') AND doctor_id = public.get_doctor_id_for_user(auth.uid())
);
CREATE POLICY "prescriptions_doctor_update" ON public.prescriptions FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid())) WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "prescriptions_pharmacist_select" ON public.prescriptions FOR SELECT USING (public.has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "prescriptions_pharmacist_update" ON public.prescriptions FOR UPDATE USING (public.has_role(auth.uid(), 'pharmacist')) WITH CHECK (public.has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "prescriptions_admin" ON public.prescriptions FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PRESCRIPTION_ITEMS POLICIES
CREATE POLICY "prescription_items_doctor_select" ON public.prescription_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.doctor_id = public.get_doctor_id_for_user(auth.uid()))
);
CREATE POLICY "prescription_items_doctor_manage" ON public.prescription_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.doctor_id = public.get_doctor_id_for_user(auth.uid()))
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.doctor_id = public.get_doctor_id_for_user(auth.uid()))
);
CREATE POLICY "prescription_items_pharmacist_select" ON public.prescription_items FOR SELECT USING (public.has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "prescription_items_admin" ON public.prescription_items FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PRESCRIPTION_REFILL_REQUESTS POLICIES
CREATE POLICY "prescription_refill_patient_select" ON public.prescription_refill_requests FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "prescription_refill_patient_insert" ON public.prescription_refill_requests FOR INSERT WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "prescription_refill_staff_select" ON public.prescription_refill_requests FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "prescription_refill_staff_update" ON public.prescription_refill_requests FOR UPDATE USING (
    public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'admin')
);

-- PRESCRIPTION_TEMPLATES POLICIES
CREATE POLICY "prescription_templates_doctor_select" ON public.prescription_templates FOR SELECT USING (
    is_global = true OR doctor_id = public.get_doctor_id_for_user(auth.uid())
);
CREATE POLICY "prescription_templates_doctor_manage" ON public.prescription_templates FOR ALL USING (
    doctor_id = public.get_doctor_id_for_user(auth.uid()) OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
    doctor_id = public.get_doctor_id_for_user(auth.uid()) OR public.has_role(auth.uid(), 'admin')
);

-- LAB_TESTS POLICIES
CREATE POLICY "lab_tests_patient_select" ON public.lab_tests FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "lab_tests_doctor_select" ON public.lab_tests FOR SELECT USING (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "lab_tests_doctor_insert" ON public.lab_tests FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') AND doctor_id = public.get_doctor_id_for_user(auth.uid())
);
CREATE POLICY "lab_tests_doctor_update" ON public.lab_tests FOR UPDATE USING (doctor_id = public.get_doctor_id_for_user(auth.uid())) WITH CHECK (doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "lab_tests_lab_select" ON public.lab_tests FOR SELECT USING (public.has_role(auth.uid(), 'lab_technician'));
CREATE POLICY "lab_tests_lab_update" ON public.lab_tests FOR UPDATE USING (public.has_role(auth.uid(), 'lab_technician')) WITH CHECK (public.has_role(auth.uid(), 'lab_technician'));
CREATE POLICY "lab_tests_nurse_select" ON public.lab_tests FOR SELECT USING (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "lab_tests_nurse_update" ON public.lab_tests FOR UPDATE USING (public.has_role(auth.uid(), 'nurse')) WITH CHECK (public.has_role(auth.uid(), 'nurse'));
CREATE POLICY "lab_tests_admin" ON public.lab_tests FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- REFERRALS POLICIES
CREATE POLICY "referrals_referring_doctor" ON public.referrals FOR ALL USING (referring_doctor_id = public.get_doctor_id_for_user(auth.uid())) WITH CHECK (referring_doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "referrals_receiving_doctor_select" ON public.referrals FOR SELECT USING (receiving_doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "referrals_receiving_doctor_update" ON public.referrals FOR UPDATE USING (receiving_doctor_id = public.get_doctor_id_for_user(auth.uid()));
CREATE POLICY "referrals_admin" ON public.referrals FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ROOMS POLICIES
CREATE POLICY "rooms_staff_select" ON public.rooms FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "rooms_admin" ON public.rooms FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ROOM_ASSIGNMENTS POLICIES
CREATE POLICY "room_assignments_staff_select" ON public.room_assignments FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "room_assignments_staff_manage" ON public.room_assignments FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'receptionist')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'receptionist')
);

-- INVENTORY POLICIES
CREATE POLICY "inventory_staff_select" ON public.inventory FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "inventory_pharmacist_insert" ON public.inventory FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "inventory_pharmacist_update" ON public.inventory FOR UPDATE USING (public.has_role(auth.uid(), 'pharmacist')) WITH CHECK (public.has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "inventory_admin" ON public.inventory FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PAYMENTS POLICIES
CREATE POLICY "payments_patient_select" ON public.payments FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "payments_staff_select" ON public.payments FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "payments_staff_manage" ON public.payments FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist')
);

-- INSURANCE_CLAIMS POLICIES
CREATE POLICY "insurance_claims_patient_select" ON public.insurance_claims FOR SELECT USING (patient_id = public.get_patient_id_for_user(auth.uid()));
CREATE POLICY "insurance_claims_doctor_select" ON public.insurance_claims FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') AND public.doctor_has_patient_relationship(public.get_doctor_id_for_user(auth.uid()), patient_id)
);
CREATE POLICY "insurance_claims_receptionist" ON public.insurance_claims FOR ALL USING (public.has_role(auth.uid(), 'receptionist')) WITH CHECK (public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "insurance_claims_admin" ON public.insurance_claims FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- INSURANCE_CLAIM_ITEMS POLICIES
CREATE POLICY "insurance_claim_items_patient_select" ON public.insurance_claim_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.patient_id = public.get_patient_id_for_user(auth.uid()))
);
CREATE POLICY "insurance_claim_items_doctor_select" ON public.insurance_claim_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND 
        public.has_role(auth.uid(), 'doctor') AND public.doctor_has_patient_relationship(public.get_doctor_id_for_user(auth.uid()), c.patient_id))
);
CREATE POLICY "insurance_claim_items_receptionist" ON public.insurance_claim_items FOR ALL USING (public.has_role(auth.uid(), 'receptionist')) WITH CHECK (public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "insurance_claim_items_admin" ON public.insurance_claim_items FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BLOOD_GROUPS POLICIES
CREATE POLICY "blood_groups_select" ON public.blood_groups FOR SELECT USING (true);
CREATE POLICY "blood_groups_admin" ON public.blood_groups FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BLOOD_STOCK POLICIES
CREATE POLICY "blood_stock_staff_select" ON public.blood_stock FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse') OR 
    public.has_role(auth.uid(), 'lab_technician') OR public.has_role(auth.uid(), 'doctor')
);
CREATE POLICY "blood_stock_lab_manage" ON public.blood_stock FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician')
);

-- DONORS POLICIES
CREATE POLICY "donors_staff_select" ON public.donors FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse') OR 
    public.has_role(auth.uid(), 'lab_technician') OR public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "donors_staff_insert" ON public.donors FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician') OR public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "donors_staff_update" ON public.donors FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician')
);
CREATE POLICY "donors_admin_delete" ON public.donors FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- BLOOD_ISSUES POLICIES
CREATE POLICY "blood_issues_staff_select" ON public.blood_issues FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse') OR 
    public.has_role(auth.uid(), 'lab_technician') OR public.has_role(auth.uid(), 'doctor')
);
CREATE POLICY "blood_issues_staff_insert" ON public.blood_issues FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "blood_issues_staff_update" ON public.blood_issues FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician')
);
CREATE POLICY "blood_issues_admin_delete" ON public.blood_issues FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- BLOOD_STOCK_TRANSACTIONS POLICIES
CREATE POLICY "blood_stock_transactions_staff_select" ON public.blood_stock_transactions FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse') OR 
    public.has_role(auth.uid(), 'lab_technician') OR public.has_role(auth.uid(), 'doctor')
);
CREATE POLICY "blood_stock_transactions_staff_insert" ON public.blood_stock_transactions FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'lab_technician')
);

-- OPERATION_THEATRES POLICIES
CREATE POLICY "operation_theatres_staff_select" ON public.operation_theatres FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "operation_theatres_admin" ON public.operation_theatres FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SURGERIES POLICIES
CREATE POLICY "surgeries_staff_select" ON public.surgeries FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "surgeries_doctor_manage" ON public.surgeries FOR ALL USING (
    doctor_id = public.get_doctor_id_for_user(auth.uid()) OR public.has_role(auth.uid(), 'admin')
) WITH CHECK (
    doctor_id = public.get_doctor_id_for_user(auth.uid()) OR public.has_role(auth.uid(), 'admin')
);

-- SURGERY_TEAM POLICIES
CREATE POLICY "surgery_team_staff_select" ON public.surgery_team FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "surgery_team_manage" ON public.surgery_team FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor')
);

-- POST_OPERATION POLICIES
CREATE POLICY "post_operation_staff_select" ON public.post_operation FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "post_operation_manage" ON public.post_operation FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'nurse')
);

-- SHIFT_HANDOVERS POLICIES
CREATE POLICY "shift_handovers_nurse_select" ON public.shift_handovers FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "shift_handovers_nurse_manage" ON public.shift_handovers FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse')
);

-- SHIFT_HANDOVER_PATIENTS POLICIES
CREATE POLICY "shift_handover_patients_nurse_select" ON public.shift_handover_patients FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "shift_handover_patients_nurse_manage" ON public.shift_handover_patients FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse')
);

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_own_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_own_delete" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notifications_system_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_admin" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- REMINDERS POLICIES
CREATE POLICY "reminders_own" ON public.reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminders_admin" ON public.reminders FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PHI_AUDIT_LOG POLICIES
CREATE POLICY "phi_audit_log_admin_select" ON public.phi_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "phi_audit_log_insert" ON public.phi_audit_log FOR INSERT WITH CHECK (true);

-- DIAGNOSIS_CODES POLICIES
CREATE POLICY "diagnosis_codes_select" ON public.diagnosis_codes FOR SELECT USING (true);
CREATE POLICY "diagnosis_codes_admin" ON public.diagnosis_codes FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROCEDURE_CODES POLICIES
CREATE POLICY "procedure_codes_select" ON public.procedure_codes FOR SELECT USING (true);
CREATE POLICY "procedure_codes_admin" ON public.procedure_codes FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DRUG_INTERACTIONS POLICIES
CREATE POLICY "drug_interactions_select" ON public.drug_interactions FOR SELECT USING (true);
CREATE POLICY "drug_interactions_admin" ON public.drug_interactions FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SUPPLIERS POLICIES
CREATE POLICY "suppliers_staff_select" ON public.suppliers FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
);
CREATE POLICY "suppliers_manage" ON public.suppliers FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
);

-- PURCHASE_ORDERS POLICIES
CREATE POLICY "purchase_orders_staff_select" ON public.purchase_orders FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
);
CREATE POLICY "purchase_orders_manage" ON public.purchase_orders FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
);

-- PURCHASE_ORDER_ITEMS POLICIES
CREATE POLICY "purchase_order_items_staff_select" ON public.purchase_order_items FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
);
CREATE POLICY "purchase_order_items_manage" ON public.purchase_order_items FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pharmacist')
);

-- ============================================================================
-- STEP 7: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_settings_category ON public.hospital_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_departments_status ON public.departments(status);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_department_id ON public.doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON public.doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_department_doctors_department ON public.department_doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_department_doctors_doctor ON public.department_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_nurses_department ON public.nurses(department);
CREATE INDEX IF NOT EXISTS idx_nurses_status ON public.nurses(status);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_day ON public.staff_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_department_id ON public.patients(department_id);
CREATE INDEX IF NOT EXISTS idx_patient_registration_queue_status ON public.patient_registration_queue(status);
CREATE INDEX IF NOT EXISTS idx_patient_messages_patient ON public.patient_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_doctor ON public.patient_messages(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient ON public.patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_recorded_at ON public.patient_vitals(recorded_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_patient ON public.appointment_waitlist(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_status ON public.appointment_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON public.medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON public.medical_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON public.prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_patient ON public.lab_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_doctor ON public.lab_tests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_status ON public.lab_tests(status);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON public.referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_doctor ON public.referrals(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_assignments_room ON public.room_assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_patient ON public.room_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON public.insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claim_items_claim ON public.insurance_claim_items(claim_id);
CREATE INDEX IF NOT EXISTS idx_blood_stock_group ON public.blood_stock(blood_group_id);
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON public.donors(blood_group_id);
CREATE INDEX IF NOT EXISTS idx_blood_issues_patient ON public.blood_issues(patient_id);
CREATE INDEX IF NOT EXISTS idx_blood_stock_transactions_group ON public.blood_stock_transactions(blood_group_id);
CREATE INDEX IF NOT EXISTS idx_surgeries_patient ON public.surgeries(patient_id);
CREATE INDEX IF NOT EXISTS idx_surgeries_doctor ON public.surgeries(doctor_id);
CREATE INDEX IF NOT EXISTS idx_surgeries_date ON public.surgeries(surgery_date);
CREATE INDEX IF NOT EXISTS idx_surgery_team_surgery ON public.surgery_team(surgery_id);
CREATE INDEX IF NOT EXISTS idx_post_operation_surgery ON public.post_operation(surgery_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_date ON public.shift_handovers(shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_handover_patients_handover ON public.shift_handover_patients(handover_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON public.reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_phi_audit_log_performed_by ON public.phi_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_phi_audit_log_table_name ON public.phi_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_phi_audit_log_patient_id ON public.phi_audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_phi_audit_log_created_at ON public.phi_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_code ON public.diagnosis_codes(code);
CREATE INDEX IF NOT EXISTS idx_procedure_codes_code ON public.procedure_codes(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order ON public.purchase_order_items(purchase_order_id);

-- ============================================================================
-- STEP 8: CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hospital_settings_updated_at BEFORE UPDATE ON public.hospital_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nurses_updated_at BEFORE UPDATE ON public.nurses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON public.staff_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patient_registration_queue_updated_at BEFORE UPDATE ON public.patient_registration_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patient_messages_updated_at BEFORE UPDATE ON public.patient_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patient_vitals_updated_at BEFORE UPDATE ON public.patient_vitals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointment_waitlist_updated_at BEFORE UPDATE ON public.appointment_waitlist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescription_items_updated_at BEFORE UPDATE ON public.prescription_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescription_refill_requests_updated_at BEFORE UPDATE ON public.prescription_refill_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescription_templates_updated_at BEFORE UPDATE ON public.prescription_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lab_tests_updated_at BEFORE UPDATE ON public.lab_tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_room_assignments_updated_at BEFORE UPDATE ON public.room_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blood_stock_updated_at BEFORE UPDATE ON public.blood_stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON public.donors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operation_theatres_updated_at BEFORE UPDATE ON public.operation_theatres FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surgeries_updated_at BEFORE UPDATE ON public.surgeries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_post_operation_updated_at BEFORE UPDATE ON public.post_operation FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shift_handovers_updated_at BEFORE UPDATE ON public.shift_handovers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 9: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Department foreign keys
ALTER TABLE public.departments ADD CONSTRAINT fk_departments_head FOREIGN KEY (department_head) REFERENCES public.doctors(id) ON DELETE SET NULL;
ALTER TABLE public.doctors ADD CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;
ALTER TABLE public.department_doctors ADD CONSTRAINT fk_department_doctors_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;
ALTER TABLE public.department_doctors ADD CONSTRAINT fk_department_doctors_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Patient foreign keys
ALTER TABLE public.patients ADD CONSTRAINT fk_patients_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;
ALTER TABLE public.patient_registration_queue ADD CONSTRAINT fk_patient_registration_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.patient_messages ADD CONSTRAINT fk_patient_messages_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.patient_messages ADD CONSTRAINT fk_patient_messages_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;
ALTER TABLE public.patient_vitals ADD CONSTRAINT fk_patient_vitals_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Appointment foreign keys
ALTER TABLE public.appointments ADD CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD CONSTRAINT fk_appointments_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;
ALTER TABLE public.appointment_waitlist ADD CONSTRAINT fk_appointment_waitlist_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_waitlist ADD CONSTRAINT fk_appointment_waitlist_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;
ALTER TABLE public.appointment_waitlist ADD CONSTRAINT fk_appointment_waitlist_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;

-- Medical records foreign keys
ALTER TABLE public.medical_records ADD CONSTRAINT fk_medical_records_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.medical_records ADD CONSTRAINT fk_medical_records_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Prescription foreign keys
ALTER TABLE public.prescriptions ADD CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.prescriptions ADD CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;
ALTER TABLE public.prescription_items ADD CONSTRAINT fk_prescription_items_prescription FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;
ALTER TABLE public.prescription_refill_requests ADD CONSTRAINT fk_refill_requests_prescription FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;
ALTER TABLE public.prescription_refill_requests ADD CONSTRAINT fk_refill_requests_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.prescription_templates ADD CONSTRAINT fk_prescription_templates_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;

-- Lab tests foreign keys
ALTER TABLE public.lab_tests ADD CONSTRAINT fk_lab_tests_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.lab_tests ADD CONSTRAINT fk_lab_tests_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Referrals foreign keys
ALTER TABLE public.referrals ADD CONSTRAINT fk_referrals_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.referrals ADD CONSTRAINT fk_referrals_referring_doctor FOREIGN KEY (referring_doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;
ALTER TABLE public.referrals ADD CONSTRAINT fk_referrals_receiving_doctor FOREIGN KEY (receiving_doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD CONSTRAINT fk_referrals_receiving_department FOREIGN KEY (receiving_department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;
ALTER TABLE public.referrals ADD CONSTRAINT fk_referrals_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

-- Room foreign keys
ALTER TABLE public.room_assignments ADD CONSTRAINT fk_room_assignments_room FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;
ALTER TABLE public.room_assignments ADD CONSTRAINT fk_room_assignments_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.room_assignments ADD CONSTRAINT fk_room_assignments_surgery FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id) ON DELETE SET NULL;

-- Inventory foreign keys
ALTER TABLE public.inventory ADD CONSTRAINT fk_inventory_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Payment foreign keys
ALTER TABLE public.payments ADD CONSTRAINT fk_payments_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Insurance claims foreign keys
ALTER TABLE public.insurance_claims ADD CONSTRAINT fk_insurance_claims_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.insurance_claims ADD CONSTRAINT fk_insurance_claims_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;
ALTER TABLE public.insurance_claim_items ADD CONSTRAINT fk_insurance_claim_items_claim FOREIGN KEY (claim_id) REFERENCES public.insurance_claims(id) ON DELETE CASCADE;

-- Blood bank foreign keys
ALTER TABLE public.blood_stock ADD CONSTRAINT fk_blood_stock_group FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id) ON DELETE CASCADE;
ALTER TABLE public.donors ADD CONSTRAINT fk_donors_blood_group FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id) ON DELETE CASCADE;
ALTER TABLE public.blood_issues ADD CONSTRAINT fk_blood_issues_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.blood_issues ADD CONSTRAINT fk_blood_issues_blood_group FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id) ON DELETE CASCADE;
ALTER TABLE public.blood_stock_transactions ADD CONSTRAINT fk_blood_transactions_blood_group FOREIGN KEY (blood_group_id) REFERENCES public.blood_groups(group_id) ON DELETE CASCADE;

-- Surgery foreign keys
ALTER TABLE public.surgeries ADD CONSTRAINT fk_surgeries_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.surgeries ADD CONSTRAINT fk_surgeries_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;
ALTER TABLE public.surgeries ADD CONSTRAINT fk_surgeries_ot FOREIGN KEY (ot_id) REFERENCES public.operation_theatres(id) ON DELETE CASCADE;
ALTER TABLE public.surgery_team ADD CONSTRAINT fk_surgery_team_surgery FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id) ON DELETE CASCADE;
ALTER TABLE public.post_operation ADD CONSTRAINT fk_post_operation_surgery FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id) ON DELETE CASCADE;

-- Shift handover foreign keys
ALTER TABLE public.shift_handover_patients ADD CONSTRAINT fk_shift_handover_patients_handover FOREIGN KEY (handover_id) REFERENCES public.shift_handovers(id) ON DELETE CASCADE;
ALTER TABLE public.shift_handover_patients ADD CONSTRAINT fk_shift_handover_patients_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Purchase order foreign keys
ALTER TABLE public.purchase_orders ADD CONSTRAINT fk_purchase_orders_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT fk_purchase_order_items_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT fk_purchase_order_items_inventory FOREIGN KEY (inventory_item_id) REFERENCES public.inventory(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 10: SEED DATA
-- ============================================================================

-- Insert blood groups
INSERT INTO public.blood_groups (group_name) VALUES
    ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')
ON CONFLICT (group_name) DO NOTHING;

-- ============================================================================
-- STEP 11: USER REGISTRATION HANDLER (for Supabase Auth)
-- ============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role public.app_role;
    _first_name TEXT;
    _last_name TEXT;
BEGIN
    -- Extract role from metadata (default to patient)
    _role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::public.app_role,
        'patient'::public.app_role
    );
    
    _first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    _last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

    -- Create profile
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (NEW.id, _first_name, _last_name);

    -- Create user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role);

    -- If patient role, create patient record
    IF _role = 'patient' THEN
        INSERT INTO public.patients (
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            user_id,
            status
        )
        VALUES (
            _first_name,
            _last_name,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
            COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'),
            COALESCE(NEW.raw_user_meta_data->>'gender', 'Other'),
            NEW.id,
            'active'
        );
    END IF;

    -- If doctor role, create doctor record
    IF _role = 'doctor' THEN
        INSERT INTO public.doctors (
            first_name,
            last_name,
            email,
            phone,
            specialization,
            license_number,
            department,
            user_id,
            status
        )
        VALUES (
            _first_name,
            _last_name,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
            COALESCE(NEW.raw_user_meta_data->>'specialization', 'General'),
            COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING'),
            COALESCE(NEW.raw_user_meta_data->>'department', NULL),
            NEW.id,
            'active'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger for new user registration (only create if auth.users exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ============================================================================
-- DATABASE SCHEMA SUMMARY v2.3
-- ============================================================================
/*
================================================================================
              HOSPITAL MANAGEMENT SYSTEM DATABASE v2.3 (January 2026)
================================================================================

TABLES (45+ Tables):
====================
- User Management: profiles, user_roles, user_settings, hospital_settings
- Department & Staff: departments, doctors, department_doctors, nurses, staff_schedules
- Patient Management: patients, patient_registration_queue, patient_messages, patient_vitals
- Clinical: appointments, appointment_waitlist, medical_records, prescriptions, 
           prescription_items, prescription_refill_requests, prescription_templates, 
           lab_tests, referrals
- Facility: rooms, room_assignments, inventory
- Financial: payments, insurance_claims, insurance_claim_items
- Blood Bank: blood_groups, blood_stock, donors, blood_issues, blood_stock_transactions
- Operations: operation_theatres, surgeries, surgery_team, post_operation
- Shift Handover: shift_handovers, shift_handover_patients
- Notifications: notifications, reminders
- Audit: phi_audit_log
- Clinical Codes: diagnosis_codes, procedure_codes, drug_interactions
- Supply Chain: suppliers, purchase_orders, purchase_order_items

USER ROLES (7):
===============
admin, doctor, nurse, pharmacist, receptionist, patient, lab_technician

FEATURES:
=========
✓ Row Level Security (RLS) on all tables
✓ Role-based access control
✓ HIPAA-compliant PHI audit logging
✓ Automatic profile/role creation on signup
✓ Soft delete support for critical tables
✓ Comprehensive foreign key constraints
✓ Performance indexes on all key columns

EXECUTION ORDER:
================
This schema executes in the correct order:
1. Extensions
2. Custom types (app_role enum)
3. Helper functions (has_role, get_patient_id_for_user, etc.)
4. All tables (without RLS)
5. Enable RLS on all tables
6. Create RLS policies (now safe since functions exist)
7. Create indexes
8. Create triggers
9. Add foreign key constraints
10. Seed data
11. User registration handler

================================================================================
                              END OF SCHEMA v2.3
================================================================================
*/
