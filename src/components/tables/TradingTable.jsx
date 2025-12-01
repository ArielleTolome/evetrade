import { useState, useMemo, useCallback } from 'react';

/**
 * Get quality tier based on row data stats
 * Used to color-code rows based on trade quality
 */
function getRowQualityTier(row, stats) {
  if (!stats || !row) return null;

  const profit = row['Net Profit'] || 0;
  const volume = row['Volume'] || 0;
  const margin = (row['Gross Margin'] || 0) / 100;

  // Calculate a simple quality score
  const profitScore = stats.maxProfit > 0 ? profit / stats.maxProfit : 0;
  const volumeScore = stats.maxVolume > 0 ? Math.log10(volume + 1) / Math.log10(stats.maxVolume + 1) : 0;
  const marginScore = margin / 0.5; // Cap at 50% margin for scoring

  const score = (profitScore * 0.5) + (volumeScore * 0.3) + (Math.min(marginScore, 1) * 0.2);

  if (score >= 0.7) return 'excellent';
  if (score >= 0.4) return 'good';
  if (score >= 0.2) return 'fair';
  return null;
}

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
  showQualityIndicators = false,
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

  // Calculate stats for quality indicators
  const qualityStats = useMemo(() => {
    if (!showQualityIndicators || !data || data.length === 0) return null;

    return {
      maxProfit: Math.max(...data.map(t => t['Net Profit'] || 0)),
      maxVolume: Math.max(...data.map(t => t['Volume'] || 0)),
    };
  }, [data, showQualityIndicators]);

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
            {paginatedData.map((row, idx) => {
              const qualityTier = showQualityIndicators ? getRowQualityTier(row, qualityStats) : null;
              const qualityClass = qualityTier ? `quality-${qualityTier}` : '';

              return (
                <tr
                  key={row['Item ID'] || idx}
                  onClick={() => onRowClick?.(row, idx)}
                  className={`${onRowClick ? 'clickable' : ''} ${qualityClass}`}
                >
                  {columns.filter(c => c.visible !== false).map(col => (
                    <td key={col.key} className={col.className || ''}>
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              );
            })}
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

      <style>{`
        .trading-table-wrapper {
          background: rgba(26, 26, 46, 0.3);
          border-radius: 0.75rem;
          border: 1px solid rgba(0, 212, 255, 0.1);
          overflow: hidden;
        }

        .dt-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(22, 33, 62, 0.5);
          border-bottom: 1px solid rgba(0, 212, 255, 0.1);
        }

        .dt-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(22, 33, 62, 0.3);
          border-top: 1px solid rgba(0, 212, 255, 0.1);
        }

        .dt-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .dt-search input {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: rgba(10, 10, 15, 0.5);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #e2e8f0;
          font-size: 0.875rem;
          min-width: 200px;
        }

        .dt-search input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 1px #00d4ff;
        }

        .dt-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .dt-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          color: #00d4ff;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dt-button:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.5);
        }

        .table-scroll-wrapper {
          overflow-x: auto;
        }

        table.trading-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        table.trading-table thead th {
          background: rgba(22, 33, 62, 0.8);
          color: #00d4ff;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
        }

        table.trading-table thead th:hover {
          background: rgba(22, 33, 62, 1);
        }

        table.trading-table thead th .sort-indicator {
          color: #ffd700;
        }

        table.trading-table tbody td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(0, 212, 255, 0.05);
          color: #e2e8f0;
        }

        table.trading-table tbody tr:hover td {
          background: rgba(0, 212, 255, 0.05);
        }

        table.trading-table tbody tr.clickable {
          cursor: pointer;
        }

        /* Quality Indicator Styles */
        table.trading-table tbody tr.quality-excellent td {
          background: rgba(250, 204, 21, 0.08);
          border-left: 3px solid rgba(250, 204, 21, 0.6);
        }

        table.trading-table tbody tr.quality-excellent:hover td {
          background: rgba(250, 204, 21, 0.15);
        }

        table.trading-table tbody tr.quality-good td {
          background: rgba(74, 222, 128, 0.06);
          border-left: 3px solid rgba(74, 222, 128, 0.5);
        }

        table.trading-table tbody tr.quality-good:hover td {
          background: rgba(74, 222, 128, 0.12);
        }

        table.trading-table tbody tr.quality-fair td {
          background: rgba(0, 212, 255, 0.04);
          border-left: 3px solid rgba(0, 212, 255, 0.3);
        }

        table.trading-table tbody tr.quality-fair:hover td {
          background: rgba(0, 212, 255, 0.08);
        }

        table.trading-table tbody tr td:first-child {
          border-left: 3px solid transparent;
        }

        .dt-info {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .dt-length {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .dt-length select {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          background: rgba(10, 10, 15, 0.5);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #e2e8f0;
          margin: 0 0.25rem;
        }

        .dt-paging {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .dt-paging button {
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dt-paging button:hover:not(:disabled) {
          background: rgba(0, 212, 255, 0.2);
        }

        .dt-paging button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          color: #94a3b8;
          font-size: 0.875rem;
          padding: 0 0.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dt-top,
          .dt-bottom {
            flex-direction: column;
            align-items: stretch;
          }

          .dt-search input {
            width: 100%;
          }

          .dt-controls {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default TradingTable;
