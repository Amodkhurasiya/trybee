// Redux store configuration for Trybee E-commerce Platform
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import productSlice from './productSlice';
import cartSlice from './cartSlice';
import userSlice from './userSlice';
import orderSlice from './orderSlice';
import toastSlice from './toastSlice';
import adminSlice from './adminSlice';

// Configure the Redux store with all slices
export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    cart: cartSlice,
    user: userSlice,
    orders: orderSlice,
    toast: toastSlice,
    admin: adminSlice,
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
  // Configure middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
