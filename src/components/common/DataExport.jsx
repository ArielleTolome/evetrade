import { useState, useCallback, useMemo } from 'react';

const EXPORT_FORMATS = [
  { id: 'csv', name: 'CSV', ext: '.csv', icon: '📊', desc: 'Spreadsheet compatible' },
  { id: 'json', name: 'JSON', ext: '.json', icon: '🔧', desc: 'Full data with metadata' },
  { id: 'tsv', name: 'TSV', ext: '.tsv', icon: '📋', desc: 'Tab separated' },
  { id: 'markdown', name: 'Markdown', ext: '.md', icon: '📝', desc: 'Table format' },
  { id: 'multibuy', name: 'EVE Multibuy', ext: '.txt', icon: '🛒', desc: 'In-game import' },
  { id: 'contract', name: 'Contract', ext: '.txt', icon: '📜', desc: 'Contract pricing' },
  { id: 'clipboard', name: 'Clipboard', ext: null, icon: '📎', desc: 'Copy to clipboard' },
];

const DEFAULT_COLUMNS = [
  { key: 'Item', label: 'Item', export: true },
  { key: 'Buy Price', label: 'Buy Price', export: true, format: 'isk' },
  { key: 'Sell Price', label: 'Sell Price', export: true, format: 'isk' },
  { key: 'Volume', label: 'Volume', export: true, format: 'number' },
  { key: 'Profit per Unit', label: 'Profit/Unit', export: true, format: 'isk' },
  { key: 'Net Profit', label: 'Net Profit', export: true, format: 'isk' },
  { key: 'Gross Margin', label: 'Margin', export: true, format: 'percent' },
];

/**
 * Generate export data in specified format
 */
function generateExport(data, columns, format, options = {}) {
  const { includeHeaders = true, formatNumbers = true } = options;

  const exportColumns = columns.filter(c => c.export);

  // Format value based on column type
  const formatValue = (value, col) => {
    if (!formatNumbers) return value;
    switch (col.format) {
      case 'isk': return typeof value === 'number' ? value.toFixed(2) : value;
      case 'percent': return typeof value === 'number' ? (value).toFixed(2) + '%' : value;
      case 'number': return typeof value === 'number' ? Math.round(value) : value;
      default: return value;
    }
  };

  switch (format) {
    case 'csv': {
      const headers = exportColumns.map(c => c.label).join(',');
      const rows = data.map(row =>
        exportColumns.map(col => {
          const val = formatValue(row[col.key], col);
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      );
      return includeHeaders ? [headers, ...rows].join('\n') : rows.join('\n');
    }

    case 'tsv': {
      const headers = exportColumns.map(c => c.label).join('\t');
      const rows = data.map(row =>
        exportColumns.map(col => formatValue(row[col.key], col)).join('\t')
      );
      return includeHeaders ? [headers, ...rows].join('\n') : rows.join('\n');
    }

    case 'json': {
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        totalItems: data.length,
        data: data.map(row => {
          const obj = {};
          exportColumns.forEach(col => {
            obj[col.key] = row[col.key];
          });
          return obj;
        }),
      }, null, 2);
    }

    case 'markdown': {
      const headers = '| ' + exportColumns.map(c => c.label).join(' | ') + ' |';
      const separator = '| ' + exportColumns.map(() => '---').join(' | ') + ' |';
      const rows = data.map(row =>
        '| ' + exportColumns.map(col => formatValue(row[col.key], col)).join(' | ') + ' |'
      );
      return [headers, separator, ...rows].join('\n');
    }

    case 'multibuy': {
      return data.map(row => `${row['Item']} x ${row['Volume'] || 1}`).join('\n');
    }

    case 'contract': {
      return data.map(row =>
        `${row['Item']}\t${row['Sell Price'] || 0}\t${row['Volume'] || 1}`
      ).join('\n');
    }

    default:
      return '';
  }
}

export function DataExport({
  data = [],
  columns = DEFAULT_COLUMNS,
  filename = 'evetrade-export',
  onExport,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [exportColumns, setExportColumns] = useState(columns);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [formatNumbers, setFormatNumbers] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate preview of export (first 5 rows)
  const preview = useMemo(() => {
    if (!showPreview || data.length === 0) return '';
    const previewData = data.slice(0, 5);
    const content = generateExport(previewData, exportColumns, selectedFormat, {
      includeHeaders,
      formatNumbers,
    });
    const lines = content.split('\n');
    const truncated = lines.slice(0, 10).join('\n');
    return truncated + (lines.length > 10 ? '\n...' : '');
  }, [data, exportColumns, selectedFormat, includeHeaders, formatNumbers, showPreview]);

  // Toggle column export
  const toggleColumn = useCallback((key) => {
    setExportColumns(prev => prev.map(col =>
      col.key === key ? { ...col, export: !col.export } : col
    ));
  }, []);

  // Select/deselect all columns
  const toggleAllColumns = useCallback((checked) => {
    setExportColumns(prev => prev.map(col => ({ ...col, export: checked })));
  }, []);

  // Perform export
  const handleExport = useCallback(async () => {
    const format = EXPORT_FORMATS.find(f => f.id === selectedFormat);
    const content = generateExport(data, exportColumns, selectedFormat, {
      includeHeaders,
      formatNumbers,
    });

    if (selectedFormat === 'clipboard') {
      try {
        await navigator.clipboard.writeText(content);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        onExport?.({ format: 'clipboard', count: data.length });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
      return;
    }

    // Download file
    const blob = new Blob([content], {
      type: selectedFormat === 'json' ? 'application/json' : 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}${format.ext}`;
    a.click();
    URL.revokeObjectURL(url);

    onExport?.({ format: selectedFormat, count: data.length, filename: a.download });
    setIsOpen(false);
  }, [data, exportColumns, selectedFormat, includeHeaders, formatNumbers, filename, onExport]);

  const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat);
  const selectedColumnsCount = exportColumns.filter(c => c.export).length;

  return (
    <div className="relative">
      {/* Export button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-sm"
        disabled={data.length === 0}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export ({data.length})
      </button>

      {/* Export panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-96 bg-space-dark border border-accent-cyan/20 rounded-xl shadow-xl z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display text-sm text-accent-cyan">Export Data</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Format selection */}
              <div className="mb-4">
                <label className="text-xs text-text-secondary mb-2 block">Format</label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPORT_FORMATS.map(format => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-2 text-center rounded-lg border transition-colors ${
                        selectedFormat === format.id
                          ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                          : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/50'
                      }`}
                      title={format.desc}
                    >
                      <div className="text-lg">{format.icon}</div>
                      <div className="text-xs mt-1">{format.name}</div>
                    </button>
                  ))}
                </div>
                {selectedFormatInfo && (
                  <p className="text-xs text-text-secondary mt-2">{selectedFormatInfo.desc}</p>
                )}
              </div>

              {/* Column selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-text-secondary">
                    Columns ({selectedColumnsCount}/{exportColumns.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAllColumns(true)}
                      className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-text-secondary">|</span>
                    <button
                      onClick={() => toggleAllColumns(false)}
                      className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto border border-accent-cyan/10 rounded-lg p-2">
                  {exportColumns.map(col => (
                    <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={col.export}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                      />
                      <span className="text-text-primary">{col.label}</span>
                      {col.format && (
                        <span className="text-xs text-text-secondary ml-auto">{col.format}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="mb-4 space-y-2 border border-accent-cyan/10 rounded-lg p-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-text-secondary">Include headers</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={formatNumbers}
                    onChange={(e) => setFormatNumbers(e.target.checked)}
                    className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-text-secondary">Format numbers</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                    className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-text-secondary">Show preview</span>
                </label>
              </div>

              {/* Preview */}
              {showPreview && preview && (
                <div className="mb-4">
                  <label className="text-xs text-text-secondary mb-2 block">Preview (first 5 rows)</label>
                  <div className="bg-space-black/50 border border-accent-cyan/10 rounded-lg p-2 max-h-40 overflow-auto">
                    <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap break-all">
                      {preview}
                    </pre>
                  </div>
                </div>
              )}

              {/* Export button */}
              <button
                onClick={handleExport}
                disabled={selectedColumnsCount === 0}
                className="w-full py-2 bg-accent-cyan text-space-black font-medium rounded-lg hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : selectedFormat === 'clipboard' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {selectedFormatInfo?.name}
                  </>
                )}
              </button>

              {/* Info footer */}
              <div className="mt-3 text-xs text-text-secondary text-center">
                Exporting {data.length} row{data.length !== 1 ? 's' : ''} with {selectedColumnsCount} column{selectedColumnsCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { generateExport, EXPORT_FORMATS };
export default DataExport;
