'use client';

import { useState, useEffect } from 'react';
import { 
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon
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
  id?: string;
  title: string;
  description: string;
  type: 'volunteer' | 'project' | 'event' | 'program';
  criteria: EvaluationCriteria[];
  published: boolean;
  is_admin_template: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function EvaluationMakerDatabase() {
  const [activeTab, setActiveTab] = useState<'templates' | 'create'>('templates');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);

  const [newEvaluation, setNewEvaluation] = useState<Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    type: 'volunteer',
    criteria: [],
    published: false,
    is_admin_template: true
  });

  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/evaluation-templates');
      const data = await response.json();
      
      if (response.ok) {
        setEvaluations(data.templates || []);
      } else {
        console.error('Failed to fetch evaluations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvaluation = async () => {
    if (!newEvaluation.title.trim()) {
      alert('Please enter an evaluation title');
      return;
    }

    try {
      setLoading(true);
      const evaluationData = {
        ...newEvaluation,
        user_id: 'admin-user-id' // TODO: Get actual admin user ID
      };

      const isEditing = editingEvaluation !== null;
      const url = '/api/admin/evaluation-templates';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const payload = isEditing 
        ? { ...evaluationData, id: editingEvaluation.id }
        : evaluationData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Evaluation ${isEditing ? 'updated' : 'saved'} successfully!`);
        await fetchEvaluations();
        resetForm();
        setActiveTab('templates');
      } else {
        alert(data.error || `Failed to ${isEditing ? 'update' : 'save'} evaluation`);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('An error occurred while saving the evaluation');
    } finally {
      setLoading(false);
    }
  };

  const editEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setNewEvaluation(evaluation);
    setActiveTab('create');
  };

  const deleteEvaluation = async (evaluationId: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/evaluation-templates?id=${evaluationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Evaluation deleted successfully!');
        await fetchEvaluations();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete evaluation');
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      alert('An error occurred while deleting the evaluation');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (evaluationId: string, currentPublished: boolean) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: evaluationId,
          templateType: 'evaluation',
          published: !currentPublished
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await fetchEvaluations();
      } else {
        alert(data.error || 'Failed to update evaluation status');
      }
    } catch (error) {
      console.error('Error updating evaluation status:', error);
      alert('An error occurred while updating the evaluation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingEvaluation(null);
    setNewEvaluation({
      title: '',
      description: '',
      type: 'volunteer',
      criteria: [],
      published: false,
      is_admin_template: true
    });
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
              {activeTab === 'create' && (
                <>
                  <button 
                    onClick={saveEvaluation}
                    disabled={loading}
                    className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingEvaluation ? 'Update Evaluation' : 'Save Evaluation')}
                  </button>
                  <button 
                    onClick={resetForm}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Reset Form
                  </button>
                </>
              )}
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
            Admin Templates
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
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Evaluation Templates</h2>
                <p className="text-gray-600">Manage evaluation templates that will be available to NGOs</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('create');
                }}
                className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium flex items-center gap-2"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Create New Evaluation
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F]"></div>
                <p className="text-gray-600 mt-2">Loading evaluations...</p>
              </div>
            )}

            {/* Evaluations Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evaluations.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations yet</h3>
                    <p className="text-gray-600 mb-4">Create your first evaluation template to get started</p>
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('create');
                      }}
                      className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium"
                    >
                      Create Evaluation
                    </button>
                  </div>
                ) : (
                  evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(evaluation.type)}`}>
                              {evaluation.type}
                            </span>
                            {evaluation.published ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <GlobeAltIcon className="w-3 h-3 mr-1" />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                                Draft
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{evaluation.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{evaluation.description}</p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        Created: {new Date(evaluation.created_at || '').toLocaleDateString()}
                        {evaluation.criteria && (
                          <span className="ml-2">• {evaluation.criteria.length} criteria</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editEvaluation(evaluation)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => evaluation.id && togglePublish(evaluation.id, evaluation.published)}
                            disabled={loading}
                            className={`flex-1 py-2 px-3 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-1 ${
                              evaluation.published
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-[#556B2F] text-white hover:bg-[#6B8E23]'
                            }`}
                          >
                            <GlobeAltIcon className="w-4 h-4" />
                            {evaluation.published ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                        <button
                          onClick={() => evaluation.id && deleteEvaluation(evaluation.id)}
                          disabled={loading}
                          className="w-full bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Evaluation Tab */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingEvaluation ? 'Edit Evaluation' : 'Create New Evaluation'}
              </h2>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newEvaluation.title}
                      onChange={(e) => setNewEvaluation({...newEvaluation, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
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
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Criteria</label>
                  <p className="text-sm text-gray-600 mb-4">Define the criteria that will be used to evaluate performance</p>
                  
                  {newEvaluation.criteria.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No criteria added yet</p>
                      <p className="text-sm text-gray-500">Add evaluation criteria to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {newEvaluation.criteria.map((criteria, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{criteria.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Weight: {criteria.weight}%</span>
                                <span>Scale: {criteria.scale}</span>
                                {criteria.maxScore && <span>Max Score: {criteria.maxScore}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const updatedCriteria = newEvaluation.criteria.filter((_, i) => i !== index);
                                setNewEvaluation({...newEvaluation, criteria: updatedCriteria});
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={() => {
                        const newCriteria = {
                          id: Date.now().toString(),
                          name: 'New Criteria',
                          description: 'Description for this criteria',
                          weight: 20,
                          scale: 'rating' as const,
                          maxScore: 5
                        };
                        setNewEvaluation({
                          ...newEvaluation, 
                          criteria: [...newEvaluation.criteria, newCriteria]
                        });
                      }}
                      className="text-[#556B2F] hover:text-[#6B8E23] text-sm font-medium flex items-center gap-1"
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      Add Criteria
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 