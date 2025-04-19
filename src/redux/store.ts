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
} from './features';

const preloadedState = loadState();
console.log('Loading initial state:', preloadedState); // Debug log

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

// Debug: Log state changes
store.subscribe(() => {
  console.log('Current state:', store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 