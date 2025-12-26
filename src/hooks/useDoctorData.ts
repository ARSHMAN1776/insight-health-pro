import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { dataManager, Appointment, Patient, MedicalRecord, Prescription } from '@/lib/dataManager';

export interface DoctorDataFilter {
  showOnlyMine: boolean;
}

export const useDoctorData = (filter: DoctorDataFilter) => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Get doctor ID for current user
  useEffect(() => {
    const fetchDoctorId = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setDoctorId(data.id);
      }
    };
    
    fetchDoctorId();
  }, [user?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (filter.showOnlyMine && doctorId) {
          // Fetch only doctor's own data
          const [appointmentsData, recordsData, prescriptionsData] = await Promise.all([
            dataManager.getAppointmentsByDoctor(doctorId),
            dataManager.getMedicalRecordsByDoctor(doctorId),
            dataManager.getPrescriptionsByDoctor(doctorId)
          ]);
          
          // Get unique patient IDs from appointments and records
          const patientIds = new Set([
            ...appointmentsData.map(a => a.patient_id),
            ...recordsData.map(r => r.patient_id),
            ...prescriptionsData.map(p => p.patient_id)
          ]);
          
          // Fetch those patients
          const patientPromises = Array.from(patientIds).map(id => dataManager.getPatientById(id));
          const patientsData = (await Promise.all(patientPromises)).filter(Boolean) as Patient[];
          
          setAppointments(appointmentsData);
          setMedicalRecords(recordsData);
          setPrescriptions(prescriptionsData);
          setPatients(patientsData);
        } else {
          // Fetch all data (for admin view or when filter is off)
          const [appointmentsData, patientsData, recordsData, prescriptionsData] = await Promise.all([
            dataManager.getAppointments(),
            dataManager.getPatients(),
            dataManager.getMedicalRecords(),
            dataManager.getPrescriptions()
          ]);
          
          setAppointments(appointmentsData);
          setPatients(patientsData);
          setMedicalRecords(recordsData);
          setPrescriptions(prescriptionsData);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!filter.showOnlyMine || doctorId) {
      fetchData();
    }
  }, [filter.showOnlyMine, doctorId]);

  return {
    doctorId,
    appointments,
    patients,
    medicalRecords,
    prescriptions,
    loading,
    refetch: () => {
      // Trigger refetch by updating state
    }
  };
};
