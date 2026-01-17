import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AuditLogViewer from '@/components/audit/AuditLogViewer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AuditLogs: React.FC = () => {
  const { user } = useAuth();

  // Only admins can access audit logs
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <AuditLogViewer />
      </div>
    </MainLayout>
  );
};

export default AuditLogs;
