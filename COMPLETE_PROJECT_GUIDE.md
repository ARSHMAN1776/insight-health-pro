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

### How Role-Based Access Works

1. **Authentication**: User logs in with email/password
2. **Role Lookup**: System queries `user_roles` table for user's role
3. **Context Loading**: `AuthContext` stores role and permissions
4. **Route Protection**: Protected routes check role before rendering
5. **RLS Enforcement**: Database policies enforce access at data level

```typescript
// Example: Checking permissions in components
const { user, hasPermission, isRole } = useAuth();

if (isRole('admin') || isRole('doctor')) {
  // Show prescription edit button
}

if (hasPermission('manage_patients')) {
  // Show patient management options
}
```

---

## 3. Authentication System

### Registration Flow

#### Patient Self-Registration
1. Patient visits `/login` and clicks "Register"
2. Fills registration form:
   - Personal info (name, email, phone)
   - Date of birth, gender
   - Creates password
3. System creates:
   - `auth.users` entry (Supabase Auth)
   - `profiles` entry (user profile)
   - `user_roles` entry (role: patient)
   - `patients` entry (patient record with status: `pending_verification`)
   - `patient_registration_queue` entry
4. Admins/Receptionists receive notification
5. Staff verifies patient, status changes to `active`

#### Staff Registration (Admin Only)
1. Admin navigates to Staff Management
2. Selects role (Doctor, Nurse, etc.)
3. Fills role-specific form:
   - Personal info
   - License number (doctors/nurses)
   - Department, specialization
4. System creates user with appropriate role
5. Staff receives email with login credentials

### Login Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│  Supabase   │────▶│   Fetch     │
│   Form      │     │    Auth     │     │   Profile   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │◀────│  Set Auth   │◀────│ Fetch Role  │
│   Redirect  │     │  Context    │     │   & Data    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Password Recovery
1. User clicks "Forgot Password" on login page
2. Enters registered email
3. Receives password reset link
4. Clicks link → redirected to reset page
5. Sets new password
6. Redirected to login

### Session Management
- Sessions persist via Supabase Auth tokens
- Auto-refresh on page load
- Session timeout after 24 hours of inactivity
- Secure logout clears all tokens

---

## 4. Dashboard Module

Each role has a customized dashboard showing relevant information.

### Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                          │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  Total      │   Active    │   Today's   │   Pending          │
│  Patients   │   Staff     │   Appts     │   Verifications    │
├─────────────┴─────────────┴─────────────┴─────────────────────┤
│  ┌─────────────────────┐  ┌────────────────────────────────┐  │
│  │ Pending Patients    │  │  Recent Activity               │  │
│  │ - John Doe          │  │  • New patient registered      │  │
│  │ - Jane Smith        │  │  • Lab report uploaded         │  │
│  └─────────────────────┘  └────────────────────────────────┘  │
│  ┌─────────────────────┐  ┌────────────────────────────────┐  │
│  │ Department Stats    │  │  Quick Actions                 │  │
│  │ [Bar Chart]         │  │  [Add Patient] [Add Staff]     │  │
│  └─────────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Patient verification queue widget
- Staff overview statistics
- Department-wise patient distribution
- System health indicators
- Quick action buttons

### Doctor Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                     Doctor Dashboard                         │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  Today's    │   Waiting   │   Pending   │   Completed        │
│  Patients   │   Queue     │   Lab Tests │   Today            │
├─────────────┴─────────────┴─────────────┴─────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Current Queue                                           │  │
│  │ ┌───────┬────────────────┬──────────┬────────────────┐  │  │
│  │ │ Token │ Patient Name   │ Status   │ Actions        │  │  │
│  │ │ T-001 │ Ahmed Khan     │ Waiting  │ [Call] [Skip]  │  │  │
│  │ │ T-002 │ Fatima Ali     │ Waiting  │ [Call] [Skip]  │  │  │
│  │ └───────┴────────────────┴──────────┴────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────┐  ┌────────────────────────────┐  │
│  │ Today's Appointments    │  │ Pending Lab Results        │  │
│  │ 09:00 - John Doe       │  │ • Blood Test - Jane Doe    │  │
│  │ 10:30 - Jane Smith     │  │ • X-Ray - Mike Wilson      │  │
│  └─────────────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time queue management widget
- Today's appointments list
- Pending lab results
- Quick patient search
- Recent prescriptions

### Patient Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                     Patient Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│  Welcome, [Patient Name]!                                    │
│  Patient ID: HMS-XXXX-XXXX                                   │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  Upcoming   │   Active    │   Pending   │   Messages         │
│  Appts      │   Prescr.   │   Lab Tests │   (Unread)         │
├─────────────┴─────────────┴─────────────┴─────────────────────┤
│  ┌─────────────────────────┐  ┌────────────────────────────┐  │
│  │ Quick Actions           │  │ Queue Status               │  │
│  │ [Book Appointment]      │  │ You are #3 in queue        │  │
│  │ [View Records]          │  │ Est. Wait: 15 mins         │  │
│  │ [Request Refill]        │  │ Doctor: Dr. Ahmed Khan     │  │
│  └─────────────────────────┘  └────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Recent Activity                                          │  │
│  │ • Prescription issued by Dr. Khan - Jan 10              │  │
│  │ • Lab results available - Jan 8                          │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Queue position (if in queue)
- Upcoming appointments
- Active prescriptions
- Quick action buttons
- Recent activity feed

### Other Role Dashboards

| Role | Key Widgets |
|------|-------------|
| **Nurse** | Assigned patients, vitals pending, shift info |
| **Receptionist** | Queue control, today's appointments, check-in stats |
| **Lab Technician** | Pending tests, completed today, urgent tests |
| **Pharmacist** | Pending prescriptions, low stock alerts, today's sales |

---

## 5. Patient Management

### Patient Registration

#### Walk-in Registration (Receptionist)
1. Navigate to Patient Registry
2. Click "Add New Patient"
3. Fill registration form:
   ```
   ┌─────────────────────────────────────────┐
   │ Patient Registration Form               │
   ├─────────────────────────────────────────┤
   │ Basic Information                       │
   │ • First Name*    • Last Name*           │
   │ • Date of Birth* • Gender*              │
   │ • Email          • Phone                │
   │ • Address                               │
   ├─────────────────────────────────────────┤
   │ Medical Information                     │
   │ • Blood Type     • Allergies            │
   │ • Medical History                       │
   ├─────────────────────────────────────────┤
   │ Emergency Contact                       │
   │ • Contact Name   • Contact Phone        │
   ├─────────────────────────────────────────┤
   │ Insurance Details                       │
   │ • Provider       • Policy Number        │
   └─────────────────────────────────────────┘
   ```
4. Save → Patient record created with `active` status

#### Self-Registration (Patient)
1. Patient registers via login page
2. Status: `pending_verification`
3. Admin/Receptionist reviews in verification queue
4. Approves → Status changes to `active`
5. Rejects → Patient notified with reason

### Patient Verification Queue

Displayed to Admin/Receptionist:
```
┌─────────────────────────────────────────────────────────────┐
│ Pending Patient Verifications                                │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Patient Name │ Email        │ Registered   │ Actions        │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ John Doe     │ john@ex.com  │ 2 hours ago  │ [✓] [✗] [View] │
│ Jane Smith   │ jane@ex.com  │ 1 day ago    │ [✓] [✗] [View] │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### Patient ID Card & QR Code

Each patient gets:
- **Digital ID Card**: Shows photo, name, ID, blood type, emergency contact
- **QR Code**: For quick verification scanning
- **Verification Page**: `/verify-patient?id=xxx` shows verified patient info

### Patient Search & Filtering

```
Search: [________________________] [🔍]

Filters: [All Statuses ▼] [All Blood Types ▼] [Date Range]

┌──────┬──────────────┬─────────────┬────────────┬──────────┐
│ ID   │ Name         │ Phone       │ Blood Type │ Status   │
├──────┼──────────────┼─────────────┼────────────┼──────────┤
│ 1001 │ Ahmed Khan   │ 0300-xxx    │ O+         │ Active   │
│ 1002 │ Fatima Ali   │ 0321-xxx    │ A-         │ Active   │
└──────┴──────────────┴─────────────┴────────────┴──────────┘
```

---

## 6. Appointment System

### Booking an Appointment

#### Staff Booking (Receptionist/Admin)
1. Navigate to Appointments
2. Click "Schedule Appointment"
3. Select:
   - Patient (search by name/ID)
   - Department
   - Doctor
   - Date & Time
   - Appointment Type (Consultation, Follow-up, etc.)
4. Add symptoms/notes
5. Confirm → Appointment created

#### Patient Self-Booking
1. Login to Patient Portal
2. Click "Book Appointment"
3. Select department and doctor
4. View available slots
5. Select preferred slot
6. Add symptoms description
7. Confirm booking

### Appointment Calendar View

```
┌─────────────────────────────────────────────────────────────┐
│ January 2026                              [< Prev] [Next >] │
├─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────────────────────┤
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │ Today's Schedule    │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────────────────┤
│  5  │  6  │  7  │  8  │  9  │ 10  │ 11  │ 09:00 John Doe     │
│     │ (3) │ (5) │ (2) │(12)●│     │     │ 09:30 Jane Smith   │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ 10:00 Mike Wilson  │
│ 12  │ 13  │ 14  │ 15  │ 16  │ 17  │ 18  │ 10:30 Sarah Khan   │
│     │ (4) │ (6) │ (8) │ (5) │     │     │ ...                │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────────────────────┘
● = Today   (n) = Number of appointments
```

### Appointment Status Flow

```
┌──────────┐    ┌───────────┐    ┌────────────┐    ┌───────────┐
│ Scheduled│───▶│ Confirmed │───▶│ Checked-In │───▶│ Completed │
└──────────┘    └───────────┘    └────────────┘    └───────────┘
     │               │                 │
     │               │                 └───▶ No Show
     │               │
     └───────────────┴───────────────────────▶ Cancelled
```

### Appointment Waitlist

For patients wanting appointments when no slots available:

1. Patient added to waitlist with preferences:
   - Preferred date range
   - Preferred time slots
   - Specific doctor or any
   - Priority level
2. When slot opens, system notifies waitlisted patients
3. Patient accepts → Appointment booked
4. Patient declines → Next on waitlist notified

---

## 7. Queue Management System

### Overview

Real-time patient queue management for walk-ins and appointments.

### How It Works

```
┌──────────────────────────────────────────────────────────────┐
│                    Queue Flow Diagram                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─────────────┐         ┌─────────────┐                    │
│   │ Walk-in     │         │ Appointment │                    │
│   │ Patient     │         │ Patient     │                    │
│   └──────┬──────┘         └──────┬──────┘                    │
│          │                       │                            │
│          └───────────┬───────────┘                            │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │  Check-In     │                                │
│              │  (Reception)  │                                │
│              └───────┬───────┘                                │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │ Token Issued  │ ← T-001, T-002, etc.          │
│              │ (Join Queue)  │                                │
│              └───────┬───────┘                                │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │   Waiting     │ ← Real-time position updates  │
│              │               │                                │
│              └───────┬───────┘                                │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │    Called     │ ← Doctor calls next patient   │
│              │               │                                │
│              └───────┬───────┘                                │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │ In Consult.   │                                │
│              │               │                                │
│              └───────┬───────┘                                │
│                      ▼                                        │
│              ┌───────────────┐                                │
│              │  Completed    │                                │
│              └───────────────┘                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Token System

- **Token Format**: `{PREFIX}-{NUMBER}` (e.g., T-001, T-002)
- **Daily Reset**: Token numbers reset each day
- **Per-Doctor Queues**: Each doctor has their own queue

### Priority Levels

| Priority | Description | Queue Behavior |
|----------|-------------|----------------|
| **Emergency** | Critical cases | Moved to front |
| **Priority** | Elderly, pregnant, disabled | Placed before normal |
| **Normal** | Standard patients | FIFO order |

### Receptionist Queue Control

```
┌─────────────────────────────────────────────────────────────┐
│ Queue Management - Dr. Ahmed Khan                    [Pause] │
├─────────────────────────────────────────────────────────────┤
│ [Check-In Walk-In Patient]                                   │
├───────┬────────────────┬──────────┬───────────┬─────────────┤
│ Token │ Patient        │ Type     │ Status    │ Actions     │
├───────┼────────────────┼──────────┼───────────┼─────────────┤
│ T-001 │ Ahmed Khan     │ Walk-in  │ In Consult│ [Complete]  │
│ T-002 │ Fatima Ali     │ Appt     │ Called    │ [Start]     │
│ T-003 │ John Doe       │ Walk-in  │ Waiting   │ [Call][Skip]│
│ T-004 │ Jane Smith     │ Appt     │ Waiting   │ [Call][Skip]│
└───────┴────────────────┴──────────┴───────────┴─────────────┘
│ Average Wait: 12 mins | Completed Today: 15                  │
└─────────────────────────────────────────────────────────────┘
```

### Doctor Queue View

```
┌─────────────────────────────────────────────────────────────┐
│ My Queue                                    Patients: 8      │
├─────────────────────────────────────────────────────────────┤
│ Currently Serving: T-001 - Ahmed Khan                        │
│ [Start Consultation] [Mark Complete] [Transfer]              │
├─────────────────────────────────────────────────────────────┤
│ Up Next:                                                     │
│ ┌─────┬───────────────┬───────────┬─────────────────────┐   │
│ │ #   │ Patient       │ Wait Time │ Symptoms            │   │
│ ├─────┼───────────────┼───────────┼─────────────────────┤   │
│ │ 1   │ Fatima Ali    │ 5 mins    │ Fever, headache     │   │
│ │ 2   │ John Doe      │ 12 mins   │ Follow-up           │   │
│ │ 3   │ Jane Smith    │ 18 mins   │ Chest pain          │   │
│ └─────┴───────────────┴───────────┴─────────────────────┘   │
│                                                              │
│ [Call Next] [Skip] [Mark No-Show]                           │
└─────────────────────────────────────────────────────────────┘
```

### Patient Queue Status

```
┌─────────────────────────────────────────────────────────────┐
│                   Your Queue Status                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│           ┌─────────────────────────────┐                    │
│           │         T-003               │                    │
│           │     Your Token Number       │                    │
│           └─────────────────────────────┘                    │
│                                                              │
│           Position: #3 in queue                              │
│           Estimated Wait: ~15 minutes                        │
│           Doctor: Dr. Ahmed Khan                             │
│           Department: General Medicine                       │
│                                                              │
│           Status: ⏳ Waiting                                 │
│                                                              │
│           ┌─────────────────────────────┐                    │
│           │      [Print Token Slip]     │                    │
│           └─────────────────────────────┘                    │
│                                                              │
│           Currently Serving: T-001                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Waiting Room Display

Large screen display for waiting areas:

```
┌─────────────────────────────────────────────────────────────┐
│         HOSPITAL NAME - Waiting Room Display                 │
│                     January 12, 2026                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   NOW SERVING          │    UP NEXT                         │
│                        │                                     │
│   ┌──────────────┐     │    T-002  →  Room 101              │
│   │    T-001     │     │    T-003  →  Waiting               │
│   │              │     │    T-004  →  Waiting               │
│   │   Room 101   │     │    T-005  →  Waiting               │
│   └──────────────┘     │                                     │
│                        │                                     │
├─────────────────────────────────────────────────────────────┤
│  Dr. Ahmed Khan - General Medicine                           │
│  Average Wait Time: 12 minutes                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Medical Records

### Record Structure

Each medical record contains:
- **Visit Date**: Date of consultation
- **Doctor**: Treating physician
- **Symptoms**: Patient-reported symptoms
- **Diagnosis**: Doctor's diagnosis with ICD-10 code
- **Treatment**: Treatment plan
- **Medications**: Prescribed medications
- **Procedure Codes**: CPT codes for procedures
- **Notes**: Additional clinical notes
- **Follow-up Date**: Scheduled follow-up

### Creating a Medical Record

1. Doctor opens patient consultation
2. Records symptoms and examination findings
3. Selects diagnosis codes (ICD-10 searchable picker)
4. Documents treatment plan
5. Adds procedure codes if applicable
6. Creates prescriptions (linked to record)
7. Orders lab tests if needed
8. Sets follow-up date
9. Saves record

### Diagnosis Code Picker

```
┌─────────────────────────────────────────────────────────────┐
│ Select Diagnosis Code                                        │
├─────────────────────────────────────────────────────────────┤
│ Search: [diabetes__________________] [🔍]                    │
├─────────────────────────────────────────────────────────────┤
│ Results:                                                     │
│ ┌─────────┬──────────────────────────────────────────────┐  │
│ │ E11.9   │ Type 2 diabetes mellitus without complications│  │
│ │ E10.9   │ Type 1 diabetes mellitus without complications│  │
│ │ E11.65  │ Type 2 diabetes with hyperglycemia            │  │
│ │ E13.9   │ Other specified diabetes mellitus             │  │
│ └─────────┴──────────────────────────────────────────────┘  │
│                                                              │
│ Selected: E11.9 - Type 2 diabetes mellitus                  │
│                                              [Confirm]       │
└─────────────────────────────────────────────────────────────┘
```

### FHIR Export

Medical records can be exported in FHIR R4 format:
- Individual patient records
- Bulk export for interoperability
- Includes: Patient, Encounter, Condition, MedicationRequest resources

---

## 9. Prescription Management

### Creating Prescriptions

#### Manual Entry
1. Doctor selects patient
2. Adds medications one by one:
   - Medication name
   - Dosage (e.g., 500mg)
   - Frequency (e.g., twice daily)
   - Duration (e.g., 7 days)
   - Route (oral, topical, etc.)
   - Quantity
   - Special instructions

#### Using Templates
1. Doctor selects diagnosis category
2. Chooses from saved templates
3. Template populates medications
4. Doctor adjusts as needed
5. Saves prescription

### Drug Interaction Checker

Automatic checking when adding medications:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Drug Interaction Warning                                 │
├─────────────────────────────────────────────────────────────┤
│ SEVERE INTERACTION DETECTED                                  │
│                                                              │
│ Warfarin + Aspirin                                          │
│                                                              │
│ Risk: Increased bleeding risk                                │
│ Mechanism: Both drugs affect blood clotting                  │
│                                                              │
│ Recommendation: Consider alternative or monitor closely      │
│                                                              │
│              [Continue Anyway]  [Remove Aspirin]             │
└─────────────────────────────────────────────────────────────┘
```

### Prescription Templates

Doctors can save frequently used prescription combinations:

```
┌─────────────────────────────────────────────────────────────┐
│ My Prescription Templates                     [+ New Template]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Upper Respiratory Infection - Standard                  │ │
│ │ Amoxicillin 500mg TID x 7 days                         │ │
│ │ Paracetamol 500mg PRN                                  │ │
│ │ Cetirizine 10mg OD                                     │ │
│ │                              [Use] [Edit] [Delete]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Hypertension - Initial                                  │ │
│ │ Amlodipine 5mg OD                                      │ │
│ │ Aspirin 75mg OD                                        │ │
│ │                              [Use] [Edit] [Delete]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Prescription Verification (QR Code)

Each prescription has a QR code for verification:
- Pharmacist scans QR code
- System displays prescription details
- Confirms authenticity and validity
- Marks as dispensed

### Prescription Refill Requests

1. Patient views active prescriptions
2. Clicks "Request Refill"
3. Adds reason for refill
4. Request sent to prescribing doctor
5. Doctor approves/denies
6. Patient notified of decision

---

## 10. Laboratory Module

### Lab Test Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Doctor    │    │  Lab Tech   │    │   Doctor    │
│   Orders    │───▶│  Processes  │───▶│   Reviews   │
│   Test      │    │   Sample    │    │   Results   │
└─────────────┘    └─────────────┘    └─────────────┘
      │                  │                   │
      ▼                  ▼                   ▼
   Pending           Processing         Completed
                         │
                         ▼
                  Upload Report
                  (PDF/Image)
```

### Ordering Lab Tests

1. Doctor selects patient
2. Chooses test type:
   - Blood tests (CBC, LFT, RFT, etc.)
   - Urine tests
   - Imaging (X-ray, CT, MRI, etc.)
   - Special tests
3. Sets priority (Normal, Urgent, Emergency)
4. Adds clinical notes
5. Submits order

### Lab Technician Interface

```
┌─────────────────────────────────────────────────────────────┐
│ Pending Lab Tests                           [Filter] [Search]│
├───────┬────────────┬────────────┬──────────┬────────────────┤
│ ID    │ Patient    │ Test       │ Priority │ Actions        │
├───────┼────────────┼────────────┼──────────┼────────────────┤
│ LT001 │ Ahmed Khan │ CBC        │ 🔴 Urgent│ [Process]      │
│ LT002 │ Jane Doe   │ Blood Sugar│ Normal   │ [Process]      │
│ LT003 │ John Smith │ X-Ray Chest│ Normal   │ [Process]      │
└───────┴────────────┴────────────┴──────────┴────────────────┘
```

### Uploading Results

1. Lab tech clicks "Process" on test
2. Enters results:
   - Numeric values with reference ranges
   - Text findings
3. Uploads report image/PDF
4. Marks normal/abnormal
5. Submits results
6. Doctor and patient notified

### Report Verification

Lab reports have verification QR codes:
- `/verify-lab-report?id=xxx`
- Shows test details, results, lab tech name
- Confirms report authenticity

---

## 11. Pharmacy Module

### Pharmacy Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Prescription │    │  Pharmacist │    │   Billing   │
│  Received   │───▶│  Dispenses  │───▶│  & Payment  │
│             │    │ Medications │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                         │
                         ▼
                  Inventory Updated
```

### Dispensing Medications

1. Pharmacist views pending prescriptions
2. Scans prescription QR or searches
3. Reviews medications and quantities
4. Checks inventory availability
5. Dispenses medications
6. Creates pharmacy bill

### Pharmacy Billing

```
┌─────────────────────────────────────────────────────────────┐
│ Pharmacy Bill                              Bill #: PB-12345  │
├─────────────────────────────────────────────────────────────┤
│ Patient: Ahmed Khan                 Date: Jan 12, 2026       │
│ Prescription: RX-67890                                       │
├─────────────────────────────────────────────────────────────┤
│ Items:                                                       │
│ ┌───────────────────────┬─────────┬───────────┬───────────┐ │
│ │ Medication            │ Qty     │ Unit Price│ Total     │ │
│ ├───────────────────────┼─────────┼───────────┼───────────┤ │
│ │ Amoxicillin 500mg     │ 21      │ Rs. 15    │ Rs. 315   │ │
│ │ Paracetamol 500mg     │ 10      │ Rs. 5     │ Rs. 50    │ │
│ │ Cetirizine 10mg       │ 7       │ Rs. 8     │ Rs. 56    │ │
│ └───────────────────────┴─────────┴───────────┴───────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                    Subtotal:    Rs. 421      │
│                                    Tax (5%):    Rs. 21       │
│                                    Discount:    Rs. 0        │
│                                    ─────────────────────     │
│                                    Total:       Rs. 442      │
├─────────────────────────────────────────────────────────────┤
│ Payment: [Cash ▼]                          [Process Payment] │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Blood Bank Module

### Blood Bank Overview

Complete blood inventory and transfusion management.

### Components

| Component | Function |
|-----------|----------|
| **Dashboard** | Overview of blood stock, recent activity |
| **Inventory** | Current stock by blood group |
| **Donors** | Donor registration and history |
| **Donations** | Record new donations |
| **Issues** | Issue blood to patients |
| **Transfusions** | Track transfusion records |
| **Reports** | Stock reports, usage analytics |

### Blood Group Compatibility

System enforces blood compatibility rules:

```
Donor Blood → Compatible Recipients
─────────────────────────────────────
O-  → O-, O+, A-, A+, B-, B+, AB-, AB+
O+  → O+, A+, B+, AB+
A-  → A-, A+, AB-, AB+
A+  → A+, AB+
B-  → B-, B+, AB-, AB+
B+  → B+, AB+
AB- → AB-, AB+
AB+ → AB+
```

### Issuing Blood

1. Request blood for patient
2. System checks patient blood type
3. Shows compatible units available
4. Select unit to issue
5. Verify cross-match
6. Issue blood
7. Stock automatically updated

### Low Stock Alerts

When blood group stock falls below threshold:
- Dashboard warning displayed
- Notification to blood bank staff
- Critical alert for zero stock

---

## 13. Operation Theatre Module

### Surgery Scheduling

```
┌─────────────────────────────────────────────────────────────┐
│ Schedule Surgery                                             │
├─────────────────────────────────────────────────────────────┤
│ Patient: [Search Patient_____________]                       │
│                                                              │
│ Surgery Details:                                             │
│ • Surgery Type: [_____________________]                      │
│ • Lead Surgeon: [Select Doctor ▼]                            │
│ • Date: [📅 Select Date]                                     │
│ • Time: [⏰ Select Time]                                     │
│ • Duration (est.): [___] hours                               │
│                                                              │
│ Operation Theatre:                                           │
│ • Theatre: [Select Available OT ▼]                           │
│   ├─ OT-1: Available                                         │
│   ├─ OT-2: In Use (ends 2:00 PM)                            │
│   └─ OT-3: Maintenance                                       │
│                                                              │
│ Surgery Team:                                                │
│ • Assistant Surgeon: [Select ▼]                              │
│ • Anesthetist: [Select ▼]                                    │
│ • Nurses: [Multi-select ▼]                                   │
│                                                              │
│ Pre-op Notes: [_____________________________]                │
│                                                              │
│                              [Cancel]  [Schedule Surgery]    │
└─────────────────────────────────────────────────────────────┘
```

### Surgery Status Flow

```
Scheduled → Pre-Op → In Progress → Post-Op → Completed
                │
                └──→ Cancelled/Postponed
```

### Post-Operation Care

After surgery:
1. Record completion details
2. Document complications (if any)
3. Record vital signs
4. Add recovery notes
5. Set follow-up date
6. Update discharge status

### Surgical Consent Form

Digital consent form includes:
- Patient information
- Surgery details
- Risks explained
- Patient/guardian signature
- Witness signature
- Date and time

---

## 14. Insurance Claims

### Claim Creation

1. Select patient and appointment/procedure
2. Add insurance details:
   - Provider name
   - Policy number
3. Add diagnosis codes (ICD-10)
4. Add procedure codes (CPT)
5. Enter claim amount
6. Submit claim

### Claim Status Flow

```
┌───────┐   ┌─────────┐   ┌──────────┐   ┌─────────┐   ┌──────┐
│ Draft │──▶│Submitted│──▶│Under     │──▶│Approved │──▶│ Paid │
└───────┘   └─────────┘   │Review    │   └─────────┘   └──────┘
                          └──────────┘
                               │
                               ▼
                          ┌─────────┐   ┌──────────┐
                          │ Denied  │──▶│ Appealed │
                          └─────────┘   └──────────┘
```

### Claim Tracking

Patients receive notifications on status changes:
- Submitted: "Your claim has been submitted"
- Approved: "Good news! Your claim was approved for $X"
- Denied: "Your claim was denied. Reason: X. You may appeal."

### Appeal Process

1. View denied claim
2. Click "File Appeal"
3. Add appeal notes/documentation
4. Submit appeal
5. Track appeal status

---

## 15. Billing & Payments

### Creating Bills

Bills created for:
- Consultations
- Lab tests
- Procedures
- Pharmacy
- Room charges
- Surgery

### Payment Processing

```
┌─────────────────────────────────────────────────────────────┐
│ Payment                                   Invoice: INV-12345 │
├─────────────────────────────────────────────────────────────┤
│ Patient: Ahmed Khan                                          │
│                                                              │
│ Items:                                                       │
│ ┌───────────────────────────────────────────────┬──────────┐│
│ │ Description                                   │ Amount   ││
│ ├───────────────────────────────────────────────┼──────────┤│
│ │ Consultation - Dr. Ahmed                      │ Rs. 1000 ││
│ │ Lab Test - CBC                               │ Rs. 500  ││
│ │ Lab Test - Blood Sugar                       │ Rs. 300  ││
│ └───────────────────────────────────────────────┴──────────┘│
│                                                              │
│                                    Subtotal:    Rs. 1800     │
│                                    Insurance:  -Rs. 1260     │
│                                    ─────────────────────     │
│                                    Due:        Rs. 540       │
│                                                              │
│ Payment Method: ○ Cash  ○ Card  ○ Bank Transfer              │
│                                                              │
│                              [Cancel]  [Process Payment]     │
└─────────────────────────────────────────────────────────────┘
```

### Payment Methods
- Cash
- Credit/Debit Card
- Bank Transfer
- Insurance
- Partial Payment

---

## 16. Inventory Management

### Inventory Overview

Track all hospital supplies:
- Medications
- Medical equipment
- Consumables
- Office supplies

### Stock Management

```
┌─────────────────────────────────────────────────────────────┐
│ Inventory Management                        [+ Add Item]     │
├───────────────────────────────────────────────────────────────┤
│ Filters: [Category ▼] [Supplier ▼] [Stock Status ▼]         │
├───────┬────────────────┬───────┬────────┬──────────┬────────┤
│ ID    │ Item Name      │ Stock │ Min    │ Status   │ Actions│
├───────┼────────────────┼───────┼────────┼──────────┼────────┤
│ I001  │ Paracetamol    │ 500   │ 100    │ ✅ OK    │ [Edit] │
│ I002  │ Amoxicillin    │ 50    │ 100    │ 🟡 Low   │ [Edit] │
│ I003  │ Syringes 5ml   │ 0     │ 200    │ 🔴 Empty │ [Order]│
└───────┴────────────────┴───────┴────────┴──────────┴────────┘
```

### Low Stock Alerts

Automatic alerts when:
- Stock below reorder point
- Items approaching expiry
- Out of stock items

### Purchase Orders

1. Create purchase order
2. Select supplier
3. Add items and quantities
4. Submit for approval
5. Admin approves
6. Order sent to supplier
7. Receive goods
8. Update inventory

### Supplier Management

Track suppliers with:
- Contact information
- Products supplied
- Payment terms
- Order history

---

## 17. Staff Management

### Staff Registry

Manage all hospital staff:
- Doctors
- Nurses
- Technicians
- Administrative staff

### Staff Registration

Role-specific registration forms:

**Doctor Registration:**
- Personal info
- License number
- Specialization
- Department assignment
- Consultation fee
- Availability schedule

**Nurse Registration:**
- Personal info
- License number
- Specialization
- Shift schedule
- Department

### Staff Scheduling

```
┌─────────────────────────────────────────────────────────────┐
│ Staff Schedule - January 2026                               │
├─────────────────────────────────────────────────────────────┤
│ Department: [General Medicine ▼]                             │
├─────┬────────────────┬────────────────┬────────────────────┤
│     │ Morning        │ Afternoon      │ Night              │
│     │ (8AM-2PM)      │ (2PM-8PM)      │ (8PM-8AM)          │
├─────┼────────────────┼────────────────┼────────────────────┤
│ Mon │ Dr. Khan       │ Dr. Smith      │ Dr. Ali            │
│     │ Nurse Fatima   │ Nurse Sarah    │ Nurse Ahmed        │
├─────┼────────────────┼────────────────┼────────────────────┤
│ Tue │ Dr. Smith      │ Dr. Khan       │ Dr. Ali            │
│     │ Nurse Sarah    │ Nurse Fatima   │ Nurse Ahmed        │
└─────┴────────────────┴────────────────┴────────────────────┘
```

### Shift Handover

End-of-shift handover documentation:
- Outgoing staff records status
- Critical patients noted
- Pending tasks listed
- Incoming staff acknowledges

---

## 18. Department Management

### Department Structure

```
Hospital
├── Emergency
├── General Medicine
├── Surgery
├── Pediatrics
├── Gynecology
├── Orthopedics
├── Cardiology
├── Neurology
├── Ophthalmology
├── ENT
├── Dermatology
├── Psychiatry
├── Radiology
├── Pathology
└── Pharmacy
```

### Department Management

- Create/edit departments
- Assign department heads
- Link doctors to departments
- Department-wise statistics

---

## 19. Room & Bed Management

### Room Types

- General Ward
- Private Room
- Semi-Private
- ICU
- NICU
- Operation Theatre
- Recovery Room

### Bed Assignment

```
┌─────────────────────────────────────────────────────────────┐
│ Bed Management - General Ward Floor 2                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐      │
│  │ 201 │  │ 202 │  │ 203 │  │ 204 │  │ 205 │  │ 206 │      │
│  │ 🟢  │  │ 🔴  │  │ 🟢  │  │ 🟡  │  │ 🔴  │  │ 🟢  │      │
│  │     │  │Ahmed│  │     │  │Maint│  │Jane │  │     │      │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘      │
│                                                              │
│  🟢 Available (3)  🔴 Occupied (2)  🟡 Maintenance (1)       │
│                                                              │
│                              [Assign Patient]  [Discharge]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 20. Notification System

### Notification Types

| Type | Recipients | Trigger |
|------|------------|---------|
| **Patient Registration** | Admin, Receptionist | New patient signs up |
| **Appointment Reminder** | Patient | 24 hours before appointment |
| **Lab Results** | Patient, Doctor | Results uploaded |
| **Prescription Ready** | Patient | Prescription created |
| **Insurance Claim** | Patient | Claim status changes |
| **Low Stock** | Admin, Pharmacist | Inventory below threshold |
| **Queue Update** | Patient | Called for consultation |

### Notification Center

```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 Notifications                    [Mark All Read] [Clear] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 New Patient Registration                 2 hours ago │ │
│ │ John Doe has registered and requires verification       │ │
│ │                                           [View Patient] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟢 Insurance Claim Approved                   Yesterday │ │
│ │ Your claim #CLM-12345 was approved for Rs. 5000        │ │
│ │                                             [View Claim] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚪ Lab Results Available                     3 days ago │ │
│ │ Blood test results for patient Ahmed Khan are ready    │ │
│ │                                            [View Report] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 21. Patient Portal

### Portal Features

Patients can:
- View personal information
- See medical records
- View and print prescriptions
- Check lab results
- Book appointments
- View queue status
- Request prescription refills
- Message doctors
- View insurance claims
- Download ID card

### Portal Navigation

```
┌─────────────────────────────────────────────────────────────┐
│ Patient Portal                              Welcome, Ahmed!  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐                                          │
│ │ 📋 My Info      │ Personal information, ID card, QR code  │
│ ├─────────────────┤                                          │
│ │ 📅 Appointments │ View and book appointments              │
│ ├─────────────────┤                                          │
│ │ 📊 Queue Status │ Current queue position and wait time    │
│ ├─────────────────┤                                          │
│ │ 📁 Records      │ Medical history and records             │
│ ├─────────────────┤                                          │
│ │ 💊 Prescriptions│ Active prescriptions, refill requests   │
│ ├─────────────────┤                                          │
│ │ 🔬 Lab Results  │ Test results and reports                │
│ ├─────────────────┤                                          │
│ │ 💰 Insurance    │ Claims and status                       │
│ ├─────────────────┤                                          │
│ │ 💬 Messages     │ Communicate with doctors                │
│ └─────────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 22. Reports & Analytics

### Available Reports

| Report | Description | Access |
|--------|-------------|--------|
| **Patient Statistics** | Total patients, demographics, trends | Admin |
| **Appointment Analytics** | Booking trends, no-shows, utilization | Admin, Receptionist |
| **Revenue Report** | Income by department, service, period | Admin |
| **Lab Test Report** | Tests performed, turnaround time | Admin, Lab Tech |
| **Pharmacy Sales** | Sales by item, daily/monthly totals | Admin, Pharmacist |
| **Blood Bank Report** | Stock levels, usage, donations | Admin, Blood Bank |
| **Staff Performance** | Consultations, procedures per doctor | Admin |
| **Department Report** | Department-wise activity | Admin |

### Report Features

- **Date Range Filter**: Custom date selection
- **Export Options**: PDF, Excel, CSV
- **Drill-down Charts**: Click to see detailed data
- **Comparison View**: Compare periods

### Report Example

```
┌─────────────────────────────────────────────────────────────┐
│ Monthly Revenue Report - January 2026                        │
├─────────────────────────────────────────────────────────────┤
│ Date Range: [Jan 1] to [Jan 31]         [Export ▼] [Print]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Revenue by Department          │  Revenue Trend            │
│  ┌────────────────────────────┐ │  ┌──────────────────────┐ │
│  │ ████████████ Surgery 45%  │ │  │    ╱╲    ╱╲          │ │
│  │ ██████████ Medicine 35%   │ │  │   ╱  ╲  ╱  ╲   ╱     │ │
│  │ █████ Lab 15%             │ │  │  ╱    ╲╱    ╲ ╱      │ │
│  │ ██ Pharmacy 5%            │ │  │ ╱            ╲       │ │
│  └────────────────────────────┘ │  └──────────────────────┘ │
│                                                              │
│  Summary:                                                    │
│  • Total Revenue: Rs. 2,500,000                             │
│  • Total Patients: 1,250                                    │
│  • Avg Revenue/Patient: Rs. 2,000                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 23. Settings & Configuration

### System Settings

| Setting | Description |
|---------|-------------|
| **Hospital Info** | Name, address, contact, logo |
| **Working Hours** | Operating hours by day |
| **Appointment Slots** | Duration, buffer time |
| **Queue Settings** | Token prefix, avg consultation time |
| **Notification Settings** | Email, SMS preferences |
| **Language** | English, Urdu |
| **Theme** | Light, Dark, System |
| **Timezone** | Hospital timezone |

### User Settings

| Setting | Description |
|---------|-------------|
| **Profile** | Update personal information |
| **Password** | Change password |
| **Notifications** | Manage notification preferences |
| **Language** | Personal language preference |
| **Theme** | Personal theme preference |

---

## 24. Security Features

### Authentication Security
- Password hashing (Supabase Auth)
- Session management
- Password reset via email
- Leaked password protection (optional)

### Data Security
- Row Level Security (RLS) on all tables
- Role-based access control
- Encrypted data transmission (HTTPS)
- Audit logging for PHI access

### Access Control
- Route-level protection
- Component-level permission checks
- Database-level RLS policies
- Session timeout

### Audit Trail

PHI (Protected Health Information) access is logged:
```sql
phi_audit_log:
- Who accessed the data
- What data was accessed
- When it was accessed
- What action was performed
- IP address
- Session ID
```

---

## 25. Database Architecture

### Table Categories

| Category | Tables | Description |
|----------|--------|-------------|
| **User Management** | profiles, user_roles | User accounts and roles |
| **Staff** | doctors, nurses | Staff records |
| **Patients** | patients, patient_vitals, patient_registration_queue | Patient data |
| **Clinical** | medical_records, prescriptions, prescription_items, lab_tests | Clinical records |
| **Appointments** | appointments, appointment_waitlist | Scheduling |
| **Queue** | daily_queues, queue_entries | Queue management |
| **Financial** | payments, pharmacy_bills, insurance_claims | Billing |
| **Pharmacy** | prescriptions, prescription_items, inventory | Pharmacy ops |
| **Blood Bank** | blood_groups, blood_stock, donors, blood_issues | Blood bank |
| **Surgery** | surgeries, surgery_team, operation_theatres, post_operation | Surgery |
| **Departments** | departments, department_doctors, rooms | Facility |
| **Supply Chain** | inventory, suppliers, purchase_orders | Inventory |
| **Notifications** | notifications | System notifications |
| **Audit** | phi_audit_log | Compliance logging |
| **Clinical Codes** | diagnosis_codes, procedure_codes, drug_interactions | Reference data |

### Entity Relationships

```
                          ┌──────────────┐
                          │   auth.users │
                          └──────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       ┌──────────┐       ┌──────────┐       ┌──────────┐
       │ profiles │       │user_roles│       │ patients │
       └──────────┘       └──────────┘       └────┬─────┘
                                                   │
       ┌───────────────────────────────────────────┤
       ▼                  ▼              ▼         ▼
┌──────────────┐   ┌───────────┐  ┌───────────┐ ┌───────┐
│appointments  │   │ medical   │  │lab_tests  │ │vitals │
└──────┬───────┘   │ records   │  └───────────┘ └───────┘
       │           └─────┬─────┘
       │                 │
       ▼                 ▼
┌──────────────┐   ┌───────────┐
│queue_entries │   │prescrip-  │
└──────────────┘   │tions      │
                   └───────────┘
```

### Total Tables: 47+

---

## Quick Reference

### Key URLs

| Page | URL | Access |
|------|-----|--------|
| Home | `/` | Public |
| Login | `/login` | Public |
| Dashboard | `/dashboard` | Authenticated |
| Patients | `/patients` | Staff |
| Appointments | `/appointments` | Staff |
| Queue | `/queue` | Staff + Patients |
| Medical Records | `/records` | Staff |
| Prescriptions | `/prescriptions` | Staff |
| Lab Tests | `/lab-tests` | Staff |
| Pharmacy | `/pharmacy` | Pharmacist |
| Blood Bank | `/blood-bank` | Staff |
| Surgery | `/operation-department` | Staff |
| Insurance | `/insurance-claims` | Staff + Patients |
| Billing | `/billing` | Staff |
| Staff | `/staff` | Admin |
| Reports | `/reports` | Admin |
| Settings | `/settings` | Authenticated |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Open search |
| `n` | New (context-sensitive) |
| `Esc` | Close modal/dialog |
| `Ctrl+S` | Save (in forms) |

---

## Support & Contact

For technical support or feature requests:
- Documentation: See PROJECT_DOCUMENTATION.md
- Setup Guide: See SETUP_GUIDE.md
- Database Schema: See src/database/schema.sql

---

**Document Version:** 3.0  
**Last Updated:** January 12, 2026  
**System Version:** HMS v3.0
