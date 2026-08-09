import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  selectCategories, 
  selectProductsLoading,
  fetchCategories 
} from '../store/productSlice';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectProductsLoading);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Branding helpers
  const navbarGradientStyle = {
    background: 'linear-gradient(90deg, #0b6a4f 24%, #10b971 110%)',
  };

  // Minimal icon mapping (fallback when no image)
  const iconMap = {
    clothing: '�',
    jewelry: '💍',
    crafts: '🎨',
    textiles: '🧵',
    artwork: '🖼️',
    accessories: '👜',
  };

  // Public images mapping for categories
  const categoryImages = {
    jewelry: '/jewlery1.jpg',
    crafts: '/craft1.jpg',
    clothing: '/clothing1.jpg',
    textiles: '/textile1.jpg',
  };

  return (
    <div className="min-h-screen bg-gray-50 font-gilroy">
  {/* Hero Section (add black top border to separate from navbar) */}
  <div style={{ ...navbarGradientStyle, borderTop: '1px solid #000' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Explore Categories</h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              Discover authentic collections curated by artisans and traditions.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const title = category.displayName || category.name;
              const desc = category.description || `Explore authentic ${category.name}`;
              const key = (category.slug || category.name || '').toLowerCase();
              const img = category.image || categoryImages[key] || '/api/placeholder/600/400';
              const slug = category.slug || category.name;
              const icon = iconMap[(category.name || '').toLowerCase()] || '📦';

              return (
                <Link key={slug} to={`/categories/${slug}`} className="group">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                    {/* Image header */}
                    <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                      <img src={img} alt={title} className="block w-full h-full object-cover transform-gpu origin-center transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      {/* Count badge */}
                      <div className="absolute left-3 top-3 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#ebb665' }}>
                        {category.count || 0} {(category.count || 0) === 1 ? 'item' : 'items'}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <div className="flex items-start mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Browse {title}</span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#ebb665' }}>
                          Explore
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600">
              Categories will appear here once products are added.
            </p>
          </div>
        )}
      </div>

  {/* Call to Action (gold gradient background; buttons unchanged) */}
  <div style={{ background: 'linear-gradient(90deg, #ebb665 10%, #d2a45b 27% , #ebb665 89%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Can’t find what you’re looking for?
            </h2>
            <p className="text-white/90 mb-8">
              Browse all products or search to find exactly what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="font-medium px-8 py-3 rounded-lg transition-colors duration-300 text-white"
                style={{ background: 'linear-gradient(90deg, #0b6a4f 24%, #10b971 110%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}
              >
                Browse All Products
              </Link>
              <Link
                to="/search"
                className="font-medium px-8 py-3 rounded-lg transition-colors duration-300 text-white border-2"
                style={{ borderColor: 'rgba(255,255,255,0.85)' }}
              >
                Search Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
