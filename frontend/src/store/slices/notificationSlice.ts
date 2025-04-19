import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | null;
  isVisible: boolean;
}

const initialState: NotificationState = {
  message: null,
  type: null,
  isVisible: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.isVisible = true;
    },
    hideNotification: (state) => {
      state.message = null;
      state.type = null;
      state.isVisible = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 