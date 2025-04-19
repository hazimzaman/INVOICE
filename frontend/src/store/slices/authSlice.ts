import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
};

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name, phone, company_name }: {
    email: string;
    password: string;
    name: string;
    phone: string;
    company_name: string;
  }) => {
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) throw authError;
    if (!data.user) throw new Error('Signup failed');

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: data.user.id,
          name,
          email,
          phone,
          company_name,
        }
      ]);

    if (profileError) throw profileError;
    return data.user;
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
});

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to sign in';
      });

    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to sign up';
      });

    // Sign Out
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
      });

    // Check Auth
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      });

    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch profile';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 