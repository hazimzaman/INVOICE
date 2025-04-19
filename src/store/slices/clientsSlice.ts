import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Client {
  id: string;
  name: string;
  company: string;
  currency: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created?: string;
}

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

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload);
    },
    removeClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(client => client.id !== action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(client => client.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
  },
});

export const { addClient, removeClient, updateClient } = clientsSlice.actions;
export default clientsSlice.reducer; 