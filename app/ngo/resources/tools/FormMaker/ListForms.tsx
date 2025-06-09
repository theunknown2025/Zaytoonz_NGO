'use client';

import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getUserForms } from './services/formService';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types for component props and form data
interface ListFormsProps {
  onNewForm: () => void;
  onEditForm: (formId: string) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
}

interface FormData {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function ListForms({ onNewForm, onEditForm, toast }: ListFormsProps) {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  
  // Check if Supabase is properly configured
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fetch forms when component mounts
  useEffect(() => {
    fetchForms();
  }, [filter]);

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      if (!isSupabaseConfigured) {
        console.error('Supabase is not configured properly');
        return;
      }
      
      const { data, error } = await supabase.from('forms_templates').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection successful:', data);
      }
    } catch (e) {
      console.error('Error testing Supabase connection:', e);
    }
  };

  // Function to fetch user forms
  const fetchForms = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('forms_templates')
        .select('*');
      
      if (filter === 'published') {
        query = query.eq('published', true);
      } else if (filter === 'draft') {
        query = query.eq('published', false);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setForms(data as FormData[]);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }
    
    // Set specific form as deleting
    setDeletingFormId(formId);
    
    try {
      // First check if the form exists
      const { data: formData, error: formError } = await supabase
        .from('forms_templates')
        .select('id')
        .eq('id', formId)
        .single();
      
      if (formError) {
        toast.error('Form not found or could not be accessed');
        return;
      }
      
      // Delete form pictures if any
      const { data: picturesData, error: picturesError } = await supabase
        .from('form_pictures')
        .select('file_path')
        .eq('form_id', formId);
      
      if (!picturesError && picturesData && picturesData.length > 0) {
        // Delete the files from storage
        for (const picture of picturesData) {
          if (picture.file_path) {
            await supabase.storage
              .from('forms-pictures')
              .remove([picture.file_path]);
          }
        }
        
        // Delete the picture records
        await supabase
          .from('form_pictures')
          .delete()
          .eq('form_id', formId);
      }
      
      // Delete form sections if using separate tables
      try {
        await supabase
          .from('form_sections')
          .delete()
          .eq('form_id', formId);
      } catch (e) {
        console.log('No form_sections table or no sections to delete');
      }
      
      // Delete form responses if any
      try {
        await supabase
          .from('form_responses')
          .delete()
          .eq('form_id', formId);
      } catch (e) {
        console.log('No form_responses table or no responses to delete');
      }
      
      // Finally delete the form
      const { error } = await supabase
        .from('forms_templates')
        .delete()
        .eq('id', formId);
      
      if (error) throw error;
      
      // Update the UI by removing the form from state
      setForms(forms.filter(form => form.id !== formId));
      toast.success('Form deleted successfully');
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    } finally {
      setDeletingFormId(null);
    }
  };

  const handleDuplicate = async (formId: string) => {
    setIsDuplicating(true);
    try {
      // Get the form data
      const { data: formData, error: formError } = await supabase
        .from('forms_templates')
        .select('*')
        .eq('id', formId)
        .single();
      
      if (formError) throw formError;
      
      // Create new form
      const { data: newForm, error: newFormError } = await supabase
        .from('forms_templates')
        .insert({
          title: `${formData.title} (Copy)`,
          description: formData.description,
          image_url: formData.image_url,
          published: false, // Always create as draft
        })
        .select()
        .single();
      
      if (newFormError) throw newFormError;
      
      // Get sections and questions
      const { data: sections, error: sectionsError } = await supabase
        .from('form_sections')
        .select('*, form_questions(*)')
        .eq('form_id', formId)
        .order('order');
      
      if (sectionsError) throw sectionsError;
      
      // Insert sections and questions
      for (const section of sections || []) {
        const { data: newSection, error: newSectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: newForm.id,
            title: section.title,
            order: section.order,
          })
          .select()
          .single();
        
        if (newSectionError) throw newSectionError;
        
        // Insert questions for this section
        const questions = section.form_questions;
        for (const question of questions || []) {
          await supabase
            .from('form_questions')
            .insert({
              section_id: newSection.id,
              label: question.label,
              type: question.type,
              required: question.required,
              placeholder: question.placeholder,
              options: question.options,
              order: question.order,
            });
        }
      }
      
      toast.success('Form duplicated successfully');
      fetchForms();
    } catch (error) {
      console.error('Error duplicating form:', error);
      toast.error('Failed to duplicate form');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handlePublishToggle = async (formId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('forms_templates')
        .update({ published: !currentStatus })
        .eq('id', formId);
      
      if (error) throw error;
      
      toast.success(`Form ${currentStatus ? 'unpublished' : 'published'} successfully`);
      fetchForms();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update form status');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedForms.length} forms? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      for (const formId of selectedForms) {
        // Delete form sections and questions
        await supabase
          .from('form_sections')
          .delete()
          .eq('form_id', formId);
        
        // Delete form responses
        await supabase
          .from('form_responses')
          .delete()
          .eq('form_id', formId);
        
        // Delete the form
        await supabase
          .from('forms_templates')
          .delete()
          .eq('id', formId);
      }
      
      toast.success(`${selectedForms.length} forms deleted successfully`);
      setSelectedForms([]);
      fetchForms();
    } catch (error) {
      console.error('Error deleting forms:', error);
      toast.error('Failed to delete forms');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFormSelection = (formId: string) => {
    if (selectedForms.includes(formId)) {
      setSelectedForms(selectedForms.filter(id => id !== formId));
    } else {
      setSelectedForms([...selectedForms, formId]);
    }
  };

  const selectAllForms = () => {
    if (selectedForms.length === forms.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms(forms.map(form => form.id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter forms based on search query
  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-[#556B2F] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">My Forms</h2>
      </div>
      
      {/* Debug section for errors */}
      {forms.length === 0 && (
        <div className="mt-4 mb-4">
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="text-blue-600 text-sm underline"
          >
            {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          
          {showDebugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs font-mono overflow-auto max-h-60">
              <p className="mb-2">Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
              <p className="mb-2">Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
              <div className="mt-4">
                <button
                  onClick={() => {
                    testSupabaseConnection();
                    setTimeout(fetchForms, 1000);
                  }}
                  className="py-1 px-2 bg-blue-500 text-white rounded-md text-xs mr-2"
                >
                  Test Connection
                </button>
                <button
                  onClick={fetchForms}
                  className="py-1 px-2 bg-green-500 text-white rounded-md text-xs"
                >
                  Retry Fetch Forms
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          {selectedForms.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isDeleting ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <TrashIcon className="w-5 h-5 mr-2" />
              )}
              Delete Selected
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F] w-full"
          />
          
          <button
            onClick={fetchForms}
            className="p-2 text-gray-600 hover:text-[#556B2F] transition-colors"
            title="Refresh forms"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
          >
            <option value="all">All Forms</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>
      
      {filteredForms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <PlusIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-500 mb-6">Create your first form to start collecting data.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="text-[#556B2F] rounded"
                        checked={selectedForms.length === forms.length && forms.length > 0}
                        onChange={selectAllForms}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="text-[#556B2F] rounded"
                        checked={selectedForms.includes(form.id)}
                        onChange={() => toggleFormSelection(form.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {form.image_url ? (
                            <div className="h-10 w-10 relative rounded-md overflow-hidden">
                              <Image
                                src={form.image_url}
                                alt={form.title}
                                className="object-cover"
                                fill
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-[#556B2F]/10 text-[#556B2F] flex items-center justify-center rounded-md">
                              <span className="text-lg font-bold">{form.title.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{form.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {form.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          form.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {form.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(form.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onEditForm(form.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit form"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handlePublishToggle(form.id, form.published)}
                          className={`${form.published ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                          title={form.published ? 'Unpublish form' : 'Publish form'}
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(form.id)}
                          disabled={deletingFormId === form.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete form"
                        >
                          {deletingFormId === form.id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <TrashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 