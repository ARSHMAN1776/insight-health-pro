import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface TokenSlipProps {
  token: string;
  patientName: string;
  doctorName: string;
  departmentName?: string;
  estimatedWait?: number;
  position?: number;
  checkedInAt: string;
  hospitalName?: string;
}

const TokenSlip = forwardRef<HTMLDivElement, TokenSlipProps>(({
  token,
  patientName,
  doctorName,
  departmentName,
  estimatedWait,
  position,
  checkedInAt,
  hospitalName = 'Healthcare Hospital'
}, ref) => {
  return (
    <div 
      ref={ref}
      className="bg-white p-6 w-80 mx-auto border-2 border-dashed border-border print:border-solid"
    >
      {/* Header */}
      <div className="text-center border-b border-border pb-4 mb-4">
        <h1 className="text-lg font-bold text-foreground">{hospitalName}</h1>
        <p className="text-xs text-muted-foreground">Queue Token</p>
      </div>

      {/* Token Number */}
      <div className="text-center py-6 bg-primary/10 rounded-lg mb-4">
        <p className="text-sm text-muted-foreground mb-1">YOUR TOKEN</p>
        <p className="text-5xl font-bold text-primary tracking-wider">{token}</p>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Patient:</span>
          <span className="font-medium text-foreground">{patientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Doctor:</span>
          <span className="font-medium text-foreground">{doctorName}</span>
        </div>
        {departmentName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Department:</span>
            <span className="font-medium text-foreground">{departmentName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-in Time:</span>
          <span className="font-medium text-foreground">
            {format(new Date(checkedInAt), 'hh:mm a')}
          </span>
        </div>
        {position && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position:</span>
            <span className="font-medium text-foreground">#{position} in queue</span>
          </div>
        )}
        {estimatedWait !== undefined && estimatedWait > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Wait:</span>
            <span className="font-medium text-foreground">~{estimatedWait} mins</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Please wait for your token to be called.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(checkedInAt), 'MMM dd, yyyy')}
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #token-slip, #token-slip * {
            visibility: visible;
          }
          #token-slip {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
});

TokenSlip.displayName = 'TokenSlip';

export default TokenSlip;
