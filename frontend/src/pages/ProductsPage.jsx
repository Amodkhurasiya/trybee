import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts, setProductsLoading, setProductsError } from '../store/productSlice';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, pagination, filters } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  
  // Local state for UI controls
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get search parameters from URL
  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    // Load products when component mounts or search params change
    loadProducts();
  }, [searchQuery, category, maxPrice, page, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      dispatch(setProductsLoading(true));
      
      // Build query parameters for API call
      const queryParams = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(category && { category }),
        ...(maxPrice && { maxPrice: parseFloat(maxPrice) })
      };

      await dispatch(fetchProducts(queryParams)).unwrap();
    } catch (error) {
      console.error('Error loading products:', error);
      dispatch(setProductsError(error.message || 'Failed to load products'));
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    
    // Reset to first page when filters change
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Clear all filters reliably in one update
  const handleClearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle search
  const handleSearch = (query) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle sort change
  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-4">
              <LoadingSkeleton count={5} height="h-12" />
            </div>
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <LoadingSkeleton count={9} height="h-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 py-8 relative font-gilroy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {category ? `${category} Products` : 'All Products'}
              </h1>
              <p className="mt-2 text-gray-600">
                Discover authentic tribal products crafted with traditional techniques
                {user && (
                  <span className="ml-2 text-[#ebb665]">
                    • Personalized for you
                  </span>
                )}
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
        <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
          ? 'bg-[#f5e7cc] text-[#ebb665]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
        <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
          ? 'bg-[#f5e7cc] text-[#ebb665]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Filters
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <SearchBar 
            initialValue={searchQuery}
            onSearch={handleSearch}
            placeholder="Search for tribal products, categories, or materials..."
          />
        </div>

  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
          {/* Filter Sidebar */}
          <aside className={`hidden md:block`}>
            <FilterSidebar
              filters={filters}
              selectedCategory={category}
              selectedMaxPrice={maxPrice}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAllFilters}
              onSortChange={handleSortChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </aside>

          {/* Product Grid */}
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {((pagination?.totalProducts ?? 0) > 0) ? (
                  <>
                    Showing {((page - 1) * 12) + 1}-{Math.min(page * 12, pagination.totalProducts)} of {pagination.totalProducts} products
                    {searchQuery && (
                      <span className="ml-2">
                        for "<span className="font-medium text-gray-900">{searchQuery}</span>"
                      </span>
                    )}
                  </>
                ) : (
                  'No products found'
                )}
              </div>
              
              {/* Quick Sort */}
              <select
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('_');
                  handleSortChange(field, order);
                }}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
              >
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="price_asc">Price Low to High</option>
                <option value="price_desc">Price High to Low</option>
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
              </select>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading products
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Display */}
            {products && products.length > 0 ? (
              <>
                <ProductGrid 
                  products={products} 
                  viewMode={viewMode}
                  user={user}
                />
                
                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              !loading && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || category || maxPrice
                      ? 'Try adjusting your search criteria or clearing filters.'
                      : 'There are no products available at this time.'}
                  </p>
                  {(searchQuery || category || maxPrice) && (
          <div className="mt-6">
                      <Link
                        to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ebb665] hover:bg-[#d2a45b]"
                      >
                        Clear all filters
                      </Link>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-over */}
      {showFilters && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85%] bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar
                filters={filters}
                selectedCategory={category}
                selectedMaxPrice={maxPrice}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAllFilters}
                onSortChange={handleSortChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </div>
            <div className="p-4 border-t bg-white">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#ebb665] rounded-md hover:bg-[#d2a45b]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Filters Button (mobile) */}
      <button
        onClick={() => setShowFilters(true)}
        className="md:hidden fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-[#ebb665] hover:bg-[#d2a45b] text-white"
        aria-label="Open filters"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13v4l-4 2v-6a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filters
      </button>
    </div>
  );
};

export default ProductsPage;
