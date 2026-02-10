import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardPlus, Stethoscope, FileOutput } from 'lucide-react';
import IPDAdmissions from '@/components/ipd/IPDAdmissions';
import WardRounds from '@/components/ipd/WardRounds';
import DischargeSummaries from '@/components/ipd/DischargeSummaries';

const IPDManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">IPD Management</h1>
        <p className="text-muted-foreground mt-1">
          Inpatient admission, ward rounds, and discharge workflow
        </p>
      </div>

      <Tabs defaultValue="admissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admissions" className="flex items-center gap-2">
            <ClipboardPlus className="h-4 w-4" />
            Admissions
          </TabsTrigger>
          <TabsTrigger value="ward-rounds" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Ward Rounds
          </TabsTrigger>
          <TabsTrigger value="discharge" className="flex items-center gap-2">
            <FileOutput className="h-4 w-4" />
            Discharge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admissions">
          <IPDAdmissions />
        </TabsContent>

        <TabsContent value="ward-rounds">
          <WardRounds />
        </TabsContent>

        <TabsContent value="discharge">
          <DischargeSummaries />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IPDManagement;
