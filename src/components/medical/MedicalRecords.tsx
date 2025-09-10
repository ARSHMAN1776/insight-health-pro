import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { dataManager, MedicalRecord, Patient, Doctor } from '../../lib/dataManager';
import { FileText, Plus, Search, Calendar, User, Stethoscope } from 'lucide-react';
import DataTable from '../shared/DataTable';

const MedicalRecords: React.FC = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, patientsData, doctorsData] = await Promise.all([
        dataManager.getMedicalRecords(),
        dataManager.getPatients(),
        dataManager.getDoctors(),
      ]);
      
      setMedicalRecords(recordsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    follow_up_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.doctor_id || !formData.visit_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedRecord) {
        // Update existing record
        const updated = await dataManager.updateMedicalRecord(selectedRecord.id, formData);
        if (updated) {
          setMedicalRecords(prev => prev.map(record => record.id === selectedRecord.id ? updated : record));
          toast({
            title: 'Success',
            description: 'Medical record updated successfully',
          });
        }
      } else {
        // Create new record
        const newRecord = await dataManager.createMedicalRecord(formData);
        setMedicalRecords(prev => [...prev, newRecord]);
        toast({
          title: 'Success',
          description: 'Medical record created successfully',
        });
      }
      
      setFormData({
        patient_id: '',
        doctor_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
        follow_up_date: '',
      });
      setSelectedRecord(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedRecord ? 'update' : 'create'} medical record`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setFormData({
      patient_id: record.patient_id,
      doctor_id: record.doctor_id,
      visit_date: record.visit_date,
      symptoms: record.symptoms || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      medications: record.medications || '',
      notes: record.notes || '',
      follow_up_date: record.follow_up_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (record: MedicalRecord) => {
    try {
      const success = await dataManager.deleteMedicalRecord(record.id);
      if (success) {
        setMedicalRecords(prev => prev.filter(r => r.id !== record.id));
        toast({
          title: 'Success',
          description: 'Medical record deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete medical record',
        variant: 'destructive',
      });
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Unknown Doctor';
  };

  const columns = [
    {
      key: 'visit_date',
      label: 'Visit Date',
      sortable: true,
    },
    {
      key: 'patient_id',
      label: 'Patient',
      render: (_, record: MedicalRecord) => getPatientName(record.patient_id),
    },
    {
      key: 'doctor_id',
      label: 'Doctor',
      render: (_, record: MedicalRecord) => getDoctorName(record.doctor_id),
    },
    {
      key: 'diagnosis',
      label: 'Diagnosis',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'symptoms',
      label: 'Symptoms',
      render: (value: string) => value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : 'N/A',
    },
    {
      key: 'follow_up_date',
      label: 'Follow-up',
      render: (value: string) => value || 'None',
    },
  ];

  const filteredRecords = medicalRecords.filter(record =>
    getPatientName(record.patient_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDoctorName(record.doctor_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.symptoms && record.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading medical records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{medicalRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {medicalRecords.filter(record => {
                    const recordDate = new Date(record.visit_date);
                    const now = new Date();
                    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Follow-ups</p>
                <p className="text-2xl font-bold">
                  {medicalRecords.filter(record => record.follow_up_date).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        title="Medical Records"
        data={filteredRecords}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setSelectedRecord(null);
          setFormData({
            patient_id: '',
            doctor_id: '',
            visit_date: new Date().toISOString().split('T')[0],
            symptoms: '',
            diagnosis: '',
            treatment: '',
            medications: '',
            notes: '',
            follow_up_date: '',
          });
          setIsDialogOpen(true);
        }}
        addButtonText="Add Record"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? 'Edit Medical Record' : 'Add New Medical Record'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select value={formData.doctor_id} onValueChange={(value) => setFormData({...formData, doctor_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visit Date *</Label>
                <Input
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Symptoms</Label>
              <Textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                placeholder="Patient's symptoms..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                placeholder="Medical diagnosis..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Treatment</Label>
              <Textarea
                value={formData.treatment}
                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                placeholder="Treatment plan..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Medications</Label>
              <Textarea
                value={formData.medications}
                onChange={(e) => setFormData({...formData, medications: e.target.value})}
                placeholder="Prescribed medications..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {selectedRecord ? 'Update Record' : 'Add Record'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRecords;