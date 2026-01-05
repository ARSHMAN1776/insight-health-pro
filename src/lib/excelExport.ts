import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
  columns?: ExportColumn[];
  includeTimestamp?: boolean;
}

/**
 * Export data to Excel (.xlsx) format
 */
export function exportToExcel(
  data: Record<string, any>[],
  options: ExcelExportOptions
): void {
  const {
    filename,
    sheetName = 'Report',
    columns,
    includeTimestamp = true,
  } = options;

  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Use provided columns or derive from data
  const cols: ExportColumn[] = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Transform data based on columns
  const rows = data.map(row => {
    const transformed: Record<string, any> = {};
    cols.forEach(col => {
      let value = row[col.key];
      
      // Apply custom formatter if provided
      if (col.format && value !== null && value !== undefined) {
        value = col.format(value);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join(', ');
      }
      
      // Handle objects
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      
      transformed[col.label] = value;
    });
    return transformed;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-size columns
  const maxWidths = cols.map(col => {
    const headerWidth = col.label.length;
    const maxDataWidth = Math.max(...rows.map(row => {
      const val = row[col.label];
      return val ? String(val).length : 0;
    }));
    return Math.min(Math.max(headerWidth, maxDataWidth) + 2, 50);
  });
  worksheet['!cols'] = maxWidths.map(width => ({ wch: width }));

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with timestamp
  const timestamp = includeTimestamp ? `_${format(new Date(), 'yyyy-MM-dd')}` : '';
  const fullFilename = `${filename}${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, fullFilename);
}

/**
 * Export multiple sheets to a single Excel file
 */
export function exportMultiSheetExcel(
  sheets: { name: string; data: Record<string, any>[]; columns?: ExportColumn[] }[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    if (!sheet.data || sheet.data.length === 0) return;

    const cols: ExportColumn[] = sheet.columns || Object.keys(sheet.data[0]).map(key => ({ key, label: key }));

    const rows = sheet.data.map(row => {
      const transformed: Record<string, any> = {};
      cols.forEach(col => {
        let value = row[col.key];
        if (col.format && value !== null && value !== undefined) {
          value = col.format(value);
        }
        if (value === null || value === undefined) value = '';
        if (Array.isArray(value)) value = value.join(', ');
        if (typeof value === 'object' && value !== null) value = JSON.stringify(value);
        transformed[col.label] = value;
      });
      return transformed;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  });

  const fullFilename = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(workbook, fullFilename);
}

// Pre-defined column configurations
export const reportColumns: Record<string, ExportColumn[]> = {
  patients: [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'date_of_birth', label: 'Date of Birth', format: (v: string) => v ? format(new Date(v), 'yyyy-MM-dd') : '' },
    { key: 'gender', label: 'Gender' },
    { key: 'blood_type', label: 'Blood Type' },
    { key: 'status', label: 'Status' },
    { key: 'insurance_provider', label: 'Insurance Provider' },
    { key: 'created_at', label: 'Registered', format: (v: string) => v ? format(new Date(v), 'yyyy-MM-dd') : '' },
  ],
  appointments: [
    { key: 'appointment_date', label: 'Date' },
    { key: 'appointment_time', label: 'Time' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'symptoms', label: 'Symptoms' },
    { key: 'notes', label: 'Notes' },
    { key: 'duration', label: 'Duration (min)' },
  ],
  payments: [
    { key: 'payment_date', label: 'Date', format: (v: string) => v ? format(new Date(v), 'yyyy-MM-dd') : '' },
    { key: 'amount', label: 'Amount', format: (v: number) => `$${v?.toFixed(2) || '0.00'}` },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'payment_status', label: 'Status' },
    { key: 'description', label: 'Description' },
    { key: 'invoice_number', label: 'Invoice Number' },
  ],
  labTests: [
    { key: 'test_date', label: 'Date', format: (v: string) => v ? format(new Date(v), 'yyyy-MM-dd') : '' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'test_type', label: 'Test Type' },
    { key: 'status', label: 'Status' },
    { key: 'results', label: 'Results' },
    { key: 'normal_range', label: 'Normal Range' },
    { key: 'priority', label: 'Priority' },
  ],
  prescriptions: [
    { key: 'date_prescribed', label: 'Date', format: (v: string) => v ? format(new Date(v), 'yyyy-MM-dd') : '' },
    { key: 'medication_name', label: 'Medication' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'duration', label: 'Duration' },
    { key: 'status', label: 'Status' },
  ],
  inventory: [
    { key: 'item_name', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { key: 'current_stock', label: 'Current Stock' },
    { key: 'minimum_stock', label: 'Min Stock' },
    { key: 'unit_price', label: 'Unit Price', format: (v: number) => `$${v?.toFixed(2) || '0.00'}` },
    { key: 'supplier', label: 'Supplier' },
    { key: 'expiry_date', label: 'Expiry Date', format: (v: string) => v ? format(new Date(v), 'yyyy-MM-dd') : '' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
  ],
};
