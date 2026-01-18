import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import OfflineIndicator from "./components/shared/OfflineIndicator";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";

import Index from './pages/Index';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Contact from './pages/Contact';
import VerifyLabReport from './pages/VerifyLabReport';
import VerifyPrescription from './pages/VerifyPrescription';
import VerifyPatient from './pages/VerifyPatient';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
          <BrowserRouter>
          <Routes>
              {/* Public verification routes */}
              <Route path="/verify/lab-report" element={<VerifyLabReport />} />
              <Route path="/verify/prescription" element={<VerifyPrescription />} />
              <Route path="/verify/patient" element={<VerifyPatient />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
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
                      <InventoryManagement />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/prescriptions" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <PrescriptionManagement />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/lab-tests" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <LabTestManagement />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/rooms" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <RoomManagement />
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
                      <Reports />
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
                      <Billing />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/pharmacy" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <Pharmacy />
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
                      <OperationDepartment />
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
                      <BloodBank />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/patient-messages" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <PatientMessages />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/vitals" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <Vitals />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/shift-handovers" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <ShiftHandovers />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/referrals" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <Referrals />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/insurance-claims" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                      <InsuranceClaims />
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
                      <Queue />
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
                      <AuditLogs />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
