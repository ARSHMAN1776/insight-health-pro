import MainLayout from '@/components/layout/MainLayout';
import { InsuranceClaimsManagement } from '@/components/insurance/InsuranceClaimsManagement';

const InsuranceClaims = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insurance Claims</h1>
          <p className="text-muted-foreground">
            Manage insurance claim submissions, track status, and handle denials
          </p>
        </div>
        <InsuranceClaimsManagement />
      </div>
    </MainLayout>
  );
};

export default InsuranceClaims;
