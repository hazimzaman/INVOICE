'use client';

import { useState } from 'react';
import BusinessForm from '@/components/settings/BusinessForm';
import ContactForm from '@/components/settings/ContactForm';
import InvoiceForm from '@/components/settings/InvoiceForm';
import EmailSettingsForm from '@/components/settings/EmailSettingsForm';

type TabType = 'business' | 'contact' | 'invoice' | 'email';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('business');

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
            {activeTab === 'business' && <BusinessForm />}
            {activeTab === 'contact' && <ContactForm />}
            {activeTab === 'invoice' && <InvoiceForm />}
            {activeTab === 'email' && <EmailSettingsForm />}
          </div>
        </div>
      </div>
    </div>
  );
} 