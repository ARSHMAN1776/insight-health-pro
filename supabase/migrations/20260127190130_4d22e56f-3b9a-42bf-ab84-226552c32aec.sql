-- Fix organization_members INSERT for new organizations (bypass circular dependency)
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