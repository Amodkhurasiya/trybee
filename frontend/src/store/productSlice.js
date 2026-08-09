// Product slice for product data management
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';

// Async thunks
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/products/featured');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/search/advanced', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchFilterOptions = createAsyncThunk(
  'products/fetchFilterOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/search/filters');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch filter options');
    }
  }
);

// Initial state for products
const initialState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  searchResults: [],
  categories: [],
  filters: {
    categories: [],
    priceRange: { min: 0, max: 1000 },
    tags: [],
    sortOptions: [],
  },
  searchQuery: '',
  activeFilters: {
    category: '',
    minPrice: '',
    maxPrice: '',
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  error: null,
};

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Set loading state manually
    setProductsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error state manually
    setProductsError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },
    
    // Set all products
    setProducts: (state, action) => {
      state.products = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Set featured products
    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
    },
    
    // Set current product (for product detail page)
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    
    // Set search results
    setSearchResults: (state, action) => {
      const { products, pagination, searchQuery, filters } = action.payload;
      state.searchResults = products;
      state.pagination = pagination;
      state.searchQuery = searchQuery || '';
      state.isLoading = false;
      state.error = null;
      
      // Update available filters if provided
      if (filters) {
        state.filters = { ...state.filters, ...filters };
      }
    },
    
    // Set available categories
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    
    // Set filter options
    setFilterOptions: (state, action) => {
      state.filters = action.payload;
    },
    
    // Update search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    
    // Update active filters
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    
    // Clear all filters
    clearFilters: (state) => {
      state.activeFilters = {
        category: '',
        minPrice: '',
        maxPrice: '',
        tags: [],
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      state.searchQuery = '';
    },
    
    // Update pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Add product to products list (for admin)
    addProduct: (state, action) => {
      state.products.unshift(action.payload);
    },
    
    // Update product in products list (for admin)
    updateProduct: (state, action) => {
      const updatedProduct = action.payload;
      const index = state.products.findIndex(product => product._id === updatedProduct._id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
      
      // Update current product if it's the same
      if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
        state.currentProduct = updatedProduct;
      }
    },
    
    // Remove product from products list (for admin)
    removeProduct: (state, action) => {
      const productId = action.payload;
      state.products = state.products.filter(product => product._id !== productId);
      
      // Clear current product if it's the deleted one
      if (state.currentProduct && state.currentProduct._id === productId) {
        state.currentProduct = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload.products || action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories || action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          const { data } = action.payload;
          // Ensure all products have id field for consistency
          const products = (data.products || []).map(product => {
            if (product._id && !product.id) {
              product.id = product._id;
            }
            return product;
          });
          state.products = products;
          if (data.pagination) {
            state.pagination = data.pagination;
          }
          if (data.filters) {
            state.filters = { ...state.filters, ...data.filters };
          }
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          // Backend returns { success: true, data: { product } }
          const product = action.payload.data.product;
          // Ensure the product has an id field for consistency
          if (product._id && !product.id) {
            product.id = product._id;
          }
          state.currentProduct = product;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          const { data } = action.payload;
          state.searchResults = data.products || [];
          if (data.pagination) {
            state.pagination = data.pagination;
          }
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch filter options
      .addCase(fetchFilterOptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.filters = { ...state.filters, ...action.payload.data };
        }
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  setProductsLoading,
  setProductsError,
  clearError,
  setProducts,
  setFeaturedProducts,
  setCurrentProduct,
  clearCurrentProduct,
  setSearchResults,
  setCategories,
  setFilterOptions,
  setSearchQuery,
  clearSearchResults,
  setActiveFilters,
  clearFilters,
  setPagination,
  addProduct,
  updateProduct,
  removeProduct,
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectCategories = (state) => state.products.categories;
export const selectFilters = (state) => state.products.filters;
export const selectSearchQuery = (state) => state.products.searchQuery;
export const selectActiveFilters = (state) => state.products.activeFilters;
export const selectPagination = (state) => state.products.pagination;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductsError = (state) => state.products.error;

// Export reducer
export default productSlice.reducer;
