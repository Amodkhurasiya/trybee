import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  selectCartTotalItems, 
  selectCartLoading,
  toggleCart 
} from '../store/cartSlice';
import { selectIsAuthenticated } from '../store/authSlice';

const CartIcon = ({ showText = false, className = '' }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cartItemsCount = useSelector(selectCartTotalItems);
  const loading = useSelector(selectCartLoading);

  const handleCartClick = () => {
    if (isAuthenticated) {
      dispatch(toggleCart());
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isAuthenticated ? (
        <button
          onClick={handleCartClick}
          className="relative text-gray-700 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-2"
          aria-label={`Shopping cart with ${cartItemsCount} items`}
        >
          <div className="relative">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0h10" 
              />
            </svg>
            
            {/* Cart count badge */}
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
            
            {/* Loading indicator */}
            {loading && (
              <div className="absolute -top-1 -right-1 w-3 h-3">
                <div className="w-full h-full border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {showText && (
            <span className="hidden md:block text-sm font-medium">
              Cart {cartItemsCount > 0 && `(${cartItemsCount})`}
            </span>
          )}
        </button>
      ) : (
        <Link
          to="/login?redirect=/cart"
          className="relative text-gray-700 hover:text-indigo-600 transition-colors duration-200 flex items-center space-x-2"
          aria-label="Login to access cart"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0h10" 
            />
          </svg>
          
          {showText && (
            <span className="hidden md:block text-sm font-medium">Cart</span>
          )}
        </Link>
      )}
    </div>
  );
};

export default CartIcon;
