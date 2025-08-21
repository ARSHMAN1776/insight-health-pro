import React, { useState } from 'react';
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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(dataManager.getPrescriptions());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    startDate: '',
    endDate: '',
    refills: '',
    sideEffects: '',
    interactions: ''
  });

  const patients = dataManager.getPatients();
  const doctors = dataManager.getDoctors();

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const prescriptionData = {
        ...formData,
        refills: parseInt(formData.refills) || 0,
        interactions: formData.interactions.split(',').map(s => s.trim()).filter(s => s),
        createdBy: 'current-user'
      };

      if (selectedPrescription) {
        const updated = dataManager.updatePrescription(selectedPrescription.id, prescriptionData);
        setPrescriptions(dataManager.getPrescriptions());
        toast({ title: 'Success', description: 'Prescription updated successfully' });
      } else {
        const newPrescription = dataManager.createPrescription(prescriptionData);
        setPrescriptions(dataManager.getPrescriptions());
        toast({ title: 'Success', description: 'Prescription created successfully' });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save prescription', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      startDate: '',
      endDate: '',
      refills: '',
      sideEffects: '',
      interactions: ''
    });
    setSelectedPrescription(null);
  };

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setFormData({
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      startDate: prescription.startDate,
      endDate: prescription.endDate,
      refills: prescription.refills.toString(),
      sideEffects: prescription.sideEffects || '',
      interactions: prescription.interactions?.join(', ') || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dataManager.deletePrescription(id);
    setPrescriptions(dataManager.getPrescriptions());
    toast({ title: 'Success', description: 'Prescription deleted successfully' });
  };

  const getStatusBadge = (status: Prescription['status']) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      expired: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const columns = [
    { key: 'prescriptionId', label: 'Prescription ID' },
    { 
      key: 'patientName', 
      label: 'Patient',
      render: (prescription: Prescription) => {
        const patient = patients.find(p => p.id === prescription.patientId);
        return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
      }
    },
    { 
      key: 'doctorName', 
      label: 'Doctor',
      render: (prescription: Prescription) => {
        const doctor = doctors.find(d => d.id === prescription.doctorId);
        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown';
      }
    },
    { key: 'medication', label: 'Medication' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'frequency', label: 'Frequency' },
    { 
      key: 'status', 
      label: 'Status',
      render: (prescription: Prescription) => getStatusBadge(prescription.status)
    },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' }
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
                  <Label htmlFor="patientId">Patient</Label>
                  <Select value={formData.patientId} onValueChange={(value) => setFormData({...formData, patientId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} ({patient.patientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctorId">Doctor</Label>
                  <Select value={formData.doctorId} onValueChange={(value) => setFormData({...formData, doctorId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication</Label>
                  <Input
                    id="medication"
                    value={formData.medication}
                    onChange={(e) => setFormData({...formData, medication: e.target.value})}
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refills">Refills</Label>
                  <Input
                    id="refills"
                    type="number"
                    min="0"
                    value={formData.refills}
                    onChange={(e) => setFormData({...formData, refills: e.target.value})}
                    placeholder="0"
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
                <Label htmlFor="sideEffects">Side Effects</Label>
                <Textarea
                  id="sideEffects"
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
                  placeholder="Dizziness, nausea..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interactions">Drug Interactions (comma separated)</Label>
                <Input
                  id="interactions"
                  value={formData.interactions}
                  onChange={(e) => setFormData({...formData, interactions: e.target.value})}
                  placeholder="Aspirin, Warfarin..."
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
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionManagement;