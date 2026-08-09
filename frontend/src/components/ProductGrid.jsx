import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import axios from '../utils/axios';

const ProductGrid = ({ products, viewMode = 'grid', user }) => {
  const [userOrderHistory, setUserOrderHistory] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user's order history for personalization
  useEffect(() => {
    if (user) {
      fetchUserOrderHistory();
      fetchRecommendedProducts();
    }
  }, [user]);

  const fetchUserOrderHistory = async () => {
    try {
      const response = await axios.get('/orders/user');
      if (response.data.success) {
        const orders = response.data?.data?.orders || [];
        setUserOrderHistory(orders);
      }
    } catch (error) {
      console.error('Error fetching user order history:', error);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      setLoading(true);
      // Try wishlist-based recommendations first
      let wishlist = [];
      try {
        const wres = await axios.get('/users/wishlist');
        if (wres.data?.success) wishlist = wres.data.wishlist || [];
      } catch {}

      let response;
      if (wishlist.length > 0) {
        // Pick top 1-2 categories from wishlist items
        const counts = wishlist.reduce((acc, p) => {
          if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {});
        const topCategories = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([cat]) => cat);

        // Fetch products filtered by these categories
        const resCat = await axios.get('/products', {
          params: {
            limit: 12,
            category: topCategories[0],
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }
        });
        response = resCat;
      } else {
        // Fallback: latest products
        response = await axios.get('/products', {
          params: {
            limit: 12,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }
        });
      }
      
      if (response.data.success) {
        const rec = (response.data?.data?.products || []).map(p => ({
          ...p,
          id: p.id || p._id,
        }));
        setRecommendedProducts(rec);
      }
    } catch (error) {
      console.error('Error fetching recommended products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get products user has purchased before
  const getPurchasedProductIds = () => {
    if (!userOrderHistory.length) return [];
    
    const purchasedIds = [];
    userOrderHistory.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (!item.productId) return;
          const pid = typeof item.productId === 'object' 
            ? (item.productId._id || item.productId.id)
            : item.productId;
          if (pid && !purchasedIds.includes(pid)) purchasedIds.push(pid);
        });
      }
    });
    return purchasedIds;
  };

  // Separate products based on user history
  const categorizeProducts = () => {
    if (!user || !userOrderHistory.length) {
      return { newProducts: products, repurchaseProducts: [] };
    }

    const purchasedIds = getPurchasedProductIds();
    const repurchaseProducts = products.filter(product => 
      purchasedIds.includes(product.id || product._id)
    );
    const newProducts = products.filter(product => 
      !purchasedIds.includes(product.id || product._id)
    );

    return { newProducts, repurchaseProducts };
  };

  const { newProducts, repurchaseProducts } = categorizeProducts();

  // Grid classes based on view mode
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'space-y-4';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Check back later for new products.
        </p>
      </div>
    );
  }

  return (
  <div className="space-y-8 font-gilroy">
      {/* Personalized Sections for Logged-in Users */}
      {user && repurchaseProducts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Buy Again</h2>
              <p className="text-sm text-gray-600">Products you've purchased before</p>
            </div>
            <div className="flex items-center text-sm text-[#ebb665]">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Previously Purchased
            </div>
          </div>
          
          <div className={getGridClasses()}>
      {repurchaseProducts.map((product) => (
              <ProductCard 
        key={`repurchase-${product.id || product._id}`}
                product={product} 
                viewMode={viewMode}
                userOrderHistory={userOrderHistory}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Products Section (for logged-in users) */}
      {user && recommendedProducts.length > 0 && newProducts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
              <p className="text-sm text-gray-600">Based on your preferences and purchase history</p>
            </div>
            <div className="flex items-center text-sm text-[#ebb665]">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Personalized
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {recommendedProducts.slice(0, 4).map((product) => (
              <ProductCard 
        key={`recommended-${product.id || product._id}`}
                product={product} 
                viewMode="grid"
                userOrderHistory={userOrderHistory}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Products Section */}
      <div>
        {user && (repurchaseProducts.length > 0 || recommendedProducts.length > 0) && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Discover New Products</h2>
              <p className="text-sm text-gray-600">Explore our latest collection</p>
            </div>
          </div>
        )}
        
        <div className={getGridClasses()}>
      {(user ? newProducts : products).map((product) => (
            <ProductCard 
        key={product.id || product._id}
              product={product} 
              viewMode={viewMode}
              userOrderHistory={userOrderHistory}
            />
          ))}
        </div>
      </div>

      {/* Empty State for New Products */}
      {user && newProducts.length === 0 && repurchaseProducts.length > 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">
            You've seen all the products matching your search. Check back later for new arrivals.
          </p>
        </div>
      )}

      {/* Purchase History Summary (for logged-in users) */}
      {user && userOrderHistory.length > 0 && (
        <div className="mt-8 rounded-lg p-4" style={{ backgroundColor: '#fff7e9' }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" style={{ color: '#ebb665' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#9a6c16' }}>
                Your Purchase History
              </p>
              <p className="text-xs" style={{ color: '#b17e1a' }}>
                You've made {userOrderHistory.length} order{userOrderHistory.length !== 1 ? 's' : ''} with us. 
                {repurchaseProducts.length > 0 && (
                  <span> {repurchaseProducts.length} item{repurchaseProducts.length !== 1 ? 's' : ''} shown above for easy reordering.</span>
                )}
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/orders'}
              className="text-xs font-medium" style={{ color: '#ebb665' }}
            >
              View All Orders
            </button>
          </div>
        </div>
      )}

      {/* Guest User Encouragement */}
      {!user && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">Get Personalized Recommendations</p>
                <p className="text-xs text-gray-600">Sign up to see products based on your preferences and purchase history</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/register'}
              className="px-4 py-2 text-sm font-medium text-white rounded-md"
              style={{ backgroundColor: '#ebb665' }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
