import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserPlus, Stethoscope, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import DoctorRegistrationForm from '../components/forms/DoctorRegistrationForm';
import NurseRegistrationForm from '../components/forms/NurseRegistrationForm';
import DataTable from '../components/shared/DataTable';
import { dataManager } from '../lib/dataManager';

const Staff: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const [doctorsData, nursesData] = await Promise.all([
        dataManager.getDoctors(),
        dataManager.getNurses(),
      ]);
      setDoctors(doctorsData);
      setNurses(nursesData);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const doctorColumns = [
    { key: 'name', label: 'Name' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'department', label: 'Department' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  const nurseColumns = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'shift', label: 'Shift' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Doctors</p>
                <p className="text-3xl font-bold text-foreground">{doctors.length}</p>
              </div>
              <div className="w-14 h-14 bg-medical-blue rounded-lg flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-white" />
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
              <div className="w-14 h-14 bg-medical-green rounded-lg flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
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
              <div className="w-14 h-14 bg-medical-purple rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="nurses">Nurses</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataTable
                title="All Doctors"
                data={doctors}
                columns={doctorColumns}
              />
            </div>
            <div>
              <DoctorRegistrationForm onClose={loadStaffData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nurses">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataTable
                title="All Nurses"
                data={nurses}
                columns={nurseColumns}
              />
            </div>
            <div>
              <NurseRegistrationForm onClose={loadStaffData} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Staff;
