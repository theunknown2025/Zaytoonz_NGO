"use client";

import { useState } from "react";
import {
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";

export interface ExtractableColumn {
  key: string;
  label: string;
}

export interface DataExtractorProps<T = any> {
  data: T[];
  selectedItems: Set<string>;
  isOpen: boolean;
  onClose: () => void;
  availableColumns: ExtractableColumn[];
  defaultSelectedColumns?: string[];
  filename: string;
  title: string;
  itemType: string; // e.g., "opportunities", "NGOs", etc.
}

export default function DataExtractor<T extends { id: string }>({
  data,
  selectedItems,
  isOpen,
  onClose,
  availableColumns,
  defaultSelectedColumns = [],
  filename,
  title,
  itemType
}: DataExtractorProps<T>) {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(defaultSelectedColumns)
  );

  const handleColumnToggle = (columnKey: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(columnKey)) {
      newSelected.delete(columnKey);
    } else {
      newSelected.add(columnKey);
    }
    setSelectedColumns(newSelected);
  };

  const formatValue = (value: any, columnKey: string): string => {
    // Handle null/undefined values
    if (value === null || value === undefined || value === '') {
      if (columnKey.includes('count') || columnKey.includes('applicants')) {
        return '0';
      } else if (columnKey.includes('date') || columnKey.includes('deadline') || columnKey.includes('posted')) {
        return '(Not set)';
      } else if (columnKey.includes('status')) {
        return '(Unknown)';
      } else if (columnKey.includes('url') || columnKey.includes('link')) {
        return '(No URL)';
      } else {
        return '(Not provided)';
      }
    }

    // Format specific field types
    if (columnKey.includes('date') || columnKey.includes('deadline') || columnKey.includes('posted')) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value.toString();
      }
    }

    // Format boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle metadata objects
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return value.toString();
  };

  const handleExport = () => {
    if (selectedItems.size === 0) {
      toast.error(`Please select at least one ${itemType.slice(0, -1)} to export`);
      return;
    }

    if (selectedColumns.size === 0) {
      toast.error('Please select at least one column to export');
      return;
    }

    const selectedData = data.filter(item => selectedItems.has(item.id));
    
    // Prepare data for export
    const exportData = selectedData.map(item => {
      const row: any = {};
      selectedColumns.forEach(columnKey => {
        const column = availableColumns.find(col => col.key === columnKey);
        if (column) {
          const value = (item as any)[columnKey];
          row[column.label] = formatValue(value, columnKey);
        }
      });
      return row;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, itemType.charAt(0).toUpperCase() + itemType.slice(1));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, finalFilename);
    
    toast.success(`Exported ${selectedData.length} ${itemType} to ${finalFilename}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Selected {itemType}: <span className="font-semibold">{selectedItems.size}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Select the columns you want to include in the Excel export:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {availableColumns.map((column) => (
              <div key={column.key} className="flex items-center">
                <input
                  type="checkbox"
                  id={column.key}
                  checked={selectedColumns.has(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                  className="h-4 w-4 text-[#556B2F] focus:ring-[#556B2F] border-gray-300 rounded"
                />
                <label
                  htmlFor={column.key}
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedColumns(new Set(availableColumns.map(col => col.key)))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedColumns(new Set())}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedColumns.size === 0}
                className="px-4 py-2 bg-[#556B2F] text-white rounded-md hover:bg-[#4A5D28] focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-defined column configurations for different data types
export const opportunityColumns: ExtractableColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'organization', label: 'Organization' },
  { key: 'location', label: 'Location' },
  { key: 'compensation', label: 'Compensation' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'posted', label: 'Posted Date' },
  { key: 'status', label: 'Status' },
  { key: 'applicants', label: 'Number of Applicants' },
  { key: 'ngoProfileId', label: 'NGO Profile ID' },
  { key: 'isScraped', label: 'Is Scraped' },
  { key: 'sourceUrl', label: 'Source URL' },
  { key: 'id', label: 'Opportunity ID' },
];

export const defaultOpportunityColumns = [
  'title', 'type', 'organization', 'location', 'compensation', 'deadline', 'status'
];
