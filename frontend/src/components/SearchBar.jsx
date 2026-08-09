import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

const SearchBar = ({ initialValue = '', onSearch, placeholder = 'Search products...' }) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounce timers
  const suggestionsTimer = useRef(null);
  const instantSearchTimer = useRef(null);

  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current);
      if (instantSearchTimer.current) clearTimeout(instantSearchTimer.current);
    };
  }, []);

  // Handle input change with debounced suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    const trimmed = value.trim();

    // Clear previous timers
    if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current);
    if (instantSearchTimer.current) clearTimeout(instantSearchTimer.current);

    // Suggestions after 1+ characters
    if (trimmed.length >= 1) {
      suggestionsTimer.current = setTimeout(() => {
        fetchSuggestions(trimmed);
      }, 200);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Instant search after 3+ characters
    if (trimmed.length >= 3) {
      instantSearchTimer.current = setTimeout(() => {
        performSearch(trimmed);
      }, 250);
    }
  };

  // Fetch search suggestions from backend
  const fetchSuggestions = async (query) => {
    try {
      setIsLoading(true);
      const response = await axios.get('/search/suggestions', {
        params: { q: query, limit: 8 }
      });
      
      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery.trim());
  };

  // Perform search
  const performSearch = (query) => {
    if (query) {
      onSearch(query);
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    performSearch(suggestion.text);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          performSearch(searchQuery.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        suggestionsRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
    searchInputRef.current?.focus();
  };

  return (
  <div className="relative w-full max-w-3xl mx-auto font-gilroy">
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 text-gray-900"
            style={{ boxShadow: '0 0 0 2px rgba(0,0,0,0)', outline: 'none' }}
          />
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-y-0 right-16 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#ebb665' }}></div>
            </div>
          )}
          
          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-10 flex items-center pr-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Search Button */}
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                  selectedIndex === index ? 'bg-[#fff7e9] text-[#9a6c16]' : 'text-gray-900'
                }`}
              >
                {/* Suggestion Icon */}
                <div className="flex-shrink-0">
                  {suggestion.type === 'product' && (
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                  {suggestion.type === 'category' && (
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                  {suggestion.type === 'search' && (
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                
                {/* Suggestion Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {suggestion.text}
                  </div>
                  {suggestion.category && (
                    <div className="text-xs text-gray-500">
                      in {suggestion.category}
                    </div>
                  )}
                </div>
                
                {/* Suggestion Count */}
                {suggestion.count && (
                  <div className="text-xs text-gray-400">
                    {suggestion.count} items
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Search All Results */}
          {searchQuery.trim() && (
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={() => performSearch(searchQuery.trim())}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                style={{ color: '#ebb665' }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm font-medium">
                  Search for "{searchQuery.trim()}"
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Searches (when no suggestions and input is focused) */}
      {showSuggestions && suggestions.length === 0 && !isLoading && searchQuery.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Popular Searches
            </div>
            {[
              'Handwoven textiles',
              'Tribal jewelry',
              'Traditional pottery',
              'Wooden crafts',
              'Tribal art'
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick({ text: item, type: 'search' })}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 text-gray-600"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
