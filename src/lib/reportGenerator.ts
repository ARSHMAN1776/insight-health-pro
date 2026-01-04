import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportOptions {
  title: string;
  subtitle?: string;
  dateRange?: { start: string; end: string };
  hospitalName?: string;
}

interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

// Extend jsPDF to include lastAutoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

export const generatePDFReport = (
  options: ReportOptions,
  tableData: TableData,
  summaryData?: { label: string; value: string | number }[]
): jsPDF => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const hospitalName = options.hospitalName || 'Hospital Management System';

  // Header
  doc.setFillColor(8, 145, 178); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Hospital name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(hospitalName, 14, 18);

  // Report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(options.title, 14, 30);

  // Date range
  if (options.dateRange) {
    doc.setFontSize(10);
    doc.text(
      `Period: ${format(new Date(options.dateRange.start), 'MMM d, yyyy')} - ${format(new Date(options.dateRange.end), 'MMM d, yyyy')}`,
      pageWidth - 14,
      30,
      { align: 'right' }
    );
  }

  // Generated date
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, pageWidth - 14, 18, { align: 'right' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  let yPosition = 50;

  // Summary section if provided
  if (summaryData && summaryData.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPosition);
    yPosition += 8;

    const summaryColWidth = (pageWidth - 28) / Math.min(summaryData.length, 4);
    summaryData.forEach((item, index) => {
      const xPos = 14 + (index % 4) * summaryColWidth;
      const yPos = yPosition + Math.floor(index / 4) * 20;

      // Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(xPos, yPos, summaryColWidth - 4, 18, 2, 2, 'F');

      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, xPos + 4, yPos + 6);

      // Value
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.value), xPos + 4, yPos + 14);
    });

    yPosition += Math.ceil(summaryData.length / 4) * 20 + 10;
  }

  // Table
  if (tableData.rows.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Details', 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [tableData.headers],
      body: tableData.rows,
      theme: 'striped',
      headStyles: {
        fillColor: [8, 145, 178],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 51, 51],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Confidential - For Internal Use Only',
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return doc;
};

export const generatePatientReport = (patient: any, records: any[], labTests: any[]): jsPDF => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(8, 145, 178);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Summary Report', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 25);

  // Patient Info
  let yPos = 45;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 14, yPos);
  yPos += 10;

  const patientInfo = [
    ['Name', `${patient.first_name} ${patient.last_name}`],
    ['Date of Birth', patient.date_of_birth],
    ['Gender', patient.gender],
    ['Blood Type', patient.blood_type || 'Not specified'],
    ['Phone', patient.phone || 'N/A'],
    ['Email', patient.email || 'N/A'],
  ];

  doc.setFontSize(10);
  patientInfo.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 14 + col * 90;
    const y = yPos + row * 8;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`${label}:`, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(String(value), x + 35, y);
  });

  yPos += Math.ceil(patientInfo.length / 2) * 8 + 15;

  // Medical Records
  if (records.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical Records', 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Diagnosis', 'Treatment', 'Doctor']],
      body: records.slice(0, 10).map((r) => [
        format(new Date(r.visit_date), 'MMM d, yyyy'),
        r.diagnosis || '-',
        r.treatment?.substring(0, 40) || '-',
        r.doctor_name || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [8, 145, 178] },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  }

  // Lab Tests
  if (labTests.length > 0 && yPos < 240) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Lab Tests', 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Test Name', 'Status', 'Results']],
      body: labTests.slice(0, 8).map((t) => [
        format(new Date(t.test_date), 'MMM d, yyyy'),
        t.test_name,
        t.status,
        t.results?.substring(0, 30) || 'Pending',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [8, 145, 178] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'CONFIDENTIAL - Protected Health Information',
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportToCSV = (headers: string[], rows: any[][], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const cellStr = String(cell);
        // Escape quotes and wrap in quotes if contains comma
        if (cellStr.includes(',') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
