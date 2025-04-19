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
            {/* Copy the rest of your original settings/page.tsx content here */}
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