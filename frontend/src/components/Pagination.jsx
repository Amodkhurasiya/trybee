import { useMemo } from 'react';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5 
}) => {
  // Calculate which page numbers to show
  const visiblePages = useMemo(() => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
            currentPage === 1
              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* First page button */}
            {showFirstLast && currentPage > 1 && (
              <button
                onClick={() => handlePageClick(1)}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                title="First page"
              >
                <span className="sr-only">First page</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06-.02L10 10.832 5.27 14.75a.75.75 0 11-.98-1.14l5.5-4.75a.75.75 0 01.98 0l5.5 4.75a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {/* Previous page button */}
            {showPrevNext && (
              <button
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  !showFirstLast ? 'rounded-l-md' : ''
                } ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                title="Previous page"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Show ellipsis if there are pages before visible range */}
            {visiblePages[0] > 1 && (
              <>
                {visiblePages[0] > 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    ...
                  </span>
                )}
              </>
            )}

            {/* Page number buttons */}
            {visiblePages.map((pageNum) => (
        <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                  pageNum === currentPage
          ? 'z-10 text-white focus-visible:outline-2 focus-visible:outline-offset-2'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                }`}
        style={pageNum === currentPage ? { backgroundColor: '#ebb665' } : undefined}
                aria-current={pageNum === currentPage ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ))}

            {/* Show ellipsis if there are pages after visible range */}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    ...
                  </span>
                )}
              </>
            )}

            {/* Next page button */}
            {showPrevNext && (
              <button
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  !showFirstLast ? 'rounded-r-md' : ''
                } ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`}
                title="Next page"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Last page button */}
            {showFirstLast && currentPage < totalPages && (
              <button
                onClick={() => handlePageClick(totalPages)}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                title="Last page"
              >
                <span className="sr-only">Last page</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.21 5.23a.75.75 0 01.02 1.06L8.168 10l-3.938 3.71a.75.75 0 101.04 1.08l4.5-4.25a.75.75 0 000-1.08l-4.5-4.25a.75.75 0 01.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Quick page jump (optional enhancement) */}
      {totalPages > 10 && (
        <div className="hidden lg:flex items-center ml-4">
          <label htmlFor="page-jump" className="sr-only">
            Jump to page
          </label>
          <span className="text-sm text-gray-700 mr-2">Go to:</span>
          <input
            id="page-jump"
            type="number"
            min="1"
            max={totalPages}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageClick(page);
                  e.target.value = '';
                }
              }
            }}
            onBlur={(e) => {
              e.target.value = '';
            }}
            placeholder={currentPage.toString()}
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;
