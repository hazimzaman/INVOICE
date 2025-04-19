import { Middleware } from '@reduxjs/toolkit';

export const localStorageMiddleware: Middleware = store => next => action => {
  const result = next(action);
  
  // Don't save if we're clearing the state
  if (action.type === 'auth/clearState') {
    return result;
  }

  const state = store.getState();
  
  // Only save if we have data to save
  if (state.clients?.clients?.length || 
      state.invoices?.invoices?.length || 
      state.settings) {
    
    const stateToSave = {
      clients: state.clients,
      invoices: state.invoices,
      settings: state.settings
    };
    
    console.log('Saving state to localStorage:', stateToSave); // Debug log
    localStorage.setItem('appState', JSON.stringify(stateToSave));
  }
  
  return result;
}; 