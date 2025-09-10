import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DataTable from '@/components/shared/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Pill, Calendar, User, FileText } from 'lucide-react';
import { dataManager } from '@/lib/dataManager';
import type { Prescription } from '@/lib/dataManager';

const PrescriptionManagement: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prescriptionsData, patientsData, doctorsData] = await Promise.all([
          dataManager.getPrescriptions(),
          dataManager.getPatients(),
          dataManager.getDoctors()
        ]);
        setPrescriptions(prescriptionsData);
        setPatients(patientsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: '',
    side_effects: '',
    drug_interactions: ''
  });


  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medication_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const prescriptionData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 1,
        status: 'active' as const,
        date_prescribed: new Date().toISOString().split('T')[0]
      };

      if (selectedPrescription) {
        await dataManager.updatePrescription(selectedPrescription.id, prescriptionData);
        toast({ title: 'Success', description: 'Prescription updated successfully' });
      } else {
        await dataManager.createPrescription(prescriptionData);
        toast({ title: 'Success', description: 'Prescription created successfully' });
      }

      // Reload data
      const updatedPrescriptions = await dataManager.getPrescriptions();
      setPrescriptions(updatedPrescriptions);
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save prescription', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: '',
      side_effects: '',
      drug_interactions: ''
    });
    setSelectedPrescription(null);
  };

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setFormData({
      patient_id: prescription.patient_id,
      doctor_id: prescription.doctor_id,
      medication_name: prescription.medication_name,
      dosage: prescription.dosage || '',
      frequency: prescription.frequency || '',
      duration: prescription.duration || '',
      instructions: prescription.instructions || '',
      quantity: prescription.quantity?.toString() || '',
      side_effects: prescription.side_effects || '',
      drug_interactions: prescription.drug_interactions || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dataManager.deletePrescription(id);
      const updatedPrescriptions = await dataManager.getPrescriptions();
      setPrescriptions(updatedPrescriptions);
      toast({ title: 'Success', description: 'Prescription deleted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete prescription', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: Prescription['status']) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    } as const;
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const columns = [
    { key: 'id', label: 'Prescription ID' },
    { 
      key: 'patientName', 
      label: 'Patient',
      render: (prescription: Prescription) => {
        if (!prescription || !prescription.patient_id) return <span className="text-muted-foreground">Unknown Patient</span>;
        const patient = patients.find(p => p?.id === prescription.patient_id);
        if (!patient) return <span className="text-muted-foreground">Patient Not Found</span>;
        const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
        return fullName || <span className="text-muted-foreground">No Name</span>;
      }
    },
    { 
      key: 'doctorName', 
      label: 'Doctor',
      render: (prescription: Prescription) => {
        if (!prescription || !prescription.doctor_id) return <span className="text-muted-foreground">Unknown Doctor</span>;
        const doctor = doctors.find(d => d?.id === prescription.doctor_id);
        if (!doctor) return <span className="text-muted-foreground">Doctor Not Found</span>;
        const fullName = `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();
        return fullName || <span className="text-muted-foreground">No Name</span>;
      }
    },
    { key: 'medication_name', label: 'Medication' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'frequency', label: 'Frequency' },
    { 
      key: 'status', 
      label: 'Status',
      render: (prescription: Prescription) => getStatusBadge(prescription.status)
    },
    { key: 'date_prescribed', label: 'Date Prescribed' },
    { key: 'duration', label: 'Duration' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescription Management</h1>
          <p className="text-muted-foreground">Manage patient prescriptions and medications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPrescription ? 'Edit Prescription' : 'Create New Prescription'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name} ({patient.id.substring(0, 8)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor_id">Doctor</Label>
                  <Select value={formData.doctor_id} onValueChange={(value) => setFormData({...formData, doctor_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medication_name">Medication</Label>
                  <Input
                    id="medication_name"
                    value={formData.medication_name}
                    onChange={(e) => setFormData({...formData, medication_name: e.target.value})}
                    placeholder="e.g., Lisinopril"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    placeholder="e.g., 10mg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    placeholder="e.g., Once daily"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 30 days"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Take with food, avoid alcohol..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="side_effects">Side Effects</Label>
                <Textarea
                  id="side_effects"
                  value={formData.side_effects}
                  onChange={(e) => setFormData({...formData, side_effects: e.target.value})}
                  placeholder="Dizziness, nausea..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drug_interactions">Drug Interactions</Label>
                <Textarea
                  id="drug_interactions"
                  value={formData.drug_interactions}
                  onChange={(e) => setFormData({...formData, drug_interactions: e.target.value})}
                  placeholder="Avoid taking with aspirin, warfarin..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedPrescription ? 'Update' : 'Create'} Prescription
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              All Prescriptions
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Prescriptions"
            data={filteredPrescriptions}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={() => {
              setSelectedPrescription(null);
              resetForm();
              setIsDialogOpen(true);
            }}
            addButtonText="New Prescription"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionManagement;