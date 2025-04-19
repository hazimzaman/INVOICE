export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('appState');
    
    if (!serializedState) {
      return undefined;
    }
    
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
}; 