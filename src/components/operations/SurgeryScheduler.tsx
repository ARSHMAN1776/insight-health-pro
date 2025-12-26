import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, CalendarPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTimezone } from '@/hooks/useTimezone';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface OperationTheatre {
  id: string;
  ot_name: string;
  status: string;
}

interface SurgerySchedulerProps {
  onSurgeryScheduled?: () => void;
}

const SurgeryScheduler: React.FC<SurgerySchedulerProps> = ({ onSurgeryScheduled }) => {
  const { user } = useAuth();
  const { getCurrentDate } = useTimezone();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [theatres, setTheatres] = useState<OperationTheatre[]>([]);
  const [loading, setLoading] = useState(false);
  
  const getInitialFormData = () => ({
    patient_id: '',
    doctor_id: '',
    ot_id: '',
    surgery_type: '',
    surgery_date: getCurrentDate(),
    start_time: '09:00',
    end_time: '11:00',
    priority: 'normal',
    notes: ''
  });
  
  const [formData, setFormData] = useState(getInitialFormData());

  const canSchedule = ['admin', 'receptionist', 'doctor'].includes(user?.role || '');

  useEffect(() => {
    if (isDialogOpen) {
      fetchData();
    }
  }, [isDialogOpen]);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes, theatresRes] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name').order('first_name'),
        supabase.from('doctors').select('id, first_name, last_name, specialization').eq('status', 'active').order('first_name'),
        supabase.from('operation_theatres').select('id, ot_name, status').order('ot_name')
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (doctorsRes.error) throw doctorsRes.error;
      if (theatresRes.error) throw theatresRes.error;

      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setTheatres(theatresRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      });
    }
  };

  const checkOTAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('surgeries')
        .select('id')
        .eq('ot_id', formData.ot_id)
        .eq('surgery_date', formData.surgery_date)
        .neq('status', 'cancelled')
        .or(`and(start_time.lte.${formData.end_time},end_time.gte.${formData.start_time})`);

      if (error) throw error;
      return (data || []).length === 0;
    } catch (error) {
      return true; // Proceed if check fails
    }
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.doctor_id || !formData.ot_id || !formData.surgery_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Check OT availability
      const isAvailable = await checkOTAvailability();
      if (!isAvailable) {
        toast({
          title: 'Scheduling Conflict',
          description: 'The selected OT is already booked during this time slot',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('surgeries')
        .insert({
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          ot_id: formData.ot_id,
          surgery_type: formData.surgery_type.trim(),
          surgery_date: formData.surgery_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          priority: formData.priority,
          notes: formData.notes.trim() || null,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Surgery scheduled successfully' });
      setIsDialogOpen(false);
      resetForm();
      onSurgeryScheduled?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule surgery',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
  };

  if (!canSchedule) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <CalendarPlus className="h-4 w-4 mr-2" />
        Schedule Surgery
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Surgery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="doctor">Doctor/Surgeon *</Label>
              <Select
                value={formData.doctor_id}
                onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ot">Operation Theatre *</Label>
              <Select
                value={formData.ot_id}
                onValueChange={(value) => setFormData({ ...formData, ot_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select OT" />
                </SelectTrigger>
                <SelectContent>
                  {theatres.map((theatre) => (
                    <SelectItem 
                      key={theatre.id} 
                      value={theatre.id}
                      disabled={theatre.status === 'maintenance'}
                    >
                      {theatre.ot_name} ({theatre.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="surgery_type">Surgery Type *</Label>
              <Input
                id="surgery_type"
                value={formData.surgery_type}
                onChange={(e) => setFormData({ ...formData, surgery_type: e.target.value })}
                placeholder="e.g., Appendectomy, Cardiac Bypass"
              />
            </div>

            <div>
              <Label htmlFor="surgery_date">Surgery Date *</Label>
              <Input
                id="surgery_date"
                type="date"
                value={formData.surgery_date}
                onChange={(e) => setFormData({ ...formData, surgery_date: e.target.value })}
                min={getCurrentDate()}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Pre-operative notes, special requirements..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Surgery'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SurgeryScheduler;
