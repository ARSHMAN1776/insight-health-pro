import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Pill, Package, AlertTriangle, TrendingUp, Building2, FileText, Receipt } from 'lucide-react';
import InventoryManagement from '../components/inventory/InventoryManagement';
import PrescriptionManagement from '../components/prescriptions/PrescriptionManagement';
import SupplierManagement from '../components/inventory/SupplierManagement';
import PurchaseOrderManagement from '../components/inventory/PurchaseOrderManagement';
import PharmacyBilling from '../components/pharmacy/PharmacyBilling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Pharmacy: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pharmacy Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage medications, inventory, suppliers, and prescriptions
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

      <Tabs defaultValue="billing" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="billing" className="gap-1.5">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1.5">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-1.5">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="gap-1.5">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-1.5">
            <Pill className="w-4 h-4" />
            <span className="hidden sm:inline">Prescriptions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="billing">
          <PharmacyBilling />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierManagement />
        </TabsContent>

        <TabsContent value="purchase-orders">
          <PurchaseOrderManagement />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pharmacy;
