# 🏥 MediCore HMS – Enterprise Hospital Management System

<p align="center">
  <img src="docs/screenshots/hero-banner.png" alt="MediCore HMS Dashboard" width="100%">
</p>

<p align="center">
  <strong>🏆 Featured on SideProjectors</strong> • 
  <strong>⚡ Real-Time Supabase Powered</strong> • 
  <strong>🔒 HIPAA-Ready Architecture</strong>
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-why-medicore">Why MediCore?</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Docs</a>
</p>

---

## 🎯 Why MediCore?

**MediCore HMS** isn't just another hospital management system — it's a **real-time medical operating platform** built with modern technologies that hospitals actually need.

### ⚡ Real-Time Everything (Powered by Supabase)

Unlike traditional HMS solutions that require page refreshes, MediCore uses **Supabase Real-time subscriptions** to instantly sync data across all connected devices:

- 🔄 **Live Queue Updates:** Receptionists, doctors, and patients see queue changes in milliseconds
- 📊 **Real-Time Dashboards:** KPIs and metrics update automatically
- 🔔 **Instant Notifications:** No polling, no delays — just WebSocket efficiency
- 👥 **Multi-User Collaboration:** Multiple staff can work simultaneously without conflicts

### 💰 Cost-Effective Architecture

| Traditional HMS | MediCore HMS |
|-----------------|--------------|
| ❌ Expensive servers | ✅ Serverless (pay per use) |
| ❌ Complex maintenance | ✅ Zero infrastructure management |
| ❌ Slow updates | ✅ Real-time by default |
| ❌ Desktop-only | ✅ PWA (works on any device) |

### 🚀 Built for Speed

- **React 18** with concurrent rendering for smooth UX
- **Vite** for instant hot module replacement (HMR)
- **Optimized queries** with React Query caching
- **Edge Functions** for fast serverless operations

---

## ✨ Key Features

### 🏥 Core Hospital Operations

| Feature | Description |
|---------|-------------|
| ✅ **Real-Time Queue Management** | Token-based patient flow with live TV displays |
| ✅ **7 Role-Based Dashboards** | Admin, Doctor, Nurse, Pharmacist, Lab Tech, Receptionist, Patient |
| ✅ **Patient Registry** | Complete lifecycle from registration to discharge |
| ✅ **Appointment Scheduling** | Calendar-based booking with waitlist management |
| ✅ **Medical Records (EMR)** | FHIR-compatible with diagnosis/procedure codes |

### 💊 Clinical Modules

| Feature | Description |
|---------|-------------|
| ✅ **Prescription Management** | Drug interaction checker + QR verification |
| ✅ **Laboratory Module** | Sample tracking, result entry, report verification |
| ✅ **Pharmacy & Billing** | Inventory-linked dispensing with auto-deduction |
| ✅ **Blood Bank** | Compatibility matrix + donation/transfusion tracking |
| ✅ **Operation Theatre** | Surgery scheduling with team assignment |

### 📊 Administration & Analytics

| Feature | Description |
|---------|-------------|
| ✅ **Inventory Management** | Automated reorder alerts + supplier management |
| ✅ **Insurance Claims** | Submission, tracking, and appeals workflow |
| ✅ **Staff Management** | Scheduling, shift handovers, department assignment |
| ✅ **Reports & Analytics** | Drill-down charts with export (PDF/Excel) |
| ✅ **Audit Logging** | HIPAA-compliant PHI access tracking |

### 🔐 Security & Compliance

| Feature | Description |
|---------|-------------|
| ✅ **Row Level Security (RLS)** | Database-level access control |
| ✅ **Role-Based Permissions** | Granular feature access per role |
| ✅ **Secure Authentication** | Supabase Auth with session management |
| ✅ **Input Validation** | Zod schemas on all forms |
| ✅ **45+ RLS Policies** | Every table protected |

### 🌍 User Experience

| Feature | Description |
|---------|-------------|
| ✅ **Progressive Web App (PWA)** | Install on any device |
| ✅ **Multi-Language (i18n)** | English + Urdu (extensible) |
| ✅ **Dark/Light Mode** | System-aware theming |
| ✅ **Responsive Design** | Mobile-first approach |
| ✅ **Accessibility (a11y)** | WCAG 2.1 compliant |

---

## 📸 Screenshots

<p align="center">
  <img src="docs/screenshots/admin-dashboard.png" alt="Admin Dashboard" width="45%">
  <img src="docs/screenshots/patient-queue.png" alt="Patient Queue" width="45%">
</p>

<p align="center">
  <img src="docs/screenshots/doctor-dashboard.png" alt="Doctor Dashboard" width="45%">
  <img src="docs/screenshots/pharmacy-billing.png" alt="Pharmacy Billing" width="45%">
</p>

<p align="center">
  <img src="docs/screenshots/patient-portal.png" alt="Patient Portal" width="45%">
  <img src="docs/screenshots/blood-bank.png" alt="Blood Bank" width="45%">
</p>

> 📁 See all screenshots in [`/docs/screenshots/`](./docs/screenshots/)

---

## 🛠 Tech Stack

| Layer | Technology | Why? |
|-------|------------|------|
| **Frontend** | React 18 + TypeScript | Type-safe, concurrent rendering |
| **Build Tool** | Vite | Lightning-fast HMR |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first + beautiful components |
| **Icons** | Lucide React | Modern, tree-shakeable icons |
| **State** | React Query + Context | Server state + local state |
| **Backend** | Supabase | PostgreSQL + Auth + Real-time + Storage |
| **Edge Functions** | Deno | Serverless API endpoints |
| **Forms** | React Hook Form + Zod | Performance + validation |
| **Charts** | Recharts | Responsive data visualization |
| **Deployment** | Vercel / Netlify | Zero-config deployment |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (or Bun)
- Supabase account ([supabase.com](https://supabase.com))

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd medicore-hms

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Apply database migrations
# Import migrations from /supabase/migrations to your Supabase project

# 5. Start development server
npm run dev

# 6. Build for production
npm run build
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

---

## 📁 Project Structure

```
/src
├── /components       # Reusable UI components (organized by feature)
│   ├── /ui           # Base UI components (shadcn/ui)
│   ├── /dashboard    # Dashboard widgets
│   ├── /patients     # Patient management
│   ├── /pharmacy     # Pharmacy module
│   ├── /blood-bank   # Blood bank module
│   └── ...           # Other feature modules
├── /hooks            # Custom React hooks
├── /contexts         # React context providers
├── /pages            # Route page components
├── /lib              # Utility functions
├── /integrations     # Supabase client & types
└── /i18n             # Internationalization

/docs                 # Documentation
├── /screenshots      # Visual assets
├── COMPLETE_PROJECT_GUIDE.md
├── SETUP_GUIDE.md
├── USER_GUIDE.md
└── ...

/supabase
├── /functions        # Edge Functions
└── /migrations       # Database migrations
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Complete Project Guide](./docs/COMPLETE_PROJECT_GUIDE.md) | All features & workflows |
| [Setup Guide](./docs/SETUP_GUIDE.md) | Installation & configuration |
| [User Guide](./docs/USER_GUIDE.md) | End-user documentation |
| [Disaster Recovery](./docs/DISASTER_RECOVERY_PLAYBOOK.md) | Backup & recovery |
| [Notification System](./docs/NOTIFICATION_SYSTEM_DOCUMENTATION.md) | Notification architecture |

---

## ⚠️ Support Policy (No-Support License)

This is a **"as-is" source code product**. By purchasing, you acknowledge:

- ❌ **No Installation Support** — You or your developer must handle setup
- ❌ **No Customization Support** — Modifications are your responsibility  
- ❌ **No Bug Fix Guarantees** — Code is provided as-is at time of purchase
- ✅ **Documentation Included** — Comprehensive guides in `/docs` folder
- ✅ **Clean, Commented Code** — Easy to understand and extend
- ✅ **Database Migrations** — Ready to import into Supabase

> 💡 **Recommended:** Have a React/Supabase developer review the code before purchase if you're unsure about your technical capabilities.

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck
```

---

## 🔒 Security Features

- **Row Level Security (RLS):** 45+ policies protecting all tables
- **Role-Based Access Control:** 7 user roles with granular permissions
- **PHI Audit Logging:** HIPAA-compliant access tracking
- **Secure Authentication:** Supabase Auth with session management
- **Input Validation:** Zod schema validation on all forms
- **No Hardcoded Keys:** All secrets via environment variables

---

## 📄 License

This is a **commercial product** available exclusively on CodeCanyon. 

- **Regular License:** Single end product (free or paid)
- **Extended License:** Single end product where users are charged

© 2026 Fastam Solutions. All Rights Reserved.

---

<p align="center">
  <strong>Built with ❤️ by Fastam Solutions</strong>
</p>

<p align="center">
  <a href="https://codecanyon.net">View on CodeCanyon</a> •
  <a href="mailto:support@fastamsolutions.com">Contact Us</a>
</p>
