import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Users, Monitor, Settings } from 'lucide-react';
import PatientCheckIn from '@/components/queue/PatientCheckIn';
import DoctorQueueView from '@/components/queue/DoctorQueueView';
import ReceptionistQueueControl from '@/components/queue/ReceptionistQueueControl';

const Queue: React.FC = () => {
  const { user } = useAuth();

  // Determine which view to show based on role
  const isDoctor = user?.role === 'doctor';
  const isReceptionist = user?.role === 'receptionist';
  const isAdmin = user?.role === 'admin';
  const isNurse = user?.role === 'nurse';

  // Doctor sees their queue view
  if (isDoctor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Queue</h1>
          <p className="text-muted-foreground">Manage your patient queue</p>
        </div>
        <DoctorQueueView />
      </div>
    );
  }

  // Receptionist and Admin see full control panel
  if (isReceptionist || isAdmin || isNurse) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">Check in patients and manage queues</p>
        </div>

        <Tabs defaultValue="check-in" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="check-in" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Check In
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Queue Control
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Queues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="check-in" className="mt-6">
            <PatientCheckIn />
          </TabsContent>

          <TabsContent value="control" className="mt-6">
            <ReceptionistQueueControl />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <ReceptionistQueueControl />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Other roles don't have access
  return (
    <Alert>
      <AlertDescription>
        You don't have permission to access the queue management system.
      </AlertDescription>
    </Alert>
  );
};

export default Queue;
