import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  payment_terms: string | null;
  lead_time_days: number;
  status: 'active' | 'inactive';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery: string | null;
  actual_delivery: string | null;
  total_amount: number;
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  status: 'pending' | 'partial' | 'received' | 'cancelled';
  created_at: string;
}

export interface CreateSupplier {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  lead_time_days?: number;
  notes?: string;
}

export interface CreatePurchaseOrder {
  supplier_id: string;
  expected_delivery?: string;
  notes?: string;
  items: {
    inventory_item_id?: string;
    item_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers((data || []) as Supplier[]);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load suppliers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = async (supplier: CreateSupplier): Promise<Supplier | null> => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Supplier Created',
        description: `${supplier.name} has been added.`,
      });

      await fetchSuppliers();
      return data as Supplier;
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to create supplier',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Supplier Updated',
        description: 'Changes saved successfully.',
      });

      await fetchSuppliers();
      return true;
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update supplier',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Supplier Deleted',
        description: 'Supplier has been removed.',
      });

      await fetchSuppliers();
      return true;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete supplier. It may have associated purchase orders.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    suppliers,
    loading,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

export const usePurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as PurchaseOrder[]);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (order: CreatePurchaseOrder): Promise<PurchaseOrder | null> => {
    try {
      // Calculate total
      const totalAmount = order.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      // Create purchase order
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          supplier_id: order.supplier_id,
          expected_delivery: order.expected_delivery,
          notes: order.notes,
          total_amount: totalAmount,
          status: 'draft',
          po_number: '', // Will be auto-generated by trigger
        } as any)
        .select()
        .single();

      if (poError) throw poError;

      // Create purchase order items
      const items = order.items.map((item) => ({
        purchase_order_id: poData.id,
        inventory_item_id: item.inventory_item_id || null,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        status: 'pending',
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(items);

      if (itemsError) throw itemsError;

      toast({
        title: 'Purchase Order Created',
        description: `PO #${poData.po_number} has been created.`,
      });

      await fetchOrders();
      return poData as PurchaseOrder;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create purchase order',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: PurchaseOrder['status']
  ): Promise<boolean> => {
    try {
      const updates: Record<string, unknown> = { status };

      if (status === 'approved') {
        const { data: { user } } = await supabase.auth.getUser();
        updates.approved_by = user?.id;
        updates.approved_at = new Date().toISOString();
      }

      if (status === 'received') {
        updates.actual_delivery = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${status}.`,
      });

      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const receiveOrder = async (
    orderId: string,
    items: { id: string; received_quantity: number }[]
  ): Promise<boolean> => {
    try {
      // Update each item
      for (const item of items) {
        const { error } = await supabase
          .from('purchase_order_items')
          .update({
            received_quantity: item.received_quantity,
            status: item.received_quantity > 0 ? 'received' : 'pending',
          })
          .eq('id', item.id);

        if (error) throw error;

        // Update inventory if item is linked
        const { data: poItem } = await supabase
          .from('purchase_order_items')
          .select('inventory_item_id, quantity')
          .eq('id', item.id)
          .single();

        if (poItem?.inventory_item_id && item.received_quantity > 0) {
          const { data: invItem } = await supabase
            .from('inventory')
            .select('current_stock')
            .eq('id', poItem.inventory_item_id)
            .single();

          if (invItem) {
            await supabase
              .from('inventory')
              .update({
                current_stock: invItem.current_stock + item.received_quantity,
                last_restocked: new Date().toISOString().split('T')[0],
              })
              .eq('id', poItem.inventory_item_id);
          }
        }
      }

      // Update order status
      await updateOrderStatus(orderId, 'received');

      toast({
        title: 'Order Received',
        description: 'Inventory has been updated.',
      });

      return true;
    } catch (error) {
      console.error('Error receiving order:', error);
      toast({
        title: 'Error',
        description: 'Failed to receive order',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getOrderItems = async (orderId: string): Promise<PurchaseOrderItem[]> => {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', orderId);

      if (error) throw error;
      return (data || []) as PurchaseOrderItem[];
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  };

  // Get stats
  const stats = {
    total: orders.length,
    draft: orders.filter((o) => o.status === 'draft').length,
    pending: orders.filter((o) => o.status === 'submitted').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    received: orders.filter((o) => o.status === 'received').length,
  };

  return {
    orders,
    loading,
    stats,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    receiveOrder,
    getOrderItems,
  };
};
