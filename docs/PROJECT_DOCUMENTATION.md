# Hospital Management System (HMS)
## Complete Project Documentation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Public Website Modules](#5-public-website-modules)
6. [Core System Modules](#6-core-system-modules)
7. [Blood Bank Module](#7-blood-bank-module)
8. [Operation Theatre Module](#8-operation-theatre-module)
9. [Patient Portal Module](#9-patient-portal-module)
10. [Department Management](#10-department-management)
11. [Staff Management Module](#11-staff-management-module)
12. [Notification & Reminder System](#12-notification--reminder-system)
13. [Reports & Analytics](#13-reports--analytics)
14. [Settings & Configuration](#14-settings--configuration)
15. [Database Architecture](#15-database-architecture)
16. [Security Features](#16-security-features)
17. [Edge Functions & APIs](#17-edge-functions--apis)
18. [Custom Hooks](#18-custom-hooks)
19. [Utility Libraries](#19-utility-libraries)
20. [UI Components Library](#20-ui-components-library)
21. [System Requirements](#21-system-requirements)
22. [File Structure](#22-file-structure)

---

## 1. Executive Summary

The Hospital Management System (HMS) is a comprehensive, web-based healthcare management solution designed to streamline hospital operations, enhance patient care, and improve administrative efficiency. The system provides a centralized platform for managing patients, appointments, medical records, billing, inventory, blood bank, operation theatres, and staff operations.

### Key Benefits

| Benefit | Description |
|---------|-------------|
| **Centralized Data Management** | All patient and operational data in one secure location |
| **Role-Based Access Control** | Secure access with permissions based on 7 different user roles |
| **Real-Time Updates** | Live data synchronization across all modules |
| **Responsive Design** | Accessible on desktop, tablet, and mobile devices |
| **Comprehensive Reporting** | Analytics and insights for informed decision-making |
| **Notification System** | Real-time alerts and reminders for staff and patients |
| **Blood Bank Management** | Complete blood inventory, donors, and transfusion tracking |
| **Operation Theatre Management** | Surgery scheduling, team management, and post-op care |
| **Patient Self-Service Portal** | Patients can book appointments, message doctors, request refills |
| **Multi-Timezone Support** | Hospital timezone configuration for global operations |

---

## 2. System Overview

### 2.1 Public-Facing Website

| Page | Route | Description | Key Features |
|------|-------|-------------|--------------|
| **Landing Page** | `/` | Professional homepage | Hero section with hospital image, features grid, team section, testimonials, trust badges, CTA section |
| **About Us** | `/about` | Hospital information | History, mission, vision, values, leadership team profiles |
| **Services** | `/services` | Medical services list | Department listing, specializations, healthcare services offered |
| **Contact** | `/contact` | Contact information | Contact form with real email delivery, Google Maps integration, contact info cards |
| **Login Portal** | `/login` | Authentication page | Staff and patient login with role-based redirection |

### 2.2 Dashboard System

The system provides **7 role-specific dashboards**:

| Dashboard | Target User | Key Widgets |
|-----------|-------------|-------------|
| **Admin Dashboard** | Administrators | System statistics, pending verifications, recent activities, user management shortcuts |
| **Doctor Dashboard** | Physicians | Today's appointments, patient queue, recent prescriptions, lab results pending |
| **Nurse Dashboard** | Nursing Staff | Patient assignments, room status, task list, medication schedules |
| **Patient Dashboard** | Patients | Upcoming appointments, prescriptions, medical history, doctor messaging |
| **Receptionist Dashboard** | Front Desk | Appointment scheduling, patient registration queue, billing shortcuts |
| **Pharmacist Dashboard** | Pharmacy Staff | Prescription queue, inventory alerts, drug dispensing |
| **Lab Technician Dashboard** | Laboratory Staff | Pending tests, in-progress tests, urgent tests, test results entry |

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | Core UI framework with functional components and hooks |
| **TypeScript** | Latest | Type-safe development with strict type checking |
| **Vite** | Latest | Build tool and development server with HMR |
| **Tailwind CSS** | Latest | Utility-first CSS styling framework |
| **shadcn/ui** | Latest | Pre-built accessible UI components based on Radix UI |
| **React Router** | 6.26.2 | Client-side routing with protected routes |
| **TanStack Query** | 5.56.2 | Server state management with caching |
| **Recharts** | 3.1.0 | Data visualization and charting |
| **Lucide React** | 0.462.0 | Icon library with 1000+ icons |
| **date-fns** | 3.6.0 | Date manipulation and formatting |
| **date-fns-tz** | 3.2.0 | Timezone handling |
| **React Hook Form** | 7.53.0 | Form state management |
| **Zod** | 3.23.8 | Schema validation |
| **Sonner** | 1.5.0 | Toast notifications |
| **Framer Motion** | Implied | Animations and transitions |

### 3.2 Backend Technologies

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Relational database with advanced features |
| **Supabase Auth** | Authentication and session management |
| **Row Level Security (RLS)** | Database-level access control policies |
| **Edge Functions** | Serverless Deno-based backend logic |
| **Real-time Subscriptions** | Live data updates via WebSocket |
| **Storage Buckets** | File storage for lab reports and documents |

### 3.3 External Integrations

| Integration | Purpose |
|-------------|---------|
| **Resend** | Email delivery for contact forms and notifications |
| **Google Maps** | Location display on contact page |

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

| Role | Code | Description |
|------|------|-------------|
| **Admin** | `admin` | Full system access, user management, settings control, system configuration |
| **Doctor** | `doctor` | Clinical operations, patient care, prescriptions, lab tests, medical records |
| **Nurse** | `nurse` | Patient care, room management, medical records assistance, medication administration |
| **Patient** | `patient` | Personal health information, appointment booking, messaging, prescription refills |
| **Receptionist** | `receptionist` | Front desk operations, scheduling, billing, patient registration verification |
| **Pharmacist** | `pharmacist` | Prescription management, medication dispensing, inventory control |
| **Lab Technician** | `lab_technician` | Laboratory operations, test processing, results entry, report uploads |

### 4.2 Complete Module Access Matrix

| Module | Admin | Doctor | Nurse | Patient | Receptionist | Pharmacist | Lab Technician |
|--------|:-----:|:------:|:-----:|:-------:|:------------:|:----------:|:--------------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ (View) |
| Patient Registry | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Queue Management** | ✅ | ✅ (Own) | ✅ (View) | ✅ (Own) | ✅ | ❌ | ❌ |
| Medical Records | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Prescriptions | ✅ | ✅ | ✅ (View) | ✅ (View) | ❌ | ✅ | ❌ |
| Lab Tests | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Rooms & Beds | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Billing | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Pharmacy/Inventory | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Blood Bank | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Operation Theatre | ✅ | ✅ | ✅ (View) | ✅ (Own) | ❌ | ❌ | ❌ |
| Departments | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Staff Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 4.3 Lab Technician Permissions

Lab technicians have specific permissions designed for laboratory operations:

| Permission | Description |
|------------|-------------|
| `view_lab_tests` | View all laboratory test orders |
| `manage_lab_results` | Update test status, enter results, upload reports |
| `view_patients` | View patient information for test context |
| `view_doctors` | View ordering doctor information |

**Restrictions:**
- Cannot order new lab tests (only doctors can order)
- Cannot delete lab tests
- Cannot modify patient, doctor, or test name fields
- Can only update: status, results, lab technician, normal range, cost, notes, report images

### 4.3 Patient Registration Workflow

```
Patient Signup → Pending Verification Status → 
Admin/Receptionist Review → Approve/Reject → 
Patient Notified → Active Status
```

**Queue States:**
- `pending` - Awaiting review
- `approved` - Patient verified and active
- `rejected` - Registration rejected with reason

---

## 5. Public Website Modules

### 5.1 Landing Page (`/`)

**File:** `src/pages/Index.tsx`

| Component | File | Features |
|-----------|------|----------|
| **Navbar** | `src/components/landing/Navbar.tsx` | Glassmorphic navigation, mobile responsive menu, login/signup buttons, scroll animations |
| **HeroSection** | `src/components/landing/HeroSection.tsx` | Full-screen background image, animated text, CTA button, gradient overlays |
| **AnimatedBackground** | `src/components/landing/AnimatedBackground.tsx` | Mesh gradient background with floating elements |
| **FloatingElements** | `src/components/landing/FloatingElements.tsx` | 3D floating medical icons with animations |
| **FeaturesSection** | `src/components/landing/FeaturesSection.tsx` | 6 feature cards with icons, images, hover effects |
| **BentoGrid** | `src/components/landing/BentoGrid.tsx` | Modern bento grid layout showcasing features |
| **TrustBadges** | `src/components/landing/TrustBadges.tsx` | Certification and compliance badges |
| **TeamSection** | `src/components/landing/TeamSection.tsx` | Leadership team with photos, bios, social links |
| **TestimonialsSection** | `src/components/landing/TestimonialsSection.tsx` | Patient testimonials with ratings and photos |
| **CTASection** | `src/components/landing/CTASection.tsx` | Call-to-action section with gradient background |
| **Footer** | `src/components/landing/Footer.tsx` | Multi-column footer with links, contact info, social icons |
| **ScrollAnimationWrapper** | `src/components/landing/ScrollAnimationWrapper.tsx` | Scroll-triggered animations wrapper |
| **AnimatedCounter** | `src/components/landing/AnimatedCounter.tsx` | Animated statistics counter |

### 5.2 About Us Page (`/about`)

**File:** `src/pages/AboutUs.tsx`

| Section | Features |
|---------|----------|
| Hero Section | Page title with gradient text |
| Mission & Vision | Company values and goals |
| History Timeline | Hospital milestones |
| Leadership Team | Staff profiles with photos |
| Achievements | Awards and certifications |

### 5.3 Services Page (`/services`)

**File:** `src/pages/Services.tsx`

| Section | Features |
|---------|----------|
| Services Grid | All medical departments listed |
| Department Cards | Icon, description, specialties |
| Feature Highlights | Key capabilities per department |

### 5.4 Contact Page (`/contact`)

**File:** `src/pages/Contact.tsx`

| Section | Features |
|---------|----------|
| Contact Info Cards | Address, phone, email, working hours with gradient icons |
| Contact Form | Name, email, phone, subject, message fields |
| Form Validation | Real-time validation with error messages |
| Email Delivery | Sends email to `arshmanrasool75@gmail.com` via Resend |
| Confirmation Email | Auto-sends thank you email to user |
| Google Maps | Embedded interactive location map |
| Loading State | Spinner during form submission |

**Edge Function:** `supabase/functions/send-contact-email/index.ts`

### 5.5 Login Page (`/login`)

**File:** `src/pages/Login.tsx`

| Feature | Description |
|---------|-------------|
| Email/Password Login | Standard authentication |
| Role-Based Redirect | Redirects to appropriate dashboard |
| Remember Me | Session persistence option |
| Error Handling | Clear error messages |
| Loading States | Submit button loading indicator |

---

## 6. Core System Modules

### 6.1 Patient Management

**Files:**
- `src/components/patients/PatientManagement.tsx`
- `src/components/forms/PatientRegistrationForm.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Patient List | Searchable, filterable data table |
| Patient Registration | Comprehensive registration form |
| Edit Patient | Update patient information |
| Delete Patient | Soft delete with confirmation |
| Search | By name, email, phone, blood type |
| Filter | By status (Active/Inactive) |
| Export | Data export functionality |

#### Data Fields:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | Text | ✅ | Min 2 characters |
| Last Name | Text | ✅ | Min 2 characters |
| Date of Birth | Date | ✅ | Must be in past |
| Gender | Select | ✅ | Male/Female/Other |
| Email | Email | ❌ | Valid email format |
| Phone | Phone | ❌ | Valid phone format |
| Address | Text | ❌ | - |
| Blood Type | Select | ❌ | A+/A-/B+/B-/AB+/AB-/O+/O- |
| Allergies | Text | ❌ | - |
| Medical History | Textarea | ❌ | - |
| Emergency Contact Name | Text | ❌ | - |
| Emergency Contact Phone | Phone | ❌ | - |
| Insurance Provider | Text | ❌ | - |
| Insurance Policy Number | Text | ❌ | - |
| Department | Select | ❌ | From departments list |
| Status | Select | ✅ | Active/Inactive/Pending |

### 6.2 Patient Registry (Verification Queue)

**File:** `src/pages/PatientRegistry.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Pending Queue | List of patients awaiting verification |
| Approve Patient | Activate patient account |
| Reject Patient | Reject with reason |
| View Details | Patient information modal |
| Bulk Actions | Approve/Reject multiple patients |
| Notification | Auto-notify patient on status change |

#### Queue Widget:

**File:** `src/components/dashboard/PendingVerificationsWidget.tsx`
- Shows count of pending verifications
- Quick access link to registry page

### 6.3 Appointment Scheduling

**File:** `src/components/appointments/AppointmentScheduler.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Schedule Appointment | Book new appointments |
| Edit Appointment | Modify existing appointments |
| Cancel Appointment | Cancel with status update |
| View by Department | Filter by department |
| Doctor Availability | Real-time availability check |
| Time Slot Selection | Available slots based on doctor schedule |
| Status Management | Scheduled/Confirmed/Completed/Cancelled/No-Show |
| Quick Stats | Today's appointments, pending, completed counts |

#### Appointment Types:

- Consultation
- Follow-up
- Emergency
- Routine Check-up
- Specialist Visit

#### Status Workflow:

```
Scheduled → Confirmed → In Progress → Completed
    ↓          ↓           ↓
Cancelled  Cancelled   Cancelled
    ↓
 No-Show
```

### 6.4 Medical Records

**File:** `src/components/medical/MedicalRecords.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Create Record | New visit documentation |
| Edit Record | Update existing records |
| View History | Patient medical history timeline |
| Search Records | By patient, doctor, date |
| Filter | By date range, doctor |
| Print/Export | Generate printable records |

#### Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Doctor | Select | ✅ |
| Visit Date | Date | ✅ |
| Symptoms | Textarea | ❌ |
| Diagnosis | Textarea | ❌ |
| Treatment | Textarea | ❌ |
| Medications | Textarea | ❌ |
| Notes | Textarea | ❌ |
| Follow-up Date | Date | ❌ |

### 6.5 Prescription Management

**File:** `src/components/prescriptions/PrescriptionManagement.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Create Prescription | New prescription entry |
| Edit Prescription | Modify existing prescription |
| Delete Prescription | Remove prescription |
| Drug Interactions | Warning system for interactions |
| Side Effects | Document known side effects |
| Refill Requests | Process patient refill requests |
| Status Tracking | Active/Completed/Cancelled |

#### Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Doctor | Select | ✅ |
| Medication Name | Text | ✅ |
| Dosage | Text | ❌ |
| Frequency | Text | ❌ |
| Duration | Text | ❌ |
| Quantity | Number | ❌ |
| Instructions | Textarea | ❌ |
| Side Effects | Textarea | ❌ |
| Drug Interactions | Textarea | ❌ |
| Date Prescribed | Date | ✅ |
| Status | Select | ✅ |

### 6.6 Laboratory Tests

**File:** `src/components/lab-tests/LabTestManagement.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Order Test | Create new lab test order |
| Record Results | Enter test results |
| Upload Report | Attach lab report images |
| Priority Levels | Normal/Urgent/STAT |
| Status Tracking | Pending/In Progress/Completed |
| Normal Ranges | Display reference ranges |
| Cost Tracking | Test cost management |
| Assign Technician | Lab technician assignment |

#### Test Types:

- Blood Tests (CBC, Lipid Panel, Blood Sugar, etc.)
- Urine Tests
- Imaging (X-Ray, MRI, CT Scan, Ultrasound)
- Pathology
- Microbiology
- Cardiology (ECG, Echo)

#### Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Doctor | Select | ✅ |
| Test Name | Text | ✅ |
| Test Type | Select | ❌ |
| Test Date | Date | ✅ |
| Priority | Select | ✅ |
| Lab Technician | Text | ❌ |
| Results | Textarea | ❌ |
| Normal Range | Text | ❌ |
| Cost | Number | ❌ |
| Notes | Textarea | ❌ |
| Report Image URL | File | ❌ |
| Status | Select | ✅ |

**Storage:** Lab reports stored in `lab-reports` Supabase storage bucket.

### 6.7 Room & Bed Management

**Files:**
- `src/components/rooms/RoomManagement.tsx`
- `src/components/rooms/BedAssignment.tsx`

#### Room Management Features:

| Feature | Description |
|---------|-------------|
| Add Room | Create new room entry |
| Edit Room | Modify room details |
| Delete Room | Remove room |
| View Occupancy | Current patients in room |
| Status Management | Available/Occupied/Maintenance |

#### Room Types:

- ICU (Intensive Care Unit)
- General Ward
- Private Room
- Semi-Private Room
- Emergency Room
- Pediatric Ward
- Maternity Ward
- Surgical Ward

#### Bed Assignment Features:

| Feature | Description |
|---------|-------------|
| Assign Patient | Assign patient to bed |
| Transfer Patient | Move to different room/bed |
| Discharge Patient | Release from room |
| Admission Notes | Record admission reason |
| Surgery Link | Link to surgery record |

#### Room Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Room Number | Text | ✅ |
| Room Type | Select | ✅ |
| Department | Text | ❌ |
| Floor | Number | ❌ |
| Capacity | Number | ✅ |
| Daily Rate | Number | ❌ |
| Amenities | Array | ❌ |
| Status | Select | ✅ |
| Notes | Textarea | ❌ |

### 6.8 Billing & Payments

**Files:**
- `src/pages/Billing.tsx`
- `src/components/payments/PaymentsList.tsx`
- `src/components/forms/PaymentManagementForm.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Create Invoice | Generate patient invoice |
| Record Payment | Log payment received |
| Payment History | View all transactions |
| Search Payments | By patient, date, status |
| Filter | By payment method, status |
| Invoice Generation | Auto-generate invoice numbers |
| Export | Export payment data |

#### Payment Methods:

- Cash
- Credit Card
- Debit Card
- Insurance
- Bank Transfer
- Online Payment

#### Payment Statuses:

- Pending
- Paid
- Overdue
- Refunded
- Partially Paid

#### Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Amount | Number | ✅ |
| Payment Date | Date | ✅ |
| Payment Method | Select | ✅ |
| Payment Status | Select | ✅ |
| Description | Textarea | ❌ |
| Invoice Number | Text | Auto-generated |
| Transaction ID | Text | ❌ |

### 6.9 Pharmacy & Inventory

**Files:**
- `src/pages/Pharmacy.tsx`
- `src/components/inventory/InventoryManagement.tsx`

#### Features:

| Feature | Description |
|---------|-------------|
| Add Item | Add new inventory item |
| Edit Item | Update item details |
| Delete Item | Remove item |
| Stock Alerts | Low stock notifications |
| Expiry Tracking | Items nearing expiration |
| Restock | Record restocking |
| Search | By name, category, supplier |
| Filter | By category, status |

#### Inventory Categories:

- Medications
- Medical Supplies
- Equipment
- Surgical Instruments
- Laboratory Supplies
- PPE (Personal Protective Equipment)
- First Aid Supplies

#### Stock Status:

- Available
- Low Stock (below minimum)
- Out of Stock
- Expired
- Discontinued

#### Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Item Name | Text | ✅ |
| Category | Select | ❌ |
| Current Stock | Number | ✅ |
| Minimum Stock | Number | ❌ |
| Maximum Stock | Number | ❌ |
| Unit Price | Number | ❌ |
| Supplier | Text | ❌ |
| Batch Number | Text | ❌ |
| Expiry Date | Date | ❌ |
| Last Restocked | Date | ❌ |
| Location | Text | ❌ |
| Status | Select | ✅ |

---

## 7. Blood Bank Module

**Page:** `src/pages/BloodBank.tsx`

The Blood Bank module is a comprehensive system for managing all aspects of blood donation, storage, and distribution. It includes donor registration, stock management, blood requests, transfusion records, compatibility checking, and detailed reporting.

### 7.1 Blood Bank Dashboard

**File:** `src/components/blood-bank/BloodBankDashboard.tsx`

| Feature | Description |
|---------|-------------|
| Stock Overview | Visual display of all blood group levels with color-coded status |
| Quick Stats Cards | Total donors, pending requests, recent donations, issued units |
| Low Stock Alerts | Warning indicators for blood groups below threshold |
| Recent Activity Feed | Latest donations, issues, and requests timeline |
| Blood Group Distribution Chart | Pie chart showing stock distribution |
| Critical Alerts Banner | Urgent notifications for out-of-stock groups |
| Quick Actions | Fast access to common operations |

### 7.2 Blood Groups Management

**File:** `src/components/blood-bank/BloodGroupsManagement.tsx`

| Feature | Description |
|---------|-------------|
| View Blood Groups | List all 8 blood group types with current stock |
| Add Blood Group | Create new blood group entry |
| Edit Blood Group | Modify blood group details |
| Stock Level Indicators | Visual bars showing current vs. target levels |
| Compatibility Display | Quick reference for each group's compatibility |

**Blood Groups Supported:**

| Blood Group | Can Donate To | Can Receive From |
|-------------|---------------|------------------|
| A+ | A+, AB+ | A+, A-, O+, O- |
| A- | A+, A-, AB+, AB- | A-, O- |
| B+ | B+, AB+ | B+, B-, O+, O- |
| B- | B+, B-, AB+, AB- | B-, O- |
| AB+ | AB+ (Universal Recipient) | All Types |
| AB- | AB+, AB- | A-, B-, AB-, O- |
| O+ | A+, B+, AB+, O+ | O+, O- |
| O- | All Types (Universal Donor) | O- |

### 7.3 Blood Stock Management

**File:** `src/components/blood-bank/BloodStockManagement.tsx`

| Feature | Description |
|---------|-------------|
| View Current Stock | Real-time units per blood group |
| Add Stock | Record new blood units received |
| Deduct Stock | Remove units (manual adjustment) |
| Expire Stock | Mark units as expired |
| Stock History | Complete transaction log with filters |
| Threshold Configuration | Set minimum/maximum stock levels |
| Batch Tracking | Track blood units by batch/collection date |
| Auto-Alerts | Notifications when stock falls below minimum |

#### Stock Transaction Types:

| Type | Description |
|------|-------------|
| `add` | New units added (donation, transfer in) |
| `issue` | Units issued to patient |
| `expired` | Units removed due to expiration |
| `adjustment` | Manual stock correction |
| `disposed` | Units disposed (contamination, damage) |
| `transfer_out` | Units transferred to other facility |

### 7.4 Blood Inventory

**File:** `src/components/blood-bank/BloodInventory.tsx`

| Feature | Description |
|---------|-------------|
| Inventory Grid | Visual blood group availability matrix |
| Expiry Tracking | Units nearing expiration with countdown |
| Compatibility Chart | Interactive blood type compatibility display |
| Stock Level Colors | Green (adequate), Yellow (low), Red (critical) |
| Quick Issue | Fast-access buttons for common operations |
| Inventory Export | Export current inventory to CSV/PDF |
| Batch Details | View collection date, expiry, source for each batch |

### 7.5 Donor Management

**File:** `src/components/blood-bank/DonorManagement.tsx`

| Feature | Description |
|---------|-------------|
| Register Donor | Add new blood donor with full details |
| Edit Donor | Update donor information |
| Delete Donor | Soft delete donor record |
| Donor Status | Eligible/Deferred/Ineligible with reasons |
| Last Donation | Track donation history per donor |
| Donation Eligibility | Auto-calculate next eligible date |
| Donor Search | Search by name, blood group, contact |
| Donor History | Complete donation timeline per donor |
| Contact Donors | Quick access to eligible donors for urgent needs |
| Donor Statistics | Donation frequency, total contributions |

#### Donor Data Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | ✅ | Full name of donor |
| Blood Group | Select | ✅ | Donor's blood type |
| Contact | Phone | ❌ | Phone number |
| Email | Email | ❌ | Email address |
| Date of Birth | Date | ❌ | For age verification |
| Address | Text | ❌ | Donor address |
| Last Donation Date | Date | ❌ | Most recent donation |
| Status | Select | ✅ | Eligible/Deferred/Ineligible |
| Deferral Reason | Text | ❌ | Reason if deferred |
| Deferral Until | Date | ❌ | Deferral end date |
| Notes | Textarea | ❌ | Additional notes |

#### Donor Status Rules:

| Status | Description |
|--------|-------------|
| Eligible | Can donate (56+ days since last donation) |
| Deferred | Temporarily ineligible (medical reason, travel, etc.) |
| Ineligible | Permanently cannot donate |

### 7.6 Donation Records

**File:** `src/components/blood-bank/DonationRecords.tsx`

| Feature | Description |
|---------|-------------|
| Record Donation | Log new blood donation with all details |
| Donation History | View all donations with filters |
| Donor Stats | Donations per donor breakdown |
| Blood Collection | Record collection date, volume, staff |
| Health Screening | Pre-donation health check documentation |
| Test Results | Blood testing status (HIV, Hep B, etc.) |
| Certificate Generation | Generate donor appreciation certificates |
| Bulk Recording | Record multiple donations at once |

#### Donation Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Donor | Select | ✅ |
| Blood Group | Select | ✅ |
| Units Collected | Number | ✅ |
| Collection Date | Date | ✅ |
| Collected By | Text | ❌ |
| Health Screening | Boolean | ✅ |
| Test Results | Select | ❌ |
| Notes | Textarea | ❌ |

### 7.7 Blood Requests

**File:** `src/components/blood-bank/BloodRequests.tsx`

| Feature | Description |
|---------|-------------|
| Create Request | New blood request from department/patient |
| Process Request | Approve, fulfill, or reject request |
| Request Status | Pending/Approved/Fulfilled/Rejected tracking |
| Urgency Levels | Normal/Urgent/Emergency with color coding |
| Patient Information | Link request to specific patient |
| Compatibility Check | Auto-check patient blood type compatibility |
| Request History | Complete request log with outcomes |
| Cross-match Records | Document compatibility testing |

#### Request Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Blood Group Needed | Select | ✅ |
| Units Required | Number | ✅ |
| Urgency | Select | ✅ |
| Requesting Doctor | Select | ❌ |
| Department | Select | ❌ |
| Required By Date | Date | ❌ |
| Reason | Textarea | ❌ |
| Status | Select | ✅ |

### 7.8 Blood Issue

**File:** `src/components/blood-bank/BloodIssue.tsx`

| Feature | Description |
|---------|-------------|
| Issue Blood | Dispense blood to patient from stock |
| Patient Selection | Select patient with auto-fill blood type |
| Compatibility Verification | Confirm cross-match before issue |
| Stock Auto-Update | Automatically deduct from blood stock |
| Issue History | Track all blood issues |
| Receipt Generation | Print blood issue receipt |
| Adverse Reaction Logging | Document any reactions |
| Batch Selection | Choose specific batch to issue |

#### Issue Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Blood Group | Select | ✅ |
| Units Given | Number | ✅ |
| Issued By | Text | ❌ |
| Issue Date | Date | ✅ |
| Batch Number | Text | ❌ |
| Cross-match Verified | Boolean | ✅ |
| Notes | Textarea | ❌ |

### 7.9 Transfusion Records

**File:** `src/components/blood-bank/TransfusionRecords.tsx`

| Feature | Description |
|---------|-------------|
| Record Transfusion | Log blood transfusion details |
| Reaction Tracking | Document adverse reactions |
| Transfusion History | Patient transfusion timeline |
| Vital Signs Monitoring | Pre/post-transfusion vitals |
| Staff Assignment | Nurse/doctor who administered |
| Volume Tracking | Track actual volume transfused |
| Incident Reporting | Report and track transfusion incidents |

#### Transfusion Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Blood Issue Record | Select | ✅ |
| Start Time | Datetime | ✅ |
| End Time | Datetime | ❌ |
| Volume Transfused | Number | ❌ |
| Administered By | Select | ❌ |
| Pre-Vitals | JSON | ❌ |
| Post-Vitals | JSON | ❌ |
| Adverse Reaction | Boolean | ✅ |
| Reaction Details | Textarea | ❌ |
| Notes | Textarea | ❌ |

### 7.10 Blood Availability Widget

**File:** `src/components/blood-bank/BloodAvailabilityWidget.tsx`

| Feature | Description |
|---------|-------------|
| Quick View | Dashboard widget for blood levels |
| Color Coding | Green (>75%), Yellow (25-75%), Red (<25%) |
| Click to Expand | Opens detailed inventory modal |
| Critical Alerts | Blinking indicator for out-of-stock |
| Real-time Updates | Live stock level updates |

### 7.11 Blood Bank Reports

**File:** `src/components/blood-bank/BloodBankReports.tsx`

| Report Type | Description | Data Included |
|-------------|-------------|---------------|
| Donation Reports | Donations by period | Donor count, units collected, blood group breakdown |
| Issue Reports | Blood issued by period | Patient count, units issued, by blood group |
| Stock Reports | Inventory snapshots | Current stock, min/max, trends |
| Donor Reports | Donor analytics | Active donors, frequency, demographics |
| Expiry Reports | Expired units | Units lost, by blood group, cost impact |
| Utilization Reports | Stock utilization | Usage rate, turnover, efficiency |
| Compatibility Reports | Cross-match data | Success rate, issues |

#### Report Filters:

| Filter | Options |
|--------|---------|
| Date Range | Last 7/30/90 days, Year, Custom |
| Blood Group | All, Specific group |
| Transaction Type | All, Donations, Issues |
| Donor Status | All, Active, Deferred |

### 7.12 Blood Compatibility Utilities

**File:** `src/lib/bloodCompatibility.ts`

| Function | Description | Returns |
|----------|-------------|---------|
| `getCompatibleBloodTypes(bloodGroup)` | Get compatible donor types for recipient | Array of blood groups |
| `canReceiveFrom(recipient, donor)` | Check if recipient can receive from donor | Boolean |
| `canDonateTo(donor, recipient)` | Check who can receive from donor | Boolean |
| `getUniversalDonor()` | Get universal donor type | 'O-' |
| `getUniversalRecipient()` | Get universal recipient type | 'AB+' |
| `getCompatibilityMatrix()` | Get full compatibility matrix | Object |
| `suggestAlternatives(bloodGroup)` | Suggest alternatives if unavailable | Array |

### 7.13 Blood Bank Validation

**File:** `src/lib/bloodBankValidation.ts`

| Function | Description | Returns |
|----------|-------------|---------|
| `validateDonor(donorData)` | Validate donor eligibility | { valid: boolean, errors: string[] } |
| `validateDonationInterval(lastDonation)` | Check minimum 56 days between donations | Boolean |
| `validateBloodUnits(units)` | Validate stock levels for issue | Boolean |
| `validateAge(dateOfBirth)` | Verify donor age (18-65) | Boolean |
| `validateCrossmatch(patient, bloodGroup)` | Verify blood compatibility | Boolean |
| `checkDeferralStatus(donor)` | Check if donor is deferred | { deferred: boolean, until: Date } |

### 7.14 Blood Bank Database Tables

| Table | Description |
|-------|-------------|
| `blood_groups` | Blood type reference data (8 groups) |
| `blood_stock` | Current stock levels per blood group |
| `blood_stock_transactions` | Audit log of all stock changes |
| `donors` | Blood donor information |
| `blood_issues` | Blood dispensing records |

---

## 8. Operation Theatre Module

**Page:** `src/pages/OperationDepartment.tsx`

### 8.1 Operation Theatres Management

**File:** `src/components/operations/OperationTheatres.tsx`

| Feature | Description |
|---------|-------------|
| Add OT | Create new operation theatre |
| Edit OT | Update OT details |
| Delete OT | Remove operation theatre |
| Status Management | Available/In Use/Maintenance |
| Equipment Tracking | List of equipment in each OT |

#### OT Data Fields:

| Field | Type | Required |
|-------|------|----------|
| OT Name | Text | ✅ |
| Floor | Number | ❌ |
| Equipment | Array | ❌ |
| Status | Select | ✅ |
| Notes | Textarea | ❌ |

### 8.2 Surgery List

**File:** `src/components/operations/SurgeryList.tsx`

| Feature | Description |
|---------|-------------|
| View Surgeries | List all surgeries |
| Filter | By status, date, doctor, priority |
| Search | By patient, surgery type |
| Status Updates | Change surgery status |

### 8.3 Surgery Scheduler

**File:** `src/components/operations/SurgeryScheduler.tsx`

| Feature | Description |
|---------|-------------|
| Schedule Surgery | Book surgery slot |
| Edit Surgery | Modify surgery details |
| Cancel Surgery | Cancel with reason |
| OT Availability | Check theatre availability |
| Conflict Detection | Prevent double-booking |

#### Surgery Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | Select | ✅ |
| Doctor | Select | ✅ |
| Surgery Type | Text | ✅ |
| Surgery Date | Date | ✅ |
| Start Time | Time | ✅ |
| End Time | Time | ✅ |
| Operation Theatre | Select | ✅ |
| Priority | Select | ✅ |
| Notes | Textarea | ❌ |
| Status | Select | ✅ |

#### Surgery Statuses:

- Scheduled
- Pre-Op
- In Progress
- Completed
- Cancelled
- Postponed

#### Priority Levels:

- Elective
- Urgent
- Emergency

### 8.4 Surgery Team Management

**File:** `src/components/operations/SurgeryTeam.tsx`

| Feature | Description |
|---------|-------------|
| Add Team Member | Assign staff to surgery |
| Edit Role | Change team member role |
| Remove Member | Remove from surgery team |

#### Team Roles:

- Lead Surgeon
- Assistant Surgeon
- Anesthesiologist
- Scrub Nurse
- Circulating Nurse
- Surgical Technician

#### Team Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Surgery | Select | ✅ |
| Staff Name | Text | ✅ |
| Role | Select | ✅ |
| Notes | Textarea | ❌ |

### 8.5 Surgical Consent Form

**File:** `src/components/operations/SurgicalConsentForm.tsx`

| Feature | Description |
|---------|-------------|
| Generate Form | Create consent document |
| Patient Signature | Digital signature capture |
| Print Form | Printable consent document |
| Store Record | Save signed consent |

**Component:** `src/components/shared/SignaturePad.tsx` - Digital signature capture

### 8.6 Post-Operation Care

**File:** `src/components/operations/PostOperation.tsx`

| Feature | Description |
|---------|-------------|
| Add Post-Op Record | Document post-surgery care |
| Vital Signs | Track patient vitals |
| Complications | Record any complications |
| Medications | Post-op medication notes |
| Recovery Notes | Recovery progress documentation |
| Follow-up Date | Schedule follow-up appointment |
| Discharge Status | Ready/Not Ready |

#### Post-Op Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Surgery | Select | ✅ |
| Vital Signs | JSON | ❌ |
| Recovery Notes | Textarea | ❌ |
| Complications | Textarea | ❌ |
| Medication Notes | Textarea | ❌ |
| Follow-up Date | Date | ❌ |
| Discharge Status | Select | ✅ |

---

## 9. Patient Portal Module

### 9.1 Patient Portal Navigation

**File:** `src/components/patient-portal/PatientPortalNav.tsx`

| Feature | Description |
|---------|-------------|
| Tab Navigation | Switch between portal sections |
| Active Indicator | Highlight current section |
| Mobile Responsive | Collapsible on mobile |

### 9.2 Personal Information Section

**File:** `src/components/patient-portal/PersonalInfoSection.tsx`

| Feature | Description |
|---------|-------------|
| View Profile | Display patient information |
| Edit Profile | Update personal details |
| Emergency Contact | Manage emergency contacts |
| Insurance Info | View/update insurance details |

### 9.3 Appointments View

**File:** `src/components/patient-portal/AppointmentsView.tsx`

| Feature | Description |
|---------|-------------|
| Upcoming Appointments | List future appointments |
| Past Appointments | Appointment history |
| Cancel Appointment | Patient-initiated cancellation |
| Reschedule | Request reschedule |

### 9.4 Patient Appointment Booking

**File:** `src/components/patient-portal/PatientAppointmentBooking.tsx`

| Feature | Description |
|---------|-------------|
| Select Department | Choose medical department |
| Select Doctor | Choose available doctor |
| Pick Date | Calendar date selection |
| Pick Time | Available time slots |
| Add Symptoms | Describe symptoms |
| Confirm Booking | Submit appointment request |

### 9.5 Medical Records View

**File:** `src/components/patient-portal/MedicalRecordsView.tsx`

| Feature | Description |
|---------|-------------|
| View Records | Access own medical history |
| Download Records | Export as PDF |
| Lab Results | View test results |
| Prescriptions | Current and past prescriptions |

### 9.6 Doctor Messaging

**File:** `src/components/patient-portal/DoctorMessaging.tsx`

| Feature | Description |
|---------|-------------|
| Send Message | Message assigned doctor |
| View Conversations | Message history |
| Attachments | Send/receive files |
| Read Receipts | Message read status |

#### Message Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | UUID | ✅ |
| Doctor | UUID | ✅ |
| Message | Text | ✅ |
| Sender Type | patient/doctor | ✅ |
| Read | Boolean | ✅ |

### 9.7 Prescription Refill Request

**File:** `src/components/patient-portal/PrescriptionRefillRequest.tsx`

| Feature | Description |
|---------|-------------|
| Request Refill | Submit refill request |
| View Status | Track request status |
| Add Reason | Explain refill need |
| History | Past refill requests |

#### Refill Request Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Patient | UUID | ✅ |
| Prescription | UUID | ✅ |
| Reason | Text | ❌ |
| Status | pending/approved/denied | ✅ |
| Reviewed By | UUID | ❌ |
| Notes | Text | ❌ |

---

## 10. Department Management

**File:** `src/components/departments/DepartmentManagement.tsx`

The Department Management module provides comprehensive control over hospital departments, including creation, staff assignment, performance tracking, and hierarchical organization.

### 10.1 Core Features

| Feature | Description |
|---------|-------------|
| Add Department | Create new department with full configuration |
| Edit Department | Update department details and settings |
| Delete Department | Soft delete with reassignment options |
| Assign Head | Assign department head (doctor) |
| View Doctors | List all doctors in department |
| View Staff | List all staff (doctors, nurses) in department |
| Status Management | Active/Inactive status toggle |
| Department Statistics | Patient count, appointments, revenue per department |

### 10.2 Department Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Department Name | Text | ✅ | Name of the department |
| Description | Textarea | ❌ | Department description and services |
| Department Head | Select (Doctor) | ❌ | Assigned head of department |
| Status | Select | ✅ | Active/Inactive |
| Location | Text | ❌ | Floor/Wing location |
| Phone Extension | Text | ❌ | Internal phone extension |
| Email | Email | ❌ | Department email |
| Operating Hours | JSON | ❌ | Department specific hours |

### 10.3 Standard Hospital Departments

| Department | Description |
|------------|-------------|
| Emergency | 24/7 emergency care and trauma |
| Cardiology | Heart and cardiovascular conditions |
| Neurology | Brain and nervous system disorders |
| Orthopedics | Bone, joint, and muscle conditions |
| Pediatrics | Child healthcare |
| Gynecology | Women's reproductive health |
| Oncology | Cancer diagnosis and treatment |
| Radiology | Medical imaging and diagnostics |
| Pathology | Laboratory testing and analysis |
| General Medicine | Primary care and internal medicine |
| Surgery | Surgical procedures and operations |
| ICU | Intensive care unit |
| Psychiatry | Mental health services |
| Dermatology | Skin conditions and treatments |
| ENT | Ear, nose, and throat |
| Ophthalmology | Eye care and vision |
| Dental | Dental and oral health |
| Physiotherapy | Physical rehabilitation |

### 10.4 Doctor-Department Assignment

**Table:** `department_doctors`

| Feature | Description |
|---------|-------------|
| Assign Doctor | Add doctor to department |
| Remove Doctor | Remove from department |
| Set Role | Primary/Consultant/Visiting designation |
| Assignment Date | Track when assigned |
| Notes | Assignment-specific notes |

#### Assignment Data Fields:

| Field | Type | Required |
|-------|------|----------|
| Department | Select | ✅ |
| Doctor | Select | ✅ |
| Role | Select | ❌ |
| Notes | Textarea | ❌ |
| Assigned At | Datetime | Auto |

### 10.5 Department Dashboard Widgets

| Widget | Description |
|--------|-------------|
| Patient Distribution | Pie chart of patients per department |
| Appointment Load | Bar chart of appointments by department |
| Staff Count | Doctors and nurses per department |
| Revenue Breakdown | Financial contribution by department |
| Bed Occupancy | Room utilization per department |

### 10.6 Department API Functions

| Function | Description |
|----------|-------------|
| `getDepartments()` | Fetch all departments |
| `getDepartmentById(id)` | Get specific department |
| `createDepartment(data)` | Create new department |
| `updateDepartment(id, data)` | Update department |
| `deleteDepartment(id)` | Delete department |
| `getDepartmentDoctors(id)` | Get doctors in department |
| `assignDoctorToDepartment(deptId, doctorId)` | Assign doctor |
| `removeDoctorFromDepartment(deptId, doctorId)` | Remove doctor |
| `getDepartmentStats(id)` | Get department statistics |

---

## 11. Staff Management Module

**Pages:**
- `src/pages/Staff.tsx` - Staff listing and overview
- `src/pages/StaffManagement.tsx` - Staff administration

The Staff Management module handles all aspects of hospital personnel including doctors, nurses, and other clinical staff with registration, scheduling, and performance tracking.

### 11.1 Staff List

**File:** `src/components/staff/StaffList.tsx`

| Feature | Description |
|---------|-------------|
| View All Staff | Comprehensive list of all staff members |
| Filter by Role | Doctor/Nurse/Other filter options |
| Search | Search by name, department, specialization, license |
| Status Filter | Active/Inactive/On Leave filter |
| Sort Options | By name, department, experience, join date |
| Export | Export staff list to CSV/PDF |
| Quick Actions | View profile, edit, schedule, status change |
| Staff Cards | Visual card view with photo and key info |
| Table View | Detailed table view with all fields |

### 11.2 Doctor Management

**File:** `src/components/forms/DoctorRegistrationForm.tsx`

| Feature | Description |
|---------|-------------|
| Register Doctor | Complete doctor registration form |
| Edit Doctor | Update doctor information |
| Department Assignment | Assign to one or more departments |
| Availability Schedule | Configure working hours |
| Consultation Fee | Set standard consultation fee |
| User Account | Optional linked authentication account |

#### Doctor Data Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| First Name | Text | ✅ | Doctor's first name |
| Last Name | Text | ✅ | Doctor's last name |
| Email | Email | ❌ | Contact email |
| Phone | Phone | ❌ | Contact phone |
| Specialization | Text | ✅ | Medical specialty |
| License Number | Text | ✅ | Medical license number |
| Department | Select | ❌ | Primary department |
| Years of Experience | Number | ❌ | Years in practice |
| Consultation Fee | Number | ❌ | Fee per consultation |
| Education | Textarea | ❌ | Medical degrees and training |
| Languages | Array | ❌ | Languages spoken |
| Bio | Textarea | ❌ | Professional biography |
| Status | Select | ✅ | Active/Inactive/On Leave |
| User ID | UUID | ❌ | Linked auth account |

### 11.3 Nurse Management

**File:** `src/components/forms/NurseRegistrationForm.tsx`

| Feature | Description |
|---------|-------------|
| Register Nurse | Complete nurse registration form |
| Edit Nurse | Update nurse information |
| Shift Assignment | Assign to day/night/rotating shifts |
| Department Assignment | Assign to department |
| Specialization | Nursing specialty (ICU, OR, Pediatric, etc.) |

#### Nurse Data Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| First Name | Text | ✅ | Nurse's first name |
| Last Name | Text | ✅ | Nurse's last name |
| Email | Email | ❌ | Contact email |
| Phone | Phone | ❌ | Contact phone |
| Specialization | Text | ❌ | Nursing specialty |
| License Number | Text | ✅ | Nursing license number |
| Department | Text | ❌ | Assigned department |
| Shift Schedule | Select | ❌ | Day/Night/Rotating |
| Years of Experience | Number | ❌ | Years in nursing |
| Status | Select | ✅ | Active/Inactive/On Leave |

### 11.4 Staff Registration (Generic)

**File:** `src/components/forms/StaffRegistrationForm.tsx`

| Feature | Description |
|---------|-------------|
| Role Selection | Choose staff type (doctor, nurse, pharmacist, receptionist) |
| Dynamic Form | Form fields adapt based on selected role |
| Account Creation | Option to create linked user account |
| Department Selection | Multi-department assignment for doctors |
| Credential Verification | License number validation |

### 11.5 Staff Schedule Manager

**File:** `src/components/staff/StaffScheduleManager.tsx`

| Feature | Description |
|---------|-------------|
| Set Schedule | Define working days and hours |
| Break Times | Configure break periods |
| Slot Duration | Set appointment slot length |
| Weekly View | Visual weekly schedule display |
| Copy Schedule | Copy schedule to other days/staff |
| Bulk Edit | Edit multiple staff schedules at once |
| Calendar Integration | Sync with appointment system |
| Leave Management | Mark days off/vacation |
| On-Call Schedule | Configure on-call rotations |

#### Schedule Data Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Staff ID | UUID | ✅ | Reference to staff member |
| Staff Type | Select | ✅ | doctor/nurse/receptionist/pharmacist |
| Day of Week | Number | ✅ | 0=Sunday through 6=Saturday |
| Start Time | Time | ✅ | Shift start time |
| End Time | Time | ✅ | Shift end time |
| Break Start | Time | ❌ | Break start time |
| Break End | Time | ❌ | Break end time |
| Slot Duration | Number | ❌ | Minutes per appointment |
| Is Available | Boolean | ✅ | Whether available this slot |
| Notes | Textarea | ❌ | Schedule-specific notes |

#### Schedule Utilities

**File:** `src/lib/scheduleUtils.ts`

| Function | Description |
|----------|-------------|
| `getStaffSchedule(staffId)` | Get staff member's schedule |
| `getAvailableSlots(staffId, date)` | Get available time slots for date |
| `isTimeSlotAvailable(staffId, date, time)` | Check if specific slot is free |
| `saveSchedule(scheduleData)` | Save schedule to database |
| `getWeeklySchedule(staffId)` | Get full week schedule |
| `copyScheduleToDay(fromDay, toDay)` | Copy schedule between days |
| `getStaffOnDuty(date, time)` | Get all staff working at time |

### 11.6 Staff Status Types

| Status | Description | Can Work |
|--------|-------------|----------|
| Active | Currently employed and working | ✅ |
| Inactive | Temporarily not working | ❌ |
| On Leave | Approved leave of absence | ❌ |
| Suspended | Pending investigation | ❌ |
| Resigned | No longer employed | ❌ |

### 11.7 Staff Performance Tracking

| Metric | Description |
|--------|-------------|
| Appointments | Total appointments handled |
| Patients | Unique patients treated |
| Cancellation Rate | Cancelled appointments percentage |
| Average Rating | Patient feedback rating |
| Revenue Generated | Total billing from consultations |

### 11.8 Staff Database Tables

| Table | Description |
|-------|-------------|
| `doctors` | Doctor information and credentials |
| `nurses` | Nursing staff information |
| `staff_schedules` | Working hours and availability |
| `department_doctors` | Doctor-department assignments |
| `profiles` | Basic user profile (linked to auth) |
| `user_roles` | Role assignments for access control |

---

## 12. Notification & Reminder System

### 12.1 Notification Center

**File:** `src/components/notifications/NotificationCenter.tsx`

| Feature | Description |
|---------|-------------|
| View Notifications | List all notifications |
| Mark as Read | Mark individual/all as read |
| Delete Notification | Remove notification |
| Filter by Type | System/Appointment/Alert/etc. |
| Priority Indicator | Visual priority indication |
| Action Links | Click to navigate |

### 12.2 Notification Types:

| Type | Description | Example |
|------|-------------|---------|
| `system` | System announcements | Maintenance notice |
| `appointment` | Appointment related | Appointment reminder |
| `lab_result` | Lab test results | Results ready |
| `prescription` | Prescription alerts | Prescription ready |
| `alert` | Important alerts | Critical inventory |
| `reminder` | Custom reminders | Follow-up reminder |
| `patient_registration` | New patient signup | Verification needed |

### 12.3 Notification Priority Levels:

| Priority | Color | Use Case |
|----------|-------|----------|
| `low` | Gray | Informational |
| `normal` | Blue | Standard notifications |
| `high` | Orange | Important actions needed |
| `urgent` | Red | Critical, immediate action |

### 12.4 Notification Data Fields:

| Field | Type | Required |
|-------|------|----------|
| User ID | UUID | ✅ |
| Title | Text | ✅ |
| Message | Text | ✅ |
| Type | Select | ✅ |
| Priority | Select | ✅ |
| Read | Boolean | ✅ |
| Action URL | Text | ❌ |
| Metadata | JSON | ❌ |
| Expires At | Timestamp | ❌ |

### 12.5 Reminder System

**Table:** `reminders`

| Feature | Description |
|---------|-------------|
| Create Reminder | Set personal reminders |
| Recurring | Daily/Weekly/Monthly |
| Link to Entity | Tie to appointment, prescription, etc. |
| Status | Pending/Sent/Dismissed |

### 12.6 Notification Hook

**File:** `src/hooks/useNotifications.ts`

| Function | Description |
|----------|-------------|
| `fetchNotifications()` | Get user notifications |
| `markAsRead()` | Mark notification read |
| `deleteNotification()` | Remove notification |
| `subscribeToNotifications()` | Real-time subscription |

---

## 13. Reports & Analytics

**Page:** `src/pages/Reports.tsx`

### 13.1 Dashboard Statistics

| Metric | Description |
|--------|-------------|
| Total Patients | Active patient count |
| Today's Appointments | Appointments for today |
| Revenue | Total/Monthly/Weekly revenue |
| Pending Lab Tests | Tests awaiting results |
| Bed Occupancy | Current occupancy rate |
| Staff On Duty | Active staff count |

### 13.2 Report Types:

| Report | Description |
|--------|-------------|
| Patient Statistics | New registrations, demographics |
| Appointment Analytics | Bookings, cancellations, no-shows |
| Revenue Reports | Income by service, department, period |
| Department Distribution | Patients per department |
| Lab Test Analytics | Tests by type, turnaround time |
| Inventory Reports | Stock levels, expiring items |
| Blood Bank Reports | Donations, issues, stock |

### 13.3 Time Range Filters:

- Last 7 days
- Last 30 days
- Last 90 days
- Last 1 year
- Custom range

### 13.4 Visualization Types:

| Chart Type | Use Case |
|------------|----------|
| Line Chart | Trends over time |
| Bar Chart | Comparisons |
| Pie Chart | Distribution |
| Area Chart | Volume over time |
| Data Grid | Detailed data |

---

## 14. Settings & Configuration

**File:** `src/components/settings/Settings.tsx`

### 14.1 User Settings

| Setting | Description | Options |
|---------|-------------|---------|
| Profile | Update personal information | Name, phone, email |
| Password | Change password | Current + new password |
| Theme | Light/Dark mode toggle | Light, Dark, System |
| Notifications | Enable/disable notification types | Email, Push, SMS per type |
| Language | Language preference | English (expandable) |
| Display Density | UI density preference | Comfortable, Compact |

### 14.2 Hospital Settings (Admin Only)

| Setting | Description | Default |
|---------|-------------|---------|
| Hospital Name | Organization name | Configurable |
| Timezone | Hospital timezone | UTC (configurable) |
| Working Hours | Default operating hours | 9:00 AM - 5:00 PM |
| Appointment Duration | Default slot duration | 30 minutes |
| Logo | Hospital logo upload | N/A |
| Contact Info | Address, phone, email | Configurable |
| Date Format | Date display format | MM/DD/YYYY |
| Time Format | Time display format | 12-hour / 24-hour |
| Currency | Currency for billing | USD |
| Low Stock Threshold | Inventory alert threshold | 10 units |
| Blood Stock Threshold | Blood bank alert level | 5 units |

### 14.3 Timezone Configuration

The system supports comprehensive timezone handling for hospitals operating across different geographic locations.

#### Hospital Timezone Setting

| Feature | Description |
|---------|-------------|
| Timezone Selection | Choose from 400+ IANA timezones |
| Current Time Display | Show current time in hospital timezone |
| Auto-detect | Option to auto-detect user's timezone |
| DST Handling | Automatic Daylight Saving Time adjustments |

#### Timezone Hook

**File:** `src/hooks/useTimezone.ts`

| Function | Description | Returns |
|----------|-------------|---------|
| `getHospitalTimezone()` | Get configured hospital timezone | Timezone string (e.g., 'America/New_York') |
| `formatInTimezone(date, format)` | Format date in hospital timezone | Formatted date string |
| `convertToTimezone(date, targetTz)` | Convert date to specific timezone | Date object |
| `getUserTimezone()` | Get user's browser timezone | Timezone string |
| `getTimezoneOffset()` | Get offset from UTC | Number (hours) |
| `isValidTimezone(tz)` | Validate timezone string | Boolean |

#### Timezone Utilities

**File:** `src/lib/timezoneUtils.ts`

| Function | Description |
|----------|-------------|
| `getHospitalTimezone()` | Fetch hospital timezone from settings |
| `formatInTimezone(date, timezone, format)` | Format date in specific timezone |
| `convertToTimezone(date, fromTz, toTz)` | Convert between timezones |
| `getAvailableTimezones()` | Get list of all supported timezones |
| `getCurrentTimeInTimezone(tz)` | Get current time in timezone |
| `formatTimeForDisplay(time, timezone)` | Format time for UI display |
| `parseDateInTimezone(dateStr, timezone)` | Parse date string in timezone |

#### Common Timezone Use Cases

| Scenario | Implementation |
|----------|----------------|
| Appointment Display | Show appointment times in hospital timezone |
| Schedule Creation | Convert input to UTC for storage |
| Report Generation | Use hospital timezone for date ranges |
| User Display | Optionally show in user's local timezone |
| Log Timestamps | Store in UTC, display in hospital timezone |

#### Supported Timezone Regions

| Region | Example Timezones |
|--------|-------------------|
| Americas | America/New_York, America/Los_Angeles, America/Chicago |
| Europe | Europe/London, Europe/Paris, Europe/Berlin |
| Asia | Asia/Tokyo, Asia/Shanghai, Asia/Kolkata |
| Pacific | Pacific/Sydney, Pacific/Auckland, Pacific/Honolulu |
| Middle East | Asia/Dubai, Asia/Jerusalem, Asia/Riyadh |
| Africa | Africa/Cairo, Africa/Johannesburg, Africa/Lagos |

### 14.4 Settings Hook

**File:** `src/hooks/useSettings.ts`

| Function | Description |
|----------|-------------|
| `getSetting(key)` | Get user setting by key |
| `updateSetting(key, value)` | Update user setting |
| `getHospitalSetting(category, key)` | Get hospital-wide setting |
| `updateHospitalSetting(category, key, value)` | Update hospital setting (admin only) |
| `getAllSettings()` | Get all user settings |
| `resetToDefaults()` | Reset settings to defaults |

### 14.5 Settings Database Tables

| Table | Description |
|-------|-------------|
| `user_settings` | Per-user preferences and settings |
| `hospital_settings` | System-wide hospital configuration |

### 14.6 Settings Categories

| Category | Settings Included |
|----------|-------------------|
| `general` | Hospital name, timezone, date/time formats |
| `appointments` | Default duration, buffer time, booking rules |
| `notifications` | Email settings, SMS settings, push settings |
| `billing` | Currency, tax settings, invoice templates |
| `inventory` | Stock thresholds, expiry warnings |
| `blood_bank` | Stock thresholds, donation intervals |
| `security` | Session timeout, password policies |

---

## 15. Database Architecture

### 15.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   patients  │────►│appointments │◄────│   doctors   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│medical_     │     │prescriptions│     │   nurses    │
│records      │     └─────────────┘     └─────────────┘
└─────────────┘            
       │                                ┌─────────────┐
       ▼                                │ departments │
┌─────────────┐     ┌─────────────┐     └─────────────┘
│  lab_tests  │     │  inventory  │            │
└─────────────┘     └─────────────┘            ▼
                                        ┌─────────────┐
┌─────────────┐     ┌─────────────┐     │department_  │
│   rooms     │     │room_assign- │     │doctors      │
└─────────────┘     │ments        │     └─────────────┘
       │            └─────────────┘
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  payments   │     │notifications│     │  reminders  │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│blood_groups │     │blood_stock  │     │   donors    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│blood_issues │     │blood_stock_ │     │operation_   │
└─────────────┘     │transactions │     │theatres     │
                    └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  surgeries  │     │surgery_team │     │post_operation│
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  profiles   │     │ user_roles  │     │user_settings│
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────────┐     ┌────────────────────┐
│hospital_settings│     │patient_registration│
└─────────────────┘     │_queue              │
                        └────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│patient_messages     │     │prescription_refill_ │
└─────────────────────┘     │requests             │
                            └─────────────────────┘

┌─────────────────────┐
│staff_schedules      │
└─────────────────────┘

┌─────────────────────┐
│phi_audit_log        │
└─────────────────────┘
```

### 15.2 Complete Table List

| Table | Description | Row Count Scope |
|-------|-------------|-----------------|
| `patients` | Patient demographic data | Per hospital |
| `doctors` | Physician information | Per hospital |
| `nurses` | Nursing staff | Per hospital |
| `appointments` | Scheduled appointments | Per hospital |
| `medical_records` | Visit documentation | Per patient |
| `prescriptions` | Medication prescriptions | Per patient |
| `lab_tests` | Laboratory orders/results | Per patient |
| `inventory` | Medical supplies | Per hospital |
| `rooms` | Hospital rooms | Per hospital |
| `room_assignments` | Patient room assignments | Active assignments |
| `payments` | Billing records | Per patient |
| `notifications` | User notifications | Per user |
| `reminders` | User reminders | Per user |
| `profiles` | User profiles (linked to auth) | Per user |
| `user_roles` | Role assignments | Per user |
| `user_settings` | User preferences | Per user |
| `hospital_settings` | System configuration | Per setting |
| `departments` | Hospital departments | Per hospital |
| `department_doctors` | Doctor-department mapping | Per assignment |
| `blood_groups` | Blood type definitions | Fixed set |
| `blood_stock` | Blood inventory levels | Per blood group |
| `blood_stock_transactions` | Stock change history | Per transaction |
| `blood_issues` | Blood dispensing records | Per issue |
| `donors` | Blood donors | Per hospital |
| `operation_theatres` | Surgery rooms | Per hospital |
| `surgeries` | Surgery records | Per patient |
| `surgery_team` | Surgery team assignments | Per surgery |
| `post_operation` | Post-op care records | Per surgery |
| `patient_messages` | Doctor-patient messaging | Per conversation |
| `prescription_refill_requests` | Refill requests | Per request |
| `patient_registration_queue` | Verification queue | Pending patients |
| `staff_schedules` | Staff working hours | Per staff |
| `phi_audit_log` | HIPAA audit trail | Per access |

### 15.3 Database Functions

| Function | Purpose | Security |
|----------|---------|----------|
| `update_updated_at_column()` | Auto-update timestamps | TRIGGER |
| `update_notification_updated_at()` | Notification timestamp | SECURITY DEFINER |
| `update_settings_updated_at()` | Settings timestamp | SECURITY DEFINER |
| `get_patient_id_for_user(uuid)` | Get patient ID from user | SECURITY DEFINER |
| `get_doctor_id_for_user(uuid)` | Get doctor ID from user | SECURITY DEFINER |
| `doctor_has_patient_relationship(uuid, uuid)` | Check doctor-patient link | SECURITY DEFINER |
| `get_doctor_departments(uuid)` | Get doctor's departments | SECURITY DEFINER |
| `handle_new_user()` | Create profile on signup | TRIGGER |
| `has_role(uuid, app_role)` | Check if user has role | SECURITY DEFINER |
| `get_user_role(uuid)` | Get user's role | SECURITY DEFINER |

### 15.4 Role Enum

```sql
CREATE TYPE app_role AS ENUM (
  'admin',
  'doctor', 
  'nurse',
  'patient',
  'receptionist',
  'pharmacist'
);
```

---

## 16. Security Features

### 16.1 Authentication

| Feature | Implementation |
|---------|----------------|
| Email/Password Login | Supabase Auth |
| Session Management | Auto token refresh |
| Protected Routes | React Router guards |
| Logout | Session invalidation |

### 16.2 Authorization

| Feature | Implementation |
|---------|----------------|
| Row Level Security (RLS) | PostgreSQL policies |
| Role-Based Access | `has_role()` function |
| Security Definer Functions | Safe role checks |
| Route Protection | Client-side + server-side |

### 16.3 RLS Policies Summary

| Table | Access Pattern |
|-------|----------------|
| patients | Authenticated users |
| doctors | Authenticated users |
| nurses | Authenticated users |
| appointments | Authenticated users |
| medical_records | Authenticated users |
| prescriptions | Authenticated users |
| lab_tests | Authenticated users |
| inventory | Authenticated users |
| rooms | Authenticated users |
| payments | Authenticated users |
| notifications | Own + Admin |
| reminders | Own + Admin |
| profiles | Own + Admin view |
| user_roles | Own view + Admin manage |
| user_settings | Own only |
| hospital_settings | Admin only |

### 16.4 Data Protection

| Feature | Description |
|---------|-------------|
| UUID Primary Keys | Non-sequential identifiers |
| HTTPS/TLS | Encrypted connections |
| Input Validation | Zod schema validation |
| SQL Injection Prevention | Parameterized queries |
| XSS Prevention | React's built-in escaping |
| HIPAA Audit Logging | PHI access tracking |

### 16.5 PHI Audit Log

**Table:** `phi_audit_log`

| Field | Description |
|-------|-------------|
| action | CREATE/READ/UPDATE/DELETE |
| table_name | Affected table |
| record_id | Affected record |
| patient_id | Related patient |
| performed_by | User who performed action |
| old_values | Previous values (JSON) |
| new_values | New values (JSON) |
| changed_fields | List of changed columns |
| ip_address | Client IP |
| user_agent | Client browser |

---

## 17. Edge Functions & APIs

### 17.1 Departments Function

**Path:** `supabase/functions/departments/index.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/departments` | List all departments |

### 17.2 Contact Email Function

**Path:** `supabase/functions/send-contact-email/index.ts`

| Feature | Description |
|---------|-------------|
| Admin Email | Sends contact form to admin |
| User Confirmation | Sends thank-you to user |
| CORS | Enabled for web calls |
| Logging | Detailed request logging |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry",
  "message": "Hello..."
}
```

**Recipient:** `arshmanrasool75@gmail.com`

---

## 18. Custom Hooks

### 18.1 useBloodBank

**File:** `src/hooks/useBloodBank.ts`

| Function | Description |
|----------|-------------|
| `fetchBloodGroups()` | Get all blood groups |
| `fetchBloodStock()` | Get stock levels |
| `fetchDonors()` | Get donor list |
| `addDonation()` | Record new donation |
| `issueBlood()` | Issue blood to patient |

### 18.2 useDoctorData

**File:** `src/hooks/useDoctorData.ts`

| Function | Description |
|----------|-------------|
| `getDoctorProfile()` | Get doctor info |
| `getDoctorAppointments()` | Get doctor's appointments |
| `getDoctorPatients()` | Get doctor's patients |

### 18.3 useInventoryAlerts

**File:** `src/hooks/useInventoryAlerts.ts`

| Function | Description |
|----------|-------------|
| `getLowStockItems()` | Items below minimum |
| `getExpiringItems()` | Items nearing expiry |
| `getAlertCount()` | Total alert count |

### 18.4 useNotifications

**File:** `src/hooks/useNotifications.ts`

| Function | Description |
|----------|-------------|
| `fetchNotifications()` | Get user notifications |
| `markAsRead()` | Mark notification read |
| `deleteNotification()` | Remove notification |
| `getUnreadCount()` | Count unread notifications |

### 18.5 useSettings

**File:** `src/hooks/useSettings.ts`

| Function | Description |
|----------|-------------|
| `getSetting()` | Get user setting |
| `updateSetting()` | Update user setting |
| `getHospitalSetting()` | Get hospital setting |

### 18.6 useTimezone

**File:** `src/hooks/useTimezone.ts`

| Function | Description |
|----------|-------------|
| `getHospitalTimezone()` | Get configured timezone |
| `formatDate()` | Format in hospital timezone |
| `parseDate()` | Parse to hospital timezone |

### 18.7 useMobile

**File:** `src/hooks/use-mobile.tsx`

| Function | Description |
|----------|-------------|
| `isMobile` | Boolean for mobile viewport |

### 18.8 useToast

**File:** `src/hooks/use-toast.ts`

| Function | Description |
|----------|-------------|
| `toast()` | Show toast notification |
| `dismiss()` | Dismiss toast |

---

## 19. Utility Libraries

### 19.1 Data Manager

**File:** `src/lib/dataManager.ts`

| Function | Description |
|----------|-------------|
| `getPatients()` | Fetch all patients |
| `getAppointments()` | Fetch all appointments |
| `getDoctors()` | Fetch all doctors |
| `getNurses()` | Fetch all nurses |
| `getInventory()` | Fetch inventory items |
| `getPayments()` | Fetch payment records |
| `getStatistics()` | Dashboard statistics |

### 19.2 Schedule Utilities

**File:** `src/lib/scheduleUtils.ts`

| Function | Description |
|----------|-------------|
| `getStaffSchedules()` | Get staff working hours |
| `getAvailableTimeSlots()` | Get available slots |
| `isTimeSlotAvailable()` | Check slot availability |
| `saveStaffSchedule()` | Save schedule to database |

### 19.3 Timezone Utilities

**File:** `src/lib/timezoneUtils.ts`

| Function | Description |
|----------|-------------|
| `getHospitalTimezone()` | Get hospital timezone setting |
| `formatInTimezone()` | Format date in timezone |
| `convertToTimezone()` | Convert between timezones |

### 19.4 Blood Compatibility

**File:** `src/lib/bloodCompatibility.ts`

| Function | Description |
|----------|-------------|
| `getCompatibleBloodTypes()` | Compatible donor types |
| `canReceiveFrom()` | Check compatibility |
| `getUniversalDonor()` | Get O- type |
| `getUniversalRecipient()` | Get AB+ type |

### 19.5 Blood Bank Validation

**File:** `src/lib/bloodBankValidation.ts`

| Function | Description |
|----------|-------------|
| `validateDonor()` | Check donor eligibility |
| `validateDonationInterval()` | Minimum days check |
| `validateStockLevel()` | Stock validation |

### 19.6 Form Validation

**File:** `src/lib/formValidation.ts`

| Schema | Description |
|--------|-------------|
| `patientSchema` | Patient form validation |
| `appointmentSchema` | Appointment validation |
| `prescriptionSchema` | Prescription validation |

### 19.7 Export Utilities

**File:** `src/lib/exportUtils.ts`

| Function | Description |
|----------|-------------|
| `exportToCSV()` | Export data to CSV |
| `exportToPDF()` | Export data to PDF |
| `downloadFile()` | Trigger file download |

### 19.8 Audit Logger

**File:** `src/lib/auditLogger.ts`

| Function | Description |
|----------|-------------|
| `logAccess()` | Log PHI access |
| `logModification()` | Log data changes |
| `getAuditTrail()` | Retrieve audit logs |

### 19.9 General Utilities

**File:** `src/lib/utils.ts`

| Function | Description |
|----------|-------------|
| `cn()` | Tailwind class merge |
| `formatCurrency()` | Currency formatting |
| `formatDate()` | Date formatting |

---

## 20. UI Components Library

### 20.1 Shared Components

| Component | File | Description |
|-----------|------|-------------|
| DataTable | `src/components/shared/DataTable.tsx` | Sortable, filterable table |
| ConfirmDialog | `src/components/shared/ConfirmDialog.tsx` | Confirmation modal |
| SignaturePad | `src/components/shared/SignaturePad.tsx` | Digital signature capture |
| BackToTop | `src/components/shared/BackToTop.tsx` | Scroll to top button |

### 20.2 Layout Components

| Component | File | Description |
|-----------|------|-------------|
| MainLayout | `src/components/layout/MainLayout.tsx` | Dashboard wrapper |
| Header | `src/components/layout/Header.tsx` | Top navigation bar |
| Sidebar | `src/components/layout/Sidebar.tsx` | Side navigation menu |

### 20.3 shadcn/ui Components

| Component | Description |
|-----------|-------------|
| Button | Various button styles |
| Input | Text input fields |
| Textarea | Multi-line text input |
| Select | Dropdown select |
| Checkbox | Checkbox input |
| Radio Group | Radio button group |
| Switch | Toggle switch |
| Slider | Range slider |
| Calendar | Date picker |
| Dialog | Modal dialog |
| Sheet | Side panel |
| Dropdown Menu | Context menu |
| Popover | Floating popup |
| Tooltip | Hover tooltip |
| Toast | Notification toast |
| Alert | Alert messages |
| Badge | Status badges |
| Avatar | User avatars |
| Card | Content cards |
| Table | Data tables |
| Tabs | Tab navigation |
| Accordion | Collapsible sections |
| Progress | Progress bar |
| Skeleton | Loading placeholders |
| Separator | Divider lines |
| Scroll Area | Custom scrollbar |
| Navigation Menu | Navigation component |
| Breadcrumb | Breadcrumb navigation |
| Pagination | Page navigation |
| Form | Form wrapper with validation |

---

## 21. System Requirements

### 21.1 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 21.2 Server Requirements

| Requirement | Specification |
|-------------|---------------|
| Supabase | Free tier or above |
| PostgreSQL | Version 15+ (managed) |
| Edge Functions | Deno runtime (managed) |

### 21.3 Deployment

| Aspect | Options |
|--------|---------|
| Frontend Hosting | Lovable, Vercel, Netlify |
| SSL Certificate | Required for production |
| Custom Domain | Supported |
| CDN | Recommended for assets |

---

## 22. File Structure

```
├── .env                                    # Environment variables
├── PROJECT_DOCUMENTATION.md               # This file
├── USER_GUIDE.md                          # User guide
├── NOTIFICATION_SYSTEM_DOCUMENTATION.md   # Notification docs
├── README.md                              # Project readme
├── index.html                             # HTML entry point
├── vite.config.ts                         # Vite configuration
├── tailwind.config.ts                     # Tailwind configuration
├── tsconfig.json                          # TypeScript config
├── eslint.config.js                       # ESLint configuration
│
├── public/
│   ├── favicon.ico                        # Site favicon
│   ├── robots.txt                         # SEO robots file
│   └── placeholder.svg                    # Placeholder image
│
├── src/
│   ├── App.tsx                            # Main app component
│   ├── App.css                            # App styles
│   ├── index.css                          # Global styles & design system
│   ├── main.tsx                           # React entry point
│   ├── vite-env.d.ts                      # Vite type declarations
│   │
│   ├── components/
│   │   ├── appointments/
│   │   │   └── AppointmentScheduler.tsx   # Appointment management
│   │   │
│   │   ├── blood-bank/
│   │   │   ├── BloodAvailabilityWidget.tsx
│   │   │   ├── BloodBankDashboard.tsx
│   │   │   ├── BloodBankReports.tsx
│   │   │   ├── BloodGroupsManagement.tsx
│   │   │   ├── BloodInventory.tsx
│   │   │   ├── BloodIssue.tsx
│   │   │   ├── BloodRequests.tsx
│   │   │   ├── BloodStockManagement.tsx
│   │   │   ├── DonationRecords.tsx
│   │   │   ├── DonorManagement.tsx
│   │   │   └── TransfusionRecords.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── NurseDashboard.tsx
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── PendingVerificationsWidget.tsx
│   │   │   ├── PharmacistDashboard.tsx
│   │   │   └── ReceptionistDashboard.tsx
│   │   │
│   │   ├── departments/
│   │   │   └── DepartmentManagement.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── DoctorRegistrationForm.tsx
│   │   │   ├── NurseRegistrationForm.tsx
│   │   │   ├── PatientRegistrationForm.tsx
│   │   │   ├── PaymentManagementForm.tsx
│   │   │   ├── RecordUpdateForm.tsx
│   │   │   └── StaffRegistrationForm.tsx
│   │   │
│   │   ├── inventory/
│   │   │   └── InventoryManagement.tsx
│   │   │
│   │   ├── lab-tests/
│   │   │   └── LabTestManagement.tsx
│   │   │
│   │   ├── landing/
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── AnimatedCounter.tsx
│   │   │   ├── BentoGrid.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── FloatingElements.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ScrollAnimationWrapper.tsx
│   │   │   ├── TeamSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── TrustBadges.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── medical/
│   │   │   └── MedicalRecords.tsx
│   │   │
│   │   ├── notifications/
│   │   │   └── NotificationCenter.tsx
│   │   │
│   │   ├── operations/
│   │   │   ├── OperationTheatres.tsx
│   │   │   ├── PostOperation.tsx
│   │   │   ├── SurgeryList.tsx
│   │   │   ├── SurgeryScheduler.tsx
│   │   │   ├── SurgeryTeam.tsx
│   │   │   └── SurgicalConsentForm.tsx
│   │   │
│   │   ├── patient-portal/
│   │   │   ├── AppointmentsView.tsx
│   │   │   ├── DoctorMessaging.tsx
│   │   │   ├── MedicalRecordsView.tsx
│   │   │   ├── PatientAppointmentBooking.tsx
│   │   │   ├── PatientPortalNav.tsx
│   │   │   ├── PersonalInfoSection.tsx
│   │   │   └── PrescriptionRefillRequest.tsx
│   │   │
│   │   ├── patients/
│   │   │   └── PatientManagement.tsx
│   │   │
│   │   ├── payments/
│   │   │   └── PaymentsList.tsx
│   │   │
│   │   ├── prescriptions/
│   │   │   └── PrescriptionManagement.tsx
│   │   │
│   │   ├── rooms/
│   │   │   ├── BedAssignment.tsx
│   │   │   └── RoomManagement.tsx
│   │   │
│   │   ├── settings/
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── shared/
│   │   │   ├── BackToTop.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── SignaturePad.tsx
│   │   │
│   │   ├── staff/
│   │   │   ├── StaffList.tsx
│   │   │   └── StaffScheduleManager.tsx
│   │   │
│   │   ├── ui/                            # shadcn/ui components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   │
│   │   └── theme-provider.tsx             # Theme context
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx                # Authentication context
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx                 # Mobile detection
│   │   ├── use-toast.ts                   # Toast notifications
│   │   ├── useBloodBank.ts                # Blood bank operations
│   │   ├── useDoctorData.ts               # Doctor data fetching
│   │   ├── useInventoryAlerts.ts          # Inventory alerts
│   │   ├── useNotifications.ts            # Notification management
│   │   ├── useSettings.ts                 # User/hospital settings
│   │   └── useTimezone.ts                 # Timezone utilities
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts                  # Supabase client
│   │       └── types.ts                   # Database types (auto-generated)
│   │
│   ├── lib/
│   │   ├── auditLogger.ts                 # PHI audit logging
│   │   ├── bloodBankValidation.ts         # Blood bank validation
│   │   ├── bloodCompatibility.ts          # Blood type compatibility
│   │   ├── dataManager.ts                 # Data CRUD operations
│   │   ├── exportUtils.ts                 # Data export utilities
│   │   ├── formValidation.ts              # Form validation schemas
│   │   ├── scheduleUtils.ts               # Staff scheduling
│   │   ├── timezoneUtils.ts               # Timezone handling
│   │   └── utils.ts                       # General utilities
│   │
│   ├── pages/
│   │   ├── AboutUs.tsx                    # About page
│   │   ├── Billing.tsx                    # Billing page
│   │   ├── BloodBank.tsx                  # Blood bank page
│   │   ├── Contact.tsx                    # Contact page
│   │   ├── Dashboard.tsx                  # Main dashboard
│   │   ├── Index.tsx                      # Landing page
│   │   ├── Login.tsx                      # Login page
│   │   ├── NotFound.tsx                   # 404 page
│   │   ├── OperationDepartment.tsx        # OT management
│   │   ├── PatientRegistry.tsx            # Patient verification
│   │   ├── Pharmacy.tsx                   # Pharmacy/inventory
│   │   ├── Reports.tsx                    # Reports page
│   │   ├── Services.tsx                   # Services page
│   │   ├── Staff.tsx                      # Staff list
│   │   └── StaffManagement.tsx            # Staff management
│   │
│   └── database/
│       └── schema.sql                     # Database schema reference
│
└── supabase/
    ├── config.toml                        # Supabase configuration
    │
    └── functions/
        ├── departments/
        │   └── index.ts                   # Departments edge function
        │
        └── send-contact-email/
            └── index.ts                   # Contact email function
```

---

## Appendix A: Contact & Support

| Type | Contact |
|------|---------|
| Admin Email | arshmanrasool75@gmail.com |
| Technical Support | Via contact form |

---

## Appendix B: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 2024 | Initial release |
| 1.1 | December 2024 | Added blood bank, OT modules |
| 1.2 | December 2024 | Added patient portal, messaging |
| 1.3 | December 2024 | Added contact form email delivery |
| 2.0 | January 2025 | Added insurance claims, referrals, supply chain |
| 2.5 | January 2025 | Added shift handovers, pharmacy billing |
| 3.0 | January 2026 | **Major Release** - Queue Management System, enhanced security |

### v3.0 Release Notes (January 2026)

#### New Features
1. **Real-time Queue Management System**
   - Token-based patient queuing with auto-generation
   - Real-time position updates via Supabase subscriptions
   - Priority queue handling (Emergency > Priority > Normal)
   - Patient self-check-in for confirmed appointments
   - Cross-department patient transfers
   - Waiting room display component
   - Printable token slips

2. **Enhanced Security**
   - Role-based RLS policies for surgery tables (surgeries, surgery_team, post_operation)
   - Removed public access to sensitive medical data
   - Improved audit logging

3. **Patient Portal Improvements**
   - Queue status view with dynamic messaging
   - Self-check-in functionality
   - Print token feature

4. **Prescription Access Control**
   - Only doctors/admins can add/edit prescriptions
   - Other roles have view-only access

5. **Waitlist Enhancements**
   - Fixed "Any" department/doctor selection
   - Improved form validation

#### Database Changes
- Added `daily_queues` table for queue management
- Added `queue_entries` table for patient queue tracking
- New RLS policies for queue tables
- Updated surgery table security policies

#### New Components
- `QueueStatusView.tsx` - Patient queue status display
- `DoctorQueueView.tsx` - Doctor queue management
- `ReceptionistQueueControl.tsx` - Check-in interface
- `PatientCheckIn.tsx` - Walk-in check-in form
- `WaitingRoomDisplay.tsx` - Public waiting room display
- `TokenSlip.tsx` - Printable token component

#### New Hooks
- `useQueue.ts` - Complete queue management hook with real-time subscriptions

---

## 23. Queue Management System

### 23.1 Overview

The Queue Management System provides real-time patient flow management from check-in to consultation completion.

### 23.2 Components

| Component | File | Purpose |
|-----------|------|---------|
| **QueueStatusView** | `src/components/patient-portal/QueueStatusView.tsx` | Patient's view of their queue position |
| **DoctorQueueView** | `src/components/queue/DoctorQueueView.tsx` | Doctor's queue management interface |
| **DoctorQueueWidget** | `src/components/queue/DoctorQueueWidget.tsx` | Dashboard widget for doctors |
| **ReceptionistQueueControl** | `src/components/queue/ReceptionistQueueControl.tsx` | Full queue control for receptionists |
| **ReceptionistQueueWidget** | `src/components/queue/ReceptionistQueueWidget.tsx` | Dashboard widget for receptionists |
| **PatientCheckIn** | `src/components/queue/PatientCheckIn.tsx` | Walk-in patient check-in form |
| **WaitingRoomDisplay** | `src/components/queue/WaitingRoomDisplay.tsx` | Public display for waiting rooms |
| **TokenSlip** | `src/components/queue/TokenSlip.tsx` | Printable token slip component |

### 23.3 Features

| Feature | Description |
|---------|-------------|
| **Real-time Sync** | Supabase real-time subscriptions for instant updates |
| **Token Generation** | Auto-generated tokens (T-001, T-002, etc.) |
| **Priority Queue** | Emergency > Priority > Normal ordering |
| **Wait Time Estimation** | Based on average consultation time |
| **Patient Self-Check-in** | Patients can check in for confirmed appointments |
| **Department Transfer** | Transfer patients between departments |
| **Visual Feedback** | Shimmer effects for newly called patients |
| **Print Token** | Generate printable/PDF token slips |

### 23.4 Hook: useQueue

```typescript
import { useQueue } from '@/hooks/useQueue';

const {
  // State
  loading,
  queues,
  entries,
  currentEntry,
  stats,
  
  // Filtered entries
  waitingEntries,
  calledEntries,
  inConsultationEntries,
  completedEntries,
  
  // Actions
  checkInPatient,
  callNextPatient,
  startConsultation,
  completeConsultation,
  markNoShow,
  cancelEntry,
  transferPatient,
  getPatientActiveEntry,
  refetch
} = useQueue({ doctorId, departmentId, realtime: true });
```

### 23.5 Database Tables

**daily_queues**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| queue_date | DATE | Date of queue |
| doctor_id | UUID | Associated doctor |
| department_id | UUID | Associated department |
| current_token_number | INTEGER | Last issued token number |
| token_prefix | VARCHAR(10) | Token prefix (default: 'T') |
| is_active | BOOLEAN | Queue active status |
| avg_consultation_mins | INTEGER | Average consultation time |

**queue_entries**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| queue_id | UUID | Reference to daily_queues |
| patient_id | UUID | Patient reference |
| appointment_id | UUID | Optional appointment reference |
| token_number | VARCHAR(20) | Generated token (e.g., 'T-001') |
| entry_type | VARCHAR(20) | appointment, walk_in, emergency |
| priority | VARCHAR(20) | normal, priority, emergency |
| status | VARCHAR(20) | waiting, called, in_consultation, completed, no_show, cancelled, transferred |
| checked_in_at | TIMESTAMPTZ | Check-in timestamp |
| called_at | TIMESTAMPTZ | When patient was called |
| consultation_started_at | TIMESTAMPTZ | Consultation start time |
| completed_at | TIMESTAMPTZ | Completion timestamp |

### 23.6 Access Control

| Role | Permissions |
|------|-------------|
| Admin | Full access to all queues |
| Receptionist | Full access to all queues |
| Doctor | View/update own queue |
| Nurse | View all queues |
| Patient | View own queue entry, self-check-in |

---

## 24. HIPAA Compliance Features

### 23.1 PHI Audit Logging

All access to Protected Health Information is automatically logged for HIPAA compliance.

**Audit Log Table: `phi_audit_log`**

| Field | Description |
|-------|-------------|
| `table_name` | Which PHI table was accessed (medical_records, prescriptions, etc.) |
| `record_id` | Specific record identifier |
| `patient_id` | Patient whose data was accessed |
| `action` | view, create, update, delete, export, print |
| `performed_by` | User ID who performed the action |
| `performer_role` | Role of the user |
| `performer_name` | Name of the user |
| `old_values` | Previous values (for updates) |
| `new_values` | New values (for creates/updates) |
| `changed_fields` | List of fields modified |
| `user_agent` | Browser/device information |
| `created_at` | Timestamp of access |

**Usage:**
```typescript
import { logPhiAccess, getUserContextFromAuth } from '@/lib/auditLogger';

// Log a view action
await logPhiAccess({
  table_name: 'medical_records',
  record_id: recordId,
  patient_id: patientId,
  action: 'view',
}, userContext);
```

### 23.2 Compliance Reports

Generate HIPAA compliance reports from the `reportGenerator.ts`:

- **PHI Access Report**: All access to patient data within date range
- **User Access Report**: All PHI accessed by specific user
- **Suspicious Activity Detection**: Automatic detection of unusual patterns

### 23.3 Security Features

| Feature | Description |
|---------|-------------|
| Row Level Security | All tables have RLS policies |
| Immutable Audit Logs | No UPDATE/DELETE policies on audit table |
| Sensitive Data Redaction | Passwords/SSN redacted in logs |
| Session Tracking | User agent logged for forensics |

### 23.4 Data Retention

- Active patient records: Retained indefinitely
- Audit logs: Retained for 7 years (HIPAA requirement)
- Deleted records: Soft-deleted with `deleted_at` timestamp

---

## 24. Accessibility (WCAG 2.1 AA)

### 24.1 Implemented Features

| Feature | Description |
|---------|-------------|
| Skip Links | Keyboard users can skip navigation |
| Focus Management | Visible focus indicators, focus trapping |
| Screen Reader Support | ARIA labels, live regions |
| Reduced Motion | Respects `prefers-reduced-motion` |
| High Contrast | Supports `prefers-contrast` |
| Semantic HTML | Proper heading hierarchy, landmarks |

### 24.2 Components

- `SkipLink.tsx`: Skip to main content link
- `VisuallyHidden.tsx`: Screen reader only content
- `HelpTooltip.tsx`: Accessible help tooltips
- `useFocusManagement.ts`: Focus trap and roving tabindex hooks

### 24.3 Color Contrast

All text meets WCAG AA contrast requirements:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

---

**Document Version:** 3.0  
**Last Updated:** January 2026  
**System Version:** HMS v3.0  
**Total Components:** 120+  
**Total Database Tables:** 47+  
**Total Edge Functions:** 5  
**Total Custom Hooks:** 15  
**Total Utility Libraries:** 12  

---

*This documentation is proprietary and confidential. Unauthorized distribution is prohibited.*
