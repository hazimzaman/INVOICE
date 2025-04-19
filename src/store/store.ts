import { configureStore } from '@reduxjs/toolkit';
import { localStorageMiddleware } from './middleware/localStorageMiddleware';
import { loadState } from './utils/loadState';
import {
  authReducer,
  verificationReducer,
  clientsReducer,
  invoicesReducer,
  settingsReducer,
  notificationReducer
} from './slices';

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    verification: verificationReducer,
    clients: clientsReducer,
    invoices: invoicesReducer,
    settings: settingsReducer,
    notification: notificationReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;