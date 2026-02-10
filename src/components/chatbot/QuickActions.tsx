import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Pill, FileText, Users, Stethoscope, Search } from 'lucide-react';

interface QuickActionsProps {
  userRole: string | null;
  onActionClick: (message: string) => void;
}

const patientActions = [
  { label: 'My Appointments', message: 'When is my next appointment?', icon: Calendar },
  { label: 'My Prescriptions', message: 'Show my recent prescriptions', icon: Pill },
  { label: 'Lab Results', message: 'What are my latest lab test results?', icon: FileText },
];

const doctorActions = [
  { label: "Today's Patients", message: 'How many patients do I have today?', icon: Users },
  { label: 'My Schedule', message: 'Show my upcoming appointments', icon: Calendar },
  { label: 'Find Patient', message: 'Search patient', icon: Search },
];

const guestActions = [
  { label: 'Features', message: 'What features does this HMS offer?', icon: Stethoscope },
  { label: 'Get a Demo', message: 'How can I get a demo of this HMS?', icon: FileText },
];

const QuickActions: React.FC<QuickActionsProps> = ({ userRole, onActionClick }) => {
  const actions = userRole === 'doctor' ? doctorActions : 
                  userRole === 'patient' ? patientActions : 
                  guestActions;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-border bg-muted/30">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded-full bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          onClick={() => onActionClick(action.message)}
        >
          <action.icon className="h-3 w-3 mr-1.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
