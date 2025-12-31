import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, DollarSign, Phone, Edit, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import PaymentManagementForm from '../forms/PaymentManagementForm';
import RecordUpdateForm from '../forms/RecordUpdateForm';
import PendingVerificationsWidget from './PendingVerificationsWidget';
import { dataManager } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';

const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, appointments: 0, payments: 0, totalRevenue: 0 });
  const [openModals, setOpenModals] = useState({
    paymentManagement: false,
    recordUpdate: false,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await dataManager.getDashboardStats();
        setStats({
          patients: dashboardStats.totalPatients,
          appointments: dashboardStats.todayAppointments,
          payments: dashboardStats.pendingPayments,
          totalRevenue: dashboardStats.totalRevenue
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const handleModalClose = (modalName: keyof typeof openModals) => {
    setOpenModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleModalOpen = (modalName: keyof typeof openModals) => {
    setOpenModals(prev => ({ ...prev, [modalName]: true }));
  };

  const todayStats = [
    { title: 'Total Patients', value: loading ? '...' : stats.patients.toString(), icon: Users, color: 'bg-medical-blue' },
    { title: 'Today\'s Appointments', value: loading ? '...' : stats.appointments.toString(), icon: Calendar, color: 'bg-medical-green' },
    { title: 'Total Revenue', value: loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-medical-purple' },
    { title: 'Pending Payments', value: loading ? '...' : stats.payments.toString(), icon: Phone, color: 'bg-medical-orange' }
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


      {/* Pending Patient Verifications */}
      <PendingVerificationsWidget />

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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scroll-smooth">
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scroll-smooth">
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
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/appointments')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Appointments</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/patients')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Patient List</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/rooms')}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">Rooms & Beds</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/billing')}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Billing</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;