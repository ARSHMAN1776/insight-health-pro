// CSV Export Utility

export const exportToCSV = (data: any[], filename: string, columns?: { key: string; label: string }[]) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns from data or use provided columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));
  
  // Create CSV header
  const header = cols.map(col => `"${col.label}"`).join(',');
  
  // Create CSV rows
  const rows = data.map(row => {
    return cols.map(col => {
      let value = row[col.key];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '""';
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      // Handle objects
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  // Combine header and rows
  const csv = [header, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Predefined column configurations for common exports
export const patientColumns = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'date_of_birth', label: 'Date of Birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'blood_type', label: 'Blood Type' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Registration Date' }
];

export const appointmentColumns = [
  { key: 'appointment_date', label: 'Date' },
  { key: 'appointment_time', label: 'Time' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'symptoms', label: 'Symptoms' },
  { key: 'notes', label: 'Notes' }
];

export const inventoryColumns = [
  { key: 'item_name', label: 'Item Name' },
  { key: 'category', label: 'Category' },
  { key: 'current_stock', label: 'Current Stock' },
  { key: 'minimum_stock', label: 'Minimum Stock' },
  { key: 'unit_price', label: 'Unit Price' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'location', label: 'Location' }
];

export const paymentColumns = [
  { key: 'payment_date', label: 'Date' },
  { key: 'amount', label: 'Amount' },
  { key: 'payment_method', label: 'Payment Method' },
  { key: 'payment_status', label: 'Status' },
  { key: 'description', label: 'Description' },
  { key: 'invoice_number', label: 'Invoice Number' }
];
