import { useState, useCallback, useMemo } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

// Export formats with detailed configuration
const EXPORT_FORMATS = [
  {
    id: 'csv',
    name: 'CSV',
    ext: '.csv',
    icon: '📊',
    desc: 'Comma-separated values for Excel/Sheets',
    mimeType: 'text/csv',
  },
  {
    id: 'excel',
    name: 'Excel CSV',
    ext: '.csv',
    icon: '📈',
    desc: 'Excel-optimized CSV with UTF-8 BOM',
    mimeType: 'text/csv',
  },
  {
    id: 'tsv',
    name: 'TSV',
    ext: '.tsv',
    icon: '📋',
    desc: 'Tab-separated values',
    mimeType: 'text/tab-separated-values',
  },
  {
    id: 'json',
    name: 'JSON',
    ext: '.json',
    icon: '🔧',
    desc: 'Full data with metadata',
    mimeType: 'application/json',
  },
  {
    id: 'gsheets',
    name: 'Google Sheets',
    ext: null,
    icon: '📑',
    desc: 'Copy-paste ready for Sheets',
    mimeType: null,
  },
];

// Export templates
const EXPORT_TEMPLATES = {
  basic: {
    name: 'Basic',
    columns: ['Item', 'Buy Price', 'Sell Price', 'Volume', 'Net Profit'],
  },
  detailed: {
    name: 'Detailed',
    columns: ['Item', 'Buy Price', 'Sell Price', 'Volume', 'Buy Total', 'Sell Total', 'Gross Profit', 'Net Profit', 'Gross Margin', 'ROI'],
  },
  accounting: {
    name: 'Accounting',
    columns: ['Item', 'Volume', 'Buy Total', 'Buy Fee', 'Sell Total', 'Sell Fee', 'Sales Tax', 'Net Profit', 'ROI'],
  },
  trading: {
    name: 'Station Trading',
    columns: ['Item', 'Buy Price', 'Sell Price', 'Profit per Unit', 'Volume', 'Net Profit', 'Gross Margin', 'Turnover'],
  },
  hauling: {
    name: 'Hauling',
    columns: ['Item', 'Volume', 'Buy Location', 'Sell Location', 'Buy Price', 'Sell Price', 'Profit per Unit', 'Total Profit', 'ISK per m³'],
  },
};

/**
 * Enhanced Export Component
 * Advanced export functionality with multiple formats, templates, and calculated fields
 */
export function EnhancedExport({
  data = [],
  defaultColumns = [],
  filename = 'evetrade-export',
  onExport,
  showTemplates = true,
  showDateRange = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [customColumns, setCustomColumns] = useState(defaultColumns);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [formatNumbers, setFormatNumbers] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [copySuccess, setCopySuccess] = useState(false);

  // Apply template
  const applyTemplate = useCallback((templateId) => {
    setSelectedTemplate(templateId);
    const template = EXPORT_TEMPLATES[templateId];
    if (template && defaultColumns.length > 0) {
      setCustomColumns(
        defaultColumns.map(col => ({
          ...col,
          export: template.columns.includes(col.key),
        }))
      );
    }
  }, [defaultColumns]);

  // Toggle column
  const toggleColumn = useCallback((key) => {
    setCustomColumns(prev => prev.map(col =>
      col.key === key ? { ...col, export: !col.export } : col
    ));
    setSelectedTemplate('custom');
  }, []);

  // Toggle all columns
  const toggleAllColumns = useCallback((checked) => {
    setCustomColumns(prev => prev.map(col => ({ ...col, export: checked })));
    setSelectedTemplate('custom');
  }, []);

  // Filter data by date range
  const filteredData = useMemo(() => {
    if (!showDateRange || !dateRange.start || !dateRange.end) {
      return data;
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    return data.filter(row => {
      const rowDate = row.date ? new Date(row.date) : null;
      return rowDate && rowDate >= startDate && rowDate <= endDate;
    });
  }, [data, dateRange, showDateRange]);

  // Calculate additional fields
  const enrichedData = useMemo(() => {
    return filteredData.map(row => {
      const buyPrice = parseFloat(row['Buy Price']) || 0;
      const sellPrice = parseFloat(row['Sell Price']) || 0;
      const volume = parseFloat(row['Volume']) || 0;
      const buyTotal = parseFloat(row['Buy Total']) || buyPrice * volume;
      const sellTotal = parseFloat(row['Sell Total']) || sellPrice * volume;
      const netProfit = parseFloat(row['Net Profit']) || 0;
      const grossProfit = sellTotal - buyTotal;

      // Calculate fees if not present
      const buyFee = parseFloat(row['Buy Fee']) || buyTotal * 0.03;
      const sellFee = parseFloat(row['Sell Fee']) || sellTotal * 0.03;
      const salesTax = parseFloat(row['Sales Tax']) || sellTotal * 0.025;

      // Calculate margins and ROI
      const grossMargin = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;
      const netMargin = sellTotal > 0 ? (netProfit / sellTotal) * 100 : 0;
      const roi = buyTotal > 0 ? (netProfit / buyTotal) * 100 : 0;

      // Additional metrics
      const profitPerUnit = volume > 0 ? netProfit / volume : 0;
      const volumeM3 = parseFloat(row['Volume m³']) || 0;
      const iskPerM3 = volumeM3 > 0 ? netProfit / volumeM3 : 0;
      const turnover = buyPrice > 0 ? sellPrice / buyPrice : 0;

      return {
        ...row,
        'Buy Total': buyTotal,
        'Sell Total': sellTotal,
        'Buy Fee': buyFee,
        'Sell Fee': sellFee,
        'Sales Tax': salesTax,
        'Gross Profit': grossProfit,
        'Net Profit': netProfit,
        'Gross Margin': grossMargin,
        'Net Margin': netMargin,
        'ROI': roi,
        'Profit per Unit': profitPerUnit,
        'ISK per m³': iskPerM3,
        'Turnover': turnover,
      };
    });
  }, [filteredData]);

  // Format value based on column type
  const formatValue = useCallback((value, column) => {
    if (value === null || value === undefined) return '';
    if (!formatNumbers) return value;

    const key = column.key || column;

    // ISK values
    if (key.includes('Price') || key.includes('ISK') || key.includes('Total') || key.includes('Profit') || key.includes('Fee') || key.includes('Tax')) {
      return typeof value === 'number' ? value.toFixed(2) : value;
    }

    // Percentages
    if (key.includes('Margin') || key === 'ROI') {
      return typeof value === 'number' ? value.toFixed(2) + '%' : value;
    }

    // Volume/Quantity
    if (key === 'Volume' || key === 'Quantity') {
      return typeof value === 'number' ? Math.round(value) : value;
    }

    // Turnover ratio
    if (key === 'Turnover') {
      return typeof value === 'number' ? value.toFixed(2) + 'x' : value;
    }

    return value;
  }, [formatNumbers]);

  // Generate export content
  const generateExport = useCallback(() => {
    const exportColumns = customColumns.filter(c => c.export);
    const format = EXPORT_FORMATS.find(f => f.id === selectedFormat);

    switch (selectedFormat) {
      case 'csv':
      case 'excel': {
        const headers = exportColumns.map(c => c.label).join(',');
        const rows = enrichedData.map(row =>
          exportColumns.map(col => {
            const val = formatValue(row[col.key], col);
            // Escape commas and quotes in CSV
            const strVal = String(val);
            return strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')
              ? `"${strVal.replace(/"/g, '""')}"`
              : strVal;
          }).join(',')
        );

        let content = includeHeaders ? [headers, ...rows].join('\n') : rows.join('\n');

        // Add UTF-8 BOM for Excel
        if (selectedFormat === 'excel') {
          content = '\uFEFF' + content;
        }

        return content;
      }

      case 'tsv': {
        const headers = exportColumns.map(c => c.label).join('\t');
        const rows = enrichedData.map(row =>
          exportColumns.map(col => formatValue(row[col.key], col)).join('\t')
        );
        return includeHeaders ? [headers, ...rows].join('\n') : rows.join('\n');
      }

      case 'json': {
        const exportData = enrichedData.map(row => {
          const obj = {};
          exportColumns.forEach(col => {
            obj[col.key] = row[col.key];
          });
          return obj;
        });

        const jsonData = {
          data: exportData,
        };

        if (includeMetadata) {
          jsonData.metadata = {
            exportedAt: new Date().toISOString(),
            totalItems: enrichedData.length,
            format: selectedFormat,
            template: selectedTemplate,
            columns: exportColumns.map(c => c.key),
          };

          if (showDateRange && dateRange.start && dateRange.end) {
            jsonData.metadata.dateRange = dateRange;
          }
        }

        return JSON.stringify(jsonData, null, 2);
      }

      case 'gsheets': {
        // Tab-separated for easy paste into Google Sheets
        const headers = exportColumns.map(c => c.label).join('\t');
        const rows = enrichedData.map(row =>
          exportColumns.map(col => formatValue(row[col.key], col)).join('\t')
        );
        return includeHeaders ? [headers, ...rows].join('\n') : rows.join('\n');
      }

      default:
        return '';
    }
  }, [enrichedData, customColumns, selectedFormat, selectedTemplate, includeHeaders, formatValue, includeMetadata, showDateRange, dateRange]);

  // Preview content
  const preview = useMemo(() => {
    if (!showPreview || enrichedData.length === 0) return '';

    const previewData = enrichedData.slice(0, 5);
    const exportColumns = customColumns.filter(c => c.export);

    if (selectedFormat === 'json') {
      const sample = {
        data: previewData.map(row => {
          const obj = {};
          exportColumns.forEach(col => {
            obj[col.key] = row[col.key];
          });
          return obj;
        }),
      };
      return JSON.stringify(sample, null, 2);
    }

    // Generate preview for other formats
    const headers = exportColumns.map(c => c.label).join(selectedFormat === 'tsv' ? '\t' : ',');
    const rows = previewData.map(row =>
      exportColumns.map(col => {
        const val = formatValue(row[col.key], col);
        const strVal = String(val);
        return selectedFormat === 'csv' && (strVal.includes(',') || strVal.includes('"'))
          ? `"${strVal.replace(/"/g, '""')}"`
          : strVal;
      }).join(selectedFormat === 'tsv' ? '\t' : ',')
    );

    return [headers, ...rows].join('\n') + '\n...';
  }, [enrichedData, customColumns, selectedFormat, showPreview, formatValue]);

  // Handle export
  const handleExport = useCallback(async () => {
    const content = generateExport();
    const format = EXPORT_FORMATS.find(f => f.id === selectedFormat);

    // Clipboard export
    if (selectedFormat === 'gsheets' || !format.ext) {
      try {
        await navigator.clipboard.writeText(content);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        onExport?.({
          format: selectedFormat,
          count: enrichedData.length,
          columns: customColumns.filter(c => c.export).length,
        });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
      return;
    }

    // File download
    const blob = new Blob([content], { type: format.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}${format.ext}`;
    a.click();
    URL.revokeObjectURL(url);

    onExport?.({
      format: selectedFormat,
      count: enrichedData.length,
      columns: customColumns.filter(c => c.export).length,
      filename: a.download,
    });

    setIsOpen(false);
  }, [generateExport, selectedFormat, filename, enrichedData, customColumns, onExport]);

  const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat);
  const selectedColumnsCount = customColumns.filter(c => c.export).length;

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={enrichedData.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export ({enrichedData.length})
      </button>

      {/* Export Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-space-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-space-dark border-l border-accent-cyan/20 shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display text-accent-cyan">Enhanced Export</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Export {enrichedData.length} items with advanced formatting
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-text-primary mb-3 block">Export Format</label>
                <div className="grid grid-cols-5 gap-2">
                  {EXPORT_FORMATS.map(format => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-3 text-center rounded-lg border transition-all ${
                        selectedFormat === format.id
                          ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/20'
                          : 'bg-space-black/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/50'
                      }`}
                      title={format.desc}
                    >
                      <div className="text-2xl mb-1">{format.icon}</div>
                      <div className="text-xs font-medium">{format.name}</div>
                    </button>
                  ))}
                </div>
                {selectedFormatInfo && (
                  <p className="text-xs text-text-secondary mt-2">{selectedFormatInfo.desc}</p>
                )}
              </div>

              {/* Template Selection */}
              {showTemplates && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-text-primary mb-3 block">Templates</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(EXPORT_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => applyTemplate(key)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                          selectedTemplate === key
                            ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                            : 'bg-space-black/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/50'
                        }`}
                      >
                        {template.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedTemplate('custom')}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                        selectedTemplate === 'custom'
                          ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                          : 'bg-space-black/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/50'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>
              )}

              {/* Date Range Filter */}
              {showDateRange && (
                <div className="mb-6 p-4 bg-space-black/50 border border-accent-cyan/10 rounded-lg">
                  <label className="text-sm font-medium text-text-primary mb-3 block">Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Column Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-text-primary">
                    Columns ({selectedColumnsCount}/{customColumns.length})
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
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 bg-space-black/50 border border-accent-cyan/10 rounded-lg">
                  {customColumns.map(col => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={col.export}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                      />
                      <span className="text-text-primary">{col.label || col.key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="mb-6 p-4 bg-space-black/50 border border-accent-cyan/10 rounded-lg space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-text-primary">Include column headers</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={formatNumbers}
                    onChange={(e) => setFormatNumbers(e.target.checked)}
                    className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-text-primary">Format numbers (ISK, %, etc.)</span>
                </label>
                {selectedFormat === 'json' && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                    />
                    <span className="text-text-primary">Include metadata</span>
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent-cyan/5 p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                    className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-text-primary">Show preview</span>
                </label>
              </div>

              {/* Preview */}
              {showPreview && preview && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Preview (first 5 rows)
                  </label>
                  <div className="bg-space-black border border-accent-cyan/10 rounded-lg p-4 max-h-64 overflow-auto">
                    <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap break-all">
                      {preview}
                    </pre>
                  </div>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={selectedColumnsCount === 0}
                className="w-full py-3 bg-accent-cyan text-space-black font-bold rounded-lg hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied to Clipboard!
                  </>
                ) : selectedFormat === 'gsheets' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy for Google Sheets
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {selectedFormatInfo?.name}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EnhancedExport;
