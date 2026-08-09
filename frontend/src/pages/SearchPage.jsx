import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  searchProducts,
  fetchFeaturedProducts,
  selectFeaturedProducts,
  selectSearchResults,
  selectProductsLoading,
  clearSearchResults 
} from '../store/productSlice';
import ProductCard from '../components/ProductCard';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const debounceRef = useRef(null);
  
  const searchResults = useSelector(selectSearchResults);
  const featured = useSelector(selectFeaturedProducts);
  const isLoading = useSelector(selectProductsLoading);
  
  // Get initial search query from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      dispatch(searchProducts({ query }));
    } else {
      // Show featured/random products by default
      dispatch(fetchFeaturedProducts());
    }
  }, [searchParams, dispatch]);

  // Instant search on typing (>=3 chars)
  useEffect(() => {
    const q = searchQuery.trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (q.length >= 3) {
      debounceRef.current = setTimeout(() => {
        // Keep URL in sync
        setSearchParams({ q });
        dispatch(searchProducts({ query: q }));
      }, 250);
    } else if (q.length === 0) {
      // Clear results when field is cleared
      dispatch(clearSearchResults());
      setSearchParams({});
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, dispatch, setSearchParams]);

  // Clear search results when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      dispatch(searchProducts({ query: searchQuery.trim() }));
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchParams({});
    dispatch(clearSearchResults());
  };

  const hasQueryParam = !!searchParams.get('q');
  const showResults = (searchQuery.trim().length >= 3) || hasQueryParam;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find exactly what you're looking for in our collection of handcrafted items
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search for products, categories, or keywords..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#ebb665] focus:border-[#ebb665] outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={!searchQuery.trim() || isLoading}
                className="px-6 py-3 bg-[#ebb665] text-white font-medium rounded-r-lg hover:bg-[#d2a45b] focus:ring-2 focus:ring-[#ebb665] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
          
          {searchQuery && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} ${searchResults.length === 1 ? 'result' : 'results'} for "${searchQuery}"`
                  : searchParams.get('q') ? `No results found for "${searchQuery}"` : ''
                }
              </p>
              <button
                onClick={handleClear}
                className="text-sm text-[#b17e1a] hover:text-[#9a6c16] font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {/* Live search results (appear above Popular) */}
        {showResults && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Results</h2>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Searching…</span>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ebb665]"></span>
                </div>
              )}
            </div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            ) : (hasQueryParam || searchQuery.trim().length >= 3) && !isLoading ? (
              <div className="text-center py-8 text-gray-600">No products found</div>
            ) : null}
          </div>
        )}

        {/* Popular always visible below */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Popular right now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(featured || []).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>

  {/* Tips removed; replaced with Featured/Popular grid */}
      </div>
    </div>
  );
};

export default SearchPage;
