import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { FileText, Printer, User, Calendar, Phone, MapPin, Heart, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { format } from 'date-fns';

interface ConsentFormData {
  // Patient Info
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  bloodType: string;
  allergies: string;
  
  // Surgery Info
  surgeryType: string;
  surgeryDate: string;
  surgeonName: string;
  anesthetistName: string;
  operationTheatre: string;
  
  // Consent Details
  procedureExplained: boolean;
  risksExplained: boolean;
  alternativesExplained: boolean;
  questionsAnswered: boolean;
  consentVoluntary: boolean;
  
  // Signatures
  patientSignature: string;
  witnessName: string;
  witnessRelation: string;
  witnessSignature: string;
  witnessPhone: string;
  
  // Additional Notes
  additionalNotes: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string | null;
  address: string | null;
  blood_type: string | null;
  allergies: string | null;
}

const SurgicalConsentForm: React.FC = () => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ConsentFormData>({
    patientName: '',
    patientId: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    bloodType: '',
    allergies: '',
    surgeryType: '',
    surgeryDate: format(new Date(), 'yyyy-MM-dd'),
    surgeonName: '',
    anesthetistName: '',
    operationTheatre: '',
    procedureExplained: false,
    risksExplained: false,
    alternativesExplained: false,
    questionsAnswered: false,
    consentVoluntary: false,
    patientSignature: '',
    witnessName: '',
    witnessRelation: '',
    witnessSignature: '',
    witnessPhone: '',
    additionalNotes: ''
  });

  // Fetch patients on mount
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
        address: patient.address || '',
        bloodType: patient.blood_type || '',
        allergies: patient.allergies || ''
      }));
    }
  };

  const handleInputChange = (field: keyof ConsentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 20px; 
              max-width: 800px; 
              margin: 0 auto;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px double #000; 
              padding-bottom: 20px; 
              margin-bottom: 20px; 
            }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header h2 { font-size: 18px; color: #333; font-weight: normal; }
            .header p { font-size: 12px; color: #666; }
            .section { margin-bottom: 20px; }
            .section-title { 
              font-size: 14px; 
              font-weight: bold; 
              background: #f0f0f0; 
              padding: 8px 12px; 
              margin-bottom: 10px;
              border-left: 4px solid #333;
            }
            .form-row { 
              display: flex; 
              margin-bottom: 8px; 
              padding: 4px 0;
              border-bottom: 1px dotted #ccc;
            }
            .form-label { 
              width: 180px; 
              font-weight: bold; 
              font-size: 12px;
            }
            .form-value { 
              flex: 1; 
              font-size: 12px;
            }
            .consent-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .consent-checkbox {
              width: 16px;
              height: 16px;
              border: 1px solid #000;
              margin-right: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .checked::after { content: "✓"; font-weight: bold; }
            .terms-text {
              font-size: 11px;
              line-height: 1.5;
              text-align: justify;
              padding: 10px;
              border: 1px solid #ddd;
              background: #fafafa;
              margin-bottom: 15px;
            }
            .signature-section {
              display: flex;
              gap: 40px;
              margin-top: 30px;
            }
            .signature-box {
              flex: 1;
              text-align: center;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              height: 60px;
              margin-bottom: 5px;
              font-style: italic;
              padding-top: 40px;
            }
            .signature-label { font-size: 11px; }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #000;
              font-size: 10px;
              text-align: center;
              color: #666;
            }
            .date-time {
              text-align: right;
              font-size: 11px;
              margin-bottom: 15px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 HOSPITAL MANAGEMENT SYSTEM</h1>
            <h2>SURGICAL CONSENT FORM</h2>
            <p>Informed Consent for Surgical Procedure</p>
          </div>
          
          <div class="date-time">
            <strong>Date:</strong> ${format(new Date(), 'PPP')} | 
            <strong>Time:</strong> ${format(new Date(), 'HH:mm')}
          </div>

          <div class="section">
            <div class="section-title">PATIENT INFORMATION</div>
            <div class="form-row">
              <span class="form-label">Patient Name:</span>
              <span class="form-value">${formData.patientName || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Patient ID:</span>
              <span class="form-value">${formData.patientId?.slice(0, 8) || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Date of Birth:</span>
              <span class="form-value">${formData.dateOfBirth || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Gender:</span>
              <span class="form-value">${formData.gender || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Phone:</span>
              <span class="form-value">${formData.phone || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Address:</span>
              <span class="form-value">${formData.address || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Blood Type:</span>
              <span class="form-value">${formData.bloodType || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Known Allergies:</span>
              <span class="form-value">${formData.allergies || 'None reported'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">SURGICAL PROCEDURE DETAILS</div>
            <div class="form-row">
              <span class="form-label">Type of Surgery:</span>
              <span class="form-value">${formData.surgeryType || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Scheduled Date:</span>
              <span class="form-value">${formData.surgeryDate || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Surgeon Name:</span>
              <span class="form-value">${formData.surgeonName || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Anesthetist Name:</span>
              <span class="form-value">${formData.anesthetistName || '_____________________'}</span>
            </div>
            <div class="form-row">
              <span class="form-label">Operation Theatre:</span>
              <span class="form-value">${formData.operationTheatre || '_____________________'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">TERMS AND CONDITIONS</div>
            <div class="terms-text">
              <p><strong>1. CONSENT FOR SURGERY:</strong> I hereby authorize the above-named surgeon and medical team to perform the surgical procedure described above. I understand that during the procedure, unforeseen conditions may be revealed that necessitate the extension of the original procedure or different procedures than those planned.</p>
              <br/>
              <p><strong>2. RISKS AND COMPLICATIONS:</strong> I acknowledge that I have been informed about the potential risks, complications, and benefits of the proposed procedure. These may include but are not limited to: bleeding, infection, adverse reactions to anesthesia, blood clots, nerve damage, and other unforeseen complications.</p>
              <br/>
              <p><strong>3. ANESTHESIA:</strong> I consent to the administration of anesthesia as deemed appropriate by the anesthesiologist. I understand the risks associated with anesthesia including allergic reactions, breathing difficulties, and in rare cases, death.</p>
              <br/>
              <p><strong>4. BLOOD TRANSFUSION:</strong> I consent to blood transfusion if necessary during or after the procedure. I have been informed of the risks including allergic reactions and transmission of infectious diseases.</p>
              <br/>
              <p><strong>5. NO GUARANTEE:</strong> I understand that no guarantee or assurance has been made as to the results that may be obtained from this procedure.</p>
              <br/>
              <p><strong>6. PHOTOGRAPHS/RECORDING:</strong> I consent to the photographing or recording of the procedure for medical, scientific, or educational purposes.</p>
              <br/>
              <p><strong>7. DISPOSAL OF TISSUE:</strong> I authorize the hospital to dispose of any tissues or body parts removed during the procedure in accordance with standard medical practices.</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">PATIENT ACKNOWLEDGMENT</div>
            <div class="consent-item">
              <div class="consent-checkbox ${formData.procedureExplained ? 'checked' : ''}"></div>
              <span>I confirm that the surgical procedure has been fully explained to me in a language I understand.</span>
            </div>
            <div class="consent-item">
              <div class="consent-checkbox ${formData.risksExplained ? 'checked' : ''}"></div>
              <span>I confirm that the risks, benefits, and possible complications have been explained to me.</span>
            </div>
            <div class="consent-item">
              <div class="consent-checkbox ${formData.alternativesExplained ? 'checked' : ''}"></div>
              <span>I confirm that alternative treatment options have been discussed with me.</span>
            </div>
            <div class="consent-item">
              <div class="consent-checkbox ${formData.questionsAnswered ? 'checked' : ''}"></div>
              <span>I confirm that I have had the opportunity to ask questions and all my questions have been answered satisfactorily.</span>
            </div>
            <div class="consent-item">
              <div class="consent-checkbox ${formData.consentVoluntary ? 'checked' : ''}"></div>
              <span>I confirm that I am giving this consent voluntarily, without any coercion or undue influence.</span>
            </div>
          </div>

          ${formData.additionalNotes ? `
          <div class="section">
            <div class="section-title">ADDITIONAL NOTES</div>
            <p style="font-size: 12px; padding: 10px;">${formData.additionalNotes}</p>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">SIGNATURES</div>
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line">${formData.patientSignature || ''}</div>
                <div class="signature-label"><strong>Patient / Legal Guardian Signature</strong></div>
                <div class="signature-label">${formData.patientName || 'Name: _____________________'}</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">${formData.witnessSignature || ''}</div>
                <div class="signature-label"><strong>Witness Signature</strong></div>
                <div class="signature-label">Name: ${formData.witnessName || '_____________________'}</div>
                <div class="signature-label">Relation: ${formData.witnessRelation || '_____________________'}</div>
                <div class="signature-label">Phone: ${formData.witnessPhone || '_____________________'}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This form is a legal document. Please retain a copy for your records.</p>
            <p>Hospital Management System - Surgical Consent Form | Generated on ${format(new Date(), 'PPP')} at ${format(new Date(), 'HH:mm:ss')}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);

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
      address: '',
      bloodType: '',
      allergies: '',
      surgeryType: '',
      surgeryDate: format(new Date(), 'yyyy-MM-dd'),
      surgeonName: '',
      anesthetistName: '',
      operationTheatre: '',
      procedureExplained: false,
      risksExplained: false,
      alternativesExplained: false,
      questionsAnswered: false,
      consentVoluntary: false,
      patientSignature: '',
      witnessName: '',
      witnessRelation: '',
      witnessSignature: '',
      witnessPhone: '',
      additionalNotes: ''
    });
  };

  const allConsentsChecked = 
    formData.procedureExplained && 
    formData.risksExplained && 
    formData.alternativesExplained && 
    formData.questionsAnswered && 
    formData.consentVoluntary;

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
              <Button onClick={handlePrint} className="flex items-center space-x-2">
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
              <User className="w-5 h-5 text-medical-blue" />
              <span>Patient Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label>Patient ID</Label>
                <Input 
                  value={formData.patientId ? formData.patientId.slice(0, 8) : ''} 
                  readOnly 
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={formData.patientName} 
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Patient full name"
                />
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
                    <SelectValue placeholder="Select gender" />
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
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="lg:col-span-2">
                <Label>Address</Label>
                <Input 
                  value={formData.address} 
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                />
              </div>
              
              <div className="lg:col-span-3">
                <Label className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span>Known Allergies</span>
                </Label>
                <Input 
                  value={formData.allergies} 
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List any known allergies (or 'None')"
                  className="border-warning/50"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Surgery Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Heart className="w-5 h-5 text-medical-red" />
              <span>Surgery Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Label>Type of Surgery / Procedure</Label>
                <Input 
                  value={formData.surgeryType} 
                  onChange={(e) => handleInputChange('surgeryType', e.target.value)}
                  placeholder="e.g., Appendectomy, Knee Replacement, etc."
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
                <Label>Surgeon Name</Label>
                <Input 
                  value={formData.surgeonName} 
                  onChange={(e) => handleInputChange('surgeonName', e.target.value)}
                  placeholder="Dr. Name"
                />
              </div>
              
              <div>
                <Label>Anesthetist Name</Label>
                <Input 
                  value={formData.anesthetistName} 
                  onChange={(e) => handleInputChange('anesthetistName', e.target.value)}
                  placeholder="Dr. Name"
                />
              </div>
              
              <div>
                <Label>Operation Theatre</Label>
                <Input 
                  value={formData.operationTheatre} 
                  onChange={(e) => handleInputChange('operationTheatre', e.target.value)}
                  placeholder="e.g., OT-1, OT-2"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Patient Acknowledgment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Acknowledgment</h3>
            <p className="text-sm text-muted-foreground">
              Please confirm the following before signing the consent form:
            </p>
            
            <div className="space-y-3 bg-accent/30 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="procedureExplained"
                  checked={formData.procedureExplained}
                  onCheckedChange={(checked) => handleInputChange('procedureExplained', !!checked)}
                />
                <Label htmlFor="procedureExplained" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that the surgical procedure has been fully explained to me in a language I understand.
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="risksExplained"
                  checked={formData.risksExplained}
                  onCheckedChange={(checked) => handleInputChange('risksExplained', !!checked)}
                />
                <Label htmlFor="risksExplained" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that the risks, benefits, and possible complications have been explained to me.
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="alternativesExplained"
                  checked={formData.alternativesExplained}
                  onCheckedChange={(checked) => handleInputChange('alternativesExplained', !!checked)}
                />
                <Label htmlFor="alternativesExplained" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that alternative treatment options have been discussed with me.
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="questionsAnswered"
                  checked={formData.questionsAnswered}
                  onCheckedChange={(checked) => handleInputChange('questionsAnswered', !!checked)}
                />
                <Label htmlFor="questionsAnswered" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that I have had the opportunity to ask questions and all my questions have been answered satisfactorily.
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="consentVoluntary"
                  checked={formData.consentVoluntary}
                  onCheckedChange={(checked) => handleInputChange('consentVoluntary', !!checked)}
                />
                <Label htmlFor="consentVoluntary" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that I am giving this consent voluntarily, without any coercion or undue influence.
                </Label>
              </div>
            </div>

            {!allConsentsChecked && (
              <p className="text-sm text-destructive flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>All acknowledgments must be checked before printing</span>
              </p>
            )}
          </div>

          <Separator />

          {/* Signature Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Signatures</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient/Guardian Signature */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Patient / Legal Guardian</h4>
                <div>
                  <Label>Signature (Type Name)</Label>
                  <Input 
                    value={formData.patientSignature} 
                    onChange={(e) => handleInputChange('patientSignature', e.target.value)}
                    placeholder="Type full name as signature"
                    className="italic"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    By typing your name, you agree this constitutes your legal signature
                  </p>
                </div>
              </div>
              
              {/* Witness Signature */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Witness (Family Member / Guardian)</h4>
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
                    <Label>Relation to Patient</Label>
                    <Input 
                      value={formData.witnessRelation} 
                      onChange={(e) => handleInputChange('witnessRelation', e.target.value)}
                      placeholder="e.g., Spouse, Parent, Child"
                    />
                  </div>
                </div>
                <div>
                  <Label>Witness Phone</Label>
                  <Input 
                    value={formData.witnessPhone} 
                    onChange={(e) => handleInputChange('witnessPhone', e.target.value)}
                    placeholder="Contact number"
                  />
                </div>
                <div>
                  <Label>Signature (Type Name)</Label>
                  <Input 
                    value={formData.witnessSignature} 
                    onChange={(e) => handleInputChange('witnessSignature', e.target.value)}
                    placeholder="Type full name as signature"
                    className="italic"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea 
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any additional information or special instructions..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={handleClear}>
              Clear Form
            </Button>
            <Button 
              onClick={handlePrint} 
              disabled={!allConsentsChecked || !formData.patientName || !formData.patientSignature}
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
