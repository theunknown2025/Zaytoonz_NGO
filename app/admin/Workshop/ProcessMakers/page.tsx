'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  PlusCircleIcon,
  ListBulletIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

interface ProcessStep {
  id?: string;
  title: string;
  description: string;
  assignee: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
}

interface Process {
  id?: string;
  name: string;
  description: string;
  category: 'volunteer' | 'project' | 'event' | 'fundraising';
  status: 'draft' | 'active' | 'paused' | 'completed';
  steps: ProcessStep[];
  published: boolean;
  is_admin_template: boolean;
  created_at?: string;
  updated_at?: string;
  progress?: number;
}

export default function ProcessMakers() {
  const [activeTab, setActiveTab] = useState<'templates' | 'create'>('templates');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [newProcess, setNewProcess] = useState<Omit<Process, 'id' | 'created_at' | 'updated_at' | 'progress'>>({
    name: '',
    description: '',
    category: 'volunteer',
    status: 'draft',
    steps: [],
    published: false,
    is_admin_template: true
  });

  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [newStep, setNewStep] = useState<Omit<ProcessStep, 'id'>>({
    title: '',
    description: '',
    assignee: '',
    duration: '',
    status: 'pending',
    dependencies: []
  });

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/process-templates');
      const data = await response.json();
      
      if (response.ok) {
        setProcesses(data.templates || []);
      } else {
        toast.error('Failed to fetch process templates');
      }
    } catch (error) {
      toast.error('Error fetching process templates');
    } finally {
      setLoading(false);
    }
  };

  const saveProcess = async () => {
    if (!newProcess.name.trim()) {
      toast.error('Please enter a process name');
      return;
    }

    try {
      setLoading(true);
      const processData = {
        name: newProcess.name,
        description: newProcess.description,
        status: newProcess.status,
        steps: newProcess.steps,
        created_by: 'admin-user-id' // TODO: Get actual admin user ID
      };

      const isEditing = editingProcess !== null;
      const url = '/api/admin/process-templates';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const payload = isEditing 
        ? { ...processData, id: editingProcess.id }
        : processData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Process ${isEditing ? 'updated' : 'saved'} successfully!`);
        await fetchProcesses();
        resetForm();
        setActiveTab('templates');
      } else {
        toast.error(data.error || `Failed to ${isEditing ? 'update' : 'save'} process`);
      }
    } catch (error) {
      toast.error('An error occurred while saving the process');
    } finally {
      setLoading(false);
    }
  };

  const editProcess = (process: Process) => {
    setEditingProcess(process);
    setNewProcess(process);
    setActiveTab('create');
  };

  const deleteProcess = async (processId: string) => {
    if (!confirm('Are you sure you want to delete this process template?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/process-templates?id=${processId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Process template deleted successfully!');
        await fetchProcesses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete process template');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the process');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (processId: string, currentPublished: boolean) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: processId,
          templateType: 'process',
          published: !currentPublished
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchProcesses();
      } else {
        toast.error(data.error || 'Failed to update process status');
      }
    } catch (error) {
      toast.error('An error occurred while updating the process');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProcess(null);
    setNewProcess({
      name: '',
      description: '',
      category: 'volunteer',
      status: 'draft',
      steps: [],
      published: false,
      is_admin_template: true
    });
  };

  const duplicateProcess = (process: Process) => {
    const duplicatedProcess = {
      ...process,
      name: `${process.name} (Copy)`,
      status: 'draft' as const,
      published: false,
      steps: process.steps.map(step => ({ ...step, status: 'pending' as const }))
    };
    setNewProcess(duplicatedProcess);
    setActiveTab('create');
  };

  const handleAddStep = () => {
    if (newStep.title && newStep.description) {
      const step: ProcessStep = {
        ...newStep,
        id: Date.now().toString()
      };
      setNewProcess({
        ...newProcess,
        steps: [...newProcess.steps, step]
      });
      setNewStep({
        title: '',
        description: '',
        assignee: '',
        duration: '',
        status: 'pending',
        dependencies: []
      });
      setShowStepModal(false);
    }
  };

  const handleDeleteStep = (stepId: string) => {
    setNewProcess({
      ...newProcess,
      steps: newProcess.steps.filter(step => step.id !== stepId)
    });
  };

  const calculateProgress = (steps: ProcessStep[]) => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'volunteer': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'project': return 'bg-green-50 text-green-700 border-green-200';
      case 'event': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'fundraising': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'blocked': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'in-progress': return PlayIcon;
      case 'pending': return ClockIcon;
      case 'blocked': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  return (
    <div className="px-4 py-6">
      <Toaster position="top-right" />
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <Cog6ToothIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">
            Admin Process Makers
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage process templates for NGO organizations
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex justify-center">
            <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1" aria-label="Tabs">
              <button
                onClick={() => {
                  setActiveTab('templates');
                  resetForm();
                }}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'templates'
                    ? 'bg-white text-[#556B2F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="w-5 h-5 mr-2" />
                Process Templates
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'create'
                    ? 'bg-white text-[#556B2F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                {editingProcess ? 'Edit Process' : 'New Process'}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'templates' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Process Templates</h2>
                  <p className="text-gray-600">Manage process templates for NGO organizations</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent w-full"
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

              {/* Templates List */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processes
                    .filter(process => {
                      const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          process.description.toLowerCase().includes(searchTerm.toLowerCase());
                      
                      const matchesStatus = statusFilter === 'all' || 
                                           (statusFilter === 'published' && process.published) ||
                                           (statusFilter === 'draft' && !process.published);
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map((process) => (
                      <div key={process.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 mb-2">
                            {process.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {process.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {process.category}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {process.status}
                          </span>
                          {process.published && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Published
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                          {process.steps?.length || 0} steps
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editProcess(process)}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProcess(process.id!)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                          
                          <button
                            onClick={() => togglePublish(process.id!, process.published)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              process.published 
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-[#556B2F] text-white hover:bg-[#4a5d2a]'
                            }`}
                          >
                            {process.published ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {processes.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Cog6ToothIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No process templates found</h3>
                  <p className="text-gray-600">Create your first process template to get started</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProcess ? 'Edit Process Template' : 'Create New Process Template'}
                </h2>
                <p className="text-gray-600">Design workflow processes for various organizational needs</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Process Name *
                    </label>
                    <input
                      type="text"
                      value={newProcess.name}
                      onChange={(e) => setNewProcess(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                      placeholder="Enter process name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newProcess.category}
                      onChange={(e) => setNewProcess(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="project">Project</option>
                      <option value="event">Event</option>
                      <option value="fundraising">Fundraising</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newProcess.description}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="Describe the purpose and scope of this process"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newProcess.status}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProcess}
                    disabled={loading}
                    className="px-6 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#4a5d2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : editingProcess ? 'Update Process' : 'Save Process'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}