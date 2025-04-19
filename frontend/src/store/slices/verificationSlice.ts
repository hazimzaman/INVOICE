import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PendingUser {
  name: string;
  email: string;
  password: string;
  verificationToken: string;
}

interface VerificationState {
  pendingUser: PendingUser | null;
}

const initialState: VerificationState = {
  pendingUser: null,
};

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    setPendingUser: (state, action: PayloadAction<PendingUser>) => {
      state.pendingUser = action.payload;
      // Store in localStorage
      localStorage.setItem('pendingUser', JSON.stringify(action.payload));
    },
    clearPendingUser: (state) => {
      state.pendingUser = null;
      localStorage.removeItem('pendingUser');
    },
  },
});

export const { setPendingUser, clearPendingUser } = verificationSlice.actions;
export default verificationSlice.reducer; 