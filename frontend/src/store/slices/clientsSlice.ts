import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, checkAuth } from '@/lib/supabase';
import { Client } from '@/types/client';
import { toast } from 'react-hot-toast';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
};

// Add auth header to requests
const getAuthHeader = async () => {
  const session = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session.data.session?.access_token}`
  };
};

// Fetch all clients
export const fetchClients = createAsyncThunk(
  'clients/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id,
          user_id,
          name,
          email,
          phone,
          address,
          company,
          currency,
          created_at,
          updated_at
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return rejectWithValue(error.message);
      }

      // Ensure currency has a default value if not set
      const clientsWithDefaults = (clients || []).map(client => ({
        ...client,
        currency: client.currency || 'USD'
      }));

      return clientsWithDefaults;

    } catch (error: any) {
      console.error('Fetch clients error:', error);
      return rejectWithValue(error.message || 'Failed to fetch clients');
    }
  }
);

// Add new client
export const addClient = createAsyncThunk(
  'clients/add',
  async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      const now = new Date().toISOString();
      
      const { data: client, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          user_id: session.user.id,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (error) {
        console.error('Add client error:', error);
        return rejectWithValue(error.message);
      }

      toast.success('Client added successfully');
      return client;
    } catch (error: any) {
      console.error('Add client error:', error);
      return rejectWithValue(error.message || 'Failed to add client');
    }
  }
);

// Update client
export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ clientId, updates }: { clientId: string; updates: Partial<Client> }) => {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

// Delete client
export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (clientId: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) throw error;
    return clientId;
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch clients
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add client
    builder
      .addCase(addClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.unshift(action.payload);
      })
      .addCase(addClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to add client';
      });

    // Update client
    builder
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
      });

    // Delete client
    builder
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(client => client.id !== action.payload);
      });
  },
});

export const { clearError } = clientsSlice.actions;
export default clientsSlice.reducer; 