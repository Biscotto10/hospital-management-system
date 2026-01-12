-- Hospital Management System Database
CREATE DATABASE IF NOT EXISTS hms;
USE hms;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'patient', 'staff') DEFAULT 'patient',
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    blood_group VARCHAR(5),
    allergies TEXT,
    medical_history TEXT,
    emergency_contact VARCHAR(100),
    insurance_number VARCHAR(50),
    insurance_provider VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments Table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    department VARCHAR(100),
    reason TEXT,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Insert sample data
INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES
('admin@hms.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', '+1234567890'),
('doctor@hms.com', '$2b$10$YourHashedPasswordHere', 'John', 'Smith', 'doctor', '+1234567891'),
('patient@hms.com', '$2b$10$YourHashedPasswordHere', 'Jane', 'Doe', 'patient', '+1234567892');

INSERT INTO patients (user_id, blood_group, allergies) VALUES
(3, 'O+', 'Peanuts, Penicillin');

-- Medical Records Table
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT,
    visit_date DATE NOT NULL,
    diagnosis TEXT,
    symptoms TEXT,
    treatment TEXT,
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT,
    medication_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    refills INT DEFAULT 0,
    instructions TEXT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Laboratory Tests Table
CREATE TABLE lab_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT,
    test_name VARCHAR(100) NOT NULL,
    test_type ENUM('blood', 'urine', 'imaging', 'biopsy', 'other') NOT NULL,
    ordered_date DATE NOT NULL,
    test_date DATE,
    results TEXT,
    result_date DATE,
    status ENUM('ordered', 'in-progress', 'completed', 'cancelled') DEFAULT 'ordered',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Billing/Invoices Table (US Healthcare System)
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    appointment_id INT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    insurance_covered DECIMAL(10,2) DEFAULT 0,
    patient_responsibility DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    billing_codes TEXT, -- CPT, ICD-10 codes
    insurance_provider VARCHAR(100),
    insurance_claim_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Payments Table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    patient_id INT NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'cash', 'check', 'insurance') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

-- Insurance Information Table (US Specific)
CREATE TABLE insurance_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL UNIQUE,
    provider_name VARCHAR(100) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    group_number VARCHAR(100),
    member_id VARCHAR(100) NOT NULL,
    plan_type ENUM('hmo', 'ppo', 'epo', 'pos', 'medicare', 'medicaid', 'other') NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    copay_amount DECIMAL(10,2),
    deductible DECIMAL(10,2),
    coinsurance_percentage DECIMAL(5,2),
    out_of_pocket_max DECIMAL(10,2),
    primary_insured_name VARCHAR(100),
    relationship_to_patient ENUM('self', 'spouse', 'parent', 'child', 'other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data for patient dashboard
INSERT INTO medical_records (patient_id, doctor_id, visit_date, diagnosis, symptoms, treatment, follow_up_date) VALUES
(3, 2, '2024-01-15', 'Hypertension Stage 1', 'High blood pressure, headaches', 'Lisinopril 10mg daily, reduce sodium intake', '2024-02-15'),
(3, 2, '2024-02-10', 'Type 2 Diabetes', 'Increased thirst, frequent urination', 'Metformin 500mg twice daily, diet control', '2024-03-10');

INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, frequency, start_date, end_date, refills, instructions) VALUES
(3, 2, 'Lisinopril', '10mg', 'Once daily', '2024-01-15', '2024-07-15', 5, 'Take in the morning, with or without food'),
(3, 2, 'Metformin', '500mg', 'Twice daily', '2024-02-10', '2024-08-10', 3, 'Take with meals to reduce stomach upset');

INSERT INTO lab_tests (patient_id, doctor_id, test_name, test_type, ordered_date, test_date, results, result_date, status) VALUES
(3, 2, 'Complete Blood Count', 'blood', '2024-01-15', '2024-01-16', 'Normal ranges. WBC: 7.2, RBC: 4.8, HGB: 14.2', '2024-01-18', 'completed'),
(3, 2, 'Lipid Panel', 'blood', '2024-02-10', '2024-02-12', 'Total Cholesterol: 210, HDL: 45, LDL: 140, Triglycerides: 180', '2024-02-14', 'completed'),
(3, 2, 'Hemoglobin A1C', 'blood', '2024-02-10', NULL, NULL, NULL, 'ordered');

INSERT INTO invoices (patient_id, appointment_id, invoice_number, invoice_date, due_date, total_amount, insurance_covered, patient_responsibility, paid_amount, balance_due, status, billing_codes, insurance_provider) VALUES
(3, 1, 'INV-2024-001', '2024-01-16', '2024-02-16', 350.00, 280.00, 70.00, 70.00, 0.00, 'paid', '99213, I10', 'Blue Cross Blue Shield'),
(3, 2, 'INV-2024-002', '2024-02-11', '2024-03-11', 520.00, 416.00, 104.00, 50.00, 54.00, 'partial', '99214, E11, 83036', 'Blue Cross Blue Shield'),
(3, NULL, 'INV-2024-003', '2024-02-20', '2024-03-20', 150.00, 120.00, 30.00, 0.00, 30.00, 'pending', '80053, 84478', 'Blue Cross Blue Shield');

INSERT INTO payments (invoice_id, patient_id, payment_method, amount, payment_date, transaction_id) VALUES
(1, 3, 'credit_card', 70.00, '2024-01-20', 'TXN-001'),
(2, 3, 'debit_card', 50.00, '2024-02-15', 'TXN-002');

INSERT INTO insurance_info (patient_id, provider_name, policy_number, group_number, member_id, plan_type, effective_date, expiration_date, copay_amount, deductible, coinsurance_percentage, out_of_pocket_max) VALUES
(3, 'Blue Cross Blue Shield', 'P123456789', 'GRP-98765', 'M-12345-01', 'ppo', '2024-01-01', '2024-12-31', 25.00, 1500.00, 20.00, 5000.00);

-- Staff-specific Tables

-- Staff Schedule Table
CREATE TABLE staff_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type ENUM('morning', 'afternoon', 'night', 'custom') DEFAULT 'morning',
    department VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Staff Tasks/Todo Table
CREATE TABLE staff_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
    due_date DATE,
    assigned_by INT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Patient Admission Table
CREATE TABLE admissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    admission_date DATETIME NOT NULL,
    discharge_date DATETIME,
    room_number VARCHAR(20),
    bed_number VARCHAR(10),
    admission_type ENUM('emergency', 'scheduled', 'transfer') DEFAULT 'scheduled',
    diagnosis TEXT,
    attending_doctor INT,
    admission_notes TEXT,
    discharge_summary TEXT,
    status ENUM('admitted', 'discharged', 'transferred') DEFAULT 'admitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attending_doctor) REFERENCES users(id)
);

-- Inventory/Supplies Table
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(200) NOT NULL,
    item_type ENUM('medication', 'equipment', 'supply', 'other') NOT NULL,
    category VARCHAR(100),
    quantity INT DEFAULT 0,
    unit VARCHAR(20),
    reorder_level INT DEFAULT 10,
    supplier VARCHAR(200),
    location VARCHAR(100),
    last_restocked DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Transactions Table
CREATE TABLE inventory_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    transaction_type ENUM('add', 'remove', 'adjust', 'transfer') NOT NULL,
    quantity INT NOT NULL,
    staff_id INT NOT NULL,
    reference VARCHAR(100),
    notes TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(id)
);

-- Messaging/Notifications System
CREATE TABLE staff_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    priority ENUM('normal', 'important', 'urgent') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Department Table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    head_doctor INT,
    location VARCHAR(100),
    phone_extension VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (head_doctor) REFERENCES users(id)
);

-- Insert sample data for staff dashboard
INSERT INTO departments (name, description, location) VALUES
('Emergency', 'Emergency Medicine Department', 'Ground Floor, Wing A'),
('Cardiology', 'Heart and Cardiovascular Care', 'First Floor, Wing B'),
('Pediatrics', 'Child Healthcare Services', 'Second Floor, Wing C'),
('Radiology', 'Imaging and Diagnostic Services', 'Basement, Wing D'),
('Pharmacy', 'Medication Dispensing', 'Ground Floor, Main Building');

INSERT INTO inventory (item_name, item_type, category, quantity, unit, reorder_level, location) VALUES
('Paracetamol 500mg', 'medication', 'Pain Relief', 500, 'tablets', 100, 'Pharmacy - Shelf A1'),
('Surgical Masks', 'supply', 'PPE', 1000, 'pieces', 200, 'Store Room - Box 1'),
('IV Drip Sets', 'equipment', 'IV Supplies', 150, 'sets', 30, 'Store Room - Rack 3'),
('Blood Pressure Monitor', 'equipment', 'Diagnostic', 25, 'units', 5, 'Equipment Room - Shelf B2'),
('Antibiotic Ointment', 'medication', 'Wound Care', 80, 'tubes', 20, 'Pharmacy - Shelf C3');

INSERT INTO admissions (patient_id, admission_date, room_number, bed_number, admission_type, diagnosis, attending_doctor, status) VALUES
(3, '2024-03-01 10:30:00', '301', 'A', 'scheduled', 'Hypertension monitoring', 2, 'admitted');

INSERT INTO staff_schedules (staff_id, schedule_date, start_time, end_time, shift_type, department) VALUES
(1, '2024-03-15', '08:00:00', '16:00:00', 'morning', 'Administration'),
(1, '2024-03-16', '08:00:00', '16:00:00', 'morning', 'Administration'),
(1, '2024-03-17', '16:00:00', '00:00:00', 'afternoon', 'Administration');

INSERT INTO staff_tasks (staff_id, title, description, priority, status, due_date) VALUES
(1, 'Process patient admissions', 'Check and process new patient admissions for today', 'high', 'pending', '2024-03-15'),
(1, 'Update inventory records', 'Update medication stock levels in system', 'medium', 'in-progress', '2024-03-16'),
(1, 'Schedule appointments', 'Schedule appointments for next week', 'medium', 'pending', '2024-03-17');

-- Insert a staff user
INSERT INTO users (email, password, first_name, last_name, role, phone, department) VALUES
('staff@hms.com', '$2b$10$YourHashedPasswordHere', 'Emily', 'Johnson', 'staff', '+1234567893', 'Administration');

-- Admin-specific Tables

-- System Logs/Audit Trail
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- System Settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Backup Records
CREATE TABLE backup_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    backup_type ENUM('full', 'incremental', 'database', 'files') NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    status ENUM('pending', 'in-progress', 'completed', 'failed') DEFAULT 'pending',
    notes TEXT,
    created_by INT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- User Activity Tracking
CREATE TABLE user_activity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Role Permissions
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_role_module (role, module)
);

-- Email Templates
CREATE TABLE email_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) UNIQUE NOT NULL,
    template_subject VARCHAR(200) NOT NULL,
    template_body TEXT NOT NULL,
    variables TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- API Keys for External Integrations
CREATE TABLE api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    secret_key VARCHAR(255),
    permissions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at DATE,
    last_used TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Notification Templates
CREATE TABLE notification_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('email', 'sms', 'push', 'in-app') NOT NULL,
    subject VARCHAR(200),
    content TEXT NOT NULL,
    variables TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('hospital_name', 'General Hospital', 'string', 'general', 'Name of the hospital', TRUE),
('hospital_address', '123 Medical Center Dr, Anytown, USA', 'string', 'general', 'Hospital address', TRUE),
('hospital_phone', '(555) 123-4567', 'string', 'general', 'Main hospital phone', TRUE),
('hospital_email', 'info@hospital.com', 'string', 'general', 'Main hospital email', TRUE),
('system_timezone', 'America/New_York', 'string', 'general', 'System timezone', FALSE),
('date_format', 'MM/DD/YYYY', 'string', 'general', 'Date display format', TRUE),
('time_format', '12h', 'string', 'general', 'Time display format', TRUE),
('currency', 'USD', 'string', 'billing', 'Default currency', TRUE),
('currency_symbol', '$', 'string', 'billing', 'Currency symbol', TRUE),
('auto_backup', 'true', 'boolean', 'backup', 'Enable automatic backups', FALSE),
('backup_frequency', 'daily', 'string', 'backup', 'Backup frequency', FALSE),
('session_timeout', '30', 'number', 'security', 'Session timeout in minutes', FALSE),
('password_policy', '{"min_length":8,"require_uppercase":true,"require_lowercase":true,"require_numbers":true,"require_special":false}', 'json', 'security', 'Password policy settings', FALSE),
('login_attempts', '5', 'number', 'security', 'Max login attempts before lockout', FALSE),
('lockout_duration', '15', 'number', 'security', 'Lockout duration in minutes', FALSE),
('maintenance_mode', 'false', 'boolean', 'system', 'Maintenance mode status', TRUE);

-- Insert default role permissions
INSERT INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete, can_export) VALUES
('admin', 'dashboard', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'users', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'patients', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'doctors', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'appointments', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'medical_records', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'billing', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'inventory', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'reports', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin', 'settings', TRUE, TRUE, TRUE, TRUE, TRUE),
('doctor', 'dashboard', TRUE, FALSE, FALSE, FALSE, FALSE),
('doctor', 'patients', TRUE, TRUE, TRUE, FALSE, TRUE),
('doctor', 'appointments', TRUE, TRUE, TRUE, FALSE, TRUE),
('doctor', 'medical_records', TRUE, TRUE, TRUE, FALSE, TRUE),
('staff', 'dashboard', TRUE, FALSE, FALSE, FALSE, FALSE),
('staff', 'patients', TRUE, TRUE, TRUE, FALSE, TRUE),
('staff', 'appointments', TRUE, TRUE, TRUE, FALSE, TRUE),
('staff', 'inventory', TRUE, TRUE, TRUE, FALSE, TRUE),
('patient', 'dashboard', TRUE, FALSE, FALSE, FALSE, FALSE),
('patient', 'appointments', TRUE, TRUE, FALSE, FALSE, FALSE),
('patient', 'medical_records', TRUE, FALSE, FALSE, FALSE, TRUE),
('patient', 'billing', TRUE, FALSE, FALSE, FALSE, TRUE);

-- Insert default email templates
INSERT INTO email_templates (template_name, template_subject, template_body, variables, is_active) VALUES
('welcome_email', 'Welcome to Hospital Management System', '<h2>Welcome {{patient_name}}!</h2><p>Your account has been created successfully.</p><p>Your login credentials:</p><ul><li>Email: {{email}}</li><li>Password: {{password}}</li></ul><p>Please change your password after first login.</p>', '["patient_name","email","password"]', TRUE),
('appointment_confirmation', 'Appointment Confirmation - {{hospital_name}}', '<h2>Appointment Confirmed</h2><p>Dear {{patient_name}},</p><p>Your appointment has been confirmed:</p><ul><li>Date: {{appointment_date}}</li><li>Time: {{appointment_time}}</li><li>Doctor: {{doctor_name}}</li><li>Department: {{department}}</li></ul><p>Please arrive 15 minutes before your appointment time.</p>', '["patient_name","appointment_date","appointment_time","doctor_name","department","hospital_name"]', TRUE),
('password_reset', 'Password Reset Request', '<h2>Password Reset</h2><p>Click the link below to reset your password:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>This link will expire in 24 hours.</p>', '["reset_link"]', TRUE),
('invoice_notification', 'New Invoice - {{hospital_name}}', '<h2>Invoice Generated</h2><p>Dear {{patient_name}},</p><p>A new invoice has been generated for your recent visit.</p><ul><li>Invoice Number: {{invoice_number}}</li><li>Amount Due: {{amount_due}}</li><li>Due Date: {{due_date}}</li></ul><p>Please login to your account to view and pay the invoice.</p>', '["patient_name","invoice_number","amount_due","due_date","hospital_name"]', TRUE);

-- Insert notification templates
INSERT INTO notification_templates (name, type, subject, content, variables, is_active) VALUES
('new_appointment', 'in-app', 'New Appointment', 'New appointment scheduled with {{doctor_name}} on {{appointment_date}} at {{appointment_time}}', '["doctor_name","appointment_date","appointment_time"]', TRUE),
('lab_results', 'in-app', 'Lab Results Available', 'Your lab test results are now available for review', '[]', TRUE),
('payment_received', 'in-app', 'Payment Received', 'Payment of {{amount}} received for invoice {{invoice_number}}', '["amount","invoice_number"]', TRUE),
('system_alert', 'in-app', 'System Alert', '{{alert_message}}', '["alert_message"]', TRUE);

-- Insert sample system logs
INSERT INTO system_logs (user_id, action, table_name, record_id, ip_address) VALUES
(1, 'login', 'users', 1, '192.168.1.1'),
(1, 'create', 'users', 3, '192.168.1.1'),
(2, 'login', 'users', 2, '192.168.1.2'),
(1, 'update', 'system_settings', 1, '192.168.1.1');

-- Insert sample user activity
INSERT INTO user_activity (user_id, activity_type, activity_details, ip_address) VALUES
(1, 'login', 'User logged in successfully', '192.168.1.1'),
(1, 'user_create', 'Created new patient user', '192.168.1.1'),
(1, 'settings_update', 'Updated hospital name', '192.168.1.1'),
(2, 'login', 'User logged in successfully', '192.168.1.2'),
(3, 'login', 'User logged in successfully', '192.168.1.3');

-- Create admin user if not exists
INSERT INTO users (email, password, first_name, last_name, role, phone, department) 
SELECT 'admin@hms.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', '+1234567890', 'Administration'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@hms.com');