import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Pill, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import InventoryManagement from '../components/inventory/InventoryManagement';
import PrescriptionManagement from '../components/prescriptions/PrescriptionManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Pharmacy: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pharmacy Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage medications, inventory, and prescriptions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Medicines</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <div className="w-14 h-14 bg-medical-blue rounded-lg flex items-center justify-center">
                <Pill className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <div className="w-14 h-14 bg-medical-green rounded-lg flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <div className="w-14 h-14 bg-medical-orange rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Prescriptions</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <div className="w-14 h-14 bg-medical-purple rounded-lg flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pharmacy;
