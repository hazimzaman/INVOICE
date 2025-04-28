'use client';

import React, { useState } from 'react';
import { Settings } from '@/types/settings';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface BusinessFormProps {
  initialData: Settings | null;
  onSubmit: (data: any) => void;
  hideSubmitButton?: boolean;
}

export default function BusinessForm({ initialData, onSubmit, hideSubmitButton }: BusinessFormProps) {
  const [formData, setFormData] = useState({
    business_name: initialData?.business_name || '',
    business_logo: initialData?.business_logo || '',
    business_address: initialData?.business_address || ''
  });
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Log file details
      console.log('Uploading file:', file.name, file.type);

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Log the public URL
      console.log('Logo public URL:', publicUrl);

      setFormData(prev => ({
        ...prev,
        business_logo: publicUrl
      }));

      // Log the updated form data
      console.log('Updated form data:', formData);
    } catch (error: any) {
      console.error('Error uploading logo:', error.message);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Name
        </label>
        <input
          type="text"
          className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
          value={formData.business_name}
          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Logo
        </label>
        <div className="flex items-center space-x-4">
          {formData.business_logo && (
            <img 
              src={formData.business_logo} 
              alt="Business Logo" 
              className="h-16 w-16 object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full h-[55px] px-4 border border-gray-200 rounded-lg"
            disabled={uploading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Address
        </label>
        <textarea
          className="w-full min-h-[110px] p-4 border border-gray-200 rounded-lg"
          value={formData.business_address}
          onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
        />
      </div>

      {/* Only show submit button if hideSubmitButton is false */}
      {!hideSubmitButton && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  );
} 