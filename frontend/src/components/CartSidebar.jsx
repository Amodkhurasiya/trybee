import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  closeCart,
  removeFromCartAsync,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectCartOpen,
  selectCartLoading,
} from '../store/cartSlice';
import { selectIsAuthenticated } from '../store/authSlice';
import { getProductImageUrl } from '../utils/imageUtils';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOpen = useSelector(selectCartOpen);
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const loading = useSelector(selectCartLoading);

  // Debug cart sidebar data
  useEffect(() => {
    if (isOpen) {
      console.log('CartSidebar: Sidebar opened');
      console.log('CartSidebar: Cart items:', cartItems);
      console.log('CartSidebar: Cart items length:', cartItems.length);
      console.log('CartSidebar: Total items:', totalItems);
      console.log('CartSidebar: Total amount:', totalAmount);
      console.log('CartSidebar: Loading:', loading);
      // Log each item structure
      cartItems.forEach((item, index) => {
        console.log(`CartSidebar: Item ${index}:`, {
          item,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      });
    } else {
      console.log('CartSidebar: Sidebar closed');
    }
  }, [isOpen, cartItems, totalItems, totalAmount, loading]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeCart());
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Don't prevent scrolling on main page - users should be able to scroll and interact
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Ensure scroll is always enabled when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, dispatch]);

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCartAsync(productId)).unwrap();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleViewCart = () => {
    dispatch(closeCart());
    navigate('/cart');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      dispatch(closeCart());
      navigate('/login?redirect=' + encodeURIComponent('/checkout'));
      return;
    }
    dispatch(closeCart());
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Subtle backdrop - only slightly dims the content, no click handler */}
      <div 
        className="fixed inset-0 bg-opacity-10 transition-opacity z-40 pointer-events-none"
      />
      
      {/* Sidebar - Slides in from right, doesn't block main content */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform translate-x-0 border-l border-gray-200">
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart ({totalItems})
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white">
              {loading && cartItems.length === 0 ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-16 h-16 bg-gray-300 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <div className="w-16 h-16 text-gray-400 mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-4">Add some products to get started!</p>
                  <Link
                    to="/products"
                    onClick={handleClose}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cartItems.map((item) => {
                    // Only skip items with completely null productId
                    if (!item || !item.productId) {
                      console.warn('Cart item with missing product detected:', item);
                      return null;
                    }
                    
                    return (
                      <CartSidebarItem
                        key={item.productId._id || item.productId.id || item.productId || item._id}
                        item={item}
                        onRemove={handleRemoveItem}
                        onClose={handleClose}
                      />
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-4 bg-white">
                {/* Total */}
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#ebb665] text-white py-3 rounded-lg font-medium hover:bg-[#d2a45b] transition-colors"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={handleViewCart}
                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Cart Sidebar Item Component
const CartSidebarItem = ({ item, onRemove, onClose }) => {
  const { productId: product, quantity, price } = item;

  // Handle different product data structures
  if (!product) {
    console.warn('CartSidebarItem: Product is null:', { item });
    return (
      <div className="flex space-x-3 group bg-red-50 p-3 rounded-lg border border-red-200">
        <div className="flex-1">
          <p className="text-sm text-red-600">
            Product no longer available
          </p>
          <button
            onClick={() => onRemove(item._id || 'unknown')}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Remove from cart
          </button>
        </div>
      </div>
    );
  }

  // Handle both populated and non-populated product references
  const productId = product._id || product.id || product;
  const productName = product.name || 'Product';
  const productCategory = product.category || 'Unknown';
  const productImages = product.images || [];

  const handleRemove = () => {
    onRemove(productId);
  };

  return (
    <div className="flex space-x-3 group">
      {/* Product Image */}
      <Link
        to={`/products/${productId}`}
        onClick={onClose}
        className="flex-shrink-0"
      >
        <img
          src={getProductImageUrl(productImages[0] || null)}
          alt={productName}
          className="w-16 h-16 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = '/src/assets/default-product.jpg';
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${productId}`}
          onClick={onClose}
          className="block"
        >
          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
            {productName}
          </h3>
        </Link>
        <p className="text-xs text-gray-600 mt-1">{productCategory}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-gray-900">
            ₹{(price || 0).toFixed(2)} × {quantity || 0}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            ₹{((price || 0) * (quantity || 0)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default CartSidebar;
