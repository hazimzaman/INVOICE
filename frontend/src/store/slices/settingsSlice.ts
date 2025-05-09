import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { Settings } from '@/types/settings';

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
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      // First try to get existing settings
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no settings exist, create default settings
      if (!data) {
        const defaultSettings = {
          user_id: session.user.id,
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
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return newSettings;
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
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
        state.error = action.payload as string;
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
      });
  }
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer; 