import { useState, useMemo, useCallback } from 'react';
import './TradingTable.css';

/**
 * Trading Table Component
 * Custom React table with sorting, pagination, and search
 */
export function TradingTable({
  data = [],
  columns = [],
  onRowClick,
  defaultSort = null,
  pageLength = 25,
  className = '',
  emptyMessage = 'No data available',
}) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(pageLength);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortConfig, setSortConfig] = useState(() => {
    if (defaultSort) {
      return { key: defaultSort.column, direction: defaultSort.direction };
    }
    const defaultCol = columns.find(c => c.defaultSort);
    return defaultCol ? { key: defaultCol.key, direction: 'desc' } : null;
  });

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const value = row[col.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric comparison
      const col = columns.find(c => c.key === sortConfig.key);
      if (col?.type === 'num' || typeof aVal === 'number') {
        const diff = Number(aVal) - Number(bVal);
        return sortConfig.direction === 'asc' ? diff : -diff;
      }

      // String comparison
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle sort click
  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
    setCurrentPage(0);
  }, []);

  // Handle page change
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  // Export to CSV
  const exportCSV = useCallback(() => {
    const headers = columns.map(c => c.label).join(',');
    const rows = sortedData.map(row =>
      columns.map(col => {
        const val = row[col.key];
        // Escape quotes and wrap in quotes if contains comma
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedData, columns]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    const headers = columns.map(c => c.label).join('\t');
    const rows = sortedData.map(row =>
      columns.map(col => String(row[col.key] ?? '')).join('\t')
    );
    const text = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(text);
  }, [sortedData, columns]);

  // Render cell value
  const renderCell = useCallback((row, col) => {
    const value = row[col.key];
    if (col.render) {
      return col.render(value, row);
    }
    return value ?? '';
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="trading-table-wrapper">
        <div className="text-center py-12 text-text-secondary">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`trading-table-wrapper ${className}`}>
      {/* Top Controls */}
      <div className="dt-top">
        <div className="dt-buttons">
          <button type="button" onClick={copyToClipboard} className="dt-button">
            Copy
          </button>
          <button type="button" onClick={exportCSV} className="dt-button">
            CSV
          </button>
        </div>
        <div className="dt-search">
          <input
            type="text"
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-scroll-wrapper">
        <table className="trading-table">
          <thead>
            <tr>
              {columns.filter(c => c.visible !== false).map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`sortable ${sortConfig?.key === col.key ? `sorting_${sortConfig.direction}` : ''}`}
                >
                  {col.label}
                  {sortConfig?.key === col.key && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row['Item ID'] || idx}
                onClick={() => onRowClick?.(row, idx)}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.filter(c => c.visible !== false).map(col => (
                  <td key={col.key} className={col.className || ''}>
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Controls */}
      <div className="dt-bottom">
        <div className="dt-info">
          Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, sortedData.length)} of {sortedData.length} entries
          {searchTerm && ` (filtered from ${data.length} total)`}
        </div>
        <div className="dt-controls">
          <label className="dt-length">
            Show{' '}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <div className="dt-paging">
            <button
              type="button"
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
            >
              «
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              ‹
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => goToPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradingTable;
