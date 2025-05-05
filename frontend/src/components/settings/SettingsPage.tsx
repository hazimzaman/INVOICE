'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateSettings, fetchSettings } from '@/store/slices/settingsSlice';
import { Settings } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

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

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { data: settings } = useAppSelector((state) => state.settings);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Business section
    business_name: settings?.business_name || '',
    business_logo: settings?.business_logo || '',
    business_address: settings?.business_address || '',
    
    // Contact section
    contact_name: settings?.contact_name || '',
    contact_email: settings?.contact_email || '',
    contact_phone: settings?.contact_phone || '',
    wise_email: settings?.wise_email || '',
    
    // Invoice section
    invoice_prefix: settings?.invoice_prefix || 'INV-',
    current_invoice_number: settings?.current_invoice_number || 1,
    footer_note: settings?.footer_note || '',
    
    // Email section
    email_template: settings?.email_template || defaultTemplate,
    email_subject: settings?.email_subject || 'Invoice {{invoice_number}} from {{business_name}}'
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Load existing logo on component mount
  useEffect(() => {
    console.log('Settings from store:', settings);
    console.log('Business logo URL:', settings?.business_logo);
    if (settings?.business_logo) {
      setLogoPreview(settings.business_logo);
      console.log('Setting logo preview to:', settings.business_logo);
    }
  }, [settings]);

  // Add this effect to fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Update initial state to use settings and handle filename
  useEffect(() => {
    if (settings) {
      setFormData({
        business_name: settings.business_name || '',
        business_logo: settings.business_logo || '',
        business_address: settings.business_address || '',
        contact_name: settings.contact_name || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        wise_email: settings.wise_email || '',
        invoice_prefix: settings.invoice_prefix || 'INV-',
        current_invoice_number: settings.current_invoice_number || 1,
        footer_note: settings.footer_note || '',
        email_template: settings.email_template || defaultTemplate,
        email_subject: settings.email_subject || 'Invoice {{invoice_number}} from {{business_name}}'
      });
      setLogoPreview(settings.business_logo || null);
      
      // Extract filename from business_logo URL if it exists
      if (settings.business_logo) {
        const filename = settings.business_logo.split('/').pop() || '';
        setSelectedFileName(filename.split('-').pop() || 'Current logo');
      } else {
        setSelectedFileName('');
      }
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateSettings({ settings: formData })).unwrap();
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Set the selected filename
    setSelectedFileName(file.name);
    
    try {
      setLoading(true);
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(`logos/${Date.now()}-${file.name}`, file);

      if (error) throw error;

      // Get public URL
      const publicUrl = supabase.storage
        .from('logos')
        .getPublicUrl(`logos/${Date.now()}-${file.name}`).data.publicUrl;

      console.log('Uploaded file URL:', publicUrl);

      // Update both states
      setFormData(prev => {
        console.log('Updating formData with logo:', publicUrl);
        return { ...prev, business_logo: publicUrl };
      });
      setLogoPreview(publicUrl);

      // Save immediately
      const result = await dispatch(updateSettings({ 
        settings: { ...formData, business_logo: publicUrl } 
      })).unwrap();
      console.log('Save result:', result);

      toast.success('Logo uploaded successfully');
    } catch (error) {
      setSelectedFileName(''); // Clear filename on error
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='max-w-[1240px] w-full m-auto flex flex-col justify-center items-center pt-35 pb-20'>
      <div className="max-w-4xl  p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-[55px] px-4 border border-gray-200 rounded-lg flex items-center bg-white">
                  <span className={selectedFileName ? 'text-black' : 'text-gray-500'}>
                    {selectedFileName 
                      ? `Current logo: ${selectedFileName}` 
                      : 'Please select a logo...'}
                  </span>
                </div>
              </div>
              {/* Only show logo preview after successful upload */}
              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <textarea
                name="business_address"
                value={formData.business_address}
                onChange={handleChange}
                className="w-full min-h-[110px] p-4 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wise Email
              </label>
              <input
                type="email"
                name="wise_email"
                value={formData.wise_email}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number Prefix
                <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>
              </label>
              <input
                type="text"
                name="invoice_prefix"
                value={formData.invoice_prefix}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
                placeholder="e.g., INV-"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Invoice Number
              </label>
              <input
                type="number"
                name="current_invoice_number"
                value={formData.current_invoice_number}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Footer Note
              </label>
              <textarea
                name="footer_note"
                value={formData.footer_note}
                onChange={handleChange}
                className="w-full min-h-[110px] p-4 border border-gray-200 rounded-lg"
                placeholder="Enter any additional notes to appear at the bottom of invoices"
              />
            </div>
          </div>
        </div>

        {/* Email Settings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Email Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
                <div className="mt-1 text-xs text-gray-500">
                  Available variables: {'{{'} business_name {'}}'},  {'{{'} client_name {'}}'},  {'{{'} invoice_number {'}}'},
                  {'{{'} total_amount {'}}'},  {'{{'} due_date {'}}'},  {'{{'} payment_details {'}}'}
                </div>
              </label>
              <textarea
                name="email_template"
                value={formData.email_template}
                onChange={handleChange}
                className="w-full min-h-[110px] p-4 border border-gray-200 rounded-lg"
                placeholder="Enter your email template"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                name="email_subject"
                value={formData.email_subject}
                onChange={handleChange}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className='flex justify-end'>
        <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg font-medium"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving Changes...
              </>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>
        
      </form>
    </div>
    </section>
  );
} 