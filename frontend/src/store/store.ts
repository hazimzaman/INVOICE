import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import verificationReducer from './slices/verificationSlice';
import clientsReducer from './slices/clientsSlice';
import settingsReducer from './slices/settingsSlice';
import invoicesReducer from './slices/invoicesSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    verification: verificationReducer,
    clients: clientsReducer,
    settings: settingsReducer,
    invoices: invoicesReducer,
    notification: notificationReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 