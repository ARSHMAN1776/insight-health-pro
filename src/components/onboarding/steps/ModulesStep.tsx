import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Calendar, FileText, CreditCard, TestTube, Pill, 
  Droplets, Building2, Bed, Heart, ClipboardList, Bell
} from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';

interface ModulesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const MODULES = [
  { key: 'patients', name: 'Patient Management', icon: Users, description: 'Patient records and registration', required: true },
  { key: 'appointments', name: 'Appointments', icon: Calendar, description: 'Scheduling and calendar', required: true },
  { key: 'billing', name: 'Billing & Payments', icon: CreditCard, description: 'Invoices and payment tracking', required: true },
  { key: 'medical_records', name: 'Medical Records', icon: FileText, description: 'Clinical documentation' },
  { key: 'prescriptions', name: 'Prescriptions', icon: Pill, description: 'E-prescribing and refills' },
  { key: 'lab_tests', name: 'Lab & Diagnostics', icon: TestTube, description: 'Test orders and results' },
  { key: 'pharmacy', name: 'Pharmacy', icon: Pill, description: 'Medication inventory' },
  { key: 'blood_bank', name: 'Blood Bank', icon: Droplets, description: 'Blood inventory management' },
  { key: 'departments', name: 'Departments', icon: Building2, description: 'Department management' },
  { key: 'rooms', name: 'Room Management', icon: Bed, description: 'Beds and room assignments' },
  { key: 'vitals', name: 'Vitals Tracking', icon: Heart, description: 'Patient vital signs' },
  { key: 'queue', name: 'Queue Management', icon: ClipboardList, description: 'Patient queue and tokens' },
  { key: 'notifications', name: 'Notifications', icon: Bell, description: 'Alerts and reminders' },
];

const ModulesStep: React.FC<ModulesStepProps> = ({ data, updateData }) => {
  const toggleModule = (moduleKey: string) => {
    const module = MODULES.find(m => m.key === moduleKey);
    if (module?.required) return; // Can't toggle required modules
    
    const isEnabled = data.enabledModules.includes(moduleKey);
    updateData({
      enabledModules: isEnabled
        ? data.enabledModules.filter(m => m !== moduleKey)
        : [...data.enabledModules, moduleKey],
    });
  };

  const enableAll = () => {
    updateData({ enabledModules: MODULES.map(m => m.key) });
  };

  const enableRecommended = () => {
    updateData({ 
      enabledModules: ['patients', 'appointments', 'billing', 'medical_records', 'prescriptions', 'queue', 'notifications'] 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={enableRecommended}
          className="text-sm text-primary hover:underline"
        >
          Recommended
        </button>
        <span className="text-muted-foreground">•</span>
        <button
          type="button"
          onClick={enableAll}
          className="text-sm text-primary hover:underline"
        >
          Enable All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {MODULES.map((module) => {
          const Icon = module.icon;
          const isEnabled = data.enabledModules.includes(module.key);
          
          return (
            <div
              key={module.key}
              className={`
                flex items-center gap-4 p-4 rounded-lg border transition-all
                ${isEnabled ? 'border-primary/50 bg-primary/5' : 'border-border'}
              `}
            >
              <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{module.name}</Label>
                  {module.required && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{module.description}</p>
              </div>
              
              <Switch
                checked={isEnabled}
                onCheckedChange={() => toggleModule(module.key)}
                disabled={module.required}
              />
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        You can enable or disable modules anytime from Settings.
      </p>
    </div>
  );
};

export default ModulesStep;
