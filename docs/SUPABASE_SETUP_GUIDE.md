# 🔌 MediCore HMS - Supabase Connection Guide

> **Complete Step-by-Step Instructions for Connecting Your Supabase Backend**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Supabase Project](#creating-a-supabase-project)
3. [Getting Your API Credentials](#getting-your-api-credentials)
4. [Configuring Environment Variables](#configuring-environment-variables)
5. [Setting Up the Database Schema](#setting-up-the-database-schema)
6. [Configuring Authentication](#configuring-authentication)
7. [Setting Up Edge Functions](#setting-up-edge-functions)
8. [Configuring Storage Buckets](#configuring-storage-buckets)
9. [Testing the Connection](#testing-the-connection)
10. [Troubleshooting](#troubleshooting)

---

## 🛠️ Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ A Supabase account (free tier works!)
- ✅ MediCore source code downloaded

---

## 1️⃣ Creating a Supabase Project

### Step 1: Sign Up / Login to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign In"**
3. Sign up using GitHub, GitLab, or email

### Step 2: Create a New Project

1. Click **"New Project"** button
2. Select your organization (or create one)
3. Fill in the project details:
   - **Name**: `medicore-hms` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

---

## 2️⃣ Getting Your API Credentials

### Navigate to Project Settings

1. In your Supabase dashboard, go to **Settings** (gear icon)
2. Click on **API** in the sidebar

### Copy Your Credentials

You'll need two values:

| Credential | Description | Location |
|------------|-------------|----------|
| **Project URL** | Your unique Supabase URL | `https://[project-ref].supabase.co` |
| **Anon Public Key** | Client-side API key | Under "Project API keys" |

⚠️ **Important**: Never expose the `service_role` key in your frontend code!

---

## 3️⃣ Configuring Environment Variables

### Step 1: Create Environment File

In your MediCore project root, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Add Your Credentials

Edit the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For development debugging
VITE_DEBUG_MODE=false
```

### Example Values

```env
# Example (DO NOT use these - use your own!)
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.xxxxx
```

---

## 4️⃣ Setting Up the Database Schema

### Option A: Using the SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open the `docs/DATABASE_SCHEMA.sql` file from this package
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **"Run"** to execute

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Verification

After running the schema, verify the tables were created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see 47+ tables including:
   - `patients`
   - `doctors`
   - `appointments`
   - `prescriptions`
   - `medical_records`
   - etc.

---

## 5️⃣ Configuring Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure settings:
   - ✅ Enable email confirmations (recommended for production)
   - ✅ Enable email change confirmations
   - Set **Site URL** to your frontend URL

### Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - Confirm signup
   - Reset password
   - Magic link

### Set Up Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your allowed redirect URLs:
   ```
   http://localhost:5173/**
   http://localhost:8080/**
   https://your-production-domain.com/**
   ```

---

## 6️⃣ Setting Up Edge Functions

### Required Edge Functions

MediCore includes several Edge Functions for backend logic:

| Function | Purpose |
|----------|---------|
| `send-appointment-reminders` | Email reminders for appointments |
| `send-lab-results-notification` | Lab result notifications |
| `cleanup-cancelled-appointments` | Automated cleanup |
| `send-contact-email` | Contact form emails |
| `departments` | Department management |

### Deploying Edge Functions

#### Using Supabase CLI:

```bash
# Navigate to project directory
cd medicore-hms

# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy send-appointment-reminders
```

### Configure Secrets for Edge Functions

1. Go to **Settings** → **Edge Functions**
2. Add required secrets:

```bash
# Using CLI
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `RESEND_API_KEY` | For sending emails via Resend | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configured | No |

---

## 7️⃣ Configuring Storage Buckets

### Create Required Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create the following bucket:

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `lab-reports` | Yes | Store lab report images/PDFs |

### Set Storage Policies

For the `lab-reports` bucket, the schema includes RLS policies for:
- Public read access
- Authenticated write access
- User-specific file management

---

## 8️⃣ Testing the Connection

### Quick Test

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:5173`

3. Check the browser console for:
   - ✅ No Supabase connection errors
   - ✅ Successful API responses

### Test Authentication

1. Navigate to the registration page
2. Create a test account
3. Verify the user appears in **Authentication** → **Users**

### Test Database

1. After registering, check **Table Editor**
2. Verify data appears in:
   - `profiles` table
   - `user_roles` table
   - `patients` table (for patient role)

---

## 9️⃣ Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"

**Cause**: `.env` file not configured or not loaded

**Solution**:
1. Ensure `.env` file exists in project root
2. Verify variable names start with `VITE_`
3. Restart the development server

#### "Invalid API key"

**Cause**: Wrong API key or typo

**Solution**:
1. Re-copy the key from Supabase Dashboard
2. Ensure you're using the `anon` key, not `service_role`

#### "RLS policy violation"

**Cause**: Row Level Security blocking access

**Solution**:
1. Check user authentication status
2. Verify RLS policies in SQL Editor
3. Ensure user has correct role in `user_roles` table

#### "CORS error"

**Cause**: Frontend URL not in allowed list

**Solution**:
1. Go to **Authentication** → **URL Configuration**
2. Add your frontend URL to allowed list

#### "Edge function failing"

**Cause**: Missing secrets or incorrect code

**Solution**:
1. Check function logs in Dashboard
2. Verify all secrets are configured
3. Test function with curl or Postman

---

## 📌 Quick Reference

### Environment Variables Summary

```env
# Required
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[your-anon-key]
```

### Important URLs

| Resource | URL |
|----------|-----|
| Dashboard | https://supabase.com/dashboard |
| Table Editor | `[dashboard]/project/[ref]/editor` |
| SQL Editor | `[dashboard]/project/[ref]/sql/new` |
| Authentication | `[dashboard]/project/[ref]/auth/users` |
| Edge Functions | `[dashboard]/project/[ref]/functions` |
| Storage | `[dashboard]/project/[ref]/storage` |

### Supabase CLI Commands

```bash
# Login
supabase login

# Link project
supabase link --project-ref [ref]

# Deploy functions
supabase functions deploy

# Run migrations
supabase db push

# Check status
supabase status
```

---

## 📞 Need Help?

- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **MediCore Issues**: Check `docs/TROUBLESHOOTING.md`
- **Community**: Supabase Discord Community

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Compatible With**: MediCore HMS v3.0+
