import React, { useMemo, useState, useEffect, useRef, createRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import GlassmorphicCard from './GlassmorphicCard';
import Button from './Button';

const DOTS = '...';

const usePagination = ({
  totalItems,
  pageSize,
  siblingCount = 1,
  currentPage,
}) => {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalItems / pageSize);

    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPageCount) {
      return { range: Array.from({ length: totalPageCount }, (_, i) => i + 1), totalPageCount };
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

      return { range: [...leftRange, DOTS, totalPageCount], totalPageCount };
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + i + 1
      );
      return { range: [firstPageIndex, DOTS, ...rightRange], totalPageCount };
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return { range: [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex], totalPageCount };
    }
  }, [totalItems, pageSize, siblingCount, currentPage]);

  return paginationRange || { range: [], totalPageCount: 0 };
};


const Pagination = ({
  currentPage,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
}) => {
  const { range: paginationRange, totalPageCount } = usePagination({ currentPage, totalItems, pageSize });
  const [goToPage, setGoToPage] = useState(currentPage);

  const pageButtonRefs = useMemo(() =>
    Array(paginationRange.length).fill(0).map(() => createRef()),
    [paginationRange.length]
  );

  useEffect(() => {
    setGoToPage(currentPage);
  }, [currentPage]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const onNext = () => onPageChange(currentPage + 1);
  const onPrevious = () => onPageChange(currentPage - 1);

  if (totalPageCount <= 1) {
    return null;
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % paginationRange.length;
      pageButtonRefs[nextIndex]?.current?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + paginationRange.length) % paginationRange.length;
      pageButtonRefs[prevIndex]?.current?.focus();
    }
  };


  return (
    <GlassmorphicCard padding="p-2 sm:p-3">
      <div className="flex flex-col sm:flex-row items-center justify-between text-[#E0E1DD] space-y-3 sm:space-y-0">
        {/* Left side: Item count */}
        <div className="text-sm hidden sm:block">
          {totalItems > 0 ? `Showing ${startItem}-${endItem} of ${totalItems} items` : 'No items'}
        </div>

        {/* Center: Pagination controls */}
        <nav aria-label="Pagination">
          <ul className="flex items-center space-x-1 sm:space-x-2">
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </li>

            {paginationRange.map((pageNumber, index) => {
              if (pageNumber === DOTS) {
                return <li key={index} className="flex items-center px-2 text-[#778DA9]"><MoreHorizontal className="h-5 w-5" /></li>;
              }

              return (
                <li key={index}>
                  <Button
                    ref={pageButtonRefs[index]}
                    variant={pageNumber === currentPage ? 'secondary' : 'ghost'}
                    size="sm"
                    className={pageNumber === currentPage ? 'bg-[#415A77] text-white' : ''}
                    onClick={() => onPageChange(pageNumber)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                  >
                    {pageNumber}
                  </Button>
                </li>
              );
            })}

            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={currentPage === totalPageCount}
                aria-label="Go to next page"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </li>
          </ul>
        </nav>

        {/* Right side: Page size and Go to page */}
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2 text-sm">
            <label htmlFor="page-size" className="sr-only sm:not-sr-only">Per Page:</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#1B263B] border border-[#415A77] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              aria-label="Select page size"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
           <div className="hidden md:flex items-center space-x-2 text-sm">
            <label htmlFor="go-to-page">Go to:</label>
            <input
              id="go-to-page"
              type="number"
              min="1"
              max={totalPageCount}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onBlur={() => {
                const page = parseInt(goToPage, 10);
                if (page >= 1 && page <= totalPageCount) {
                  onPageChange(page);
                } else {
                  setGoToPage(currentPage);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(goToPage, 10);
                   if (page >= 1 && page <= totalPageCount) {
                    onPageChange(page);
                  }
                }
              }}
              className="w-16 bg-[#1B263B] border border-[#415A77] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              aria-label="Go to page"
            />
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
};

export default Pagination;
