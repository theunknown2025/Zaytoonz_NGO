'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  StarIcon,
  ScaleIcon,
  HashtagIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { EvaluationTemplate, EvaluationCriteria, NewCriteria } from './types';
import {
  saveAdminEvaluationTemplate,
  updateAdminEvaluationTemplate
} from './services/evaluationService';
import toast from 'react-hot-toast';

interface NewEvaluationProps {
  editTemplate?: EvaluationTemplate | null;
  onSave?: () => void;
}

export default function NewEvaluation({ editTemplate, onSave }: NewEvaluationProps) {
  const [template, setTemplate] = useState<Omit<EvaluationTemplate, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    type: 'volunteer',
    criteria: [],
    status: 'draft',
    published: false,
    is_admin_template: true
  });

  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<EvaluationCriteria | null>(null);
  const [newCriteria, setNewCriteria] = useState<NewCriteria>({
    name: '',
    description: '',
    weight: 20,
    scale: 'rating',
    maxScore: 5,
    options: []
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTemplate) {
      setTemplate({
        title: editTemplate.title,
        description: editTemplate.description,
        type: editTemplate.type,
        criteria: editTemplate.criteria,
        status: editTemplate.status,
        published: editTemplate.published || false,
        is_admin_template: true
      });
    }
  }, [editTemplate]);

  const handleSave = async () => {
    if (!template.title.trim()) {
      toast.error('Please enter a template title');
      return;
    }

    if (!template.description.trim()) {
      toast.error('Please enter a template description');
      return;
    }

    if (template.criteria.length === 0) {
      toast.error('Please add at least one evaluation criteria');
      return;
    }

    try {
      setLoading(true);
      
      if (editTemplate) {
        await updateAdminEvaluationTemplate(editTemplate.id!, template);
        toast.success('Evaluation template updated successfully');
      } else {
        await saveAdminEvaluationTemplate(template);
        toast.success('Evaluation template saved successfully');
      }
      
      // Reset form
      setTemplate({
        title: '',
        description: '',
        type: 'volunteer',
        criteria: [],
        status: 'draft',
        published: false,
        is_admin_template: true
      });
      
      onSave?.();
    } catch (error) {
      toast.error('Failed to save evaluation template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriteria = () => {
    if (!newCriteria.name.trim()) {
      toast.error('Please enter criteria name');
      return;
    }

    const criteria: EvaluationCriteria = {
      id: editingCriteria?.id || Date.now().toString(),
      ...newCriteria
    };

    if (editingCriteria) {
      setTemplate(prev => ({
        ...prev,
        criteria: prev.criteria.map(c => c.id === editingCriteria.id ? criteria : c)
      }));
    } else {
      setTemplate(prev => ({
        ...prev,
        criteria: [...prev.criteria, criteria]
      }));
    }

    // Reset form and close modal
    setNewCriteria({
      name: '',
      description: '',
      weight: 20,
      scale: 'rating',
      maxScore: 5,
      options: []
    });
    setEditingCriteria(null);
    setShowCriteriaModal(false);
    normalizeWeights();
  };

  const handleEditCriteria = (criteria: EvaluationCriteria) => {
    setEditingCriteria(criteria);
    setNewCriteria({
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      scale: criteria.scale,
      maxScore: criteria.maxScore,
      options: criteria.options || []
    });
    setShowCriteriaModal(true);
  };

  const handleDeleteCriteria = (criteriaId: string) => {
    setTemplate(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== criteriaId)
    }));
    normalizeWeights();
  };

  const normalizeWeights = () => {
    setTimeout(() => {
      setTemplate(prev => {
        const totalWeight = prev.criteria.reduce((sum, c) => sum + c.weight, 0);
        if (totalWeight === 100) return prev;
        
        const normalizedCriteria = prev.criteria.map(c => ({
          ...c,
          weight: Math.round((c.weight / totalWeight) * 100)
        }));
        
        return { ...prev, criteria: normalizedCriteria };
      });
    }, 100);
  };

  const getScaleIcon = (scale: string) => {
    switch (scale) {
      case 'numeric': return <HashtagIcon className="w-4 h-4" />;
      case 'rating': return <StarIcon className="w-4 h-4" />;
      case 'boolean': return <CheckCircleIcon className="w-4 h-4" />;
      case 'text': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <ScaleIcon className="w-4 h-4" />;
    }
  };

  if (previewMode) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Preview: {template.title}</h2>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 inline mr-2" />
            Exit Preview
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
              {template.type}
            </span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{template.title}</h3>
            <p className="text-gray-600">{template.description}</p>
          </div>

          <div className="space-y-6">
            {template.criteria.map((criteria, index) => (
              <div key={criteria.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-800">{criteria.name}</h4>
                    <p className="text-gray-600 text-sm">{criteria.description}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {criteria.weight}%
                  </span>
                </div>

                <div className="mt-4">
                  {criteria.scale === 'rating' && (
                    <div className="flex space-x-2">
                      {Array.from({ length: criteria.maxScore || 5 }, (_, i) => (
                        <button
                          key={i}
                          className="w-8 h-8 border border-gray-300 rounded-full hover:bg-yellow-100 hover:border-yellow-300 transition-colors"
                        >
                          <StarIcon className="w-4 h-4 mx-auto text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {criteria.scale === 'numeric' && (
                    <input
                      type="number"
                      max={criteria.maxScore}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder={`Max: ${criteria.maxScore}`}
                    />
                  )}
                  
                  {criteria.scale === 'boolean' && (
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input type="radio" name={`criteria-${criteria.id}`} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name={`criteria-${criteria.id}`} className="mr-2" />
                        No
                      </label>
                    </div>
                  )}
                  
                  {criteria.scale === 'text' && (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Enter feedback..."
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {editTemplate ? 'Edit Evaluation Template' : 'Create New Evaluation Template'}
          </h2>
          <p className="text-gray-600">Design comprehensive evaluation forms for various purposes</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            disabled={template.criteria.length === 0}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#4a5d2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : editTemplate ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Title *
                </label>
                <input
                  type="text"
                  value={template.title}
                  onChange={(e) => setTemplate(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  placeholder="Enter template title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  placeholder="Describe the purpose of this evaluation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Type
                </label>
                <select
                  value={template.type}
                  onChange={(e) => setTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="project">Project</option>
                  <option value="event">Event</option>
                  <option value="program">Program</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={template.status}
                  onChange={(e) => setTemplate(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Evaluation Criteria</h3>
              <button
                onClick={() => setShowCriteriaModal(true)}
                className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#4a5d2a] transition-colors flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Criteria
              </button>
            </div>

            {template.criteria.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ScaleIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No criteria added yet. Add your first evaluation criteria to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {template.criteria.map((criteria, index) => (
                  <div key={criteria.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-gray-400 mr-3">{getScaleIcon(criteria.scale)}</span>
                          <h4 className="font-medium text-gray-800">{criteria.name}</h4>
                          <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {criteria.weight}%
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{criteria.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-4">Scale: {criteria.scale}</span>
                          {criteria.maxScore && <span>Max Score: {criteria.maxScore}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditCriteria(criteria)}
                          className="p-1 text-gray-400 hover:text-[#556B2F] transition-colors"
                          title="Edit"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCriteria(criteria.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{template.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{template.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Criteria Count:</span>
                <span className="font-medium">{template.criteria.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Weight:</span>
                <span className="font-medium">
                  {template.criteria.reduce((sum, c) => sum + c.weight, 0)}%
                </span>
              </div>
            </div>

            {template.criteria.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Weight Distribution</h4>
                <div className="space-y-2">
                  {template.criteria.map((criteria) => (
                    <div key={criteria.id} className="flex items-center text-xs">
                      <div className="flex-1 truncate" title={criteria.name}>
                        {criteria.name}
                      </div>
                      <div className="ml-2 text-gray-500">{criteria.weight}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingCriteria ? 'Edit Criteria' : 'Add New Criteria'}
                </h3>
                <button
                  onClick={() => {
                    setShowCriteriaModal(false);
                    setEditingCriteria(null);
                    setNewCriteria({
                      name: '',
                      description: '',
                      weight: 20,
                      scale: 'rating',
                      maxScore: 5,
                      options: []
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criteria Name *
                  </label>
                  <input
                    type="text"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="e.g., Communication Skills"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCriteria.description}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="Describe what this criteria evaluates"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale Type
                  </label>
                  <select
                    value={newCriteria.scale}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, scale: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  >
                    <option value="rating">Star Rating</option>
                    <option value="numeric">Numeric Score</option>
                    <option value="boolean">Yes/No</option>
                    <option value="text">Text Feedback</option>
                  </select>
                </div>

                {(newCriteria.scale === 'rating' || newCriteria.scale === 'numeric') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Score
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newCriteria.maxScore}
                      onChange={(e) => setNewCriteria(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCriteria.weight}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Weights will be automatically normalized to total 100%
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCriteriaModal(false);
                    setEditingCriteria(null);
                    setNewCriteria({
                      name: '',
                      description: '',
                      weight: 20,
                      scale: 'rating',
                      maxScore: 5,
                      options: []
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCriteria}
                  className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#4a5d2a] transition-colors"
                >
                  {editingCriteria ? 'Update Criteria' : 'Add Criteria'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 