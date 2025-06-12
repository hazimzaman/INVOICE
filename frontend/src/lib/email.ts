import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';
import { API_BASE_URL } from '@/lib/config';

export const sendEmail = async (
  invoice: Invoice,
  settings: Settings,
  emailContent: string,
  pdfBuffer: Buffer
) => {
  try {
    const formData = new FormData();
    formData.append('to', invoice.client?.email || '');
    formData.append('subject', `Invoice ${invoice.invoice_number} from ${settings.business_name}`);
    formData.append('html', emailContent);
    formData.append('cc', settings.cc_email || '');
    formData.append('bcc', settings.bcc_email || '');
    
    // Convert Buffer to Blob and append to FormData
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('attachment', pdfBlob, `invoice-${invoice.invoice_number}.pdf`);

    const response = await fetch(`${API_BASE_URL}/api/send-email`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}; 