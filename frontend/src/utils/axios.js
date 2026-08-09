// Axios configuration for API calls
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token && token !== 'null' && token !== 'undefined') {
      // Validate token format (basic JWT structure check)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Invalid token format, remove it
        localStorage.removeItem('token');
        console.warn('Invalid token format detected and removed');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error responses
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          try {
            const message = data?.message || 'Your session has expired. Please sign in again.';
            sessionStorage.setItem('authNotice', JSON.stringify({ type: 'expired', message }));
          } catch (_) {
            // no-op
          }
          localStorage.removeItem('token');
          // Only redirect if not already on login/register pages
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register') &&
              !window.location.pathname.includes('/forgot-password') &&
              !window.location.pathname.includes('/reset-password')) {
            window.location.href = '/login?expired=1';
          }
          break;
          
        case 403:
          // Forbidden - typically means user is disabled or lacks permission
          // Force logout across devices: clear token and redirect to login with a notice
          try {
            const message = data?.message || 'Your account has been disabled by an administrator.';
            sessionStorage.setItem('authNotice', JSON.stringify({ type: 'blocked', message }));
          } catch (_) {
            // no-op if sessionStorage unavailable
          }
          localStorage.removeItem('token');
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register') &&
              !window.location.pathname.includes('/forgot-password') &&
              !window.location.pathname.includes('/reset-password')) {
            window.location.href = '/login?blocked=1';
          }
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
          
        default:
          console.error('API Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods for different endpoints

// Authentication APIs
export const authAPI = {
  // User registration
  register: (userData) => api.post('/auth/register', userData),
  
  // User login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Verify email
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  
  // Request password reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Logout (if server-side logout is needed)
  logout: () => api.post('/auth/logout'),
};

// Product APIs
export const productAPI = {
  // Get all products with filters
  getProducts: (params = {}) => api.get('/products', { params }),
  
  // Get single product
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Search products
  searchProducts: (params = {}) => api.get('/products/search', { params }),
  
  // Advanced search
  advancedSearch: (params = {}) => api.get('/search/advanced', { params }),
  
  // Get search suggestions
  getSearchSuggestions: (query) => api.get('/search/suggestions', { params: { query } }),
  
  // Get filter options
  getFilterOptions: () => api.get('/search/filters'),
  
  // Get products by category
  getProductsByCategory: (category, params = {}) => api.get(`/products/category/${category}`, { params }),
  
  // Admin: Create product
  createProduct: (productData) => api.post('/products', productData),
  
  // Admin: Update product
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  
  // Admin: Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Reviews
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  upsertReview: (productId, rating, comment) => api.post(`/products/${productId}/reviews`, { rating, comment }),
  deleteMyReview: (productId) => api.delete(`/products/${productId}/reviews/me`),
};

// User Profile APIs
export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  
  // Get user addresses
  getAddresses: () => api.get('/users/addresses'),
  
  // Add new address
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  
  // Update address
  updateAddress: (id, addressData) => api.put(`/users/addresses/${id}`, addressData),
  
  // Delete address
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  
  // Set default address
  setDefaultAddress: (id) => api.put(`/users/addresses/${id}/default`),
  
  // Update preferences
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  
  // Change password
  changePassword: (currentPassword, newPassword) => api.put('/users/change-password', { currentPassword, newPassword }),

  // Wishlist
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post('/users/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/remove/${productId}`),
};

// Cart APIs
export const cartAPI = {
  // Get user cart
  getCart: () => api.get('/cart'),
  
  // Add item to cart
  addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  
  // Update item quantity
  updateCartItem: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  
  // Remove item from cart
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  
  // Clear entire cart
  clearCart: () => api.delete('/cart/clear'),
  
  // Get cart summary
  getCartSummary: () => api.get('/cart/summary'),
};

// Order APIs
export const orderAPI = {
  // Create new order
  createOrder: (orderData) => api.post('/orders/create', orderData),
  
  // Get user orders
  getUserOrders: (params = {}) => api.get('/orders/user', { params }),
  
  // Get single order
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Cancel order
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  
  // Admin: Get all orders
  getAllOrders: (params = {}) => api.get('/orders', { params }),
  
  // Admin: Update order status
  updateOrderStatus: (id, status, note) => api.put(`/orders/admin/${id}/status`, { status, note }),
  
  // Admin: Get order statistics
  getOrderStats: () => api.get('/orders/admin/stats'),
};

// File Upload APIs
export const uploadAPI = {
  // Admin: Upload product images (returns filenames and URLs)
  uploadProductImages: (formData) => api.post('/upload/products/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Admin: Update specific product images
  updateProductImages: (productId, formData) => api.put(`/upload/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Admin: Delete a product image by filename
  deleteProductImage: (filename) => api.delete(`/upload/products/images/${filename}`),
};

// Export the main api instance for custom requests
export default api;
