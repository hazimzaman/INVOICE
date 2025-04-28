'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateSettings } from '@/store/slices/settingsSlice';
import { showNotification } from '@/store/slices/notificationSlice';
import { Settings } from '@/types/settings';
import { toast } from 'react-hot-toast';

interface InvoiceFormData {
  invoice_prefix: string;
  footer_note: string;
  current_invoice_number: number;
}

interface InvoiceFormProps {
  initialData: InvoiceFormData | null;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
}

export default function InvoiceForm({ initialData, onSubmit }: InvoiceFormProps) {
  const dispatch = useAppDispatch();
  const { data: settings } = useAppSelector((state) => state.settings);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<InvoiceFormData>({
    defaultValues: {
      invoice_prefix: initialData?.invoice_prefix || 'INV-',
      current_invoice_number: initialData?.current_invoice_number || 1,
      footer_note: initialData?.footer_note || ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmitForm = async (data: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        current_invoice_number: Number(data.current_invoice_number)
      });
      toast.success('Invoice settings updated successfully');
    } catch (error) {
      console.error('Failed to save invoice settings:', error);
      toast.error('Failed to save invoice settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Invoice Settings</h2>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invoice Number Prefix
            <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>
          </label>
          <input
            type="text"
            className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
            {...register('invoice_prefix')}
            placeholder="e.g., INV-"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty if you don't want to use a prefix
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Next Invoice Number
          </label>
          <input
            type="number"
            min="1"
            className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
            {...register('current_invoice_number', { 
              required: 'Invoice number is required',
              min: {
                value: 1,
                message: 'Number must be greater than 0'
              }
            })}
          />
          {errors.current_invoice_number && (
            <p className="mt-1 text-sm text-red-600">{errors.current_invoice_number.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Next invoice will be: {watch('invoice_prefix')}{String(watch('current_invoice_number')).padStart(3, '0')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invoice Footer Note
          </label>
          <textarea
            className="w-full min-h-[110px] p-4 border border-gray-200 rounded-lg"
            {...register('footer_note')}
            placeholder="Enter any additional notes to appear at the bottom of invoices"
          />
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