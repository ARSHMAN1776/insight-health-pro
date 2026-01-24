import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { TestParameter } from './labReportTemplates';

export interface LabReportData {
  reportId: string;
  reportNumber: string;
  patient: {
    name: string;
    age: number;
    gender: string;
    id: string;
    phone?: string;
  };
  doctor: {
    name: string;
    department?: string;
  };
  testName: string;
  testType: string;
  specimenType: string;
  collectionTime: Date;
  reportTime: Date;
  parameters: TestParameter[];
  method: string;
  comments: string;
  technician: {
    name: string;
    signature?: string;
  };
  verifiedBy?: {
    name: string;
    signature?: string;
  };
  hospitalInfo: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
  };
}

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

export const generateLabReportPDF = (data: LabReportData): jsPDF => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor: [number, number, number] = [8, 145, 178];
  const headerBg: [number, number, number] = [248, 250, 252];
  const criticalColor: [number, number, number] = [220, 38, 38];
  const highColor: [number, number, number] = [234, 88, 12];
  const lowColor: [number, number, number] = [37, 99, 235];

  // ===== HEADER SECTION =====
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Hospital Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.hospitalInfo.name, margin, 15);

  // Hospital Address & Contact
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.hospitalInfo.address, margin, 23);
  doc.text(`Phone: ${data.hospitalInfo.phone}${data.hospitalInfo.email ? ` | Email: ${data.hospitalInfo.email}` : ''}`, margin, 30);

  // Report Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LABORATORY INVESTIGATION REPORT', pageWidth / 2, 40, { align: 'center' });

  // Report Number (right side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report No: ${data.reportNumber}`, pageWidth - margin, 15, { align: 'right' });
  doc.text(`Date: ${format(data.reportTime, 'dd/MM/yyyy')}`, pageWidth - margin, 22, { align: 'right' });

  let yPos = 55;

  // ===== PATIENT INFORMATION SECTION =====
  doc.setFillColor(...headerBg);
  doc.rect(margin, yPos - 5, contentWidth, 28, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPos - 5, contentWidth, 28, 'S');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', margin + 4, yPos);
  yPos += 6;

  doc.setFontSize(9);
  const patientInfoCol1 = [
    ['Patient Name:', data.patient.name],
    ['Patient ID:', data.patient.id],
    ['Gender:', data.patient.gender],
  ];
  const patientInfoCol2 = [
    ['Age:', `${data.patient.age} years`],
    ['Referring Doctor:', data.doctor.name],
    ['Department:', data.doctor.department || 'N/A'],
  ];

  patientInfoCol1.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin + 4, yPos + i * 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, margin + 35, yPos + i * 5);
  });

  patientInfoCol2.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, pageWidth / 2 + 4, yPos + i * 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth / 2 + 40, yPos + i * 5);
  });

  yPos += 25;

  // ===== SAMPLE INFORMATION =====
  doc.setFillColor(...headerBg);
  doc.rect(margin, yPos - 3, contentWidth, 18, 'F');
  doc.rect(margin, yPos - 3, contentWidth, 18, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('SAMPLE DETAILS', margin + 4, yPos + 2);
  yPos += 8;

  doc.setFontSize(9);
  const sampleInfo = [
    ['Test Name:', data.testName],
    ['Specimen Type:', data.specimenType],
    ['Collection Time:', format(data.collectionTime, 'dd/MM/yyyy hh:mm a')],
    ['Method:', data.method],
  ];

  sampleInfo.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xBase = col === 0 ? margin + 4 : pageWidth / 2 + 4;
    const xValue = col === 0 ? margin + 40 : pageWidth / 2 + 40;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, xBase, yPos + row * 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value.substring(0, 35), xValue, yPos + row * 5);
  });

  yPos += 18;

  // ===== TEST RESULTS TABLE =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TEST RESULTS', margin, yPos);
  yPos += 3;

  const tableHead = [['Parameter', 'Result', 'Unit', 'Reference Range', 'Status']];
  const tableBody = data.parameters.map(param => {
    let statusText = param.flag || '';
    return [
      param.name,
      param.value,
      param.unit,
      param.normalRange,
      statusText,
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 51, 51],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 45, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        const flag = data.cell.raw as string;
        if (flag && flag.includes('!')) {
          data.cell.styles.textColor = criticalColor;
          data.cell.styles.fontStyle = 'bold';
        } else if (flag === 'H') {
          data.cell.styles.textColor = highColor;
          data.cell.styles.fontStyle = 'bold';
        } else if (flag === 'L') {
          data.cell.styles.textColor = lowColor;
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Highlight abnormal result values
      if (data.section === 'body' && data.column.index === 1) {
        const rowIndex = data.row.index;
        const statusCell = tableBody[rowIndex]?.[4] as string;
        if (statusCell?.includes('!')) {
          data.cell.styles.textColor = criticalColor;
          data.cell.styles.fontStyle = 'bold';
        } else if (statusCell === 'H') {
          data.cell.styles.textColor = highColor;
        } else if (statusCell === 'L') {
          data.cell.styles.textColor = lowColor;
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc.lastAutoTable?.finalY || yPos) + 8;

  // ===== LEGEND =====
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Legend: L = Low | H = High | L! = Critical Low | H! = Critical High | ABN = Abnormal', margin, yPos);
  yPos += 10;

  // ===== COMMENTS SECTION =====
  if (data.comments && data.comments.trim()) {
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(...headerBg);
    doc.rect(margin, yPos - 3, contentWidth, 25, 'F');
    doc.rect(margin, yPos - 3, contentWidth, 25, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CLINICAL COMMENTS / INTERPRETATION', margin + 4, yPos + 2);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitComments = doc.splitTextToSize(data.comments, contentWidth - 8);
    doc.text(splitComments.slice(0, 3), margin + 4, yPos);
    yPos += 22;
  }

  // ===== SIGNATURES SECTION =====
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  yPos = pageHeight - 45;

  // Technician Signature
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Lab Technician', margin, yPos);
  doc.setDrawColor(150, 150, 150);
  doc.line(margin, yPos + 12, margin + 60, yPos + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(data.technician.name, margin, yPos + 18);

  // Pathologist Signature (if verified)
  if (data.verifiedBy?.name) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Verified By (Pathologist)', pageWidth - margin - 60, yPos);
    doc.line(pageWidth - margin - 60, yPos + 12, pageWidth - margin, yPos + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(data.verifiedBy.name, pageWidth - margin - 60, yPos + 18);
  }

  // ===== FOOTER =====
  yPos = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated report. Signature verification indicates clinical review.', pageWidth / 2, yPos, { align: 'center' });
  doc.text(`Report generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, yPos + 5, { align: 'center' });

  // Page numbers for multi-page reports
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  return doc;
};

export const downloadLabReport = (doc: jsPDF, reportNumber: string) => {
  doc.save(`Lab_Report_${reportNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

export const printLabReport = (doc: jsPDF) => {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export const generateReportNumber = (): string => {
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LAB-${date}-${random}`;
};
