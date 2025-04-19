export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('appState');
    console.log('Loaded from localStorage:', serializedState); // Debug log
    
    if (!serializedState) {
      return {
        clients: { clients: [] },
        invoices: { invoices: [] },
        settings: {
          business: {},
          contact: {},
          invoice: {},
          email: {}
        }
      };
    }
    
    const parsedState = JSON.parse(serializedState);
    
    // Ensure we have all required state properties
    return {
      clients: parsedState.clients || { clients: [] },
      invoices: parsedState.invoices || { invoices: [] },
      settings: parsedState.settings || {
        business: {},
        contact: {},
        invoice: {},
        email: {}
      }
    };
  } catch (err) {
    console.error('Error loading state:', err);
    return {
      clients: { clients: [] },
      invoices: { invoices: [] },
      settings: {
        business: {},
        contact: {},
        invoice: {},
        email: {}
      }
    };
  }
}; 