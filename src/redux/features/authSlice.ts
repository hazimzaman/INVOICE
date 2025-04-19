import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
  },
  reducers: {
    clearState: (state) => {
      localStorage.removeItem('appState');
      console.log('Clearing state'); // Debug log
      return { isAuthenticated: false };
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    }
  },
});

export const { clearState, setAuthenticated } = authSlice.actions;
export default authSlice.reducer; 