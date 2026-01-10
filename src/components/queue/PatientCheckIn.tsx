import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, UserPlus, Printer, Check, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueue, QueueEntry } from '@/hooks/useQueue';
import { useToast } from '@/hooks/use-toast';
import TokenSlip from './TokenSlip';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string;
  gender: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  department_id: string | null;
}

interface Department {
  department_id: string;
  department_name: string;
}

interface TodayAppointment {
  id: string;
  appointment_time: string;
  doctor: Doctor;
  department?: Department;
  status: string;
}

const PatientCheckIn: React.FC = () => {
  const { toast } = useToast();
  const { checkInPatient, entries } = useQueue();
  const tokenSlipRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [todayAppointment, setTodayAppointment] = useState<TodayAppointment | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [entryType, setEntryType] = useState<'appointment' | 'walk_in'>('walk_in');
  const [priority, setPriority] = useState<'normal' | 'priority' | 'emergency'>('normal');
  const [symptoms, setSymptoms] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{ entry: QueueEntry; token: string } | null>(null);

  // Load doctors and departments
  useEffect(() => {
    const loadData = async () => {
      const [doctorsRes, deptsRes] = await Promise.all([
        supabase.from('doctors').select('*').eq('status', 'active'),
        supabase.from('departments').select('*').eq('status', 'active')
      ]);
      
      if (doctorsRes.data) setDoctors(doctorsRes.data);
      if (deptsRes.data) setDepartments(deptsRes.data);
    };
    loadData();
  }, []);

  // Filter doctors by department
  useEffect(() => {
    if (selectedDepartment) {
      setFilteredDoctors(doctors.filter(d => d.department_id === selectedDepartment));
    } else {
      setFilteredDoctors(doctors);
    }
  }, [selectedDepartment, doctors]);

  // Search patients
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
      .eq('status', 'active')
      .limit(10);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to search patients', variant: 'destructive' });
      return;
    }
    
    setSearchResults(data || []);
  };

  // Select patient and check for today's appointment
  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    
    // Check if patient already in queue today
    const existingEntry = entries.find(e => 
      e.patient_id === patient.id && 
      ['waiting', 'called', 'in_consultation'].includes(e.status)
    );
    
    if (existingEntry) {
      toast({
        title: 'Already in Queue',
        description: `This patient already has token ${existingEntry.token_number}`,
        variant: 'destructive'
      });
      return;
    }
    
    // Check for today's appointment
    const today = new Date().toISOString().split('T')[0];
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_time,
        status,
        doctor:doctors(id, first_name, last_name, specialization, department_id),
        department:departments(department_id, department_name)
      `)
      .eq('patient_id', patient.id)
      .eq('appointment_date', today)
      .in('status', ['scheduled', 'confirmed'])
      .limit(1);
    
    if (appointments && appointments.length > 0) {
      const apt = appointments[0];
      setTodayAppointment({
        id: apt.id,
        appointment_time: apt.appointment_time,
        doctor: apt.doctor as unknown as Doctor,
        department: apt.department as unknown as Department,
        status: apt.status || 'scheduled'
      });
      setEntryType('appointment');
      setSelectedDoctor(apt.doctor?.id || '');
      setSelectedDepartment(apt.department?.department_id || apt.doctor?.department_id || '');
    } else {
      setTodayAppointment(null);
      setEntryType('walk_in');
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!selectedPatient || !selectedDoctor) {
      toast({ title: 'Error', description: 'Please select a patient and doctor', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    
    const result = await checkInPatient({
      patientId: selectedPatient.id,
      doctorId: selectedDoctor,
      departmentId: selectedDepartment || undefined,
      appointmentId: todayAppointment?.id,
      entryType: priority === 'emergency' ? 'emergency' : entryType,
      priority,
      symptoms: symptoms || undefined
    });
    
    setLoading(false);
    
    if (result) {
      setGeneratedToken(result);
      setShowTokenDialog(true);
    }
  };

  // Print token
  const handlePrint = () => {
    window.print();
  };

  // Reset form
  const resetForm = () => {
    setSelectedPatient(null);
    setTodayAppointment(null);
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedDoctor('');
    setEntryType('walk_in');
    setPriority('normal');
    setSymptoms('');
    setShowTokenDialog(false);
    setGeneratedToken(null);
  };

  const getSelectedDoctorName = () => {
    const doc = doctors.find(d => d.id === selectedDoctor);
    return doc ? `Dr. ${doc.first_name} ${doc.last_name}` : '';
  };

  const getDepartmentName = () => {
    const dept = departments.find(d => d.department_id === selectedDepartment);
    return dept?.department_name || '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Patient Check-In
          </CardTitle>
          <CardDescription>
            Search for a patient and generate a queue token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 hover:bg-accent cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div>
                      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-muted-foreground">{patient.phone || 'No phone'}</p>
                    </div>
                    <Badge variant="outline">{patient.gender}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Patient */}
          {selectedPatient && (
            <Card className="bg-accent/50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.phone || 'No phone'} • {selectedPatient.gender}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    Change Patient
                  </Button>
                </div>

                {/* Today's Appointment Notice */}
                {todayAppointment && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Scheduled Appointment</span>
                    </div>
                    <p className="text-sm mt-1">
                      {todayAppointment.appointment_time} with Dr. {todayAppointment.doctor.first_name} {todayAppointment.doctor.last_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Check-in Form */}
          {selectedPatient && (
            <div className="space-y-4">
              {/* Entry Type */}
              {!todayAppointment && (
                <div className="space-y-2">
                  <Label>Entry Type</Label>
                  <RadioGroup
                    value={entryType}
                    onValueChange={(v) => setEntryType(v as 'appointment' | 'walk_in')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="walk_in" id="walk_in" />
                      <Label htmlFor="walk_in">Walk-in</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as 'normal' | 'priority' | 'emergency')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="priority" id="priority" />
                    <Label htmlFor="priority">Priority</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency" className="text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Emergency
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Department & Doctor Selection (if no appointment) */}
              {!todayAppointment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDoctors.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            Dr. {doc.first_name} {doc.last_name} - {doc.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Symptoms */}
              <div className="space-y-2">
                <Label>Symptoms/Reason for Visit</Label>
                <Textarea
                  placeholder="Brief description of symptoms or reason for visit..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleCheckIn} 
                disabled={loading || !selectedDoctor}
                className="w-full"
                size="lg"
              >
                {loading ? 'Checking In...' : 'Check In & Generate Token'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              Token Generated Successfully!
            </DialogTitle>
          </DialogHeader>
          
          {generatedToken && (
            <div className="space-y-4">
              <div id="token-slip" ref={tokenSlipRef}>
                <TokenSlip
                  token={generatedToken.token}
                  patientName={`${selectedPatient?.first_name} ${selectedPatient?.last_name}`}
                  doctorName={getSelectedDoctorName()}
                  departmentName={getDepartmentName()}
                  estimatedWait={generatedToken.entry.estimated_wait_mins || undefined}
                  position={generatedToken.entry.position_in_queue || undefined}
                  checkedInAt={generatedToken.entry.checked_in_at}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handlePrint} variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Token
                </Button>
                <Button onClick={resetForm} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientCheckIn;
