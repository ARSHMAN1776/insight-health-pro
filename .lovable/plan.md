
# Plan: Fix Onboarding RLS Error & Plan-Based Module Selection

## Problem Summary

### Issue 1: RLS Policy Violation on Organizations Table
Users are getting "new row violates row-level security policy for table organizations" when completing onboarding. Root cause: The INSERT policy checks `created_by = auth.uid()` but the session state may not be fully synchronized when making the database call.

### Issue 2: Module Selection Not Tied to Plans
Currently, users can select any module during onboarding. The user wants:
- Modules to be pre-selected based on the chosen plan
- Extra modules beyond the plan should require additional payment

---

## Solution Overview

### Fix 1: Strengthen RLS Policy and Improve Session Handling

**Database Changes:**
- Add an alternative INSERT policy that allows any authenticated user to create an organization where they set themselves as creator
- Remove the NULL check (not needed and could be a security issue)

**Code Changes in OnboardingWizard:**
- Add explicit session refresh before organization creation
- Add retry logic with session re-fetch on RLS errors
- Better error messaging for users

### Fix 2: Plan-Based Module Selection

**New Behavior:**
- When user selects a plan, auto-populate `enabledModules` with that plan's included modules
- Show modules in 3 categories:
  1. **Included** - Modules included in selected plan (enabled, cannot disable)
  2. **Available Add-ons** - Modules NOT in plan but available for purchase (toggleable)
  3. **Enterprise Only** - Modules only available in Enterprise tier (locked with upgrade prompt)

**Pricing for Add-ons:**
- Create a new table `module_pricing` to store per-module add-on costs
- Show monthly price for each add-on module
- Calculate total additional cost

---

## Technical Implementation

### Phase 1: Database Schema Changes

Create migration to:

1. **Update organizations INSERT policy:**
```sql
DROP POLICY "Users can create their own organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
ON organizations FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());
```

2. **Add module pricing table:**
```sql
CREATE TABLE module_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_plan_tier INTEGER DEFAULT 1,
  is_enterprise_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert pricing for add-on modules
INSERT INTO module_pricing (module_key, name, description, price_monthly, price_yearly, min_plan_tier, is_enterprise_only)
VALUES
  ('lab_tests', 'Lab & Diagnostics', 'Test orders and results management', 99, 990, 2, false),
  ('pharmacy', 'Pharmacy', 'Medication inventory and dispensing', 99, 990, 2, false),
  ('inventory', 'Inventory Management', 'Stock and supplies tracking', 79, 790, 2, false),
  ('insurance', 'Insurance Claims', 'Process and track insurance claims', 149, 1490, 2, false),
  ('referrals', 'Referral Management', 'Patient referral workflows', 49, 490, 2, false),
  ('reports', 'Advanced Reports', 'Analytics and custom reporting', 79, 790, 2, false),
  ('rooms', 'Rooms & Beds', 'Room and bed assignments', 49, 490, 2, false),
  ('vitals', 'Vitals Tracking', 'Patient vital signs monitoring', 49, 490, 2, false),
  ('queue', 'Queue Management', 'Patient queue and token system', 49, 490, 2, false),
  ('blood_bank', 'Blood Bank', 'Blood inventory and transfusion', 199, 1990, 3, true),
  ('operation_dept', 'Operation Theatre', 'Surgery scheduling and management', 199, 1990, 3, true),
  ('audit_logs', 'Audit Logs', 'PHI access audit trail', 99, 990, 3, false),
  ('shift_handover', 'Shift Handover', 'Nursing shift handover notes', 49, 490, 3, true);
```

### Phase 2: Frontend Changes

**File: `src/components/onboarding/steps/ModulesStep.tsx`**

Update to show plan-based module selection:
- Fetch plan's included modules from `subscription_plans.modules`
- Categorize modules as Included/Add-on/Enterprise-only
- Show pricing for add-ons
- Calculate total add-on cost

**File: `src/components/onboarding/OnboardingWizard.tsx`**

- Add session refresh before organization creation:
```typescript
// Refresh session to ensure auth state is current
const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
if (refreshError || !refreshData.session) {
  toast.error('Session expired. Please sign in again.');
  navigate('/login');
  return;
}
const currentUser = refreshData.session.user;
```

- Pass selected plan data to ModulesStep
- Store add-on modules separately for billing purposes

### Phase 3: Billing Integration (Future)

Store selected add-ons in `organization_modules` with pricing info for future billing:
```typescript
const moduleInserts = data.enabledModules.map(moduleKey => ({
  organization_id: org.id,
  module_key: moduleKey,
  is_enabled: true,
  is_addon: !planIncludedModules.includes(moduleKey),
  addon_price_monthly: addOnPricing[moduleKey] || 0,
  enabled_at: new Date().toISOString(),
}));
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/xxx.sql` | New migration with RLS fix + module_pricing table |
| `src/components/onboarding/steps/ModulesStep.tsx` | Plan-based module display with pricing |
| `src/components/onboarding/steps/PlanStep.tsx` | Pass plan modules to parent |
| `src/components/onboarding/OnboardingWizard.tsx` | Session refresh, plan modules state, billing prep |
| `src/integrations/supabase/types.ts` | Auto-generated types update |

---

## User Experience Flow

```text
Step 1: Create Account
        |
Step 2: Organization Details
        |
Step 3: Choose Plan
        - Select "Starter" ($499/mo)
        |
Step 4: Configure Modules
        ┌─────────────────────────────────────────────┐
        │ ✅ INCLUDED IN STARTER (cannot disable)     │
        │   • Patient Management                      │
        │   • Appointments                            │
        │   • Billing & Payments                      │
        │   • Departments                             │
        │   • Prescriptions                           │
        │   • Patient Messages                        │
        ├─────────────────────────────────────────────┤
        │ ➕ AVAILABLE ADD-ONS                        │
        │   □ Lab & Diagnostics      +$99/mo         │
        │   □ Pharmacy               +$99/mo         │
        │   □ Inventory              +$79/mo         │
        │   □ Insurance Claims       +$149/mo        │
        │   ───────────────────────────────           │
        │   Selected: 2 add-ons = +$198/mo           │
        ├─────────────────────────────────────────────┤
        │ 🔒 ENTERPRISE ONLY                         │
        │   • Blood Bank (upgrade to unlock)          │
        │   • Operation Theatre (upgrade to unlock)   │
        └─────────────────────────────────────────────┘
        |
Step 5: Invite Team
        |
Step 6: Complete!
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RLS fix breaks other flows | Low | Medium | Policy only affects INSERT, tested |
| Module pricing not loading | Low | Low | Fallback to show all as included |
| Session refresh fails | Medium | Medium | Redirect to login with clear message |

---

## Testing Checklist

- [ ] New user can complete full onboarding flow
- [ ] RLS error no longer occurs
- [ ] Modules correctly categorized by plan
- [ ] Add-on pricing displays correctly
- [ ] Total add-on cost calculates correctly
- [ ] Enterprise modules show lock icon
- [ ] Selected add-ons stored in database
