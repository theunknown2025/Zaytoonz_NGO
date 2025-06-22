'use client';

import { useState } from 'react';
import { 
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  StarIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scale: 'numeric' | 'rating' | 'boolean' | 'text';
  maxScore?: number;
  options?: string[];
}

interface Evaluation {
  id: string;
  title: string;
  description: string;
  type: 'volunteer' | 'project' | 'event' | 'program';
  criteria: EvaluationCriteria[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  lastModified: string;
  responses: number;
  averageScore?: number;
}

export default function EvaluationMaker() {
  const [activeTab, setActiveTab] = useState<'evaluations' | 'create' | 'analytics'>('evaluations');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([
    {
      id: '1',
      title: 'Volunteer Performance Review',
      description: 'Quarterly evaluation for volunteer performance and engagement',
      type: 'volunteer',
      criteria: [
        {
          id: '1',
          name: 'Reliability',
          description: 'Consistency in attendance and commitment',
          weight: 30,
          scale: 'rating',
          maxScore: 5
        },
        {
          id: '2',
          name: 'Communication Skills',
          description: 'Effectiveness in communication with team and beneficiaries',
          weight: 25,
          scale: 'rating',
          maxScore: 5
        },
        {
          id: '3',
          name: 'Initiative',
          description: 'Proactive approach and problem-solving abilities',
          weight: 25,
          scale: 'rating',
          maxScore: 5
        },
        {
          id: '4',
          name: 'Team Collaboration',
          description: 'Ability to work effectively with others',
          weight: 20,
          scale: 'rating',
          maxScore: 5
        }
      ],
      status: 'active',
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      responses: 24,
      averageScore: 4.2
    },
    {
      id: '2',
      title: 'Community Event Assessment',
      description: 'Post-event evaluation for community outreach programs',
      type: 'event',
      criteria: [
        {
          id: '1',
          name: 'Event Organization',
          description: 'Quality of planning and execution',
          weight: 40,
          scale: 'numeric',
          maxScore: 100
        },
        {
          id: '2',
          name: 'Community Impact',
          description: 'Positive impact on the community',
          weight: 35,
          scale: 'rating',
          maxScore: 5
        },
        {
          id: '3',
          name: 'Resource Efficiency',
          description: 'Effective use of resources and budget',
          weight: 25,
          scale: 'rating',
          maxScore: 5
        }
      ],
      status: 'draft',
      createdAt: '2024-01-10',
      lastModified: '2024-01-12',
      responses: 0
    }
  ]);

  const [newEvaluation, setNewEvaluation] = useState<Omit<Evaluation, 'id' | 'createdAt' | 'lastModified' | 'responses' | 'averageScore'>>({
    title: '',
    description: '',
    type: 'volunteer',
    criteria: [],
    status: 'draft'
  });

  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [newCriteria, setNewCriteria] = useState<Omit<EvaluationCriteria, 'id'>>({
    name: '',
    description: '',
    weight: 20,
    scale: 'rating',
    maxScore: 5,
    options: []
  });

  const handleCreateEvaluation = () => {
    if (newEvaluation.title && newEvaluation.description) {
      const evaluation: Evaluation = {
        ...newEvaluation,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        responses: 0
      };
      setEvaluations([evaluation, ...evaluations]);
      setNewEvaluation({
        title: '',
        description: '',
        type: 'volunteer',
        criteria: [],
        status: 'draft'
      });
      setActiveTab('evaluations');
    }
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setNewEvaluation(evaluation);
    setActiveTab('create');
  };

  const handleUpdateEvaluation = () => {
    if (editingEvaluation && newEvaluation.title && newEvaluation.description) {
      const updatedEvaluation: Evaluation = {
        ...newEvaluation,
        id: editingEvaluation.id,
        createdAt: editingEvaluation.createdAt,
        lastModified: new Date().toISOString().split('T')[0],
        responses: editingEvaluation.responses,
        averageScore: editingEvaluation.averageScore
      };
      setEvaluations(evaluations.map(e => e.id === editingEvaluation.id ? updatedEvaluation : e));
      setEditingEvaluation(null);
      setNewEvaluation({
        title: '',
        description: '',
        type: 'volunteer',
        criteria: [],
        status: 'draft'
      });
      setActiveTab('evaluations');
    }
  };

  const handleDeleteEvaluation = (id: string) => {
    setEvaluations(evaluations.filter(e => e.id !== id));
  };

  const handleDuplicateEvaluation = (evaluation: Evaluation) => {
    const duplicatedEvaluation: Evaluation = {
      ...evaluation,
      id: Date.now().toString(),
      title: `${evaluation.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      responses: 0,
      averageScore: undefined
    };
    setEvaluations([duplicatedEvaluation, ...evaluations]);
  };

  const handleAddCriteria = () => {
    if (newCriteria.name && newCriteria.description) {
      const criteria: EvaluationCriteria = {
        ...newCriteria,
        id: Date.now().toString()
      };
      setNewEvaluation({
        ...newEvaluation,
        criteria: [...newEvaluation.criteria, criteria]
      });
      setNewCriteria({
        name: '',
        description: '',
        weight: 20,
        scale: 'rating',
        maxScore: 5,
        options: []
      });
      setShowCriteriaModal(false);
    }
  };

  const handleDeleteCriteria = (criteriaId: string) => {
    setNewEvaluation({
      ...newEvaluation,
      criteria: newEvaluation.criteria.filter(c => c.id !== criteriaId)
    });
  };

  const normalizeWeights = () => {
    const totalWeight = newEvaluation.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100 && newEvaluation.criteria.length > 0) {
      const factor = 100 / totalWeight;
      setNewEvaluation({
        ...newEvaluation,
        criteria: newEvaluation.criteria.map(c => ({
          ...c,
          weight: Math.round(c.weight * factor)
        }))
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'volunteer': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'project': return 'bg-green-50 text-green-700 border-green-200';
      case 'event': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'program': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'draft': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getScaleIcon = (scale: string) => {
    switch (scale) {
      case 'rating': return StarIcon;
      case 'numeric': return ChartBarIcon;
      case 'boolean': return CheckCircleIcon;
      case 'text': return PencilSquareIcon;
      default: return ChartBarIcon;
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
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Evaluation Maker</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('create')}
                className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium flex items-center gap-2"
              >
                <PlusCircleIcon className="w-4 h-4" />
                New Evaluation
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'evaluations' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Evaluations ({evaluations.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'create' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {editingEvaluation ? 'Edit Evaluation' : 'Create Evaluation'}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Evaluations Tab */}
        {activeTab === 'evaluations' && (
          <div className="space-y-6">
            {evaluations.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations yet</h3>
                <p className="text-gray-600 mb-6">Create your first evaluation to get started.</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-[#556B2F] text-white px-6 py-3 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium"
                >
                  Create Evaluation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(evaluation.type)}`}>
                          {evaluation.type}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(evaluation.status)}`}>
                          {evaluation.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditEvaluation(evaluation)}
                          className="text-gray-400 hover:text-[#556B2F] p-1"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateEvaluation(evaluation)}
                          className="text-gray-400 hover:text-[#556B2F] p-1"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvaluation(evaluation.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{evaluation.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{evaluation.description}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#556B2F]">{evaluation.criteria.length}</div>
                        <div className="text-xs text-gray-500">Criteria</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#556B2F]">{evaluation.responses}</div>
                        <div className="text-xs text-gray-500">Responses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#556B2F]">
                          {evaluation.averageScore ? evaluation.averageScore.toFixed(1) : '-'}
                        </div>
                        <div className="text-xs text-gray-500">Avg Score</div>
                      </div>
                    </div>

                    {/* Criteria Preview */}
                    <div className="space-y-2 mb-4">
                      {evaluation.criteria.slice(0, 3).map((criteria) => {
                        const ScaleIcon = getScaleIcon(criteria.scale);
                        return (
                          <div key={criteria.id} className="flex items-center gap-3 text-sm">
                            <ScaleIcon className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 truncate">{criteria.name}</span>
                            <span className="text-xs text-gray-500">{criteria.weight}%</span>
                          </div>
                        );
                      })}
                      {evaluation.criteria.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{evaluation.criteria.length - 3} more criteria
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Modified {evaluation.lastModified}</span>
                      {evaluation.status === 'active' && (
                        <button className="text-[#556B2F] hover:text-[#6B8E23] flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          View Results
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Evaluation Tab */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editingEvaluation ? 'Edit Evaluation' : 'Create New Evaluation'}
              </h3>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Title</label>
                    <input
                      type="text"
                      value={newEvaluation.title}
                      onChange={(e) => setNewEvaluation({...newEvaluation, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder="Enter evaluation title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newEvaluation.type}
                      onChange={(e) => setNewEvaluation({...newEvaluation, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="project">Project</option>
                      <option value="event">Event</option>
                      <option value="program">Program</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newEvaluation.description}
                    onChange={(e) => setNewEvaluation({...newEvaluation, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    placeholder="Describe the evaluation purpose and scope"
                  />
                </div>

                {/* Evaluation Criteria */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Evaluation Criteria</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={normalizeWeights}
                        className="text-sm text-[#556B2F] hover:text-[#6B8E23] underline"
                      >
                        Normalize Weights
                      </button>
                      <button
                        onClick={() => setShowCriteriaModal(true)}
                        className="bg-[#556B2F] text-white px-3 py-1 rounded text-sm hover:bg-[#6B8E23] transition-colors flex items-center gap-1"
                      >
                        <PlusCircleIcon className="w-4 h-4" />
                        Add Criteria
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {newEvaluation.criteria.map((criteria) => {
                      const ScaleIcon = getScaleIcon(criteria.scale);
                      return (
                        <div key={criteria.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <ScaleIcon className="w-4 h-4 text-[#556B2F]" />
                                <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                                <span className="text-sm bg-[#556B2F] text-white px-2 py-1 rounded">
                                  {criteria.weight}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{criteria.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="capitalize">{criteria.scale} scale</span>
                                {criteria.maxScore && <span>Max: {criteria.maxScore}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCriteria(criteria.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {newEvaluation.criteria.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No criteria added yet. Click "Add Criteria" to get started.</p>
                    </div>
                  )}

                  {newEvaluation.criteria.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Weight:</span>
                        <span className={`font-medium ${
                          newEvaluation.criteria.reduce((sum, c) => sum + c.weight, 0) === 100 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {newEvaluation.criteria.reduce((sum, c) => sum + c.weight, 0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setActiveTab('evaluations');
                      setEditingEvaluation(null);
                      setNewEvaluation({
                        title: '',
                        description: '',
                        type: 'volunteer',
                        criteria: [],
                        status: 'draft'
                      });
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingEvaluation ? handleUpdateEvaluation : handleCreateEvaluation}
                    className="px-6 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
                  >
                    {editingEvaluation ? 'Update Evaluation' : 'Create Evaluation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardDocumentCheckIcon className="w-8 h-8 text-[#556B2F]" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{evaluations.length}</div>
                    <div className="text-sm text-gray-600">Total Evaluations</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <UserGroupIcon className="w-8 h-8 text-[#556B2F]" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {evaluations.reduce((sum, e) => sum + e.responses, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Responses</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <StarIcon className="w-8 h-8 text-[#556B2F]" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {evaluations.filter(e => e.averageScore).length > 0 
                        ? (evaluations.filter(e => e.averageScore).reduce((sum, e) => sum + (e.averageScore || 0), 0) / evaluations.filter(e => e.averageScore).length).toFixed(1)
                        : '-'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Performance</h3>
              <div className="space-y-4">
                {evaluations.filter(e => e.status === 'active' || e.status === 'completed').map((evaluation) => (
                  <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{evaluation.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(evaluation.type)}`}>
                          {evaluation.type}
                        </span>
                        <span className="text-sm text-gray-600">{evaluation.responses} responses</span>
                      </div>
                    </div>
                    {evaluation.averageScore && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#556B2F] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(evaluation.averageScore / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {evaluation.averageScore.toFixed(1)}/5.0
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Criteria Modal */}
        {showCriteriaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Evaluation Criteria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Criteria Name</label>
                  <input
                    type="text"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria({...newCriteria, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    placeholder="Enter criteria name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newCriteria.description}
                    onChange={(e) => setNewCriteria({...newCriteria, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    placeholder="Describe what this criteria evaluates"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scale Type</label>
                    <select
                      value={newCriteria.scale}
                      onChange={(e) => setNewCriteria({...newCriteria, scale: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    >
                      <option value="rating">Rating (1-5)</option>
                      <option value="numeric">Numeric</option>
                      <option value="boolean">Yes/No</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newCriteria.weight}
                      onChange={(e) => setNewCriteria({...newCriteria, weight: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>
                </div>
                {(newCriteria.scale === 'numeric' || newCriteria.scale === 'rating') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Score</label>
                    <input
                      type="number"
                      min="1"
                      value={newCriteria.maxScore || ''}
                      onChange={(e) => setNewCriteria({...newCriteria, maxScore: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                      placeholder={newCriteria.scale === 'rating' ? '5' : '100'}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCriteriaModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCriteria}
                  className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23]"
                >
                  Add Criteria
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
