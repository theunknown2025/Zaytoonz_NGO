'use client';

import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { getAdminFormTemplates, deleteAdminFormTemplate, publishAdminFormTemplate } from './services/formService';
import { FormTemplate } from './types';

interface ListFormsProps {
  onNewForm: () => void;
  onEditForm: (templateId: string) => void;
}

export default function ListForms({ onNewForm, onEditForm }: ListFormsProps) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const result = await getAdminFormTemplates();
      
      if (result.success && result.templates) {
        setTemplates(result.templates);
      } else {
        console.error('Failed to fetch templates:', result.error);
        alert('Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    
    setDeletingTemplateId(templateId);
    
    try {
      const result = await deleteAdminFormTemplate(templateId);
      
      if (result.success) {
        setTemplates(templates.filter(template => template.id !== templateId));
        alert('Template deleted successfully');
      } else {
        alert(result.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const handlePublishToggle = async (templateId: string, currentStatus: boolean) => {
    setIsPublishing(true);
    
    try {
      const result = await publishAdminFormTemplate(templateId, !currentStatus);
      
      if (result.success) {
        // Update the template in state
        setTemplates(templates.map(template => 
          template.id === templateId 
            ? { ...template, published: !currentStatus }
            : template
        ));
        alert(`Template ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      } else {
        alert(result.error || 'Failed to update template status');
      }
    } catch (error) {
      console.error('Error updating template status:', error);
      alert('Failed to update template status');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedTemplates.length} template(s)? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const deletePromises = selectedTemplates.map(id => deleteAdminFormTemplate(id));
      await Promise.all(deletePromises);
      
      setTemplates(templates.filter(template => !selectedTemplates.includes(template.id!)));
      setSelectedTemplates([]);
      alert(`${selectedTemplates.length} template(s) deleted successfully`);
    } catch (error) {
      console.error('Error bulk deleting templates:', error);
      alert('Failed to delete some templates');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const selectAllTemplates = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(filteredTemplates.map(t => t.id!));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter templates based on status and search query
  const filteredTemplates = templates.filter(template => {
    const matchesFilter = filter === 'all' || 
      (filter === 'published' && template.published) ||
      (filter === 'draft' && !template.published);
    
    const matchesSearch = !searchQuery || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#556B2F]">My Form Templates</h2>
          <p className="text-gray-600">Manage form templates created by admin</p>
        </div>
        <button
          onClick={onNewForm}
          className="flex items-center gap-2 px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5" />
          New Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'published', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-[#556B2F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTemplates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedTemplates.length} template(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms.' 
              : 'Get started by creating your first admin form template.'
            }
          </p>
          <button
            onClick={onNewForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Create Template
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedTemplates.length === filteredTemplates.length}
                onChange={selectAllTemplates}
                className="rounded border-gray-300 text-[#556B2F] focus:ring-[#556B2F]"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({filteredTemplates.length})
              </span>
            </div>
          </div>

          {/* Templates */}
          <div className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id!)}
                    onChange={() => toggleTemplateSelection(template.id!)}
                    className="rounded border-gray-300 text-[#556B2F] focus:ring-[#556B2F]"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#556B2F]/10 rounded-lg text-[#556B2F]">
                        <DocumentTextIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{template.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            template.published 
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                            {template.published ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {template.sections?.length || 0} sections
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created: {template.created_at && formatDate(template.created_at)}
                        {template.updated_at && (
                          <span className="ml-3">
                            Updated: {formatDate(template.updated_at)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePublishToggle(template.id!, template.published)}
                          disabled={isPublishing}
                          className={`p-2 rounded-lg transition-colors ${
                            template.published
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={template.published ? 'Unpublish template' : 'Publish template'}
                        >
                          {template.published ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => onEditForm(template.id!)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit template"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(template.id!)}
                          disabled={deletingTemplateId === template.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete template"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 