'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { generatePDF } from '@/utils/generatePDF';
import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';

interface Props {
  invoice: Invoice;
  settings: Settings;
}

export const InvoiceActions: React.FC<Props> = ({ invoice, settings }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      const pdfBlob = await generatePDF(invoice, settings);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {isGenerating ? 'Generating...' : 'Download Invoice'}
    </button>
  );
}; 