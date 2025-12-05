import React, { useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './Button';
import { GlassmorphicCard } from './GlassmorphicCard';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}) => {
  const pageNumbersContainerRef = useRef(null);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleKeyDown = (e) => {
    if (pageNumbersContainerRef.current) {
      const focusableElements = Array.from(
        pageNumbersContainerRef.current.querySelectorAll('button')
      );
      const currentIndex = focusableElements.indexOf(document.activeElement);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex =
          (currentIndex - 1 + focusableElements.length) %
          focusableElements.length;
        focusableElements[prevIndex].focus();
      }
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const visiblePages = 5; // Adjust this number for more/less visible pages

    if (totalPages <= visiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= visiblePages) {
        for (let i = 1; i <= visiblePages + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage > totalPages - visiblePages) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - visiblePages; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((page, index) =>
      page === '...' ? (
        <span key={index} className="px-2 py-1 text-text-secondary">
          ...
        </span>
      ) : (
        <Button
          key={index}
          variant={currentPage === page ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => handlePageChange(page)}
          className={currentPage === page ? 'font-bold' : ''}
        >
          {page}
        </Button>
      )
    );
  };

  const firstItemIndex = (currentPage - 1) * pageSize + 1;
  const lastItemIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <GlassmorphicCard className="flex items-center justify-between p-2 flex-wrap gap-2">
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between w-full">
        <div className="text-sm text-text-secondary hidden lg:block">
          Showing {firstItemIndex}-{lastItemIndex} of {totalItems} items
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="hidden sm:flex items-center gap-1"
          ref={pageNumbersContainerRef}
          onKeyDown={handleKeyDown}
        >
          {renderPageNumbers()}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white/5 backdrop-blur-sm text-text-primary border border-accent-cyan/30 rounded-md text-sm focus:ring-accent-cyan focus:border-accent-cyan"
              aria-label="Items per page"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm text-text-secondary">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </GlassmorphicCard>
  );
};

export default Pagination;
