'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSettings, updateSettings } from '@/store/slices/settingsSlice';
import BusinessForm from '@/components/settings/BusinessForm';
import ContactForm from '@/components/settings/ContactForm';
import InvoiceForm from '@/components/settings/InvoiceForm';
import EmailSettingsForm from '@/components/settings/EmailSettingsForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import { Settings } from '@/types/settings';

type TabType = 'business' | 'contact' | 'invoice' | 'email';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('business');
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { data: settings, loading, error } = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (user) {
      dispatch(fetchSettings());
    }
  }, [dispatch, user]);

  const handleUpdateSettings = async (updates: Partial<Settings>) => {
    if (!user) return;

    try {
      await dispatch(updateSettings({ settings: updates })).unwrap();
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="w-full max-w-[1240px] mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="grid grid-cols-12 gap-8">
        {/* Tabs */}
        <div className="col-span-3">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('business')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'business'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Business Information
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'contact'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Contact Information
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'invoice'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Invoice Settings
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'email'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Email Settings
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="col-span-9">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'business' && (
              <BusinessForm 
                initialData={settings}
                onSubmit={(data) => handleUpdateSettings({
                  business_name: data.business_name,
                  business_logo: data.business_logo,
                  business_address: data.business_address
                })}
              />
            )}
            {activeTab === 'contact' && (
              <ContactForm 
                initialData={settings}
                onSubmit={(data) => handleUpdateSettings({
                  contact_name: data.contact_name,
                  contact_email: data.contact_email,
                  contact_phone: data.contact_phone,
                  wise_email: data.wise_email
                })}
              />
            )}
            {activeTab === 'invoice' && (
              <InvoiceForm 
                initialData={settings}
                onSubmit={(data) => handleUpdateSettings({
                  invoice_prefix: data.invoice_prefix,
                  footer_note: data.footer_note,
                  current_invoice_number: data.current_invoice_number
                })}
              />
            )}
            {activeTab === 'email' && (
              <EmailSettingsForm 
                initialData={settings}
                onSubmit={(data) => handleUpdateSettings({
                  email_template: data.email_template
                })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 