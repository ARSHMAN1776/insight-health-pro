import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { FileText, Plus, Eye, Download, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '../../hooks/use-toast';
import { dataManager, MedicalRecord } from '../../lib/dataManager';
import DataTable, { Column } from '../shared/DataTable';

const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  visitType: z.enum(['emergency', 'routine', 'follow-up', 'surgery', 'consultation']),
  symptoms: z.string().min(1, 'Symptoms are required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment: z.string().min(1, 'Treatment is required'),
  prescription: z.string().optional(),
  labResults: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean(),
  followUpDate: z.string().optional(),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>(dataManager.getMedicalRecords());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      visitDate: '',
      visitType: 'consultation',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      labResults: '',
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      notes: '',
      followUpRequired: false,
      followUpDate: '',
    },
  });

  const patients = dataManager.getPatients();
  const doctors = dataManager.getDoctors();

  const onSubmit = async (data: MedicalRecordFormData) => {
    try {
      const recordData = {
        ...data,
        vitalSigns: {
          bloodPressure: data.bloodPressure || '',
          heartRate: data.heartRate || '',
          temperature: data.temperature || '',
          weight: data.weight || '',
          height: data.height || '',
        },
        createdBy: 'current_user',
      };

      // Remove vital signs fields from the main object
      const { bloodPressure, heartRate, temperature, weight, height, ...cleanData } = recordData;

      const newRecord = dataManager.createMedicalRecord(cleanData as Required<typeof cleanData>);
      setRecords(dataManager.getMedicalRecords());
      
      toast({
        title: 'Success',
        description: `Medical record created successfully with ID: ${newRecord.recordId}`,
      });
      
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create medical record',
        variant: 'destructive',
      });
    }
  };

  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const exportRecord = (record: MedicalRecord) => {
    const patient = patients.find(p => p.id === record.patientId);
    const doctor = doctors.find(d => d.id === record.doctorId);
    
    const content = `
MEDICAL RECORD
================

Record ID: ${record.recordId}
Date: ${new Date(record.visitDate).toLocaleDateString()}

PATIENT INFORMATION
Patient: ${patient?.firstName} ${patient?.lastName}
Patient ID: ${patient?.patientId}

DOCTOR INFORMATION  
Doctor: ${doctor?.firstName} ${doctor?.lastName}
Specialty: ${doctor?.specialty}

VISIT DETAILS
Type: ${record.visitType}
Symptoms: ${record.symptoms}
Diagnosis: ${record.diagnosis}
Treatment: ${record.treatment}

${record.prescription ? `PRESCRIPTION\n${record.prescription}\n` : ''}

${record.vitalSigns ? `VITAL SIGNS
Blood Pressure: ${record.vitalSigns.bloodPressure}
Heart Rate: ${record.vitalSigns.heartRate}
Temperature: ${record.vitalSigns.temperature}
Weight: ${record.vitalSigns.weight}
Height: ${record.vitalSigns.height}
` : ''}

${record.labResults ? `LAB RESULTS\n${record.labResults}\n` : ''}

${record.notes ? `NOTES\n${record.notes}\n` : ''}

${record.followUpRequired ? `FOLLOW UP\nRequired: Yes\nDate: ${record.followUpDate || 'TBD'}\n` : ''}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_record_${record.recordId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getVisitTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'surgery': return 'default';
      case 'consultation': return 'secondary';
      case 'routine': return 'outline';
      case 'follow-up': return 'outline';
      default: return 'default';
    }
  };

  const columns: Column[] = [
    {
      key: 'recordId',
      label: 'Record ID',
      sortable: true,
    },
    {
      key: 'patientId',
      label: 'Patient',
      render: (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
      },
    },
    {
      key: 'doctorId',
      label: 'Doctor',
      render: (doctorId) => {
        const doctor = doctors.find(d => d.id === doctorId);
        return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown';
      },
    },
    {
      key: 'visitDate',
      label: 'Date',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: 'visitType',
      label: 'Type',
      render: (type) => (
        <Badge variant={getVisitTypeBadgeVariant(type)}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'diagnosis',
      label: 'Diagnosis',
      render: (diagnosis) => diagnosis.length > 50 ? `${diagnosis.substring(0, 50)}...` : diagnosis,
    },
    {
      key: 'followUpRequired',
      label: 'Follow-up',
      render: (required) => required ? <Badge variant="outline">Required</Badge> : <Badge variant="secondary">None</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-medical-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-xl font-bold">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-medical-green" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold">
                  {records.filter(r => {
                    const recordDate = new Date(r.visitDate);
                    const now = new Date();
                    return recordDate.getMonth() === now.getMonth() && 
                           recordDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-medical-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Emergency Visits</p>
                <p className="text-xl font-bold">
                  {records.filter(r => r.visitType === 'emergency').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-medical-orange" />
              <div>
                <p className="text-sm text-muted-foreground">Follow-ups Required</p>
                <p className="text-xl font-bold">
                  {records.filter(r => r.followUpRequired).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Records Table */}
      <DataTable
        title="Medical Records"
        columns={columns}
        data={records}
        onView={handleView}
        onAdd={() => {
          form.reset();
          setIsDialogOpen(true);
        }}
        addButtonText="New Medical Record"
      />

      {/* Add Medical Record Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Medical Record</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName} ({patient.patientId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="visitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="routine">Routine Checkup</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Medical Details */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe patient symptoms..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Medical diagnosis..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="treatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Treatment plan..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescription</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Prescribed medications..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vital Signs */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vital Signs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodPressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Pressure</FormLabel>
                        <FormControl>
                          <Input placeholder="120/80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heart Rate (bpm)</FormLabel>
                        <FormControl>
                          <Input placeholder="72" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°F)</FormLabel>
                        <FormControl>
                          <Input placeholder="98.6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (inches)</FormLabel>
                        <FormControl>
                          <Input placeholder="70" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="labResults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab Results</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Lab test results..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Follow-up */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="followUpRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <FormLabel>Follow-up appointment required</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch('followUpRequired') && (
                  <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Save Medical Record
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Medical Record Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Medical Record Details
              {selectedRecord && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportRecord(selectedRecord)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Record ID</label>
                  <p className="text-lg font-semibold">{selectedRecord.recordId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-lg">{new Date(selectedRecord.visitDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient</label>
                  <p className="text-lg">
                    {(() => {
                      const patient = patients.find(p => p.id === selectedRecord.patientId);
                      return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
                    })()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Doctor</label>
                  <p className="text-lg">
                    {(() => {
                      const doctor = doctors.find(d => d.id === selectedRecord.doctorId);
                      return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown';
                    })()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Visit Type</label>
                <Badge variant={getVisitTypeBadgeVariant(selectedRecord.visitType)} className="ml-2">
                  {selectedRecord.visitType.charAt(0).toUpperCase() + selectedRecord.visitType.slice(1)}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Symptoms</label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.symptoms}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.diagnosis}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Treatment</label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.treatment}</p>
              </div>

              {selectedRecord.prescription && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prescription</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.prescription}</p>
                </div>
              )}

              {selectedRecord.vitalSigns && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vital Signs</label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Pressure</p>
                      <p className="font-medium">{selectedRecord.vitalSigns.bloodPressure}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Heart Rate</p>
                      <p className="font-medium">{selectedRecord.vitalSigns.heartRate} bpm</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="font-medium">{selectedRecord.vitalSigns.temperature}°F</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-medium">{selectedRecord.vitalSigns.weight} lbs</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Height</p>
                      <p className="font-medium">{selectedRecord.vitalSigns.height} inches</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRecord.labResults && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lab Results</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.labResults}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.notes}</p>
                </div>
              )}

              {selectedRecord.followUpRequired && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Follow-up</label>
                  <div className="mt-1">
                    <Badge variant="outline">Required</Badge>
                    {selectedRecord.followUpDate && (
                      <span className="ml-2">Scheduled for: {new Date(selectedRecord.followUpDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRecords;