'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  PlusCircleIcon,
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
        console.error('Failed to fetch process templates:', data.error);
      }
    } catch (error) {
      console.error('Error fetching process templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProcess = async () => {
    if (!newProcess.name.trim()) {
      alert('Please enter a process name');
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
        alert(`Process ${isEditing ? 'updated' : 'saved'} successfully!`);
        await fetchProcesses();
        resetForm();
        setActiveTab('templates');
      } else {
        alert(data.error || `Failed to ${isEditing ? 'update' : 'save'} process`);
      }
    } catch (error) {
      console.error('Error saving process:', error);
      alert('An error occurred while saving the process');
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
        alert('Process template deleted successfully!');
        await fetchProcesses();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete process template');
      }
    } catch (error) {
      console.error('Error deleting process:', error);
      alert('An error occurred while deleting the process');
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
        alert(data.message);
        await fetchProcesses();
      } else {
        alert(data.error || 'Failed to update process status');
      }
    } catch (error) {
      console.error('Error updating process status:', error);
      alert('An error occurred while updating the process');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Cog6ToothIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Process Makers</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/Workshop"
                className="text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Workshop
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'templates'
                      ? 'border-[#556B2F] text-[#556B2F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Process Templates ({processes.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    if (editingProcess) resetForm();
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'create'
                      ? 'border-[#556B2F] text-[#556B2F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {editingProcess ? 'Edit Process' : 'Create New Process'}
                </button>
              </nav>
            </div>

            {activeTab === 'templates' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F]"></div>
                    <p className="text-gray-600 mt-2">Loading templates...</p>
                  </div>
                ) : processes.length === 0 ? (
                  <div className="text-center py-12">
                    <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No process templates</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new process template.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab('create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#556B2F] hover:bg-[#6B8E23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                      >
                        <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                        New Process Template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Process Templates</h3>
                        <p className="text-sm text-gray-500">Manage your organization's workflow processes</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#556B2F] hover:bg-[#6B8E23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                      >
                        <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                        New Process Template
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {processes.map((process) => (
                        <div key={process.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{process.name}</h3>
                                <div className="flex items-center gap-2">
                                  {process.published ? (
                                    <GlobeAltIcon className="w-4 h-4 text-green-600" title="Published" />
                                  ) : (
                                    <EyeSlashIcon className="w-4 h-4 text-gray-400" title="Draft" />
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{process.description}</p>
                              
                              <div className="flex items-center gap-4 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(process.category)}`}>
                                  {process.category}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(process.status)}`}>
                                  {process.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {process.steps?.length || 0} steps
                                </span>
                              </div>

                              {process.steps && process.steps.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">Progress</span>
                                    <span className="text-sm text-gray-600">{calculateProgress(process.steps)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-[#556B2F] h-2 rounded-full transition-all"
                                      style={{ width: `${calculateProgress(process.steps)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => editProcess(process)}
                                className="text-[#556B2F] hover:text-[#6B8E23] text-sm font-medium flex items-center gap-1"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => duplicateProcess(process)}
                                className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => process.id && togglePublish(process.id, process.published)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                              >
                                {process.published ? (
                                  <>
                                    <EyeSlashIcon className="w-4 h-4" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <GlobeAltIcon className="w-4 h-4" />
                                    Publish
                                  </>
                                )}
                              </button>
                            </div>
                            <button
                              onClick={() => process.id && deleteProcess(process.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div className="p-6">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">
                      {editingProcess ? 'Edit Process Template' : 'Create New Process Template'}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Process Name *
                        </label>
                        <input
                          type="text"
                          value={newProcess.name}
                          onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                          placeholder="Enter process name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={newProcess.category}
                          onChange={(e) => setNewProcess({ ...newProcess, category: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                        >
                          <option value="volunteer">Volunteer</option>
                          <option value="project">Project</option>
                          <option value="event">Event</option>
                          <option value="fundraising">Fundraising</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newProcess.description}
                        onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                        placeholder="Describe the purpose and scope of this process"
                      />
                    </div>
                  </div>

                  {/* Process Steps */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Process Steps</h4>
                      <button
                        onClick={() => setShowStepModal(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-[#556B2F] bg-[#556B2F]/10 hover:bg-[#556B2F]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                      >
                        <PlusCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                        Add Step
                      </button>
                    </div>

                    {newProcess.steps.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                        <Cog6ToothIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No steps added yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Add steps to define your process workflow.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newProcess.steps.map((step, index) => {
                          const StatusIcon = getStepStatusIcon(step.status);
                          return (
                            <div key={step.id || index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <StatusIcon className="w-4 h-4 text-gray-500" />
                                    <h5 className="font-medium text-gray-900">{step.title}</h5>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStepStatusColor(step.status)}`}>
                                      {step.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <UserIcon className="w-4 h-4" />
                                      {step.assignee || 'Unassigned'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ClockIcon className="w-4 h-4" />
                                      {step.duration || 'No duration'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteStep(step.id || index.toString())}
                                  className="text-red-600 hover:text-red-800 ml-4"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProcess}
                      disabled={loading || !newProcess.name.trim()}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#556B2F] hover:bg-[#6B8E23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F] disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Process Step</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Step Title *</label>
                  <input
                    type="text"
                    value={newStep.title}
                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="Enter step title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={newStep.description}
                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="Describe what needs to be done"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newStep.assignee}
                    onChange={(e) => setNewStep({ ...newStep, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="Who is responsible for this step"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newStep.duration}
                    onChange={(e) => setNewStep({ ...newStep, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="e.g., 2 days, 1 week"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowStepModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStep}
                  disabled={!newStep.title.trim() || !newStep.description.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#556B2F] hover:bg-[#6B8E23] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}