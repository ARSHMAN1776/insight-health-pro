import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Calendar, Clock, User, Building2, AlertCircle, CheckCircle, ListPlus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '../../lib/dataManager';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useWaitlist, WaitlistEntry } from '@/hooks/useWaitlist';
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';

interface Department {
  department_id: string;
  department_name: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  department_id?: string;
}

interface WaitlistSignupProps {
  patientData: Patient | null;
  onWaitlistJoined?: () => void;
}

const TIME_SLOT_OPTIONS = [
  { value: 'morning', label: 'Morning (8AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 4PM)' },
  { value: 'evening', label: 'Evening (4PM - 7PM)' },
];

const WaitlistSignup: React.FC<WaitlistSignupProps> = ({ patientData, onWaitlistJoined }) => {
  const { toast } = useToast();
  const { entries, createEntry, cancelEntry } = useWaitlist();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [preferredDateStart, setPreferredDateStart] = useState('');
  const [preferredDateEnd, setPreferredDateEnd] = useState('');
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([]);
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal' | 'low'>('normal');
  const [reason, setReason] = useState('');

  // Get patient's current waitlist entries
  const patientWaitlistEntries = entries.filter(
    e => e.patient_id === patientData?.id && ['waiting', 'notified'].includes(e.status)
  );

  // Load departments and doctors
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deptResult, doctorResult] = await Promise.all([
          supabase
            .from('departments')
            .select('department_id, department_name')
            .eq('status', 'Active')
            .order('department_name'),
          supabase
            .from('doctors')
            .select('id, first_name, last_name, specialization, department_id')
            .eq('status', 'active')
            .order('last_name'),
        ]);

        if (deptResult.data) setDepartments(deptResult.data);
        if (doctorResult.data) {
          setDoctors(doctorResult.data);
          setFilteredDoctors(doctorResult.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isDialogOpen) {
      loadData();
    }
  }, [isDialogOpen]);

  // Filter doctors by department
  useEffect(() => {
    if (departmentId) {
      const filtered = doctors.filter(d => d.department_id === departmentId);
      setFilteredDoctors(filtered);
      setDoctorId(''); // Reset doctor selection
    } else {
      setFilteredDoctors(doctors);
    }
  }, [departmentId, doctors]);

  const handleTimeSlotChange = (slot: string, checked: boolean) => {
    if (checked) {
      setPreferredTimeSlots(prev => [...prev, slot]);
    } else {
      setPreferredTimeSlots(prev => prev.filter(s => s !== slot));
    }
  };

  const handleSubmit = async () => {
    if (!patientData?.id) {
      toast({
        title: 'Error',
        description: 'Patient record not found.',
        variant: 'destructive',
      });
      return;
    }

    if (!preferredDateStart) {
      toast({
        title: 'Required',
        description: 'Please select a preferred start date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const success = await createEntry({
        patient_id: patientData.id,
        doctor_id: doctorId || undefined,
        department_id: departmentId || undefined,
        preferred_date_start: preferredDateStart,
        preferred_date_end: preferredDateEnd || undefined,
        preferred_time_slots: preferredTimeSlots,
        priority,
        reason: reason || undefined,
      });

      if (success) {
        setIsDialogOpen(false);
        resetForm();
        onWaitlistJoined?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDepartmentId('');
    setDoctorId('');
    setPreferredDateStart('');
    setPreferredDateEnd('');
    setPreferredTimeSlots([]);
    setPriority('normal');
    setReason('');
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const isVerified = patientData?.status === 'active';

  return (
    <div className="space-y-4">
      {/* Current Waitlist Entries */}
      {patientWaitlistEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Your Waitlist Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientWaitlistEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {entry.department && (
                        <Badge variant="outline">
                          <Building2 className="h-3 w-3 mr-1" />
                          {entry.department.department_name}
                        </Badge>
                      )}
                      {entry.doctor && (
                        <Badge variant="secondary">
                          Dr. {entry.doctor.first_name} {entry.doctor.last_name}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(entry.preferred_date_start), 'MMM d, yyyy')}
                      {entry.preferred_date_end && (
                        <> - {format(new Date(entry.preferred_date_end), 'MMM d')}</>
                      )}
                    </div>
                    {entry.status === 'notified' && (
                      <Alert className="mt-2 py-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm">
                          A slot is available! Check your notifications.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.status === 'notified' ? 'default' : 'outline'}>
                      {entry.status === 'waiting' ? 'Waiting' : 'Slot Available!'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => cancelEntry(entry.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join Waitlist Card */}
      <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                <ListPlus className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Join Appointment Waitlist</h3>
                <p className="text-sm text-muted-foreground">
                  {isVerified 
                    ? "Can't find a slot? Join the waitlist and we'll notify you when one opens."
                    : 'Your account must be verified to join the waitlist.'
                  }
                </p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="lg"
                  disabled={!isVerified}
                >
                  <ListPlus className="w-5 h-5 mr-2" />
                  Join Waitlist
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Join Appointment Waitlist
                  </DialogTitle>
                  <DialogDescription>
                    We'll notify you when an appointment slot becomes available.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Department Selection */}
                  <div className="space-y-2">
                    <Label>Department (Optional)</Label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any department</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doctor Selection */}
                  <div className="space-y-2">
                    <Label>Preferred Doctor (Optional)</Label>
                    <Select value={doctorId} onValueChange={setDoctorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any available doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any available doctor</SelectItem>
                        {filteredDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Date *</Label>
                      <Input
                        type="date"
                        value={preferredDateStart}
                        onChange={(e) => setPreferredDateStart(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To Date (Optional)</Label>
                      <Input
                        type="date"
                        value={preferredDateEnd}
                        onChange={(e) => setPreferredDateEnd(e.target.value)}
                        min={preferredDateStart || getMinDate()}
                        max={getMaxDate()}
                      />
                    </div>
                  </div>

                  {/* Time Preferences */}
                  <div className="space-y-2">
                    <Label>Preferred Time Slots</Label>
                    <div className="space-y-2">
                      {TIME_SLOT_OPTIONS.map((slot) => (
                        <div key={slot.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={slot.value}
                            checked={preferredTimeSlots.includes(slot.value)}
                            onCheckedChange={(checked) => 
                              handleTimeSlotChange(slot.value, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={slot.value} 
                            className="text-sm cursor-pointer"
                          >
                            {slot.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label>Urgency Level</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Flexible timing</SelectItem>
                        <SelectItem value="normal">Normal - Regular appointment</SelectItem>
                        <SelectItem value="high">High - Need soon</SelectItem>
                        <SelectItem value="urgent">Urgent - Medical necessity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label>Reason for Visit (Optional)</Label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Brief description of why you need the appointment..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting || !preferredDateStart}>
                    {submitting ? 'Joining...' : 'Join Waitlist'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistSignup;
