import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Mail } from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';

interface TeamStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'manager', label: 'Manager', description: 'Manage staff and operations' },
  { value: 'member', label: 'Staff Member', description: 'Standard access' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const TeamStep: React.FC<TeamStepProps> = ({ data, updateData }) => {
  const addInvite = () => {
    updateData({
      teamInvites: [...data.teamInvites, { email: '', role: 'member' }],
    });
  };

  const removeInvite = (index: number) => {
    updateData({
      teamInvites: data.teamInvites.filter((_, i) => i !== index),
    });
  };

  const updateInvite = (index: number, updates: Partial<{ email: string; role: string }>) => {
    const newInvites = [...data.teamInvites];
    newInvites[index] = { ...newInvites[index], ...updates };
    updateData({ teamInvites: newInvites });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Invite your team members to collaborate. You can skip this step and add them later.
        </p>
      </div>

      {data.teamInvites.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No team members yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add colleagues to start collaborating
          </p>
          <Button variant="outline" onClick={addInvite}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.teamInvites.map((invite, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`email-${index}`}>Email Address</Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  placeholder="colleague@hospital.com"
                  value={invite.email}
                  onChange={(e) => updateInvite(index, { email: e.target.value })}
                />
              </div>
              
              <div className="w-40 space-y-2">
                <Label>Role</Label>
                <Select
                  value={invite.role}
                  onValueChange={(value) => updateInvite(index, { role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="mt-8"
                onClick={() => removeInvite(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <Button variant="outline" onClick={addInvite} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another
          </Button>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h4 className="font-medium mb-2">Role Permissions</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li><strong>Admin:</strong> Full access including billing and user management</li>
          <li><strong>Manager:</strong> Manage staff, departments, and daily operations</li>
          <li><strong>Staff Member:</strong> Standard access to assigned features</li>
          <li><strong>Viewer:</strong> Read-only access to reports and data</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamStep;
