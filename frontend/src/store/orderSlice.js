// Order slice for order management
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';

// Async thunks
export const createOrderAsync = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/orders/create', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchUserOrdersAsync = createAsyncThunk(
  'orders/fetchUserOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/orders/user', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderByIdAsync = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const cancelOrderAsync = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

// Initial state for orders
const initialState = {
  orders: [],
  currentOrder: null,
  orderHistory: [],
  isLoading: false,
  error: null,
  checkoutStep: 'cart', // cart, shipping, payment, confirmation
  orderStatuses: [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ],
};

// Order slice
const orderSlice = createSlice({
  name: 'orders',
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
    
    // Set all orders
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Set current order (for order details page)
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    
    // Set order history
    setOrderHistory: (state, action) => {
      state.orderHistory = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Add new order
    addOrder: (state, action) => {
      const newOrder = action.payload;
      state.orders.unshift(newOrder);
      state.orderHistory.unshift(newOrder);
      state.isLoading = false;
      state.error = null;
    },
    
    // Update order status
    updateOrderStatus: (state, action) => {
      const { orderId, status, statusHistory } = action.payload;
      
      // Update in orders array with null checks
      const orderIndex = state.orders.findIndex(order => order && order._id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
        if (statusHistory) {
          state.orders[orderIndex].statusHistory = statusHistory;
        }
      }
      
      // Update in order history with null checks
      const historyIndex = state.orderHistory.findIndex(order => order && order._id === orderId);
      if (historyIndex !== -1) {
        state.orderHistory[historyIndex].status = status;
        if (statusHistory) {
          state.orderHistory[historyIndex].statusHistory = statusHistory;
        }
      }
      
      // Update current order if it's the same
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.status = status;
        if (statusHistory) {
          state.currentOrder.statusHistory = statusHistory;
        }
      }
      
      state.isLoading = false;
      state.error = null;
    },
    
    // Cancel order
    cancelOrder: (state, action) => {
      const orderId = action.payload;
      
      // Update order status to cancelled
      const updateOrderToCancel = (order) => {
        if (order && order._id === orderId) {
          order.status = 'cancelled';
          order.statusHistory = order.statusHistory || [];
          order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date().toISOString(),
            note: 'Order cancelled by user'
          });
        }
      };
      
      state.orders.filter(order => order).forEach(updateOrderToCancel);
      state.orderHistory.filter(order => order).forEach(updateOrderToCancel);
      
      if (state.currentOrder && state.currentOrder._id === orderId) {
        updateOrderToCancel(state.currentOrder);
      }
      
      state.isLoading = false;
      state.error = null;
    },
    
    // Set checkout step
    setCheckoutStep: (state, action) => {
      state.checkoutStep = action.payload;
    },
    
    // Next checkout step
    nextCheckoutStep: (state) => {
      const steps = ['cart', 'shipping', 'payment', 'confirmation'];
      const currentIndex = steps.indexOf(state.checkoutStep);
      if (currentIndex < steps.length - 1) {
        state.checkoutStep = steps[currentIndex + 1];
      }
    },
    
    // Previous checkout step
    prevCheckoutStep: (state) => {
      const steps = ['cart', 'shipping', 'payment', 'confirmation'];
      const currentIndex = steps.indexOf(state.checkoutStep);
      if (currentIndex > 0) {
        state.checkoutStep = steps[currentIndex - 1];
      }
    },
    
    // Reset checkout
    resetCheckout: (state) => {
      state.checkoutStep = 'cart';
    },
    
    // Clear all order data (on logout)
    clearOrderData: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.orderHistory = [];
      state.checkoutStep = 'cart';
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrderAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.isLoading = false;
  const newOrder = action.payload.data;
        state.orders.unshift(newOrder);
        state.orderHistory.unshift(newOrder);
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch User Orders
      .addCase(fetchUserOrdersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrdersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const orders = action.payload.data?.orders || [];
        // Filter out any undefined/null values to prevent future errors
        state.orderHistory = orders.filter(order => order && order._id);
        state.orders = orders.filter(order => order && order._id);
      })
      .addCase(fetchUserOrdersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Order By ID
      .addCase(fetchOrderByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchOrderByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel Order
      .addCase(cancelOrderAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrderAsync.fulfilled, (state, action) => {
        state.isLoading = false;
  const updatedOrder = action.payload?.data;
        
        if (!updatedOrder || !updatedOrder._id) {
          return;
        }
        
        // Update in orders array with null checks
        const orderIndex = state.orders.findIndex(order => order && order._id === updatedOrder._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Update in order history with null checks
        const historyIndex = state.orderHistory.findIndex(order => order && order._id === updatedOrder._id);
        if (historyIndex !== -1) {
          state.orderHistory[historyIndex] = updatedOrder;
        }
        
        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(cancelOrderAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setOrders,
  setCurrentOrder,
  clearCurrentOrder,
  setOrderHistory,
  addOrder,
  updateOrderStatus,
  cancelOrder,
  setCheckoutStep,
  nextCheckoutStep,
  prevCheckoutStep,
  resetCheckout,
  clearOrderData,
} = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderHistory = (state) => state.orders.orderHistory;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrderLoading = (state) => state.orders.isLoading; // Alias for consistency
export const selectOrdersError = (state) => state.orders.error;
export const selectCheckoutStep = (state) => state.orders.checkoutStep;
export const selectOrderStatuses = (state) => state.orders.orderStatuses;

// Helper selectors
export const selectOrderById = (state, orderId) =>
  state.orders.orders.find(order => order._id === orderId) ||
  state.orders.orderHistory.find(order => order._id === orderId);

export const selectOrdersByStatus = (state, status) =>
  state.orders.orders.filter(order => order.status === status);

export const selectRecentOrders = (state, limit = 5) =>
  state.orders.orderHistory.slice(0, limit);

// Export reducer
export default orderSlice.reducer;
