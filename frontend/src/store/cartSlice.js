// Cart slice for shopping cart management
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';

// Async thunks for cart API operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      console.log('Adding to cart:', { productId, quantity });
      const response = await axios.post('/cart/add', { productId, quantity });
      console.log('Cart API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Cart API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItemAsync',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/cart/update', { productId, quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/cart/remove/${productId}`);
      return { productId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete('/cart/clear');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const fetchCartSummary = createAsyncThunk(
  'cart/fetchCartSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/cart/summary');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart summary');
    }
  }
);

// Initial state for cart
const initialState = {
  items: [],
  cartId: null,
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null,
  isOpen: false, // For cart sidebar
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error message
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },
    
    // Toggle cart sidebar
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    // Open cart sidebar
    openCart: (state) => {
      state.isOpen = true;
    },
    
    // Close cart sidebar
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cartData = action.payload.data || action.payload.cart || {};
        // Only filter out items with completely null productId
        const validItems = (cartData.items || []).filter(item => {
          // Only filter if productId is completely null/undefined
          return item && item.productId != null;
        });
        state.items = validItems;
        state.cartId = cartData._id;
        state.totalItems = cartData.totalItems || 0;
        state.totalAmount = cartData.totalAmount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const cartData = action.payload.data || action.payload.cart || {};
        // Only filter out items with completely null productId
        const validItems = (cartData.items || []).filter(item => {
          // Only filter if productId is completely null/undefined
          return item && item.productId != null;
        });
        state.items = validItems;
        state.cartId = cartData._id;
        state.totalItems = cartData.totalItems || 0;
        state.totalAmount = cartData.totalAmount || 0;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const cartData = action.payload.data || action.payload.cart || {};
        // Only filter out items with completely null productId
        const validItems = (cartData.items || []).filter(item => {
          // Only filter if productId is completely null/undefined
          return item && item.productId != null;
        });
        state.items = validItems;
        state.totalItems = cartData.totalItems || 0;
        state.totalAmount = cartData.totalAmount || 0;
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const cartData = action.payload.data || action.payload.cart || {};
        // Only filter out items with completely null productId
        const validItems = (cartData.items || []).filter(item => {
          // Only filter if productId is completely null/undefined
          return item && item.productId != null;
        });
        state.items = validItems;
        state.totalItems = cartData.totalItems || 0;
        state.totalAmount = cartData.totalAmount || 0;
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.cartId = null;
        state.totalItems = 0;
        state.totalAmount = 0;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch cart summary
      .addCase(fetchCartSummary.fulfilled, (state, action) => {
        state.totalItems = action.payload.totalItems || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;
export const selectCartOpen = (state) => state.cart.isOpen;

// Helper selectors
export const selectCartItemById = (state, productId) =>
  state.cart.items.find(item => item.productId === productId);

export const selectCartItemsCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

// Export reducer
export default cartSlice.reducer;
