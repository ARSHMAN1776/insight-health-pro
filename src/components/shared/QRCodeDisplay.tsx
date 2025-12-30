import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  data: string | object;
  size?: number;
  title?: string;
  subtitle?: string;
  showDownload?: boolean;
  showPrint?: boolean;
  logoUrl?: string;
  className?: string;
  bgColor?: string;
  fgColor?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  size = 200,
  title,
  subtitle,
  showDownload = false,
  showPrint = false,
  logoUrl,
  className = '',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue = typeof data === 'object' ? JSON.stringify(data) : data;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    canvas.width = size * 2;
    canvas.height = size * 2;
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = `${title?.replace(/\s+/g, '-').toLowerCase() || 'qr-code'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'QR Code'}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1f2937;
            }
            .qr-subtitle {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            .qr-code {
              display: inline-block;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${title ? `<div class="qr-title">${title}</div>` : ''}
            ${subtitle ? `<div class="qr-subtitle">${subtitle}</div>` : ''}
            <div class="qr-code">${svgData}</div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        ref={qrRef} 
        className="bg-white p-3 rounded-lg shadow-sm border"
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeSVG
          value={qrValue}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="H"
          includeMargin={true}
          imageSettings={logoUrl ? {
            src: logoUrl,
            height: size * 0.15,
            width: size * 0.15,
            excavate: true,
          } : undefined}
        />
      </div>
      
      {title && (
        <p className="text-sm font-medium mt-2 text-center">{title}</p>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground text-center">{subtitle}</p>
      )}
      
      {(showDownload || showPrint) && (
        <div className="flex gap-2 mt-3">
          {showDownload && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
          {showPrint && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
