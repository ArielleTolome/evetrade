import { useEffect, useRef, useCallback } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import JSZip from 'jszip';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize DataTables
DataTable.use(DT);

// Set up pdfMake fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// Make JSZip available globally for Excel export
window.JSZip = JSZip;

/**
 * Trading Table Component
 * Full-featured DataTable with export buttons
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
  const tableRef = useRef(null);

  // Build DataTables column configuration
  const tableColumns = columns.map((col) => ({
    data: col.key,
    title: col.label,
    className: col.className || '',
    visible: col.visible !== false,
    render: col.render || null,
    type: col.type || 'string',
  }));

  // Find default sort column index
  const sortColumnIndex = defaultSort
    ? columns.findIndex((c) => c.key === defaultSort.column)
    : columns.findIndex((c) => c.defaultSort);
  const sortDirection = defaultSort?.direction || 'desc';

  // DataTables options
  const options = {
    dom: '<"dt-top"Bf>rt<"dt-bottom"lip>',
    buttons: [
      {
        extend: 'collection',
        text: '📥 Export',
        className: 'dt-button-export',
        buttons: [
          {
            extend: 'copy',
            text: '📋 Copy',
            className: 'dt-button-copy',
            exportOptions: {
              columns: ':visible',
            },
          },
          {
            extend: 'csv',
            text: '📄 CSV',
            className: 'dt-button-csv',
            exportOptions: {
              columns: ':visible',
            },
          },
          {
            extend: 'excel',
            text: '📊 Excel',
            className: 'dt-button-excel',
            exportOptions: {
              columns: ':visible',
            },
          },
          {
            extend: 'pdf',
            text: '📕 PDF',
            className: 'dt-button-pdf',
            orientation: 'landscape',
            pageSize: 'A4',
            exportOptions: {
              columns: ':visible',
            },
          },
          {
            extend: 'print',
            text: '🖨️ Print',
            className: 'dt-button-print',
            exportOptions: {
              columns: ':visible',
            },
          },
        ],
      },
      {
        extend: 'colvis',
        text: '👁️ Columns',
        className: 'dt-button-colvis',
      },
    ],
    order: sortColumnIndex >= 0 ? [[sortColumnIndex, sortDirection]] : [],
    pageLength,
    lengthMenu: [10, 25, 50, 100],
    scrollX: true,
    responsive: false,
    language: {
      search: '',
      searchPlaceholder: 'Search results...',
      emptyTable: emptyMessage,
      info: 'Showing _START_ to _END_ of _TOTAL_ entries',
      infoEmpty: 'No entries',
      infoFiltered: '(filtered from _MAX_)',
      lengthMenu: 'Show _MENU_',
      paginate: {
        first: '«',
        last: '»',
        next: '›',
        previous: '‹',
      },
    },
    drawCallback: function () {
      // Apply custom styling after draw
      const wrapper = tableRef.current?.dt?.table()?.container();
      if (wrapper) {
        wrapper.classList.add('dt-styled');
      }
    },
  };

  // Handle row click
  const handleRowClick = useCallback(
    (e) => {
      if (!onRowClick) return;

      const row = e.target.closest('tr');
      if (!row || row.parentElement.tagName === 'THEAD') return;

      const rowIndex = row.rowIndex - 1; // Subtract 1 for header
      if (rowIndex >= 0 && data[rowIndex]) {
        onRowClick(data[rowIndex], rowIndex);
      }
    },
    [data, onRowClick]
  );

  return (
    <div className={`trading-table-wrapper ${className}`}>
      <DataTable
        ref={tableRef}
        data={data}
        columns={tableColumns}
        options={options}
        className="trading-table display nowrap"
        onClick={handleRowClick}
      />

      <style>{`
        .trading-table-wrapper {
          background: rgba(26, 26, 46, 0.3);
          border-radius: 0.75rem;
          border: 1px solid rgba(0, 212, 255, 0.1);
          overflow: hidden;
        }

        .trading-table-wrapper .dt-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(22, 33, 62, 0.5);
          border-bottom: 1px solid rgba(0, 212, 255, 0.1);
        }

        .trading-table-wrapper .dt-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(22, 33, 62, 0.3);
          border-top: 1px solid rgba(0, 212, 255, 0.1);
        }

        .trading-table-wrapper .dt-search {
          display: flex;
          align-items: center;
        }

        .trading-table-wrapper .dt-search input {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: rgba(10, 10, 15, 0.5);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #e2e8f0;
          font-size: 0.875rem;
          min-width: 200px;
        }

        .trading-table-wrapper .dt-search input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 1px #00d4ff;
        }

        .trading-table-wrapper .dt-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .trading-table-wrapper .dt-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          color: #00d4ff;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .trading-table-wrapper .dt-button:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.5);
        }

        .trading-table-wrapper .dt-button-collection {
          position: relative;
        }

        .trading-table-wrapper .dt-button-collection .dt-button-collection-items {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 50;
          background: #1a1a2e;
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 0.5rem;
          padding: 0.5rem;
          min-width: 150px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }

        .trading-table-wrapper .dt-button-collection .dt-button-collection-items .dt-button {
          display: block;
          width: 100%;
          text-align: left;
          margin-bottom: 0.25rem;
        }

        .trading-table-wrapper table.trading-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .trading-table-wrapper table.trading-table thead th {
          background: rgba(22, 33, 62, 0.8);
          color: #00d4ff;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
          white-space: nowrap;
        }

        .trading-table-wrapper table.trading-table thead th.sorting,
        .trading-table-wrapper table.trading-table thead th.sorting_asc,
        .trading-table-wrapper table.trading-table thead th.sorting_desc {
          cursor: pointer;
        }

        .trading-table-wrapper table.trading-table thead th.sorting_asc::after {
          content: ' ↑';
          color: #ffd700;
        }

        .trading-table-wrapper table.trading-table thead th.sorting_desc::after {
          content: ' ↓';
          color: #ffd700;
        }

        .trading-table-wrapper table.trading-table tbody td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(0, 212, 255, 0.05);
          color: #e2e8f0;
        }

        .trading-table-wrapper table.trading-table tbody tr:hover td {
          background: rgba(0, 212, 255, 0.05);
        }

        .trading-table-wrapper table.trading-table tbody tr {
          cursor: ${onRowClick ? 'pointer' : 'default'};
        }

        .trading-table-wrapper .dt-info {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .trading-table-wrapper .dt-length select {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          background: rgba(10, 10, 15, 0.5);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #e2e8f0;
          margin: 0 0.25rem;
        }

        .trading-table-wrapper .dt-paging {
          display: flex;
          gap: 0.25rem;
        }

        .trading-table-wrapper .dt-paging button {
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .trading-table-wrapper .dt-paging button:hover:not(:disabled) {
          background: rgba(0, 212, 255, 0.2);
        }

        .trading-table-wrapper .dt-paging button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .trading-table-wrapper .dt-paging button.current {
          background: #00d4ff;
          color: #0a0a0f;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .trading-table-wrapper .dt-top,
          .trading-table-wrapper .dt-bottom {
            flex-direction: column;
            align-items: stretch;
          }

          .trading-table-wrapper .dt-search input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default TradingTable;
