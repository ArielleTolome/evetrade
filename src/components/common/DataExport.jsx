import React, { useState, useMemo } from 'react';
import { useModal } from './Modal';
import ExportModal from './DataExportModal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from './ToastProvider';

const DataExport = ({
  data = [],
  columns = [],
  filename = 'export',
  selectedRows = [],
  onExportComplete,
}) => {
  const { isOpen, open, close } = useModal();
  const [exportColumns, setExportColumns] = useState(columns.map(c => ({ ...c, export: true })));
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    rowSelection: 'all',
    pdfOrientation: 'portrait',
    pdfTitle: '',
    pdfIncludeTimestamp: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleOptionChange = (key, value) => {
    if (key === 'toggleColumn') {
      setExportColumns(prev =>
        prev.map(col => (col.key === value ? { ...col, export: !col.export } : col))
      );
    } else {
      setExportOptions(prev => ({ ...prev, [key]: value }));
    }
  };

  const getDataToExport = () => {
    switch (exportOptions.rowSelection) {
      case 'selected':
        return selectedRows;
      case 'currentPage':
        return data;
      case 'all':
      default:
        return data;
    }
  };

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExport = async () => {
    setIsLoading(true);
    close();

    const progressTimeout = setTimeout(() => {
      toast.info('Exporting data...', { duration: 3000 });
    }, 500);


    const dataToExport = getDataToExport();
    const activeColumns = exportColumns.filter(c => c.export);
    const headers = activeColumns.map(c => c.label);
    const body = dataToExport.map(row => activeColumns.map(col => row[col.key]));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (exportOptions.format) {
        case 'pdf': {
          const doc = new jsPDF(exportOptions.pdfOrientation, 'pt', 'a4');
          if (exportOptions.pdfTitle) doc.text(exportOptions.pdfTitle, 40, 40);
          if (exportOptions.pdfIncludeTimestamp) {
            doc.setFontSize(10);
            doc.text(new Date().toLocaleString(), 40, 50);
          }
          doc.autoTable({ head: [headers], body });
          doc.save(`${filename}.pdf`);
          break;
        }

        case 'xlsx': {
          const ws = XLSX.utils.aoa_to_sheet([headers, ...body]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          XLSX.writeFile(wb, `${filename}.xlsx`);
          break;
        }

        case 'json': {
          const json = JSON.stringify(dataToExport, null, 2);
          const blobJson = new Blob([json], { type: 'application/json' });
          const urlJson = URL.createObjectURL(blobJson);
          const aJson = document.createElement('a');
          aJson.href = urlJson;
          aJson.download = `${filename}.json`;
          aJson.click();
          URL.revokeObjectURL(urlJson);
          break;
        }

        case 'clipboard': {
          const tsv = [
            headers.join('\t'),
            ...body.map(row => row.map(val => String(val).replace(/\t/g, ' ')).join('\t'))
          ].join('\n');
          await navigator.clipboard.writeText(tsv);
          toast.success('Data copied to clipboard!');
          break;
        }

        case 'csv':
        default: {
          const csv = [
            headers.map(escapeCsvValue).join(','),
            ...body.map(row => row.map(escapeCsvValue).join(','))
          ].join('\n');
          const blobCsv = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const urlCsv = URL.createObjectURL(blobCsv);
          const aCsv = document.createElement('a');
          aCsv.href = urlCsv;
          aCsv.download = `${filename}.csv`;
          aCsv.click();
          URL.revokeObjectURL(urlCsv);
          break;
        }
      }
      if (exportOptions.format !== 'clipboard') {
        toast.success(`Successfully exported ${filename}.${exportOptions.format}`);
      }
      if (onExportComplete) onExportComplete({ success: true, format: exportOptions.format });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
      if (onExportComplete) onExportComplete({ success: false, error });
    } finally {
      clearTimeout(progressTimeout);
      setIsLoading(false);
    }
  };

  const previewData = useMemo(() => data.slice(0, 5), [data]);

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-sm"
        disabled={data.length === 0 || isLoading}
      >
        {isLoading ? 'Exporting...' : `Export (${data.length})`}
      </button>

      <ExportModal
        isOpen={isOpen}
        onClose={close}
        options={exportOptions}
        onOptionChange={handleOptionChange}
        onExport={handleExport}
        previewData={previewData}
        columns={exportColumns}
      />
    </>
  );
};

export default DataExport;