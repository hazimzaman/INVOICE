'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateSettings } from '@/store/slices/settingsSlice';
import { showNotification } from '@/store/slices/notificationSlice';
import { Settings } from '@/types/settings';

interface ContactFormData {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  wise_email: string;
}

interface ContactFormProps {
  initialData: ContactFormData | null;
  onSubmit: (data: ContactFormData) => Promise<void>;
}

export default function ContactForm({ initialData, onSubmit }: ContactFormProps) {
  const dispatch = useAppDispatch();
  const { data: settings } = useAppSelector((state) => state.settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    defaultValues: {
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      wise_email: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmitForm = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to save contact info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = settings ? {
    contact_name: settings.contact_name,
    contact_email: settings.contact_email,
    contact_phone: settings.contact_phone,
    wise_email: settings.wise_email
  } : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Name
          </label>
          <input
            type="text"
            {...register('contact_name', { required: 'Contact name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.contact_name && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Email
          </label>
          <input
            type="email"
            {...register('contact_email', { 
              required: 'Contact email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.contact_email && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Phone
          </label>
          <input
            type="tel"
            {...register('contact_phone', { required: 'Contact phone is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.contact_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Wise Email
          </label>
          <input
            type="email"
            {...register('wise_email', {
              required: 'Wise email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.wise_email && (
            <p className="mt-1 text-sm text-red-600">{errors.wise_email.message}</p>
          )}
        </div>

        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 