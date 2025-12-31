import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Heart, AlertTriangle, Phone } from 'lucide-react';

interface PatientIDCardProps {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    bloodType?: string;
    allergies?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  showActions?: boolean;
}

const PatientIDCard: React.FC<PatientIDCardProps> = ({ patient, showActions = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate verification URL for QR code scanning
  const qrData = `${window.location.origin}/verify/patient?id=${patient.id}`;

  const allergiesList = patient.allergies?.split(',').map(a => a.trim()).filter(Boolean) || [];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient ID Card - ${patient.firstName} ${patient.lastName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f3f4f6;
              padding: 20px;
            }
            .card {
              width: 400px;
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            }
            .header {
              padding: 24px;
              color: white;
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .avatar {
              width: 72px;
              height: 72px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              font-weight: bold;
              color: white;
              border: 3px solid rgba(255,255,255,0.3);
            }
            .patient-info h2 {
              font-size: 22px;
              margin-bottom: 4px;
            }
            .patient-info p {
              opacity: 0.9;
              font-size: 13px;
            }
            .blood-badge {
              background: #dc2626;
              color: white;
              padding: 6px 14px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              margin-left: auto;
            }
            .content {
              background: white;
              padding: 24px;
              display: flex;
              gap: 20px;
            }
            .qr-section {
              flex-shrink: 0;
            }
            .qr-code {
              padding: 8px;
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
            }
            .details {
              flex: 1;
            }
            .section-title {
              font-size: 11px;
              text-transform: uppercase;
              color: #6b7280;
              font-weight: 600;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
            }
            .section-content {
              margin-bottom: 16px;
            }
            .allergy-tag {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              margin: 2px 4px 2px 0;
            }
            .emergency-box {
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              padding: 12px;
            }
            .emergency-box .label {
              font-size: 11px;
              color: #dc2626;
              font-weight: 600;
            }
            .emergency-box .value {
              font-size: 14px;
              color: #1f2937;
              font-weight: 500;
            }
            .footer {
              background: #f9fafb;
              padding: 12px 24px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            @media print {
              body { background: white; }
              .card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="avatar">${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}</div>
              <div class="patient-info">
                <h2>${patient.firstName} ${patient.lastName}</h2>
                <p>ID: ${patient.id.slice(0, 8).toUpperCase()}</p>
              </div>
              ${patient.bloodType ? `<div class="blood-badge">🩸 ${patient.bloodType}</div>` : ''}
            </div>
            <div class="content">
              <div class="qr-section">
                <div class="qr-code">
                  ${document.querySelector('.patient-id-qr svg')?.outerHTML || ''}
                </div>
              </div>
              <div class="details">
                <div class="section-content">
                  <div class="section-title">⚠️ Allergies</div>
                  ${allergiesList.length > 0 
                    ? allergiesList.map(a => `<span class="allergy-tag">${a}</span>`).join('')
                    : '<span style="color: #22c55e; font-size: 13px;">No known allergies</span>'
                  }
                </div>
                <div class="section-content">
                  <div class="emergency-box">
                    <div class="label">📞 Emergency Contact</div>
                    <div class="value">${patient.emergencyContactName || 'Not provided'}</div>
                    <div class="value">${patient.emergencyContactPhone || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer">
              Scan QR code for complete patient information • For emergency use only
            </div>
          </div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    // Create canvas for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    // Draw card background
    const gradient = ctx.createLinearGradient(0, 0, 800, 0);
    gradient.addColorStop(0, '#0ea5e9');
    gradient.addColorStop(1, '#0284c7');
    
    // Header
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 800, 500, 20);
    ctx.fill();

    // White content area
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 160, 800, 340);

    // Avatar circle
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(80, 80, 50, 0, Math.PI * 2);
    ctx.fill();

    // Avatar text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`, 80, 92);

    // Name
    ctx.textAlign = 'left';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${patient.firstName} ${patient.lastName}`, 150, 70);
    
    // ID
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(`ID: ${patient.id.slice(0, 8).toUpperCase()}`, 150, 100);

    // Blood type badge
    if (patient.bloodType) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(650, 55, 100, 40, 20);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`🩸 ${patient.bloodType}`, 700, 82);
    }

    // Content text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('SCAN FOR PATIENT INFO', 50, 200);

    ctx.fillStyle = '#1f2937';
    ctx.font = '14px Arial';
    ctx.fillText('Allergies: ' + (allergiesList.join(', ') || 'None'), 50, 380);
    ctx.fillText('Emergency: ' + (patient.emergencyContactPhone || 'Not provided'), 50, 410);

    // Download
    const link = document.createElement('a');
    link.download = `patient-id-${patient.firstName}-${patient.lastName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card className="overflow-hidden max-w-md mx-auto shadow-lg">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-primary-hover p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary-foreground/30">
            <AvatarFallback className="text-xl bg-primary-foreground/20 text-primary-foreground">
              {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{patient.firstName} {patient.lastName}</h3>
            <p className="text-primary-foreground/80 text-sm">ID: {patient.id.slice(0, 8).toUpperCase()}</p>
          </div>
          {patient.bloodType && (
            <Badge className="bg-medical-red text-white flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {patient.bloodType}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* QR Code */}
          <div className="patient-id-qr flex-shrink-0">
            <div className="bg-white p-2 rounded-lg border-2 border-border">
              <QRCodeSVG
                value={qrData}
                size={100}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Scan for info</p>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            {/* Allergies */}
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mb-1">
                <AlertTriangle className="w-3 h-3" />
                ALLERGIES
              </div>
              <div className="flex flex-wrap gap-1">
                {allergiesList.length > 0 ? (
                  allergiesList.map((allergy, idx) => (
                    <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-medical-green">No known allergies</span>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-destructive font-medium mb-1">
                <Phone className="w-3 h-3" />
                EMERGENCY CONTACT
              </div>
              <p className="text-sm font-medium">{patient.emergencyContactName || 'Not provided'}</p>
              <p className="text-sm text-muted-foreground">{patient.emergencyContactPhone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print ID Card
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientIDCard;
