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

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
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
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="appointments" element={
                  <div className="p-6">
                    <Suspense fallback={<div>Loading...</div>}>
                      <AppointmentScheduler />
                    </Suspense>
                  </div>
                } />
                <Route path="medical-records" element={
                  <div className="p-6">
                    <Suspense fallback={<div>Loading...</div>}>
                      <MedicalRecords />
                    </Suspense>
                  </div>
                } />
                <Route path="inventory" element={
                  <div className="p-6">
                    <Suspense fallback={<div>Loading...</div>}>
                      <InventoryManagement />
                    </Suspense>
                  </div>
                } />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
