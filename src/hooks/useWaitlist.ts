import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface WaitlistEntry {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  department_id: string | null;
  preferred_date_start: string;
  preferred_date_end: string | null;
  preferred_time_slots: string[];
  priority: 'urgent' | 'high' | 'normal' | 'low';
  reason: string | null;
  notes: string | null;
  status: 'waiting' | 'notified' | 'booked' | 'cancelled' | 'expired';
  notified_at: string | null;
  responded_at: string | null;
  response_deadline: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  };
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
  };
  department?: {
    department_id: string;
    department_name: string;
  };
}

export interface CreateWaitlistEntry {
  patient_id: string;
  doctor_id?: string;
  department_id?: string;
  preferred_date_start: string;
  preferred_date_end?: string;
  preferred_time_slots?: string[];
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  reason?: string;
  notes?: string;
}

export const useWaitlist = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isRole } = useAuth();

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointment_waitlist')
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone, email),
          doctor:doctors(id, first_name, last_name, specialization),
          department:departments(department_id, department_name)
        `)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: WaitlistEntry[] = (data || []).map((entry: any) => ({
        ...entry,
        preferred_time_slots: entry.preferred_time_slots || [],
        patient: entry.patient,
        doctor: entry.doctor,
        department: entry.department,
      }));

      setEntries(transformedData);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load waitlist entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (entry: CreateWaitlistEntry): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointment_waitlist')
        .insert({
          ...entry,
          preferred_time_slots: entry.preferred_time_slots || [],
          priority: entry.priority || 'normal',
          status: 'waiting',
        });

      if (error) throw error;

      toast({
        title: 'Added to Waitlist',
        description: 'You have been added to the appointment waitlist.',
      });

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Error creating waitlist entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to waitlist',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateEntry = async (id: string, updates: Partial<WaitlistEntry>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointment_waitlist')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Updated',
        description: 'Waitlist entry updated successfully.',
      });

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Error updating waitlist entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update waitlist entry',
        variant: 'destructive',
      });
      return false;
    }
  };

  const cancelEntry = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointment_waitlist')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Cancelled',
        description: 'Waitlist entry has been cancelled.',
      });

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Error cancelling waitlist entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel waitlist entry',
        variant: 'destructive',
      });
      return false;
    }
  };

  const notifyPatient = async (id: string): Promise<boolean> => {
    try {
      const entry = entries.find(e => e.id === id);
      if (!entry || !entry.patient) {
        throw new Error('Entry not found');
      }

      // Get patient's user_id
      const { data: patientData } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', entry.patient_id)
        .single();

      if (patientData?.user_id) {
        // Create notification
        await supabase.from('notifications').insert({
          user_id: patientData.user_id,
          title: 'Appointment Slot Available!',
          message: `A slot has become available for your waitlisted appointment. Please book within 24 hours or your spot will be given to the next person.`,
          type: 'waitlist_notification',
          priority: 'high',
          action_url: '/dashboard',
          metadata: {
            waitlist_id: id,
            doctor_name: entry.doctor 
              ? `Dr. ${entry.doctor.first_name} ${entry.doctor.last_name}` 
              : null,
            department: entry.department?.department_name || null,
          },
        });
      }

      // Update waitlist entry
      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 24);

      const { error } = await supabase
        .from('appointment_waitlist')
        .update({ 
          status: 'notified',
          notified_at: new Date().toISOString(),
          response_deadline: responseDeadline.toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Patient Notified',
        description: 'The patient has been notified about the available slot.',
      });

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Error notifying patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to notify patient',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAsBooked = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointment_waitlist')
        .update({ 
          status: 'booked',
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Marked as Booked',
        description: 'The patient has successfully booked their appointment.',
      });

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Error marking as booked:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get stats
  const stats = {
    total: entries.filter(e => e.status === 'waiting' || e.status === 'notified').length,
    waiting: entries.filter(e => e.status === 'waiting').length,
    notified: entries.filter(e => e.status === 'notified').length,
    urgent: entries.filter(e => e.priority === 'urgent' && e.status === 'waiting').length,
    booked: entries.filter(e => e.status === 'booked').length,
  };

  return {
    entries,
    loading,
    stats,
    fetchEntries,
    createEntry,
    updateEntry,
    cancelEntry,
    notifyPatient,
    markAsBooked,
  };
};
