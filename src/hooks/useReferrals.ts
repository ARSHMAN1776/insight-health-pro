import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Referral {
  id: string;
  patient_id: string;
  referring_doctor_id: string;
  receiving_doctor_id?: string;
  receiving_department_id?: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  reason: string;
  clinical_notes?: string;
  diagnosis?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  appointment_id?: string;
  response_notes?: string;
  responded_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  referring_doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
  };
  receiving_doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
  };
  receiving_department?: {
    department_id: string;
    department_name: string;
  };
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReferrals = useCallback(async (filters?: {
    status?: string;
    doctorId?: string;
    patientId?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('referrals')
        .select(`
          *,
          patient:patients(id, first_name, last_name),
          referring_doctor:doctors!referrals_referring_doctor_id_fkey(id, first_name, last_name, specialization),
          receiving_doctor:doctors!referrals_receiving_doctor_id_fkey(id, first_name, last_name, specialization),
          receiving_department:departments(department_id, department_name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.doctorId) {
        query = query.or(`referring_doctor_id.eq.${filters.doctorId},receiving_doctor_id.eq.${filters.doctorId}`);
      }
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      const typedData = (data || []) as Referral[];
      setReferrals(typedData);
      return typedData;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createReferral = useCallback(async (referralData: {
    patient_id: string;
    referring_doctor_id: string;
    receiving_doctor_id?: string;
    receiving_department_id?: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    reason: string;
    clinical_notes?: string;
    diagnosis?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([referralData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }, []);

  const updateReferral = useCallback(async (id: string, updates: Partial<Referral>) => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating referral:', error);
      throw error;
    }
  }, []);

  const acceptReferral = useCallback(async (id: string, responseNotes?: string) => {
    return updateReferral(id, {
      status: 'accepted',
      response_notes: responseNotes,
      responded_at: new Date().toISOString()
    });
  }, [updateReferral]);

  const declineReferral = useCallback(async (id: string, responseNotes: string) => {
    return updateReferral(id, {
      status: 'declined',
      response_notes: responseNotes,
      responded_at: new Date().toISOString()
    });
  }, [updateReferral]);

  const completeReferral = useCallback(async (id: string, appointmentId?: string) => {
    return updateReferral(id, {
      status: 'completed',
      appointment_id: appointmentId,
      completed_at: new Date().toISOString()
    });
  }, [updateReferral]);

  const cancelReferral = useCallback(async (id: string) => {
    return updateReferral(id, {
      status: 'cancelled'
    });
  }, [updateReferral]);

  const getUrgencyColor = (urgency: Referral['urgency']) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-500 text-white';
      case 'urgent':
        return 'bg-amber-500 text-white';
      case 'routine':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'accepted':
        return 'bg-blue-500 text-white';
      case 'declined':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return {
    referrals,
    loading,
    fetchReferrals,
    createReferral,
    updateReferral,
    acceptReferral,
    declineReferral,
    completeReferral,
    cancelReferral,
    getUrgencyColor,
    getStatusColor
  };
};
