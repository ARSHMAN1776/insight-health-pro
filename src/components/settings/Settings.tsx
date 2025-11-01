import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { Settings as SettingsIcon, Building, Users, Bell, Shield, Database, Mail, Phone, Loader2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { loading, hospitalSettings: dbHospitalSettings, userSettings: dbUserSettings, saveHospitalSetting, saveUserSetting } = useSettings();
  
  const [hospitalInfo, setHospitalInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    license: '',
    accreditation: ''
  });

  const [regionalSettings, setRegionalSettings] = useState({
    timezone: 'America/New_York',
    language: 'en',
    currency: 'USD'
  });

  const [securitySettings, setSecuritySettings] = useState({
    autoLogout: 30,
    sessionTimeout: 60,
    maxLoginAttempts: 3,
    passwordExpiry: 90,
    requireMFA: false,
    allowRemoteAccess: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    appointmentReminders: true,
    medicationAlerts: true,
    systemMaintenance: true,
    criticalAlerts: true
  });

  const [systemConfig, setSystemConfig] = useState({
    backupFrequency: 'daily',
    dataRetention: 365,
    auditLogging: true,
    encryptionEnabled: true,
    autoUpdates: false,
    maintenanceMode: false
  });

  // Load settings from database
  useEffect(() => {
    if (!loading) {
      // Load hospital settings (admin only)
      if (dbHospitalSettings.hospital_info) {
        setHospitalInfo(dbHospitalSettings.hospital_info);
      }
      if (dbHospitalSettings.regional_settings) {
        setRegionalSettings(dbHospitalSettings.regional_settings);
      }
      if (dbHospitalSettings.security_settings) {
        setSecuritySettings(dbHospitalSettings.security_settings);
      }
      if (dbHospitalSettings.notification_defaults) {
        setNotificationSettings(dbHospitalSettings.notification_defaults);
      }
      if (dbHospitalSettings.system_config) {
        setSystemConfig(dbHospitalSettings.system_config);
      }

      // Load user-specific settings
      if (dbUserSettings.notifications) {
        setNotificationSettings(dbUserSettings.notifications);
      }
    }
  }, [loading, dbHospitalSettings, dbUserSettings]);

  const handleSaveHospitalSettings = async () => {
    const success = await saveHospitalSetting('hospital_info', hospitalInfo, 'hospital');
    if (success) {
      toast({ title: 'Success', description: 'Hospital information saved successfully' });
    }
  };

  const handleSaveRegionalSettings = async () => {
    const success = await saveHospitalSetting('regional_settings', regionalSettings, 'hospital');
    if (success) {
      toast({ title: 'Success', description: 'Regional settings saved successfully' });
    }
  };

  const handleSaveSecuritySettings = async () => {
    const success = await saveHospitalSetting('security_settings', securitySettings, 'security');
    if (success) {
      toast({ title: 'Success', description: 'Security settings saved successfully' });
    }
  };

  const handleSaveNotificationSettings = async () => {
    // User-specific notification preferences
    const success = await saveUserSetting('notifications', notificationSettings);
    if (success) {
      toast({ title: 'Success', description: 'Notification preferences saved successfully' });
    }
  };

  const handleSaveSystemSettings = async () => {
    const success = await saveHospitalSetting('system_config', systemConfig, 'system');
    if (success) {
      toast({ title: 'Success', description: 'System configuration saved successfully' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage hospital and system settings</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4" />
          System Configuration
        </Badge>
      </div>

      <Tabs defaultValue={user?.role === 'admin' ? 'hospital' : 'notifications'} className="space-y-6">
        <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {user?.role === 'admin' && (
            <>
              <TabsTrigger value="hospital" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hospital
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                System
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hospital" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Hospital Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={hospitalInfo.name}
                    onChange={(e) => setHospitalInfo({...hospitalInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input
                    id="license"
                    value={hospitalInfo.license}
                    onChange={(e) => setHospitalInfo({...hospitalInfo, license: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={hospitalInfo.address}
                  onChange={(e) => setHospitalInfo({...hospitalInfo, address: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={hospitalInfo.phone}
                    onChange={(e) => setHospitalInfo({...hospitalInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={hospitalInfo.email}
                    onChange={(e) => setHospitalInfo({...hospitalInfo, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={hospitalInfo.website}
                    onChange={(e) => setHospitalInfo({...hospitalInfo, website: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={regionalSettings.timezone} onValueChange={(value) => setRegionalSettings({...regionalSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={regionalSettings.language} onValueChange={(value) => setRegionalSettings({...regionalSettings, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={regionalSettings.currency} onValueChange={(value) => setRegionalSettings({...regionalSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                  <Input
                    id="autoLogout"
                    type="number"
                    value={securitySettings.autoLogout}
                    onChange={(e) => setSecuritySettings({...securitySettings, autoLogout: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require MFA for all user accounts</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireMFA}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireMFA: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Remote Access</Label>
                    <p className="text-sm text-muted-foreground">Allow users to access from outside network</p>
                  </div>
                  <Switch
                    checked={securitySettings.allowRemoteAccess}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, allowRemoteAccess: checked})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSecuritySettings}>
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send appointment reminders to patients</p>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appointmentReminders: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Medication Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send medication and prescription alerts</p>
                  </div>
                  <Switch
                    checked={notificationSettings.medicationAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, medicationAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Maintenance</Label>
                    <p className="text-sm text-muted-foreground">Notify about system maintenance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemMaintenance}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemMaintenance: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Critical Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send critical system alerts</p>
                  </div>
                  <Switch
                    checked={notificationSettings.criticalAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, criticalAlerts: checked})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveNotificationSettings}>
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select value={systemConfig.backupFrequency} onValueChange={(value) => setSystemConfig({...systemConfig, backupFrequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={systemConfig.dataRetention}
                    onChange={(e) => setSystemConfig({...systemConfig, dataRetention: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Enable comprehensive audit logging</p>
                  </div>
                  <Switch
                    checked={systemConfig.auditLogging}
                    onCheckedChange={(checked) => setSystemConfig({...systemConfig, auditLogging: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Enable data encryption at rest</p>
                  </div>
                  <Switch
                    checked={systemConfig.encryptionEnabled}
                    onCheckedChange={(checked) => setSystemConfig({...systemConfig, encryptionEnabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Updates</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic system updates</p>
                  </div>
                  <Switch
                    checked={systemConfig.autoUpdates}
                    onCheckedChange={(checked) => setSystemConfig({...systemConfig, autoUpdates: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable maintenance mode</p>
                  </div>
                  <Switch
                    checked={systemConfig.maintenanceMode}
                    onCheckedChange={(checked) => setSystemConfig({...systemConfig, maintenanceMode: checked})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSystemSettings}>
                  Save System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;