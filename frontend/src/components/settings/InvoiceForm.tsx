'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateInvoiceSettings } from '@/store/slices/settingsSlice';
import { showNotification } from '@/store/slices/notificationSlice';

export default function InvoiceForm() {
  const dispatch = useAppDispatch();
  const invoiceSettings = useAppSelector((state) => state.settings.invoice);

  const [formData, setFormData] = useState({
    invoiceNumberPrefix: invoiceSettings.invoiceNumberPrefix || '',
    footerNote: invoiceSettings.footerNote || '',
    currentInvoiceNumber: invoiceSettings.currentInvoiceNumber || 1,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      const nextNumber = parseInt(formData.currentInvoiceNumber.toString(), 10);
      
      dispatch(updateInvoiceSettings({
        ...invoiceSettings,
        ...formData,
        currentInvoiceNumber: nextNumber
      }));
      
      dispatch(showNotification({
        message: 'Invoice settings saved successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to save invoice settings',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Invoice Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number Prefix
            </label>
            <input
              type="text"
              name="invoiceNumberPrefix"
              value={formData.invoiceNumberPrefix}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., INV-"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Invoice Number
            </label>
            <input
              type="number"
              name="currentInvoiceNumber"
              value={formData.currentInvoiceNumber}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invoice Footer Note
          </label>
          <textarea
            name="footerNote"
            value={formData.footerNote}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Thank you for your business!"
          />
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