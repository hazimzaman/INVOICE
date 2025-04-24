import { pdf, PDFDownloadOptions } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';
import { InvoicePDF } from '@/components/invoices/InvoicePDFTemplate';
import React from 'react';

export const generatePDF = async (invoice: Invoice, businessInfo: Settings): Promise<Blob> => {
  try {
    const element = React.createElement(InvoicePDF, { invoice, businessInfo });
    const asPdf = pdf(element);
    return await asPdf.toBlob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 