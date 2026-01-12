import * as XLSX from 'xlsx';

export interface ExtractedOpportunity {
  id: string;
  title: string;
  opportunity_type: 'job' | 'funding' | 'training';
  source_url: string;
  description: string | null;
  company: string | null;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  deadline: string | null;
  requirements: string | null;
  benefits: string | null;
  responsibilities: string | null;
  qualifications: string | null;
  application_instructions: string | null;
  contact_info: string | null;
  raw_content: string | null;
  structured_content: Record<string, unknown> | null;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  extraction_error: string | null;
  extracted_at: string | null;
  model_used: string | null;
  extraction_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExportColumn {
  key: keyof ExtractedOpportunity | 'country';
  label: string;
  group: 'basic' | 'details' | 'content' | 'metadata';
}

export const availableColumns: ExportColumn[] = [
  // Basic Info
  { key: 'title', label: 'Title', group: 'basic' },
  { key: 'opportunity_type', label: 'Type', group: 'basic' },
  { key: 'source_url', label: 'Source URL', group: 'basic' },
  { key: 'extraction_status', label: 'Status', group: 'basic' },
  
  // Details
  { key: 'company', label: 'Company/Organization', group: 'details' },
  { key: 'location', label: 'Location', group: 'details' },
  { key: 'country', label: 'Country', group: 'details' },
  { key: 'salary_range', label: 'Salary/Amount', group: 'details' },
  { key: 'job_type', label: 'Job Type/Contract', group: 'details' },
  { key: 'deadline', label: 'Deadline', group: 'details' },
  
  // Content
  { key: 'description', label: 'Description', group: 'content' },
  { key: 'requirements', label: 'Requirements', group: 'content' },
  { key: 'responsibilities', label: 'Responsibilities', group: 'content' },
  { key: 'qualifications', label: 'Qualifications', group: 'content' },
  { key: 'benefits', label: 'Benefits', group: 'content' },
  { key: 'application_instructions', label: 'How to Apply', group: 'content' },
  { key: 'contact_info', label: 'Contact Info', group: 'content' },
  { key: 'raw_content', label: 'Full Raw Content', group: 'content' },
  
  // Metadata
  { key: 'model_used', label: 'AI Model Used', group: 'metadata' },
  { key: 'extraction_cost', label: 'Extraction Cost', group: 'metadata' },
  { key: 'extraction_error', label: 'Extraction Error', group: 'metadata' },
  { key: 'extracted_at', label: 'Extracted Date', group: 'metadata' },
  { key: 'created_at', label: 'Created Date', group: 'metadata' },
  { key: 'updated_at', label: 'Updated Date', group: 'metadata' },
];

/**
 * Extract country from location string
 * Attempts to get the last part after comma, or the full location if no comma
 */
export function extractCountry(location: string | null): string {
  if (!location) return '';
  
  // Common patterns: "City, Country" or "City, State, Country" or just "Country"
  const parts = location.split(',').map(p => p.trim());
  
  // If there are multiple parts, the last one is likely the country
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  
  // If it's a single value, return it (might be country or city)
  return parts[0];
}

/**
 * Get unique countries from opportunities
 */
export function getUniqueCountries(opportunities: ExtractedOpportunity[]): string[] {
  const countries = new Set<string>();
  
  opportunities.forEach(opp => {
    if (opp.location) {
      const country = extractCountry(opp.location);
      if (country) {
        countries.add(country);
      }
    }
  });
  
  return Array.from(countries).sort();
}

/**
 * Format date for Excel
 */
function formatDateForExcel(dateString: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Truncate text to a max length for better Excel readability
 */
function truncateText(text: string | null, maxLength: number = 32767): string {
  if (!text) return '';
  // Excel cell limit is 32,767 characters
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
}

/**
 * Export opportunities to Excel with selected columns
 */
export function exportToExcel(
  opportunities: ExtractedOpportunity[],
  selectedColumns: string[],
  filters: {
    type?: string;
    status?: string;
    country?: string;
  }
): void {
  if (opportunities.length === 0) {
    alert('No opportunities to export');
    return;
  }

  // Get column definitions for selected columns
  const columns = availableColumns.filter(col => selectedColumns.includes(col.key));

  // Prepare data rows
  const data = opportunities.map(opp => {
    const row: Record<string, any> = {};
    
    columns.forEach(col => {
      if (col.key === 'country') {
        row[col.label] = extractCountry(opp.location);
      } else if (col.key === 'extraction_status' || col.key === 'opportunity_type') {
        row[col.label] = opp[col.key]?.toUpperCase() || '';
      } else if (col.key === 'deadline' || col.key === 'extracted_at' || col.key === 'created_at' || col.key === 'updated_at') {
        row[col.label] = formatDateForExcel(opp[col.key] as string);
      } else if (col.key === 'extraction_cost') {
        row[col.label] = opp.extraction_cost ? `$${opp.extraction_cost.toFixed(6)}` : '';
      } else if (col.key === 'description' || col.key === 'raw_content' || col.key === 'requirements' || 
                 col.key === 'responsibilities' || col.key === 'qualifications' || col.key === 'benefits' ||
                 col.key === 'application_instructions') {
        // Truncate long text fields
        row[col.label] = truncateText(opp[col.key] as string);
      } else {
        row[col.label] = opp[col.key as keyof ExtractedOpportunity] || '';
      }
    });
    
    return row;
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths based on content type
  const columnWidths = columns.map(col => {
    if (col.group === 'content') {
      return { wch: 50 }; // Wider for content columns
    } else if (col.key === 'source_url') {
      return { wch: 40 };
    } else if (col.key === 'title') {
      return { wch: 35 };
    } else if (col.key === 'company' || col.key === 'location') {
      return { wch: 25 };
    } else {
      return { wch: 15 };
    }
  });
  ws['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Extracted Opportunities');

  // Create summary sheet
  const summaryData = [
    { Field: 'Total Opportunities', Value: opportunities.length },
    { Field: 'Export Date', Value: new Date().toLocaleString() },
    { Field: 'Filters Applied', Value: '' },
    { Field: '  Type Filter', Value: filters.type || 'All' },
    { Field: '  Status Filter', Value: filters.status || 'All' },
    { Field: '  Country Filter', Value: filters.country || 'All' },
    { Field: '', Value: '' },
    { Field: 'Columns Exported', Value: columns.length },
  ];
  
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Export Summary');

  // Generate filename with timestamp and filters
  let filename = 'extracted_opportunities';
  if (filters.type && filters.type !== 'all') {
    filename += `_${filters.type}`;
  }
  if (filters.status && filters.status !== 'all') {
    filename += `_${filters.status}`;
  }
  if (filters.country && filters.country !== 'all') {
    filename += `_${filters.country.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);
}

/**
 * Get column count by group
 */
export function getColumnsByGroup(group: 'basic' | 'details' | 'content' | 'metadata'): ExportColumn[] {
  return availableColumns.filter(col => col.group === group);
}

/**
 * Get default selected columns (basic + details)
 */
export function getDefaultSelectedColumns(): string[] {
  return availableColumns
    .filter(col => col.group === 'basic' || col.group === 'details')
    .map(col => col.key);
}

