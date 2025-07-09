'use client';

import { useState, useEffect } from 'react';
import {
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  StarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { EvaluationTemplate } from './types';
import {
  getAdminEvaluationTemplates,
  deleteAdminEvaluationTemplate,
  publishAdminEvaluationTemplate
} from './services/evaluationService';
import toast from 'react-hot-toast';

interface ListEvaluationsProps {
  onEdit?: (template: EvaluationTemplate) => void;
}

export default function ListEvaluations({ onEdit }: ListEvaluationsProps) {
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getAdminEvaluationTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to fetch evaluation templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evaluation template?')) {
      return;
    }

    try {
      await deleteAdminEvaluationTemplate(id);
      toast.success('Evaluation template deleted successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete evaluation template');
    }
  };

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const result = await publishAdminEvaluationTemplate(id, !currentPublished);
      toast.success(result.message || `Template ${!currentPublished ? 'published' : 'unpublished'} successfully`);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template status');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedTemplates.length} template(s)?`)) {
      return;
    }

    try {
      await Promise.all(selectedTemplates.map(id => deleteAdminEvaluationTemplate(id)));
      toast.success(`${selectedTemplates.length} template(s) deleted successfully`);
      setSelectedTemplates([]);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete templates');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && template.published) ||
                         (statusFilter === 'draft' && !template.published);
    
    return matchesSearch && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'volunteer': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-yellow-100 text-yellow-800';
      case 'program': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Evaluation Templates</h2>
          <p className="text-gray-600">Manage evaluation templates for NGO organizations</p>
        </div>
        
        {selectedTemplates.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete Selected ({selectedTemplates.length})
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent w-full"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
        >
          <option value="all">All Templates</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <StarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluation templates found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first evaluation template to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Template Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id!)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates([...selectedTemplates, template.id!]);
                        } else {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                        }
                      }}
                      className="mr-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {template.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Template Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                  {template.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                  {template.status}
                </span>
                {template.published && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                    <GlobeAltIcon className="w-3 h-3 mr-1" />
                    Published
                  </span>
                )}
              </div>

              {/* Criteria Count */}
              <div className="text-sm text-gray-600 mb-4">
                {template.criteria?.length || 0} evaluation criteria
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit?.(template)}
                    className="p-2 text-gray-600 hover:text-[#556B2F] hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id!)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => handleTogglePublish(template.id!, template.published || false)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    template.published 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-[#556B2F] text-white hover:bg-[#4a5d2a]'
                  }`}
                >
                  {template.published ? (
                    <>
                      <EyeSlashIcon className="w-4 h-4 inline mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                      Publish
                    </>
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