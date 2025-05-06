import { pdf, Document, Page } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';
import { InvoicePDF } from '@/components/invoices/InvoicePDFTemplate';
import React from 'react';

export const generatePDF = async (invoice: Invoice, businessInfo: Settings): Promise<Blob> => {
  try {
    const doc = React.createElement(Document, {},
      React.createElement(Page, { size: "A4" },
        React.createElement(InvoicePDF, { invoice, businessInfo })
      )
    );
    
    return await pdf(doc).toBlob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 