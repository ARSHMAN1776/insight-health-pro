import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'medication' | 'lab_result' | 'system' | 'critical' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  action_url?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  sent_via_email: boolean;
  sent_via_sms: boolean;
  sent_via_push: boolean;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: 'appointment' | 'medication' | 'lab_test' | 'follow_up' | 'custom';
  reminder_time: string;
  recurring: boolean;
  recurring_pattern?: string;
  status: 'pending' | 'sent' | 'dismissed' | 'expired';
  related_id?: string;
  related_table?: string;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if user is authenticated
  const isAuthenticatedUser = () => {
    return session !== null && user?.id && user.id.includes('-');
  };

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id || !isAuthenticatedUser()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data as any as Notification[]) || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, session]);

  // Load reminders
  const loadReminders = useCallback(async () => {
    if (!user?.id || !isAuthenticatedUser()) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('reminder_time', { ascending: true });

      if (error) throw error;

      setReminders((data as any as Reminder[]) || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }, [user?.id, session]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticatedUser()) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user!.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticatedUser()) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user!.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!isAuthenticatedUser()) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user!.id);

      if (error) throw error;

      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Create notification
  const createNotification = async (notification: Partial<Notification>) => {
    if (!isAuthenticatedUser()) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user!.id,
          ...notification,
        } as any)
        .select()
        .single();

      if (error) throw error;

      return data as any as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Create reminder
  const createReminder = async (reminder: Partial<Reminder>) => {
    if (!isAuthenticatedUser()) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user!.id,
          status: 'pending',
          ...reminder,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data as any as Reminder]);
      return data as any as Reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  };

  // Dismiss reminder
  const dismissReminder = async (reminderId: string) => {
    if (!isAuthenticatedUser()) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed' })
        .eq('id', reminderId)
        .eq('user_id', user!.id);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.id || !isAuthenticatedUser()) {
      setLoading(false);
      return;
    }

    loadNotifications();
    loadReminders();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as any as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.priority === 'urgent' || newNotification.priority === 'high' ? 'destructive' : 'default',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as any as Notification;
          setNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = payload.old.id;
          setNotifications(prev => prev.filter(n => n.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, session, loadNotifications, loadReminders, toast]);

  return {
    notifications,
    reminders,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    createReminder,
    dismissReminder,
    refreshNotifications: loadNotifications,
    refreshReminders: loadReminders,
  };
};
