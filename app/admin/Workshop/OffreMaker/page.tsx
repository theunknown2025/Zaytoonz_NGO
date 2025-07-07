'use client';

import { useState, useEffect } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import NewTemplate, { Template } from './NewTemplate';
import ListTemplates from './ListTemplates';
import ZaytoonzTemplates from './ZaytoonzTemplates';
import { saveTemplate, getTemplates, deleteTemplate, toggleTemplatePublish } from './supabaseService';
import { toast, Toaster } from 'react-hot-toast';

export default function OffreMakerTool() {
  const [activeTab, setActiveTab] = useState<'new-template' | 'my-templates' | 'zaytoonz-templates'>('my-templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const { data, error } = await getTemplates();
        if (error) {
          console.error('Error fetching templates:', error);
          toast.error('Failed to load templates');
        } else if (data) {
          setTemplates(data);
        }
      } catch (err) {
        console.error('Error in template fetch:', err);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Handle saving a new template
  const handleSaveTemplate = async (template: Template) => {
    try {
      const { data, error } = await saveTemplate(template);
      
      if (error) {
        console.error('Error saving template:', error);
        toast.error('Failed to save template');
        return;
      }
      
      if (data) {
        if (editingTemplateId) {
          // Update existing template in state
          setTemplates(templates.map(t => t.id === editingTemplateId ? data : t));
          setEditingTemplateId(null);
      setEditingTemplate(null);
          toast.success('Template updated successfully');
        } else {
          // Add new template to state
          setTemplates([data, ...templates]);
          toast.success('Template saved successfully');
        }
        setActiveTab('my-templates');
      }
    } catch (err) {
      console.error('Error in template save:', err);
      toast.error('Failed to save template');
    }
  };

  // Handle editing a template
  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditingTemplateId(templateId);
      setEditingTemplate(template);
      setActiveTab('new-template');
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await deleteTemplate(templateId);
      
      if (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete template');
        return;
      }
      
      setTemplates(templates.filter(template => template.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (err) {
      console.error('Error in template delete:', err);
      toast.error('Failed to delete template');
    }
  };

  // Handle using a template
  const handleUseTemplate = (templateId: string) => {
    // This would create a new opportunity based on the template
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast.success(`Creating new opportunity using: ${template.title}`);
      // Navigate to opportunity creation page with template
      // window.location.href = `/ngo/resources/opportunities/new?template=${templateId}`;
    }
  };

  // Handle publish/unpublish template
  const handleTogglePublish = async (templateId: string, currentPublished: boolean) => {
    try {
      const { error } = await toggleTemplatePublish(templateId, !currentPublished);
      
      if (error) {
        console.error('Error toggling template publish status:', error);
        toast.error('Failed to update template');
        return;
      }
      
      // Update template in state
      setTemplates(templates.map(template => 
        template.id === templateId 
          ? { ...template, published: !currentPublished }
          : template
      ));
      
      toast.success(`Template ${!currentPublished ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      console.error('Error in template publish toggle:', err);
      toast.error('Failed to update template');
    }
  };

  // When starting to create a new template
  const handleNewTemplate = () => {
    setEditingTemplateId(null);
    setEditingTemplate(null);
    setActiveTab('new-template');
  };

  // Handle use template from Zaytoonz Templates
  const handleUseZaytoonzTemplate = (template: any) => {
    // Create a new template based on the Zaytoonz template
    const newTemplate: Template = {
      id: Date.now().toString(),
      title: `${template.title} (Copy)`,
      description: template.description,
      fields: template.fields || []
    };
    
    // Set as editing template and switch to new template tab
    setEditingTemplate(newTemplate);
    setEditingTemplateId(null);
    setActiveTab('new-template');
    
    // Show success message
    toast.success(`Template "${template.title}" loaded successfully!`);
  };

  return (
    <div className="px-4 py-6">
      <Toaster position="top-right" />
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <ClipboardDocumentListIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">Offre Maker</h1>
          <p className="mt-2 text-sm text-gray-600">Create and manage volunteer opportunity templates</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('new-template')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'new-template' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Template
          </button>
          <button
            onClick={() => setActiveTab('my-templates')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'my-templates' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Templates
          </button>
          <button
            onClick={() => setActiveTab('zaytoonz-templates')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'zaytoonz-templates' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Zaytoonz Templates
          </button>
        </div>

        {/* New Template Tab */}
        {activeTab === 'new-template' && (
          <NewTemplate 
            onTemplateSaved={handleSaveTemplate} 
            initialTemplate={editingTemplate}
          />
        )}
        
        {/* My Templates Tab */}
        {activeTab === 'my-templates' && (
          <ListTemplates 
            templates={templates}
            onNewTemplate={handleNewTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onUseTemplate={handleUseTemplate}
            onTogglePublish={handleTogglePublish}
            loading={loading}
          />
        )}
        
        {/* Zaytoonz Templates Tab */}
        {activeTab === 'zaytoonz-templates' && (
          <ZaytoonzTemplates 
            onUseTemplate={handleUseZaytoonzTemplate}
          />
        )}
      </div>
    </div>
  );
}