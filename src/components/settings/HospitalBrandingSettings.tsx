import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Image as ImageIcon, 
  Palette, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Globe,
  Loader2,
  X,
  FileText
} from 'lucide-react';

interface BrandingSettings {
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

interface HospitalBrandingSettingsProps {
  settings: BrandingSettings;
  onSettingsChange: (settings: BrandingSettings) => void;
  onSave: () => Promise<void>;
}

const HospitalBrandingSettings: React.FC<HospitalBrandingSettingsProps> = ({
  settings,
  onSettingsChange,
  onSave
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Delete old logo if exists
      if (settings.logoUrl) {
        const oldPath = settings.logoUrl.split('/hospital-branding/')[1];
        if (oldPath) {
          await supabase.storage.from('hospital-branding').remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('hospital-branding')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hospital-branding')
        .getPublicUrl(filePath);

      onSettingsChange({ ...settings, logoUrl: publicUrl });
      
      toast({
        title: 'Logo uploaded',
        description: 'Hospital logo has been uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (settings.logoUrl) {
      const oldPath = settings.logoUrl.split('/hospital-branding/')[1];
      if (oldPath) {
        await supabase.storage.from('hospital-branding').remove([oldPath]);
      }
    }
    onSettingsChange({ ...settings, logoUrl: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Medical Blue', primary: '#0066CC', secondary: '#004999', accent: '#00AAFF' },
    { name: 'Healthcare Green', primary: '#00875A', secondary: '#006644', accent: '#36B37E' },
    { name: 'Professional Purple', primary: '#5243AA', secondary: '#403294', accent: '#8777D9' },
    { name: 'Trust Teal', primary: '#00838F', secondary: '#006064', accent: '#26C6DA' },
    { name: 'Warm Red', primary: '#C62828', secondary: '#B71C1C', accent: '#EF5350' },
  ];

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    onSettingsChange({
      ...settings,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hospital Logo
          </CardTitle>
          <CardDescription>
            Upload your hospital logo for reports and letterheads (PNG or JPG, max 2MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-6">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt="Hospital Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <Building className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No logo uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
              
              {settings.logoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove Logo
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                Recommended: Square image, minimum 200x200 pixels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Letterhead Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Letterhead Information
          </CardTitle>
          <CardDescription>
            This information appears on all printed reports and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brandHospitalName">Hospital Name</Label>
              <Input
                id="brandHospitalName"
                value={settings.hospitalName}
                onChange={(e) => onSettingsChange({ ...settings, hospitalName: e.target.value })}
                placeholder="City General Hospital"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline / Slogan</Label>
              <Input
                id="tagline"
                value={settings.tagline}
                onChange={(e) => onSettingsChange({ ...settings, tagline: e.target.value })}
                placeholder="Excellence in Healthcare"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Textarea
              id="brandAddress"
              value={settings.address}
              onChange={(e) => onSettingsChange({ ...settings, address: e.target.value })}
              placeholder="123 Medical Center Drive, Suite 100&#10;City, State 12345"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brandPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="brandPhone"
                value={settings.phone}
                onChange={(e) => onSettingsChange({ ...settings, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="brandEmail"
                type="email"
                value={settings.email}
                onChange={(e) => onSettingsChange({ ...settings, email: e.target.value })}
                placeholder="info@hospital.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandWebsite" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="brandWebsite"
                value={settings.website}
                onChange={(e) => onSettingsChange({ ...settings, website: e.target.value })}
                placeholder="www.hospital.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerText">Report Footer Text</Label>
            <Input
              id="footerText"
              value={settings.footerText}
              onChange={(e) => onSettingsChange({ ...settings, footerText: e.target.value })}
              placeholder="This is a computer-generated report. No signature required."
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Report Branding Colors
          </CardTitle>
          <CardDescription>
            Customize the colors used in printed reports and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div className="space-y-2">
            <Label>Color Presets</Label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyColorPreset(preset)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: preset.primary }}
                  />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={settings.primaryColor}
                  onChange={(e) => onSettingsChange({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => onSettingsChange({ ...settings, primaryColor: e.target.value })}
                  placeholder="#0066CC"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={(e) => onSettingsChange({ ...settings, secondaryColor: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => onSettingsChange({ ...settings, secondaryColor: e.target.value })}
                  placeholder="#004999"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="accentColor"
                  value={settings.accentColor}
                  onChange={(e) => onSettingsChange({ ...settings, accentColor: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => onSettingsChange({ ...settings, accentColor: e.target.value })}
                  placeholder="#00AAFF"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headerBgColor">Header Background</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="headerBgColor"
                  value={settings.headerBgColor}
                  onChange={(e) => onSettingsChange({ ...settings, headerBgColor: e.target.value })}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={settings.headerBgColor}
                  onChange={(e) => onSettingsChange({ ...settings, headerBgColor: e.target.value })}
                  placeholder="#F5F5F5"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Color Preview</Label>
            <div className="border rounded-lg p-4 space-y-3">
              <div 
                className="h-12 rounded flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: settings.primaryColor || '#0066CC' }}
              >
                Primary Color - Report Headers
              </div>
              <div className="flex gap-3">
                <div 
                  className="h-10 flex-1 rounded flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: settings.secondaryColor || '#004999' }}
                >
                  Secondary
                </div>
                <div 
                  className="h-10 flex-1 rounded flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: settings.accentColor || '#00AAFF' }}
                >
                  Accent
                </div>
                <div 
                  className="h-10 flex-1 rounded border flex items-center justify-center text-sm"
                  style={{ backgroundColor: settings.headerBgColor || '#F5F5F5' }}
                >
                  Header BG
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Branding Settings'
          )}
        </Button>
      </div>
    </div>
  );
};

export default HospitalBrandingSettings;
