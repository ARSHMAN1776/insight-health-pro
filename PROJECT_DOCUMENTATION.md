# Hospital Management System (HMS)
## Complete Project Documentation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [System Modules](#5-system-modules)
6. [Database Architecture](#6-database-architecture)
7. [Security Features](#7-security-features)
8. [User Interface](#8-user-interface)
9. [API & Integrations](#9-api--integrations)
10. [System Requirements](#10-system-requirements)

---

## 1. Executive Summary

The Hospital Management System (HMS) is a comprehensive, web-based healthcare management solution designed to streamline hospital operations, enhance patient care, and improve administrative efficiency. The system provides a centralized platform for managing patients, appointments, medical records, billing, inventory, and staff operations.

### Key Benefits

- **Centralized Data Management**: All patient and operational data in one secure location
- **Role-Based Access Control**: Secure access with permissions based on user roles
- **Real-Time Updates**: Live data synchronization across all modules
- **Responsive Design**: Accessible on desktop, tablet, and mobile devices
- **Comprehensive Reporting**: Analytics and insights for informed decision-making
- **Notification System**: Real-time alerts and reminders for staff and patients

---

## 2. System Overview

### 2.1 Public-Facing Website

| Page | Description |
|------|-------------|
| **Landing Page** | Professional homepage with hospital information, services overview, and login access |
| **About Us** | Hospital history, mission, vision, values, and leadership team profiles |
| **Services** | Comprehensive list of medical departments, specializations, and healthcare services |
| **Login Portal** | Separate login options for staff and patients with secure authentication |

### 2.2 Dashboard System

The system provides **6 role-specific dashboards**:

1. **Admin Dashboard** - Complete system oversight with analytics
2. **Doctor Dashboard** - Patient management and clinical workflows
3. **Nurse Dashboard** - Patient care coordination and task management
4. **Patient Dashboard** - Personal health portal and appointment booking
5. **Receptionist Dashboard** - Front desk operations and scheduling
6. **Pharmacist Dashboard** - Prescription and inventory management

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Purpose |
|------------|---------|
| **React 18.3** | Core UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and development server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Pre-built accessible UI components |
| **React Router** | Client-side routing |
| **TanStack Query** | Server state management |
| **Recharts** | Data visualization and charts |
| **Lucide React** | Icon library |
| **date-fns** | Date manipulation |

### 3.2 Backend Technologies

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Relational database |
| **Supabase Auth** | Authentication and authorization |
| **Row Level Security (RLS)** | Database-level access control |
| **Edge Functions** | Serverless backend logic |
| **Real-time Subscriptions** | Live data updates |

### 3.3 Additional Libraries

| Library | Purpose |
|---------|---------|
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **Sonner** | Toast notifications |
| **Framer Motion** | Animations (implied) |
| **date-fns-tz** | Timezone handling |

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

| Role | Description |
|------|-------------|
| **Admin** | Full system access, user management, settings control |
| **Doctor** | Clinical operations, patient care, prescriptions, lab tests |
| **Nurse** | Patient care, room management, medical records assistance |
| **Patient** | Personal health information, appointment booking |
| **Receptionist** | Front desk operations, scheduling, billing |
| **Pharmacist** | Prescription management, medication dispensing, inventory |

### 4.2 Module Access Matrix

| Module | Admin | Doctor | Nurse | Patient | Receptionist | Pharmacist |
|--------|:-----:|:------:|:-----:|:-------:|:------------:|:----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Patient Registry | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Medical Records | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Prescriptions | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Lab Tests | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Rooms & Beds | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Billing | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Pharmacy | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Staff | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 5. System Modules

### 5.1 Patient Management

**Features:**
- Patient registration with comprehensive demographic data
- Medical history tracking
- Insurance information management
- Emergency contact details
- Search and filter functionality
- Patient status tracking (Active/Inactive)

**Data Captured:**
- Personal Information (name, DOB, gender, contact)
- Medical Details (blood type, allergies, medical history)
- Insurance Details (provider, policy number)
- Emergency Contact Information

### 5.2 Appointment Scheduling

**Features:**
- Real-time appointment booking
- Doctor availability management
- Appointment type categorization
- Status tracking (Scheduled, Completed, Cancelled, No-Show)
- Duration configuration
- Notes and symptoms recording
- Calendar view integration

**Appointment Types:**
- Consultation
- Follow-up
- Emergency
- Routine Check-up
- Specialist Visit

### 5.3 Medical Records

**Features:**
- Comprehensive visit documentation
- Diagnosis and treatment recording
- Medication tracking
- Follow-up scheduling
- Doctor notes
- Historical record access
- Symptom documentation

### 5.4 Prescription Management

**Features:**
- Digital prescription creation
- Medication database integration
- Dosage and frequency specification
- Duration setting
- Special instructions
- Drug interaction warnings
- Side effects documentation
- Prescription status tracking (Active, Completed, Cancelled)

### 5.5 Laboratory Tests

**Features:**
- Test ordering system
- Multiple test types support
- Result recording
- Normal range indication
- Priority levels (Normal, Urgent, STAT)
- Lab technician assignment
- Cost tracking
- Status management (Pending, In Progress, Completed)

### 5.6 Room & Bed Management

**Features:**
- Room type categorization (ICU, General, Private, Semi-Private)
- Occupancy tracking
- Floor and department assignment
- Daily rate configuration
- Amenities listing
- Status management (Available, Occupied, Maintenance)
- Capacity monitoring

### 5.7 Billing & Payments

**Features:**
- Patient billing generation
- Payment recording
- Multiple payment methods (Cash, Card, Insurance, Bank Transfer)
- Invoice generation
- Payment status tracking (Pending, Paid, Overdue, Refunded)
- Transaction ID recording
- Revenue analytics

### 5.8 Pharmacy & Inventory

**Features:**
- Medication inventory management
- Stock level monitoring
- Expiry date tracking
- Reorder alerts (minimum stock levels)
- Supplier management
- Batch number tracking
- Category organization
- Location tracking within facility

### 5.9 Staff Management

**Features:**
- Doctor registration and management
- Nurse registration and management
- Staff scheduling
- Department assignment
- License verification
- Specialization tracking
- Contact information management
- Status tracking (Active, Inactive, On Leave)

### 5.10 Reports & Analytics

**Features:**
- Dashboard statistics
- Appointment analytics
- Revenue reports
- Department distribution
- Time-range filtering (7 days, 30 days, 90 days, 1 year)
- Visual charts and graphs
- Export capabilities

**Report Types:**
- Patient statistics
- Appointment status distribution
- Revenue trends
- Department staff distribution
- Lab test analytics

### 5.11 Notification System

**Features:**
- Real-time in-app notifications
- Priority levels (Low, Normal, High, Urgent)
- Notification types (System, Appointment, Lab Result, Prescription, Alert, Reminder)
- Read/unread status
- Action URLs
- Metadata support
- Email/SMS/Push notification flags
- Expiration dates

### 5.12 Reminder System

**Features:**
- Custom reminder creation
- Scheduling with specific times
- Recurring reminders (Daily, Weekly, Monthly)
- Related entity linking (appointments, prescriptions, etc.)
- Status tracking (Pending, Sent, Dismissed)
- User-specific reminders

### 5.13 Settings

**Features:**
- User profile management
- Password change
- Theme preferences (Light/Dark mode)
- Notification preferences
- Language settings
- Hospital-wide settings (Admin only)

---

## 6. Database Architecture

### 6.1 Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   patients  │────►│appointments │◄────│   doctors   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│medical_     │     │prescriptions│     │   nurses    │
│records      │     └─────────────┘     └─────────────┘
└─────────────┘            │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  lab_tests  │     │  inventory  │     │    rooms    │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  payments   │     │notifications│     │  reminders  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 6.2 Database Tables

#### **patients**
Primary table for patient information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| first_name | varchar | No | - | Patient's first name |
| last_name | varchar | No | - | Patient's last name |
| date_of_birth | date | No | - | Birth date |
| gender | varchar | No | - | Gender (Male/Female/Other) |
| phone | varchar | Yes | - | Contact phone |
| email | varchar | Yes | - | Email address |
| address | text | Yes | - | Physical address |
| emergency_contact_name | varchar | Yes | - | Emergency contact |
| emergency_contact_phone | varchar | Yes | - | Emergency phone |
| blood_type | varchar | Yes | - | Blood type (A+, A-, B+, etc.) |
| allergies | text | Yes | - | Known allergies |
| medical_history | text | Yes | - | Medical history summary |
| insurance_provider | varchar | Yes | - | Insurance company |
| insurance_policy_number | varchar | Yes | - | Policy number |
| status | varchar | Yes | 'active' | Active/Inactive |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **doctors**
Healthcare provider information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| first_name | varchar | No | - | Doctor's first name |
| last_name | varchar | No | - | Doctor's last name |
| specialization | varchar | No | - | Medical specialty |
| phone | varchar | Yes | - | Contact phone |
| email | varchar | Yes | - | Email address |
| license_number | varchar | No | - | Medical license |
| department | varchar | Yes | - | Hospital department |
| years_of_experience | integer | Yes | - | Years practicing |
| consultation_fee | numeric | Yes | - | Fee per consultation |
| availability_schedule | jsonb | Yes | - | Weekly schedule |
| status | varchar | Yes | 'active' | Active/Inactive/On Leave |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **nurses**
Nursing staff information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| first_name | varchar | No | - | Nurse's first name |
| last_name | varchar | No | - | Nurse's last name |
| phone | varchar | Yes | - | Contact phone |
| email | varchar | Yes | - | Email address |
| license_number | varchar | No | - | Nursing license |
| department | varchar | Yes | - | Assigned department |
| shift_schedule | varchar | Yes | - | Shift pattern |
| specialization | varchar | Yes | - | Nursing specialty |
| years_of_experience | integer | Yes | - | Years practicing |
| status | varchar | Yes | 'active' | Active/Inactive/On Leave |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **appointments**
Appointment scheduling records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| patient_id | uuid | No | - | Reference to patient |
| doctor_id | uuid | No | - | Reference to doctor |
| appointment_date | date | No | - | Scheduled date |
| appointment_time | time | No | - | Scheduled time |
| duration | integer | Yes | 30 | Duration in minutes |
| type | varchar | Yes | 'consultation' | Appointment type |
| status | varchar | Yes | 'scheduled' | Current status |
| symptoms | text | Yes | - | Patient symptoms |
| notes | text | Yes | - | Additional notes |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **medical_records**
Patient visit and treatment records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| patient_id | uuid | No | - | Reference to patient |
| doctor_id | uuid | No | - | Reference to doctor |
| visit_date | date | No | - | Date of visit |
| diagnosis | text | Yes | - | Medical diagnosis |
| symptoms | text | Yes | - | Presented symptoms |
| treatment | text | Yes | - | Treatment plan |
| medications | text | Yes | - | Prescribed medications |
| notes | text | Yes | - | Clinical notes |
| follow_up_date | date | Yes | - | Follow-up appointment |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **prescriptions**
Medication prescriptions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| patient_id | uuid | No | - | Reference to patient |
| doctor_id | uuid | No | - | Prescribing doctor |
| medication_name | varchar | No | - | Drug name |
| dosage | varchar | Yes | - | Dosage amount |
| frequency | varchar | Yes | - | How often to take |
| duration | varchar | Yes | - | Treatment duration |
| quantity | integer | Yes | - | Quantity to dispense |
| instructions | text | Yes | - | Special instructions |
| side_effects | text | Yes | - | Known side effects |
| drug_interactions | text | Yes | - | Drug interactions |
| date_prescribed | date | Yes | CURRENT_DATE | Prescription date |
| status | varchar | Yes | 'active' | Active/Completed/Cancelled |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **lab_tests**
Laboratory test orders and results.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| patient_id | uuid | No | - | Reference to patient |
| doctor_id | uuid | No | - | Ordering doctor |
| test_name | varchar | No | - | Test name |
| test_type | varchar | Yes | - | Category of test |
| test_date | date | Yes | CURRENT_DATE | Date ordered |
| results | text | Yes | - | Test results |
| normal_range | varchar | Yes | - | Normal values |
| status | varchar | Yes | 'pending' | Pending/In Progress/Completed |
| priority | varchar | Yes | 'normal' | Normal/Urgent/STAT |
| lab_technician | varchar | Yes | - | Assigned technician |
| cost | numeric | Yes | - | Test cost |
| notes | text | Yes | - | Additional notes |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **inventory**
Medical supplies and equipment inventory.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| item_name | varchar | No | - | Item name |
| category | varchar | Yes | - | Item category |
| current_stock | integer | No | 0 | Current quantity |
| minimum_stock | integer | Yes | 10 | Reorder threshold |
| maximum_stock | integer | Yes | 1000 | Maximum capacity |
| unit_price | numeric | Yes | - | Price per unit |
| supplier | varchar | Yes | - | Supplier name |
| batch_number | varchar | Yes | - | Batch identifier |
| expiry_date | date | Yes | - | Expiration date |
| last_restocked | date | Yes | - | Last restock date |
| location | varchar | Yes | - | Storage location |
| status | varchar | Yes | 'available' | Available/Out of Stock/Expired |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **rooms**
Hospital room management.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| room_number | varchar | No | - | Room identifier |
| room_type | varchar | No | - | ICU/General/Private/etc. |
| department | varchar | Yes | - | Department |
| floor | integer | Yes | - | Floor number |
| capacity | integer | Yes | 1 | Bed capacity |
| current_occupancy | integer | Yes | 0 | Current patients |
| daily_rate | numeric | Yes | - | Cost per day |
| amenities | text[] | Yes | - | Room amenities |
| status | varchar | Yes | 'available' | Available/Occupied/Maintenance |
| notes | text | Yes | - | Additional notes |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **payments**
Billing and payment records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| patient_id | uuid | No | - | Reference to patient |
| amount | numeric | No | - | Payment amount |
| payment_date | date | Yes | CURRENT_DATE | Date of payment |
| payment_method | varchar | Yes | 'cash' | Cash/Card/Insurance/Transfer |
| payment_status | varchar | Yes | 'pending' | Pending/Paid/Overdue/Refunded |
| description | text | Yes | - | Payment description |
| invoice_number | varchar | Yes | - | Invoice reference |
| transaction_id | varchar | Yes | - | Transaction reference |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **notifications**
System notification records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Target user |
| title | text | No | - | Notification title |
| message | text | No | - | Notification body |
| type | text | No | - | Notification type |
| priority | text | No | 'normal' | Low/Normal/High/Urgent |
| read | boolean | No | false | Read status |
| action_url | text | Yes | - | Action link |
| metadata | jsonb | Yes | '{}' | Additional data |
| expires_at | timestamp | Yes | - | Expiration time |
| sent_via_email | boolean | Yes | false | Email sent flag |
| sent_via_sms | boolean | Yes | false | SMS sent flag |
| sent_via_push | boolean | Yes | false | Push sent flag |
| created_at | timestamp | No | now() | Creation timestamp |
| updated_at | timestamp | No | now() | Last update timestamp |

---

#### **reminders**
Personal reminder system.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Owner user |
| title | text | No | - | Reminder title |
| description | text | Yes | - | Reminder details |
| reminder_type | text | No | - | Type of reminder |
| reminder_time | timestamp | No | - | When to remind |
| recurring | boolean | Yes | false | Is recurring |
| recurring_pattern | text | Yes | - | Daily/Weekly/Monthly |
| related_id | uuid | Yes | - | Related entity ID |
| related_table | text | Yes | - | Related table name |
| status | text | No | 'pending' | Pending/Sent/Dismissed |
| created_at | timestamp | No | now() | Creation timestamp |
| updated_at | timestamp | No | now() | Last update timestamp |

---

#### **profiles**
User profile information (linked to Supabase Auth).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | - | User ID (from auth.users) |
| first_name | text | No | - | User's first name |
| last_name | text | No | - | User's last name |
| phone | text | Yes | - | Contact phone |
| department | text | Yes | - | Department |
| specialization | text | Yes | - | Specialization |
| license_number | text | Yes | - | Professional license |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **user_roles**
Role assignments for users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Reference to auth.users |
| role | app_role (enum) | No | - | Assigned role |
| created_at | timestamp | Yes | now() | Creation timestamp |

**Role Enum Values:** `admin`, `doctor`, `nurse`, `patient`, `receptionist`, `pharmacist`

---

#### **user_settings**
User-specific preferences.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Reference to user |
| setting_key | text | No | - | Setting identifier |
| setting_value | jsonb | No | - | Setting value |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

#### **hospital_settings**
System-wide configuration.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| setting_category | text | No | - | Setting category |
| setting_key | text | No | - | Setting identifier |
| setting_value | jsonb | No | - | Setting value |
| updated_by | uuid | Yes | - | Last modifier |
| created_at | timestamp | Yes | now() | Creation timestamp |
| updated_at | timestamp | Yes | now() | Last update timestamp |

---

### 6.3 Database Functions

| Function | Purpose |
|----------|---------|
| `update_updated_at_column()` | Automatically updates `updated_at` timestamp on row modifications |
| `has_role(_user_id, _role)` | Checks if a user has a specific role (security definer) |
| `get_user_role(_user_id)` | Returns the role of a user |
| `handle_new_user()` | Trigger function that creates profile and role on user signup |

---

## 7. Security Features

### 7.1 Authentication

- **Supabase Authentication** - Secure user authentication
- **Email/Password Login** - Standard authentication flow
- **Session Management** - Automatic token refresh
- **Protected Routes** - Client-side route guards

### 7.2 Authorization

- **Row Level Security (RLS)** - Database-level access control
- **Role-Based Access Control** - Feature access based on user roles
- **Security Definer Functions** - Safe role verification without recursion

### 7.3 RLS Policies Overview

| Table | Policy Summary |
|-------|----------------|
| patients | Public access for authenticated users |
| doctors | Public access for authenticated users |
| nurses | Public access for authenticated users |
| appointments | Public access for authenticated users |
| medical_records | Public access for authenticated users |
| prescriptions | Public access for authenticated users |
| lab_tests | Public access for authenticated users |
| inventory | Public access for authenticated users |
| rooms | Public access for authenticated users |
| payments | Public access for authenticated users |
| notifications | Users see own + Admin sees all |
| reminders | Users manage own + Admin manages all |
| profiles | Users manage own + Admin views all |
| user_roles | Users view own + Admin manages all |
| user_settings | Users manage own only |
| hospital_settings | Admin only access |

### 7.4 Data Protection

- **UUID Primary Keys** - Non-sequential identifiers
- **Encrypted Connections** - HTTPS/TLS encryption
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries via Supabase client

---

## 8. User Interface

### 8.1 Design System

- **Theme Support** - Light and Dark modes
- **Responsive Layout** - Mobile, Tablet, Desktop optimized
- **Consistent Components** - shadcn/ui component library
- **Medical Color Palette** - Blue, Green, Purple, Orange, Red accents
- **Accessible Design** - WCAG compliance considerations

### 8.2 Navigation

- **Collapsible Sidebar** - Role-based menu items
- **Header Bar** - User info, notifications, search
- **Breadcrumb Navigation** - Context awareness
- **Quick Actions** - Common task shortcuts

### 8.3 UI Components

- Data Tables with sorting, filtering, pagination
- Modal dialogs for forms
- Toast notifications for feedback
- Loading states and skeletons
- Charts and visualizations
- Form validation feedback

---

## 9. API & Integrations

### 9.1 Supabase Client

```typescript
import { supabase } from "@/integrations/supabase/client";
```

### 9.2 Data Manager

Centralized data access layer (`src/lib/dataManager.ts`):

- CRUD operations for all entities
- Search functionality
- Dashboard statistics aggregation
- Type-safe data handling

### 9.3 Real-time Features

- Live notification updates
- Appointment status changes
- Inventory level alerts

---

## 10. System Requirements

### 10.1 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 10.2 Server Requirements

- **Supabase Project** - Free tier or above
- **PostgreSQL** - Version 15+ (Supabase managed)
- **Edge Functions** - Deno runtime (Supabase managed)

### 10.3 Deployment

- **Frontend Hosting** - Any static hosting (Lovable, Vercel, Netlify)
- **SSL Certificate** - Required for production
- **Custom Domain** - Supported

---

## Appendix A: File Structure

```
src/
├── components/
│   ├── appointments/
│   │   └── AppointmentScheduler.tsx
│   ├── dashboard/
│   │   ├── AdminDashboard.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── NurseDashboard.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── PharmacistDashboard.tsx
│   │   └── ReceptionistDashboard.tsx
│   ├── forms/
│   │   ├── DoctorRegistrationForm.tsx
│   │   ├── NurseRegistrationForm.tsx
│   │   ├── PatientRegistrationForm.tsx
│   │   ├── PaymentManagementForm.tsx
│   │   ├── RecordUpdateForm.tsx
│   │   └── StaffRegistrationForm.tsx
│   ├── inventory/
│   │   └── InventoryManagement.tsx
│   ├── lab-tests/
│   │   └── LabTestManagement.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── Sidebar.tsx
│   ├── medical/
│   │   └── MedicalRecords.tsx
│   ├── notifications/
│   │   └── NotificationCenter.tsx
│   ├── patient-portal/
│   │   ├── AppointmentsView.tsx
│   │   ├── MedicalRecordsView.tsx
│   │   ├── PatientPortalNav.tsx
│   │   └── PersonalInfoSection.tsx
│   ├── patients/
│   │   └── PatientManagement.tsx
│   ├── payments/
│   │   └── PaymentsList.tsx
│   ├── prescriptions/
│   │   └── PrescriptionManagement.tsx
│   ├── rooms/
│   │   └── RoomManagement.tsx
│   ├── settings/
│   │   └── Settings.tsx
│   ├── shared/
│   │   ├── ConfirmDialog.tsx
│   │   └── DataTable.tsx
│   └── ui/
│       └── [shadcn components]
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useNotifications.ts
│   └── useSettings.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── lib/
│   ├── dataManager.ts
│   └── utils.ts
├── pages/
│   ├── AboutUs.tsx
│   ├── Billing.tsx
│   ├── Dashboard.tsx
│   ├── Index.tsx
│   ├── Login.tsx
│   ├── NotFound.tsx
│   ├── PatientRegistry.tsx
│   ├── Pharmacy.tsx
│   ├── Reports.tsx
│   ├── Services.tsx
│   └── Staff.tsx
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

---

## Appendix B: Contact & Support

For technical support or inquiries about this Hospital Management System, please contact the development team.

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**System Version:** HMS v1.0

---

*This documentation is proprietary and confidential. Unauthorized distribution is prohibited.*
