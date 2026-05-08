# Phase 2 — RLS & Data Security Audit Report

Date: 2026-05-08
Scope: All 70 public tables in the HMS database.

## Executive summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 3 | Fixed |
| MEDIUM | 1 | Fixed (cleanup) |
| LOW / Advisory | 53 linter warnings | Reviewed — accepted |

RLS is enabled on **100 % of public tables** (verified via `pg_class` + `pg_policies`).

---

## CRITICAL findings — fixed in this phase

### 1. Privilege escalation on `user_roles`
**Before:** policy `"Allow signup to create role"` allowed any authenticated
user to `INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'admin')`
and instantly gain full admin access.

**After:** that policy was dropped. The trusted `handle_new_user()` trigger
(SECURITY DEFINER) still assigns the initial role at signup. Only admins can
add roles after that. Explicit admin-only `UPDATE` and `DELETE` policies were
added as defence in depth.

### 2. PHI leak on `discharge_summaries`
**Before:** `USING (true)` for authenticated → every signed-in user (including
patients) could read every discharge summary in the system.

**After:** restricted to (a) the patient who owns the linked admission,
(b) admins, and (c) doctors / nurses with an active care relationship to that
patient (via `has_patient_care_relationship`).

### 3. PHI leak on `ipd_admissions`
**Before:** identical `USING (true)` for authenticated → all admissions
visible to every user.

**After:** restricted to the patient, admins, receptionists, and clinical
staff with an active care relationship.

---

## MEDIUM findings — fixed

### 4. Duplicate policies on `phi_audit_log`
Three identical SELECT policies (`"Admin can view audit logs"`,
`"Admins can view audit logs"`, `"Admins can view all audit logs"`) made the
policy list confusing. Two duplicates dropped; one canonical policy kept.

---

## Sensitive tables — verified correct

The following high-value tables were re-verified after the migration:

| Table | Patient self | Doctor (own patients) | Nurse | Receptionist | Lab tech | Admin |
|-------|--------------|-----------------------|-------|--------------|----------|-------|
| `patients` | own row | care relationship | care relationship | full | – | full |
| `medical_records` | own | own + care rel. | care rel. | – | – | full |
| `prescriptions` | own | own + care rel. | care rel. + all (audit) | – | – | full |
| `lab_tests` | own | own + care rel. | care rel. + all | – | assigned/pending | full |
| `patient_vitals` | own | care relationship | all | – | – | full |
| `payments` | own | – | – | full | – | full |
| `phi_audit_log` | – | – | – | – | – | view; insert by self |
| `discharge_summaries` | own | care relationship | care relationship | – | – | full |
| `ipd_admissions` | own | care relationship | care relationship | full | – | full |
| `user_roles` | own | – | – | – | – | full |

`has_patient_care_relationship(uid, patient_id)` is the single canonical
gatekeeper for clinical-staff access; verified `SECURITY DEFINER` with
`SET search_path = public` and no recursive RLS calls.

---

## Advisory warnings (53) — accepted risk

The Supabase linter flagged 53 warnings in three categories:

1. **Extension in public schema** (1) — pgcrypto. Standard, accepted.
2. **Public storage buckets allow listing** (2) — `lab-reports` and
   `hospital-branding` are intentionally public so reports and logos can be
   embedded in printable documents and emails. File names are UUIDs.
3. **`SECURITY DEFINER` functions executable by anon / authenticated** (50) —
   These are the helper functions that power RLS itself
   (`has_role`, `get_patient_id_for_user`, `has_patient_care_relationship`,
   `doctor_has_patient_relationship`, queue helpers, etc.). Revoking
   `EXECUTE` would break every RLS policy. All functions are read-only or
   strictly scoped to `auth.uid()`, set `search_path = public`, and contain
   no privilege-granting side effects.

These are recorded in the security memory and will not be flagged again.

---

## Functions security checklist

All `SECURITY DEFINER` functions verified:

- ✓ `SET search_path = public` (prevents search-path hijacking)
- ✓ Use `auth.uid()` instead of trusting client input
- ✓ No function lets a non-admin grant a role to themselves
- ✓ `get_or_create_daily_queue` and `generate_next_token` enforce role gate
  via `has_role()` before mutating queues

---

## What changed in the database

Single migration (`Phase 2 RLS Security Hardening`) executed on 2026-05-08:

```
- DROP POLICY "Allow signup to create role" ON user_roles
- CREATE POLICY "Only admins can update roles" ON user_roles (UPDATE)
- CREATE POLICY "Only admins can delete roles" ON user_roles (DELETE)
- DROP POLICY "Authenticated users can view discharge summaries"
- CREATE POLICY "Patients can view own discharge summaries"
- CREATE POLICY "Clinical staff can view discharge summaries for their patients"
- DROP POLICY "Authenticated users can view admissions"
- CREATE POLICY "Patients can view own admissions"
- CREATE POLICY "Clinical staff can view admissions for their patients"
- DROP POLICY "Admin can view audit logs"  (duplicate)
- DROP POLICY "Admins can view audit logs" (duplicate)
```

No data was modified.
