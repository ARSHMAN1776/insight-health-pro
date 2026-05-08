## Goal

Conduct a deep audit and hardening pass on the HMS database (70+ tables) and access control layer to guarantee data integrity, correct relationships, and that every role's add/edit/delete permissions behave exactly as intended.

## Scope (3 phases)

### Phase 1 — Database Relationship & Integrity Audit

Verify the schema is structurally sound across all 70+ tables.

1. **Foreign Key Audit** — query `information_schema` to list every FK, then check:
   - Missing FKs where columns clearly reference another table (e.g. `patient_id`, `doctor_id`, `user_id`).
   - Orphan rows (FK column populated but parent row missing).
   - Inconsistent `ON DELETE` behavior (CASCADE vs SET NULL vs RESTRICT) — especially for clinical data which must NEVER be hard-deleted.
2. **Nullable / Default audit** — flag columns that should be NOT NULL (e.g. `user_id` on RLS-protected tables, status fields, timestamps).
3. **Unique constraints** — ensure uniqueness where required (license numbers, email per role, token per queue/day, room+bed, etc.).
4. **Indexes** — verify indexes exist on every FK and on columns used in RLS policies / hot queries (appointments by date+doctor, queue_entries by queue+status, notifications by user_id+is_read).
5. **Soft-delete consistency** — confirm `deleted_at` filtering is uniform across patients, appointments, medical_records, prescriptions, lab_tests.
6. **Enum / status value audit** — make sure status strings used in code match DB enums/check constraints.

Deliverable: `docs/DATABASE_AUDIT_REPORT.md` listing every issue found + a single migration to fix them.

### Phase 2 — Data Security & RLS Hardening

The user's #1 concern is patient data safety.

1. **RLS coverage check** — every public table must have `ENABLE ROW LEVEL SECURITY` + at least one policy. Run Supabase linter.
2. **Policy correctness review** — for each sensitive table (patients, medical_records, prescriptions, lab_tests, patient_vitals, phi_audit_log, payments, insurance_claims, patient_messages, ipd_admissions, discharge_summaries):
   - Patient can only see own rows.
   - Doctor sees only patients with care relationship (`has_patient_care_relationship`).
   - Nurse / Lab Tech / Receptionist scoped correctly.
   - Admin full access.
   - INSERT/UPDATE/DELETE policies separately verified — many tables only have SELECT policies today.
3. **Sensitive column exposure** — confirm `doctors_directory` view pattern is applied wherever PII/license data lives; deny direct SELECT on base tables.
4. **PHI audit triggers** — ensure every read/write on patient clinical tables logs to `phi_audit_log` (currently inconsistent).
5. **Privilege escalation check** — confirm no policy lets a user write to `user_roles` for themselves.
6. **Function security** — every SECURITY DEFINER function has `SET search_path = public` and explicit role gating (most do, verify all).

Deliverable: matrix doc + migration adding missing policies, triggers, and view-based protections.

### Phase 3 — Permission Matrix End-to-End Test

Validate the documented role × module × action matrix actually matches DB behavior.

1. Build a SQL test script that, for each of 7 roles, attempts SELECT/INSERT/UPDATE/DELETE on every relevant table and records pass/fail.
2. Compare results to the matrix in `docs/COMPLETE_PROJECT_GUIDE.md` §2.
3. Any mismatch becomes a finding → fixed via migration or doc correction.
4. Add a short Vitest suite hitting the Supabase client as each role to catch regressions.

Deliverable: `docs/PERMISSION_TEST_RESULTS.md` + automated test file.

## Technical approach

```text
Phase 1 → read-only SQL audit  → 1 migration
Phase 2 → RLS review + linter  → 1 migration (+ triggers)
Phase 3 → role simulation      → tests + doc
```

No frontend changes. No feature changes. Pure backend hardening.

## Out of scope

- Adding new modules or UI.
- Changing business logic.
- Performance tuning beyond adding missing indexes uncovered in Phase 1.

## Before I start — quick confirmation

Two things I want to confirm so I don't slow you down:

1. **Destructive deletes:** today some tables hard-delete (e.g. patients via `deletePatient`). Should I convert all clinical deletes to **soft-delete only** (set `deleted_at`) so PHI is never lost? Recommended for HMS.
2. **Scope of fixes:** if I find 30+ issues, do you want **one big migration** at the end, or **phase-by-phase migrations** that you approve individually?

Reply and I'll start Phase 1 immediately.