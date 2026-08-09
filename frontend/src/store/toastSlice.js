import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [], // Array of toast notifications
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const { id, message, type = 'info', duration = 3000 } = action.payload;
      state.toasts.push({
        id: id || Date.now() + Math.random(),
        message,
        type, // 'success', 'error', 'warning', 'info'
        duration,
        timestamp: Date.now(),
      });
    },
    
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;

// Selectors
export const selectToasts = (state) => state.toast?.toasts || [];

// Helper action creators
export const showSuccessToast = (message, duration = 3000) => 
  addToast({ message, type: 'success', duration });

export const showErrorToast = (message, duration = 4000) => 
  addToast({ message, type: 'error', duration });

export const showWarningToast = (message, duration = 3500) => 
  addToast({ message, type: 'warning', duration });

export const showInfoToast = (message, duration = 3000) => 
  addToast({ message, type: 'info', duration });

export default toastSlice.reducer;
