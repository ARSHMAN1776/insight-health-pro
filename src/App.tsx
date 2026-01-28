import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { TenantProvider, useTenant } from "./contexts/TenantContext";
import { ThemeProvider } from "./components/theme-provider";
import TenantBranding from "./components/tenant/TenantBranding";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import OfflineIndicator from "./components/shared/OfflineIndicator";
import Login from "./pages/Login";
import TenantLogin from "./pages/TenantLogin";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import TenantNotFound from "./components/tenant/TenantNotFound";

import Index from './pages/Index';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Contact from './pages/Contact';
import VerifyLabReport from './pages/VerifyLabReport';
import VerifyPrescription from './pages/VerifyPrescription';
import VerifyPatient from './pages/VerifyPatient';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Security from './pages/Security';
import Status from './pages/Status';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Feature pages
import PatientManagementFeature from './pages/features/PatientManagement';
import AppointmentSchedulingFeature from './pages/features/AppointmentScheduling';
import MedicalRecordsFeature from './pages/features/MedicalRecordsFeature';
import BillingPayments from './pages/features/BillingPayments';
import LabDiagnostics from './pages/features/LabDiagnostics';
import BedManagementFeature from './pages/features/BedManagement';
import NotificationsFeature from './pages/features/Notifications';
import ReportsAnalytics from './pages/features/ReportsAnalytics';

// Lazy load components
const AppointmentScheduler = React.lazy(() => import('./components/appointments/AppointmentScheduler'));
const MedicalRecords = React.lazy(() => import('./components/medical/MedicalRecords'));
const InventoryManagement = React.lazy(() => import('./components/inventory/InventoryManagement'));
const PrescriptionManagement = React.lazy(() => import('./components/prescriptions/PrescriptionManagement'));
const LabTestManagement = React.lazy(() => import('./components/lab-tests/LabTestManagement'));
const RoomManagement = React.lazy(() => import('./components/rooms/RoomManagement'));
const PatientManagement = React.lazy(() => import('./components/patients/PatientManagement'));
const PatientRegistry = React.lazy(() => import('./pages/PatientRegistry'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Settings = React.lazy(() => import('./components/settings/Settings'));
const Billing = React.lazy(() => import('./pages/Billing'));
const Pharmacy = React.lazy(() => import('./pages/Pharmacy'));
const Staff = React.lazy(() => import('./pages/Staff'));
const OperationDepartment = React.lazy(() => import('./pages/OperationDepartment'));
const DepartmentManagement = React.lazy(() => import('./components/departments/DepartmentManagement'));
const StaffManagement = React.lazy(() => import('./pages/StaffManagement'));
const BloodBank = React.lazy(() => import('./pages/BloodBank'));
const PatientMessages = React.lazy(() => import('./pages/PatientMessages'));
const Vitals = React.lazy(() => import('./pages/Vitals'));
const ShiftHandovers = React.lazy(() => import('./pages/ShiftHandovers'));
const Referrals = React.lazy(() => import('./pages/Referrals'));
const InsuranceClaims = React.lazy(() => import('./pages/InsuranceClaims'));
const Waitlist = React.lazy(() => import('./pages/Waitlist'));
const Queue = React.lazy(() => import('./pages/Queue'));
const WaitingRoomDisplay = React.lazy(() => import('./components/queue/WaitingRoomDisplay'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));
const PaymentSettings = React.lazy(() => import('./pages/PaymentSettings'));
const ModuleProtectedRoute = React.lazy(() => import('./components/shared/ModuleProtectedRoute'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - clinical data doesn't change frequently
      gcTime: 1000 * 60 * 30, // 30 minutes cache (formerly cacheTime)
      refetchOnWindowFocus: false, // Prevent aggressive refetching on tab switch
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Component to handle tenant-aware routing
const TenantAwareRoutes = () => {
  const { isTenantMode, isLoading: tenantLoading, error: tenantError, subdomain } = useTenant();
  
  // Show loading while determining tenant mode
  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If subdomain exists but tenant not found, show 404
  if (subdomain && tenantError) {
    return <TenantNotFound subdomain={subdomain} />;
  }
  
  // Tenant mode - show only app routes (no marketing pages)
  if (isTenantMode) {
    return (
      <Routes>
        {/* Tenant login/home */}
        <Route path="/" element={<TenantLogin />} />
        <Route path="/login" element={<TenantLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected app routes - same as main domain */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* All other protected routes will be the same */}
        <Route path="/appointments" element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                <AppointmentScheduler />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/medical-records" element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                <MedicalRecords />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/patients" element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                <PatientManagement />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                <Settings />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch-all - redirect to login for tenant mode */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  // Main domain - show full site with marketing pages
  return (
    <Routes>
      {/* Public verification routes */}
      <Route path="/verify/lab-report" element={<VerifyLabReport />} />
      <Route path="/verify/prescription" element={<VerifyPrescription />} />
      <Route path="/verify/patient" element={<VerifyPatient />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/security" element={<Security />} />
      <Route path="/status" element={<Status />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      
      {/* Feature pages */}
      <Route path="/features/patient-management" element={<PatientManagementFeature />} />
      <Route path="/features/appointment-scheduling" element={<AppointmentSchedulingFeature />} />
      <Route path="/features/medical-records" element={<MedicalRecordsFeature />} />
      <Route path="/features/billing-payments" element={<BillingPayments />} />
      <Route path="/features/lab-diagnostics" element={<LabDiagnostics />} />
      <Route path="/features/bed-management" element={<BedManagementFeature />} />
      <Route path="/features/notifications" element={<NotificationsFeature />} />
      <Route path="/features/reports-analytics" element={<ReportsAnalytics />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <AppointmentScheduler />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/medical-records" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <MedicalRecords />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="inventory">
                <InventoryManagement />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/prescriptions" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="prescriptions">
                <PrescriptionManagement />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/lab-tests" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="lab_tests">
                <LabTestManagement />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/rooms" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="rooms">
                <RoomManagement />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/patients" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <PatientManagement />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/patient-registry" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <PatientRegistry />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="reports">
                <Reports />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <Settings />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="billing">
                <Billing />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/pharmacy" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="pharmacy">
                <Pharmacy />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <Staff />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/operation-department" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="operation_dept">
                <OperationDepartment />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/departments" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <DepartmentManagement />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff-management" element={
        <ProtectedRoute>
          <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
            <StaffManagement />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/blood-bank" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="blood_bank">
                <BloodBank />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/patient-messages" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="messages">
                <PatientMessages />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/vitals" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="vitals">
                <Vitals />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/shift-handovers" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="shift_handover">
                <ShiftHandovers />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/referrals" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="referrals">
                <Referrals />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/insurance-claims" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="insurance">
                <InsuranceClaims />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/waitlist" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <Waitlist />
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/queue" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="queue">
                <Queue />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/queue/display" element={
        <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
          <WaitingRoomDisplay />
        </Suspense>
      } />
      <Route path="/queue/display/:departmentId" element={
        <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
          <WaitingRoomDisplay />
        </Suspense>
      } />
      <Route path="/audit-logs" element={
        <ProtectedRoute>
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
              <ModuleProtectedRoute module="audit_logs">
                <AuditLogs />
              </ModuleProtectedRoute>
            </Suspense>
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/payment-settings" element={
        <ProtectedRoute>
          <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
            <PaymentSettings />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>
          <TenantProvider>
            <TenantBranding>
              <AuthProvider>
                <OrganizationProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <OfflineIndicator />
                    <TenantAwareRoutes />
                  </TooltipProvider>
                </OrganizationProvider>
              </AuthProvider>
            </TenantBranding>
          </TenantProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
