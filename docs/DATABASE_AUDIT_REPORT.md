# Database Audit Report — Phase 1
**Date:** May 2026 · **Scope:** All 70 public tables · **Auditor:** Lovable agent

## Executive summary

Overall the schema is in **good shape**:
- All 70 tables have **RLS enabled** with at least one policy (no exposed tables).
- 60+ foreign keys are correctly declared with appropriate `ON DELETE` rules.
- Soft-delete (`deleted_at`) is consistently used on the 5 critical clinical tables (patients, appointments, medical_records, prescriptions, lab_tests).

The audit found **3 categories** of issues — all fixable with a single migration.

---

## Findings

### A. Missing foreign keys (4 columns)

| Table | Column | Should reference | Orphans found |
|-------|--------|------------------|---------------|
| `phi_audit_log` | `patient_id` | `patients(id)` | 0 |
| `ipd_admissions` | `attending_nurse_id` | `nurses(id)` | 0 |
| `shift_handovers` | `incoming_nurse_id` | `nurses(id)` | **1** (will be NULLed) |
| `shift_handovers` | `outgoing_nurse_id` | `nurses(id)` | **1** (will be NULLed) |
| `ward_rounds` | `nurse_id` | `nurses(id)` | 0 |

> Polymorphic columns (`reminders.related_id`, `notifications.user_id` → auth.users, `staff_schedules.staff_id`, `saas_audit_logs.resource_id`) are intentional and excluded.

### B. Missing indexes on FK columns (26 columns)

Every FK should have an index to keep cascade/joins fast. Currently missing on:

```
api_keys.created_by, appointment_waitlist.department_id,
daily_queues.department_id, hospital_settings.updated_by,
insurance_claims.appointment_id, inventory.supplier_id,
ipd_admissions.department_id, ipd_admissions.room_assignment_id,
lab_tests.doctor_id, organization_members.invited_by,
organization_subscriptions.plan_id, organizations.created_by,
patient_registration_queue.patient_id, patient_registration_queue.reviewed_by,
pharmacy_bills.prescription_id, prescription_templates.doctor_id,
prescriptions.doctor_id, purchase_order_items.inventory_item_id,
purchase_orders.approved_by, purchase_orders.created_by,
queue_entries.appointment_id, referrals.appointment_id,
referrals.receiving_department_id, scheduling_recommendations.doctor_id,
shift_handover_patients.patient_id, ward_rounds.doctor_id
```

### C. RLS posture — clean

- 0 tables without RLS.
- 0 SECURITY DEFINER functions without `SET search_path = public`.
- Sensitive PII protected by the `doctors_directory` view pattern.
- `has_patient_care_relationship()` consistently used for clinical tables.

The Supabase linter reports 53 warnings, all in known categories (extension-in-public, public-can-execute SECURITY DEFINER, public bucket listing) that the team has previously accepted as intentional for the SaaS architecture.

### D. Nullable / not-null

No critical violations. `doctors.user_id` is nullable by design (allows admin-created profiles before invite). `daily_queues.doctor_id` nullable supports department-only queues.

### E. Hard-delete risk (recommendation, not a defect)

`PatientManagement.handleDelete` calls `dataManager.deletePatient` which performs a hard DELETE. Since `appointments`, `medical_records`, etc. cascade ON DELETE, deleting a patient destroys their entire clinical history. **Recommended Phase 2 change:** convert to soft-delete (set `deleted_at`).

---

## Phase 1 Migration plan

A single migration will:
1. NULL the 2 orphan `shift_handovers` nurse references.
2. Add the 5 missing foreign keys (all `ON DELETE SET NULL` to preserve audit data).
3. Create 26 indexes on existing FK columns.

No application code changes required — the migration is additive and backward-compatible.

---
*Phases 2 (RLS deep review + PHI audit triggers) and 3 (per-role permission tests) follow.*
