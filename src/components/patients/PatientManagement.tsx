import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { dataManager, Patient } from '../../lib/dataManager';
import { Users, UserPlus, Search, Activity, Calendar, Heart } from 'lucide-react';
import DataTable from '../shared/DataTable';
import PatientRegistrationForm from '../forms/PatientRegistrationForm';

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await dataManager.getPatients();
      setPatients(patientsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const handleDelete = async (patient: Patient) => {
    try {
      const success = await dataManager.deletePatient(patient.id);
      if (success) {
        setPatients(prev => prev.filter(p => p.id !== patient.id));
        toast({
          title: 'Success',
          description: 'Patient deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete patient',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPatient(null);
    loadPatients(); // Refresh the list after adding/editing
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      discharged: 'bg-blue-500',
    };

    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors.active} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      sortable: true,
      render: (_, patient: Patient) => `${patient.first_name} ${patient.last_name}`,
    },
    {
      key: 'date_of_birth',
      label: 'Age',
      render: (value: string) => calculateAge(value),
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'blood_type',
      label: 'Blood Type',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, patient: Patient) => getStatusBadge(patient.status),
    },
  ];

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const activePatients = patients.filter(p => p.status === 'active').length;
  const totalPatients = patients.length;
  const averageAge = patients.length > 0 
    ? Math.round(patients.reduce((sum, p) => sum + calculateAge(p.date_of_birth), 0) / patients.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading patients...</div>
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
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold">{activePatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Average Age</p>
                <p className="text-2xl font-bold">{averageAge}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">
                  {patients.filter(patient => {
                    const createdDate = new Date(patient.created_at);
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        title="Patient Management"
        data={filteredPatients}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setSelectedPatient(null);
          setIsDialogOpen(true);
        }}
        addButtonText="Add Patient"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
            </DialogTitle>
          </DialogHeader>
          
          <PatientRegistrationForm
            onClose={handleDialogClose}
            editData={selectedPatient}
            mode={selectedPatient ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagement;