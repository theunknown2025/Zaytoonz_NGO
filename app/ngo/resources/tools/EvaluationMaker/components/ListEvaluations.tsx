'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Evaluation {
  id: string;
  name: string;
  description: string;
  scale: number;
  criteria: Array<{
    label: string;
    value: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function ListEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = () => {
    try {
      const stored = localStorage.getItem('evaluations');
      if (stored) {
        setEvaluations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvaluation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
      const updatedEvaluations = evaluations.filter(evaluation => evaluation.id !== id);
      setEvaluations(updatedEvaluations);
      localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
      
      if (selectedEvaluation?.id === id) {
        setSelectedEvaluation(null);
      }
    }
  };

  const startEditing = (evaluation: Evaluation) => {
    setEditingEvaluation({ ...evaluation });
  };

  const saveEdit = () => {
    if (!editingEvaluation) return;

    const updatedEvaluations = evaluations.map(evaluation => 
      evaluation.id === editingEvaluation.id 
        ? { ...editingEvaluation, updated_at: new Date().toISOString() }
        : evaluation
    );
    
    setEvaluations(updatedEvaluations);
    localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
    setEditingEvaluation(null);
    
    if (selectedEvaluation?.id === editingEvaluation.id) {
      setSelectedEvaluation(editingEvaluation);
    }
  };

  const cancelEdit = () => {
    setEditingEvaluation(null);
  };

  const updateEditingCriterion = (index: number, field: 'label' | 'value', value: string | number) => {
    if (!editingEvaluation) return;
    
    const newCriteria = [...editingEvaluation.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    
    setEditingEvaluation({
      ...editingEvaluation,
      criteria: newCriteria
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Saved Evaluations</h2>
        <div className="text-sm text-gray-600">
          {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {evaluations.length === 0 ? (
        <div className="text-center py-12">
          <ChartPieIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Evaluations Yet</h3>
          <p className="text-gray-500">Create your first evaluation template to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Evaluations List */}
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div 
                key={evaluation.id} 
                className={`bg-white border rounded-lg p-4 transition-all duration-200 ${
                  selectedEvaluation?.id === evaluation.id 
                    ? 'border-[#556B2F] shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{evaluation.name}</h3>
                    {evaluation.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{evaluation.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Scale: 1-{evaluation.scale}</span>
                      <span>{evaluation.criteria.length} criteria</span>
                      <span>Created: {formatDate(evaluation.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className="p-2 text-gray-600 hover:text-[#556B2F] hover:bg-gray-50 rounded-md transition-colors"
                      title="View details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditing(evaluation)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit evaluation"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvaluation(evaluation.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete evaluation"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Details/Preview */}
          <div className="lg:pl-6">
            <div className="sticky top-6">
              {selectedEvaluation ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedEvaluation.name}
                  </h3>
                  
                  {selectedEvaluation.description && (
                    <p className="text-gray-600 mb-4">{selectedEvaluation.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Radar Chart</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart 
                          data={selectedEvaluation.criteria.map(c => ({
                            subject: c.label,
                            value: c.value,
                            fullMark: selectedEvaluation.scale
                          }))}
                          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                        >
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fontSize: 11, fill: '#374151' }}
                          />
                          <PolarRadiusAxis 
                            angle={0} 
                            domain={[0, selectedEvaluation.scale]} 
                            tick={{ fontSize: 9, fill: '#6b7280' }}
                            tickCount={selectedEvaluation.scale + 1}
                          />
                          <Radar
                            name="Evaluation"
                            dataKey="value"
                            stroke="#556B2F"
                            fill="#556B2F"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Criteria Details</h4>
                    <div className="space-y-2">
                      {selectedEvaluation.criteria.map((criterion, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{criterion.label}</span>
                          <span className="font-medium text-gray-900">
                            {criterion.value}/{selectedEvaluation.scale}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <p>Last updated: {formatDate(selectedEvaluation.updated_at)}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  <ChartPieIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select an evaluation to view details and preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Evaluation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evaluation Name
                  </label>
                  <input
                    type="text"
                    value={editingEvaluation.name}
                    onChange={(e) => setEditingEvaluation({
                      ...editingEvaluation,
                      name: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingEvaluation.description}
                    onChange={(e) => setEditingEvaluation({
                      ...editingEvaluation,
                      description: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criteria
                  </label>
                  <div className="space-y-3">
                    {editingEvaluation.criteria.map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={criterion.label}
                            onChange={(e) => updateEditingCriterion(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            max={editingEvaluation.scale}
                            value={criterion.value}
                            onChange={(e) => updateEditingCriterion(index, 'value', Number(e.target.value))}
                            className="w-full px-2 py-2 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 