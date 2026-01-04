import React from 'react';
import ReferralManagement from '@/components/referrals/ReferralManagement';

const Referrals: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">Manage patient referrals to specialists and departments</p>
      </div>
      <ReferralManagement />
    </div>
  );
};

export default Referrals;