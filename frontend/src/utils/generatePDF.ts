import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';
import { pdf } from '@react-pdf/renderer';
import InvoicePDFTemplate from '@/components/invoices/InvoicePDFTemplate';
import React from 'react';

export const generatePDF = async (invoice: Invoice, settings: Settings): Promise<Blob> => {
  try {
    // Create the PDF document
    const PDFDocument = React.createElement(InvoicePDFTemplate, {
      invoice,
      businessInfo: settings
    });

    // Generate PDF blob
    const blob = await pdf(PDFDocument).toBlob();
    
    if (!blob) {
      throw new Error('Failed to generate PDF blob');
    }

    return blob;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const getInvoiceFilename = (invoice: Invoice): string => {
  const clientName = invoice.client?.name?.replace(/\s+/g, '-').toLowerCase() || '';
  return `invoice-${invoice.invoice_number}-${clientName}.pdf`;
}; 