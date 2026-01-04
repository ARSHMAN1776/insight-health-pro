import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, Stethoscope, Activity, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import DataTable from '../components/shared/DataTable';
import { supabase } from '@/integrations/supabase/client';
interface Department {
  department_id: string;
  department_name: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  department: string;
  department_id: string;
  phone: string;
  email: string;
}

interface Nurse {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  shift_schedule: string;
  phone: string;
  email: string;
}

interface DepartmentDoctor {
  doctor_id: string;
  department_id: string;
}

const Staff: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentDoctors, setDepartmentDoctors] = useState<DepartmentDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [deptResult, doctorsResult, nursesResult, deptDoctorsResult] = await Promise.all([
        supabase.from('departments').select('department_id, department_name').order('department_name'),
        supabase.from('doctors').select('*').order('first_name'),
        supabase.from('nurses').select('*').order('first_name'),
        supabase.from('department_doctors').select('doctor_id, department_id')
      ]);
      
      setDepartments(deptResult.data || []);
      setDoctors(doctorsResult.data || []);
      setNurses(nursesResult.data || []);
      setDepartmentDoctors(deptDoctorsResult.data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get department name
  const getDepartmentName = (departmentId: string | null, fallback: string = '-') => {
    if (!departmentId) return fallback;
    const dept = departments.find(d => d.department_id === departmentId);
    return dept?.department_name || fallback;
  };

  // Transform doctors data for table display
  const doctorsTableData = doctors.map(doc => ({
    ...doc,
    name: `Dr. ${doc.first_name} ${doc.last_name}`,
    departmentDisplay: getDepartmentName(doc.department_id, doc.department || '-'),
  }));

  // Transform nurses data for table display
  const nursesTableData = nurses.map(nurse => ({
    ...nurse,
    name: `${nurse.first_name} ${nurse.last_name}`,
    shift: nurse.shift_schedule || '-',
  }));

  const doctorColumns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    { key: 'specialization', label: 'Specialization' },
    { 
      key: 'departmentDisplay', 
      label: 'Department',
      render: (value: string, row: any) => (
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <Building2 className="h-3 w-3" />
          {value}
        </Badge>
      )
    },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  const nurseColumns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    { key: 'department', label: 'Department' },
    { key: 'shift', label: 'Shift' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  // Count doctors per department using junction table as primary source
  const doctorsByDepartment = departments.map(dept => {
    // Get unique doctor IDs from junction table OR legacy department_id
    const junctionDoctorIds = departmentDoctors
      .filter(dd => dd.department_id === dept.department_id)
      .map(dd => dd.doctor_id);
    const legacyDoctorIds = doctors
      .filter(d => d.department_id === dept.department_id)
      .map(d => d.id);
    const uniqueDoctorIds = [...new Set([...junctionDoctorIds, ...legacyDoctorIds])];
    
    return {
      ...dept,
      count: uniqueDoctorIds.length
    };
  }).filter(d => d.count > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage doctors, nurses, and other staff members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Doctors</p>
                <p className="text-3xl font-bold text-foreground">{doctors.length}</p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Nurses</p>
                <p className="text-3xl font-bold text-foreground">{nurses.length}</p>
              </div>
              <div className="w-14 h-14 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-3xl font-bold text-foreground">{doctors.length + nurses.length}</p>
              </div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-3xl font-bold text-foreground">{doctorsByDepartment.length}</p>
              </div>
              <div className="w-14 h-14 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      {doctorsByDepartment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Doctors by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {doctorsByDepartment.map((dept) => (
                <Badge 
                  key={dept.department_id} 
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  {dept.department_name}: {dept.count} doctor{dept.count !== 1 ? 's' : ''}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="nurses">Nurses</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <DataTable
            title="All Doctors"
            data={doctorsTableData}
            columns={doctorColumns}
          />
        </TabsContent>

        <TabsContent value="nurses">
          <DataTable
            title="All Nurses"
            data={nursesTableData}
            columns={nurseColumns}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Staff;
