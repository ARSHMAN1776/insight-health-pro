import React, { useState, useEffect, useRef } from 'react';
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
import { Search, Plus, Pill, Calendar, User, FileText, Printer, Eye, Lock } from 'lucide-react';
import { dataManager } from '@/lib/dataManager';
import type { Prescription } from '@/lib/dataManager';
import { useAuth } from '@/contexts/AuthContext';

const PrescriptionManagement: React.FC = () => {
  const { user, isRole } = useAuth();
  const canManagePrescriptions = isRole('doctor') || isRole('admin');
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPrescriptionViewOpen, setIsPrescriptionViewOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const prescriptionRef = useRef<HTMLDivElement>(null);
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
    if (!canManagePrescriptions) {
      toast({ title: 'Access Denied', description: 'Only doctors can edit prescriptions', variant: 'destructive' });
      return;
    }
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
    if (!canManagePrescriptions) {
      toast({ title: 'Access Denied', description: 'Only doctors can delete prescriptions', variant: 'destructive' });
      return;
    }
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

  const handleViewPrescription = (prescription: Prescription) => {
    setViewPrescription(prescription);
    setIsPrescriptionViewOpen(true);
  };

  const handlePrintPrescription = () => {
    if (prescriptionRef.current && viewPrescription) {
      const patient = patients.find(p => p?.id === viewPrescription.patient_id);
      const doctor = doctors.find(d => d?.id === viewPrescription.doctor_id);
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Prescription - ${patient?.first_name || 'Patient'} ${patient?.last_name || ''}</title>
              <style>
                @page { margin: 20mm; size: A4; }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                  font-family: 'Times New Roman', Georgia, serif; 
                  padding: 0; 
                  max-width: 210mm; 
                  margin: 0 auto; 
                  background: #fff;
                  color: #1a1a1a;
                  line-height: 1.5;
                }
                .prescription-container {
                  border: 3px double #0066cc;
                  padding: 30px;
                  min-height: 297mm;
                  position: relative;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #0066cc;
                  padding-bottom: 20px;
                  margin-bottom: 25px;
                }
                .hospital-name {
                  font-size: 28px;
                  font-weight: bold;
                  color: #0066cc;
                  margin-bottom: 5px;
                  letter-spacing: 2px;
                }
                .hospital-tagline {
                  font-size: 12px;
                  color: #666;
                  font-style: italic;
                }
                .hospital-contact {
                  font-size: 11px;
                  color: #444;
                  margin-top: 8px;
                }
                .rx-symbol {
                  font-size: 48px;
                  color: #0066cc;
                  font-weight: bold;
                  font-family: serif;
                  position: absolute;
                  top: 100px;
                  left: 40px;
                }
                .doctor-info {
                  text-align: right;
                  margin-bottom: 20px;
                  padding: 15px;
                  background: #f8fafc;
                  border-radius: 8px;
                }
                .doctor-name {
                  font-size: 18px;
                  font-weight: bold;
                  color: #1a1a1a;
                }
                .doctor-details {
                  font-size: 12px;
                  color: #555;
                }
                .patient-section {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 25px;
                  padding: 15px;
                  background: #f0f9ff;
                  border-radius: 8px;
                  border-left: 4px solid #0066cc;
                }
                .patient-info p, .prescription-date p {
                  margin: 4px 0;
                  font-size: 13px;
                }
                .patient-info strong, .prescription-date strong {
                  color: #0066cc;
                }
                .medication-section {
                  margin: 30px 0;
                  padding-left: 60px;
                }
                .medication-header {
                  font-size: 16px;
                  font-weight: bold;
                  color: #0066cc;
                  margin-bottom: 15px;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 5px;
                }
                .medication-item {
                  background: #fff;
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  padding: 20px;
                  margin-bottom: 15px;
                }
                .medication-name {
                  font-size: 20px;
                  font-weight: bold;
                  color: #1a1a1a;
                  margin-bottom: 10px;
                }
                .medication-details {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 15px;
                  margin-bottom: 15px;
                }
                .detail-box {
                  background: #f8fafc;
                  padding: 10px;
                  border-radius: 5px;
                  text-align: center;
                }
                .detail-label {
                  font-size: 10px;
                  color: #666;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .detail-value {
                  font-size: 14px;
                  font-weight: bold;
                  color: #1a1a1a;
                  margin-top: 3px;
                }
                .instructions-box {
                  background: #fffbeb;
                  border: 1px solid #f59e0b;
                  border-radius: 5px;
                  padding: 12px;
                  margin-top: 10px;
                }
                .instructions-label {
                  font-size: 11px;
                  color: #b45309;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .instructions-text {
                  font-size: 13px;
                  color: #1a1a1a;
                }
                .warnings-section {
                  margin-top: 20px;
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                }
                .warning-box {
                  padding: 12px;
                  border-radius: 5px;
                  font-size: 12px;
                }
                .side-effects {
                  background: #fef2f2;
                  border: 1px solid #ef4444;
                }
                .side-effects-label {
                  color: #dc2626;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .drug-interactions {
                  background: #fef3c7;
                  border: 1px solid #f59e0b;
                }
                .drug-interactions-label {
                  color: #d97706;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .signature-section {
                  margin-top: 50px;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                }
                .signature-box {
                  text-align: center;
                  width: 200px;
                }
                .signature-line {
                  border-top: 1px solid #333;
                  margin-bottom: 5px;
                  margin-top: 50px;
                }
                .signature-label {
                  font-size: 11px;
                  color: #666;
                }
                .footer {
                  position: absolute;
                  bottom: 20px;
                  left: 30px;
                  right: 30px;
                  text-align: center;
                  font-size: 10px;
                  color: #888;
                  border-top: 1px solid #ddd;
                  padding-top: 10px;
                }
                .validity {
                  font-size: 11px;
                  color: #666;
                  font-style: italic;
                }
                @media print {
                  body { padding: 0; }
                  .prescription-container { border: 3px double #0066cc; }
                }
              </style>
            </head>
            <body>
              <div class="prescription-container">
                <div class="header">
                  <div class="hospital-name">HOSPITAL MANAGEMENT SYSTEM</div>
                  <div class="hospital-tagline">Excellence in Healthcare</div>
                  <div class="hospital-contact">
                    123 Medical Center Drive, Healthcare City | Tel: (555) 123-4567 | Email: info@hospital.com
                  </div>
                </div>
                
                <div class="rx-symbol">℞</div>
                
                <div class="doctor-info">
                  <div class="doctor-name">Dr. ${doctor?.first_name || ''} ${doctor?.last_name || ''}</div>
                  <div class="doctor-details">
                    ${doctor?.specialization || 'General Physician'}<br>
                    License No: ${doctor?.license_number || 'N/A'}<br>
                    ${doctor?.email || ''} | ${doctor?.phone || ''}
                  </div>
                </div>
                
                <div class="patient-section">
                  <div class="patient-info">
                    <p><strong>Patient Name:</strong> ${patient?.first_name || ''} ${patient?.last_name || ''}</p>
                    <p><strong>Gender:</strong> ${patient?.gender || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> ${patient?.date_of_birth || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${patient?.phone || 'N/A'}</p>
                  </div>
                  <div class="prescription-date">
                    <p><strong>Prescription ID:</strong> ${viewPrescription.id?.substring(0, 8).toUpperCase() || 'N/A'}</p>
                    <p><strong>Date:</strong> ${viewPrescription.date_prescribed || new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${(viewPrescription.status || 'active').toUpperCase()}</p>
                  </div>
                </div>
                
                <div class="medication-section">
                  <div class="medication-header">PRESCRIBED MEDICATION</div>
                  <div class="medication-item">
                    <div class="medication-name">${viewPrescription.medication_name || 'N/A'}</div>
                    <div class="medication-details">
                      <div class="detail-box">
                        <div class="detail-label">Dosage</div>
                        <div class="detail-value">${viewPrescription.dosage || 'As directed'}</div>
                      </div>
                      <div class="detail-box">
                        <div class="detail-label">Frequency</div>
                        <div class="detail-value">${viewPrescription.frequency || 'As directed'}</div>
                      </div>
                      <div class="detail-box">
                        <div class="detail-label">Duration</div>
                        <div class="detail-value">${viewPrescription.duration || 'As directed'}</div>
                      </div>
                    </div>
                    <div class="medication-details">
                      <div class="detail-box">
                        <div class="detail-label">Quantity</div>
                        <div class="detail-value">${viewPrescription.quantity || 'N/A'} units</div>
                      </div>
                    </div>
                    ${viewPrescription.instructions ? `
                    <div class="instructions-box">
                      <div class="instructions-label">⚠ INSTRUCTIONS</div>
                      <div class="instructions-text">${viewPrescription.instructions}</div>
                    </div>
                    ` : ''}
                    
                    ${(viewPrescription.side_effects || viewPrescription.drug_interactions) ? `
                    <div class="warnings-section">
                      ${viewPrescription.side_effects ? `
                      <div class="warning-box side-effects">
                        <div class="side-effects-label">⚠ POSSIBLE SIDE EFFECTS</div>
                        <div>${viewPrescription.side_effects}</div>
                      </div>
                      ` : ''}
                      ${viewPrescription.drug_interactions ? `
                      <div class="warning-box drug-interactions">
                        <div class="drug-interactions-label">⚠ DRUG INTERACTIONS</div>
                        <div>${viewPrescription.drug_interactions}</div>
                      </div>
                      ` : ''}
                    </div>
                    ` : ''}
                  </div>
                </div>
                
                <div class="signature-section">
                  <div class="validity">
                    This prescription is valid for 30 days from the date of issue.
                  </div>
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-label">Doctor's Signature & Stamp</div>
                  </div>
                </div>
                
                <div class="footer">
                  This is a computer-generated prescription. Please verify the details before dispensing medication.<br>
                  For any queries, please contact the hospital pharmacy at (555) 123-4567 ext. 100
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
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
    { 
      key: 'actions', 
      label: 'View',
      render: (prescription: Prescription) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewPrescription(prescription);
          }}
          title="View & Print Prescription"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescription Management</h1>
          <p className="text-muted-foreground">Manage patient prescriptions and medications</p>
        </div>
        {canManagePrescriptions ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scroll-smooth">
            <DialogHeader>
              <DialogTitle>
                {selectedPrescription ? 'Edit Prescription' : 'Create New Prescription'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient</Label>
                  <Select 
                    value={formData.patient_id} 
                    onValueChange={(value) => setFormData({...formData, patient_id: value})}
                    onOpenChange={() => {
                      setTimeout(() => {
                        const element = document.querySelector('[data-field="patient_id"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                  >
                    <SelectTrigger data-field="patient_id">
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
                  <Select 
                    value={formData.doctor_id} 
                    onValueChange={(value) => setFormData({...formData, doctor_id: value})}
                    onOpenChange={() => {
                      setTimeout(() => {
                        const element = document.querySelector('[data-field="doctor_id"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                  >
                    <SelectTrigger data-field="doctor_id">
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
                    data-field="medication_name"
                    value={formData.medication_name}
                    onChange={(e) => setFormData({...formData, medication_name: e.target.value})}
                    onFocus={() => {
                      setTimeout(() => {
                        const element = document.querySelector('[data-field="medication_name"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    placeholder="e.g., Lisinopril"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    data-field="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    onFocus={() => {
                      setTimeout(() => {
                        const element = document.querySelector('[data-field="dosage"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
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
                    data-field="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    onFocus={() => {
                      setTimeout(() => {
                        const element = document.querySelector('[data-field="frequency"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    placeholder="e.g., Once daily"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    data-field="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    onFocus={() => {
                      setTimeout(() => {
                        const element = document.querySelector('[data-field="duration"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    placeholder="e.g., 30 days"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    data-field="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    onFocus={() => {
                      setTimeout(() => {
                        const element = document.querySelector('[data-field="quantity"]');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    placeholder="30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  data-field="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  onFocus={() => {
                    setTimeout(() => {
                      const element = document.querySelector('[data-field="instructions"]');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  placeholder="Take with food, avoid alcohol..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="side_effects">Side Effects</Label>
                <Textarea
                  id="side_effects"
                  data-field="side_effects"
                  value={formData.side_effects}
                  onChange={(e) => setFormData({...formData, side_effects: e.target.value})}
                  onFocus={() => {
                    setTimeout(() => {
                      const element = document.querySelector('[data-field="side_effects"]');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  placeholder="Dizziness, nausea..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drug_interactions">Drug Interactions</Label>
                <Textarea
                  id="drug_interactions"
                  data-field="drug_interactions"
                  value={formData.drug_interactions}
                  onChange={(e) => setFormData({...formData, drug_interactions: e.target.value})}
                  onFocus={() => {
                    setTimeout(() => {
                      const element = document.querySelector('[data-field="drug_interactions"]');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
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
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
            <Lock className="h-3.5 w-3.5" />
            View Only
          </Badge>
        )}
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
            onEdit={canManagePrescriptions ? handleEdit : undefined}
            onDelete={canManagePrescriptions ? handleDelete : undefined}
            onAdd={canManagePrescriptions ? () => {
              setSelectedPrescription(null);
              resetForm();
              setIsDialogOpen(true);
            } : undefined}
            addButtonText="New Prescription"
          />
        </CardContent>
      </Card>

      {/* Prescription View/Print Dialog */}
      <Dialog open={isPrescriptionViewOpen} onOpenChange={setIsPrescriptionViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prescription Details
              </span>
              <Button variant="outline" size="sm" onClick={handlePrintPrescription}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {viewPrescription && (
            <div ref={prescriptionRef} className="space-y-6 p-4 border-2 border-primary/20 rounded-lg bg-card">
              {/* Header */}
              <div className="text-center border-b-2 border-primary pb-4">
                <h1 className="text-2xl font-bold text-primary">HOSPITAL MANAGEMENT SYSTEM</h1>
                <p className="text-sm text-muted-foreground italic">Excellence in Healthcare</p>
                <p className="text-xs text-muted-foreground mt-1">
                  123 Medical Center Drive, Healthcare City | Tel: (555) 123-4567
                </p>
              </div>

              {/* Rx Symbol & Doctor Info */}
              <div className="flex justify-between items-start">
                <div className="text-5xl font-bold text-primary font-serif">℞</div>
                <div className="text-right bg-muted/50 p-3 rounded-lg">
                  {(() => {
                    const doctor = doctors.find(d => d?.id === viewPrescription.doctor_id);
                    return (
                      <>
                        <p className="font-bold text-lg">Dr. {doctor?.first_name || ''} {doctor?.last_name || ''}</p>
                        <p className="text-sm text-muted-foreground">{doctor?.specialization || 'General Physician'}</p>
                        <p className="text-xs text-muted-foreground">License: {doctor?.license_number || 'N/A'}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const patient = patients.find(p => p?.id === viewPrescription.patient_id);
                    return (
                      <>
                        <div>
                          <p><span className="text-primary font-semibold">Patient Name:</span> {patient?.first_name || ''} {patient?.last_name || ''}</p>
                          <p><span className="text-primary font-semibold">Gender:</span> {patient?.gender || 'N/A'}</p>
                          <p><span className="text-primary font-semibold">DOB:</span> {patient?.date_of_birth || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p><span className="text-primary font-semibold">Rx ID:</span> {viewPrescription.id?.substring(0, 8).toUpperCase()}</p>
                          <p><span className="text-primary font-semibold">Date:</span> {viewPrescription.date_prescribed || 'N/A'}</p>
                          <Badge variant={viewPrescription.status === 'active' ? 'default' : 'secondary'}>
                            {viewPrescription.status?.toUpperCase()}
                          </Badge>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Medication Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-primary border-b pb-2">PRESCRIBED MEDICATION</h3>
                <div className="bg-card border rounded-lg p-4 space-y-4">
                  <p className="text-xl font-bold">{viewPrescription.medication_name}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-3 rounded text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Dosage</p>
                      <p className="font-bold">{viewPrescription.dosage || 'As directed'}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Frequency</p>
                      <p className="font-bold">{viewPrescription.frequency || 'As directed'}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
                      <p className="font-bold">{viewPrescription.duration || 'As directed'}</p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded text-center w-fit">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p>
                    <p className="font-bold">{viewPrescription.quantity || 'N/A'} units</p>
                  </div>

                  {viewPrescription.instructions && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 p-3 rounded">
                      <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">⚠ INSTRUCTIONS</p>
                      <p className="text-sm mt-1">{viewPrescription.instructions}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {viewPrescription.side_effects && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-700 p-3 rounded">
                        <p className="text-red-700 dark:text-red-400 font-bold text-sm">⚠ SIDE EFFECTS</p>
                        <p className="text-sm mt-1">{viewPrescription.side_effects}</p>
                      </div>
                    )}
                    {viewPrescription.drug_interactions && (
                      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-700 p-3 rounded">
                        <p className="text-orange-700 dark:text-orange-400 font-bold text-sm">⚠ DRUG INTERACTIONS</p>
                        <p className="text-sm mt-1">{viewPrescription.drug_interactions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="flex justify-between items-end pt-8">
                <p className="text-xs text-muted-foreground italic">
                  This prescription is valid for 30 days from the date of issue.
                </p>
                <div className="text-center">
                  <div className="border-t border-foreground w-48 mb-1 mt-10"></div>
                  <p className="text-xs text-muted-foreground">Doctor's Signature & Stamp</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground border-t pt-3">
                This is a computer-generated prescription. Please verify the details before dispensing medication.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionManagement;