import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { Settings } from '@/types/settings';
import { fetchInvoices } from './invoicesSlice';

interface SettingsState {
  data: Settings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  error: null
};

// Fetch settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('No authenticated user');
    }

    // First try to get existing settings
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', session.session.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw fetchError;
    }

    if (existingSettings) {
      return existingSettings;
    }

    // If no settings exist, create default settings
    const defaultSettings: Partial<Settings> = {
      user_id: session.session.user.id,
      business_name: '',
      business_logo: '',
      business_address: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      wise_email: '',
      invoice_prefix: 'INV-',
      footer_note: '',
      current_invoice_num: 1,
      email_template: '',
      email_subject: '',
      email_signature: ''
    };

    const { data: newSettings, error: insertError } = await supabase
      .from('settings')
      .insert([defaultSettings])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return newSettings;
  }
);

// Update settings
export const updateSettings = createAsyncThunk(
  'settings/update',
  async (settings: Partial<Settings>, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update settings');
    }
  }
);

// Update the existing updateSettingsAndInvoices thunk
export const updateSettingsAndInvoices = createAsyncThunk(
  'settings/updateSettingsAndInvoices',
  async (settingsData: Partial<Settings>, { dispatch, rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      // First update settings
      const { data: updatedSettings, error: updateError } = await supabase
        .from('settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // If invoice prefix is being changed
      if (settingsData.invoice_prefix) {
        // Get all invoices
        const { data: invoices, error: fetchError } = await supabase
          .from('invoices')
          .select('id, invoice_number')
          .eq('user_id', session.user.id);

        if (fetchError) throw fetchError;

        // Process each invoice
        for (const invoice of invoices || []) {
          // Extract the numeric part from the invoice number
          const numericPart = invoice.invoice_number.match(/\d+/)?.[0] || '';
          if (numericPart) {
            const newInvoiceNumber = `${settingsData.invoice_prefix}${numericPart}`;
            
            // Update invoice number
            const { error: invoiceError } = await supabase
              .from('invoices')
              .update({ invoice_number: newInvoiceNumber })
              .eq('id', invoice.id);

            if (invoiceError) throw invoiceError;
          }
        }

        // Refresh invoices to show updated numbers
        await dispatch(fetchInvoices());
      }

      return updatedSettings;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update settings and invoices
      .addCase(updateSettingsAndInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettingsAndInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateSettingsAndInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer; 