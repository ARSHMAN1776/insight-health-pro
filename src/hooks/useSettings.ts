import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HospitalSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_category: string;
}

interface UserSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: any;
}

export const useSettings = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hospitalSettings, setHospitalSettings] = useState<Record<string, any>>({});
  const [userSettings, setUserSettings] = useState<Record<string, any>>({});

  // Check if user is a real authenticated user (not demo)
  const isAuthenticatedUser = () => {
    return session !== null && user?.id && user.id.includes('-'); // UUIDs contain dashes
  };

  // Load from localStorage for demo users
  const loadFromLocalStorage = () => {
    if (!user?.id) return;
    
    const storageKey = `user_settings_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setUserSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored settings:', e);
      }
    }

    if (user.role === 'admin') {
      const hospitalStorageKey = 'hospital_settings';
      const storedHospital = localStorage.getItem(hospitalStorageKey);
      if (storedHospital) {
        try {
          setHospitalSettings(JSON.parse(storedHospital));
        } catch (e) {
          console.error('Error parsing stored hospital settings:', e);
        }
      }
    }
  };

  // Save to localStorage for demo users
  const saveToLocalStorage = (key: string, value: any, isHospital: boolean = false) => {
    if (!user?.id && !isHospital) return;
    
    if (isHospital) {
      const hospitalStorageKey = 'hospital_settings';
      const current = localStorage.getItem(hospitalStorageKey);
      const settings = current ? JSON.parse(current) : {};
      settings[key] = value;
      localStorage.setItem(hospitalStorageKey, JSON.stringify(settings));
    } else {
      const storageKey = `user_settings_${user.id}`;
      const current = localStorage.getItem(storageKey);
      const settings = current ? JSON.parse(current) : {};
      settings[key] = value;
      localStorage.setItem(storageKey, JSON.stringify(settings));
    }
  };

  // Load hospital settings (admin only)
  const loadHospitalSettings = async () => {
    if (!user || user.role !== 'admin') return;

    // For demo users, use localStorage
    if (!isAuthenticatedUser()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hospital_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach((setting: HospitalSetting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setHospitalSettings(settingsMap);
    } catch (error) {
      console.error('Error loading hospital settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hospital settings',
        variant: 'destructive',
      });
    }
  };

  // Load user-specific settings
  const loadUserSettings = async () => {
    if (!user?.id) return;

    // For demo users, use localStorage
    if (!isAuthenticatedUser()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach((setting: UserSetting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setUserSettings(settingsMap);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  // Save hospital setting (admin only)
  const saveHospitalSetting = async (key: string, value: any, category: string) => {
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can modify hospital settings',
        variant: 'destructive',
      });
      return false;
    }

    // For demo users, use localStorage
    if (!isAuthenticatedUser()) {
      saveToLocalStorage(key, value, true);
      setHospitalSettings(prev => ({ ...prev, [key]: value }));
      return true;
    }

    try {
      const { error } = await supabase
        .from('hospital_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_category: category,
          updated_by: user.id,
        }, {
          onConflict: 'setting_key',
        });

      if (error) throw error;

      setHospitalSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Error saving hospital setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save hospital setting',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Save user setting
  const saveUserSetting = async (key: string, value: any) => {
    if (!user?.id) return false;

    // For demo users, use localStorage
    if (!isAuthenticatedUser()) {
      saveToLocalStorage(key, value, false);
      setUserSettings(prev => ({ ...prev, [key]: value }));
      return true;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value,
        }, {
          onConflict: 'user_id,setting_key',
        });

      if (error) throw error;

      setUserSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Error saving user setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user setting',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get a specific setting with fallback
  const getSetting = (key: string, type: 'hospital' | 'user' = 'user') => {
    if (type === 'hospital') {
      return hospitalSettings[key];
    }
    return userSettings[key];
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      // Load from localStorage for demo users
      if (!isAuthenticatedUser()) {
        loadFromLocalStorage();
        setLoading(false);
        return;
      }

      // Load from Supabase for authenticated users
      await Promise.all([
        loadHospitalSettings(),
        loadUserSettings(),
      ]);
      setLoading(false);
    };

    if (user) {
      initialize();
    } else {
      setLoading(false);
    }
  }, [user?.id, user?.role, session]);

  return {
    loading,
    hospitalSettings,
    userSettings,
    saveHospitalSetting,
    saveUserSetting,
    getSetting,
    refreshSettings: () => {
      loadHospitalSettings();
      loadUserSettings();
    },
  };
};
