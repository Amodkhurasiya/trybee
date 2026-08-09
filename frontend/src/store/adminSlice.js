import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';

// Admin API calls for dashboard statistics
export const fetchAdminStatsAsync = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin statistics');
    }
  }
);

// Fetch all users for admin management
export const fetchAllUsersAsync = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// Update user role or status
export const updateUserAsync = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/status`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

// Fetch all orders for admin management
export const fetchAllOrdersAsync = createAsyncThunk(
  'admin/fetchAllOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/orders/admin/all', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Update order status
export const updateOrderStatusAsync = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/orders/admin/${orderId}/status`, { status, adminNotes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Fetch all products for admin management
export const fetchAllProductsAsync = createAsyncThunk(
  'admin/fetchAllProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
  const response = await axios.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Delete product
export const deleteProductAsync = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/products/${productId}`);
      return { productId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// Create product
export const createProductAsync = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/products', productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

// Update product
export const updateProductAsync = createAsyncThunk(
  'admin/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

// Fetch all categories for admin management
export const fetchAllCategoriesAsync = createAsyncThunk(
  'admin/fetchAllCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/categories', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Add category
export const addCategoryAsync = createAsyncThunk(
  'admin/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add category');
    }
  }
);

// Update category
export const updateCategoryAsync = createAsyncThunk(
  'admin/updateCategory',
  async ({ categoryId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/categories/${categoryId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Delete category
export const deleteCategoryAsync = createAsyncThunk(
  'admin/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/categories/${categoryId}`);
      return { categoryId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Initial state for admin panel
const initialState = {
  // Dashboard statistics
  stats: {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    userGrowth: [],
    salesData: []
  },
  
  // Admin users management
  users: [],
  usersLoading: false,
  usersError: null,
  usersTotal: 0,
  
  // Admin orders management
  orders: [],
  ordersLoading: false,
  ordersError: null,
  ordersTotal: 0,
  
  // Admin products management
  products: [],
  productsLoading: false,
  productsError: null,
  
  // Admin categories management
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  productsTotal: 0,
  
  // General admin loading and error states
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 10,
  
  // Filters
  filters: {
    search: '',
    status: '',
    category: '',
    dateRange: ''
  }
};

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set current page
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    // Set items per page
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        category: '',
        dateRange: ''
      };
    },
    
    // Clear all admin data
    clearAdminData: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Admin Stats
      .addCase(fetchAdminStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchAdminStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch All Users
      .addCase(fetchAllUsersAsync.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAllUsersAsync.fulfilled, (state, action) => {
        state.usersLoading = false;
        const data = action.payload.data || {};
        state.users = data.users || data;
        state.usersTotal = data.pagination?.totalUsers || (state.users?.length || 0);
      })
      .addCase(fetchAllUsersAsync.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      
      // Update User
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const updatedUser = action.payload.data;
        const getId = (u) => u?._id || u?.id;
        const userIndex = state.users.findIndex(user => getId(user) === getId(updatedUser));
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser;
        }
      })
      
      // Fetch All Orders
      .addCase(fetchAllOrdersAsync.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchAllOrdersAsync.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.data.orders || action.payload.data;
        state.ordersTotal = action.payload.data.pagination?.totalOrders || (state.orders?.length || 0);
      })
      .addCase(fetchAllOrdersAsync.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      })
      
      // Update Order Status
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        const updatedOrder = action.payload.data;
        const orderIndex = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (orderIndex !== -1) {
          // Preserve populated user object if backend returns only an ID
          const prev = state.orders[orderIndex];
          const next = { ...updatedOrder };
          if (prev && prev.userId && (typeof updatedOrder.userId === 'string' || (updatedOrder.userId && !updatedOrder.userId.firstName))) {
            next.userId = prev.userId;
          }
          state.orders[orderIndex] = next;
        }
      })
      
      // Fetch All Products
      .addCase(fetchAllProductsAsync.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchAllProductsAsync.fulfilled, (state, action) => {
        state.productsLoading = false;
        const data = action.payload.data || {};
        state.products = data.products || action.payload.products || action.payload;
        if (data.pagination) {
          state.productsTotal = data.pagination.totalProducts || state.products.length;
        } else {
          state.productsTotal = state.products?.length || 0;
        }
      })
      .addCase(fetchAllProductsAsync.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload;
      })
      
      // Create Product
      .addCase(createProductAsync.fulfilled, (state, action) => {
        const created = action.payload?.data?.product || action.payload?.product || action.payload;
        if (created) {
          state.products.unshift(created);
          state.productsTotal += 1;
        }
      })
      
      // Update Product
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const updatedProduct = action.payload?.data?.product || action.payload?.product || action.payload;
        const getId = (p) => p?._id || p?.id;
        const productIndex = state.products.findIndex(product => getId(product) === getId(updatedProduct));
        if (productIndex !== -1) {
          state.products[productIndex] = updatedProduct;
        }
      })
      
      // Delete Product
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        const { productId } = action.payload;
        const getId = (p) => p?._id || p?.id;
        state.products = state.products.filter(product => getId(product) !== productId);
        state.productsTotal = Math.max(0, (state.productsTotal || 0) - 1);
      })
      
      // Fetch All Categories
      .addCase(fetchAllCategoriesAsync.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchAllCategoriesAsync.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.data || action.payload;
      })
      .addCase(fetchAllCategoriesAsync.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })
      
      // Add Category
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.categories.unshift(action.payload.data);
      })
      
      // Update Category
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const updatedCategory = action.payload.data;
        const categoryIndex = state.categories.findIndex(category => category._id === updatedCategory._id);
        if (categoryIndex !== -1) {
          state.categories[categoryIndex] = updatedCategory;
        }
      })
      
      // Delete Category
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        const { categoryId } = action.payload;
        state.categories = state.categories.filter(category => category._id !== categoryId);
      });
  }
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setCurrentPage,
  setItemsPerPage,
  updateFilters,
  clearFilters,
  clearAdminData
} = adminSlice.actions;

// Selectors
export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminUsers = (state) => state.admin.users;
export const selectUsersLoading = (state) => state.admin.usersLoading;
export const selectUsersError = (state) => state.admin.usersError;
export const selectUsersTotal = (state) => state.admin.usersTotal;

export const selectAdminOrders = (state) => state.admin.orders;
export const selectOrdersLoading = (state) => state.admin.ordersLoading;
export const selectOrdersError = (state) => state.admin.ordersError;
export const selectOrdersTotal = (state) => state.admin.ordersTotal;

export const selectAdminProducts = (state) => state.admin.products;
export const selectProductsLoading = (state) => state.admin.productsLoading;
export const selectProductsError = (state) => state.admin.productsError;
export const selectProductsTotal = (state) => state.admin.productsTotal;

export const selectAdminCategories = (state) => state.admin.categories;
export const selectCategoriesLoading = (state) => state.admin.categoriesLoading;
export const selectCategoriesError = (state) => state.admin.categoriesError;

export const selectAdminLoading = (state) => state.admin.isLoading;
export const selectAdminError = (state) => state.admin.error;
export const selectCurrentPage = (state) => state.admin.currentPage;
export const selectItemsPerPage = (state) => state.admin.itemsPerPage;
export const selectAdminFilters = (state) => state.admin.filters;

export default adminSlice.reducer;
