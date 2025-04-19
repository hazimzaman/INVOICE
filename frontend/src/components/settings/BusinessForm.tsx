'use client';

import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateBusinessInfo } from '@/redux/features/settingsSlice';
import { showNotification } from '@/redux/features/notificationSlice';

export default function BusinessForm() {
  const dispatch = useAppDispatch();
  const businessInfo = useAppSelector((state) => state.settings.business);

  const [formData, setFormData] = useState({
    name: businessInfo.name || '',
    logo: businessInfo.logo || '',
    address: businessInfo.address || '',
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      dispatch(updateBusinessInfo({
        ...formData,
        logo: logoPreview || formData.logo,
      }));
      dispatch(showNotification({
        message: 'Business information saved successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to save business information',
        type: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="grid grid-cols-2 gap-6">
            <div>
              {logoPreview ? (
                <div className="relative w-32 h-32">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                  <FiUpload className="text-3xl text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <input
                  type="file"
                  id="logo"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange}
                />
                <label
                  htmlFor="logo"
                  className="block text-center cursor-pointer"
                >
                  <span className="text-blue-600 hover:text-blue-700">
                    Click to upload
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <p className="text-sm text-gray-500 mt-1">
                    JPEG, PNG, GIF, WebP up to 5MB
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter your business address"
          />
        </div>

        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2
              ${isSaving 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 