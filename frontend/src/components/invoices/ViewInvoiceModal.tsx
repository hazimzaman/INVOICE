'use client';

import { FiX, FiDownload, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Invoice } from '@/types/invoice';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { generateInvoicePdf } from '@/utils/generateInvoicePdf';
import { useState } from 'react';
import { sendEmail } from '@/services/emailService';
import { parseEmailTemplate } from '@/utils/emailTemplate';
import { showNotification } from '@/store/slices/notificationSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export default function ViewInvoiceModal({ isOpen, onClose, invoice }: ViewInvoiceModalProps) {
  const [isSending, setIsSending] = useState(false);
  const { business, contact, email: emailSettings } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const handleDownload = () => {
    const doc = generateInvoicePdf(invoice, {
      name: business.name,
      logo: business.logo,
      address: business.address,
      contactPhone: contact.contactPhone,
      wiseEmail: contact.wiseEmail
    });

    // Download the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!invoice.client.email) {
      dispatch(showNotification({
        message: 'Client email is missing. Please update client information with an email address.',
        type: 'error'
      }));
      return;
    }
    try {
      setIsSending(true);

      // Generate PDF
      const doc = generateInvoicePdf(invoice, {
        name: business.name,
        logo: business.logo,
        address: business.address,
        contactPhone: contact.contactPhone,
        wiseEmail: contact.wiseEmail
      });

      // Parse email template
      const emailBody = parseEmailTemplate(emailSettings.defaultEmailContent, {
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: `${invoice.client.currency} ${invoice.total.toFixed(2)}`,
        dueDate: invoice.dueDate,
        businessName: business.name
      });

      // Convert PDF to base64
      const pdfBlob = doc.output('blob');
      const base64pdf = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      // Send email
      await sendEmail({
        to: invoice.client.email,
        subject: `Invoice #${invoice.invoiceNumber} from ${business.name}`,
        body: emailBody,
        attachments: [{
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: base64pdf.split(',')[1] // Remove data URL prefix
        }]
      });

      dispatch(showNotification({
        message: 'Email sent successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to send email',
        type: 'error'
      }));
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-lg w-full max-w-[800px] p-8 shadow-xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
            <p className="text-gray-500 mt-1">Created on {invoice.date}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button 
              onClick={handleSendEmail}
              disabled={isSending}
              className={`text-gray-600 hover:text-blue-600 p-2 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSending ? (
                <LoadingSpinner />
              ) : (
                <FiMail className="text-xl" />
              )}
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-red-600 p-2">
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Client and Invoice Info */}
          <div className="grid grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Client Details</h3>
              <p className="text-gray-900 font-medium">{invoice.client.name}</p>
              <p className="text-gray-600">{invoice.client.company}</p>
              
              <div className="mt-4 space-y-2">
                {invoice.client.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMail className="text-gray-400" />
                    <p>{invoice.client.email}</p>
                  </div>
                )}
                {invoice.client.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="text-gray-400" />
                    <p>{invoice.client.phone}</p>
                  </div>
                )}
                {invoice.client.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMapPin className="text-gray-400" />
                    <p>{invoice.client.address}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Invoice Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="text-gray-900">{invoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="text-gray-900">{invoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`capitalize font-medium ${
                    invoice.status === 'paid' ? 'text-green-600' :
                    invoice.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b">
                <div className="col-span-3 font-medium text-gray-700">Item</div>
                <div className="col-span-6 font-medium text-gray-700">Description</div>
                <div className="col-span-3 font-medium text-gray-700 text-right">Price</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y">
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 p-4">
                    <div className="col-span-3">
                      <p className="text-gray-900">{item.name}</p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="text-gray-900">{invoice.client.currency}{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end border-t pt-6">
            <div className="w-64">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{invoice.client.currency}{invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-900 font-medium">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {invoice.client.currency}{invoice.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 