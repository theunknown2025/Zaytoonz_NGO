'use client';

import { useState } from 'react';
import { 
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'job' | 'funding' | 'training';
  location: string;
  duration: string;
  compensation: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  applicationDeadline: string;
  contactEmail: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export default function OffreMaker() {
  const [activeTab, setActiveTab] = useState<'templates' | 'create'>('templates');
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      title: 'Community Outreach Coordinator',
      description: 'Lead community engagement initiatives and build partnerships with local organizations.',
      category: 'job',
      location: 'Remote/Hybrid',
      duration: 'Full-time',
      compensation: 'Competitive salary',
      requirements: ['Bachelor\'s degree', '2+ years experience', 'Strong communication skills'],
      responsibilities: ['Develop outreach strategies', 'Manage partnerships', 'Organize events'],
      benefits: ['Health insurance', 'Professional development', 'Flexible schedule'],
      applicationDeadline: '2024-12-31',
      contactEmail: 'hr@zaytoonz.org',
      status: 'published',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Youth Development Program',
      description: 'Comprehensive training program for young leaders in social impact.',
      category: 'training',
      location: 'Online',
      duration: '6 weeks',
      compensation: 'Free',
      requirements: ['Age 18-25', 'Passion for social change', 'Basic English proficiency'],
      responsibilities: ['Attend weekly sessions', 'Complete assignments', 'Participate in group projects'],
      benefits: ['Certificate of completion', 'Networking opportunities', 'Mentorship'],
      applicationDeadline: '2024-11-30',
      contactEmail: 'training@zaytoonz.org',
      status: 'draft',
      createdAt: '2024-01-10'
    }
  ]);

  const [newTemplate, setNewTemplate] = useState<Omit<Template, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    category: 'job',
    location: '',
    duration: '',
    compensation: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    applicationDeadline: '',
    contactEmail: '',
    status: 'draft'
  });

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleCreateTemplate = () => {
    if (newTemplate.title && newTemplate.description) {
      const template: Template = {
        ...newTemplate,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTemplates([template, ...templates]);
      setNewTemplate({
        title: '',
        description: '',
        category: 'job',
        location: '',
        duration: '',
        compensation: '',
        requirements: [''],
        responsibilities: [''],
        benefits: [''],
        applicationDeadline: '',
        contactEmail: '',
        status: 'draft'
      });
      setActiveTab('templates');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplate(template);
    setActiveTab('create');
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate && newTemplate.title && newTemplate.description) {
      const updatedTemplate: Template = {
        ...newTemplate,
        id: editingTemplate.id,
        createdAt: editingTemplate.createdAt
      };
      setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
      setEditingTemplate(null);
      setNewTemplate({
        title: '',
        description: '',
        category: 'job',
        location: '',
        duration: '',
        compensation: '',
        requirements: [''],
        responsibilities: [''],
        benefits: [''],
        applicationDeadline: '',
        contactEmail: '',
        status: 'draft'
      });
      setActiveTab('templates');
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      title: `${template.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates([duplicatedTemplate, ...templates]);
  };

  const handlePublishTemplate = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, status: 'published' as const } : t
    ));
  };

  const addArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setNewTemplate({
      ...newTemplate,
      [field]: [...newTemplate[field], '']
    });
  };

  const updateArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    const updatedArray = [...newTemplate[field]];
    updatedArray[index] = value;
    setNewTemplate({
      ...newTemplate,
      [field]: updatedArray
    });
  };

  const removeArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    if (newTemplate[field].length > 1) {
      setNewTemplate({
        ...newTemplate,
        [field]: newTemplate[field].filter((_, i) => i !== index)
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'job': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'funding': return 'bg-green-50 text-green-700 border-green-200';
      case 'training': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-50 text-green-700 border-green-200';
      case 'draft': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/Workshop" className="text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <ClipboardDocumentListIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Offre Maker</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('create')}
                className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium flex items-center gap-2"
              >
                <PlusCircleIcon className="w-4 h-4" />
                New Template
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'create' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {editingTemplate ? 'Edit Template' : 'Create Template'}
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-600 mb-6">Create your first opportunity template to get started.</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-[#556B2F] text-white px-6 py-3 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium"
                >
                  Create Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(template.status)}`}>
                          {template.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="text-gray-400 hover:text-[#556B2F] p-1"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="text-gray-400 hover:text-[#556B2F] p-1"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{template.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{template.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>{template.compensation}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Created {template.createdAt}</span>
                      {template.status === 'draft' ? (
                        <button
                          onClick={() => handlePublishTemplate(template.id)}
                          className="text-sm bg-[#556B2F] text-white px-3 py-1 rounded hover:bg-[#6B8E23] transition-colors"
                        >
                          Publish
                        </button>
                      ) : (
                        <button className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Template Tab */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="Enter opportunity title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    >
                      <option value="job">Job</option>
                      <option value="funding">Funding</option>
                      <option value="training">Training</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    placeholder="Describe the opportunity"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={newTemplate.location}
                      onChange={(e) => setNewTemplate({...newTemplate, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="e.g., Remote, New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={newTemplate.duration}
                      onChange={(e) => setNewTemplate({...newTemplate, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="e.g., Full-time, 6 months"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Compensation</label>
                    <input
                      type="text"
                      value={newTemplate.compensation}
                      onChange={(e) => setNewTemplate({...newTemplate, compensation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="e.g., $50,000, Volunteer"
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <div className="space-y-2">
                    {newTemplate.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                          placeholder="Enter requirement"
                        />
                        <button
                          onClick={() => removeArrayItem('requirements', index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('requirements')}
                      className="text-[#556B2F] hover:text-[#6B8E23] text-sm flex items-center gap-1"
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      Add Requirement
                    </button>
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                  <div className="space-y-2">
                    {newTemplate.responsibilities.map((resp, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={resp}
                          onChange={(e) => updateArrayItem('responsibilities', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                          placeholder="Enter responsibility"
                        />
                        <button
                          onClick={() => removeArrayItem('responsibilities', index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('responsibilities')}
                      className="text-[#556B2F] hover:text-[#6B8E23] text-sm flex items-center gap-1"
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      Add Responsibility
                    </button>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                  <div className="space-y-2">
                    {newTemplate.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                          placeholder="Enter benefit"
                        />
                        <button
                          onClick={() => removeArrayItem('benefits', index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('benefits')}
                      className="text-[#556B2F] hover:text-[#6B8E23] text-sm flex items-center gap-1"
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      Add Benefit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                    <input
                      type="date"
                      value={newTemplate.applicationDeadline}
                      onChange={(e) => setNewTemplate({...newTemplate, applicationDeadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={newTemplate.contactEmail}
                      onChange={(e) => setNewTemplate({...newTemplate, contactEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="contact@organization.org"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setActiveTab('templates');
                      setEditingTemplate(null);
                      setNewTemplate({
                        title: '',
                        description: '',
                        category: 'job',
                        location: '',
                        duration: '',
                        compensation: '',
                        requirements: [''],
                        responsibilities: [''],
                        benefits: [''],
                        applicationDeadline: '',
                        contactEmail: '',
                        status: 'draft'
                      });
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setNewTemplate({...newTemplate, status: 'draft'})}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    className="px-6 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}