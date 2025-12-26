import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Save, X, Loader2, User, Stethoscope } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { supabase } from '@/integrations/supabase/client';
import {
  StaffSchedule,
  DAY_NAMES,
  getStaffSchedules,
  saveStaffSchedule,
  timeToMinutes
} from '@/lib/scheduleUtils';

interface StaffMember {
  id: string;
  name: string;
  type: 'doctor' | 'nurse';
  specialization?: string;
}

interface DaySchedule {
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
  slot_duration: number;
  break_start: string;
  break_end: string;
}

interface StaffScheduleManagerProps {
  staff?: StaffMember;
  onClose?: () => void;
  isOpen?: boolean;
}

const DEFAULT_SCHEDULE: DaySchedule = {
  day_of_week: 0,
  is_available: false,
  start_time: '09:00',
  end_time: '17:00',
  slot_duration: 30,
  break_start: '',
  break_end: ''
};

const SLOT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' }
];

const StaffScheduleManager: React.FC<StaffScheduleManagerProps> = ({ 
  staff, 
  onClose, 
  isOpen = false 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);

  // Initialize schedules for all 7 days
  useEffect(() => {
    const initSchedules = () => {
      return Array.from({ length: 7 }, (_, i) => ({
        ...DEFAULT_SCHEDULE,
        day_of_week: i
      }));
    };

    if (isOpen && staff) {
      loadExistingSchedules();
    } else {
      setSchedules(initSchedules());
    }
  }, [isOpen, staff]);

  const loadExistingSchedules = async () => {
    if (!staff) return;

    const toTimeInputValue = (t: string | null | undefined) => (t ? t.slice(0, 5) : '');

    setLoading(true);
    try {
      const existingSchedules = await getStaffSchedules(staff.id, staff.type);

      // Merge with default schedules
      const mergedSchedules = Array.from({ length: 7 }, (_, i) => {
        const existing = existingSchedules.find((s) => s.day_of_week === i);
        if (existing) {
          const start_time = toTimeInputValue(existing.start_time);
          const end_time = toTimeInputValue(existing.end_time);

          let break_start = toTimeInputValue(existing.break_start);
          let break_end = toTimeInputValue(existing.break_end);

          // If a break was saved in an invalid range (e.g. start >= end), clear it
          // so the UI doesn't silently behave incorrectly.
          if (break_start && break_end) {
            const bs = timeToMinutes(break_start);
            const be = timeToMinutes(break_end);
            if (bs >= be) {
              break_start = '';
              break_end = '';
            }
          }

          return {
            day_of_week: i,
            is_available: existing.is_available,
            start_time,
            end_time,
            slot_duration: existing.slot_duration,
            break_start,
            break_end
          };
        }
        return { ...DEFAULT_SCHEDULE, day_of_week: i };
      });

      setSchedules(mergedSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayIndex: number, enabled: boolean) => {
    setSchedules(prev => prev.map((s, i) => 
      i === dayIndex ? { ...s, is_available: enabled } : s
    ));
  };

  const handleScheduleChange = (
    dayIndex: number, 
    field: keyof DaySchedule, 
    value: string | number
  ) => {
    setSchedules(prev => prev.map((s, i) => 
      i === dayIndex ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = async () => {
    if (!staff) return;

    // Validate schedules (especially break times) before saving
    for (const s of schedules) {
      if (!s.is_available) continue;

      const startMin = timeToMinutes(s.start_time);
      const endMin = timeToMinutes(s.end_time);

      if (startMin >= endMin) {
        toast({
          title: 'Invalid working hours',
          description: `${DAY_NAMES[s.day_of_week]}: start time must be before end time.`,
          variant: 'destructive'
        });
        return;
      }

      const hasBreakStart = !!s.break_start;
      const hasBreakEnd = !!s.break_end;

      if (hasBreakStart !== hasBreakEnd) {
        toast({
          title: 'Incomplete break time',
          description: `${DAY_NAMES[s.day_of_week]}: please set both “Break From” and “Break To”, or leave both empty.`,
          variant: 'destructive'
        });
        return;
      }

      if (hasBreakStart && hasBreakEnd) {
        const breakStartMin = timeToMinutes(s.break_start);
        const breakEndMin = timeToMinutes(s.break_end);

        if (breakStartMin >= breakEndMin) {
          toast({
            title: 'Invalid break time',
            description: `${DAY_NAMES[s.day_of_week]}: break start must be before break end.`,
            variant: 'destructive'
          });
          return;
        }

        if (breakStartMin < startMin || breakEndMin > endMin) {
          toast({
            title: 'Break outside working hours',
            description: `${DAY_NAMES[s.day_of_week]}: break must be within ${s.start_time}–${s.end_time}.`,
            variant: 'destructive'
          });
          return;
        }
      }
    }

    setSaving(true);
    try {
      const result = await saveStaffSchedule(staff.id, staff.type, schedules);

      if (result.success) {
        toast({
          title: "Schedule Saved",
          description: `${staff.name}'s schedule has been updated successfully.`
        });
        onClose?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const applyToWeekdays = () => {
    const mondaySchedule = schedules.find(s => s.day_of_week === 1);
    if (!mondaySchedule) return;

    setSchedules(prev => prev.map(s => {
      // Apply Monday's schedule to weekdays (1-5)
      if (s.day_of_week >= 1 && s.day_of_week <= 5) {
        return {
          ...s,
          is_available: true,
          start_time: mondaySchedule.start_time,
          end_time: mondaySchedule.end_time,
          slot_duration: mondaySchedule.slot_duration,
          break_start: mondaySchedule.break_start,
          break_end: mondaySchedule.break_end
        };
      }
      return s;
    }));

    toast({
      title: "Applied to Weekdays",
      description: "Monday's schedule has been copied to Tuesday through Friday."
    });
  };

  if (!staff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-primary" />
            Manage Schedule
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {staff.type === 'doctor' ? (
              <Stethoscope className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
            {staff.name} {staff.specialization && `- ${staff.specialization}`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={applyToWeekdays}>
                Apply Monday to All Weekdays
              </Button>
            </div>

            {/* Day Schedules */}
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <Card 
                  key={index}
                  className={`transition-all ${
                    schedule.is_available 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Day Toggle */}
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <Switch
                          checked={schedule.is_available}
                          onCheckedChange={(checked) => handleDayToggle(index, checked)}
                        />
                        <span className={`font-medium ${
                          schedule.is_available ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {DAY_NAMES[index]}
                        </span>
                      </div>

                      {/* Schedule Details */}
                      {schedule.is_available && (
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                          {/* Start Time */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start</Label>
                            <Input
                              type="time"
                              value={schedule.start_time}
                              onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                              className="h-9"
                            />
                          </div>

                          {/* End Time */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End</Label>
                            <Input
                              type="time"
                              value={schedule.end_time}
                              onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                              className="h-9"
                            />
                          </div>

                          {/* Slot Duration */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Slot</Label>
                            <Select
                              value={schedule.slot_duration.toString()}
                              onValueChange={(v) => handleScheduleChange(index, 'slot_duration', parseInt(v))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SLOT_DURATIONS.map(d => (
                                  <SelectItem key={d.value} value={d.value.toString()}>
                                    {d.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Break Start */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Break From</Label>
                            <Input
                              type="time"
                              value={schedule.break_start}
                              onChange={(e) => handleScheduleChange(index, 'break_start', e.target.value)}
                              className="h-9"
                              placeholder="Optional"
                            />
                          </div>

                          {/* Break End */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Break To</Label>
                            <Input
                              type="time"
                              value={schedule.break_end}
                              onChange={(e) => handleScheduleChange(index, 'break_end', e.target.value)}
                              className="h-9"
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      )}

                      {!schedule.is_available && (
                        <Badge variant="secondary" className="ml-auto">
                          Off
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffScheduleManager;
