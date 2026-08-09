import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCartAsync, openCart, selectCartOpen } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/userSlice';
import { showSuccessToast, showErrorToast } from '../store/toastSlice';
import { getFirstProductImage, getProductImageUrls, handleImageError } from '../utils/imageUtils';

const ProductCard = ({ product, viewMode = 'grid', userOrderHistory = [] }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { wishlist } = useSelector(state => state.user);
  const isCartOpen = useSelector(selectCartOpen);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const productId = product.id || product._id;

  // Check if user has purchased this product before
  const hasPurchasedBefore = userOrderHistory?.some(order => 
    order.items?.some(item => item.productId === productId || item.productId?._id === productId)
  );
  
  // Check if product is in wishlist
  useEffect(() => {
    if (user && wishlist) {
      setIsInWishlist(
        wishlist.some(item => (item._id || item.id) === productId)
      );
    } else {
      setIsInWishlist(false);
    }
  }, [wishlist, productId, user]);

  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Add to cart clicked, user:', user);
    console.log('Product:', product);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=/products';
      return;
    }

    try {
      setAddingToCart(true);
      console.log('Dispatching addToCartAsync with:', { 
        productId: productId, 
        quantity: 1 
      });
      
      const result = await dispatch(addToCartAsync({ 
        productId: productId, 
        quantity: 1 
      })).unwrap();
      
      console.log('Add to cart successful:', result);
      
      // Only open cart sidebar if it's not already open
      if (!isCartOpen) {
        dispatch(openCart());
      }
      
      // Show success notification
      dispatch(showSuccessToast(`${product.name} added to cart!`));
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error notification
      dispatch(showErrorToast(`Failed to add item to cart: ${error}`));
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      window.location.href = '/login?redirect=/products';
      return;
    }

    try {
      // Optimistic UI update
      setIsInWishlist(prev => !prev);
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Revert on failure
      setIsInWishlist(prev => !prev);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (product.originalPrice && product.price < product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  // Handle image navigation for products with multiple images
  const handleImageChange = (direction) => {
    if (!product.images || product.images.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  // Resolve image URLs once and use currentImageIndex for display
  const imageUrls = getProductImageUrls(product.images || []);

  const getCurrentImage = () => {
    if (!imageUrls || imageUrls.length === 0) return getFirstProductImage([]);
    const safeIndex = Math.min(Math.max(0, currentImageIndex), imageUrls.length - 1);
    return imageUrls[safeIndex];
  };

  // Stock handling: show exact count if provided; don't fake a count
  const hasStockValue = product.stock !== undefined && product.stock !== null;
  const stockNumber = hasStockValue ? Number(product.stock) : undefined;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 font-gilroy">
  <Link to={`/products/${productId}`} className="flex p-4">
          {/* Product Image */}
          <div className="relative flex-shrink-0 w-32 h-32 mr-4">
            <img
              src={getCurrentImage()}
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
              onError={handleImageError}
            />
            
            {/* Image Navigation for Multiple Images */}
            {product.images && product.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-1 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleImageChange('prev');
                  }}
                  className="bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleImageChange('next');
                  }}
                  className="bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Purchase History Badge */}
            {hasPurchasedBefore && (
              <div className="absolute top-1 left-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Purchased
              </div>
            )}

            {/* Discount Badge */}
            {getDiscountPercentage() > 0 && (
              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{getDiscountPercentage()}%
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Category and Stock */}
                <div className="flex items-center mt-2 space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {product.category}
                  </span>
                  {hasStockValue ? (
                    stockNumber > 0 ? (
                    <span className="text-xs text-green-600">
                      {stockNumber} in stock
                    </span>
                    ) : (
                      <span className="text-xs text-red-600">Out of stock</span>
                    )
                  ) : null}
                </div>

                {/* Price */}
                <div className="flex items-center mt-3">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full transition-colors ${
                    isInWishlist
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || (hasStockValue && stockNumber === 0)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hasStockValue && stockNumber === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : addingToCart
                      ? 'bg-[#f0d7a8] text-white cursor-wait'
                      : 'bg-[#ebb665] text-white hover:bg-[#d2a45b]'
                  }`}
                >
                  {addingToCart ? 'Adding...' : (hasStockValue && stockNumber === 0) ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group font-gilroy">
  <Link to={`/products/${productId}`}>
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100">
          <img
            src={getCurrentImage()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
          
          {/* Image Navigation for Multiple Images */}
          {product.images && product.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleImageChange('prev');
                }}
                className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleImageChange('next');
                }}
                className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Image Indicators */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-2">
            {hasPurchasedBefore && (
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Purchased
              </div>
            )}
            {getDiscountPercentage() > 0 && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{getDiscountPercentage()}%
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isInWishlist
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-white bg-opacity-80 text-gray-400 hover:bg-white hover:text-red-600'
            }`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
              {product.name}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Category and Stock */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {product.category}
            </span>
            {hasStockValue ? (
              stockNumber > 0 ? (
                <span className="text-xs text-green-600">{stockNumber} in stock</span>
              ) : (
                <span className="text-xs text-red-600">Out of stock</span>
              )
            ) : null}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || (hasStockValue && stockNumber === 0)}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              hasStockValue && stockNumber === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : addingToCart
                ? 'bg-[#f0d7a8] text-white cursor-wait'
                : 'bg-[#ebb665] text-white hover:bg-[#d2a45b]'
            }`}
          >
            {addingToCart ? 'Adding...' : (hasStockValue && stockNumber === 0) ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
