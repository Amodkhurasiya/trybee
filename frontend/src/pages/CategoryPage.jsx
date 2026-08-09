import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectProducts, 
  selectProductsLoading, 
  selectCategories,
  fetchProducts,
  fetchCategories 
} from '../store/productSlice';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectProductsLoading);
  const pagination = useSelector((state) => state.products.pagination);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Public category images mapping (fallbacks)
  const categoryImages = {
  jewelry: '/jewlery1.jpg',
  jewlery: '/jewlery1.jpg',
  jewellery: '/jewlery1.jpg',
    crafts: '/craft1.jpg',
    clothing: '/clothing1.jpg',
    textiles: '/textile1.jpg',
  };

  useEffect(() => {
    // Fetch categories first to get display names
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (slug) {
      // Reset to page 1 when slug changes
      setPage(1);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      // Fetch products for this category and page
      dispatch(fetchProducts({ category: slug, page, limit }));
    }
  }, [dispatch, slug, page]);

  // Scroll to top when page changes within the category
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    // Find current category details
    if (categories.length > 0 && slug) {
      const category = categories.find(cat => 
        cat.slug === slug || cat.name === slug
      );
      setCurrentCategory(category);
    }
  }, [categories, slug]);

  const displayTitle = (currentCategory?.displayName || currentCategory?.name || slug || '')
    .toString()
    .replace(/^[a-z]/, (c) => c.toUpperCase());

  const totalPages = pagination?.totalPages || 1;
  const totalProducts = pagination?.totalProducts ?? products.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <Link to="/categories" className="hover:text-indigo-600">Categories</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">{displayTitle}</span>
          </nav>
        </div>
      </div>

  {/* Category Header removed per request (no title/description/available chip) */}

      {/* Filter and Sort Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${totalProducts} products found`}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  className="px-3 py-2 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).slice(0, 6).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      key={p}
                      className={`px-3 py-2 border rounded ${p === page ? 'bg-indigo-600 text-white' : ''}`}
                      onClick={() => setPage(p)}
                      disabled={loading}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  className="px-3 py-2 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0v7a1 1 0 001 1h10a1 1 0 001-1v-7M6 13h12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                There are currently no products in the {displayTitle?.toLowerCase()} category.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  Browse All Products
                </Link>
                <Link
                  to="/categories"
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  View All Categories
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Categories (cards like Home/Categories) */}
      {categories.length > 1 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Explore Other Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories
                .filter(cat => (cat.slug || cat.name) !== slug)
                .slice(0, 4)
                .map((category) => {
                  const key = (category.slug || category.name || '').toLowerCase();
                  const img = category.image || categoryImages[key] || '/api/placeholder/600/400';
                  const title = category.displayName || category.name;
                  const link = `/categories/${category.slug || category.name}`;
                  return (
                    <Link key={key} to={link} className="group">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                          <img
                            src={img}
                            alt={title}
                            className="block w-full h-full object-cover transform-gpu origin-center transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/Trybee-Logo.svg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                          <div className="absolute left-3 top-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#ebb665' }}>
                            {category.count || 0} {(category.count || 0) === 1 ? 'item' : 'items'}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                          <p className="text-xs text-gray-600">Browse {title}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
