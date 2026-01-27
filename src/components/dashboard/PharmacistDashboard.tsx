import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { 
  Pill, 
  Package, 
  AlertTriangle, 
  Clock, 
  Activity, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  AlertCircle,
  ListChecks,
  Loader2
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';
import RefillRequestReview from '../prescriptions/RefillRequestReview';

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  quantity: number | null;
  status: string | null;
  date_prescribed: string | null;
  instructions: string | null;
  drug_interactions: string | null;
  side_effects: string | null;
  patient_id: string;
  doctor_id: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
  doctors?: {
    first_name: string;
    last_name: string;
  };
}

interface Inventory {
  id: string;
  item_name: string;
  current_stock: number;
  minimum_stock: number | null;
  status: string | null;
}

// Common drug interaction database (simplified)
const DRUG_INTERACTIONS: Record<string, { interactsWith: string[], severity: 'mild' | 'moderate' | 'severe', warning: string }> = {
  'warfarin': { 
    interactsWith: ['aspirin', 'ibuprofen', 'naproxen', 'vitamin k'], 
    severity: 'severe', 
    warning: 'Increased bleeding risk' 
  },
  'metformin': { 
    interactsWith: ['alcohol', 'contrast dye'], 
    severity: 'moderate', 
    warning: 'Risk of lactic acidosis' 
  },
  'lisinopril': { 
    interactsWith: ['potassium', 'spironolactone', 'nsaids'], 
    severity: 'moderate', 
    warning: 'Risk of hyperkalemia' 
  },
  'simvastatin': { 
    interactsWith: ['grapefruit', 'erythromycin', 'clarithromycin'], 
    severity: 'severe', 
    warning: 'Risk of muscle damage' 
  },
  'amoxicillin': { 
    interactsWith: ['methotrexate', 'warfarin'], 
    severity: 'moderate', 
    warning: 'Increased drug effects' 
  },
};

const PharmacistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [dispensingDialogOpen, setDispensingDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dispensingNotes, setDispensingNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [interactionWarnings, setInteractionWarnings] = useState<{drug: string; warning: string; severity: string}[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prescriptionsResult, inventoryResult] = await Promise.all([
        supabase
          .from('prescriptions')
          .select(`
            id,
            medication_name,
            dosage,
            frequency,
            quantity,
            status,
            date_prescribed,
            instructions,
            drug_interactions,
            side_effects,
            patient_id,
            doctor_id,
            patients (first_name, last_name),
            doctors (first_name, last_name)
          `)
          .is('deleted_at', null)
          .order('date_prescribed', { ascending: false }),
        supabase
          .from('inventory')
          .select('id, item_name, current_stock, minimum_stock, status')
          .order('item_name')
      ]);
      
      if (prescriptionsResult.data) setPrescriptions(prescriptionsResult.data);
      if (inventoryResult.data) setInventory(inventoryResult.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDrugInteractions = (medicationName: string, patientPrescriptions: Prescription[]) => {
    const warnings: {drug: string; warning: string; severity: string}[] = [];
    const lowerMedName = medicationName.toLowerCase();
    
    // Check if the new medication has known interactions
    Object.entries(DRUG_INTERACTIONS).forEach(([drug, info]) => {
      if (lowerMedName.includes(drug)) {
        // Check against patient's other active prescriptions
        patientPrescriptions.forEach(p => {
          if (p.status === 'active' && p.medication_name !== medicationName) {
            const otherMed = p.medication_name.toLowerCase();
            info.interactsWith.forEach(interactor => {
              if (otherMed.includes(interactor)) {
                warnings.push({
                  drug: p.medication_name,
                  warning: info.warning,
                  severity: info.severity
                });
              }
            });
          }
        });
      }
      
      // Also check if existing medications interact with the new one
      if (info.interactsWith.some(i => lowerMedName.includes(i))) {
        patientPrescriptions.forEach(p => {
          if (p.status === 'active' && p.medication_name.toLowerCase().includes(drug)) {
            warnings.push({
              drug: p.medication_name,
              warning: info.warning,
              severity: info.severity
            });
          }
        });
      }
    });
    
    return warnings;
  };

  const handleDispenseClick = async (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDispensingNotes('');
    
    // Check for drug interactions with patient's other medications
    const patientMeds = prescriptions.filter(p => p.patient_id === prescription.patient_id);
    const warnings = checkDrugInteractions(prescription.medication_name, patientMeds);
    setInteractionWarnings(warnings);
    
    setDispensingDialogOpen(true);
  };

  const handleDispenseConfirm = async () => {
    if (!selectedPrescription) return;
    
    try {
      setProcessing(true);
      
      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          status: 'dispensed',
          instructions: selectedPrescription.instructions 
            ? `${selectedPrescription.instructions}\n\nDispensed by: ${user?.firstName} ${user?.lastName}\nNotes: ${dispensingNotes || 'None'}`
            : `Dispensed by: ${user?.firstName} ${user?.lastName}\nNotes: ${dispensingNotes || 'None'}`
        })
        .eq('id', selectedPrescription.id);

      if (error) throw error;

      toast({
        title: 'Prescription Dispensed',
        description: `${selectedPrescription.medication_name} has been dispensed successfully.`,
      });

      setDispensingDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dispense prescription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPrescription = async (prescription: Prescription, reason: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ 
          status: 'rejected',
          instructions: `${prescription.instructions || ''}\n\nRejected by pharmacist: ${reason}`
        })
        .eq('id', prescription.id);

      if (error) throw error;

      toast({
        title: 'Prescription Rejected',
        description: 'The prescription has been marked as rejected.',
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject prescription.',
        variant: 'destructive',
      });
    }
  };

  const lowStockItems = inventory.filter(item => item.current_stock <= (item.minimum_stock || 10));
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'active');
  const dispensedToday = prescriptions.filter(p => 
    p.status === 'dispensed' && p.date_prescribed === new Date().toISOString().split('T')[0]
  );

  const todayStats = [
    { title: 'Pending Queue', value: loading ? '...' : pendingPrescriptions.length.toString(), icon: Clock, color: 'bg-warning' },
    { title: 'Dispensed Today', value: loading ? '...' : dispensedToday.length.toString(), icon: CheckCircle, color: 'bg-success' },
    { title: 'Low Stock Items', value: loading ? '...' : lowStockItems.length.toString(), icon: AlertTriangle, color: 'bg-destructive' },
    { title: 'Total Inventory', value: loading ? '...' : inventory.length.toString(), icon: Package, color: 'bg-primary' }
  ];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pending</Badge>;
      case 'dispensed':
        return <Badge className="bg-success/20 text-success border-success/30">Dispensed</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-medical-green to-medical-green/80 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-green-100">
          {pendingPrescriptions.length} prescription{pendingPrescriptions.length !== 1 ? 's' : ''} awaiting dispensing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="stat-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-destructive/80">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's are' : ' is'} running low: {' '}
            {lowStockItems.slice(0, 3).map(i => i.item_name).join(', ')}
            {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
          </AlertDescription>
        </Alert>
      )}

      {/* Prescription Queue */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Prescription Queue
              </CardTitle>
              <CardDescription>Review and dispense pending prescriptions</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/prescriptions')}
              className="gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingPrescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>All prescriptions have been processed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPrescriptions.slice(0, 6).map((prescription) => (
                <div 
                  key={prescription.id} 
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{prescription.medication_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {prescription.patients?.first_name} {prescription.patients?.last_name} • 
                        {prescription.dosage && ` ${prescription.dosage}`}
                        {prescription.quantity && ` • Qty: ${prescription.quantity}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prescribed by Dr. {prescription.doctors?.first_name} {prescription.doctors?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(prescription.status)}
                    <Button 
                      size="sm" 
                      onClick={() => handleDispenseClick(prescription)}
                      className="gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Dispense
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refill Requests */}
      <RefillRequestReview showAll maxItems={5} />

      {/* Quick Actions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/prescriptions')}
            >
              <Pill className="w-6 h-6" />
              <span className="text-sm">Prescriptions</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/pharmacy')}
            >
              <Activity className="w-6 h-6" />
              <span className="text-sm">Pharmacy</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/inventory')}
            >
              <Package className="w-6 h-6" />
              <span className="text-sm">Inventory</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center space-y-2 h-20"
              onClick={() => navigate('/departments')}
            >
              <Clock className="w-6 h-6" />
              <span className="text-sm">Departments</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dispensing Dialog */}
      <Dialog open={dispensingDialogOpen} onOpenChange={setDispensingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Dispense Prescription
            </DialogTitle>
            <DialogDescription>
              Review prescription details and confirm dispensing
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              {/* Prescription Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Medication</span>
                  <span className="font-medium">{selectedPrescription.medication_name}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Patient</span>
                  <span>{selectedPrescription.patients?.first_name} {selectedPrescription.patients?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dosage</span>
                  <span>{selectedPrescription.dosage || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Frequency</span>
                  <span>{selectedPrescription.frequency || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <span>{selectedPrescription.quantity || 'Not specified'}</span>
                </div>
                {selectedPrescription.instructions && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Instructions</span>
                      <p className="text-sm mt-1">{selectedPrescription.instructions}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Drug Interaction Warnings */}
              {interactionWarnings.length > 0 && (
                <Alert className="bg-destructive/10 border-destructive/30">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <AlertTitle className="text-destructive">Drug Interaction Warning</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {interactionWarnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-destructive/80">
                          <strong>{warning.drug}</strong>: {warning.warning} 
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              warning.severity === 'severe' 
                                ? 'bg-destructive/20 text-destructive' 
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            {warning.severity}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Side Effects Display */}
              {selectedPrescription.side_effects && (
                <Alert className="bg-warning/10 border-warning/30">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertTitle className="text-warning text-sm">Known Side Effects</AlertTitle>
                  <AlertDescription className="text-xs text-warning/80">
                    {selectedPrescription.side_effects}
                  </AlertDescription>
                </Alert>
              )}

              {/* Dispensing Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dispensing Notes</label>
                <Textarea 
                  placeholder="Add any notes for the patient or record..."
                  value={dispensingNotes}
                  onChange={(e) => setDispensingNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDispensingDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedPrescription) {
                  handleRejectPrescription(selectedPrescription, 'Rejected by pharmacist');
                  setDispensingDialogOpen(false);
                }
              }}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button 
              onClick={handleDispenseConfirm}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirm Dispense
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacistDashboard;