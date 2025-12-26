import { supabase } from '@/integrations/supabase/client';

export interface StaffSchedule {
  id: string;
  staff_id: string;
  staff_type: 'doctor' | 'nurse';
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_available: boolean;
  break_start: string | null;
  break_end: string | null;
  notes: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get the day of week (0-6) from a date string
 */
export const getDayOfWeek = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getDay();
};

/**
 * Fetch staff schedule for a specific day
 */
export const getStaffScheduleForDay = async (
  staffId: string,
  staffType: 'doctor' | 'nurse',
  dayOfWeek: number
): Promise<StaffSchedule | null> => {
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('staff_type', staffType)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single();

  if (error || !data) return null;
  return data as StaffSchedule;
};

/**
 * Fetch all schedules for a staff member
 */
export const getStaffSchedules = async (
  staffId: string,
  staffType: 'doctor' | 'nurse'
): Promise<StaffSchedule[]> => {
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('staff_type', staffType)
    .order('day_of_week');

  if (error) return [];
  return (data || []) as StaffSchedule[];
};

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Check if a time falls within a break period
 */
export const isInBreakPeriod = (
  time: string,
  breakStart: string | null,
  breakEnd: string | null
): boolean => {
  if (!breakStart || !breakEnd) return false;
  
  const timeMinutes = timeToMinutes(time);
  const breakStartMinutes = timeToMinutes(breakStart);
  const breakEndMinutes = timeToMinutes(breakEnd);
  
  return timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes;
};

/**
 * Generate time slots based on schedule
 */
export const generateTimeSlotsFromSchedule = (schedule: StaffSchedule): string[] => {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(schedule.start_time);
  const endMinutes = timeToMinutes(schedule.end_time);
  const duration = schedule.slot_duration || 30;

  for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
    const timeStr = minutesToTime(time);
    
    // Skip if in break period
    if (!isInBreakPeriod(timeStr, schedule.break_start, schedule.break_end)) {
      slots.push(timeStr);
    }
  }

  return slots;
};

/**
 * Get booked appointments for a doctor on a specific date
 */
export const getBookedSlots = async (
  doctorId: string,
  date: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  if (error || !data) return [];
  return data.map(apt => apt.appointment_time.substring(0, 5));
};

/**
 * Get available time slots for a doctor on a specific date
 */
export const getAvailableTimeSlots = async (
  doctorId: string,
  date: string
): Promise<TimeSlot[]> => {
  const dayOfWeek = getDayOfWeek(date);
  
  // Get doctor's schedule for this day
  const schedule = await getStaffScheduleForDay(doctorId, 'doctor', dayOfWeek);
  
  if (!schedule) {
    return [{
      time: '',
      available: false,
      reason: `Doctor is not available on ${DAY_NAMES[dayOfWeek]}s`
    }];
  }

  // Generate all possible slots
  const allSlots = generateTimeSlotsFromSchedule(schedule);
  
  if (allSlots.length === 0) {
    return [{
      time: '',
      available: false,
      reason: 'No time slots available for this day'
    }];
  }

  // Get already booked slots
  const bookedSlots = await getBookedSlots(doctorId, date);

  // Mark slots as available or booked
  return allSlots.map(time => ({
    time,
    available: !bookedSlots.includes(time),
    reason: bookedSlots.includes(time) ? 'Already booked' : undefined
  }));
};

/**
 * Check if a specific time slot is available
 */
export const isTimeSlotAvailable = async (
  doctorId: string,
  date: string,
  time: string
): Promise<{ available: boolean; reason?: string }> => {
  const dayOfWeek = getDayOfWeek(date);
  
  // Check doctor's schedule
  const schedule = await getStaffScheduleForDay(doctorId, 'doctor', dayOfWeek);
  
  if (!schedule) {
    return { 
      available: false, 
      reason: `Doctor is not available on ${DAY_NAMES[dayOfWeek]}s` 
    };
  }

  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(schedule.start_time);
  const endMinutes = timeToMinutes(schedule.end_time);

  // Check if time is within working hours
  if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
    return { 
      available: false, 
      reason: `Outside working hours (${schedule.start_time} - ${schedule.end_time})` 
    };
  }

  // Check if in break period
  if (isInBreakPeriod(time, schedule.break_start, schedule.break_end)) {
    return { 
      available: false, 
      reason: `Break time (${schedule.break_start} - ${schedule.break_end})` 
    };
  }

  // Check existing appointments
  const bookedSlots = await getBookedSlots(doctorId, date);
  if (bookedSlots.includes(time)) {
    return { available: false, reason: 'Time slot already booked' };
  }

  return { available: true };
};

/**
 * Save or update staff schedule
 */
export const saveStaffSchedule = async (
  staffId: string,
  staffType: 'doctor' | 'nurse',
  schedules: Partial<StaffSchedule>[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete existing schedules
    await supabase
      .from('staff_schedules')
      .delete()
      .eq('staff_id', staffId)
      .eq('staff_type', staffType);

    // Insert new schedules
    const schedulesToInsert = schedules
      .filter(s => s.is_available && s.start_time && s.end_time)
      .map(s => ({
        staff_id: staffId,
        staff_type: staffType,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        slot_duration: s.slot_duration || 30,
        is_available: true,
        break_start: s.break_start || null,
        break_end: s.break_end || null,
        notes: s.notes || null
      }));

    if (schedulesToInsert.length > 0) {
      const { error } = await supabase
        .from('staff_schedules')
        .insert(schedulesToInsert);

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get working days summary for display
 */
export const getWorkingDaysSummary = (schedules: StaffSchedule[]): string => {
  const workingDays = schedules
    .filter(s => s.is_available)
    .map(s => DAY_NAMES_SHORT[s.day_of_week])
    .join(', ');
  
  return workingDays || 'No schedule set';
};
