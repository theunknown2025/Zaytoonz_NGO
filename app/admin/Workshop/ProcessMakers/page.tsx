'use client';

import { useState } from 'react';
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
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  assignee: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
}

interface Process {
  id: string;
  name: string;
  description: string;
  category: 'volunteer' | 'project' | 'event' | 'fundraising';
  status: 'draft' | 'active' | 'paused' | 'completed';
  steps: ProcessStep[];
  createdAt: string;
  lastModified: string;
  progress: number;
}

export default function ProcessMakers() {
  const [activeTab, setActiveTab] = useState<'processes' | 'create' | 'templates'>('processes');
  const [processes, setProcesses] = useState<Process[]>([
    {
      id: '1',
      name: 'Volunteer Onboarding',
      description: 'Complete process for onboarding new volunteers',
      category: 'volunteer',
      status: 'active',
      steps: [
        {
          id: '1',
          title: 'Application Review',
          description: 'Review volunteer application and background check',
          assignee: 'HR Team',
          duration: '2 days',
          status: 'completed',
          dependencies: []
        },
        {
          id: '2',
          title: 'Orientation Session',
          description: 'Conduct orientation session for new volunteers',
          assignee: 'Training Team',
          duration: '1 day',
          status: 'in-progress',
          dependencies: ['1']
        },
        {
          id: '3',
          title: 'Role Assignment',
          description: 'Assign specific roles and responsibilities',
          assignee: 'Program Manager',
          duration: '1 day',
          status: 'pending',
          dependencies: ['2']
        }
      ],
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      progress: 66
    },
    {
      id: '2',
      name: 'Event Planning',
      description: 'Standard process for organizing community events',
      category: 'event',
      status: 'draft',
      steps: [
        {
          id: '1',
          title: 'Event Proposal',
          description: 'Create and submit event proposal',
          assignee: 'Event Coordinator',
          duration: '3 days',
          status: 'pending',
          dependencies: []
        },
        {
          id: '2',
          title: 'Budget Approval',
          description: 'Get budget approval from management',
          assignee: 'Finance Team',
          duration: '2 days',
          status: 'pending',
          dependencies: ['1']
        }
      ],
      createdAt: '2024-01-10',
      lastModified: '2024-01-12',
      progress: 0
    }
  ]);

  const [newProcess, setNewProcess] = useState<Omit<Process, 'id' | 'createdAt' | 'lastModified' | 'progress'>>({
    name: '',
    description: '',
    category: 'volunteer',
    status: 'draft',
    steps: []
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

  const handleCreateProcess = () => {
    if (newProcess.name && newProcess.description) {
      const process: Process = {
        ...newProcess,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        progress: 0
      };
      setProcesses([process, ...processes]);
      setNewProcess({
        name: '',
        description: '',
        category: 'volunteer',
        status: 'draft',
        steps: []
      });
      setActiveTab('processes');
    }
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setNewProcess(process);
    setActiveTab('create');
  };

  const handleUpdateProcess = () => {
    if (editingProcess && newProcess.name && newProcess.description) {
      const updatedProcess: Process = {
        ...newProcess,
        id: editingProcess.id,
        createdAt: editingProcess.createdAt,
        lastModified: new Date().toISOString().split('T')[0],
        progress: calculateProgress(newProcess.steps)
      };
      setProcesses(processes.map(p => p.id === editingProcess.id ? updatedProcess : p));
      setEditingProcess(null);
      setNewProcess({
        name: '',
        description: '',
        category: 'volunteer',
        status: 'draft',
        steps: []
      });
      setActiveTab('processes');
    }
  };

  const handleDeleteProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const handleDuplicateProcess = (process: Process) => {
    const duplicatedProcess: Process = {
      ...process,
      id: Date.now().toString(),
      name: `${process.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      progress: 0,
      steps: process.steps.map(step => ({ ...step, status: 'pending' as const }))
    };
    setProcesses([duplicatedProcess, ...processes]);
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
      steps: newProcess.steps.filter(s => s.id !== stepId)
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
      case 'draft': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'paused': return 'bg-orange-50 text-orange-700 border-orange-200';
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
              <Link href="/admin/Workshop" className="text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <Cog6ToothIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Process Makers</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('create')}
                className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium flex items-center gap-2"
              >
                <PlusCircleIcon className="w-4 h-4" />
                New Process
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'processes' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Processes ({processes.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'create' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {editingProcess ? 'Edit Process' : 'Create Process'}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Processes Tab */}
        {activeTab === 'processes' && (
          <div className="space-y-6">
            {processes.length === 0 ? (
              <div className="text-center py-12">
                <Cog6ToothIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No processes yet</h3>
                <p className="text-gray-600 mb-6">Create your first process to get started.</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-[#556B2F] text-white px-6 py-3 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium"
                >
                  Create Process
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {processes.map((process) => (
                  <div key={process.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(process.category)}`}>
                          {process.category}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(process.status)}`}>
                          {process.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProcess(process)}
                          className="text-gray-400 hover:text-[#556B2F] p-1"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProcess(process)}
                          className="text-gray-400 hover:text-[#556B2F] p-1"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProcess(process.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{process.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{process.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{process.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#556B2F] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${process.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Steps Preview */}
                    <div className="space-y-2 mb-4">
                      {process.steps.slice(0, 3).map((step, index) => {
                        const StatusIcon = getStepStatusIcon(step.status);
                        return (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            <StatusIcon className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 truncate">{step.title}</span>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStepStatusColor(step.status)}`}>
                              {step.status}
                            </span>
                          </div>
                        );
                      })}
                      {process.steps.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{process.steps.length - 3} more steps
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Modified {process.lastModified}</span>
                      <span>{process.steps.length} steps</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Process Tab */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editingProcess ? 'Edit Process' : 'Create New Process'}
              </h3>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Process Name</label>
                    <input
                      type="text"
                      value={newProcess.name}
                      onChange={(e) => setNewProcess({...newProcess, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="Enter process name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newProcess.category}
                      onChange={(e) => setNewProcess({...newProcess, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="project">Project</option>
                      <option value="event">Event</option>
                      <option value="fundraising">Fundraising</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newProcess.description}
                    onChange={(e) => setNewProcess({...newProcess, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    placeholder="Describe the process"
                  />
                </div>

                {/* Process Steps */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Process Steps</label>
                    <button
                      onClick={() => setShowStepModal(true)}
                      className="bg-[#556B2F] text-white px-3 py-1 rounded text-sm hover:bg-[#6B8E23] transition-colors flex items-center gap-1"
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newProcess.steps.map((step, index) => {
                      const StatusIcon = getStepStatusIcon(step.status);
                      return (
                        <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                                <StatusIcon className="w-4 h-4 text-gray-400" />
                                <span className={`text-xs px-2 py-1 rounded-full border ${getStepStatusColor(step.status)}`}>
                                  {step.status}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <UserIcon className="w-3 h-3" />
                                  <span>{step.assignee}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  <span>{step.duration}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {newProcess.steps.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Cog6ToothIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No steps added yet. Click "Add Step" to get started.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setActiveTab('processes');
                      setEditingProcess(null);
                      setNewProcess({
                        name: '',
                        description: '',
                        category: 'volunteer',
                        status: 'draft',
                        steps: []
                      });
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingProcess ? handleUpdateProcess : handleCreateProcess}
                    className="px-6 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
                  >
                    {editingProcess ? 'Update Process' : 'Create Process'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Volunteer Onboarding', category: 'volunteer', description: 'Standard process for new volunteer registration and orientation' },
              { name: 'Event Planning', category: 'event', description: 'Complete workflow for organizing community events' },
              { name: 'Project Management', category: 'project', description: 'Standard project lifecycle management process' },
              { name: 'Fundraising Campaign', category: 'fundraising', description: 'End-to-end fundraising campaign workflow' },
              { name: 'Grant Application', category: 'fundraising', description: 'Process for applying and managing grants' },
              { name: 'Training Program', category: 'volunteer', description: 'Structured training program for volunteers' },
            ].map((template, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <button className="w-full bg-[#556B2F] text-white py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Step Modal */}
        {showStepModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Process Step</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Step Title</label>
                  <input
                    type="text"
                    value={newStep.title}
                    onChange={(e) => setNewStep({...newStep, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    placeholder="Enter step title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newStep.description}
                    onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    placeholder="Describe the step"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                    <input
                      type="text"
                      value={newStep.assignee}
                      onChange={(e) => setNewStep({...newStep, assignee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="Who's responsible"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={newStep.duration}
                      onChange={(e) => setNewStep({...newStep, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="e.g., 2 days"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowStepModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStep}
                  className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23]"
                >
                  Add Step
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}