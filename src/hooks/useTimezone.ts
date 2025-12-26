import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { 
  getCurrentDateInTimezone, 
  getCurrentTimeInTimezone, 
  convertToTimezone,
  getTimezoneLabel,
  clearTimezoneCache
} from '@/lib/timezoneUtils';

interface UseTimezoneReturn {
  timezone: string;
  loading: boolean;
  // Format a date string for display
  formatDate: (dateString: string, formatStr?: string) => string;
  // Format a time string for display
  formatTime: (timeString: string, formatStr?: string) => string;
  // Format a full datetime for display
  formatDateTime: (date: Date | string, formatStr?: string) => string;
  // Get current date in hospital timezone (YYYY-MM-DD)
  getCurrentDate: () => string;
  // Get current time in hospital timezone
  getCurrentTime: () => Date;
  // Check if a date is today in hospital timezone
  isToday: (dateString: string) => boolean;
  // Get timezone label for display
  getTimezoneDisplay: () => string;
  // Refresh timezone from settings
  refreshTimezone: () => Promise<void>;
}

export function useTimezone(): UseTimezoneReturn {
  const [timezone, setTimezone] = useState<string>('America/New_York');
  const [loading, setLoading] = useState(true);

  const fetchTimezone = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_settings')
        .select('setting_value')
        .eq('setting_key', 'regional_settings')
        .maybeSingle();
      
      if (!error && data) {
        const settings = data.setting_value as { timezone?: string };
        if (settings?.timezone) {
          setTimezone(settings.timezone);
        }
      }
    } catch (err) {
      console.error('Error fetching timezone:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimezone();
  }, []);

  const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
    if (!dateString) return 'N/A';
    try {
      return formatInTimeZone(parseISO(dateString), timezone, formatStr);
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string, formatStr: string = 'h:mm a'): string => {
    if (!timeString) return 'N/A';
    try {
      // Create a date with the time for formatting
      const today = new Date();
      const [hours, minutes] = timeString.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
      return formatInTimeZone(today, timezone, formatStr);
    } catch {
      return timeString;
    }
  };

  const formatDateTime = (date: Date | string, formatStr: string = 'MMM dd, yyyy h:mm a'): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatInTimeZone(dateObj, timezone, formatStr);
    } catch {
      return String(date);
    }
  };

  const getCurrentDate = (): string => {
    return getCurrentDateInTimezone(timezone);
  };

  const getCurrentTime = (): Date => {
    return getCurrentTimeInTimezone(timezone);
  };

  const isToday = (dateString: string): boolean => {
    return dateString === getCurrentDate();
  };

  const getTimezoneDisplay = (): string => {
    return getTimezoneLabel(timezone);
  };

  const refreshTimezone = async () => {
    clearTimezoneCache();
    await fetchTimezone();
  };

  return {
    timezone,
    loading,
    formatDate,
    formatTime,
    formatDateTime,
    getCurrentDate,
    getCurrentTime,
    isToday,
    getTimezoneDisplay,
    refreshTimezone
  };
}
