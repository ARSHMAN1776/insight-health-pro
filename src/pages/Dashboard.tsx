import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import DoctorDashboard from '../components/dashboard/DoctorDashboard';
import NurseDashboard from '../components/dashboard/NurseDashboard';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import ReceptionistDashboard from '../components/dashboard/ReceptionistDashboard';
import PharmacistDashboard from '../components/dashboard/PharmacistDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'nurse':
        return <NurseDashboard />;
      case 'patient':
        return <PatientDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'pharmacist':
        return <PharmacistDashboard />;
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Welcome to HMS Dashboard
            </h2>
            <p className="text-muted-foreground">
              Your dashboard is being prepared...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;