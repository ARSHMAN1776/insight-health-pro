import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, reportColumns } from '@/lib/excelExport';
import { generatePDFReport, downloadPDF } from '@/lib/reportGenerator';
import { exportToCSV } from '@/lib/exportUtils';

interface ExportColumn {
  key: string;
  label: string;
  format?: (v: any) => string;
}

interface ExportMenuProps {
  data: any[];
  reportType: 'patients' | 'appointments' | 'payments' | 'labTests' | 'prescriptions' | 'inventory' | 'custom';
  customColumns?: ExportColumn[];
  reportTitle?: string;
  filename?: string;
  dateRange?: { start: string; end: string };
  summaryData?: { label: string; value: string | number }[];
  onScheduleEmail?: (email: string, frequency: string) => Promise<void>;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  data,
  reportType,
  customColumns,
  reportTitle = 'Report',
  filename = 'export',
  dateRange,
  summaryData,
  onScheduleEmail,
}) => {
  const { toast } = useToast();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);

  const columns = customColumns || (reportType !== 'custom' ? reportColumns[reportType] : []);

  const handleExcelExport = () => {
    try {
      exportToExcel(data, {
        filename,
        sheetName: reportTitle,
        columns,
      });
      toast({
        title: 'Export Successful',
        description: 'Data exported to Excel successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCSVExport = () => {
    try {
      const csvColumns = columns.map(col => ({ key: col.key, label: col.label }));
      exportToCSV(data, filename, csvColumns);
      toast({
        title: 'Export Successful',
        description: 'Data exported to CSV successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePDFExport = () => {
    try {
      const tableData = {
        headers: columns.map(col => col.label),
        rows: data.slice(0, 50).map(row => 
          columns.map(col => {
            const value = row[col.key];
            if (col.format) return col.format(value);
            if (value === null || value === undefined) return '-';
            return String(value);
          })
        ),
      };

      const doc = generatePDFReport(
        {
          title: reportTitle,
          dateRange,
          hospitalName: 'Hospital Management System',
        },
        tableData,
        summaryData
      );

      downloadPDF(doc, filename);
      toast({
        title: 'Export Successful',
        description: 'Report exported to PDF successfully',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleEmail = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    if (!onScheduleEmail) {
      toast({
        title: 'Not Available',
        description: 'Email scheduling is not configured',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await onScheduleEmail(email, frequency);
      toast({
        title: 'Scheduled Successfully',
        description: `Report will be sent ${frequency} to ${email}`,
      });
      setEmailDialogOpen(false);
      setEmail('');
    } catch (error) {
      toast({
        title: 'Scheduling Failed',
        description: 'Failed to schedule report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExcelExport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCSVExport}>
            <FileText className="h-4 w-4 mr-2" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePDFExport}>
            <FileText className="h-4 w-4 mr-2" />
            Export to PDF
          </DropdownMenuItem>
          {onScheduleEmail && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Schedule Email Report
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Email Report</DialogTitle>
            <DialogDescription>
              Receive this report automatically via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                className="w-full p-2 border rounded-md bg-background"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleEmail} disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportMenu;
