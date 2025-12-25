import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { FileText, Printer, User, Calendar, Heart, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { format } from 'date-fns';
import SignaturePad from '../shared/SignaturePad';

interface ConsentFormData {
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  bloodType: string;
  allergies: string;
  surgeryType: string;
  surgeryDate: string;
  surgeonName: string;
  operationTheatre: string;
  procedureExplained: boolean;
  risksExplained: boolean;
  alternativesExplained: boolean;
  questionsAnswered: boolean;
  consentVoluntary: boolean;
  patientSignature: string;
  witnessName: string;
  witnessRelation: string;
  witnessSignature: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string | null;
  blood_type: string | null;
  allergies: string | null;
}

const SurgicalConsentForm: React.FC = () => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const [formData, setFormData] = useState<ConsentFormData>({
    patientName: '',
    patientId: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    bloodType: '',
    allergies: '',
    surgeryType: '',
    surgeryDate: format(new Date(), 'yyyy-MM-dd'),
    surgeonName: '',
    operationTheatre: '',
    procedureExplained: false,
    risksExplained: false,
    alternativesExplained: false,
    questionsAnswered: false,
    consentVoluntary: false,
    patientSignature: '',
    witnessName: '',
    witnessRelation: '',
    witnessSignature: ''
  });

  React.useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('status', 'active')
        .order('first_name');
      if (data) setPatients(data);
    };
    fetchPatients();
  }, []);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientName: `${patient.first_name} ${patient.last_name}`,
        patientId: patient.id,
        dateOfBirth: patient.date_of_birth,
        gender: patient.gender,
        phone: patient.phone || '',
        bloodType: patient.blood_type || '',
        allergies: patient.allergies || ''
      }));
    }
  };

  const handleInputChange = (field: keyof ConsentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print the form",
        variant: "destructive"
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Surgical Consent Form - ${formData.patientName}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 10px;
              line-height: 1.3;
              padding: 5mm;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 8px; 
              margin-bottom: 10px; 
            }
            .header h1 { font-size: 16px; margin-bottom: 2px; }
            .header h2 { font-size: 12px; font-weight: normal; }
            .section { margin-bottom: 8px; }
            .section-title { 
              font-size: 10px; 
              font-weight: bold; 
              background: #e0e0e0; 
              padding: 3px 6px; 
              margin-bottom: 5px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr; 
              gap: 3px 10px;
            }
            .info-item { display: flex; font-size: 9px; }
            .info-label { font-weight: bold; min-width: 70px; }
            .terms { 
              font-size: 8px; 
              padding: 5px; 
              border: 1px solid #ccc; 
              background: #fafafa;
              margin-bottom: 8px;
            }
            .terms p { margin-bottom: 3px; }
            .consent-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 2px 15px;
              font-size: 8px;
            }
            .consent-item { display: flex; align-items: flex-start; gap: 4px; }
            .checkbox { 
              width: 10px; 
              height: 10px; 
              border: 1px solid #000; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center;
              flex-shrink: 0;
              font-size: 8px;
            }
            .signature-section { 
              display: flex; 
              gap: 20px; 
              margin-top: 10px;
            }
            .signature-box { 
              flex: 1; 
              text-align: center;
            }
            .signature-image {
              height: 50px;
              border-bottom: 1px solid #000;
              margin-bottom: 3px;
              display: flex;
              align-items: flex-end;
              justify-content: center;
            }
            .signature-image img { max-height: 45px; max-width: 100%; }
            .signature-label { font-size: 8px; }
            .footer { 
              margin-top: 8px; 
              padding-top: 5px; 
              border-top: 1px solid #000; 
              font-size: 7px; 
              text-align: center; 
            }
            .date-line { 
              text-align: right; 
              font-size: 9px; 
              margin-bottom: 8px; 
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HOSPITAL MANAGEMENT SYSTEM</h1>
            <h2>SURGICAL CONSENT FORM</h2>
          </div>
          
          <div class="date-line">
            <strong>Date:</strong> ${format(new Date(), 'dd/MM/yyyy')} | <strong>Time:</strong> ${format(new Date(), 'HH:mm')}
          </div>

          <div class="section">
            <div class="section-title">PATIENT INFORMATION</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Name:</span> ${formData.patientName}</div>
              <div class="info-item"><span class="info-label">DOB:</span> ${formData.dateOfBirth}</div>
              <div class="info-item"><span class="info-label">Gender:</span> ${formData.gender}</div>
              <div class="info-item"><span class="info-label">Phone:</span> ${formData.phone || '-'}</div>
              <div class="info-item"><span class="info-label">Blood Type:</span> ${formData.bloodType || '-'}</div>
              <div class="info-item"><span class="info-label">Allergies:</span> ${formData.allergies || 'None'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">SURGERY DETAILS</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Procedure:</span> ${formData.surgeryType}</div>
              <div class="info-item"><span class="info-label">Date:</span> ${formData.surgeryDate}</div>
              <div class="info-item"><span class="info-label">Surgeon:</span> ${formData.surgeonName}</div>
              <div class="info-item"><span class="info-label">OT:</span> ${formData.operationTheatre}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">TERMS AND CONDITIONS</div>
            <div class="terms">
              <p><strong>1. CONSENT:</strong> I authorize the surgical team to perform the procedure. I understand additional procedures may be necessary.</p>
              <p><strong>2. RISKS:</strong> I acknowledge potential risks including bleeding, infection, adverse reactions, and other complications.</p>
              <p><strong>3. ANESTHESIA:</strong> I consent to anesthesia and understand its risks including allergic reactions and breathing difficulties.</p>
              <p><strong>4. BLOOD TRANSFUSION:</strong> I consent to blood transfusion if necessary during the procedure.</p>
              <p><strong>5. NO GUARANTEE:</strong> No guarantee has been made regarding the outcome of this procedure.</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ACKNOWLEDGMENT</div>
            <div class="consent-grid">
              <div class="consent-item">
                <span class="checkbox">${formData.procedureExplained ? '✓' : ''}</span>
                <span>Procedure explained in understandable language</span>
              </div>
              <div class="consent-item">
                <span class="checkbox">${formData.risksExplained ? '✓' : ''}</span>
                <span>Risks and benefits explained</span>
              </div>
              <div class="consent-item">
                <span class="checkbox">${formData.alternativesExplained ? '✓' : ''}</span>
                <span>Alternative treatments discussed</span>
              </div>
              <div class="consent-item">
                <span class="checkbox">${formData.questionsAnswered ? '✓' : ''}</span>
                <span>All questions answered satisfactorily</span>
              </div>
              <div class="consent-item">
                <span class="checkbox">${formData.consentVoluntary ? '✓' : ''}</span>
                <span>Consent given voluntarily</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">SIGNATURES</div>
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-image">
                  ${formData.patientSignature ? `<img src="${formData.patientSignature}" alt="Patient Signature" />` : ''}
                </div>
                <div class="signature-label"><strong>Patient / Guardian Signature</strong></div>
                <div class="signature-label">${formData.patientName}</div>
              </div>
              <div class="signature-box">
                <div class="signature-image">
                  ${formData.witnessSignature ? `<img src="${formData.witnessSignature}" alt="Witness Signature" />` : ''}
                </div>
                <div class="signature-label"><strong>Witness Signature</strong></div>
                <div class="signature-label">${formData.witnessName} (${formData.witnessRelation})</div>
              </div>
            </div>
          </div>

          <div class="footer">
            This is a legal document. Retain a copy for your records. | Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 300);

    toast({
      title: "Print Ready",
      description: "The consent form is ready to print"
    });
  };

  const handleClear = () => {
    setSelectedPatientId('');
    setFormData({
      patientName: '',
      patientId: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      bloodType: '',
      allergies: '',
      surgeryType: '',
      surgeryDate: format(new Date(), 'yyyy-MM-dd'),
      surgeonName: '',
      operationTheatre: '',
      procedureExplained: false,
      risksExplained: false,
      alternativesExplained: false,
      questionsAnswered: false,
      consentVoluntary: false,
      patientSignature: '',
      witnessName: '',
      witnessRelation: '',
      witnessSignature: ''
    });
  };

  const allConsentsChecked = 
    formData.procedureExplained && 
    formData.risksExplained && 
    formData.alternativesExplained && 
    formData.questionsAnswered && 
    formData.consentVoluntary;

  const canPrint = allConsentsChecked && formData.patientName && formData.patientSignature && formData.witnessSignature;

  return (
    <div className="space-y-6" ref={printRef}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Surgical Consent Form</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClear}>
                Clear Form
              </Button>
              <Button onClick={handlePrint} disabled={!canPrint} className="flex items-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>Print Form</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Patient Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Label>Select Patient</Label>
                <Select value={selectedPatientId} onValueChange={handlePatientSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} - {patient.phone || 'No phone'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Date of Birth</Label>
                <Input 
                  type="date"
                  value={formData.dateOfBirth} 
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Phone</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              
              <div>
                <Label>Blood Type</Label>
                <Select value={formData.bloodType} onValueChange={(v) => handleInputChange('bloodType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="lg:col-span-2">
                <Label className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span>Known Allergies</span>
                </Label>
                <Input 
                  value={formData.allergies} 
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List allergies or 'None'"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Surgery Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Heart className="w-5 h-5 text-destructive" />
              <span>Surgery Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Label>Type of Surgery / Procedure</Label>
                <Input 
                  value={formData.surgeryType} 
                  onChange={(e) => handleInputChange('surgeryType', e.target.value)}
                  placeholder="e.g., Appendectomy"
                />
              </div>
              
              <div>
                <Label>Surgery Date</Label>
                <Input 
                  type="date"
                  value={formData.surgeryDate} 
                  onChange={(e) => handleInputChange('surgeryDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Operation Theatre</Label>
                <Input 
                  value={formData.operationTheatre} 
                  onChange={(e) => handleInputChange('operationTheatre', e.target.value)}
                  placeholder="e.g., OT-1"
                />
              </div>
              
              <div className="lg:col-span-2">
                <Label>Surgeon Name</Label>
                <Input 
                  value={formData.surgeonName} 
                  onChange={(e) => handleInputChange('surgeonName', e.target.value)}
                  placeholder="Dr. Name"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Patient Acknowledgment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Acknowledgment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-accent/30 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="procedureExplained"
                  checked={formData.procedureExplained}
                  onCheckedChange={(checked) => handleInputChange('procedureExplained', !!checked)}
                />
                <Label htmlFor="procedureExplained" className="text-sm cursor-pointer">
                  Procedure fully explained
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="risksExplained"
                  checked={formData.risksExplained}
                  onCheckedChange={(checked) => handleInputChange('risksExplained', !!checked)}
                />
                <Label htmlFor="risksExplained" className="text-sm cursor-pointer">
                  Risks and benefits explained
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="alternativesExplained"
                  checked={formData.alternativesExplained}
                  onCheckedChange={(checked) => handleInputChange('alternativesExplained', !!checked)}
                />
                <Label htmlFor="alternativesExplained" className="text-sm cursor-pointer">
                  Alternatives discussed
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="questionsAnswered"
                  checked={formData.questionsAnswered}
                  onCheckedChange={(checked) => handleInputChange('questionsAnswered', !!checked)}
                />
                <Label htmlFor="questionsAnswered" className="text-sm cursor-pointer">
                  Questions answered
                </Label>
              </div>
              
              <div className="flex items-start space-x-3 md:col-span-2">
                <Checkbox 
                  id="consentVoluntary"
                  checked={formData.consentVoluntary}
                  onCheckedChange={(checked) => handleInputChange('consentVoluntary', !!checked)}
                />
                <Label htmlFor="consentVoluntary" className="text-sm cursor-pointer">
                  Consent given voluntarily
                </Label>
              </div>
            </div>

            {!allConsentsChecked && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>All acknowledgments must be checked</span>
              </p>
            )}
          </div>

          <Separator />

          {/* Signature Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Signatures</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Signature */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Patient / Legal Guardian</h4>
                <SignaturePad
                  label="Patient Signature"
                  value={formData.patientSignature}
                  onChange={(sig) => handleInputChange('patientSignature', sig)}
                  height={100}
                />
              </div>
              
              {/* Witness Signature */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Witness</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Witness Name</Label>
                    <Input 
                      value={formData.witnessName} 
                      onChange={(e) => handleInputChange('witnessName', e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Relation</Label>
                    <Input 
                      value={formData.witnessRelation} 
                      onChange={(e) => handleInputChange('witnessRelation', e.target.value)}
                      placeholder="e.g., Spouse"
                    />
                  </div>
                </div>
                <SignaturePad
                  label="Witness Signature"
                  value={formData.witnessSignature}
                  onChange={(sig) => handleInputChange('witnessSignature', sig)}
                  height={100}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={handleClear}>
              Clear Form
            </Button>
            <Button 
              onClick={handlePrint} 
              disabled={!canPrint}
              className="flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Consent Form</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurgicalConsentForm;
