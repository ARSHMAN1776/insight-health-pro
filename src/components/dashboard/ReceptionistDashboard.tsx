import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, DollarSign, Phone, UserPlus, Clock, Edit, FileText, UserCheck, Stethoscope } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import PatientRegistrationForm from '../forms/PatientRegistrationForm';
import DoctorRegistrationForm from '../forms/DoctorRegistrationForm';
import NurseRegistrationForm from '../forms/NurseRegistrationForm';
import PaymentManagementForm from '../forms/PaymentManagementForm';
import RecordUpdateForm from '../forms/RecordUpdateForm';

const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [openModals, setOpenModals] = useState({
    patientRegistration: false,
    doctorRegistration: false,
    nurseRegistration: false,
    paymentManagement: false,
    recordUpdate: false,
  });

  const handleModalClose = (modalName: keyof typeof openModals) => {
    setOpenModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleModalOpen = (modalName: keyof typeof openModals) => {
    setOpenModals(prev => ({ ...prev, [modalName]: true }));
  };

  const todayStats = [
    { title: 'Check-ins Today', value: '45', icon: Users, color: 'bg-medical-blue' },
    { title: 'Appointments', value: '67', icon: Calendar, color: 'bg-medical-green' },
    { title: 'Payments', value: '$12,450', icon: DollarSign, color: 'bg-medical-purple' },
    { title: 'Calls', value: '89', icon: Phone, color: 'bg-medical-orange' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-medical-blue to-medical-blue-dark rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-blue-100">Front desk operations at your fingertips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Patient Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={openModals.patientRegistration} onOpenChange={(open) => setOpenModals(prev => ({ ...prev, patientRegistration: open }))}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <UserPlus className="w-6 h-6" />
                  <span className="text-sm">Register Patient</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <PatientRegistrationForm onClose={() => handleModalClose('patientRegistration')} />
              </DialogContent>
            </Dialog>

            <Dialog open={openModals.doctorRegistration} onOpenChange={(open) => setOpenModals(prev => ({ ...prev, doctorRegistration: open }))}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <Stethoscope className="w-6 h-6" />
                  <span className="text-sm">Register Doctor</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DoctorRegistrationForm onClose={() => handleModalClose('doctorRegistration')} />
              </DialogContent>
            </Dialog>

            <Dialog open={openModals.nurseRegistration} onOpenChange={(open) => setOpenModals(prev => ({ ...prev, nurseRegistration: open }))}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <UserCheck className="w-6 h-6" />
                  <span className="text-sm">Register Nurse</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <NurseRegistrationForm onClose={() => handleModalClose('nurseRegistration')} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog open={openModals.paymentManagement} onOpenChange={(open) => setOpenModals(prev => ({ ...prev, paymentManagement: open }))}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Payment Management</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <PaymentManagementForm onClose={() => handleModalClose('paymentManagement')} />
              </DialogContent>
            </Dialog>

            <Dialog open={openModals.recordUpdate} onOpenChange={(open) => setOpenModals(prev => ({ ...prev, recordUpdate: open }))}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                  <Edit className="w-6 h-6" />
                  <span className="text-sm">Update Records</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <RecordUpdateForm onClose={() => handleModalClose('recordUpdate')} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Reports</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Users className="w-6 h-6" />
              <span className="text-sm">Patient List</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Phone className="w-6 h-6" />
              <span className="text-sm">Call Patient</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;