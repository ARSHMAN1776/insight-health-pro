import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DiagnosisCode {
  id: string;
  code: string;
  description: string;
  category?: string;
  subcategory?: string;
  is_billable: boolean;
}

export interface ProcedureCode {
  id: string;
  code: string;
  description: string;
  category?: string;
  base_price?: number;
  modifier_allowed: boolean;
}

export const useClinicalCodes = () => {
  const [diagnosisCodes, setDiagnosisCodes] = useState<DiagnosisCode[]>([]);
  const [procedureCodes, setProcedureCodes] = useState<ProcedureCode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiagnosisCodes = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('diagnosis_codes')
        .select('*')
        .order('code', { ascending: true });

      if (search) {
        query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setDiagnosisCodes(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching diagnosis codes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProcedureCodes = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('procedure_codes')
        .select('*')
        .order('code', { ascending: true });

      if (search) {
        query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setProcedureCodes(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching procedure codes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getDiagnosisCodeById = useCallback(async (id: string): Promise<DiagnosisCode | null> => {
    try {
      const { data, error } = await supabase
        .from('diagnosis_codes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching diagnosis code:', error);
      return null;
    }
  }, []);

  const getProcedureCodeById = useCallback(async (id: string): Promise<ProcedureCode | null> => {
    try {
      const { data, error } = await supabase
        .from('procedure_codes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching procedure code:', error);
      return null;
    }
  }, []);

  const getCategoryOptions = (codes: DiagnosisCode[] | ProcedureCode[]) => {
    const categories = [...new Set(codes.map(c => c.category).filter(Boolean))];
    return categories.sort();
  };

  return {
    diagnosisCodes,
    procedureCodes,
    loading,
    fetchDiagnosisCodes,
    fetchProcedureCodes,
    getDiagnosisCodeById,
    getProcedureCodeById,
    getCategoryOptions
  };
};
