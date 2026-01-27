import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Stethoscope, FlaskConical, Pill } from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';

interface OrganizationStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const ORG_TYPES = [
  { value: 'hospital', label: 'Hospital', icon: Building2, description: 'Full-service medical facility' },
  { value: 'clinic', label: 'Clinic', icon: Stethoscope, description: 'Outpatient care center' },
  { value: 'laboratory', label: 'Laboratory', icon: FlaskConical, description: 'Diagnostic testing facility' },
  { value: 'pharmacy', label: 'Pharmacy', icon: Pill, description: 'Medication dispensary' },
];

const TIMEZONES = [
  { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
];

const OrganizationStep: React.FC<OrganizationStepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization Name *</Label>
        <Input
          id="orgName"
          placeholder="City General Hospital"
          value={data.organizationName}
          onChange={(e) => updateData({ organizationName: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <Label>Organization Type *</Label>
        <div className="grid grid-cols-2 gap-3">
          {ORG_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = data.organizationType === type.value;
            
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateData({ organizationType: type.value as OnboardingData['organizationType'] })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+92 300 1234567"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.example.com"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Medical Center Road, City"
          value={data.address}
          onChange={(e) => updateData({ address: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          value={data.timezone}
          onValueChange={(value) => updateData({ timezone: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default OrganizationStep;
