import React from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, UserCircle, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageMeterProps {
  type: 'staff' | 'patients' | 'storage';
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

const USAGE_CONFIG = {
  staff: {
    label: 'Staff Members',
    icon: Users,
    unit: '',
    formatValue: (val: number) => val.toString(),
  },
  patients: {
    label: 'Patients',
    icon: UserCircle,
    unit: '',
    formatValue: (val: number) => val.toLocaleString(),
  },
  storage: {
    label: 'Storage',
    icon: HardDrive,
    unit: 'GB',
    formatValue: (val: number) => val.toFixed(1),
  },
};

/**
 * UsageMeter - Displays usage progress for a specific resource type
 * 
 * @param type - The type of usage to display (staff, patients, storage)
 * @param showLabel - Whether to show the label (default: true)
 * @param compact - Whether to use compact styling (default: false)
 * @param className - Additional CSS classes
 */
export const UsageMeter: React.FC<UsageMeterProps> = ({
  type,
  showLabel = true,
  compact = false,
  className,
}) => {
  const { getLimitUsage, hasReachedLimit, isMultiTenantMode } = useOrganization();

  // Don't show in single-tenant mode
  if (!isMultiTenantMode) {
    return null;
  }

  const config = USAGE_CONFIG[type];
  const { current, max, percentage } = getLimitUsage(type);
  const isAtLimit = hasReachedLimit(type);
  const isNearLimit = percentage >= 80;

  // Determine color based on usage
  const getProgressColor = () => {
    if (isAtLimit) return 'bg-destructive';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const Icon = config.icon;

  if (max === null) {
    // Unlimited
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Icon className="h-4 w-4" />
        <span>{config.formatValue(current)} {config.unit} (Unlimited)</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{config.label}</span>
          <span className={cn(
            'font-medium',
            isAtLimit && 'text-destructive',
            isNearLimit && !isAtLimit && 'text-warning'
          )}>
            {config.formatValue(current)}/{config.formatValue(max)} {config.unit}
          </span>
        </div>
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-1.5"
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
          {(isAtLimit || isNearLimit) && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              isAtLimit ? 'text-destructive' : 'text-warning'
            )}>
              <AlertTriangle className="h-3 w-3" />
              <span>{isAtLimit ? 'Limit reached' : 'Near limit'}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-1">
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{config.formatValue(current)} {config.unit} used</span>
          <span>{config.formatValue(max)} {config.unit} available</span>
        </div>
      </div>
    </div>
  );
};

export default UsageMeter;
