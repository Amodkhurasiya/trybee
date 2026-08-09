import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist, selectWishlist } from '../store/userSlice';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlist);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
            <p className="text-sm text-gray-600">Save items you love and revisit anytime</p>
          </div>
        </div>

        {(!wishlist || wishlist.length === 0) ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Browse products and tap the heart icon to save your favorites.</p>
            <a href="/products" className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Start Shopping</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((p) => (
              <ProductCard key={p._id} product={{ ...p, id: p._id }} viewMode="grid" userOrderHistory={[]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
