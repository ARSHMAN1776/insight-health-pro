import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface DailyQueue {
  id: string;
  queue_date: string;
  department_id: string | null;
  doctor_id: string | null;
  current_token_number: number;
  token_prefix: string;
  is_active: boolean;
  avg_consultation_mins: number;
  created_at: string;
  updated_at: string;
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

export interface QueueEntry {
  id: string;
  queue_id: string;
  patient_id: string;
  appointment_id: string | null;
  token_number: string;
  entry_type: 'appointment' | 'walk_in' | 'emergency';
  priority: 'normal' | 'priority' | 'emergency';
  status: 'waiting' | 'called' | 'in_consultation' | 'completed' | 'no_show' | 'cancelled' | 'transferred';
  symptoms: string | null;
  notes: string | null;
  estimated_wait_mins: number | null;
  position_in_queue: number | null;
  checked_in_at: string;
  called_at: string | null;
  consultation_started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    date_of_birth: string;
    gender: string;
  };
  queue?: DailyQueue;
}

export interface QueueStats {
  totalWaiting: number;
  totalServed: number;
  avgWaitTime: number;
  currentlyServing: QueueEntry | null;
}

interface UseQueueOptions {
  doctorId?: string;
  departmentId?: string;
  realtime?: boolean;
}

export const useQueue = (options: UseQueueOptions = {}) => {
  const { doctorId, departmentId, realtime = true } = options;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState<DailyQueue[]>([]);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<QueueEntry | null>(null);

  const fetchQueues = useCallback(async () => {
    try {
      let query = supabase
        .from('daily_queues')
        .select(`
          *,
          doctor:doctors(id, first_name, last_name, specialization),
          department:departments(department_id, department_name)
        `)
        .eq('queue_date', new Date().toISOString().split('T')[0])
        .eq('is_active', true);

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }
      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setQueues(data as DailyQueue[] || []);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  }, [doctorId, departmentId]);

  const fetchEntries = useCallback(async (queueIds?: string[]) => {
    try {
      setLoading(true);
      let query = supabase
        .from('queue_entries')
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone, date_of_birth, gender),
          queue:daily_queues(
            *,
            doctor:doctors(id, first_name, last_name, specialization),
            department:departments(department_id, department_name)
          )
        `)
        .order('position_in_queue', { ascending: true, nullsFirst: false });

      if (queueIds && queueIds.length > 0) {
        query = query.in('queue_id', queueIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const typedData = data as QueueEntry[] || [];
      setEntries(typedData);
      
      // Find currently serving patient
      const serving = typedData.find(e => e.status === 'in_consultation');
      setCurrentEntry(serving || null);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!realtime) return;

    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      channel = supabase
        .channel('queue-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'queue_entries' },
          () => {
            fetchQueues();
            fetchEntries(queues.map(q => q.id));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'daily_queues' },
          () => {
            fetchQueues();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [realtime, fetchQueues, fetchEntries, queues]);

  // Initial fetch
  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    if (queues.length > 0) {
      fetchEntries(queues.map(q => q.id));
    } else {
      fetchEntries();
    }
  }, [queues, fetchEntries]);

  // Get or create queue for a doctor
  const getOrCreateQueue = async (doctorId: string, departmentId?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('get_or_create_daily_queue', {
        _doctor_id: doctorId,
        _department_id: departmentId || null
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to create queue',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Check in a patient (create queue entry)
  const checkInPatient = async (data: {
    patientId: string;
    doctorId: string;
    departmentId?: string;
    appointmentId?: string;
    entryType: 'appointment' | 'walk_in' | 'emergency';
    priority?: 'normal' | 'priority' | 'emergency';
    symptoms?: string;
    notes?: string;
  }): Promise<{ entry: QueueEntry; token: string } | null> => {
    try {
      // Get or create queue
      const queueId = await getOrCreateQueue(data.doctorId, data.departmentId);
      if (!queueId) throw new Error('Failed to get queue');

      // Generate token
      const { data: token, error: tokenError } = await supabase.rpc('generate_next_token', {
        _queue_id: queueId
      });
      if (tokenError) throw tokenError;

      // Calculate position
      const { data: position, error: posError } = await supabase.rpc('calculate_queue_position', {
        _queue_id: queueId
      });
      if (posError) throw posError;

      // Create entry
      const { data: entry, error } = await supabase
        .from('queue_entries')
        .insert({
          queue_id: queueId,
          patient_id: data.patientId,
          appointment_id: data.appointmentId || null,
          token_number: token,
          entry_type: data.entryType,
          priority: data.priority || 'normal',
          symptoms: data.symptoms || null,
          notes: data.notes || null,
          position_in_queue: position
        })
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone, date_of_birth, gender)
        `)
        .single();

      if (error) throw error;

      toast({
        title: 'Patient Checked In',
        description: `Token: ${token}`
      });

      await fetchEntries([queueId]);
      return { entry: entry as QueueEntry, token };
    } catch (error) {
      console.error('Error checking in patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to check in patient',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Call next patient
  const callNextPatient = async (queueId: string): Promise<QueueEntry | null> => {
    try {
      // Find next waiting patient
      const { data: nextPatient, error: findError } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('queue_id', queueId)
        .eq('status', 'waiting')
        .order('position_in_queue', { ascending: true })
        .limit(1)
        .single();

      if (findError || !nextPatient) {
        toast({
          title: 'No Waiting Patients',
          description: 'The queue is empty'
        });
        return null;
      }

      // Update status to called
      const { data: updated, error } = await supabase
        .from('queue_entries')
        .update({
          status: 'called',
          called_at: new Date().toISOString()
        })
        .eq('id', nextPatient.id)
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone, date_of_birth, gender)
        `)
        .single();

      if (error) throw error;

      toast({
        title: 'Patient Called',
        description: `Token ${nextPatient.token_number} has been called`
      });

      return updated as QueueEntry;
    } catch (error) {
      console.error('Error calling next patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to call next patient',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Start consultation
  const startConsultation = async (entryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({
          status: 'in_consultation',
          consultation_started_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Consultation Started',
        description: 'Patient is now in consultation'
      });

      return true;
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start consultation',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Complete consultation
  const completeConsultation = async (entryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Consultation Completed',
        description: 'Patient has been marked as completed'
      });

      return true;
    } catch (error) {
      console.error('Error completing consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete consultation',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Mark patient as no-show
  const markNoShow = async (entryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: 'no_show' })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Marked as No-Show',
        description: 'Patient has been marked as no-show'
      });

      return true;
    } catch (error) {
      console.error('Error marking no-show:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark as no-show',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Cancel entry
  const cancelEntry = async (entryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: 'cancelled' })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Entry Cancelled',
        description: 'Queue entry has been cancelled'
      });

      return true;
    } catch (error) {
      console.error('Error cancelling entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel entry',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Calculate stats
  const stats: QueueStats = {
    totalWaiting: entries.filter(e => e.status === 'waiting' || e.status === 'called').length,
    totalServed: entries.filter(e => e.status === 'completed').length,
    avgWaitTime: queues[0]?.avg_consultation_mins || 15,
    currentlyServing: entries.find(e => e.status === 'in_consultation') || null
  };

  const waitingEntries = entries.filter(e => e.status === 'waiting');
  const calledEntries = entries.filter(e => e.status === 'called');
  const inConsultationEntries = entries.filter(e => e.status === 'in_consultation');
  const completedEntries = entries.filter(e => e.status === 'completed');

  return {
    loading,
    queues,
    entries,
    waitingEntries,
    calledEntries,
    inConsultationEntries,
    completedEntries,
    currentEntry,
    stats,
    fetchQueues,
    fetchEntries,
    getOrCreateQueue,
    checkInPatient,
    callNextPatient,
    startConsultation,
    completeConsultation,
    markNoShow,
    cancelEntry,
    refetch: () => {
      fetchQueues();
      if (queues.length > 0) {
        fetchEntries(queues.map(q => q.id));
      }
    }
  };
};
