const LoadingSkeleton = ({ 
  count = 1, 
  height = "h-4", 
  width = "w-full", 
  className = "",
  variant = "rectangular" 
}) => {
  const items = Array.from({ length: count }, (_, index) => index);

  const getSkeletonClasses = () => {
    const baseClasses = "animate-pulse bg-gray-200";
    
    switch (variant) {
      case 'circular':
        return `${baseClasses} rounded-full ${height} ${width}`;
      case 'rounded':
        return `${baseClasses} rounded-md ${height} ${width}`;
      case 'text':
        return `${baseClasses} rounded ${height} ${width}`;
      default:
        return `${baseClasses} rounded ${height} ${width}`;
    }
  };

  if (count === 1) {
    return (
      <div className={`${getSkeletonClasses()} ${className}`}></div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <div key={item} className={getSkeletonClasses()}></div>
      ))}
    </div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex animate-pulse">
          <div className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-md mr-4"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="flex items-center space-x-2 mt-3">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20 mt-2"></div>
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};

// Filter Sidebar Skeleton
export const FilterSidebarSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        
        {/* Categories skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-6"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price range skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};

// Search Bar Skeleton
export const SearchBarSkeleton = () => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

// Page Header Skeleton
export const PageHeaderSkeleton = () => {
  return (
    <div className="mb-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <SearchBarSkeleton />
    </div>
  );
};

// Grid Layout Skeleton
export const ProductGridSkeleton = ({ count = 12, viewMode = 'grid' }) => {
  const items = Array.from({ length: count }, (_, index) => index);
  
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <ProductCardSkeleton key={item} viewMode="list" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ProductCardSkeleton key={item} viewMode="grid" />
      ))}
    </div>
  );
};

// Pagination Skeleton
export const PaginationSkeleton = () => {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="animate-pulse flex space-x-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 justify-between sm:hidden animate-pulse">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-8 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

// Complete Page Skeleton
export const ProductsPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <FilterSidebarSkeleton />
          </div>
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
            <ProductGridSkeleton count={12} />
            <PaginationSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
