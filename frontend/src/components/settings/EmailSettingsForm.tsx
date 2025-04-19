'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateEmailSettings } from '@/store/slices/settingsSlice';
import { showNotification } from '@/store/slices/notificationSlice';

export default function EmailSettingsForm() {
  const dispatch = useAppDispatch();
  const emailSettings = useAppSelector((state) => state.settings.email);

  const defaultEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    .email-container {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .invoice-details {
      background-color: #ffffff;
      border: 1px solid #e9ecef;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .amount {
      font-size: 24px;
      color: #2563eb;
      font-weight: bold;
    }
    .footer {
      font-size: 12px;
      color: #6b7280;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h2>Invoice from {businessName}</h2>
    </div>
    
    <p>Dear {clientName},</p>
    
    <p>I hope this email finds you well. Please find attached the invoice #{invoiceNumber}.</p>
    
    <div class="invoice-details">
      <h3>Invoice Details:</h3>
      <p><strong>Invoice Number:</strong> #{invoiceNumber}</p>
      <p><strong>Amount:</strong> <span class="amount">{amount}</span></p>
      <p><strong>Due Date:</strong> {dueDate}</p>
    </div>
    
    <p><strong>Payment Instructions:</strong></p>
    <ul>
      <li>Bank Transfer to the WISE account mentioned in the invoice</li>
      <li>Please include invoice number as reference</li>
    </ul>
    
    <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
    
    <p>Thank you for your business!</p>
    
    <div class="footer">
      <p>Best regards,<br>{businessName}</p>
    </div>
  </div>
</body>
</html>`;

  const [formData, setFormData] = useState({
    defaultEmailContent: defaultEmailTemplate,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      dispatch(updateEmailSettings(formData));
      dispatch(showNotification({
        message: 'Email settings saved successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to save email settings',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Email Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Email Content
          </label>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Available variables:</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><code className="bg-gray-100 px-1 rounded">{'{clientName}'}</code> - Client's name</li>
              <li><code className="bg-gray-100 px-1 rounded">{'{invoiceNumber}'}</code> - Invoice number</li>
              <li><code className="bg-gray-100 px-1 rounded">{'{amount}'}</code> - Invoice amount</li>
            </ul>
          </div>

          <textarea
            name="defaultEmailContent"
            value={formData.defaultEmailContent}
            onChange={handleChange}
            rows={6}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Example: Hi {clientName}, Please find attached invoice #{invoiceNumber}..."
          />
          <p className="text-sm text-gray-500 mt-1">
            This content will be pre-filled when sending invoices via email.
          </p>
        </div>

        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2
              ${isSaving 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 