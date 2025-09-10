import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { dataManager, LabTest, Patient, Doctor } from '../../lib/dataManager';
import { TestTube, Plus, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import DataTable from '../shared/DataTable';

const LabTestManagement: React.FC = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [testsData, patientsData, doctorsData] = await Promise.all([
        dataManager.getLabTests(),
        dataManager.getPatients(),
        dataManager.getDoctors(),
      ]);
      
      setLabTests(testsData);
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
    test_name: '',
    test_type: '',
    test_date: new Date().toISOString().split('T')[0],
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    results: '',
    normal_range: '',
    notes: '',
    cost: 0,
    lab_technician: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.doctor_id || !formData.test_name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedLabTest) {
        // Update existing test
        const updated = await dataManager.updateLabTest(selectedLabTest.id, formData);
        if (updated) {
          setLabTests(prev => prev.map(test => test.id === selectedLabTest.id ? updated : test));
          toast({
            title: 'Success',
            description: 'Lab test updated successfully',
          });
        }
      } else {
        // Create new test
        const newTest = await dataManager.createLabTest(formData);
        setLabTests(prev => [...prev, newTest]);
        toast({
          title: 'Success',
          description: 'Lab test created successfully',
        });
      }
      
      setFormData({
        patient_id: '',
        doctor_id: '',
        test_name: '',
        test_type: '',
        test_date: new Date().toISOString().split('T')[0],
        priority: 'normal',
        status: 'pending',
        results: '',
        normal_range: '',
        notes: '',
        cost: 0,
        lab_technician: '',
      });
      setSelectedLabTest(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedLabTest ? 'update' : 'create'} lab test`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (labTest: LabTest) => {
    setSelectedLabTest(labTest);
    setFormData({
      patient_id: labTest.patient_id,
      doctor_id: labTest.doctor_id,
      test_name: labTest.test_name,
      test_type: labTest.test_type || '',
      test_date: labTest.test_date,
      priority: labTest.priority,
      status: labTest.status,
      results: labTest.results || '',
      normal_range: labTest.normal_range || '',
      notes: labTest.notes || '',
      cost: labTest.cost || 0,
      lab_technician: labTest.lab_technician || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (labTest: LabTest) => {
    try {
      const success = await dataManager.deleteLabTest(labTest.id);
      if (success) {
        setLabTests(prev => prev.filter(test => test.id !== labTest.id));
        toast({
          title: 'Success',
          description: 'Lab test deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lab test',
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      in_progress: { color: 'bg-blue-500', icon: AlertCircle },
      completed: { color: 'bg-green-500', icon: CheckCircle },
      cancelled: { color: 'bg-red-500', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-500',
      normal: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500',
    };

    return (
      <Badge className={`${colors[priority as keyof typeof colors] || colors.normal} text-white`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'test_name',
      label: 'Test Name',
      sortable: true,
    },
    {
      key: 'patient_id',
      label: 'Patient',
      render: (_, test: LabTest) => getPatientName(test.patient_id),
    },
    {
      key: 'doctor_id',
      label: 'Doctor',
      render: (_, test: LabTest) => getDoctorName(test.doctor_id),
    },
    {
      key: 'test_date',
      label: 'Test Date',
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (_, test: LabTest) => getPriorityBadge(test.priority),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, test: LabTest) => getStatusBadge(test.status),
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (value: number) => value ? `$${value.toFixed(2)}` : 'N/A',
    },
  ];

  const filteredTests = labTests.filter(test =>
    test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPatientName(test.patient_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDoctorName(test.doctor_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTests = labTests.filter(test => test.status === 'pending').length;
  const inProgressTests = labTests.filter(test => test.status === 'in_progress').length;
  const completedTests = labTests.filter(test => test.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading lab tests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{labTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        title="Lab Test Management"
        data={filteredTests}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setSelectedLabTest(null);
          setFormData({
            patient_id: '',
            doctor_id: '',
            test_name: '',
            test_type: '',
            test_date: new Date().toISOString().split('T')[0],
            priority: 'normal',
            status: 'pending',
            results: '',
            normal_range: '',
            notes: '',
            cost: 0,
            lab_technician: '',
          });
          setIsDialogOpen(true);
        }}
        addButtonText="Order Test"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLabTest ? 'Edit Lab Test' : 'Order New Lab Test'}
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
                <Label>Test Name *</Label>
                <Input
                  value={formData.test_name}
                  onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                  placeholder="Complete Blood Count"
                />
              </div>

              <div className="space-y-2">
                <Label>Test Type</Label>
                <Input
                  value={formData.test_type}
                  onChange={(e) => setFormData({...formData, test_type: e.target.value})}
                  placeholder="Blood"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Test Date</Label>
                <Input
                  type="date"
                  value={formData.test_date}
                  onChange={(e) => setFormData({...formData, test_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Lab Technician</Label>
                <Input
                  value={formData.lab_technician}
                  onChange={(e) => setFormData({...formData, lab_technician: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Normal Range</Label>
              <Input
                value={formData.normal_range}
                onChange={(e) => setFormData({...formData, normal_range: e.target.value})}
                placeholder="4.5-11.0 x10³/μL"
              />
            </div>

            <div className="space-y-2">
              <Label>Results</Label>
              <Textarea
                value={formData.results}
                onChange={(e) => setFormData({...formData, results: e.target.value})}
                placeholder="Test results..."
                rows={3}
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
                {selectedLabTest ? 'Update Test' : 'Order Test'}
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

export default LabTestManagement;