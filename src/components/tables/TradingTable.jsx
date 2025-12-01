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
      <div className="bg-space-dark/30 rounded-xl border border-accent-cyan/10 overflow-hidden">
        <div className="text-center py-12 text-text-secondary">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-space-dark/30 rounded-xl border border-accent-cyan/10 overflow-hidden flex flex-col ${className}`}>
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 bg-space-mid/50 border-b border-accent-cyan/10">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium transition-all hover:bg-accent-cyan/20 hover:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium transition-all hover:bg-accent-cyan/20 hover:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          >
            CSV
          </button>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full sm:min-w-[240px] px-4 py-2 rounded-lg bg-space-black/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-text-secondary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-left">
          <thead>
            <tr>
              {columns.filter(c => c.visible !== false).map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`
                    bg-space-mid/80 text-accent-cyan font-display font-semibold
                    px-4 py-3 border-b border-accent-cyan/20
                    whitespace-nowrap cursor-pointer select-none
                    hover:bg-space-mid transition-colors
                    ${sortConfig?.key === col.key ? 'text-accent-cyan' : 'text-accent-cyan/80'}
                  `}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig?.key === col.key && (
                      <span className="text-accent-gold text-xs">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-cyan/5">
            {paginatedData.map((row, idx) => {
              const qualityTier = showQualityIndicators ? getRowQualityTier(row, qualityStats) : null;

              // Tailwind classes for quality tiers
              const qualityClasses = {
                excellent: 'bg-yellow-400/10 border-l-2 border-yellow-400/60 hover:bg-yellow-400/15',
                good: 'bg-green-400/8 border-l-2 border-green-400/50 hover:bg-green-400/12',
                fair: 'bg-cyan-400/5 border-l-2 border-cyan-400/30 hover:bg-cyan-400/10',
              };

              return (
                <tr
                  key={row['Item ID'] || idx}
                  onClick={() => onRowClick?.(row, idx)}
                  className={`
                    transition-colors
                    ${qualityTier ? qualityClasses[qualityTier] : 'hover:bg-accent-cyan/5'}
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.filter(c => c.visible !== false).map(col => (
                    <td key={col.key} className={`px-4 py-3 text-text-primary ${col.className || ''}`}>
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
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 bg-space-mid/30 border-t border-accent-cyan/10 text-sm text-text-secondary">
        <div>
          Showing <span className="text-text-primary font-medium">{sortedData.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span> to <span className="text-text-primary font-medium">{Math.min((currentPage + 1) * itemsPerPage, sortedData.length)}</span> of <span className="text-text-primary font-medium">{sortedData.length}</span> entries
          {searchTerm && ` (filtered from ${data.length} total)`}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            Show
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="px-2 py-1 rounded bg-space-black/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              «
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="px-2 text-text-primary">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => goToPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
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
