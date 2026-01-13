# 🏥 MediCore HMS – Enterprise Hospital Management System

**Featured on SideProjectors 🏆** | **Enterprise-Grade Architecture** | **Production Ready**

MediCore HMS is a high-performance, real-time medical operating system designed for modern healthcare facilities. Built by **Fastam Solutions**, this system bridges the gap between administrative chaos and operational excellence.

---

## 🚀 Key Features

- **Real-time Queue Management:** Instant sync between reception and doctor clinics (Supabase Real-time)
- **Integrated Pharmacy & Billing:** Automated stock tracking and secure revenue management
- **7 Comprehensive Dashboards:** Tailored views for Admin, Doctor, Pharmacist, Patient, etc.
- **HIPAA-Ready Schema:** 45+ optimized PostgreSQL tables with Row Level Security (RLS)
- **Multi-language Support:** English and Urdu with i18n framework
- **PWA Ready:** Installable progressive web app with offline capabilities

---

## 📁 Project Structure

```
/src
├── /components       # Reusable UI components (organized by feature)
│   ├── /ui           # Base UI components (shadcn/ui)
│   ├── /dashboard    # Dashboard widgets
│   ├── /patients     # Patient management components
│   ├── /appointments # Appointment scheduling
│   ├── /pharmacy     # Pharmacy module
│   ├── /lab-tests    # Laboratory module
│   ├── /blood-bank   # Blood bank module
│   └── ...           # Other feature components
├── /hooks            # Custom React hooks
├── /contexts         # React context providers
├── /pages            # Route page components
├── /lib              # Utility functions and helpers
├── /integrations     # Third-party integrations (Supabase)
└── /i18n             # Internationalization files

/docs                 # Documentation files
├── COMPLETE_PROJECT_GUIDE.md
├── SETUP_GUIDE.md
├── USER_GUIDE.md
├── DISASTER_RECOVERY_PLAYBOOK.md
└── NOTIFICATION_SYSTEM_DOCUMENTATION.md

/supabase
├── /functions        # Edge Functions
└── /migrations       # Database migrations

/public               # Static assets
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State** | React Query, Context API |
| **Backend** | Supabase (PostgreSQL, Auth, Real-time) |
| **Edge Functions** | Deno (Supabase Functions) |
| **Deployment** | Vercel / Netlify Ready |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medicore-hms
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

4. **Run database migrations**
   - Apply migrations from `/supabase/migrations` to your Supabase project

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

---

## 📖 Documentation

Full documentation is available in the `/docs` folder:

| Document | Description |
|----------|-------------|
| [Complete Project Guide](./docs/COMPLETE_PROJECT_GUIDE.md) | Comprehensive feature documentation |
| [Setup Guide](./docs/SETUP_GUIDE.md) | Installation and configuration |
| [User Guide](./docs/USER_GUIDE.md) | End-user documentation |
| [Disaster Recovery](./docs/DISASTER_RECOVERY_PLAYBOOK.md) | Backup and recovery procedures |
| [Notification System](./docs/NOTIFICATION_SYSTEM_DOCUMENTATION.md) | Notification architecture |

---

## 🔐 Security Features

- **Row Level Security (RLS):** All tables protected with PostgreSQL policies
- **Role-Based Access Control:** 7 distinct user roles with granular permissions
- **PHI Audit Logging:** HIPAA-compliant audit trail for patient data access
- **Secure Authentication:** Supabase Auth with session management
- **Input Validation:** Zod schema validation on all forms

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 📦 Environment Variables

See `.env.example` for required environment variables. Never commit `.env` with real credentials.

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

**Edge Function Secrets** (set in Supabase Dashboard):
- `RESEND_API_KEY` - For email notifications
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-injected by Supabase

---

## 💰 Licensing

This repository is the core engine of the MediCore Suite. For full source code access, commercial licensing, and technical documentation, please visit our listing on **CodeCanyon** or contact **Fastam Solutions**.

---

## 📧 Support

For support and inquiries, contact **Fastam Solutions**.

---

© 2026 Fastam Solutions. All Rights Reserved.
