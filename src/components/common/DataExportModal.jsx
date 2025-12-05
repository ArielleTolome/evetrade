import React from 'react';
import Modal from './Modal';

const ExportModal = ({
  isOpen,
  onClose,
  options,
  onOptionChange,
  onExport,
  previewData,
  columns,
}) => {
  const {
    format = 'csv',
    rowSelection = 'all',
    pdfOrientation = 'portrait',
    pdfTitle = '',
    pdfIncludeTimestamp = true,
  } = options;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="lg">
      <Modal.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Options */}
          <div>
            {/* Format Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-text-secondary mb-2 block">Export Format</label>
              <select
                value={format}
                onChange={(e) => onOptionChange('format', e.target.value)}
                className="w-full bg-space-dark/50 border border-white/10 rounded-lg px-3 py-2 text-text-primary"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
                <option value="clipboard">Clipboard (Tab-separated)</option>
              </select>
            </div>

            {/* Row Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-text-secondary mb-2 block">Rows</label>
              <select
                value={rowSelection}
                onChange={(e) => onOptionChange('rowSelection', e.target.value)}
                className="w-full bg-space-dark/50 border border-white/10 rounded-lg px-3 py-2 text-text-primary"
              >
                <option value="all">All rows</option>
                <option value="selected">Selected rows only</option>
                <option value="currentPage">Current page only</option>
              </select>
            </div>

            {/* PDF Options */}
            {format === 'pdf' && (
              <div className="p-4 border border-white/10 rounded-lg">
                <h4 className="text-md font-bold mb-2 text-text-primary">PDF Options</h4>
                <div className="mb-2">
                  <label className="text-sm text-text-secondary mb-1 block">Orientation</label>
                  <select
                    value={pdfOrientation}
                    onChange={(e) => onOptionChange('pdfOrientation', e.target.value)}
                    className="w-full bg-space-dark/50 border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="text-sm text-text-secondary mb-1 block">Title</label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => onOptionChange('pdfTitle', e.target.value)}
                    className="w-full bg-space-dark/50 border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                    placeholder="Optional title for the document"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdfIncludeTimestamp}
                    onChange={(e) => onOptionChange('pdfIncludeTimestamp', e.target.checked)}
                    className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                  />
                  <span className="text-text-secondary">Include timestamp</span>
                </label>
              </div>
            )}
          </div>

          {/* Right Column: Columns & Preview */}
          <div>
            {/* Column Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-text-secondary mb-2 block">Columns</label>
              <div className="max-h-48 overflow-y-auto bg-space-dark/50 border border-white/10 rounded-lg p-2 space-y-1">
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded">
                    <input
                      type="checkbox"
                      checked={col.export}
                      onChange={() => onOptionChange('toggleColumn', col.key)}
                      className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
                    />
                    <span className="text-text-primary">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">Preview (First 5 Rows)</label>
              <div className="bg-space-black/50 border border-white/10 rounded-lg p-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      {columns.filter(c => c.export).map(col => (
                        <th key={col.key} className="p-1 text-text-secondary font-semibold">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-white/5">
                        {columns.filter(c => c.export).map(col => (
                          <td key={col.key} className="p-1 text-text-primary whitespace-nowrap">{row[col.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-space-dark/50 border border-white/10 rounded-lg text-text-primary hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-accent-cyan text-space-black font-bold rounded-lg hover:bg-accent-cyan/90"
        >
          Export
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportModal;