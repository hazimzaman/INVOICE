import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, checkAuth } from '@/lib/supabase';
import type { Settings } from '@/types/settings';

interface SettingsState {
  data: Settings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  error: null,
};

// Fetch settings
export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        // If no settings found, create default settings
        if (error.code === 'PGRST116') {
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
            current_invoice_number: 1,
            email_template: '',
            email_subject: '',
            email_signature: '',
            cc_email: '',
            bcc_email: ''
          };

          const { data: newSettings, error: createError } = await supabase
            .from('settings')
            .insert([defaultSettings])
            .select()
            .single();

          if (createError) throw new Error(createError.message);
          return newSettings;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update settings with better error handling
export const updateSettings = createAsyncThunk(
  'settings/update',
  async (settings: Partial<Settings>, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      const { data, error } = await supabase
        .from('settings')
        .update(settings)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Update settings error:', error);
        return rejectWithValue(error.message || 'Failed to update settings');
      }

      return data;
    } catch (error: any) {
      console.error('Settings update error:', error);
      return rejectWithValue(error?.message || 'An error occurred while updating settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch settings
    builder
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
        state.error = action.error.message ?? 'Failed to fetch settings';
      });

    // Update settings
    builder
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
        state.error = action.error.message ?? 'Failed to update settings';
      });
  },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer; 