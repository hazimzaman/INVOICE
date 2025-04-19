import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  total: number;
}

interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  loading: false,
  error: null,
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload);
    },
    removeInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
  },
});

export const { addInvoice, removeInvoice, updateInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer; 