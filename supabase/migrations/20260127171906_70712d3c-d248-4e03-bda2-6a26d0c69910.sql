-- Insert demo departments (only if they don't exist)
INSERT INTO departments (department_name, description, status)
SELECT 'Cardiology', 'Heart and cardiovascular care', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Cardiology');

INSERT INTO departments (department_name, description, status)
SELECT 'Orthopedics', 'Bone, joint, and muscle care', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Orthopedics');

INSERT INTO departments (department_name, description, status)
SELECT 'Pediatrics', 'Child and infant healthcare', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Pediatrics');

INSERT INTO departments (department_name, description, status)
SELECT 'Neurology', 'Brain and nervous system care', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Neurology');

INSERT INTO departments (department_name, description, status)
SELECT 'General Medicine', 'Primary care and internal medicine', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'General Medicine');

INSERT INTO departments (department_name, description, status)
SELECT 'Dermatology', 'Skin, hair, and nail care', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Dermatology');

INSERT INTO departments (department_name, description, status)
SELECT 'Gynecology', 'Women''s reproductive health', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Gynecology');

INSERT INTO departments (department_name, description, status)
SELECT 'ENT', 'Ear, nose, and throat care', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'ENT');

INSERT INTO departments (department_name, description, status)
SELECT 'Ophthalmology', 'Eye and vision care', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Ophthalmology');

INSERT INTO departments (department_name, description, status)
SELECT 'Psychiatry', 'Mental health and behavioral care', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Psychiatry');

-- Now update doctors with their correct department_id
UPDATE doctors d
SET department_id = dep.department_id
FROM departments dep
WHERE d.department = dep.department_name
AND d.department_id IS NULL;