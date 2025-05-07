import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSettings, uploadLogo } from '../lib/settings';

const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const settings = await fetchSettings();
      if (settings) {
        setSettings(settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  loadSettings();
}, []);

const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  try {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const logoUrl = await uploadLogo(file);
    
    if (!logoUrl) {
      throw new Error('Failed to upload logo');
    }

    const success = await updateSettings({ business_logo: logoUrl });
    if (!success) {
      throw new Error('Failed to update settings with new logo');
    }

    // Refresh settings
    const updatedSettings = await fetchSettings();
    if (!updatedSettings) {
      throw new Error('Failed to fetch updated settings');
    }
    setSettings(updatedSettings);
  } catch (error) {
    console.error('Logo upload error:', error);
    setError(error instanceof Error ? error.message : 'Failed to upload logo');
  } finally {
    setIsUploading(false);
  }
}; 