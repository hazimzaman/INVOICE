import { Dialog } from '@headlessui/react';
import { FiX, FiDownload, FiMail } from 'react-icons/fi';
import { Invoice } from '@/types/invoice';
import { formatDate } from '@/utils/dateFormat';
import { generateInvoicePDF } from './InvoicePDFTemplate';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import { sendEmail } from '@/lib/email';
import { useState } from 'react';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export default function ViewInvoiceModal({ isOpen, onClose, invoice }: ViewInvoiceModalProps) {
  const { data: settings } = useAppSelector((state) => state.settings);
  const [sending, setSending] = useState(false);
  
  const replaceTemplateVariables = (template: string) => {
    const replacements = {
      '{{client_name}}': invoice.client?.name || '',
      '{{invoice_number}}': invoice.invoice_number,
      '{{total_amount}}': `${invoice.client?.currency || '€'}${invoice.total.toFixed(2)}`,
      '{{due_date}}': formatDate(invoice.due_date),
      '{{payment_details}}': settings?.wise_email || '',
      '{{business_name}}': settings?.business_name || '',
      '{{contact_email}}': settings?.contact_email || ''
    };

    let emailContent = template;
    
    // Default template if none provided
    if (!template) {
      emailContent = `Dear {{client_name}},

I hope this email finds you well. Please find attached invoice {{invoice_number}} for {{total_amount}}.

Payment Details:
- Invoice Number: {{invoice_number}}
- Due Date: {{due_date}}
- Amount Due: {{total_amount}}

If you have any questions, please don't hesitate to contact me.
Contact Email: {{contact_email}}

Best regards,
{{business_name}}`;
    }

    // Replace all variables without spaces
    const htmlContent = Object.entries(replacements).reduce((text, [key, value]) => {
      return text.replace(new RegExp(key.replace(/\s+/g, ''), 'g'), value);
    }, emailContent);

    // Convert line breaks to HTML breaks for proper email formatting
    return htmlContent.replace(/\n/g, '<br>');
  };

  const handleDownloadPDF = async () => {
    try {
      // Ensure invoice has settings data
      const invoiceWithSettings = {
        ...invoice,
        settings: invoice.settings || settings || undefined
      };
      
      const pdfBytes = await generateInvoicePDF(invoiceWithSettings);
      
      // Create blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleSendEmail = async () => {
    try {
      setSending(true);

      if (!invoice.client?.email) {
        throw new Error('Client email is required');
      }

      // Generate PDF
      const pdfBytes = await generateInvoicePDF({
        ...invoice,
        settings: invoice.settings || settings || undefined
      });

      // Prepare email content
      const emailBody = replaceTemplateVariables(settings?.email_template || '');
      const emailSubject = replaceTemplateVariables('Invoice {{invoice_number}} from {{business_name}}');

      // Send email with PDF attachment
      await sendEmail({
        to: invoice.client.email,
        subject: emailSubject,
        body: emailBody,
        attachments: [{
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: Buffer.from(pdfBytes).toString('base64')
        }]
      });

      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold">Invoice Details</Dialog.Title>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className={`text-gray-600 hover:text-gray-800 ${sending ? 'opacity-50' : ''}`}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiMail className="w-5 h-5" />
                  )}
                </button>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900">Invoice Number</h3>
                  <p className="text-gray-600">{invoice.invoice_number}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Client Details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Client Details</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">{invoice.client?.name}</p>
                  {invoice.client?.company && (
                    <p className="text-gray-600">{invoice.client.company}</p>
                  )}
                  <p className="text-gray-600">{invoice.client?.email}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900">Invoice Date</h3>
                  <p className="text-gray-600">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Due Date</h3>
                  <p className="text-gray-600">{formatDate(invoice.due_date)}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Items</h3>
                <div className="border rounded overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                          <td className="px-6 py-4">{item.description}</td>
                          <td className="px-6 py-4 text-right">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-6 py-4 text-right font-medium">Total</td>
                        <td className="px-6 py-4 text-right font-medium">${invoice.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 