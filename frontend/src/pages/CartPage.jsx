import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchCart,
  updateCartItemAsync,
  removeFromCartAsync,
  clearCartAsync,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectCartLoading,
  selectCartError,
} from '../store/cartSlice';
import { selectIsAuthenticated } from '../store/authSlice';
import { getProductImageUrl } from '../utils/imageUtils';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/cart'));
      return;
    }
    
    console.log('CartPage: Fetching cart data...');
    // Fetch cart when component mounts
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

  // Debug cart data
  useEffect(() => {
    console.log('CartPage: Cart items:', cartItems);
    console.log('CartPage: Cart items length:', cartItems.length);
    console.log('CartPage: Total items:', totalItems);
    console.log('CartPage: Total amount:', totalAmount);
    console.log('CartPage: Loading:', loading);
    console.log('CartPage: Error:', error);
    
    // Debug individual cart items
    cartItems.forEach((item, index) => {
      console.log(`CartPage: Item ${index}:`, {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.productId
      });
    });
  }, [cartItems, totalItems, totalAmount, loading, error]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      await dispatch(updateCartItemAsync({ productId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      await dispatch(removeFromCartAsync(productId)).unwrap();
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await dispatch(clearCartAsync()).unwrap();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          // Empty cart state
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-[#ebb665] text-white font-medium rounded-lg hover:bg-[#d2a45b] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          // Cart items and summary
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.productId._id || item.productId.id || item.productId}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      isUpdating={updatingItems.has(item.productId._id || item.productId.id || item.productId)}
                      isRemoving={removingItems.has(item.productId._id || item.productId.id || item.productId)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-[#ebb665] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#d2a45b] transition-colors"
                >
                  Proceed to Checkout
                </button>
                
                <Link
                  to="/products"
                  className="block w-full mt-3 text-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({ item, onQuantityChange, onRemove, isUpdating, isRemoving }) => {
  const { productId: product, quantity, price } = item;
  
  // Debug the product data
  console.log('CartItem: Product data:', product);
  console.log('CartItem: Item data:', item);
  
  // Handle case where product might be null or undefined
  if (!product) {
    console.error('CartItem: Product is null or undefined');
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Product information is missing for this cart item.</p>
      </div>
    );
  }

  // Handle case where product might be just an ID string instead of object
  if (typeof product === 'string') {
    console.error('CartItem: Product is a string ID instead of object:', product);
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Product details are loading...</p>
      </div>
    );
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(product._id || product.id, quantity - 1);
    }
  };

  const increaseQuantity = () => {
    onQuantityChange(product._id || product.id, quantity + 1);
  };

  const handleRemove = () => {
    onRemove(product._id || product.id);
  };

  return (
    <div className={`p-6 ${isRemoving ? 'opacity-50' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={getProductImageUrl(product.images?.[0])}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <Link
                to={`/products/${product._id || product.id}`}
                className="text-lg font-medium text-gray-900 hover:text-blue-600"
              >
                {product.name}
              </Link>
              <p className="text-sm text-gray-600 mt-1">{product.category}</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">₹{price.toFixed(2)}</p>
            </div>
            
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-gray-400 hover:text-red-600 disabled:opacity-50"
            >
              {isRemoving ? (
                <div className="w-5 h-5 animate-spin border-2 border-gray-300 border-t-red-600 rounded-full"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-3 mt-4">
            <span className="text-sm text-gray-600">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || isUpdating}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                {isUpdating ? (
                  <div className="w-4 h-4 mx-auto animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                ) : (
                  quantity
                )}
              </span>
              <button
                onClick={increaseQuantity}
                disabled={isUpdating}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-900">₹{(price * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
