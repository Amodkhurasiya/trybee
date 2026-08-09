// User slice for user profile and address management
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';

// Async thunks for wishlist
export const addToWishlist = createAsyncThunk(
  'user/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
  // Backend route is /api/users/wishlist/add
  const response = await axios.post('/users/wishlist/add', { productId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'user/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
  // Backend route is /api/users/wishlist/remove/:productId
  const response = await axios.delete(`/users/wishlist/remove/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  'user/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
  // Backend route is /api/users/wishlist
  const response = await axios.get('/users/wishlist');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// Initial state for user profile
const initialState = {
  profile: null,
  addresses: [],
  defaultAddressId: null,
  wishlist: [],
  preferences: {
    theme: 'light',
    notifications: true,
    newsletter: false,
  },
  isLoading: false,
  error: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
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
    
    // Set user profile
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Update user profile
    updateProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
      state.isLoading = false;
      state.error = null;
    },
    
    // Set user addresses
    setAddresses: (state, action) => {
      state.addresses = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Add new address
    addAddress: (state, action) => {
      const newAddress = action.payload;
      state.addresses.push(newAddress);
      
      // Set as default if it's the first address or marked as default
      if (state.addresses.length === 1 || newAddress.isDefault) {
        state.defaultAddressId = newAddress._id;
        // Update other addresses to not be default
        state.addresses.forEach(addr => {
          if (addr._id !== newAddress._id) {
            addr.isDefault = false;
          }
        });
      }
      
      state.isLoading = false;
      state.error = null;
    },
    
    // Update existing address
    updateAddress: (state, action) => {
      const updatedAddress = action.payload;
      const index = state.addresses.findIndex(addr => addr._id === updatedAddress._id);
      
      if (index !== -1) {
        state.addresses[index] = updatedAddress;
        
        // Update default address if needed
        if (updatedAddress.isDefault) {
          state.defaultAddressId = updatedAddress._id;
          // Update other addresses to not be default
          state.addresses.forEach(addr => {
            if (addr._id !== updatedAddress._id) {
              addr.isDefault = false;
            }
          });
        }
      }
      
      state.isLoading = false;
      state.error = null;
    },
    
    // Remove address
    removeAddress: (state, action) => {
      const addressId = action.payload;
      const addressIndex = state.addresses.findIndex(addr => addr._id === addressId);
      
      if (addressIndex !== -1) {
        const wasDefault = state.addresses[addressIndex].isDefault;
        state.addresses.splice(addressIndex, 1);
        
        // If removed address was default, set first remaining address as default
        if (wasDefault && state.addresses.length > 0) {
          state.addresses[0].isDefault = true;
          state.defaultAddressId = state.addresses[0]._id;
        } else if (state.addresses.length === 0) {
          state.defaultAddressId = null;
        }
      }
      
      state.isLoading = false;
      state.error = null;
    },
    
    // Set default address
    setDefaultAddress: (state, action) => {
      const addressId = action.payload;
      
      // Update all addresses
      state.addresses.forEach(addr => {
        addr.isDefault = addr._id === addressId;
      });
      
      state.defaultAddressId = addressId;
      state.isLoading = false;
      state.error = null;
    },
    
    // Update user preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.isLoading = false;
      state.error = null;
    },

    // Set wishlist
    setWishlist: (state, action) => {
      state.wishlist = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // Add item to wishlist (local)
    addWishlistItem: (state, action) => {
      const product = action.payload;
      const exists = state.wishlist.find(item => item._id === product._id);
      if (!exists) {
        state.wishlist.push(product);
      }
    },

    // Remove item from wishlist (local)
    removeWishlistItem: (state, action) => {
      const productId = action.payload;
      state.wishlist = state.wishlist.filter(item => item._id !== productId);
    },

    // Clear wishlist
    clearWishlist: (state) => {
      state.wishlist = [];
    },
    
    // Clear all user data (on logout)
    clearUserData: (state) => {
      state.profile = null;
      state.addresses = [];
      state.defaultAddressId = null;
      state.wishlist = [];
      state.preferences = {
        theme: 'light',
        notifications: true,
        newsletter: false,
      };
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.wishlist = action.payload.wishlist || state.wishlist;
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.wishlist = action.payload.wishlist || state.wishlist;
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.wishlist = action.payload.wishlist || [];
        }
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setProfile,
  updateProfile,
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  updatePreferences,
  setWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
  clearUserData,
} = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserAddresses = (state) => state.user.addresses;
export const selectDefaultAddress = (state) => 
  state.user.addresses.find(addr => addr._id === state.user.defaultAddressId);
export const selectUserPreferences = (state) => state.user.preferences;
export const selectWishlist = (state) => state.user.wishlist;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;

// Helper selectors
export const selectAddressById = (state, addressId) =>
  state.user.addresses.find(addr => addr._id === addressId);

// Export reducer
export default userSlice.reducer;
