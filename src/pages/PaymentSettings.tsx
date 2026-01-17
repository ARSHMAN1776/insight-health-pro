import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { 
  CreditCard, 
  Key, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Eye, 
  EyeOff,
  DollarSign,
  Building,
  Banknote,
  Settings,
  ArrowRightLeft,
  Info
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface PaymentConfig {
  stripeEnabled: boolean;
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  stripeMode: 'test' | 'live';
  defaultCurrency: string;
  autoCapture: boolean;
  allowPartialPayments: boolean;
  paymentMethods: string[];
  transfersEnabled: boolean;
  transferSchedule: 'instant' | 'daily' | 'weekly' | 'monthly';
  minimumTransferAmount: number;
}

const defaultConfig: PaymentConfig = {
  stripeEnabled: false,
  stripeSecretKey: '',
  stripePublishableKey: '',
  stripeWebhookSecret: '',
  stripeMode: 'test',
  defaultCurrency: 'USD',
  autoCapture: true,
  allowPartialPayments: true,
  paymentMethods: ['card'],
  transfersEnabled: false,
  transferSchedule: 'daily',
  minimumTransferAmount: 100,
};

const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { loading, hospitalSettings, saveHospitalSetting, refreshSettings } = useSettings();
  
  const [config, setConfig] = useState<PaymentConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load settings from database
  useEffect(() => {
    if (!loading && hospitalSettings.payment_config) {
      setConfig({ ...defaultConfig, ...hospitalSettings.payment_config });
    }
  }, [loading, hospitalSettings]);

  const handleSave = async () => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can modify payment settings',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const success = await saveHospitalSetting('payment_config', config, 'payment');
      if (success) {
        toast({ 
          title: 'Success', 
          description: 'Payment settings saved successfully' 
        });
        await refreshSettings();
      }
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.stripeSecretKey) {
      toast({
        title: 'Missing API Key',
        description: 'Please enter your Stripe Secret Key first',
        variant: 'destructive',
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    // Simulate API validation (in production, this would call an edge function)
    setTimeout(() => {
      const isValidKey = config.stripeSecretKey.startsWith('sk_test_') || 
                         config.stripeSecretKey.startsWith('sk_live_') ||
                         config.stripeSecretKey.startsWith('rk_test_') ||
                         config.stripeSecretKey.startsWith('rk_live_');
      
      if (isValidKey) {
        setConnectionStatus('success');
        toast({
          title: 'Connection Successful',
          description: 'Stripe API key is valid and connected',
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Connection Failed',
          description: 'Invalid Stripe API key format. Keys should start with sk_ or rk_',
          variant: 'destructive',
        });
      }
      setTestingConnection(false);
    }, 1500);
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 12) return key;
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Only administrators can access payment settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Settings</h1>
            <p className="text-muted-foreground">Configure payment gateways and transfer settings</p>
          </div>
          <Badge variant={config.stripeEnabled ? 'default' : 'secondary'} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {config.stripeEnabled ? 'Payments Enabled' : 'Payments Disabled'}
          </Badge>
        </div>

        {/* Status Alert */}
        {!config.stripeEnabled && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Payment Gateway Not Configured</AlertTitle>
            <AlertDescription>
              Configure your Stripe API keys below to enable online payments in the patient portal.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="stripe" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Stripe Setup
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Transfers
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Options
            </TabsTrigger>
          </TabsList>

          {/* Stripe Setup Tab */}
          <TabsContent value="stripe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Enter your Stripe API keys from the{' '}
                  <a 
                    href="https://dashboard.stripe.com/apikeys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Stripe Dashboard
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Selection */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Environment Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use test mode for development, live mode for production
                    </p>
                  </div>
                  <Select 
                    value={config.stripeMode} 
                    onValueChange={(value: 'test' | 'live') => setConfig({...config, stripeMode: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Test</Badge>
                        </span>
                      </SelectItem>
                      <SelectItem value="live">
                        <span className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">Live</Badge>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.stripeMode === 'live' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Live Mode Active</AlertTitle>
                    <AlertDescription>
                      You are configuring live payment credentials. Real transactions will be processed.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Secret Key */}
                <div className="space-y-2">
                  <Label htmlFor="secretKey" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    Secret Key (Server-side)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="secretKey"
                        type={showSecretKey ? 'text' : 'password'}
                        value={config.stripeSecretKey}
                        onChange={(e) => setConfig({...config, stripeSecretKey: e.target.value})}
                        placeholder={`sk_${config.stripeMode}_...`}
                        className="pr-10 font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={testConnection}
                      disabled={testingConnection || !config.stripeSecretKey}
                    >
                      {testingConnection ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : connectionStatus === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : connectionStatus === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Never share your secret key. It's used server-side only.
                  </p>
                </div>

                {/* Publishable Key */}
                <div className="space-y-2">
                  <Label htmlFor="publishableKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Publishable Key (Client-side)
                  </Label>
                  <Input
                    id="publishableKey"
                    value={config.stripePublishableKey}
                    onChange={(e) => setConfig({...config, stripePublishableKey: e.target.value})}
                    placeholder={`pk_${config.stripeMode}_...`}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    This key is safe to include in client-side code.
                  </p>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-2">
                  <Label htmlFor="webhookSecret" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Webhook Signing Secret (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="webhookSecret"
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={config.stripeWebhookSecret}
                      onChange={(e) => setConfig({...config, stripeWebhookSecret: e.target.value})}
                      placeholder="whsec_..."
                      className="pr-10 font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    >
                      {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used to verify webhook events from Stripe.
                  </p>
                </div>

                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Stripe Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow patients to pay online through the patient portal
                    </p>
                  </div>
                  <Switch
                    checked={config.stripeEnabled}
                    onCheckedChange={(checked) => setConfig({...config, stripeEnabled: checked})}
                    disabled={!config.stripeSecretKey || !config.stripePublishableKey}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Transfer Settings
                </CardTitle>
                <CardDescription>
                  Configure how payments are transferred to hospital accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable Transfers */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Automatic Transfers</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically transfer collected payments to your bank account
                    </p>
                  </div>
                  <Switch
                    checked={config.transfersEnabled}
                    onCheckedChange={(checked) => setConfig({...config, transfersEnabled: checked})}
                  />
                </div>

                {config.transfersEnabled && (
                  <>
                    {/* Transfer Schedule */}
                    <div className="space-y-2">
                      <Label>Transfer Schedule</Label>
                      <Select 
                        value={config.transferSchedule} 
                        onValueChange={(value: 'instant' | 'daily' | 'weekly' | 'monthly') => 
                          setConfig({...config, transferSchedule: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant (additional fees apply)</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Minimum Transfer Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="minTransfer">Minimum Transfer Amount</Label>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="minTransfer"
                          type="number"
                          value={config.minimumTransferAmount}
                          onChange={(e) => setConfig({...config, minimumTransferAmount: parseInt(e.target.value) || 0})}
                          className="w-32"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Transfers will only occur when balance exceeds this amount
                      </p>
                    </div>
                  </>
                )}

                <Alert>
                  <Building className="h-4 w-4" />
                  <AlertTitle>Bank Account Required</AlertTitle>
                  <AlertDescription>
                    To receive transfers, connect your bank account in the{' '}
                    <a 
                      href="https://dashboard.stripe.com/settings/payouts" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Stripe Dashboard
                    </a>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Payment Options
                </CardTitle>
                <CardDescription>
                  Configure payment behavior and accepted methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Currency */}
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select 
                    value={config.defaultCurrency} 
                    onValueChange={(value) => setConfig({...config, defaultCurrency: value})}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                      <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto Capture */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-capture Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically capture payments immediately after authorization
                    </p>
                  </div>
                  <Switch
                    checked={config.autoCapture}
                    onCheckedChange={(checked) => setConfig({...config, autoCapture: checked})}
                  />
                </div>

                {/* Partial Payments */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Partial Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow patients to pay a portion of their bill
                    </p>
                  </div>
                  <Switch
                    checked={config.allowPartialPayments}
                    onCheckedChange={(checked) => setConfig({...config, allowPartialPayments: checked})}
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <Label>Accepted Payment Methods</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'card', label: 'Credit/Debit Cards', icon: CreditCard },
                      { id: 'bank_transfer', label: 'Bank Transfer', icon: Building },
                    ].map((method) => (
                      <div 
                        key={method.id}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          config.paymentMethods.includes(method.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          const methods = config.paymentMethods.includes(method.id)
                            ? config.paymentMethods.filter(m => m !== method.id)
                            : [...config.paymentMethods, method.id];
                          setConfig({...config, paymentMethods: methods});
                        }}
                      >
                        <method.icon className={`h-5 w-5 ${
                          config.paymentMethods.includes(method.id) ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span className="font-medium">{method.label}</span>
                        {config.paymentMethods.includes(method.id) && (
                          <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setConfig(defaultConfig)}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSettings;
