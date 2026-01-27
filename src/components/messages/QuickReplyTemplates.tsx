import React from 'react';
import { Button } from '../ui/button';
import { 
  Calendar, 
  Clock, 
  Pill, 
  FileText,
  AlertCircle,
  Phone
} from 'lucide-react';

interface QuickReplyTemplatesProps {
  patientName: string;
  onSelectTemplate: (message: string) => void;
}

const QuickReplyTemplates: React.FC<QuickReplyTemplatesProps> = ({
  patientName,
  onSelectTemplate,
}) => {
  const firstName = patientName.split(' ')[0] || 'there';

  const templates = [
    {
      icon: Calendar,
      label: 'Schedule Visit',
      message: `Hi ${firstName}, thank you for reaching out. Based on your concerns, I'd recommend scheduling an appointment for a proper evaluation. Please book through the patient portal or contact our front desk.`,
    },
    {
      icon: Pill,
      label: 'Prescription Info',
      message: `Hi ${firstName}, regarding your prescription inquiry - please continue taking your medication as prescribed. If you're experiencing any side effects, please let me know and we can discuss alternatives during your next visit.`,
    },
    {
      icon: FileText,
      label: 'Test Results',
      message: `Hi ${firstName}, I've reviewed your test results. Everything looks normal. We can discuss the details during your next appointment if you'd like more information.`,
    },
    {
      icon: AlertCircle,
      label: 'Seek Emergency',
      message: `Hi ${firstName}, based on what you've described, I recommend seeking immediate medical attention. Please visit the emergency room or call emergency services if symptoms worsen.`,
    },
    {
      icon: Clock,
      label: 'Follow Up',
      message: `Hi ${firstName}, thank you for the update. Please continue monitoring your symptoms and let me know if there are any changes. We'll follow up during your scheduled appointment.`,
    },
    {
      icon: Phone,
      label: 'Request Call',
      message: `Hi ${firstName}, I'd like to discuss this further. Please call our office to schedule a phone consultation at your earliest convenience.`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
      <span className="text-xs text-muted-foreground w-full mb-1">Quick replies:</span>
      {templates.map((template, index) => {
        const Icon = template.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={() => onSelectTemplate(template.message)}
          >
            <Icon className="w-3 h-3" />
            {template.label}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickReplyTemplates;
