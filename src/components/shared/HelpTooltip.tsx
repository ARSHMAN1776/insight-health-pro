import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

/**
 * Help Tooltip Component - WCAG 2.1 AA Compliant
 * Provides contextual help information accessible to all users
 */

interface HelpTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconClassName?: string;
}

export function HelpTooltip({ 
  content, 
  side = "top",
  className = "",
  iconClassName = ""
}: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className={`inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
            aria-label="Help information"
          >
            <HelpCircle className={`h-4 w-4 ${iconClassName}`} aria-hidden="true" />
            <span className="sr-only">Help</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface LabelWithHelpProps {
  label: string;
  helpText: string;
  htmlFor?: string;
  required?: boolean;
}

export function LabelWithHelp({ label, helpText, htmlFor, required }: LabelWithHelpProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label 
        htmlFor={htmlFor} 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <HelpTooltip content={helpText} />
    </div>
  );
}

/**
 * Common help texts for reuse across the application
 */
export const helpTexts = {
  // Patient fields
  firstName: "Enter the patient's legal first name as it appears on official documents.",
  lastName: "Enter the patient's legal last name as it appears on official documents.",
  dateOfBirth: "Select the patient's date of birth. Must be a date in the past.",
  bloodType: "Select the patient's blood type if known. This is important for emergency situations.",
  allergies: "List any known allergies, separated by commas. Include medication, food, and environmental allergies.",
  emergencyContact: "Provide a name and phone number for someone to contact in case of emergency.",
  
  // Appointment fields
  appointmentType: "Select the type of appointment: Consultation for new issues, Follow-up for existing treatment, or Check-up for routine visits.",
  appointmentDuration: "Standard appointments are 30 minutes. Select longer duration for complex cases.",
  symptoms: "Describe the main symptoms or reason for the visit. This helps the doctor prepare.",
  
  // Prescription fields
  dosage: "Enter the strength and amount per dose (e.g., '500mg', '2 tablets').",
  frequency: "How often the medication should be taken (e.g., 'Twice daily', 'Every 8 hours').",
  duration: "How long the patient should take this medication (e.g., '7 days', '2 weeks').",
  drugInteraction: "The system automatically checks for known drug interactions. Review any warnings carefully.",
  
  // Lab test fields
  priority: "Normal: Results within 24-48 hours. Urgent: Results within 4-8 hours. STAT: Results within 1-2 hours.",
  normalRange: "The expected range of values for healthy patients. Values outside this range may indicate a problem.",
  
  // Insurance fields
  policyNumber: "Enter the policy number exactly as shown on the insurance card.",
  diagnosisCode: "ICD-10 diagnosis codes are required for insurance claims. Search by condition name.",
  procedureCode: "CPT procedure codes describe the services provided. Required for billing.",
  
  // Blood bank fields
  bloodCompatibility: "The system checks blood type compatibility. O- is universal donor, AB+ is universal recipient.",
  donorEligibility: "Donors must be 18-65, weigh over 110 lbs, and wait 56 days between donations.",
  
  // Security
  auditLog: "All access to patient records is logged for HIPAA compliance. Unauthorized access is monitored.",
  dataRetention: "Patient records are retained for 7 years per HIPAA requirements. Deleted records are archived.",
};
