import React, { useState } from 'react';
import Pagination from './Pagination';

const PaginationExample = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 500;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="p-4 bg-space-black min-h-screen">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1); // Reset to first page when page size changes
        }}
        totalItems={totalItems}
      />
    </div>
  );
};

export default PaginationExample;
