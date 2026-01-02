import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import DataTable from '@/components/shared/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Trash2, Edit, Copy, Globe, User } from 'lucide-react';

interface MedicationItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  route?: string;
}

interface PrescriptionTemplate {
  id: string;
  doctor_id?: string;
  template_name: string;
  description?: string;
  is_global: boolean;
  diagnosis_category?: string;
  medications: MedicationItem[];
  created_at: string;
}

interface FormMedication {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
}

interface PrescriptionTemplatesProps {
  onSelectTemplate?: (template: PrescriptionTemplate) => void;
  selectionMode?: boolean;
}

const PrescriptionTemplates: React.FC<PrescriptionTemplatesProps> = ({
  onSelectTemplate,
  selectionMode = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PrescriptionTemplate | null>(null);
  const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    template_name: string;
    description: string;
    is_global: boolean;
    diagnosis_category: string;
    medications: FormMedication[];
  }>({
    template_name: '',
    description: '',
    is_global: false,
    diagnosis_category: '',
    medications: [{ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '', route: 'oral' }]
  });

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      // Get current doctor ID
      if (user?.id) {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (doctorData) {
          setCurrentDoctorId(doctorData.id);
        }
      }

      // Fetch templates
      const { data, error } = await supabase
        .from('prescription_templates')
        .select('*')
        .order('template_name');

      if (error) throw error;
      
      // Parse medications JSON with proper type handling
      const parsed: PrescriptionTemplate[] = (data || []).map(t => ({
        id: t.id,
        doctor_id: t.doctor_id || undefined,
        template_name: t.template_name,
        description: t.description || undefined,
        is_global: t.is_global || false,
        diagnosis_category: t.diagnosis_category || undefined,
        medications: Array.isArray(t.medications) 
          ? (t.medications as unknown as MedicationItem[])
          : [],
        created_at: t.created_at || ''
      }));
      
      setTemplates(parsed);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentDoctorId && !formData.is_global) {
      toast({ title: 'Error', description: 'Doctor profile not found', variant: 'destructive' });
      return;
    }

    try {
      const medicationsJson = formData.medications.filter(m => m.medication_name.trim()).map(m => ({
        medication_name: m.medication_name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
        route: m.route
      }));

      const templateData = {
        template_name: formData.template_name,
        description: formData.description,
        is_global: formData.is_global,
        diagnosis_category: formData.diagnosis_category,
        doctor_id: formData.is_global ? null : currentDoctorId,
        medications: medicationsJson as unknown as any
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('prescription_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Template updated' });
      } else {
        const { error } = await supabase
          .from('prescription_templates')
          .insert([templateData as any]);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Template created' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({ title: 'Error', description: 'Failed to save template', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      template_name: '',
      description: '',
      is_global: false,
      diagnosis_category: '',
      medications: [{ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '', route: 'oral' }]
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template: PrescriptionTemplate) => {
    setEditingTemplate(template);
    const meds: FormMedication[] = template.medications.length > 0 
      ? template.medications.map(m => ({
          medication_name: m.medication_name || '',
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          duration: m.duration || '',
          instructions: m.instructions || '',
          route: m.route || 'oral'
        }))
      : [{ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '', route: 'oral' }];
    
    setFormData({
      template_name: template.template_name,
      description: template.description || '',
      is_global: template.is_global,
      diagnosis_category: template.diagnosis_category || '',
      medications: meds
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prescription_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: 'Success', description: 'Template deleted' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    }
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '', route: 'oral' }]
    });
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...formData.medications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, medications: updated });
  };

  const columns = [
    {
      key: 'template_name',
      label: 'Template Name',
      render: (template: PrescriptionTemplate) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{template.template_name}</span>
          {template.is_global ? (
            <Badge variant="secondary"><Globe className="h-3 w-3 mr-1" />Global</Badge>
          ) : (
            <Badge variant="outline"><User className="h-3 w-3 mr-1" />Personal</Badge>
          )}
        </div>
      )
    },
    {
      key: 'medications',
      label: 'Medications',
      render: (template: PrescriptionTemplate) => (
        <div className="flex flex-wrap gap-1">
          {template.medications.slice(0, 3).map((med, i) => (
            <Badge key={i} variant="outline">{med.medication_name}</Badge>
          ))}
          {template.medications.length > 3 && (
            <Badge variant="secondary">+{template.medications.length - 3} more</Badge>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (template: PrescriptionTemplate) => (
        <span className="text-sm text-muted-foreground">{template.diagnosis_category || '-'}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (template: PrescriptionTemplate) => (
        <div className="flex gap-2">
          {selectionMode && (
            <Button size="sm" onClick={() => onSelectTemplate?.(template)}>
              <Copy className="h-4 w-4 mr-1" />
              Use
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleEdit(template)}>
            <Edit className="h-4 w-4" />
          </Button>
          {(!template.is_global || user?.role === 'admin') && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(template.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prescription Templates</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input 
                    value={formData.template_name}
                    onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                    placeholder="e.g., Common Cold Treatment"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis Category</Label>
                  <Input 
                    value={formData.diagnosis_category}
                    onChange={(e) => setFormData({...formData, diagnosis_category: e.target.value})}
                    placeholder="e.g., Respiratory"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="When to use this template..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.is_global}
                  onCheckedChange={(checked) => setFormData({...formData, is_global: checked})}
                />
                <Label>Make this a global template (available to all doctors)</Label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Medications</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medication
                  </Button>
                </div>

                {formData.medications.map((med, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Medication {index + 1}</span>
                      {formData.medications.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input 
                        placeholder="Medication name *"
                        value={med.medication_name}
                        onChange={(e) => updateMedication(index, 'medication_name', e.target.value)}
                      />
                      <Input 
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      />
                      <Input 
                        placeholder="Frequency (e.g., 2x daily)"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input 
                        placeholder="Duration (e.g., 7 days)"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      />
                      <Input 
                        placeholder="Route (oral, IV, etc.)"
                        value={med.route}
                        onChange={(e) => updateMedication(index, 'route', e.target.value)}
                      />
                      <Input 
                        placeholder="Special instructions"
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading templates...</div>
        ) : (
          <DataTable 
            title=""
            data={templates}
            columns={columns}
            searchable={true}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionTemplates;
