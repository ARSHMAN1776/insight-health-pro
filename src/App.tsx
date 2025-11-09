import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";

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

const queryClient = new QueryClient();

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
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" />
                </ProtectedRoute>
              } />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
