import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DataTable from '@/components/shared/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, TestTube, Calendar, User, FileText } from 'lucide-react';
import { dataManager } from '@/lib/dataManager';
import type { LabTest } from '@/lib/dataManager';

const LabTestManagement: React.FC = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState(dataManager.getPatients());
  const [doctors, setDoctors] = useState(dataManager.getDoctors());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize sample data and load all data
    dataManager.initializeSampleData();
    setLabTests(dataManager.getLabTests());
    setPatients(dataManager.getPatients());
    setDoctors(dataManager.getDoctors());
  }, []);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    testName: '',
    testType: 'blood' as LabTest['testType'],
    category: 'hematology' as LabTest['category'],
    orderDate: '',
    sampleCollectedDate: '',
    reportDate: '',
    results: '',
    normalRange: '',
    interpretation: '',
    priority: 'routine' as LabTest['priority'],
    fastingRequired: false,
    instructions: '',
    cost: '',
    labTechnician: ''
  });


  const filteredLabTests = labTests.filter(test =>
    test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.doctorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const labTestData = {
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        createdBy: 'current-user'
      };

      if (selectedLabTest) {
        const updated = dataManager.updateLabTest(selectedLabTest.id, labTestData);
        setLabTests(dataManager.getLabTests());
        toast({ title: 'Success', description: 'Lab test updated successfully' });
      } else {
        const newLabTest = dataManager.createLabTest(labTestData);
        setLabTests(dataManager.getLabTests());
        toast({ title: 'Success', description: 'Lab test created successfully' });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save lab test', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      testName: '',
      testType: 'blood',
      category: 'hematology',
      orderDate: '',
      sampleCollectedDate: '',
      reportDate: '',
      results: '',
      normalRange: '',
      interpretation: '',
      priority: 'routine',
      fastingRequired: false,
      instructions: '',
      cost: '',
      labTechnician: ''
    });
    setSelectedLabTest(null);
  };

  const handleEdit = (labTest: LabTest) => {
    setSelectedLabTest(labTest);
    setFormData({
      patientId: labTest.patientId,
      doctorId: labTest.doctorId,
      testName: labTest.testName,
      testType: labTest.testType,
      category: labTest.category,
      orderDate: labTest.orderDate,
      sampleCollectedDate: labTest.sampleCollectedDate || '',
      reportDate: labTest.reportDate || '',
      results: labTest.results || '',
      normalRange: labTest.normalRange || '',
      interpretation: labTest.interpretation || '',
      priority: labTest.priority,
      fastingRequired: labTest.fastingRequired,
      instructions: labTest.instructions,
      cost: labTest.cost.toString(),
      labTechnician: labTest.labTechnician || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dataManager.deleteLabTest(id);
    setLabTests(dataManager.getLabTests());
    toast({ title: 'Success', description: 'Lab test deleted successfully' });
  };

  const getStatusBadge = (status: LabTest['status']) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    
    const variants = {
      ordered: 'secondary',
      sample_collected: 'outline',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const;
    
    return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: LabTest['priority']) => {
    const variants = {
      routine: 'secondary',
      urgent: 'destructive',
      stat: 'destructive'
    } as const;
    
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const columns = [
    { key: 'testId', label: 'Test ID' },
    { 
      key: 'patientName', 
      label: 'Patient',
      render: (test: LabTest) => {
        if (!test || !test.patientId) return <span className="text-muted-foreground">Unknown Patient</span>;
        const patient = patients.find(p => p?.id === test.patientId);
        if (!patient) return <span className="text-muted-foreground">Patient Not Found</span>;
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
        return fullName || <span className="text-muted-foreground">No Name</span>;
      }
    },
    { 
      key: 'doctorName', 
      label: 'Doctor',
      render: (test: LabTest) => {
        if (!test || !test.doctorId) return <span className="text-muted-foreground">Unknown Doctor</span>;
        const doctor = doctors.find(d => d?.id === test.doctorId);
        if (!doctor) return <span className="text-muted-foreground">Doctor Not Found</span>;
        const fullName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
        return fullName || <span className="text-muted-foreground">No Name</span>;
      }
    },
    { key: 'testName', label: 'Test Name' },
    { key: 'category', label: 'Category' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (test: LabTest) => getPriorityBadge(test.priority)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (test: LabTest) => getStatusBadge(test.status)
    },
    { key: 'orderDate', label: 'Order Date' },
    { key: 'cost', label: 'Cost', render: (test: LabTest) => `$${test.cost}` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lab Test Management</h1>
          <p className="text-muted-foreground">Manage patient lab tests and results</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Lab Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedLabTest ? 'Edit Lab Test' : 'Create New Lab Test'}
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
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={formData.testName}
                    onChange={(e) => setFormData({...formData, testName: e.target.value})}
                    placeholder="e.g., Complete Blood Count"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select value={formData.testType} onValueChange={(value: LabTest['testType']) => setFormData({...formData, testType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood">Blood</SelectItem>
                      <SelectItem value="urine">Urine</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="biopsy">Biopsy</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: LabTest['category']) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hematology">Hematology</SelectItem>
                      <SelectItem value="biochemistry">Biochemistry</SelectItem>
                      <SelectItem value="microbiology">Microbiology</SelectItem>
                      <SelectItem value="pathology">Pathology</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: LabTest['priority']) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleCollectedDate">Sample Collected</Label>
                  <Input
                    id="sampleCollectedDate"
                    type="date"
                    value={formData.sampleCollectedDate}
                    onChange={(e) => setFormData({...formData, sampleCollectedDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportDate">Report Date</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={formData.reportDate}
                    onChange={(e) => setFormData({...formData, reportDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labTechnician">Lab Technician</Label>
                  <Input
                    id="labTechnician"
                    value={formData.labTechnician}
                    onChange={(e) => setFormData({...formData, labTechnician: e.target.value})}
                    placeholder="Technician name"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fastingRequired"
                  checked={formData.fastingRequired}
                  onChange={(e) => setFormData({...formData, fastingRequired: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="fastingRequired">Fasting Required</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Test preparation instructions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="results">Results</Label>
                <Textarea
                  id="results"
                  value={formData.results}
                  onChange={(e) => setFormData({...formData, results: e.target.value})}
                  placeholder="Test results..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="normalRange">Normal Range</Label>
                  <Input
                    id="normalRange"
                    value={formData.normalRange}
                    onChange={(e) => setFormData({...formData, normalRange: e.target.value})}
                    placeholder="e.g., 4.5-11.0 x10³/µL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interpretation">Interpretation</Label>
                  <Input
                    id="interpretation"
                    value={formData.interpretation}
                    onChange={(e) => setFormData({...formData, interpretation: e.target.value})}
                    placeholder="Normal, High, Low, etc."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedLabTest ? 'Update' : 'Create'} Lab Test
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
              <TestTube className="h-5 w-5" />
              All Lab Tests
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lab tests..."
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
            title="Lab Tests"
            data={filteredLabTests}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={() => {
              setSelectedLabTest(null);
              resetForm();
              setIsDialogOpen(true);
            }}
            addButtonText="New Lab Test"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LabTestManagement;