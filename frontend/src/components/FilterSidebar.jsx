import { useState, useEffect, useMemo } from 'react';
import axios from '../utils/axios';

const FilterSidebar = ({ 
  filters = {}, 
  selectedCategory, 
  selectedMaxPrice, 
  onFilterChange, 
  onClearAll,
  onSortChange, 
  sortBy, 
  sortOrder 
}) => {
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  });

  // Load filter options from backend
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Set initial max price value
  useEffect(() => {
    setMaxPriceInput(selectedMaxPrice || '');
  }, [selectedMaxPrice]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      // Fetch categories with counts
      const [categoriesRes, filtersRes] = await Promise.all([
        axios.get('/categories'),
        axios.get('/search/filters')
      ]);

      const catData = categoriesRes.data || [];
      setCategories(
        (Array.isArray(catData) ? catData : (catData.categories || [])).map(c => ({
          name: c.name,
          displayName: c.displayName || c.name,
          slug: c.slug || c.name,
          count: c.count || c.productCount || 0,
        }))
      );

      if (filtersRes.data?.success) {
        const fd = filtersRes.data.data;
        if (fd?.priceRange) {
          setPriceRange({
            min: Math.floor(fd.priceRange.min || 0),
            max: Math.ceil(fd.priceRange.max || 10000),
          });
        }
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  // Categories list (no quick search per requirements)
  const visibleCategories = categories;

  // Handle category selection
  const handleCategoryChange = (category) => {
    onFilterChange('category', selectedCategory === category ? '' : category);
  };

  // Handle applying single max price (items priced <= max)
  const handleApplyMaxPrice = () => {
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput) : '';
    onFilterChange('minPrice', '');
    onFilterChange('maxPrice', maxPrice);
  };

  // Clear price filters
  const clearPriceFilters = () => {
    setMaxPriceInput('');
    onFilterChange('minPrice', '');
    onFilterChange('maxPrice', '');
  };

  // Clear all filters
  const clearAllFilters = () => {
  setMaxPriceInput('');
    onFilterChange('category', '');
    onFilterChange('minPrice', '');
    onFilterChange('maxPrice', '');
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedMaxPrice) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4 font-gilroy">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
      {getActiveFilterCount() > 0 && (
            <button
        onClick={onClearAll || clearAllFilters}
              className="text-sm font-medium"
              style={{ color: '#ebb665' }}
            >
              Clear All ({getActiveFilterCount()})
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">

  {/* Categories Section (no quick search) */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Categories</h4>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections.categories ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.categories && (
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
              {visibleCategories.map((category) => (
                <label key={category.slug} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.name}
                      onChange={() => handleCategoryChange(category.name)}
                      className="h-4 w-4 border-gray-300 text-[#ebb665] focus:ring-[#ebb665]"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.displayName}</span>
                  </div>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </label>
              ))}
              {visibleCategories.length === 0 && (
                <p className="text-sm text-gray-500">No categories</p>
              )}
            </div>
          )}
        </div>

        {/* Price Range Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Max Price</h4>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections.price ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <div className="relative">
                <span className="absolute left-2 top-1.5 text-gray-400 text-xs">₹</span>
                <input
                  type="number"
                  min={0}
                  placeholder={priceRange.max.toString()}
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full pl-5 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyMaxPrice}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded"
                  style={{ backgroundColor: '#ebb665' }}
                >
                  Apply
                </button>
                {selectedMaxPrice && (
                  <button
                    onClick={clearPriceFilters}
                    className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
              </div>

              {selectedMaxPrice && (
                <div className="p-2 rounded text-xs" style={{ backgroundColor: '#fff7e9' }}>
                  <span className="font-medium" style={{ color: '#9a6c16' }}>
                    ≤ ₹{selectedMaxPrice}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
