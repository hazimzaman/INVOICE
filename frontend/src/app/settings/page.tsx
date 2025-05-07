'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSettings, updateSettings, uploadLogo, type Settings } from '@/lib/settings';
import { checkAuth } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { updateSettings as dispatchUpdateSettings } from '@/store/slices/settingsSlice';

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<Settings>>({
    // Business Settings
    business_name: '',
    business_logo: '',
    business_address: '',
    
    // Contact Settings
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    wise_email: '',
    
    // Invoice Settings
    invoice_prefix: 'INV-',
    current_invoice_num: 1,
    footer_note: '',
    
    // Email Settings
    email_template: '',
    email_subject: ''
  });

  useEffect(() => {
    const init = async () => {
      const session = await checkAuth();
      if (!session) {
        router.push('/login');
        return;
      }
      loadSettings();
    };

    init();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Make sure required fields are included
      const updatedSettings = {
        ...settings,
        current_invoice_num: settings.current_invoice_num || 1,
        invoice_prefix: settings.invoice_prefix || 'INV-'
      };

      await dispatch(dispatchUpdateSettings(updatedSettings)).unwrap();
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const logoUrl = await uploadLogo(file);
      if (logoUrl) {
        setSettings(prev => ({ ...prev, business_logo: logoUrl }));
        toast.success('Logo uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <section className="container mx-auto py-30 px-6 max-w-[1240px] w-full m-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="max-w-[1240px] mx-auto space-y-8">
        {/* Business Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={settings.business_name || ''}
                onChange={e => setSettings(prev => ({ ...prev, business_name: e.target.value }))}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              <div className="flex items-center gap-4">
                {settings.business_logo && (
                  <img 
                    src={settings.business_logo} 
                    alt="Business Logo" 
                    className="h-14 w-14 object-contain"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                           file:rounded-md file:border-0 file:text-sm file:font-medium
                           file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              value={settings.business_address || ''}
              onChange={e => setSettings(prev => ({ ...prev, business_address: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold">Contact Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={settings.contact_name || ''}
                onChange={e => setSettings(prev => ({ ...prev, contact_name: e.target.value }))}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={e => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={settings.contact_phone || ''}
                onChange={e => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wise Email
              </label>
              <input
                type="email"
                value={settings.wise_email || ''}
                onChange={e => setSettings(prev => ({ ...prev, wise_email: e.target.value }))}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold">Invoice Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={settings.invoice_prefix || ''}
                onChange={e => setSettings(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., INV-"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Invoice Number
              </label>
              <input
                type="number"
                min="1"
                value={settings.current_invoice_num || 1}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  current_invoice_num: parseInt(e.target.value) || 1
                }))}
                className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Next invoice will start from this number
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Footer Note
            </label>
            <textarea
              value={settings.footer_note || ''}
              onChange={e => setSettings(prev => ({ ...prev, footer_note: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold">Email Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject Template
            </label>
            <input
              type="text"
              value={settings.email_subject || ''}
              onChange={e => setSettings(prev => ({ ...prev, email_subject: e.target.value }))}
              className="w-full h-[55px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Invoice {invoice_number} from {business_name}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <div className="text-xs text-gray-500 mb-2">
              Available variables: {'{business_name}'}, {'{client_name}'}, {'{invoice_number}'},
              {'{total_amount}'}, {'{due_date}'}, {'{payment_details}'}
            </div>
            <textarea
              value={settings.email_template || ''}
              onChange={e => setSettings(prev => ({ ...prev, email_template: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={`Dear {client_name},

Please find attached invoice {invoice_number} for {total_amount}.

{custom_message}

Best regards,
{business_name}`}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 transition-colors text-lg font-medium min-w-[200px]"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
} 