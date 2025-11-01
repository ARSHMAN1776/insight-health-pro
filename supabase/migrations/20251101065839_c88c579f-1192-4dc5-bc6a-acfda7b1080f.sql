-- Create settings table for hospital-wide settings
CREATE TABLE IF NOT EXISTS public.hospital_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  setting_category text NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user-specific settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospital_settings (only admins can manage)
CREATE POLICY "Admins can view hospital settings"
  ON public.hospital_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert hospital settings"
  ON public.hospital_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update hospital settings"
  ON public.hospital_settings
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_settings (users can manage their own)
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON public.user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers
CREATE TRIGGER update_hospital_settings_updated_at
  BEFORE UPDATE ON public.hospital_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_settings_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_settings_updated_at();

-- Insert default hospital settings
INSERT INTO public.hospital_settings (setting_key, setting_value, setting_category) VALUES
  ('hospital_info', '{"name": "City General Hospital", "address": "123 Medical Center Drive", "phone": "+1 (555) 123-4567", "email": "info@hospital.com", "website": "www.hospital.com", "license": "LIC-2024-001", "accreditation": "Joint Commission Accredited"}'::jsonb, 'hospital'),
  ('regional_settings', '{"timezone": "America/New_York", "language": "en", "currency": "USD"}'::jsonb, 'hospital'),
  ('security_settings', '{"autoLogout": 30, "sessionTimeout": 60, "maxLoginAttempts": 3, "passwordExpiry": 90, "requireMFA": false, "allowRemoteAccess": true}'::jsonb, 'security'),
  ('notification_defaults', '{"emailAlerts": true, "smsAlerts": false, "pushNotifications": true, "appointmentReminders": true, "medicationAlerts": true, "systemMaintenance": true, "criticalAlerts": true}'::jsonb, 'notifications'),
  ('system_config', '{"backupFrequency": "daily", "dataRetention": 365, "auditLogging": true, "encryptionEnabled": true, "autoUpdates": false, "maintenanceMode": false}'::jsonb, 'system')
ON CONFLICT (setting_key) DO NOTHING;