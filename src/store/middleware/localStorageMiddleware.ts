import { Middleware } from '@reduxjs/toolkit';

export const localStorageMiddleware: Middleware = store => next => action => {
  const result = next(action);
  
  // Don't save if we're clearing the state
  if (action.type === 'auth/clearState') {
    return result;
  }

  const state = store.getState();
  
  // Only save specific slices
  const stateToSave = {
    clients: state.clients,
    invoices: state.invoices,
    settings: state.settings
  };
  
  localStorage.setItem('appState', JSON.stringify(stateToSave));
  return result;
}; 