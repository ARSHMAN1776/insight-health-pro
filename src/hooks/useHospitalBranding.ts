import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrandingSettings {
  logoUrl: string;
  hospitalName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBgColor: string;
  footerText: string;
}

const defaultBranding: BrandingSettings = {
  logoUrl: '',
  hospitalName: 'City General Hospital',
  tagline: 'Excellence in Healthcare',
  address: '',
  phone: '',
  email: '',
  website: '',
  primaryColor: '#0066CC',
  secondaryColor: '#004999',
  accentColor: '#00AAFF',
  headerBgColor: '#F5F5F5',
  footerText: 'This is a computer-generated report. No signature required.'
};

export const useHospitalBranding = () => {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        // Try to load from localStorage first (for demo users)
        const storedSettings = localStorage.getItem('hospital_settings');
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          if (parsed.branding_settings) {
            setBranding(prev => ({ ...prev, ...parsed.branding_settings }));
          }
        }

        // Then try to load from Supabase
        const { data, error } = await supabase
          .from('hospital_settings')
          .select('setting_value')
          .eq('setting_key', 'branding_settings')
          .single();

        if (!error && data?.setting_value) {
          setBranding(prev => ({ ...prev, ...(data.setting_value as Partial<BrandingSettings>) }));
        }
      } catch (error) {
        console.error('Error loading branding settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranding();
  }, []);

  // Convert hex color to RGB array for jsPDF
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 102, 204]; // Default blue
  };

  return {
    branding,
    loading,
    getLabReportHospitalInfo: () => ({
      name: branding.hospitalName || defaultBranding.hospitalName,
      address: branding.address,
      phone: branding.phone,
      email: branding.email,
      logo: branding.logoUrl
    }),
    getPrimaryColorRgb: () => hexToRgb(branding.primaryColor),
    getSecondaryColorRgb: () => hexToRgb(branding.secondaryColor),
    getAccentColorRgb: () => hexToRgb(branding.accentColor)
  };
};
