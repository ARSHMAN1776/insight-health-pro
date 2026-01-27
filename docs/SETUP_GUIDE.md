# 🏥 MediCore HMS - Complete Setup Guide

**Version:** 4.0.0  
**Last Updated:** January 2026

This guide provides step-by-step instructions for setting up the Hospital Management System locally and in production environments.

---

## System Modules Included

| Module | Description |
|--------|-------------|
| Patient Management | Registration, records, verification queue |
| Appointment System | Scheduling, queue management, waitlist |
| Clinical Records | Medical records, prescriptions, lab tests |
| Doctor-Patient Messaging | Two-way secure communication |
| Prescription Refill System | Request, review, and approval workflow |
| Blood Bank | Inventory, donors, transfusions |
| Operation Theatre | Surgery scheduling, teams, post-op |
| Pharmacy & Inventory | Stock management, dispensing |
| Billing & Insurance | Payments, claims, ICD/CPT coding |
| Staff Management | Schedules, departments, credentials |
| Reports & Analytics | Comprehensive reporting |
| Notifications | Real-time alerts and reminders |

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (5 Minutes)](#2-quick-start-5-minutes)
3. [Detailed Database Setup](#3-detailed-database-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [Edge Functions Setup](#5-edge-functions-setup)
6. [Creating First Admin User](#6-creating-first-admin-user)
7. [Local Development Commands](#7-local-development-commands)
8. [Production Deployment](#8-production-deployment)
9. [Troubleshooting](#9-troubleshooting)
10. [Security Considerations](#10-security-considerations)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 18.0+ | JavaScript runtime |
| **npm** or **yarn** | Latest | Package manager |
| **Git** | Latest | Version control |
| **Supabase Account** | Free tier+ | Backend services |
| **Modern Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Development & testing |

### Optional Tools

| Tool | Purpose |
|------|---------|
| **Supabase CLI** | Local development & migrations |
| **VS Code** | Recommended IDE with extensions |
| **Postman** | API testing |

---

## 2. Quick Start (5 Minutes)

For developers who want to get started immediately:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/medicore-hms.git
cd medicore-hms

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 3. Detailed Database Setup

### Option A: Fresh Database Setup (Recommended)

This is the recommended approach for new installations.

#### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** `medicore-hms` (or your preferred name)
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

#### Step 2: Get Project Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
3. Save these for the environment configuration

#### Step 3: Execute Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Open `src/database/schema.sql` from the project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **"Run"** (execution takes ~30 seconds)

#### Step 4: Verify Installation

Run this query in SQL Editor to verify:

```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected result: **47+ tables**

### Option B: Using Supabase Migrations (For Updates)

If you're updating an existing installation:

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Push migrations
supabase db push

# 5. Verify migrations
supabase db diff
```

---

## 4. Environment Configuration

### Create Environment File

Create a `.env` file in the project root:

```env
# ===========================================
# SUPABASE CONFIGURATION (Required)
# ===========================================
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# ===========================================
# EMAIL CONFIGURATION (Optional)
# ===========================================
# Required for contact form email delivery
RESEND_API_KEY=re_xxxxxxxxxxxxx

# ===========================================
# APP CONFIGURATION (Optional)
# ===========================================
VITE_APP_NAME=MediCore HMS
VITE_APP_URL=http://localhost:5173
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public key |
| `RESEND_API_KEY` | ❌ | For email functionality via Resend |
| `VITE_APP_NAME` | ❌ | Custom application name |
| `VITE_APP_URL` | ❌ | Application URL for links |

---

## 5. Edge Functions Setup

### Deploy Edge Functions

```bash
# 1. Navigate to supabase functions directory
cd supabase/functions

# 2. Deploy all functions
supabase functions deploy

# Or deploy individually:
supabase functions deploy send-contact-email
supabase functions deploy departments
supabase functions deploy send-appointment-reminders
supabase functions deploy send-lab-results-notification
supabase functions deploy cleanup-cancelled-appointments
```

### Set Edge Function Secrets

```bash
# Set Resend API key for email functionality
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Verify secrets
supabase secrets list
```

### Available Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `send-contact-email` | Contact form emails | HTTP POST |
| `departments` | CRUD operations for departments | HTTP |
| `send-appointment-reminders` | Appointment reminder emails | Cron/Manual |
| `send-lab-results-notification` | Lab results notifications | Database trigger |
| `cleanup-cancelled-appointments` | Clean old cancelled appointments | Cron |

---

## 6. Creating First Admin User

### Step 1: Register a New Account

1. Start the development server: `npm run dev`
2. Navigate to `/login`
3. Click **"Sign Up"** 
4. Register with your admin email and password
5. Complete email verification (if enabled)

### Step 2: Promote to Admin Role

Run this SQL in Supabase SQL Editor:

```sql
-- Replace 'your-admin@email.com' with your actual email
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'your-admin@email.com'
);

-- Verify the change
SELECT u.email, ur.role 
FROM auth.users u 
JOIN public.user_roles ur ON u.id = ur.user_id 
WHERE u.email = 'your-admin@email.com';
```

### Step 3: Verify Admin Access

1. Log out and log back in
2. You should now see the Admin Dashboard with full system access

---

## 7. Local Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint

# Run Vitest tests
npm run test

# Run tests in watch mode
npm run test:watch

# Type checking
npx tsc --noEmit
```

### Development URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Application |
| `http://localhost:5173/login` | Login page |
| `http://localhost:5173/dashboard` | Dashboard (requires auth) |

---

## 8. Production Deployment

### Option A: Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import your Git repository

2. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on each push to main

### Option B: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Add Environment Variables**
   - Go to Site settings → Build & deploy → Environment

4. **Deploy**
   - Netlify will build and deploy automatically

### Option C: Custom Server

```bash
# 1. Build the application
npm run build

# 2. The dist/ folder contains static files
# Serve with any static file server:

# Using serve (npm package)
npx serve dist

# Using nginx
# Copy dist/* to /var/www/html/

# Using Apache
# Copy dist/* to /var/www/html/
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Edge functions deployed
- [ ] Edge function secrets set
- [ ] SSL certificate configured
- [ ] Custom domain (optional)
- [ ] Database backup configured
- [ ] Monitoring set up
- [ ] Error tracking (Sentry, etc.)

---

## 9. Troubleshooting

### Common Issues

#### Issue: "RLS policy error" or "permission denied"

**Cause:** Row Level Security policies are preventing access.

**Solution:**
1. Verify the user has the correct role in `user_roles` table
2. Check that helper functions exist (`has_role`, `get_patient_id_for_user`, etc.)
3. Re-run the schema.sql file to ensure all policies are created

```sql
-- Check user's role
SELECT * FROM public.user_roles WHERE user_id = 'your-user-id';

-- Verify helper functions exist
SELECT proname FROM pg_proc WHERE proname LIKE 'has_role%' OR proname LIKE 'get_%_for_user';
```

#### Issue: "Authentication error" or "Invalid JWT"

**Cause:** Supabase credentials are incorrect or expired.

**Solution:**
1. Verify `VITE_SUPABASE_URL` is correct
2. Verify `VITE_SUPABASE_ANON_KEY` is the public anon key (not service role)
3. Check that your Supabase project is active

#### Issue: Edge function returns 500 error

**Cause:** Edge function secrets not configured or code error.

**Solution:**
```bash
# Check if secrets are set
supabase secrets list

# Check function logs
supabase functions logs send-contact-email

# Redeploy the function
supabase functions deploy send-contact-email
```

#### Issue: Database connection timeout

**Cause:** Network issues or project paused.

**Solution:**
1. Check Supabase project status in dashboard
2. If on free tier, project may be paused after inactivity
3. Click "Restore" in Supabase dashboard if paused

#### Issue: Module not found / Import errors

**Cause:** Dependencies not installed or corrupted.

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Debug Mode

Enable detailed logging:

```typescript
// In src/integrations/supabase/client.ts
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

### Getting Help

1. Check the [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for detailed feature docs
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser/OS information
   - Relevant console logs

---

## 10. Security Considerations

### Before Going to Production

- [ ] **Change default passwords** - Update any test accounts
- [ ] **Enable email verification** - Supabase Auth settings
- [ ] **Configure MFA** - For admin accounts
- [ ] **Review RLS policies** - Ensure data is properly protected
- [ ] **Set up backup** - Configure automated database backups
- [ ] **Enable audit logging** - PHI access tracking for HIPAA
- [ ] **Configure rate limiting** - Prevent abuse
- [ ] **Set up monitoring** - Track errors and performance

### HIPAA Compliance Notes

If handling Protected Health Information (PHI):

1. **Audit Logging** - All PHI access is logged to `phi_audit_log`
2. **Data Encryption** - Supabase encrypts data at rest
3. **Access Control** - RLS policies enforce role-based access
4. **Backup Retention** - Configure 7-year retention for compliance
5. **BAA Agreement** - Obtain Business Associate Agreement from Supabase

### Security Best Practices

```sql
-- Regularly audit admin access
SELECT u.email, ur.role, ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Check for suspicious PHI access
SELECT *
FROM public.phi_audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## Quick Reference

### Key URLs

| Environment | URL |
|-------------|-----|
| Local Dev | `http://localhost:5173` |
| Supabase Dashboard | `https://app.supabase.com` |
| Production | Your deployed URL |

### Important Files

| File | Purpose |
|------|---------|
| `src/database/schema.sql` | Complete database schema |
| `.env` | Environment configuration |
| `supabase/functions/` | Edge functions |
| `PROJECT_DOCUMENTATION.md` | Full feature documentation |

### Support Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
supabase db push     # Push migrations
supabase functions deploy  # Deploy edge functions
```

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Compatible With:** MediCore HMS v3.0

---

*For detailed feature documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)*
