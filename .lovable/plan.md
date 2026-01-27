

# Multi-Tenant SaaS Implementation - Critical Bug Review

## Executive Summary
After thorough analysis, I found **7 critical bugs** and **4 logic issues** that will cause failures in production. The core architecture is sound, but these issues MUST be fixed before deployment.

---

## Critical Bugs Found

### 1. CRITICAL: RLS Policy Circular Dependency on `organization_members` INSERT

**Problem**: The INSERT policy on `organization_members` requires:
```sql
(organization_id = get_user_organization_id()) AND (get_user_org_role() = ANY (ARRAY['owner'::text, 'admin'::text]))
```

But `get_user_organization_id()` queries `organization_members` to find the user's organization. During onboarding, when creating the FIRST member record for a new organization, this function returns NULL because the user has NO membership yet - creating a catch-22 situation.

**Impact**: Users cannot complete onboarding - the owner membership record will fail to insert.

**Fix**: Add a special INSERT policy allowing creators of new organizations to insert themselves as owner:
```sql
CREATE POLICY "Organization creators can add themselves as owner"
ON organization_members FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  role = 'owner' AND
  organization_id IN (
    SELECT id FROM organizations WHERE created_by = auth.uid()
  )
);
```

---

### 2. CRITICAL: Module Key Mismatch Between ModulesStep and MODULE_KEYS

**Problem**: The `ModulesStep.tsx` uses different module keys than `MODULE_KEYS` in `organization.ts`:
- ModulesStep uses: `medical_records`, `notifications`
- MODULE_KEYS defines: `patients` (no `medical_records`), no `notifications`

**Impact**: Modules selected during onboarding won't match the gating system - users will select modules that don't exist in the system.

**Fix**: Update ModulesStep to use the exact keys from `MODULE_KEYS`:
- Remove `medical_records` (it's part of `patients`)
- Remove `notifications` (not in MODULE_KEYS)
- Add proper keys like `referrals`, `insurance`, `reports`, `audit_logs`, etc.

---

### 3. CRITICAL: Team Invitation Logic Uses Wrong User ID

**Problem**: In `OnboardingWizard.tsx` line 270-277:
```typescript
await supabase.from('organization_members').insert({
  organization_id: createdOrgId,
  user_id: user!.id, // This is WRONG - should be null or a placeholder
  role: invite.role,
  status: 'pending',
  ...
});
```

This creates invite records with the current user's ID instead of the invited user's ID.

**Impact**: All invites will point to the creator's user_id, creating duplicate memberships and corrupted data.

**Fix**: Change to create pending invitations properly - either use a separate `invitations` table or store the invited email in metadata and leave `user_id` for when they accept.

---

### 4. HIGH: Missing RLS Policy for First Subscription Creation

**Problem**: The only INSERT policy on `organization_subscriptions` is:
```sql
"Service role can manage subscriptions" - qual: true
```

This uses service role, but the client-side code uses the normal authenticated user role.

**Impact**: Subscription creation will fail during onboarding with an RLS violation.

**Fix**: Add an INSERT policy:
```sql
CREATE POLICY "Organization creators can create subscription"
ON organization_subscriptions FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE created_by = auth.uid()
  )
);
```

---

### 5. HIGH: Missing RLS Policy for First Module Enablement

**Problem**: Similar to subscriptions, `organization_modules` INSERT requires:
```sql
(organization_id = get_user_organization_id()) AND (get_user_org_role() = ANY (ARRAY['owner'::text, 'admin'::text]))
```

But `get_user_organization_id()` returns NULL for new organizations.

**Impact**: Module enablement will fail during onboarding.

**Fix**: Add policy for organization creators:
```sql
CREATE POLICY "Organization creators can enable modules"
ON organization_modules FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE created_by = auth.uid()
  )
);
```

---

### 6. HIGH: Missing RLS Policy for Onboarding Progress

**Problem**: Same circular dependency issue for `onboarding_progress` table.

**Fix**: Add creator-based INSERT policy.

---

### 7. MEDIUM: Slug Generation Not Unique-Safe

**Problem**: Line 189 in OnboardingWizard:
```typescript
slug: data.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
```

No uniqueness check - will fail if two organizations have similar names.

**Impact**: Database constraint violation when organizations have similar names.

**Fix**: Add timestamp/random suffix or check for uniqueness before insert.

---

## Logic Issues Found

### 1. Enterprise Plan Has NULL Prices
The Enterprise plan has `price_monthly: null` and `price_yearly: null`. The PlanStep UI tries to calculate monthly equivalent with division, which will produce `NaN` or `Infinity`.

**Fix**: Handle null prices in PlanStep - show "Contact Sales" instead of price.

### 2. No Post-Onboarding Organization Context Refresh
After completing onboarding, the OrganizationContext still has stale data (null organization). User needs to log out/in.

**Fix**: Call `refreshOrganization()` after successful organization creation.

### 3. Missing Module Protection on Several Routes
Routes like `/inventory`, `/rooms`, `/reports`, `/vitals`, `/shift-handovers`, `/queue`, `/waitlist`, `/operation-department`, `/audit-logs`, `/patient-messages` are NOT wrapped in `ModuleProtectedRoute`.

**Fix**: Wrap all module-gated routes consistently.

### 4. Type Interface Mismatch
`OrganizationMember.status` type is `'active' | 'invited' | 'suspended'` but the code uses `'pending'` in TeamStep.

---

## Technical Implementation Plan

### Phase 1: Database Fixes (Immediate)
1. Add 4 new RLS policies for organization creators
2. Fix circular dependency in `organization_members` INSERT

### Phase 2: Code Fixes (Immediate)
1. Fix ModulesStep module key alignment
2. Fix TeamStep invitation logic
3. Handle Enterprise null pricing
4. Add unique slug generation
5. Add context refresh after onboarding

### Phase 3: Route Protection Completion
1. Wrap all remaining routes with ModuleProtectedRoute
2. Add missing modules to route protection

### Phase 4: Testing
1. Complete end-to-end onboarding flow test
2. Test module gating for all tiers
3. Test team invitation workflow

---

## Database Migration SQL Required

```sql
-- Fix organization_members INSERT for new organizations
CREATE POLICY "Organization creators can add themselves as owner"
ON organization_members FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  role = 'owner' AND
  organization_id IN (
    SELECT id FROM organizations WHERE created_by = auth.uid()
  )
);

-- Fix organization_subscriptions INSERT for new organizations
CREATE POLICY "Organization creators can create initial subscription"
ON organization_subscriptions FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE created_by = auth.uid()
  )
);

-- Fix organization_modules INSERT for new organizations
CREATE POLICY "Organization creators can enable initial modules"
ON organization_modules FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE created_by = auth.uid()
  )
);

-- Fix onboarding_progress INSERT for new organizations
CREATE POLICY "Organization creators can track onboarding progress"
ON onboarding_progress FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE created_by = auth.uid()
  )
);
```

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Critical Bugs | 3 | Must Fix |
| High Priority | 3 | Must Fix |
| Medium Priority | 1 | Should Fix |
| Logic Issues | 4 | Should Fix |
| **Total Issues** | **11** | **Not Production Ready** |

The system requires these fixes before it can be used in production. Shall I implement these fixes?

