'use client';

import { useState } from 'react';
import { XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface ExtractField {
  id: string;
  label: string;
  type: 'user' | 'application' | 'form' | 'meta';
  key: string;
  description?: string;
}

interface DataExtractorProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    opportunity_id: string;
    title: string;
    applications: Array<{
      id: string;
      seeker_profile: {
        id: string;
        full_name: string;
        email: string;
        user_type: string;
        created_at: string;
      } | null;
      application_data: any;
      submitted_at: string;
      forms_templates: {
        id: string;
        title: string;
        sections: any[];
      };
    }>;
  };
}

export default function DataExtractor({ isOpen, onClose, opportunity }: DataExtractorProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const [isExtracting, setIsExtracting] = useState(false);

  if (!isOpen) return null;

  // Extract all available fields from form templates and application data
  const getAvailableFields = (): ExtractField[] => {
    const fields: ExtractField[] = [];
    
    // Standard user fields
    fields.push(
      { id: 'user_full_name', label: 'Full Name', type: 'user', key: 'full_name', description: 'Applicant full name' },
      { id: 'user_email', label: 'Email', type: 'user', key: 'email', description: 'Applicant email address' },
      { id: 'user_type', label: 'User Type', type: 'user', key: 'user_type', description: 'Type of user account' },
      { id: 'user_created_at', label: 'User Registration Date', type: 'user', key: 'created_at', description: 'When the user registered' }
    );

    // Meta fields
    fields.push(
      { id: 'application_id', label: 'Application ID', type: 'meta', key: 'id', description: 'Unique application identifier' },
      { id: 'submitted_at', label: 'Submission Date', type: 'meta', key: 'submitted_at', description: 'When the application was submitted' },
      { id: 'form_title', label: 'Form Title', type: 'form', key: 'title', description: 'Title of the application form' }
    );

    // Create a comprehensive map of ALL question IDs from both form templates AND actual application data
    const questionMap = new Map<string, { label: string; type: string; section: string; options?: string[] }>();
    
    // First, build question map from form templates (similar to main page logic)
    opportunity.applications.forEach(app => {
      if (app.forms_templates?.sections) {
        const sections = Array.isArray(app.forms_templates.sections) 
          ? app.forms_templates.sections 
          : (app.forms_templates.sections as any)?.sections || [];
          
        sections.forEach((section: any) => {
          if (section.questions && Array.isArray(section.questions)) {
            section.questions.forEach((question: any) => {
              questionMap.set(String(question.id), {
                label: question.label || `Question ${question.id}`,
                type: question.type || 'text',
                section: section.title || 'Unknown Section',
                options: question.options || undefined
              });
            });
          }
        });
      }
    });

    // TEMPORARY: Add known questions manually based on the database data
    // This helps with timestamp-based question IDs that might not be in form templates
    questionMap.set('1748812474285', {
      label: 'Year of experience',
      type: 'checkbox',
      section: 'Basic Information',
      options: ['1-3', '4-5', '5-7']
    });
    
    questionMap.set('1748812506625', {
      label: 'Motivation',
      type: 'textarea',
      section: 'Basic Information'
    });

    // Also scan all application_data to find any additional question IDs not in templates
    const allFoundQuestionIds = new Set<string>();
    opportunity.applications.forEach(app => {
      if (app.application_data && typeof app.application_data === 'object') {
        Object.keys(app.application_data).forEach(key => {
          allFoundQuestionIds.add(String(key));
          
          // If we find a question ID that's not in our map, add it as unknown
          if (!questionMap.has(String(key))) {
            questionMap.set(String(key), {
              label: `Unknown Field ${key}`,
              type: 'unknown',
              section: 'Unknown Section'
            });
          }
        });
      }
    });

    // Convert question map to extract fields
    const formFields: ExtractField[] = [];
    questionMap.forEach((questionInfo, questionId) => {
      const fieldId = `form_${questionId}`;
      formFields.push({
        id: fieldId,
        label: questionInfo.label,
        type: 'application',
        key: `form_answers.${questionId}`,
        description: `${questionInfo.type} field from ${questionInfo.section}${questionInfo.options ? ` (Options: ${questionInfo.options.join(', ')})` : ''}`
      });
    });

    fields.push(...formFields);

    console.log('DataExtractor: Found fields:', fields.length);
    console.log('DataExtractor: Application fields:', formFields.length);
    console.log('DataExtractor: Question map size:', questionMap.size);

    return fields;
  };

  const availableFields = getAvailableFields();

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(availableFields.map(f => f.id));
    }
  };

  const extractData = () => {
    const extractedData: any[] = [];
    
    opportunity.applications.forEach(app => {
      const row: any = {};
      
      selectedFields.forEach(fieldId => {
        const field = availableFields.find(f => f.id === fieldId);
        if (!field) return;

        switch (field.type) {
          case 'user':
            row[field.label] = app.seeker_profile?.[field.key as keyof typeof app.seeker_profile] || '';
            break;
          case 'meta':
            if (field.key === 'id') {
              row[field.label] = app.id;
            } else if (field.key === 'submitted_at') {
              row[field.label] = new Date(app.submitted_at).toLocaleDateString();
            }
            break;
          case 'form':
            if (field.key === 'title') {
              row[field.label] = app.forms_templates?.title || '';
            }
            break;
          case 'application':
            // Extract form answers
            if (field.key.startsWith('form_answers.')) {
              const questionId = field.key.split('.')[1];
              row[field.label] = app.application_data?.[questionId] || '';
            }
            break;
        }
      });
      
      extractedData.push(row);
    });

    return extractedData;
  };

  const handleExtract = async () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to extract.');
      return;
    }

    setIsExtracting(true);
    
    try {
      const data = extractData();
      
      if (exportFormat === 'csv') {
        downloadCSV(data);
      } else {
        downloadXLSX(data);
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      alert('Error extracting data. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadCSV = (data: any[]) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          return typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${opportunity.title}_applications.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadXLSX = async (data: any[]) => {
    // For XLSX export, we'll use a simple implementation
    // In a real app, you might want to use a library like xlsx
    try {
      const response = await fetch('/api/export/xlsx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          filename: `${opportunity.title}_applications.xlsx`
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${opportunity.title}_applications.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback to CSV if XLSX export fails
        console.warn('XLSX export failed, falling back to CSV');
        downloadCSV(data);
      }
    } catch (error) {
      console.warn('XLSX export failed, falling back to CSV:', error);
      downloadCSV(data);
    }
  };

  const groupedFields = {
    user: availableFields.filter(f => f.type === 'user'),
    meta: availableFields.filter(f => f.type === 'meta'),
    form: availableFields.filter(f => f.type === 'form'),
    application: availableFields.filter(f => f.type === 'application')
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Extract Application Data - {opportunity.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
              <p className="text-blue-700 text-sm">
                {opportunity.applications.length} applications ready for export
              </p>
            </div>

            {/* Format Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Export Format</h4>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'csv')}
                    className="mr-2"
                  />
                  <span className="text-sm">CSV (Comma-separated values)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="xlsx"
                    checked={exportFormat === 'xlsx'}
                    onChange={(e) => setExportFormat(e.target.value as 'xlsx')}
                    className="mr-2"
                  />
                  <span className="text-sm">XLSX (Excel format)</span>
                </label>
              </div>
            </div>

            {/* Field Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Select Fields to Extract</h4>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedFields.length === availableFields.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* User Information Fields */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">User Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {groupedFields.user.map(field => (
                    <label key={field.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.id)}
                        onChange={() => handleFieldToggle(field.id)}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <span className="text-sm text-gray-900">{field.label}</span>
                        {field.description && (
                          <p className="text-xs text-gray-500">{field.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Meta Fields */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Application Meta Data</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {groupedFields.meta.map(field => (
                    <label key={field.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.id)}
                        onChange={() => handleFieldToggle(field.id)}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <span className="text-sm text-gray-900">{field.label}</span>
                        {field.description && (
                          <p className="text-xs text-gray-500">{field.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              {groupedFields.form.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Form Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupedFields.form.map(field => (
                      <label key={field.id} className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.id)}
                          onChange={() => handleFieldToggle(field.id)}
                          className="mr-2 mt-0.5"
                        />
                        <div>
                          <span className="text-sm text-gray-900">{field.label}</span>
                          {field.description && (
                            <p className="text-xs text-gray-500">{field.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Answer Fields */}
              {groupedFields.application.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Form Answers</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupedFields.application.map(field => (
                      <label key={field.id} className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.id)}
                          onChange={() => handleFieldToggle(field.id)}
                          className="mr-2 mt-0.5"
                        />
                        <div>
                          <span className="text-sm text-gray-900">{field.label}</span>
                          {field.description && (
                            <p className="text-xs text-gray-500">{field.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={isExtracting || selectedFields.length === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isExtracting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Extracting...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Extract Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 