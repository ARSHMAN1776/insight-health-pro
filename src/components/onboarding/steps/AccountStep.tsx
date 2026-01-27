import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';

interface AccountStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const AccountStep: React.FC<AccountStepProps> = ({ data, updateData }) => {
  const { user } = useAuth();

  // If already logged in, show confirmation
  if (user) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">You're already signed in</h3>
        <p className="text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user.email}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Click "Continue" to set up your organization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 8 characters"
          value={data.password}
          onChange={(e) => updateData({ password: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters with a mix of letters and numbers.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="text-muted-foreground">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default AccountStep;
