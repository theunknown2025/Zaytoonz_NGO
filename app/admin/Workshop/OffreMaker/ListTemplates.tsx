'use client';

import { useState } from 'react';
import { 
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Template } from './NewTemplate';

interface ListTemplatesProps {
  templates: Template[];
  onNewTemplate: () => void;
  onEditTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUseTemplate: (templateId: string) => void;
  onTogglePublish?: (templateId: string, currentPublished: boolean) => void;
  loading?: boolean;
}

export default function ListTemplates({ 
  templates, 
  onNewTemplate, 
  onEditTemplate, 
  onDeleteTemplate,
  onUseTemplate,
  onTogglePublish,
  loading = false
}: ListTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(templateId);
    try {
      await onDeleteTemplate(templateId);
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">My Templates</h2>
        <div className="flex space-x-3">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search templates..."
              className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:ring-[#556B2F] focus:border-[#556B2F]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={onNewTemplate}
            className="py-2 px-4 bg-[#556B2F] text-white rounded-lg hover:bg-[#556B2F]/90 transition-colors flex items-center"
          >
            <PlusCircleIcon className="w-4 h-4 mr-2" />
            Create New
          </button>
        </div>
      </div>
      
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <DocumentDuplicateIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-6">Create your first template to start building forms quickly.</p>
          <button
            onClick={onNewTemplate}
            className="py-2 px-6 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all"
          >
            Create New Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div 
              key={template.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="mb-2">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{template.title}</h3>
                  <div className="flex items-center gap-1">
                    {template.published ? (
                      <div className="flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Published</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-yellow-600 font-medium">Draft</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description || 'No description provided'}
                </p>
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10"></path>
                    </svg>
                    {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onEditTemplate(template.id)}
                  className="flex-1 py-2 px-3 border border-[#556B2F] text-[#556B2F] rounded-lg hover:bg-[#556B2F]/10 transition-colors text-sm flex items-center justify-center"
                >
                  <PencilSquareIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => onUseTemplate(template.id)}
                  className="flex-1 py-2 px-3 bg-[#556B2F] text-white rounded-lg hover:bg-[#556B2F]/90 transition-colors text-sm flex items-center justify-center"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                  Use
                </button>
                {onTogglePublish && (
                  <button 
                    onClick={() => onTogglePublish(template.id, template.published || false)}
                    className={`py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center ${
                      template.published 
                        ? 'text-yellow-600 border border-yellow-200 hover:bg-yellow-50' 
                        : 'text-green-600 border border-green-200 hover:bg-green-50'
                    }`}
                    title={template.published ? 'Unpublish template' : 'Publish template'}
                  >
                    {template.published ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(template.id)}
                  disabled={isDeleting === template.id}
                  className="py-2 px-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center disabled:opacity-50"
                >
                  {isDeleting === template.id ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 