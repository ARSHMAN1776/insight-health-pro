import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AlertItem {
  id: string;
  item_name: string;
  current_stock: number;
  minimum_stock: number;
  expiry_date?: string;
}

export const useInventoryAlerts = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const checkAlerts = useCallback(async () => {
    // Only check if user is logged in
    if (!user) return;
    
    // Only check for admin or pharmacist roles
    const userRole = user.role;
    if (!['admin', 'pharmacist'].includes(userRole || '')) return;

    try {
      // Check for low stock items
      const { data: lowStockItems } = await supabase
        .from('inventory')
        .select('id, item_name, current_stock, minimum_stock')
        .gt('current_stock', 0);

      const actualLowStock = (lowStockItems || []).filter(
        item => item.current_stock <= item.minimum_stock
      );

      // Check for expiring items (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const dateStr = thirtyDaysFromNow.toISOString().split('T')[0];

      const { data: expiringItems } = await supabase
        .from('inventory')
        .select('id, item_name, expiry_date, current_stock')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', dateStr)
        .gt('current_stock', 0);

      // Check for out of stock items
      const { data: outOfStockItems } = await supabase
        .from('inventory')
        .select('id, item_name')
        .eq('current_stock', 0);

      // Show critical alerts
      if ((outOfStockItems?.length || 0) > 0) {
        toast({
          title: "⚠️ Out of Stock Alert",
          description: `${outOfStockItems?.length} item(s) are out of stock and need immediate restocking.`,
          variant: "destructive",
        });
      }

      if (actualLowStock.length > 0) {
        toast({
          title: "📦 Low Stock Warning",
          description: `${actualLowStock.length} item(s) are running low on stock.`,
        });
      }

      if ((expiringItems?.length || 0) > 0) {
        toast({
          title: "📅 Expiry Warning",
          description: `${expiringItems?.length} item(s) will expire within 30 days.`,
        });
      }

      return {
        lowStockItems: actualLowStock,
        expiringItems: expiringItems || [],
        outOfStockItems: outOfStockItems || []
      };
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
      return null;
    }
  }, [user, toast]);

  // Check on mount and set up interval
  useEffect(() => {
    // Initial check with delay to avoid overwhelming user
    const initialTimeout = setTimeout(() => {
      checkAlerts();
    }, 3000);

    // Check every 15 minutes
    const interval = setInterval(checkAlerts, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkAlerts, user]);

  return { checkAlerts };
};

// Helper to get critical inventory items
export const getCriticalInventoryItems = async () => {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const dateStr = thirtyDaysFromNow.toISOString().split('T')[0];

  const { data: items } = await supabase
    .from('inventory')
    .select('*')
    .or(`current_stock.lte.minimum_stock,expiry_date.lte.${dateStr}`)
    .gt('current_stock', 0);

  return items || [];
};
