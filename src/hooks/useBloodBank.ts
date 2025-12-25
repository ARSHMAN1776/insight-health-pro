import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BloodBankStats {
  availableUnits: number;
  expiringSoon: number;
  pendingRequests: number;
  activeDonors: number;
}

export interface BloodDonor {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  weight_kg: number | null;
  last_donation_date: string | null;
  next_eligible_date: string | null;
  medical_conditions: string | null;
  medications: string | null;
  is_eligible: boolean;
  eligibility_notes: string | null;
  total_donations: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BloodInventoryItem {
  id: string;
  donation_id: string | null;
  bag_number: string;
  blood_type: string;
  component_type: string;
  volume_ml: number;
  collection_date: string;
  expiry_date: string;
  storage_location: string | null;
  storage_temperature: string | null;
  testing_status: string;
  hiv_status: string;
  hbv_status: string;
  hcv_status: string;
  syphilis_status: string;
  malaria_status: string;
  crossmatch_compatible: boolean | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BloodDonation {
  id: string;
  donor_id: string;
  donation_date: string;
  donation_time: string;
  blood_type: string;
  volume_ml: number;
  hemoglobin_level: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_rate: number | null;
  temperature: number | null;
  bag_number: string;
  collection_site: string | null;
  collected_by: string;
  screening_status: string;
  screening_notes: string | null;
  adverse_reactions: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  donor?: BloodDonor;
}

export interface BloodRequest {
  id: string;
  patient_id: string;
  doctor_id: string;
  blood_type: string;
  component_type: string;
  units_requested: number;
  units_issued: number;
  priority: string;
  indication: string;
  clinical_notes: string | null;
  required_date: string;
  required_time: string | null;
  request_status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  patient?: { first_name: string; last_name: string };
  doctor?: { first_name: string; last_name: string };
}

export interface BloodTransfusion {
  id: string;
  request_id: string | null;
  inventory_id: string;
  patient_id: string;
  bag_number: string;
  blood_type: string;
  component_type: string;
  volume_ml: number;
  transfusion_date: string;
  transfusion_start_time: string;
  transfusion_end_time: string | null;
  administered_by: string;
  verified_by: string;
  pre_transfusion_vitals: Record<string, any> | null;
  post_transfusion_vitals: Record<string, any> | null;
  compatibility_verified: boolean;
  patient_consent_obtained: boolean;
  adverse_reaction: boolean;
  reaction_type: string | null;
  reaction_severity: string | null;
  reaction_description: string | null;
  reaction_management: string | null;
  outcome: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient?: { first_name: string; last_name: string };
}

export function useBloodBankStats() {
  const [stats, setStats] = useState<BloodBankStats>({
    availableUnits: 0,
    expiringSoon: 0,
    pendingRequests: 0,
    activeDonors: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch available units
      const { count: availableCount } = await (supabase as any)
        .from('blood_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      // Fetch expiring soon (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const { count: expiringCount } = await (supabase as any)
        .from('blood_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
        .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);

      // Fetch pending requests
      const { count: pendingCount } = await (supabase as any)
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .in('request_status', ['pending', 'approved', 'partially_fulfilled']);

      // Fetch active donors
      const { count: donorCount } = await (supabase as any)
        .from('blood_donors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        availableUnits: availableCount || 0,
        expiringSoon: expiringCount || 0,
        pendingRequests: pendingCount || 0,
        activeDonors: donorCount || 0
      });
    } catch (error) {
      console.error('Error fetching blood bank stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export function useBloodDonors() {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('blood_donors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonors(data || []);
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return { donors, loading, refetch: fetchDonors };
}

export function useBloodInventory() {
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('blood_inventory')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { inventory, loading, refetch: fetchInventory };
}

export function useBloodDonations() {
  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('blood_donations')
        .select(`
          *,
          donor:donor_id (
            id, first_name, last_name, blood_type
          )
        `)
        .order('donation_date', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return { donations, loading, refetch: fetchDonations };
}

export function useBloodRequests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('blood_requests')
        .select(`
          *,
          patient:patient_id (first_name, last_name),
          doctor:doctor_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, refetch: fetchRequests };
}

export function useBloodTransfusions() {
  const [transfusions, setTransfusions] = useState<BloodTransfusion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfusions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('blood_transfusions')
        .select(`
          *,
          patient:patient_id (first_name, last_name)
        `)
        .order('transfusion_date', { ascending: false });

      if (error) throw error;
      setTransfusions(data || []);
    } catch (error) {
      console.error('Error fetching transfusions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfusions();
  }, [fetchTransfusions]);

  return { transfusions, loading, refetch: fetchTransfusions };
}
