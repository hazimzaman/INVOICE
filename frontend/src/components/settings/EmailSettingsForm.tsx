'use client';

import React, { useState } from 'react';
import { Settings } from '@/types/settings';

interface EmailSettingsFormProps {
  initialData: Settings | null;
  onSubmit: (data: Partial<Settings>) => void;
}

const defaultTemplate = `Dear {{client_name}},

I hope this email finds you well. Please find attached invoice {{invoice_number}} for {{total_amount}}.

Payment Details:
- Invoice Number: {{invoice_number}}
- Due Date: {{due_date}}
- Amount Due: {{total_amount}}

If you have any questions, please don't hesitate to contact me.
Contact Email: {{contact_email}}

Best regards,
{{business_name}}`;

export default function EmailSettingsForm({ initialData, onSubmit }: EmailSettingsFormProps) {
  const [formData, setFormData] = useState({
    email_template: initialData?.email_template || defaultTemplate,
    email_subject: initialData?.email_subject || 'Invoice {{invoice_number}} from {{business_name}}'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Template
          <div className="mt-1 text-xs text-gray-500">
            Available variables: {'{{'} business_name {'}}'},  {'{{'} client_name {'}}'},  {'{{'} invoice_number {'}}'},
            {'{{'} total_amount {'}}'},  {'{{'} due_date {'}}'},  {'{{'} payment_details {'}}'}
          </div>
        </label>
        <textarea
          className="w-full min-h-[110px] p-4 border border-gray-200 rounded-lg"
          value={formData.email_template}
          onChange={(e) => setFormData({ ...formData, email_template: e.target.value })}
          placeholder="Enter your email template"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Subject
        </label>
        <input
          type="text"
          className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
          value={formData.email_subject}
          onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
        />
      </div>
    </form>
  );
} 