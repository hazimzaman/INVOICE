import { supabase } from './supabase';

export interface Settings {
  id: string;
  user_id: string;
  business_name: string | null;
  business_logo: string | null;
  business_address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  wise_email: string | null;
  invoice_prefix: string | null;
  footer_note: string | null;
  current_invoice_num: number;
  created_at: string;
  updated_at: string;
  email_template: string | null;
  email_subject: string | null;
}

const defaultSettings: Omit<Settings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  business_name: null,
  business_logo: null,
  business_address: null,
  contact_name: null,
  contact_email: null,
  contact_phone: null,
  wise_email: null,
  invoice_prefix: 'INV-',
  footer_note: null,
  current_invoice_num: 1,
  email_template: null,
  email_subject: null,
};

export async function fetchSettings(): Promise<Settings | null> {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      throw new Error('Authentication failed');
    }

    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    // First try to get existing settings
    const { data, error } = await supabase
      .from('settings')
      .select()
      .eq('user_id', session.user.id)
      .maybeSingle();

    // If no settings exist or error is not permission related
    if (!data && (!error || error.code === 'PGRST116')) {
      // Create default settings
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert({
          user_id: session.user.id,
          ...defaultSettings
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create settings: ${insertError.message}`);
      }

      return newSettings;
    }

    // If there was a permission error
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchSettings:', error);
    throw error;
  }
}

export const updateSettings = async (settings: Partial<Settings>): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase
      .from('settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Update settings error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
};

export async function uploadLogo(file: File): Promise<string | null> {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      throw new Error('Authentication required');
    }

    // Create user folder if it doesn't exist
    const userFolder = session.user.id;
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase()}`;
    const filePath = `${userFolder}/${cleanFileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('business-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      if (uploadError.message.includes('storage/bucket-not-found')) {
        throw new Error('Storage bucket not configured');
      }
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl }, error: urlError } = await supabase.storage
      .from('business-logos')
      .getPublicUrl(filePath);

    if (urlError || !publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // Update only the business_logo field
    const { error: updateError } = await supabase
      .from('settings')
      .update({ business_logo: publicUrl })
      .eq('user_id', session.user.id);

    if (updateError) {
      throw new Error(`Failed to update logo: ${updateError.message}`);
    }

    return publicUrl;
  } catch (error) {
    console.error('Logo upload error:', error);
    throw error;
  }
} 