
# Plan: Subdomain-Based Multi-Tenant Hospital Portal

## Overview

Transform the system so each hospital organization gets their own branded subdomain URL (e.g., `citygeneral.insight-health-pro.com`). When staff or patients visit their hospital's subdomain, they see only their hospital's branded portal - not the main marketing website.

## How It Works

### User Experience Flow

**Main Domain (`insight-health-pro.com`):**
- Shows marketing landing page
- "Start Free Trial" leads to onboarding
- General login available

**Hospital Subdomain (`citygeneral.insight-health-pro.com`):**
- Shows hospital-branded login page
- Hospital logo, name, colors
- Direct access - no marketing content
- Only that hospital's staff/patients can use it

### Architecture

```text
Request: citygeneral.insight-health-pro.com
              │
              ▼
    ┌─────────────────────┐
    │   TenantProvider    │
    │  Extract subdomain  │
    │  "citygeneral"      │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Database Lookup   │
    │  organizations      │
    │  WHERE slug =       │
    │  'citygeneral'      │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   TenantContext     │
    │  - org data         │
    │  - branding         │
    │  - theme colors     │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Branded Login Page │
    │  "City General      │
    │   Hospital"         │
    │  [Hospital Logo]    │
    └─────────────────────┘
```

## Technical Implementation

### Phase 1: Tenant Context Layer

**Create TenantContext** (`src/contexts/TenantContext.tsx`)

This context extracts the subdomain from the URL and loads the organization data:

- Detects if request is from subdomain or main domain
- If subdomain: loads organization by slug
- Provides tenant data (branding, settings) to all components
- Sets `isTenantMode` flag to control page rendering

Key logic:
```text
hostname: citygeneral.insight-health-pro.com
  └── subdomain: "citygeneral"
        └── lookup: organizations WHERE slug = 'citygeneral'
              └── result: City General Hospital data
```

### Phase 2: Conditional Routing

**Update App.tsx routing logic:**

- If `isTenantMode = true`:
  - "/" redirects to tenant login page
  - Marketing pages (/about, /services) hidden
  - Only show: login, dashboard, app routes
  
- If `isTenantMode = false`:
  - Normal behavior (marketing site + onboarding)

### Phase 3: Tenant-Branded Login Page

**Create TenantLogin component** (`src/pages/TenantLogin.tsx`)

Custom login page showing:
- Organization logo (from `organizations.logo_url`)
- Organization name (from `organizations.name`)
- Custom primary color (from `organizations.primary_color`)
- Hospital tagline/address if configured
- Login form (staff and patient tabs)

### Phase 4: Update Organization Context Integration

**Modify OrganizationContext:**

When user logs in on tenant subdomain:
- Verify user belongs to that organization
- If not: show error "You don't have access to this hospital"
- If yes: load organization context normally

Security check:
```text
User logs in on citygeneral.insight-health-pro.com
  └── Check: organization_members
        └── WHERE user_id = user.id
        └── AND organization_id = citygeneral.id
              └── PASS: Allow access
              └── FAIL: "Access denied - not a member"
```

### Phase 5: Dynamic Theme Provider

**Enhance theme system:**

Apply organization's branding colors:
- Primary color from `organizations.primary_color`
- Secondary color from `organizations.secondary_color`
- Logo in header
- Custom favicon (optional)

### Phase 6: Subdomain Generator in Onboarding

**Update onboarding completion:**

After organization is created, show:
- "Your hospital portal is ready!"
- Display: `yourhospitalslug.insight-health-pro.com`
- Option to customize slug (if available)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/TenantContext.tsx` | CREATE | Extract subdomain, load tenant data |
| `src/pages/TenantLogin.tsx` | CREATE | Branded login for tenants |
| `src/components/tenant/TenantBranding.tsx` | CREATE | Apply tenant colors/logo |
| `src/App.tsx` | MODIFY | Wrap with TenantProvider, conditional routing |
| `src/components/layout/Header.tsx` | MODIFY | Show tenant logo if in tenant mode |
| `src/pages/Login.tsx` | MODIFY | Redirect to tenant login if on subdomain |
| `src/components/onboarding/steps/CompleteStep.tsx` | MODIFY | Show subdomain URL |

## Database Changes

No schema changes needed - we already have:
- `organizations.slug` - used as subdomain identifier
- `organizations.logo_url` - tenant logo
- `organizations.primary_color` - theme color
- `organizations.secondary_color` - accent color
- `organizations.name` - display name

## Subdomain Management

### Automatic Subdomain Assignment
- Generated from organization name during onboarding
- Example: "City General Hospital" becomes `city-general-hospital`
- Timestamp suffix ensures uniqueness (already implemented)

### Custom Domain Support (Future)
For enterprise customers who want:
- `portal.citygeneral.com` instead of `citygeneral.insight-health-pro.com`
- Requires DNS configuration by customer
- Add `custom_domain` column to organizations table

## Security Considerations

1. **Cross-tenant access prevention:**
   - Validate user's organization matches subdomain
   - Show clear error if mismatch

2. **Subdomain spoofing protection:**
   - Verify slug exists in database
   - Show 404 for invalid subdomains

3. **Session isolation:**
   - Cookie scoped to subdomain
   - Cannot access other tenant data

## Local Development

For testing subdomains locally:
- Use hosts file: `127.0.0.1 citygeneral.localhost`
- Or use service like `lvh.me` (resolves to localhost)
- Configure Vite to accept subdomain hosts

## User Experience Summary

### For Main Domain Visitors
```text
insight-health-pro.com
├── / (landing page with pricing)
├── /onboarding (new hospital signup)
├── /login (for legacy/demo users)
├── /about, /services, /contact (marketing)
└── /dashboard (after login)
```

### For Tenant Subdomain Visitors
```text
citygeneral.insight-health-pro.com
├── / (redirects to login)
├── /login (branded hospital login)
└── /dashboard (after login)
    └── All app routes with hospital branding
```

## Rollout Strategy

1. **Phase 1 - Core Implementation:**
   - TenantContext with subdomain detection
   - TenantLogin page with branding
   - Conditional routing

2. **Phase 2 - Branding:**
   - Dynamic theme colors
   - Logo in header/login
   - Custom favicon

3. **Phase 3 - Onboarding Integration:**
   - Show subdomain URL on completion
   - Slug customization option
   - Email with portal URL

4. **Phase 4 - Testing:**
   - Test with existing demo organization
   - Verify cross-tenant protection
   - Mobile responsive check

## Pricing Tier Consideration

Subdomain access could be:
- **Included in all plans** - standard feature
- **Professional+ only** - premium feature
- **Add-on module** - pay extra for branded portal

Recommendation: Include in Professional tier, make it an add-on for Starter.
