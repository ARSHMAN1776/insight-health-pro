# Hospital Management System (HMS)
## Complete Project Guide & Feature Documentation

**Version:** 3.0  
**Last Updated:** January 2026  
**Technology Stack:** React 18, TypeScript, Vite, Tailwind CSS, Supabase, shadcn/ui

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [User Roles & Access Control](#2-user-roles--access-control)
3. [Authentication System](#3-authentication-system)
4. [Dashboard Module](#4-dashboard-module)
5. [Patient Management](#5-patient-management)
6. [Appointment System](#6-appointment-system)
7. [Queue Management System](#7-queue-management-system)
8. [Medical Records](#8-medical-records)
9. [Prescription Management](#9-prescription-management)
10. [Laboratory Module](#10-laboratory-module)
11. [Pharmacy Module](#11-pharmacy-module)
12. [Blood Bank Module](#12-blood-bank-module)
13. [Operation Theatre Module](#13-operation-theatre-module)
14. [Insurance Claims](#14-insurance-claims)
15. [Billing & Payments](#15-billing--payments)
16. [Inventory Management](#16-inventory-management)
17. [Staff Management](#17-staff-management)
18. [Department Management](#18-department-management)
19. [Room & Bed Management](#19-room--bed-management)
20. [Notification System](#20-notification-system)
21. [Patient Portal](#21-patient-portal)
22. [Reports & Analytics](#22-reports--analytics)
23. [Settings & Configuration](#23-settings--configuration)
24. [Security Features](#24-security-features)
25. [Database Architecture](#25-database-architecture)

---

## 1. Project Overview

### What is HMS?

The Hospital Management System (HMS) is a comprehensive, web-based healthcare administration platform designed to streamline hospital operations. It provides end-to-end management of patients, staff, appointments, medical records, pharmacy, laboratory, blood bank, and financial operations.

### Key Capabilities

| Area | Features |
|------|----------|
| **Patient Care** | Registration, medical records, prescriptions, lab tests, vitals tracking |
| **Operations** | Appointments, queue management, surgery scheduling, bed management |
| **Clinical** | Prescription templates, drug interactions, diagnosis codes, FHIR export |
| **Financial** | Billing, payments, insurance claims, pharmacy billing |
| **Resources** | Inventory, blood bank, operation theatres, staff scheduling |
| **Communication** | Notifications, patient messaging, shift handovers |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │    Hooks            │  │
│  │  (Routes)   │  │  (UI/Logic) │  │ (State Management)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Supabase Client
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL │  │    Auth     │  │   Edge Functions    │  │
│  │  Database   │  │   System    │  │  (Email, Cron)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │     RLS     │  │   Storage   │  │    Realtime         │  │
│  │  Policies   │  │  (Reports)  │  │  Subscriptions      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. User Roles & Access Control

### Available Roles

| Role | Description | Primary Functions |
|------|-------------|-------------------|
| **Admin** | System administrator | Full access to all modules, user management, settings |
| **Doctor** | Medical practitioner | Patient consultations, prescriptions, medical records |
| **Nurse** | Nursing staff | Vitals recording, patient care, shift handovers |
| **Receptionist** | Front desk staff | Patient registration, appointments, queue management |
| **Lab Technician** | Laboratory staff | Lab test processing, report uploads |
| **Pharmacist** | Pharmacy staff | Prescription dispensing, inventory, billing |
| **Patient** | Registered patient | View own records, book appointments, message doctors |

### Access Matrix

| Module | Admin | Doctor | Nurse | Receptionist | Lab Tech | Pharmacist | Patient |
|--------|:-----:|:------:|:-----:|:------------:|:--------:|:----------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patient Registry | Full | View | View | Full | View | View | Own |
| Appointments | Full | Own | View | Full | ❌ | ❌ | Own |
| Queue Management | Full | Own | View | Full | ❌ | ❌ | Own |
| Medical Records | Full | Own Patients | View | ❌ | ❌ | ❌ | Own |
| Prescriptions | Full | Create/Edit | View | View | ❌ | View | Own |
| Lab Tests | Full | Order | ❌ | ❌ | Full | ❌ | Own |
| Pharmacy | Full | ❌ | ❌ | ❌ | ❌ | Full | ❌ |
| Blood Bank | Full | Request | ❌ | ❌ | Full | ❌ | ❌ |
| Surgery | Full | Schedule | Assist | ❌ | ❌ | ❌ | Own |
| Insurance Claims | Full | Create | ❌ | Create | ❌ | ❌ | Own |
| Billing | Full | ❌ | ❌ | Create | ❌ | ❌ | Own |
| Inventory | Full | ❌ | ❌ | ❌ | ❌ | Full | ❌ |
| Staff Management | Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | Full | Own | Own | Own | Own | Own | Own |

---

## 3. Authentication System

### Registration Flow

#### Patient Self-Registration
1. Patient visits `/login` and clicks "Register"
2. Fills registration form with personal info
3. System creates auth user, profile, and patient record
4. Staff verifies patient, status changes to `active`

#### Staff Registration (Admin Only)
1. Admin navigates to Staff Management
2. Fills role-specific form with license details
3. System creates user with appropriate role
4. Staff receives login credentials

### Session Management
- Sessions persist via Supabase Auth tokens
- Auto-refresh on page load
- Session timeout after 24 hours of inactivity
- Secure logout clears all tokens

---

## 4. Dashboard Module

Each role has a customized dashboard showing relevant information:

| Role | Key Widgets |
|------|-------------|
| **Admin** | Pending verifications, staff overview, department stats |
| **Doctor** | Queue management, today's appointments, pending lab results |
| **Nurse** | Assigned patients, vitals pending, shift info |
| **Receptionist** | Queue control, today's appointments, check-in stats |
| **Lab Technician** | Pending tests, completed today, urgent tests |
| **Pharmacist** | Pending prescriptions, low stock alerts, today's sales |
| **Patient** | Queue position, upcoming appointments, active prescriptions |

---

## 5. Patient Management

### Features
- Patient registration with comprehensive data collection
- ID card generation with QR codes for verification
- Medical history tracking
- Insurance information management
- Emergency contact storage

### Verification System
- QR code verification at `/verify-patient?patientId=xxx`
- Displays patient info, blood type, allergies, emergency contact

---

## 6. Appointment System

### Features
- Real-time slot availability checking
- Department and doctor selection
- Appointment types (Consultation, Follow-up, Emergency, Procedure)
- Duration-based scheduling
- Cancellation with reason tracking
- Email reminders via Edge Functions

### Waitlist System
- Priority levels (Low, Normal, High, Urgent)
- Preferred date range and time slots
- Automatic notification when slots become available

---

## 7. Queue Management System

### Token System
- Configurable token prefixes per doctor/department
- Priority levels (Normal, Urgent, VIP)
- Real-time position tracking

### Interfaces
- **Receptionist Queue Control**: Check-in, token assignment
- **Doctor Queue View**: Call next, skip, mark complete
- **Patient Queue Status**: Position, estimated wait time
- **Waiting Room Display**: Public display of current tokens

---

## 8. Medical Records

### Features
- Visit history with symptoms, diagnosis, treatment
- ICD-10 diagnosis code picker
- CPT procedure code selection
- FHIR export for interoperability
- Follow-up date scheduling

---

## 9. Prescription Management

### Features
- Medication entry with dosage, frequency, duration
- Drug interaction checker
- Prescription templates for common conditions
- QR code verification at `/verify-prescription?prescriptionId=xxx`
- Expiry tracking

### Refill System
- Patient-initiated refill requests
- Doctor approval workflow
- Status tracking (Pending, Approved, Rejected)

---

## 10. Laboratory Module

### Workflow
1. Doctor orders test with priority level
2. Lab technician receives order
3. Sample collection and processing
4. Results entry with normal range comparison
5. Automatic abnormal flagging
6. Report upload (image/PDF)
7. Email notification to patient

### Verification
- QR code verification at `/verify-lab-report?reportId=xxx`

---

## 11. Pharmacy Module

### Features
- Prescription queue management
- Medication dispensing workflow
- Bill generation with tax/discount
- Inventory deduction on dispense
- Payment processing

---

## 12. Blood Bank Module

### Components
- **Blood Groups Management**: Configure available blood types
- **Donor Management**: Donor registration, eligibility tracking
- **Blood Stock**: Current inventory levels
- **Donation Records**: Track all donations
- **Blood Issues**: Patient blood requests and issuance
- **Transfusion Records**: Post-transfusion documentation
- **Compatibility Checker**: ABO/Rh matching

---

## 13. Operation Theatre Module

### Components
- **Operation Theatres**: Room management, equipment tracking
- **Surgery Scheduler**: Date, time, OT, team assignment
- **Surgery Team**: Surgeon, assistants, anesthetist, nurses
- **Surgical Consent Form**: Digital consent with signature
- **Post-Operation Records**: Complications, recovery notes, follow-up

---

## 14. Insurance Claims

### Features
- Claim creation with diagnosis/procedure codes
- Item-level billing
- Status workflow (Draft → Submitted → Processing → Approved/Denied)
- Appeal tracking
- EOB documentation

---

## 15. Billing & Payments

### Features
- Invoice generation
- Multiple payment methods (Cash, Card, Insurance, UPI)
- Payment status tracking
- Receipt generation

---

## 16. Inventory Management

### Features
- Item tracking with batch numbers
- Expiry date monitoring
- Reorder point alerts
- Supplier management
- Purchase order workflow
- Stock level optimization

---

## 17. Staff Management

### Features
- Role-specific registration forms
- License number verification
- Department assignment
- Schedule management
- Performance tracking

---

## 18. Department Management

### Features
- Department creation/editing
- Head assignment
- Status management (Active/Inactive)
- Doctor-department associations

---

## 19. Room & Bed Management

### Features
- Room types (General, Private, ICU, Pediatric, Maternity)
- Bed assignment workflow
- Occupancy tracking
- Cleaning status management

---

## 20. Notification System

### Types
- Appointment reminders
- Lab results ready
- Prescription refill status
- Queue position updates
- System alerts
- Inventory alerts

### Channels
- In-app notifications
- Email (via Resend/Edge Functions)
- Real-time updates (Supabase Realtime)

---

## 21. Patient Portal

### Features
- Personal information view/edit
- Appointment booking
- Medical records access
- Prescription history
- Lab results viewing
- Doctor messaging
- Queue status tracking

---

## 22. Reports & Analytics

### Available Reports
- Patient statistics
- Appointment analytics
- Revenue reports
- Inventory reports
- Blood bank reports
- Department performance

### Features
- Date range filtering
- Chart visualizations (Recharts)
- Export to Excel/PDF
- Drill-down capabilities

---

## 23. Settings & Configuration

### Hospital Settings (Admin)
- Hospital information
- Working hours
- Regional settings (timezone, currency)
- Notification preferences

### User Settings
- Theme (Light/Dark)
- Language (English/Urdu)
- Personal preferences

---

## 24. Security Features

### Row Level Security (RLS)
- All tables protected with PostgreSQL policies
- Role-based data access
- Patient data isolation

### Audit Logging
- PHI access tracking
- Action logging (create, read, update, delete)
- User session tracking

### Authentication
- Supabase Auth integration
- Session management
- Password recovery

---

## 25. Database Architecture

### Table Categories

| Category | Tables |
|----------|--------|
| **Core** | patients, doctors, nurses, departments |
| **Appointments** | appointments, daily_queues, queue_entries |
| **Clinical** | medical_records, prescriptions, lab_tests, patient_vitals |
| **Pharmacy** | inventory, pharmacy_bills, pharmacy_bill_items |
| **Blood Bank** | blood_groups, blood_stock, donors, blood_issues |
| **Operations** | operation_theatres, surgeries, surgery_team, post_operation |
| **Financial** | payments, insurance_claims, insurance_claim_items |
| **System** | profiles, user_roles, notifications, hospital_settings |
| **Audit** | phi_audit_log |

### Key Relationships
- `patients` ← `appointments` → `doctors`
- `patients` ← `medical_records` → `doctors`
- `prescriptions` ← `prescription_items`
- `doctors` ↔ `departments` (via `department_doctors`)
- `surgeries` ← `surgery_team` → `doctors`

---

## Appendix: File Structure

```
/src
├── /components       # Reusable UI components
│   ├── /ui           # shadcn/ui base components
│   ├── /dashboard    # Role-specific dashboards
│   ├── /patients     # Patient management
│   ├── /appointments # Scheduling components
│   └── ...           # Feature-specific components
├── /hooks            # Custom React hooks
├── /contexts         # React context providers
├── /pages            # Route page components
├── /lib              # Utility functions
├── /integrations     # Supabase client
└── /i18n             # Internationalization

/supabase
├── /functions        # Edge Functions
└── /migrations       # Database migrations

/docs                 # Documentation
```

---

© 2026 Fastam Solutions. All Rights Reserved.
