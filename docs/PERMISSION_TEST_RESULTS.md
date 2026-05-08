# Phase 3 — Per-Role Permission Test Results

Date: 2026-05-08
Method: Static review of every RLS policy on every sensitive table, cross-
checked against the role × module × action matrix in
`docs/COMPLETE_PROJECT_GUIDE.md` §2.

Legend: ✓ allowed · ✗ denied · ▲ allowed for own / care-relationship rows only

## Patient

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|:------:|:------:|:------:|:------:|
| patients (own) | ▲ | ✗ | ▲ | ✗ |
| appointments (own) | ▲ | ▲ | ▲ | ▲ (cancel only) |
| medical_records (own) | ▲ | ✗ | ✗ | ✗ |
| prescriptions (own) | ▲ | ✗ | ✗ | ✗ |
| lab_tests (own) | ▲ | ✗ | ✗ | ✗ |
| patient_vitals (own) | ▲ | ✗ | ✗ | ✗ |
| payments (own) | ▲ | ✗ | ✗ | ✗ |
| ipd_admissions (own) | ▲ | ✗ | ✗ | ✗ |
| discharge_summaries (own) | ▲ | ✗ | ✗ | ✗ |
| user_roles | ▲ (own) | ✗ | ✗ | ✗ |
| phi_audit_log | ✗ | ▲ (own actions) | ✗ | ✗ |

Verified: a patient cannot read another patient's data on any of the 70
tables, and cannot self-promote to admin.

## Doctor

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|:------:|:------:|:------:|:------:|
| patients | ▲ care rel. | ✗ | ✗ | ✗ |
| appointments | ▲ own | ▲ | ▲ | ✗ |
| medical_records | ▲ own + care rel. | ▲ self | ▲ self | ✗ (admin only) |
| prescriptions | ▲ own | ▲ self | ▲ self | ✗ |
| lab_tests | ▲ own | ▲ self | ▲ self | ✗ |
| patient_vitals | ▲ care rel. | ✗ | ✗ | ✗ |
| user_roles | ▲ own | ✗ | ✗ | ✗ |

## Nurse

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|:------:|:------:|:------:|:------:|
| patients | ▲ care rel. | ✗ | ✗ | ✗ |
| appointments | ▲ today | ✗ | ▲ | ✗ |
| medical_records | ▲ care rel. | ✗ | ✗ | ✗ |
| prescriptions | ✓ all (review need) | ✗ | ✗ | ✗ |
| lab_tests | ✓ all + care rel. | ✗ | ✓ | ✗ |
| patient_vitals | ✓ all | ✓ | ✓ | ✗ |
| ipd_admissions | ▲ care rel. | ✓ | ✓ | ✗ |

Note: nurse can view ALL prescriptions (not just those for their patients).
This is intentional today (cross-coverage shifts) but flagged for product
review.

## Receptionist

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|:------:|:------:|:------:|:------:|
| patients | ✓ | ✓ | ✓ | ✗ (admin only) |
| appointments | ✓ | ✓ | ✓ | ✓ |
| payments | ✓ | ✓ | ✓ | ✓ |
| ipd_admissions | ✓ | ✓ | ✓ | ✗ |
| medical / clinical | ✗ | ✗ | ✗ | ✗ |

## Lab Technician

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|:------:|:------:|:------:|:------:|
| lab_tests | ✓ all + assigned/pending | ✗ | ✓ assigned/pending | ✗ |
| patients | ✗ direct (via lab_tests join) | ✗ | ✗ | ✗ |
| medical / prescriptions | ✗ | ✗ | ✗ | ✗ |

## Pharmacist

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|:------:|:------:|:------:|:------:|
| prescriptions | ✓ | ✗ | ✗ (status only via app logic) | ✗ |
| inventory | ✓ | ✓ | ✓ | ✗ |
| pharmacy_bills / items | ✓ | ✓ | ✓ | ✗ |

## Admin

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|:------:|:------:|:------:|:------:|
| All tables | ✓ | ✓ | ✓ | ✓ |

---

## Findings

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | Patient could see all discharge summaries | CRITICAL | Fixed in Phase 2 |
| 2 | Patient could see all IPD admissions | CRITICAL | Fixed in Phase 2 |
| 3 | Any user could insert their own admin role | CRITICAL | Fixed in Phase 2 |
| 4 | Duplicate audit-log SELECT policies | LOW | Fixed in Phase 2 |
| 5 | Nurse can view all prescriptions (not just care rel.) | INFO | Accepted — required for night-shift coverage |
| 6 | Nurse can view all lab tests | INFO | Accepted — required for ward operations |

No further migrations required. The role × table × action matrix now
matches the documented intent in `docs/COMPLETE_PROJECT_GUIDE.md`.

---

## Recommendation for ongoing protection

1. Add a Vitest suite that signs in as each demo role and asserts the
   policies above (the demo accounts in `docs/DEMO_CREDENTIALS.md` make
   this trivial).
2. Re-run the Supabase linter after every migration; the only acceptable
   warnings are the 53 already documented in `RLS_SECURITY_AUDIT_REPORT.md`.
3. Never replace `WITH CHECK` expressions with `true`; always require the
   row to belong to the calling user or to a patient under their care.
