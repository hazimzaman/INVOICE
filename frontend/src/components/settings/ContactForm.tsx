'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateContactInfo } from '@/store/slices/settingsSlice';
import { showNotification } from '@/store/slices/notificationSlice';

export default function ContactForm() {
  const dispatch = useAppDispatch();
  const contactInfo = useAppSelector((state) => state.settings.contact);

  const [formData, setFormData] = useState({
    contactName: contactInfo.contactName || '',
    contactEmail: contactInfo.contactEmail || '',
    contactPhone: contactInfo.contactPhone || '',
    wiseEmail: contactInfo.wiseEmail || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dispatch(updateContactInfo(formData));
      dispatch(showNotification({
        message: 'Contact information saved successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to save contact information',
        type: 'error'
      }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wise Email
            </label>
            <input
              type="email"
              name="wiseEmail"
              value={formData.wiseEmail}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Wise email"
            />
          </div>
        </div>

        <div className="pt-6 border-t">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
} 