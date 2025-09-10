-- Clear all existing data and add sample real-world entries

-- First, clear all existing data from all tables
DELETE FROM prescriptions;
DELETE FROM medical_records;
DELETE FROM lab_tests;
DELETE FROM appointments;
DELETE FROM payments;
DELETE FROM inventory;
DELETE FROM rooms;
DELETE FROM nurses;
DELETE FROM doctors;
DELETE FROM patients;

-- Insert two sample doctors
INSERT INTO doctors (first_name, last_name, specialization, license_number, phone, email, department, years_of_experience, consultation_fee, status) VALUES
('Sarah', 'Johnson', 'Cardiology', 'MD-2024-001', '+1-555-0101', 'sarah.johnson@hospital.com', 'Cardiology', 15, 250.00, 'active'),
('Michael', 'Chen', 'Pediatrics', 'MD-2024-002', '+1-555-0102', 'michael.chen@hospital.com', 'Pediatrics', 8, 180.00, 'active');

-- Insert two sample patients  
INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address, blood_type, status) VALUES
('Emma', 'Wilson', '1985-03-15', 'Female', '+1-555-0201', 'emma.wilson@email.com', '123 Oak Street, Springfield, IL 62701', 'A+', 'active'),
('James', 'Brown', '1978-11-22', 'Male', '+1-555-0202', 'james.brown@email.com', '456 Pine Avenue, Springfield, IL 62702', 'O-', 'active');

-- Insert a sample nurse
INSERT INTO nurses (first_name, last_name, license_number, phone, email, department, shift_schedule, years_of_experience, status) VALUES
('Lisa', 'Martinez', 'RN-2024-001', '+1-555-0301', 'lisa.martinez@hospital.com', 'Emergency', 'Day Shift', 12, 'active');

-- Insert sample inventory items
INSERT INTO inventory (item_name, category, current_stock, minimum_stock, maximum_stock, unit_price, supplier, status) VALUES
('Acetaminophen 500mg', 'Medication', 150, 50, 500, 0.25, 'MedSupply Co.', 'available'),
('Digital Thermometer', 'Equipment', 25, 10, 50, 15.99, 'MedTech Inc.', 'available');

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type, capacity, floor, department, daily_rate, status) VALUES
('101', 'Standard', 1, 1, 'General', 200.00, 'available'),
('205', 'ICU', 1, 2, 'Critical Care', 500.00, 'available');