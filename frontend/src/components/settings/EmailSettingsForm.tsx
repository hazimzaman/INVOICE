'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateEmailSettings } from '@/redux/features/settingsSlice';
import { showNotification } from '@/redux/features/notificationSlice';

export default function EmailSettingsForm() {
  const dispatch = useAppDispatch();
  const emailSettings = useAppSelector((state) => state.settings.email);

  const [formData, setFormData] = useState({
    defaultEmailContent: emailSettings.defaultEmailContent || '',
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