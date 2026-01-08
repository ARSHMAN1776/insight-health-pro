import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Calendar, Clock, User, Building2, AlertCircle, CheckCircle, ListPlus, X
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
                  className="p-4 rounded-xl border bg-card space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.department && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        <Building2 className="h-3 w-3 mr-1" />
                        {entry.department.department_name}
                      </Badge>
                    )}
                    {entry.doctor && (
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        Dr. {entry.doctor.first_name} {entry.doctor.last_name}
                      </Badge>
                    )}
                    <Badge 
                      variant={entry.status === 'notified' ? 'default' : 'outline'}
                      className="text-xs px-2 py-1 ml-auto"
                    >
                      {entry.status === 'waiting' ? 'Waiting' : 'Slot Available!'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(entry.preferred_date_start), 'MMM d, yyyy')}
                    {entry.preferred_date_end && (
                      <> - {format(new Date(entry.preferred_date_end), 'MMM d')}</>
                    )}
                  </div>
                  
                  {entry.status === 'notified' && (
                    <Alert className="py-2 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-300">
                        A slot is available! Check your notifications.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50 font-medium"
                    onClick={() => cancelEntry(entry.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Request
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join Waitlist Card */}
      <Card className="overflow-hidden border bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                <ListPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base sm:text-lg text-foreground">Join Waitlist</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {isVerified 
                    ? "Can't find a slot? We'll notify you when one opens."
                    : 'Account verification required'
                  }
                </p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full sm:w-auto h-11 sm:h-10 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
                  disabled={!isVerified}
                >
                  <ListPlus className="w-4 h-4 mr-2" />
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
