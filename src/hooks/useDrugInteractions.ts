import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DrugInteraction {
  id: string;
  drug_a: string;
  drug_b: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  mechanism?: string;
  management?: string;
}

export interface InteractionCheckResult {
  drug1: string;
  drug2: string;
  interaction: DrugInteraction | null;
}

export const useDrugInteractions = () => {
  const [loading, setLoading] = useState(false);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);

  const fetchAllInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drug_interactions')
        .select('*')
        .order('severity', { ascending: false });

      if (error) throw error;
      const typedData = (data || []) as DrugInteraction[];
      setInteractions(typedData);
      return typedData;
    } catch (error) {
      console.error('Error fetching drug interactions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const checkInteraction = useCallback(async (drug1: string, drug2: string): Promise<DrugInteraction | null> => {
    const drug1Lower = drug1.toLowerCase().trim();
    const drug2Lower = drug2.toLowerCase().trim();

    try {
      // Check both directions since interactions are bi-directional
      const { data, error } = await supabase
        .from('drug_interactions')
        .select('*')
        .or(`and(drug_a.ilike.%${drug1Lower}%,drug_b.ilike.%${drug2Lower}%),and(drug_a.ilike.%${drug2Lower}%,drug_b.ilike.%${drug1Lower}%)`)
        .limit(1);

      if (error) throw error;
      return (data?.[0] as DrugInteraction) || null;
    } catch (error) {
      console.error('Error checking drug interaction:', error);
      return null;
    }
  }, []);

  const checkMultipleDrugs = useCallback(async (drugs: string[]): Promise<InteractionCheckResult[]> => {
    const results: InteractionCheckResult[] = [];
    
    // Check all pairs
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const interaction = await checkInteraction(drugs[i], drugs[j]);
        if (interaction) {
          results.push({
            drug1: drugs[i],
            drug2: drugs[j],
            interaction
          });
        }
      }
    }

    return results;
  }, [checkInteraction]);

  const getSeverityColor = (severity: DrugInteraction['severity']) => {
    switch (severity) {
      case 'contraindicated':
        return 'bg-red-600 text-white';
      case 'major':
        return 'bg-red-500 text-white';
      case 'moderate':
        return 'bg-amber-500 text-white';
      case 'minor':
        return 'bg-yellow-400 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: DrugInteraction['severity']) => {
    switch (severity) {
      case 'contraindicated':
        return '⛔';
      case 'major':
        return '🔴';
      case 'moderate':
        return '🟠';
      case 'minor':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return {
    loading,
    interactions,
    fetchAllInteractions,
    checkInteraction,
    checkMultipleDrugs,
    getSeverityColor,
    getSeverityIcon
  };
};
