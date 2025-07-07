'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  sections: any[];
  created_at: string;
  updated_at?: string;
  published?: boolean;
}

interface ZaytoonzTemplatesProps {
  onUseTemplate: (template: FormTemplate) => void;
}

export default function ZaytoonzTemplates({ onUseTemplate }: ZaytoonzTemplatesProps) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  useEffect(() => {
    fetchFormTemplates();
  }, []);

  const fetchFormTemplates = async () => {
    try {
      setLoading(true);
      
      // Fetch all admin form templates (both published and draft)
      const { data, error } = await supabase
        .from('forms_templates')
        .select('*')
        .eq('is_admin_template', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching form templates:', error);
        setError('Failed to load templates');
      } else {
        setTemplates(data || []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    (template.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleUseTemplate = (template: FormTemplate) => {
    onUseTemplate(template);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Zaytoonz templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchFormTemplates}
          className="mt-4 px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
          <DocumentTextIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#556B2F] mb-2">Zaytoonz Admin Forms</h2>
        <p className="text-gray-600">Professional form templates created by our admin team to help you get started quickly</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search form templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No Zaytoonz admin forms are available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#556B2F]/10 rounded-lg text-[#556B2F]">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{template.title || 'Untitled Template'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                        Admin Form
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        template.published 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {template.published ? 'Published' : 'Draft'}
                      </span>
                      <div className="flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.description || 'No description available'}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{template.sections?.length || 0}</span> sections
                  <span className="mx-2">•</span>
                  <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1 p-2 text-gray-600 hover:text-[#556B2F] hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  title="Preview template"
                >
                  <EyeIcon className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 px-3 py-2 bg-[#556B2F] text-white text-sm font-medium rounded-lg hover:bg-[#6B8E23] transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#556B2F]/10 rounded-lg text-[#556B2F]">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{selectedTemplate.title || 'Untitled Template'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                        Admin Form
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        selectedTemplate.published 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {selectedTemplate.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedTemplate.description || 'No description available'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Form Structure</h4>
                  <div className="space-y-3">
                    {selectedTemplate.sections?.map((section, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">{section.title}</h5>
                        <div className="space-y-2">
                          {section.questions?.map((question: any, qIndex: number) => (
                            <div key={qIndex} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="w-2 h-2 bg-[#556B2F] rounded-full"></span>
                              <span>{question.label}</span>
                              <span className="text-xs text-gray-400">({question.type})</span>
                              {question.required && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Template Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Sections:</span> {selectedTemplate.sections?.length || 0}<br/>
                      <span className="font-medium">Created:</span> {new Date(selectedTemplate.created_at).toLocaleDateString()}<br/>
                      {selectedTemplate.updated_at && (
                        <>
                          <span className="font-medium">Updated:</span> {new Date(selectedTemplate.updated_at).toLocaleDateString()}<br/>
                        </>
                      )}
                      <span className="font-medium">Status:</span> <span className={selectedTemplate.published ? "text-green-600" : "text-yellow-600"}>{selectedTemplate.published ? 'Published' : 'Draft'}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 