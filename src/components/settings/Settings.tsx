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

  // Doctor-specific settings
  const [doctorSettings, setDoctorSettings] = useState({
    defaultConsultationDuration: 30,
    allowOnlineConsultations: true,
    autoConfirmAppointments: false,
    prescriptionTemplate: 'standard',
    labTestDefaults: true,
    appointmentReminders: 24,
    maxDailyAppointments: 20
  });

  // Nurse-specific settings
  const [nurseSettings, setNurseSettings] = useState({
    shiftStartTime: '08:00',
    shiftEndTime: '16:00',
    breakDuration: 30,
    priorityAlerts: true,
    roundsFrequency: 2,
    vitalSignsInterval: 4,
    medicationReminders: true
  });

  // Patient-specific settings
  const [patientSettings, setPatientSettings] = useState({
    preferredContactMethod: 'email',
    appointmentReminders: true,
    reminderTime: 24,
    allowSmsReminders: true,
    shareRecordsWithFamily: false,
    requestPrescriptionRefills: true,
    preferredPharmacy: '',
    emergencyContact: ''
  });

  // Pharmacist-specific settings
  const [pharmacistSettings, setPharmacistSettings] = useState({
    lowStockAlert: 10,
    expiryAlertDays: 30,
    autoReorder: false,
    reorderQuantity: 50,
    dispensingQueue: true,
    verificationRequired: true,
    inventoryAlerts: true
  });

  // Receptionist-specific settings
  const [receptionistSettings, setReceptionistSettings] = useState({
    defaultAppointmentDuration: 30,
    allowWalkIns: true,
    maxSameDayBookings: 5,
    requireInsuranceInfo: true,
    autoAssignDoctor: false,
    sendConfirmationEmail: true,
    checkInReminders: true
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
      if (dbUserSettings.doctor_preferences && user?.role === 'doctor') {
        setDoctorSettings(dbUserSettings.doctor_preferences);
      }
      if (dbUserSettings.nurse_preferences && user?.role === 'nurse') {
        setNurseSettings(dbUserSettings.nurse_preferences);
      }
      if (dbUserSettings.patient_preferences && user?.role === 'patient') {
        setPatientSettings(dbUserSettings.patient_preferences);
      }
      if (dbUserSettings.pharmacist_preferences && user?.role === 'pharmacist') {
        setPharmacistSettings(dbUserSettings.pharmacist_preferences);
      }
      if (dbUserSettings.receptionist_preferences && user?.role === 'receptionist') {
        setReceptionistSettings(dbUserSettings.receptionist_preferences);
      }
    }
  }, [loading, dbHospitalSettings, dbUserSettings, user?.role]);

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

  const handleSaveDoctorSettings = async () => {
    const success = await saveUserSetting('doctor_preferences', doctorSettings);
    if (success) {
      toast({ title: 'Success', description: 'Doctor preferences saved successfully' });
    }
  };

  const handleSaveNurseSettings = async () => {
    const success = await saveUserSetting('nurse_preferences', nurseSettings);
    if (success) {
      toast({ title: 'Success', description: 'Nurse preferences saved successfully' });
    }
  };

  const handleSavePatientSettings = async () => {
    const success = await saveUserSetting('patient_preferences', patientSettings);
    if (success) {
      toast({ title: 'Success', description: 'Patient preferences saved successfully' });
    }
  };

  const handleSavePharmacistSettings = async () => {
    const success = await saveUserSetting('pharmacist_preferences', pharmacistSettings);
    if (success) {
      toast({ title: 'Success', description: 'Pharmacist preferences saved successfully' });
    }
  };

  const handleSaveReceptionistSettings = async () => {
    const success = await saveUserSetting('receptionist_preferences', receptionistSettings);
    if (success) {
      toast({ title: 'Success', description: 'Receptionist preferences saved successfully' });
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

      <Tabs defaultValue={user?.role === 'admin' ? 'hospital' : user?.role === 'patient' ? 'personal' : 'preferences'} className="space-y-6">
        <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-2'}`}>
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
          {(user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'pharmacist' || user?.role === 'receptionist') && (
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Preferences
            </TabsTrigger>
          )}
          {user?.role === 'patient' && (
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personal
            </TabsTrigger>
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

              <div className="pt-4 flex gap-3">
                <Button onClick={handleSaveHospitalSettings}>
                  Save Hospital Information
                </Button>
                <Button onClick={handleSaveRegionalSettings} variant="outline">
                  Save Regional Settings
                </Button>
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

        {/* Doctor Preferences Tab */}
        {user?.role === 'doctor' && (
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultationDuration">Default Consultation Duration (minutes)</Label>
                    <Input
                      id="consultationDuration"
                      type="number"
                      value={doctorSettings.defaultConsultationDuration}
                      onChange={(e) => setDoctorSettings({...doctorSettings, defaultConsultationDuration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentReminders">Appointment Reminder (hours before)</Label>
                    <Input
                      id="appointmentReminders"
                      type="number"
                      value={doctorSettings.appointmentReminders}
                      onChange={(e) => setDoctorSettings({...doctorSettings, appointmentReminders: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAppointments">Maximum Daily Appointments</Label>
                  <Input
                    id="maxAppointments"
                    type="number"
                    value={doctorSettings.maxDailyAppointments}
                    onChange={(e) => setDoctorSettings({...doctorSettings, maxDailyAppointments: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescriptionTemplate">Prescription Template</Label>
                  <Select value={doctorSettings.prescriptionTemplate} onValueChange={(value) => setDoctorSettings({...doctorSettings, prescriptionTemplate: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Online Consultations</Label>
                      <p className="text-sm text-muted-foreground">Accept virtual appointments</p>
                    </div>
                    <Switch
                      checked={doctorSettings.allowOnlineConsultations}
                      onCheckedChange={(checked) => setDoctorSettings({...doctorSettings, allowOnlineConsultations: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Confirm Appointments</Label>
                      <p className="text-sm text-muted-foreground">Automatically confirm new bookings</p>
                    </div>
                    <Switch
                      checked={doctorSettings.autoConfirmAppointments}
                      onCheckedChange={(checked) => setDoctorSettings({...doctorSettings, autoConfirmAppointments: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lab Test Defaults</Label>
                      <p className="text-sm text-muted-foreground">Use default lab test templates</p>
                    </div>
                    <Switch
                      checked={doctorSettings.labTestDefaults}
                      onCheckedChange={(checked) => setDoctorSettings({...doctorSettings, labTestDefaults: checked})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveDoctorSettings}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Nurse Preferences Tab */}
        {user?.role === 'nurse' && (
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nurse Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shiftStart">Shift Start Time</Label>
                    <Input
                      id="shiftStart"
                      type="time"
                      value={nurseSettings.shiftStartTime}
                      onChange={(e) => setNurseSettings({...nurseSettings, shiftStartTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftEnd">Shift End Time</Label>
                    <Input
                      id="shiftEnd"
                      type="time"
                      value={nurseSettings.shiftEndTime}
                      onChange={(e) => setNurseSettings({...nurseSettings, shiftEndTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                    <Input
                      id="breakDuration"
                      type="number"
                      value={nurseSettings.breakDuration}
                      onChange={(e) => setNurseSettings({...nurseSettings, breakDuration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roundsFrequency">Rounds per Shift</Label>
                    <Input
                      id="roundsFrequency"
                      type="number"
                      value={nurseSettings.roundsFrequency}
                      onChange={(e) => setNurseSettings({...nurseSettings, roundsFrequency: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vitalsInterval">Vital Signs Check Interval (hours)</Label>
                    <Input
                      id="vitalsInterval"
                      type="number"
                      value={nurseSettings.vitalSignsInterval}
                      onChange={(e) => setNurseSettings({...nurseSettings, vitalSignsInterval: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Priority Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive high-priority patient alerts</p>
                    </div>
                    <Switch
                      checked={nurseSettings.priorityAlerts}
                      onCheckedChange={(checked) => setNurseSettings({...nurseSettings, priorityAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Medication Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get alerts for medication administration</p>
                    </div>
                    <Switch
                      checked={nurseSettings.medicationReminders}
                      onCheckedChange={(checked) => setNurseSettings({...nurseSettings, medicationReminders: checked})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveNurseSettings}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Patient Preferences Tab */}
        {user?.role === 'patient' && (
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                  <Select value={patientSettings.preferredContactMethod} onValueChange={(value) => setPatientSettings({...patientSettings, preferredContactMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Appointment Reminder (hours before)</Label>
                  <Input
                    id="reminderTime"
                    type="number"
                    value={patientSettings.reminderTime}
                    onChange={(e) => setPatientSettings({...patientSettings, reminderTime: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredPharmacy">Preferred Pharmacy</Label>
                  <Input
                    id="preferredPharmacy"
                    value={patientSettings.preferredPharmacy}
                    onChange={(e) => setPatientSettings({...patientSettings, preferredPharmacy: e.target.value})}
                    placeholder="Enter pharmacy name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={patientSettings.emergencyContact}
                    onChange={(e) => setPatientSettings({...patientSettings, emergencyContact: e.target.value})}
                    placeholder="Name and phone number"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive appointment reminders</p>
                    </div>
                    <Switch
                      checked={patientSettings.appointmentReminders}
                      onCheckedChange={(checked) => setPatientSettings({...patientSettings, appointmentReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Reminders</Label>
                      <p className="text-sm text-muted-foreground">Allow SMS text messages</p>
                    </div>
                    <Switch
                      checked={patientSettings.allowSmsReminders}
                      onCheckedChange={(checked) => setPatientSettings({...patientSettings, allowSmsReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Records with Family</Label>
                      <p className="text-sm text-muted-foreground">Allow family members to view records</p>
                    </div>
                    <Switch
                      checked={patientSettings.shareRecordsWithFamily}
                      onCheckedChange={(checked) => setPatientSettings({...patientSettings, shareRecordsWithFamily: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Prescription Refill Requests</Label>
                      <p className="text-sm text-muted-foreground">Enable online refill requests</p>
                    </div>
                    <Switch
                      checked={patientSettings.requestPrescriptionRefills}
                      onCheckedChange={(checked) => setPatientSettings({...patientSettings, requestPrescriptionRefills: checked})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSavePatientSettings}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Pharmacist Preferences Tab */}
        {user?.role === 'pharmacist' && (
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacist Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lowStockAlert">Low Stock Alert Level</Label>
                    <Input
                      id="lowStockAlert"
                      type="number"
                      value={pharmacistSettings.lowStockAlert}
                      onChange={(e) => setPharmacistSettings({...pharmacistSettings, lowStockAlert: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryAlert">Expiry Alert (days before)</Label>
                    <Input
                      id="expiryAlert"
                      type="number"
                      value={pharmacistSettings.expiryAlertDays}
                      onChange={(e) => setPharmacistSettings({...pharmacistSettings, expiryAlertDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderQuantity">Default Reorder Quantity</Label>
                  <Input
                    id="reorderQuantity"
                    type="number"
                    value={pharmacistSettings.reorderQuantity}
                    onChange={(e) => setPharmacistSettings({...pharmacistSettings, reorderQuantity: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Reorder</Label>
                      <p className="text-sm text-muted-foreground">Auto-reorder when stock is low</p>
                    </div>
                    <Switch
                      checked={pharmacistSettings.autoReorder}
                      onCheckedChange={(checked) => setPharmacistSettings({...pharmacistSettings, autoReorder: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dispensing Queue</Label>
                      <p className="text-sm text-muted-foreground">Use queue system for prescriptions</p>
                    </div>
                    <Switch
                      checked={pharmacistSettings.dispensingQueue}
                      onCheckedChange={(checked) => setPharmacistSettings({...pharmacistSettings, dispensingQueue: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verification Required</Label>
                      <p className="text-sm text-muted-foreground">Require double-check verification</p>
                    </div>
                    <Switch
                      checked={pharmacistSettings.verificationRequired}
                      onCheckedChange={(checked) => setPharmacistSettings({...pharmacistSettings, verificationRequired: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Inventory Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive inventory status alerts</p>
                    </div>
                    <Switch
                      checked={pharmacistSettings.inventoryAlerts}
                      onCheckedChange={(checked) => setPharmacistSettings({...pharmacistSettings, inventoryAlerts: checked})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSavePharmacistSettings}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Receptionist Preferences Tab */}
        {user?.role === 'receptionist' && (
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receptionist Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDuration">Default Appointment Duration (minutes)</Label>
                    <Input
                      id="appointmentDuration"
                      type="number"
                      value={receptionistSettings.defaultAppointmentDuration}
                      onChange={(e) => setReceptionistSettings({...receptionistSettings, defaultAppointmentDuration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxBookings">Max Same-Day Bookings</Label>
                    <Input
                      id="maxBookings"
                      type="number"
                      value={receptionistSettings.maxSameDayBookings}
                      onChange={(e) => setReceptionistSettings({...receptionistSettings, maxSameDayBookings: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Walk-ins</Label>
                      <p className="text-sm text-muted-foreground">Accept walk-in patients</p>
                    </div>
                    <Switch
                      checked={receptionistSettings.allowWalkIns}
                      onCheckedChange={(checked) => setReceptionistSettings({...receptionistSettings, allowWalkIns: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Insurance Info</Label>
                      <p className="text-sm text-muted-foreground">Mandatory insurance information</p>
                    </div>
                    <Switch
                      checked={receptionistSettings.requireInsuranceInfo}
                      onCheckedChange={(checked) => setReceptionistSettings({...receptionistSettings, requireInsuranceInfo: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Assign Doctor</Label>
                      <p className="text-sm text-muted-foreground">Automatically assign available doctor</p>
                    </div>
                    <Switch
                      checked={receptionistSettings.autoAssignDoctor}
                      onCheckedChange={(checked) => setReceptionistSettings({...receptionistSettings, autoAssignDoctor: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Confirmation Email</Label>
                      <p className="text-sm text-muted-foreground">Email confirmation for bookings</p>
                    </div>
                    <Switch
                      checked={receptionistSettings.sendConfirmationEmail}
                      onCheckedChange={(checked) => setReceptionistSettings({...receptionistSettings, sendConfirmationEmail: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Check-in Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send check-in reminders to patients</p>
                    </div>
                    <Switch
                      checked={receptionistSettings.checkInReminders}
                      onCheckedChange={(checked) => setReceptionistSettings({...receptionistSettings, checkInReminders: checked})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveReceptionistSettings}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
};

export default Settings;