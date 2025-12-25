import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import BloodBankDashboard from '@/components/blood-bank/BloodBankDashboard';

const BloodBank: React.FC = () => {
  return (
    <MainLayout>
      <BloodBankDashboard />
    </MainLayout>
  );
};

export default BloodBank;
