'use client';

import { useState, useEffect } from 'react';
import { 
  ViewfinderCircleIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MapPinIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

// Define field element types
export type FieldType = 'title' | 'subtitle' | 'text' | 'image' | 'date' | 'location' | 'number' | 'select' | 'multiline' | 'document';

export interface TemplateField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
  published?: boolean;
  is_admin_template?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface NewTemplateProps {
  onTemplateSaved: (template: Template) => void;
  initialTemplate?: Template | null;
}

export default function NewTemplate({ onTemplateSaved, initialTemplate }: NewTemplateProps) {
  const [previewMode, setPreviewMode] = useState(false);
  
  // New template state
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  
  // New field state
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<Omit<TemplateField, 'id'>>({
    type: 'title',
    label: '',
    placeholder: '',
    required: false,
    options: []
  });
  
  // Editing field state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  
  // Autocomplete suggestions for label field
  const [showLabelSuggestions, setShowLabelSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  // Confirmation modal for missing suggestions
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [missingSuggestions, setMissingSuggestions] = useState<string[]>([]);
  
  const labelSuggestions = [
    'Opportunity Title',
    'Opportunity Type',
    'Provider / Organizer',
    'Description / Summary',
    'Eligibility Criteria',
    'Benefits / What\'s Offered',
    'Location',
    'Duration & Timeline',
    'Application Deadline',
    'Application Process',
    'Contact / Info Source',
    'Tags / Keywords (optional)'
  ];

  // Load initialTemplate data when editing
  useEffect(() => {
    if (initialTemplate) {
      setTemplateTitle(initialTemplate.title);
      setTemplateDescription(initialTemplate.description || '');
      setTemplateFields(initialTemplate.fields);
    }
  }, [initialTemplate]);

  // Handler functions
  const handleAddField = () => {
    setShowAddField(true);
    setNewField({
      type: 'title',
      label: '',
      placeholder: '',
      required: false,
      options: []
    });
  };

  const handleSaveField = () => {
    if (!newField.label) return;

    const field: TemplateField = {
      id: Date.now().toString(),
      ...newField
    };

    setTemplateFields([...templateFields, field]);
    setShowAddField(false);
  };

  const handleDeleteField = (fieldId: string) => {
    setTemplateFields(templateFields.filter(field => field.id !== fieldId));
  };

  const handleEditField = (field: TemplateField) => {
    setEditingFieldId(field.id);
    setNewField({
      type: field.type,
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required,
      options: field.options || []
    });
    setShowAddField(true);
  };

  const handleUpdateField = () => {
    if (!editingFieldId) return;

    setTemplateFields(templateFields.map(field => 
      field.id === editingFieldId 
        ? { ...field, ...newField, id: field.id }
        : field
    ));
    
    setShowAddField(false);
    setEditingFieldId(null);
  };

  const handleMoveFieldUp = (fieldId: string) => {
    const index = templateFields.findIndex(field => field.id === fieldId);
    if (index <= 0) return;

    const newFields = [...templateFields];
    const temp = newFields[index];
    newFields[index] = newFields[index - 1];
    newFields[index - 1] = temp;
    
    setTemplateFields(newFields);
  };

  const handleMoveFieldDown = (fieldId: string) => {
    const index = templateFields.findIndex(field => field.id === fieldId);
    if (index >= templateFields.length - 1) return;

    const newFields = [...templateFields];
    const temp = newFields[index];
    newFields[index] = newFields[index + 1];
    newFields[index + 1] = temp;
    
    setTemplateFields(newFields);
  };

  const handleAddOption = () => {
    setNewField({
      ...newField,
      options: [...(newField.options || []), '']
    });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(newField.options || [])];
    newOptions[index] = value;
    setNewField({
      ...newField,
      options: newOptions
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(newField.options || [])];
    newOptions.splice(index, 1);
    setNewField({
      ...newField,
      options: newOptions
    });
  };

  // Check for missing suggestions
  const checkMissingSuggestions = (): string[] => {
    const usedLabels = templateFields.map(field => field.label.toLowerCase());
    const missing = labelSuggestions.filter(suggestion => 
      !usedLabels.some(usedLabel => 
        usedLabel.includes(suggestion.toLowerCase()) || 
        suggestion.toLowerCase().includes(usedLabel)
      )
    );
    return missing;
  };

  const handleSaveTemplate = () => {
    if (!templateTitle || templateFields.length === 0) {
      return;
    }
    
    // Check for missing suggestions
    const missing = checkMissingSuggestions();
    
    if (missing.length > 0) {
      setMissingSuggestions(missing);
      setShowConfirmModal(true);
      return;
    }
    
    // If all suggestions are used or user confirmed, save the template
    saveTemplateDirectly();
  };

  const saveTemplateDirectly = () => {
    const newTemplate: Template = {
      id: initialTemplate?.id || Date.now().toString(),
      title: templateTitle,
      description: templateDescription || undefined,
      fields: templateFields
    };
    
    onTemplateSaved(newTemplate);
    
    // Only reset form if not editing
    if (!initialTemplate) {
      setTemplateTitle('');
      setTemplateDescription('');
      setTemplateFields([]);
    }
  };

  const handleConfirmSave = () => {
    setShowConfirmModal(false);
    saveTemplateDirectly();
  };

  const handleContinueCreating = () => {
    setShowConfirmModal(false);
    // Optionally scroll to add field section or auto-open it
    setShowAddField(true);
  };

  // Handle label input change with autocomplete
  const handleLabelChange = (value: string) => {
    setNewField({ ...newField, label: value });
    
    if (value.trim().length > 0) {
      const filtered = labelSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowLabelSuggestions(filtered.length > 0);
    } else {
      setShowLabelSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setNewField({ ...newField, label: suggestion });
    setShowLabelSuggestions(false);
    setFilteredSuggestions([]);
  };

  // Handle input blur to hide suggestions
  const handleLabelBlur = () => {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      setShowLabelSuggestions(false);
    }, 150);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create New Template</h2>
        <button 
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center px-4 py-2 text-sm text-[#556B2F] border border-[#556B2F] rounded-lg hover:bg-[#556B2F]/10"
        >
          <ViewfinderCircleIcon className="w-4 h-4 mr-2" />
          {previewMode ? 'Edit Mode' : 'Preview Mode'}
        </button>
      </div>
      
      {!previewMode && (
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                placeholder="e.g. Community Volunteer Template"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Description
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                rows={2}
                placeholder="Describe the purpose of this template..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <div className="border-t border-b border-gray-200 py-4 my-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Template Fields</h3>
            
            {templateFields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No fields added yet</p>
                <button
                  onClick={handleAddField}
                  className="py-2 px-4 bg-[#556B2F] text-white rounded-lg hover:bg-[#556B2F]/90 transition-colors"
                >
                  <PlusCircleIcon className="w-4 h-4 inline mr-2" />
                  Add Your First Field
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {templateFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col space-y-1">
                          <button 
                            onClick={() => handleMoveFieldUp(field.id)}
                            disabled={index === 0}
                            className={`p-1 rounded-full ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleMoveFieldDown(field.id)}
                            disabled={index === templateFields.length - 1}
                            className={`p-1 rounded-full ${index === templateFields.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800">{field.label}</span>
                            {field.required && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Required</span>}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className="bg-[#556B2F]/10 text-[#556B2F] px-2 py-0.5 rounded-md">{field.type}</span>
                            {field.placeholder && <span className="ml-2 italic">Placeholder: "{field.placeholder}"</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditField(field)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={handleAddField}
                  className="w-full py-3 bg-gray-50 border border-dashed border-gray-300 text-[#556B2F] rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Add Another Field
                </button>
              </div>
            )}
          </div>
          
          {/* Add/Edit Field Form */}
          {showAddField && (
            <div className="border border-[#556B2F]/20 bg-[#556B2F]/5 rounded-lg p-4 my-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {editingFieldId ? 'Edit Field' : 'Add New Field'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                    value={newField.type}
                    onChange={(e) => setNewField({...newField, type: e.target.value as FieldType})}
                  >
                    <option value="title">Title</option>
                    <option value="subtitle">Subtitle</option>
                    <option value="text">Text Field</option>
                    <option value="multiline">Multiline Text</option>
                    <option value="date">Date</option>
                    <option value="location">Location</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown</option>
                    <option value="image">Image Upload</option>
                    <option value="document">Document Upload</option>
                  </select>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                    placeholder="e.g. Project Title"
                    value={newField.label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    onFocus={() => {
                      if (newField.label.trim().length > 0) {
                        const filtered = labelSuggestions.filter(suggestion =>
                          suggestion.toLowerCase().includes(newField.label.toLowerCase())
                        );
                        if (filtered.length > 0) {
                          setFilteredSuggestions(filtered);
                          setShowLabelSuggestions(true);
                        }
                      }
                    }}
                    onBlur={handleLabelBlur}
                  />
                  
                  {/* Autocomplete suggestions dropdown */}
                  {showLabelSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-[#556B2F]/10 focus:bg-[#556B2F]/10 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                            handleSuggestionSelect(suggestion);
                          }}
                        >
                          <span className="text-sm text-gray-800">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {(newField.type === 'text' || newField.type === 'multiline' || newField.type === 'number') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                      placeholder="e.g. Enter project title here"
                      value={newField.placeholder || ''}
                      onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Field
                  </label>
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#556B2F] border-gray-300 rounded"
                      checked={newField.required}
                      onChange={(e) => setNewField({...newField, required: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Make this field required
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Options for Select type */}
              {newField.type === 'select' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  {(newField.options || []).map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleUpdateOption(index, e.target.value)}
                      />
                      <button
                        type="button"
                        className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 text-[#556B2F] hover:underline flex items-center text-sm"
                    onClick={handleAddOption}
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-1" />
                    Add Option
                  </button>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setShowAddField(false);
                    setEditingFieldId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="py-2 px-4 bg-[#556B2F] text-white rounded-lg hover:bg-[#556B2F]/90 transition-colors"
                  onClick={editingFieldId ? handleUpdateField : handleSaveField}
                  disabled={!newField.label}
                >
                  {editingFieldId ? 'Update Field' : 'Add Field'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Preview Mode */}
      {previewMode && (
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{templateTitle || 'Untitled Template'}</h2>
          
          {templateDescription && (
            <p className="text-gray-600 mb-6">{templateDescription}</p>
          )}
          
          <div className="space-y-6">
            {templateFields.map(field => (
              <div key={field.id} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'title' && (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
                
                {field.type === 'subtitle' && (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
                
                {field.type === 'multiline' && (
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder={field.placeholder}
                    disabled
                  ></textarea>
                )}
                
                {field.type === 'date' && (
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                )}
                
                {field.type === 'location' && (
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter location"
                      disabled
                    />
                    <MapPinIcon className="w-5 h-5 text-gray-400 -ml-8" />
                  </div>
                )}
                
                {field.type === 'number' && (
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
                
                {field.type === 'select' && (
                  <select className="w-full p-2 border border-gray-300 rounded-md" disabled>
                    <option value="">Select an option</option>
                    {field.options?.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'image' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Upload an image</p>
                  </div>
                )}
                
                {field.type === 'document' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Upload a document</p>
                    <p className="mt-1 text-xs text-gray-400">(PDF, Word, Excel, etc.)</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          className="py-2 px-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all"
          onClick={handleSaveTemplate}
          disabled={!templateTitle || templateFields.length === 0}
        >
          Save Template
        </button>
      </div>

      {/* Confirmation Modal for Missing Suggestions */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Missing Opportunity Fields
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              You haven't used all the recommended opportunity fields. Here are the missing ones:
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-800 mb-2">Missing Fields:</h4>
              <ul className="space-y-1">
                {missingSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Would you like to continue adding these fields, or save the template as it is?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex-1 py-2 px-4 bg-[#556B2F] text-white rounded-lg hover:bg-[#556B2F]/90 transition-colors"
                onClick={handleContinueCreating}
              >
                Continue Adding Fields
              </button>
              <button
                type="button"
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={handleConfirmSave}
              >
                Save As Is
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 