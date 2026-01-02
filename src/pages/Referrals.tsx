import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ReferralManagement from '@/components/referrals/ReferralManagement';

const Referrals: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Referrals</h1>
          <p className="text-muted-foreground">Manage patient referrals to specialists and departments</p>
        </div>
        <ReferralManagement />
      </div>
    </MainLayout>
  );
};

export default Referrals;
