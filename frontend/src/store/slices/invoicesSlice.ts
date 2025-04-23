import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { Invoice } from '@/types/invoice';
import { checkAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  loading: false,
  error: null
};

// Fetch all invoices for the current user
export const fetchInvoices = createAsyncThunk(
  'invoices/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      // First get the user's settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
      }

      // Then fetch invoices with client data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw new Error(invoicesError.message);

      // Combine settings with each invoice
      const invoicesWithSettings = invoices?.map(invoice => ({
        ...invoice,
        settings: settings || null
      }));

      return invoicesWithSettings;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Also update single invoice fetch if you have one
export const fetchInvoice = createAsyncThunk(
  'invoices/fetchOne',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*),
          settings:settings(*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw new Error(error.message);
      return invoice;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new invoice
export const addInvoice = createAsyncThunk(
  'invoices/add',
  async (invoiceData: Omit<Invoice, 'id' | 'user_id'>, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      // First create the invoice without items
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          client_id: invoiceData.client_id,
          invoice_number: invoiceData.invoice_number,
          date: invoiceData.date,
          due_date: invoiceData.due_date,
          status: invoiceData.status,
          subtotal: invoiceData.subtotal,
          total: invoiceData.total,
          notes: invoiceData.notes,
          user_id: session.user.id
        })
        .select('*')
        .single();

      if (invoiceError || !invoice) {
        throw new Error(invoiceError?.message || 'Failed to create invoice');
      }

      // Then create invoice items
      if (invoiceData.items?.length) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            invoiceData.items.map(item => ({
              invoice_id: invoice.id,
              name: item.name,
              description: item.description,
              amount: item.amount
            }))
          );

        if (itemsError) {
          // If items creation fails, delete the invoice
          await supabase.from('invoices').delete().eq('id', invoice.id);
          throw new Error(itemsError.message);
        }
      }

      // Fetch the client details
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', invoice.client_id)
        .single();

      toast.success('Invoice created successfully');
      
      return {
        ...invoice,
        client,
        items: invoiceData.items || []
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoice');
      return rejectWithValue(error.message || 'Failed to create invoice');
    }
  }
);

// Delete invoice
export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting invoice:', error);
        return rejectWithValue(error.message);
      }

      return invoiceId;
    } catch (error: any) {
      console.error('Delete invoice error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Update invoice
export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ 
    id, 
    data 
  }: { 
    id: string; 
    data: Partial<Omit<Invoice, 'id' | 'user_id'>> 
  }, { rejectWithValue }) => {
    try {
      const session = await checkAuth();
      
      if (!session?.user?.id) {
        return rejectWithValue('Authentication required');
      }

      // Update invoice
      const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          ...data,
          items: undefined // Remove items from invoice update
        })
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (invoiceError || !updatedInvoice) {
        console.error('Error updating invoice:', invoiceError);
        return rejectWithValue(invoiceError?.message || 'Failed to update invoice');
      }

      // Update items if provided
      if (data.items) {
        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);

        // Insert new items
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            data.items.map(item => ({
              invoice_id: id,
              name: item.name,
              description: item.description,
              amount: item.amount
            }))
          );

        if (itemsError) {
          console.error('Error updating invoice items:', itemsError);
          return rejectWithValue(itemsError.message);
        }
      }

      return {
        ...updatedInvoice,
        items: data.items || []
      };
    } catch (error: any) {
      console.error('Update invoice error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Failed to fetch invoices');
      })
      // Add invoice
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
      })
      // Delete invoice
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
      })
      // Update invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      });
  }
});

export default invoicesSlice.reducer; 