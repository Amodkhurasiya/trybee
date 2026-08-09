import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/productSlice';
import { addToCartAsync, openCart, selectCartOpen } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/userSlice';
import ProductImageGallery from '../components/ProductImageGallery';
import RelatedProducts from '../components/RelatedProducts';
import ProductReviews from '../components/ProductReviews';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProduct: product, isLoading: loading, error } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  const { wishlist } = useSelector(state => state.user);
  const isCartOpen = useSelector(selectCartOpen);
  
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Helpers to safely render fields that might be arrays or objects
  const renderMaterials = (materials) => {
    if (!materials) return '';
    if (Array.isArray(materials)) return materials.filter(Boolean).join(', ');
    if (typeof materials === 'object') return Object.values(materials).filter(Boolean).join(', ');
    return String(materials);
  };

  const renderDimensions = (dims) => {
    if (!dims) return '';
    if (typeof dims === 'string') return dims;
    if (Array.isArray(dims)) return dims.filter(Boolean).join(' × ');
    if (typeof dims === 'object') {
      const { length, width, height, unit } = dims;
      const parts = [];
      if (length != null && length !== '') parts.push(length);
      if (width != null && width !== '') parts.push(width);
      if (height != null && height !== '') parts.push(height);
      const joined = parts.join(' × ');
      return joined ? (unit ? `${joined} ${unit}` : joined) : '';
    }
    return '';
  };

  useEffect(() => {
    if (id) {
      console.log('ProductDetailPage: Fetching product with ID:', id);
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  // Debug product data
  useEffect(() => {
    if (product) {
      console.log('ProductDetailPage: Product loaded:', product);
      console.log('ProductDetailPage: Product properties:', {
        _id: product._id,
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        images: product.images,
        hasId: !!product.id,
        hasUnderscoreId: !!product._id
      });
    }
  }, [product]);

  useEffect(() => {
    if (user && wishlist && product) {
      const pid = product.id || product._id;
      setIsInWishlist(wishlist.some(item => (item._id || item.id) === pid));
    } else {
      setIsInWishlist(false);
    }
  }, [wishlist, product, user]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setAddingToCart(true);
      
      console.log('ProductDetailPage: Adding to cart with data:', {
        productId: product.id,
        quantity: selectedQuantity,
        product: product,
        productIdField: 'id (like ProductCard)'
      });
      
      await dispatch(addToCartAsync({ 
        productId: product.id, 
        quantity: selectedQuantity 
      })).unwrap();
      
      // Only open cart sidebar if it's not already open
      if (!isCartOpen) {
        dispatch(openCart());
      }
      
      // Show success message (you can implement toast notifications here)
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      // Optimistic update
      setIsInWishlist(prev => !prev);
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product.id)).unwrap();
      } else {
        await dispatch(addToWishlist(product.id)).unwrap();
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Revert on failure
      setIsInWishlist(prev => !prev);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      // Add to cart and redirect to checkout
      await dispatch(addToCartAsync({ 
        productId: product.id, 
        quantity: selectedQuantity 
      })).unwrap();
      
      navigate('/checkout');
    } catch (error) {
      console.error('Error in buy now:', error);
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
    if (product?.originalPrice && product.price < product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LoadingSkeleton height="h-96" className="rounded-lg" />
            <div className="space-y-4">
              <LoadingSkeleton height="h-8" width="w-3/4" />
              <LoadingSkeleton height="h-6" width="w-1/2" />
              <LoadingSkeleton height="h-20" />
              <LoadingSkeleton height="h-12" width="w-1/3" />
              <LoadingSkeleton height="h-10" count={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">Product not found</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Link
                to="/products"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ebb665] hover:bg-[#d2a45b]"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    console.log('ProductDetailPage: No product data available');
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Loading product...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {product.category && (
              <>
                <Link 
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {product.category}
                </Link>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </nav>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <ProductImageGallery 
              images={product.images || []} 
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-gilroy">{product.name}</h1>
              <div className="mt-2 flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {product.category}
                </span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {getDiscountPercentage()}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <div>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={product.stock === 0}
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex space-x-3">
      <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0}
                    className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : addingToCart
        ? 'bg-[#d2a45b] text-white cursor-wait'
        : 'bg-[#ebb665] text-white hover:bg-[#d2a45b]'
                    }`}
                  >
                    {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-md transition-colors ${
                      isInWishlist
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-600'
                    }`}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || addingToCart}
                  className="w-full py-3 px-6 text-sm font-medium rounded-md transition-colors bg-[#ebb665] text-white hover:bg-[#d2a45b] focus:ring-2 focus:ring-[#ebb665] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Buy Now - Quick checkout"
                >
                  {addingToCart ? 'Adding...' : 'Buy Now'}
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Free delivery on orders over ₹999
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Authentic tribal craftsmanship guaranteed
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                30-day return policy
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'shipping', label: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.longDescription || product.description}
                </p>
                {product.features && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Product Details</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="text-sm text-gray-900">{product.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Stock</dt>
                      <dd className="text-sm text-gray-900">{product.stock} units</dd>
                    </div>
          {product.materials && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Materials</dt>
            <dd className="text-sm text-gray-900">{renderMaterials(product.materials)}</dd>
                      </div>
                    )}
          {product.dimensions && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
            <dd className="text-sm text-gray-900">{renderDimensions(product.dimensions)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                {product.craftInfo && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Craft Information</h4>
                    <p className="text-sm text-gray-600">{product.craftInfo}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} />
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Free shipping on orders over ₹999</li>
                    <li>• Standard delivery: 5-7 business days</li>
                    <li>• Express delivery: 2-3 business days (additional charges apply)</li>
                    <li>• Cash on delivery available</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Returns & Exchanges</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 30-day return policy</li>
                    <li>• Items must be in original condition</li>
                    <li>• Free return pickup available</li>
                    <li>• Refund processed within 7-10 business days</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts 
            currentProductId={product.id} 
            category={product.category}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
