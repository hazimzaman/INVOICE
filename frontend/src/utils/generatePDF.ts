import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';
import { pdf } from '@react-pdf/renderer';
import InvoicePDFTemplate from '@/components/invoices/InvoicePDFTemplate';
import React from 'react';

export const generatePDF = async (invoice: Invoice, settings: Settings): Promise<Blob> => {
  try {
    const doc = await pdf(
      React.createElement(InvoicePDFTemplate, {
        invoice,
        businessInfo: settings
      })
    ).toBlob();
    return doc;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF');
  }
}; 