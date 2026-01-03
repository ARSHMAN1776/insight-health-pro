import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import WaitlistManagement from '../components/appointments/WaitlistManagement';

const Waitlist: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointment Waitlist</h1>
          <p className="text-muted-foreground mt-1">
            Manage patients waiting for appointment slots
          </p>
        </div>

        <WaitlistManagement />
      </div>
    </MainLayout>
  );
};

export default Waitlist;
