import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { supabase } from '@/integrations/supabase/client';

// Comprehensive list of timezones organized by region
export const TIMEZONES = {
  'USA': [
    { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
    { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
    { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9/-8' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: 'UTC-10' },
  ],
  'Europe': [
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
    { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1/+2' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1/+2' },
    { value: 'Europe/Madrid', label: 'Madrid (CET)', offset: 'UTC+1/+2' },
    { value: 'Europe/Rome', label: 'Rome (CET)', offset: 'UTC+1/+2' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', offset: 'UTC+1/+2' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' },
  ],
  'Middle East': [
    { value: 'Asia/Dubai', label: 'Dubai, UAE (GST)', offset: 'UTC+4' },
    { value: 'Asia/Riyadh', label: 'Riyadh, Saudi Arabia (AST)', offset: 'UTC+3' },
    { value: 'Asia/Qatar', label: 'Doha, Qatar (AST)', offset: 'UTC+3' },
    { value: 'Asia/Kuwait', label: 'Kuwait City (AST)', offset: 'UTC+3' },
    { value: 'Asia/Bahrain', label: 'Manama, Bahrain (AST)', offset: 'UTC+3' },
  ],
  'South Asia': [
    { value: 'Asia/Karachi', label: 'Karachi, Pakistan (PKT)', offset: 'UTC+5' },
    { value: 'Asia/Kolkata', label: 'Mumbai, India (IST)', offset: 'UTC+5:30' },
    { value: 'Asia/Dhaka', label: 'Dhaka, Bangladesh (BST)', offset: 'UTC+6' },
    { value: 'Asia/Colombo', label: 'Colombo, Sri Lanka', offset: 'UTC+5:30' },
  ],
  'East Asia': [
    { value: 'Asia/Tokyo', label: 'Tokyo, Japan (JST)', offset: 'UTC+9' },
    { value: 'Asia/Shanghai', label: 'Shanghai, China (CST)', offset: 'UTC+8' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
    { value: 'Asia/Seoul', label: 'Seoul, Korea (KST)', offset: 'UTC+9' },
    { value: 'Asia/Manila', label: 'Manila, Philippines (PHT)', offset: 'UTC+8' },
  ],
  'Oceania': [
    { value: 'Australia/Sydney', label: 'Sydney, Australia (AEST)', offset: 'UTC+10/+11' },
    { value: 'Australia/Melbourne', label: 'Melbourne, Australia (AEST)', offset: 'UTC+10/+11' },
    { value: 'Australia/Perth', label: 'Perth, Australia (AWST)', offset: 'UTC+8' },
    { value: 'Pacific/Auckland', label: 'Auckland, New Zealand (NZST)', offset: 'UTC+12/+13' },
  ],
  'Africa': [
    { value: 'Africa/Cairo', label: 'Cairo, Egypt (EET)', offset: 'UTC+2' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg, South Africa (SAST)', offset: 'UTC+2' },
    { value: 'Africa/Lagos', label: 'Lagos, Nigeria (WAT)', offset: 'UTC+1' },
    { value: 'Africa/Nairobi', label: 'Nairobi, Kenya (EAT)', offset: 'UTC+3' },
  ],
  'Americas': [
    { value: 'America/Toronto', label: 'Toronto, Canada (ET)', offset: 'UTC-5/-4' },
    { value: 'America/Vancouver', label: 'Vancouver, Canada (PT)', offset: 'UTC-8/-7' },
    { value: 'America/Mexico_City', label: 'Mexico City (CST)', offset: 'UTC-6/-5' },
    { value: 'America/Sao_Paulo', label: 'São Paulo, Brazil (BRT)', offset: 'UTC-3' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires, Argentina (ART)', offset: 'UTC-3' },
  ],
};

// Flatten timezones for easy lookup
export const ALL_TIMEZONES = Object.values(TIMEZONES).flat();

// Get hospital timezone from settings
let cachedTimezone: string | null = null;

export async function getHospitalTimezone(): Promise<string> {
  if (cachedTimezone) return cachedTimezone;
  
  try {
    const { data, error } = await supabase
      .from('hospital_settings')
      .select('setting_value')
      .eq('setting_key', 'regional_settings')
      .maybeSingle();
    
    if (error || !data) {
      return 'America/New_York'; // Default timezone
    }
    
    const settings = data.setting_value as { timezone?: string };
    cachedTimezone = settings?.timezone || 'America/New_York';
    return cachedTimezone;
  } catch {
    return 'America/New_York';
  }
}

// Clear cached timezone (call when settings are updated)
export function clearTimezoneCache(): void {
  cachedTimezone = null;
}

// Get current time in a specific timezone
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

// Convert a date to a specific timezone
export function convertToTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, timezone);
}

// Convert from a timezone to UTC
export function convertFromTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return fromZonedTime(dateObj, timezone);
}

// Get day of week in a specific timezone (0 = Sunday, 6 = Saturday)
export function getDayOfWeekInTimezone(dateString: string, timezone: string): number {
  const zonedDate = toZonedTime(parseISO(dateString), timezone);
  return zonedDate.getDay();
}

// Format time for display in a specific timezone
export function formatTimeForTimezone(time: string, timezone: string, formatStr: string = 'h:mm a'): string {
  try {
    // Create a date with the time
    const today = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);
    
    return formatInTimeZone(today, timezone, formatStr);
  } catch {
    return time;
  }
}

// Format a full date/time for display
export function formatDateTimeInTimezone(date: Date | string, timezone: string, formatStr: string = 'PPP p'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatStr);
}

// Get timezone label by value
export function getTimezoneLabel(timezoneValue: string): string {
  const tz = ALL_TIMEZONES.find(t => t.value === timezoneValue);
  return tz?.label || timezoneValue;
}

// Get current date string in timezone (YYYY-MM-DD format)
export function getCurrentDateInTimezone(timezone: string): string {
  const zonedDate = toZonedTime(new Date(), timezone);
  return format(zonedDate, 'yyyy-MM-dd');
}

// Check if a date is today in a specific timezone
export function isTodayInTimezone(dateString: string, timezone: string): boolean {
  const currentDate = getCurrentDateInTimezone(timezone);
  return dateString === currentDate;
}
