import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Droplets, 
  Scale, 
  Ruler,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PatientVitals {
  id: string;
  patient_id: string;
  recorded_by: string;
  recorded_at: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  spo2: number | null;
  respiratory_rate: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  pain_level: number | null;
  blood_glucose: number | null;
  notes: string | null;
  is_abnormal: boolean;
  abnormal_flags: string[] | null;
  patients?: {
    first_name: string;
    last_name: string;
  };
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

// Normal ranges for vitals
const NORMAL_RANGES = {
  blood_pressure_systolic: { min: 90, max: 140, critical_low: 80, critical_high: 180 },
  blood_pressure_diastolic: { min: 60, max: 90, critical_low: 50, critical_high: 120 },
  heart_rate: { min: 60, max: 100, critical_low: 40, critical_high: 150 },
  temperature: { min: 36.1, max: 37.2, critical_low: 35, critical_high: 39 },
  spo2: { min: 95, max: 100, critical_low: 90, critical_high: 101 },
  respiratory_rate: { min: 12, max: 20, critical_low: 8, critical_high: 30 },
  blood_glucose: { min: 70, max: 140, critical_low: 50, critical_high: 250 }
};

const VitalsManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState<PatientVitals[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedVitals, setSelectedVitals] = useState<PatientVitals | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    spo2: '',
    respiratory_rate: '',
    weight: '',
    height: '',
    pain_level: '',
    blood_glucose: '',
    notes: ''
  });

  useEffect(() => {
    fetchVitals();
    fetchPatients();
  }, []);

  const fetchVitals = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_vitals')
        .select(`
          *,
          patients:patient_id(first_name, last_name)
        `)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setVitals(data || []);
    } catch (error) {
      console.error('Error fetching vitals:', error);
      toast({
        title: "Error",
        description: "Failed to load vitals data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const checkAbnormalVitals = (data: typeof formData) => {
    const flags: string[] = [];
    
    if (data.blood_pressure_systolic) {
      const val = parseFloat(data.blood_pressure_systolic);
      if (val < NORMAL_RANGES.blood_pressure_systolic.min || val > NORMAL_RANGES.blood_pressure_systolic.max) {
        flags.push('BP Systolic');
      }
    }
    if (data.blood_pressure_diastolic) {
      const val = parseFloat(data.blood_pressure_diastolic);
      if (val < NORMAL_RANGES.blood_pressure_diastolic.min || val > NORMAL_RANGES.blood_pressure_diastolic.max) {
        flags.push('BP Diastolic');
      }
    }
    if (data.heart_rate) {
      const val = parseFloat(data.heart_rate);
      if (val < NORMAL_RANGES.heart_rate.min || val > NORMAL_RANGES.heart_rate.max) {
        flags.push('Heart Rate');
      }
    }
    if (data.temperature) {
      const val = parseFloat(data.temperature);
      if (val < NORMAL_RANGES.temperature.min || val > NORMAL_RANGES.temperature.max) {
        flags.push('Temperature');
      }
    }
    if (data.spo2) {
      const val = parseFloat(data.spo2);
      if (val < NORMAL_RANGES.spo2.min) {
        flags.push('SpO2');
      }
    }
    if (data.respiratory_rate) {
      const val = parseFloat(data.respiratory_rate);
      if (val < NORMAL_RANGES.respiratory_rate.min || val > NORMAL_RANGES.respiratory_rate.max) {
        flags.push('Respiratory Rate');
      }
    }
    if (data.blood_glucose) {
      const val = parseFloat(data.blood_glucose);
      if (val < NORMAL_RANGES.blood_glucose.min || val > NORMAL_RANGES.blood_glucose.max) {
        flags.push('Blood Glucose');
      }
    }

    return flags;
  };

  const calculateBMI = (weight: string, height: string): number | null => {
    if (!weight || !height) return null;
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m
    if (w > 0 && h > 0) {
      return Math.round((w / (h * h)) * 10) / 10;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive"
      });
      return;
    }

    const abnormalFlags = checkAbnormalVitals(formData);
    const bmi = calculateBMI(formData.weight, formData.height);

    try {
      const { error } = await supabase
        .from('patient_vitals')
        .insert({
          patient_id: selectedPatient,
          recorded_by: user?.id,
          blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
          blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
          heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          spo2: formData.spo2 ? parseInt(formData.spo2) : null,
          respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          bmi,
          pain_level: formData.pain_level ? parseInt(formData.pain_level) : null,
          blood_glucose: formData.blood_glucose ? parseFloat(formData.blood_glucose) : null,
          notes: formData.notes || null,
          is_abnormal: abnormalFlags.length > 0,
          abnormal_flags: abnormalFlags.length > 0 ? abnormalFlags : null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: abnormalFlags.length > 0 
          ? `Vitals recorded with ${abnormalFlags.length} abnormal value(s)` 
          : "Vitals recorded successfully"
      });

      setIsDialogOpen(false);
      resetForm();
      fetchVitals();
    } catch (error) {
      console.error('Error recording vitals:', error);
      toast({
        title: "Error",
        description: "Failed to record vitals",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      temperature: '',
      spo2: '',
      respiratory_rate: '',
      weight: '',
      height: '',
      pain_level: '',
      blood_glucose: '',
      notes: ''
    });
    setSelectedPatient('');
  };

  const getVitalStatus = (value: number | null, range: { min: number; max: number; critical_low: number; critical_high: number }) => {
    if (value === null) return null;
    if (value < range.critical_low || value > range.critical_high) {
      return 'critical';
    }
    if (value < range.min || value > range.max) {
      return 'warning';
    }
    return 'normal';
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground">Abnormal</Badge>;
      default:
        return <Badge className="bg-success text-success-foreground">Normal</Badge>;
    }
  };

  const abnormalVitals = vitals.filter(v => v.is_abnormal);
  const recentVitals = vitals.slice(0, 20);

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Vitals</h1>
          <p className="text-muted-foreground">Track and monitor patient vital signs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-green hover:bg-medical-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Record Vitals
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Patient Vitals</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input 
                        placeholder="Search patients..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vital Signs Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Blood Pressure */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive" />
                    Blood Pressure (mmHg)
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      placeholder="Systolic"
                      value={formData.blood_pressure_systolic}
                      onChange={(e) => setFormData({...formData, blood_pressure_systolic: e.target.value})}
                    />
                    <span className="self-center">/</span>
                    <Input 
                      type="number"
                      placeholder="Diastolic"
                      value={formData.blood_pressure_diastolic}
                      onChange={(e) => setFormData({...formData, blood_pressure_diastolic: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Normal: 90-140 / 60-90</p>
                </div>

                {/* Heart Rate */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-medical-purple" />
                    Heart Rate (bpm)
                  </Label>
                  <Input 
                    type="number"
                    placeholder="Heart rate"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({...formData, heart_rate: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 60-100</p>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-medical-orange" />
                    Temperature (°C)
                  </Label>
                  <Input 
                    type="number"
                    step="0.1"
                    placeholder="Temperature"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 36.1-37.2</p>
                </div>

                {/* SpO2 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-medical-blue" />
                    SpO2 (%)
                  </Label>
                  <Input 
                    type="number"
                    placeholder="Oxygen saturation"
                    value={formData.spo2}
                    onChange={(e) => setFormData({...formData, spo2: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 95-100</p>
                </div>

                {/* Respiratory Rate */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-medical-green" />
                    Respiratory Rate (/min)
                  </Label>
                  <Input 
                    type="number"
                    placeholder="Breaths per minute"
                    value={formData.respiratory_rate}
                    onChange={(e) => setFormData({...formData, respiratory_rate: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 12-20</p>
                </div>

                {/* Blood Glucose */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-warning" />
                    Blood Glucose (mg/dL)
                  </Label>
                  <Input 
                    type="number"
                    placeholder="Blood glucose"
                    value={formData.blood_glucose}
                    onChange={(e) => setFormData({...formData, blood_glucose: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 70-140</p>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-muted-foreground" />
                    Weight (kg)
                  </Label>
                  <Input 
                    type="number"
                    step="0.1"
                    placeholder="Weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    Height (cm)
                  </Label>
                  <Input 
                    type="number"
                    step="0.1"
                    placeholder="Height"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                  />
                </div>

                {/* Pain Level */}
                <div className="space-y-2 col-span-2">
                  <Label>Pain Level (0-10)</Label>
                  <Select 
                    value={formData.pain_level} 
                    onValueChange={(val) => setFormData({...formData, pain_level: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pain level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          {level} - {level === 0 ? 'No pain' : level <= 3 ? 'Mild' : level <= 6 ? 'Moderate' : 'Severe'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Additional observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-green hover:bg-medical-green/90">
                  Record Vitals
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Readings</p>
                <p className="text-2xl font-bold">{vitals.filter(v => 
                  new Date(v.recorded_at).toDateString() === new Date().toDateString()
                ).length}</p>
              </div>
              <Activity className="w-8 h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={abnormalVitals.length > 0 ? "border-destructive" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abnormal Values</p>
                <p className="text-2xl font-bold text-destructive">{abnormalVitals.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patients Monitored</p>
                <p className="text-2xl font-bold">{new Set(vitals.map(v => v.patient_id)).size}</p>
              </div>
              <Heart className="w-8 h-8 text-medical-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Readings</p>
                <p className="text-2xl font-bold">{vitals.length}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Vitals */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Vitals</TabsTrigger>
          <TabsTrigger value="abnormal" className="relative">
            Abnormal Values
            {abnormalVitals.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5">
                {abnormalVitals.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>BP (mmHg)</TableHead>
                      <TableHead>HR (bpm)</TableHead>
                      <TableHead>Temp (°C)</TableHead>
                      <TableHead>SpO2 (%)</TableHead>
                      <TableHead>RR (/min)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recorded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading vitals...
                        </TableCell>
                      </TableRow>
                    ) : recentVitals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No vitals recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentVitals.map((vital) => (
                        <TableRow key={vital.id} className={vital.is_abnormal ? 'bg-destructive/5' : ''}>
                          <TableCell className="font-medium">
                            {vital.patients?.first_name} {vital.patients?.last_name}
                          </TableCell>
                          <TableCell>
                            {vital.blood_pressure_systolic && vital.blood_pressure_diastolic 
                              ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                              : '-'}
                          </TableCell>
                          <TableCell>{vital.heart_rate || '-'}</TableCell>
                          <TableCell>{vital.temperature || '-'}</TableCell>
                          <TableCell>{vital.spo2 || '-'}</TableCell>
                          <TableCell>{vital.respiratory_rate || '-'}</TableCell>
                          <TableCell>
                            {vital.is_abnormal ? (
                              <Badge variant="destructive">Abnormal</Badge>
                            ) : (
                              <Badge className="bg-success text-success-foreground">Normal</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(vital.recorded_at), 'MMM d, HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abnormal">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Abnormal Vital Signs - Requires Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abnormalVitals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-2 text-success" />
                    <p>All vitals are within normal ranges</p>
                  </div>
                ) : (
                  abnormalVitals.map((vital) => (
                    <div key={vital.id} className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {vital.patients?.first_name} {vital.patients?.last_name}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(vital.recorded_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {vital.abnormal_flags?.map((flag, idx) => (
                          <Badge key={idx} variant="destructive">{flag}</Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                        {vital.blood_pressure_systolic && (
                          <div>
                            <span className="text-muted-foreground">BP: </span>
                            <span className="font-medium">
                              {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                            </span>
                          </div>
                        )}
                        {vital.heart_rate && (
                          <div>
                            <span className="text-muted-foreground">HR: </span>
                            <span className="font-medium">{vital.heart_rate}</span>
                          </div>
                        )}
                        {vital.temperature && (
                          <div>
                            <span className="text-muted-foreground">Temp: </span>
                            <span className="font-medium">{vital.temperature}°C</span>
                          </div>
                        )}
                        {vital.spo2 && (
                          <div>
                            <span className="text-muted-foreground">SpO2: </span>
                            <span className="font-medium">{vital.spo2}%</span>
                          </div>
                        )}
                      </div>
                      {vital.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{vital.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VitalsManagement;