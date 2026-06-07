
# SaaS Pivot Plan — Insight Health Pro

CodeCanyon submission is **paused**. We rebuild the foundation as a multi-tenant SaaS with 3 plans (Basic / Pro / Premium) and module-based gating. Shared DB, row-level isolation by `organization_id`.

This is a big change. I'm splitting it into 3 phases so you approve each before the next. Phase 1 is the heavy lift — it touches ~70 tables. Phases 2 and 3 build on it.

---

## Phase 1 — Multi-Tenancy Foundation (this plan)

Goal: every row in the system belongs to an organization, and no user from org A can ever see org B's data — enforced at the database, not the app.

### 1. Activate the org tables that already exist
`organizations`, `organization_members`, `organization_modules` already exist (unused). We'll:
- Add columns we need: `plan` (basic/pro/premium enum), `status` (trialing/active/past_due/cancelled), `trial_ends_at`, `seat_limit`, `branding_json`.
- Bootstrap one "Default Organization" and migrate all existing users/data into it (zero-downtime migration).

### 2. Add `organization_id` to every tenant table
Tables that get a new `organization_id uuid NOT NULL REFERENCES organizations(id)`:

```
patients, doctors, nurses, appointments, medical_records,
prescriptions, lab_tests, queue_entries, daily_queues,
ipd_admissions, ward_rounds, discharge_summaries,
operations (OT), surgery_teams, blood_inventory, blood_donors,
blood_requests, transfusions, departments, department_doctors,
rooms, beds, inventory_items, purchase_orders, suppliers,
billing/invoices, payments, insurance_claims, hospital_settings,
notifications, phi_audit_log, staff_schedules, shift_handovers,
referrals, waitlist, patient_feedback, ... (~50 tables)
```

Tables that stay global: `user_roles`, `profiles` (per-user), reference data like `icd_codes`, `cpt_codes`, `drug_database`.

### 3. Rewrite RLS — every policy gets tenant scoping
Today policies look like:
```sql
USING (has_patient_care_relationship(auth.uid(), patient_id))
```
After:
```sql
USING (
  organization_id = get_user_organization_id()
  AND has_patient_care_relationship(auth.uid(), patient_id)
)
```
The `get_user_organization_id()` function already exists. We add `WITH CHECK` on every INSERT/UPDATE so a user physically cannot write a row outside their org.

### 4. Plan → Modules gating
Define module catalog (one row per module):
```
queue, ipd, ot, blood_bank, pharmacy, lab, insurance,
ai_copilot, ai_chatbot, ai_diagnosis, smart_scheduling,
patient_portal, multi_language, advanced_reports, fhir_export
```
Plan defaults:
- **Basic** — patients, appointments, prescriptions, billing, queue, lab
- **Pro** — Basic + IPD, pharmacy, blood bank, patient portal, insurance, multi-language
- **Premium** — Pro + OT, all AI features, smart scheduling, FHIR export, advanced reports

`is_module_enabled('module_key')` (already exists) becomes the single gate. Used by:
- Sidebar/menu (hide disabled modules)
- Route guards (block direct URL access)
- RLS on module-specific tables (defense in depth)

### 5. Onboarding flow (new)
- `/signup` becomes "Create your hospital workspace" — creates `organizations` row, makes user `org_owner`, starts 14-day Premium trial.
- First org admin then invites staff via email (uses existing `handle_new_user` trigger, extended to attach to the inviting org).
- `OrgSwitcher` in header for users who belong to multiple orgs (rare, but needed for support).

### 6. Update all hooks & queries
~80 TanStack Query hooks currently fetch unscoped. They'll automatically be tenant-scoped by RLS, but we'll:
- Add `organization_id` to query keys so cache doesn't bleed between orgs after switching.
- Add a `useCurrentOrg()` hook.
- Audit every `.insert()` call to include `organization_id`.

### 7. Edge functions
All 12 edge functions need `organization_id` resolution from JWT and enforcement on every query (AI copilot, chatbot, smart scheduling, etc.).

### Deliverables for Phase 1
- 1 large migration (org schema + add column + RLS rewrite + backfill)
- New `OrgContext` + `useCurrentOrg` hook
- `/signup` org-creation flow
- Updated `handle_new_user` trigger
- Module gating helpers (`useModule(key)`, `<RequireModule>` wrapper)
- Audit doc: `docs/MULTI_TENANCY_AUDIT.md`

**Estimated: ~2 weeks of focused work. This is the riskiest phase — PHI cross-tenant leak is the worst possible bug, so we'll add automated tests that simulate org-A trying to read org-B and assert empty results.**

---

## Phase 2 — Stripe Billing & Subscriptions (next plan)

After Phase 1 ships:
- Enable Lovable's built-in Stripe payments
- Create 3 products (Basic / Pro / Premium) with monthly + yearly prices
- Checkout flow + customer portal
- Webhook updates `organizations.plan` and `organization_modules` rows
- Trial → paid conversion, dunning, plan upgrade/downgrade
- Seat enforcement (block staff invite when `seat_count >= seat_limit`)
- Per-org usage metering (AI calls, storage)
- Pricing page rewrite (reverses CodeCanyon language removal)

---

## Phase 3 — SaaS Polish

- Landing page rewrite for SaaS (hero, pricing, testimonials, free trial CTA)
- Per-org branding (logo, colors) — table exists, wire to UI
- Org settings page (billing, members, plan, usage, danger zone)
- Admin/super-admin panel for you to see all orgs, MRR, churn
- Public marketing pages: features, integrations, security/HIPAA, docs
- Onboarding checklist for new orgs
- Email templates for trial reminders, payment failed, etc.

---

## What this plan does NOT include
- Building Stripe yet (Phase 2)
- Marketing site rewrite (Phase 3)
- DB-per-tenant migration (you chose shared DB)
- Killing the CodeCanyon files (you said pause, not delete — they'll just sit unused)
- New clinical features

---

## Memory updates needed
After Phase 1 approval, I'll update project memory:
- Remove `Standalone License Model` core rule
- Add `Multi-tenant SaaS — every public table is org-scoped via RLS`
- Add `Plans: Basic / Pro / Premium with module gating via organization_modules`

---

## Reply with one of:
- **"approve phase 1"** → I start building the foundation
- **"smaller first"** → I split Phase 1 further (e.g., just org tables + bootstrap, then add column, then RLS rewrite)
- **"questions"** → ask me anything before approving
