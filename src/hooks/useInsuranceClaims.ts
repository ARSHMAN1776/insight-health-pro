import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InsuranceClaim {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  claim_number: string | null;
  insurance_provider: string;
  policy_number: string;
  submission_date: string | null;
  service_date: string;
  diagnosis_codes: string[];
  procedure_codes: string[];
  total_amount: number;
  approved_amount: number | null;
  patient_responsibility: number | null;
  status: string;
  denial_reason: string | null;
  denial_code: string | null;
  appeal_deadline: string | null;
  appeal_submitted: boolean;
  appeal_notes: string | null;
  notes: string | null;
  submitted_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

export interface InsuranceClaimItem {
  id: string;
  claim_id: string;
  service_date: string;
  procedure_code: string;
  procedure_description: string | null;
  diagnosis_code: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  denial_reason: string | null;
  created_at: string;
}

export interface CreateClaimData {
  patient_id: string;
  appointment_id?: string;
  insurance_provider: string;
  policy_number: string;
  service_date: string;
  diagnosis_codes?: string[];
  procedure_codes?: string[];
  total_amount: number;
  notes?: string;
}

export interface CreateClaimItemData {
  claim_id: string;
  service_date: string;
  procedure_code: string;
  procedure_description?: string;
  diagnosis_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function useInsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_claims')
        .select(`
          *,
          patient:patients(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createClaim = async (claimData: CreateClaimData) => {
    try {
      const { data, error } = await supabase
        .from('insurance_claims')
        .insert({
          ...claimData,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Insurance claim created successfully',
      });

      await fetchClaims();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateClaimStatus = async (
    claimId: string,
    status: string,
    additionalData?: Partial<InsuranceClaim>
  ) => {
    try {
      const { error } = await supabase
        .from('insurance_claims')
        .update({
          status,
          ...additionalData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Claim status updated to ${status}`,
      });

      await fetchClaims();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const submitClaim = async (claimId: string) => {
    await updateClaimStatus(claimId, 'submitted', {
      submission_date: new Date().toISOString().split('T')[0],
    });
  };

  const approveClaim = async (claimId: string, approvedAmount: number, patientResponsibility: number) => {
    await updateClaimStatus(claimId, 'approved', {
      approved_amount: approvedAmount,
      patient_responsibility: patientResponsibility,
      reviewed_at: new Date().toISOString(),
    });
  };

  const denyClaim = async (claimId: string, denialReason: string, denialCode?: string, appealDeadline?: string) => {
    await updateClaimStatus(claimId, 'denied', {
      denial_reason: denialReason,
      denial_code: denialCode || null,
      appeal_deadline: appealDeadline || null,
      reviewed_at: new Date().toISOString(),
    });
  };

  const submitAppeal = async (claimId: string, appealNotes: string) => {
    await updateClaimStatus(claimId, 'appealed', {
      appeal_submitted: true,
      appeal_notes: appealNotes,
    });
  };

  const addClaimItem = async (itemData: CreateClaimItemData) => {
    try {
      const { error } = await supabase
        .from('insurance_claim_items')
        .insert(itemData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Claim item added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getClaimItems = async (claimId: string): Promise<InsuranceClaimItem[]> => {
    try {
      const { data, error } = await supabase
        .from('insurance_claim_items')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return {
    claims,
    loading,
    fetchClaims,
    createClaim,
    updateClaimStatus,
    submitClaim,
    approveClaim,
    denyClaim,
    submitAppeal,
    addClaimItem,
    getClaimItems,
  };
}
