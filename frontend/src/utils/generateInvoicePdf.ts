import { jsPDF } from 'jspdf';
import { Invoice } from '@/types/invoice';

interface BusinessInfo {
  name: string;
  logo: string;
  address: string;
  contactPhone: string;
  wiseEmail: string;
}

type TextAlignment = 'left' | 'center' | 'right' | 'justify';

export const generateInvoicePdf = (invoice: Invoice, businessInfo: BusinessInfo) => {
  const doc = new jsPDF();
  
  // Add "INVOICE" text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(35);
  doc.text('INVOICE', 20, 40);

  // Add logo in top right with border
  if (businessInfo.logo) {
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(150, 20, 40, 40, 3, 3);
    doc.addImage(businessInfo.logo, 'JPEG', 150, 20, 40, 40);
  }

  // Business info - right aligned
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(businessInfo.name, 190, 75, { align: 'right' });
  doc.text(businessInfo.contactPhone, 190, 85, { align: 'right' });
  doc.text(businessInfo.address, 190, 95, { align: 'right' });

  // WISE info - right aligned
  doc.text('WISE:', 150, 105);
  doc.text(businessInfo.wiseEmail, 190, 105, { align: 'right' });

  // Left column labels and values
  const leftStart = 20;
  const leftValueStart = 85;
  const lineHeight = 15;
  let currentY = 90;

  // Invoice details
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', leftStart, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, leftValueStart, currentY);
  currentY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Bill to:', leftStart, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client.company, leftValueStart, currentY);
  currentY += lineHeight;
  doc.text(invoice.client.name, leftValueStart, currentY);
  currentY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Address:', leftStart, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client.address || '', leftValueStart, currentY);

  // Date - right aligned
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 150, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.date, 190, currentY, { align: 'right' });

  // Table
  currentY += lineHeight * 2;
  const tableHeaders = [
    { text: '#', x: 20, align: 'left' as TextAlignment },
    { text: 'Item', x: 40, align: 'left' as TextAlignment },
    { text: 'Price', x: 120, align: 'right' as TextAlignment },
    { text: 'Amount', x: 190, align: 'right' as TextAlignment }
  ];

  // Headers
  doc.setFont('helvetica', 'bold');
  tableHeaders.forEach(header => {
    doc.text(header.text, header.x, currentY, { align: header.align });
  });

  // Lines
  currentY += 5;
  doc.line(20, currentY, 190, currentY);

  // Items
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item, index) => {
    currentY += 10;
    doc.text((index + 1).toString(), 20, currentY);
    doc.text(item.name, 40, currentY);
    doc.text(item.price.toFixed(2), 120, currentY, { align: 'right' });
    doc.text(item.price.toFixed(2), 190, currentY, { align: 'right' });
  });

  // Bottom line
  currentY += 15;
  doc.line(20, currentY, 190, currentY);

  // Total
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Total', 120, currentY, { align: 'right' });
  doc.text(`${invoice.client.currency} ${invoice.total.toFixed(2)}`, 190, currentY, { align: 'right' });

  return doc;
}; 