import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  Heart,
  Shield,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import DataTable from '../shared/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { dataManager, Patient } from '../../lib/dataManager';
import PatientRegistrationForm from '../forms/PatientRegistrationForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize sample data and load patients
    dataManager.initializeSampleData();
    loadPatients();
  }, []);

  const loadPatients = () => {
    const allPatients = dataManager.getPatients();
    setPatients(allPatients);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const handleDelete = (patientId: string) => {
    if (dataManager.deletePatient(patientId)) {
      loadPatients();
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete patient',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPatient(undefined);
    loadPatients();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'discharged': return 'secondary';
      case 'deceased': return 'destructive';
      default: return 'outline';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'female': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'other': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesActiveFilter = !showActiveOnly || patient.status === 'active';
    
    return matchesSearch && matchesStatus && matchesActiveFilter;
  });

  // Calculate statistics
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const dischargedPatients = patients.filter(p => p.status === 'discharged').length;
  const newPatientsThisMonth = patients.filter(p => {
    const patientDate = new Date(p.createdAt);
    const currentMonth = new Date();
    return patientDate.getMonth() === currentMonth.getMonth() && 
           patientDate.getFullYear() === currentMonth.getFullYear();
  }).length;

  const columns = [
    {
      key: 'select',
      label: '',
      render: (patient: Patient) => (
        <Checkbox
          checked={selectedPatients.includes(patient.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedPatients([...selectedPatients, patient.id]);
            } else {
              setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
            }
          }}
        />
      )
    },
    {
      key: 'patientId',
      label: 'Patient ID',
      sortable: true,
      render: (patient: Patient) => (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-medical-blue to-medical-green"></div>
          <span className="font-mono text-sm font-semibold text-medical-blue">{patient.patientId}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Full Name',
      sortable: true,
      render: (patient: Patient) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-medical-purple to-medical-blue flex items-center justify-center text-white font-bold">
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-foreground">{patient.firstName} {patient.lastName}</div>
            <div className="text-sm text-muted-foreground flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>{patient.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (patient: Patient) => (
        <Badge variant="outline" className={`capitalize ${getGenderColor(patient.gender)}`}>
          {patient.gender}
        </Badge>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (patient: Patient) => (
        <div className="flex items-center space-x-2 px-3 py-1 bg-medical-green/10 rounded-lg border border-medical-green/20">
          <Phone className="w-4 h-4 text-medical-green" />
          <span className="text-sm font-medium">{patient.phone}</span>
        </div>
      )
    },
    {
      key: 'dateOfBirth',
      label: 'Age',
      sortable: true,
      render: (patient: Patient) => {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-medical-orange" />
            <span className="font-semibold text-medical-orange">{age} years</span>
          </div>
        );
      }
    },
    {
      key: 'bloodType',
      label: 'Blood Type',
      render: (patient: Patient) => patient.bloodType ? (
        <div className="flex items-center space-x-2 px-2 py-1 bg-medical-red/10 rounded-full border border-medical-red/20">
          <Heart className="w-4 h-4 text-medical-red" />
          <span className="font-bold text-medical-red">{patient.bloodType}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      )
    },
    {
      key: 'insuranceProvider',
      label: 'Insurance',
      render: (patient: Patient) => patient.insuranceProvider ? (
        <div className="flex items-center space-x-2 px-2 py-1 bg-medical-purple/10 rounded-lg border border-medical-purple/20">
          <Shield className="w-4 h-4 text-medical-purple" />
          <span className="text-sm font-medium text-medical-purple">{patient.insuranceProvider}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">No Insurance</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (patient: Patient) => (
        <Badge variant={getStatusBadgeVariant(patient.status)} className="capitalize">
          {patient.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (patient: Patient) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(patient)}
            className="hover:bg-medical-blue/10 hover:text-medical-blue"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(patient.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Gradient */}
      <div className="bg-gradient-to-r from-medical-blue via-medical-purple to-medical-green rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Users className="w-8 h-8" />
              <span>Patient Management</span>
            </h1>
            <p className="text-blue-100 mt-2">Manage patient records, information, and medical history</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-medical-blue bg-gradient-to-br from-medical-blue/5 to-medical-blue/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-medical-blue">{totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-medical-blue/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-medical-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-medical-green bg-gradient-to-br from-medical-green/5 to-medical-green/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-3xl font-bold text-medical-green">{activePatients}</p>
              </div>
              <div className="w-12 h-12 bg-medical-green/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-medical-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-medical-orange bg-gradient-to-br from-medical-orange/5 to-medical-orange/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discharged</p>
                <p className="text-3xl font-bold text-medical-orange">{dischargedPatients}</p>
              </div>
              <div className="w-12 h-12 bg-medical-orange/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-medical-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-medical-purple bg-gradient-to-br from-medical-purple/5 to-medical-purple/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                <p className="text-3xl font-bold text-medical-purple">{newPatientsThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-medical-purple/20 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-medical-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search patients by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-medical-blue/20 focus:border-medical-blue"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-2 border-medical-green/20 focus:border-medical-green">
                  <Filter className="w-4 h-4 mr-2 text-medical-green" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                  className="data-[state=checked]:bg-medical-green"
                />
                <span className="text-sm font-medium">Active Only</span>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue-dark hover:to-medical-green-dark text-white shadow-lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {selectedPatients.length > 0 && (
            <div className="mt-4 p-3 bg-medical-blue/10 rounded-lg border border-medical-blue/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-medical-blue">
                  {selectedPatients.length} patient(s) selected
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="border-medical-red text-medical-red hover:bg-medical-red hover:text-white">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </Button>
                  <Button size="sm" variant="outline" className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white">
                    <Download className="w-4 h-4 mr-1" />
                    Export Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-medical-blue" />
            <span>Patient Records ({filteredPatients.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            title="Patient Records"
            data={filteredPatients} 
            columns={columns}
            searchable={false}
            actionable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientManagement;