import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from './features/clientsSlice';
import invoicesReducer from './features/invoicesSlice';
import settingsReducer from './features/settingsSlice';
import notificationReducer from './features/notificationSlice';

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    invoices: invoicesReducer,
    settings: settingsReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 