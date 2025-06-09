'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Criterion {
  id: string;
  label: string;
  value: number;
}

export default function NewEvaluation() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scale, setScale] = useState(5);
  const [numberOfCriteria, setNumberOfCriteria] = useState(5);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize criteria when numberOfCriteria changes
  useEffect(() => {
    const newCriteria: Criterion[] = [];
    for (let i = 0; i < numberOfCriteria; i++) {
      const existingCriterion = criteria[i];
      newCriteria.push({
        id: `criterion_${i + 1}`,
        label: existingCriterion?.label || `Criterion ${i + 1}`,
        value: existingCriterion?.value || Math.floor(scale / 2)
      });
    }
    setCriteria(newCriteria);
  }, [numberOfCriteria, scale]);

  const updateCriterion = (index: number, field: 'label' | 'value', value: string | number) => {
    setCriteria(prev => prev.map((criterion, i) => 
      i === index ? { ...criterion, [field]: value } : criterion
    ));
  };

  const addCriterion = () => {
    const newCriterion: Criterion = {
      id: `criterion_${criteria.length + 1}`,
      label: `Criterion ${criteria.length + 1}`,
      value: Math.floor(scale / 2)
    };
    setCriteria(prev => [...prev, newCriterion]);
    setNumberOfCriteria(prev => prev + 1);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(prev => prev.filter((_, i) => i !== index));
      setNumberOfCriteria(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name for the evaluation');
      return;
    }

    if (criteria.length === 0) {
      alert('Please add at least one criterion');
      return;
    }

    setIsSaving(true);
    try {
      const evaluationData = {
        name: name.trim(),
        description: description.trim(),
        scale,
        criteria: criteria.map(c => ({
          label: c.label,
          value: c.value
        }))
      };

      // For now, we'll save to localStorage since we can't access the database
      const existingEvaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
      const newEvaluation = {
        id: `eval_${Date.now()}`,
        ...evaluationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      existingEvaluations.push(newEvaluation);
      localStorage.setItem('evaluations', JSON.stringify(existingEvaluations));

      // Reset form
      setName('');
      setDescription('');
      setScale(5);
      setNumberOfCriteria(5);
      
      alert('Evaluation template saved successfully!');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Error saving evaluation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Prepare data for radar chart
  const radarData = criteria.map(criterion => ({
    subject: criterion.label,
    value: criterion.value,
    fullMark: scale
  }));

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Evaluation</h2>
            
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  placeholder="e.g., Volunteer Application Assessment"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  placeholder="Describe the purpose and scope of this evaluation..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scale" className="block text-sm font-medium text-gray-700 mb-2">
                    Scale (1 to...)
                  </label>
                  <select
                    id="scale"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  >
                    <option value={5}>5 (1-5)</option>
                    <option value={7}>7 (1-7)</option>
                    <option value={10}>10 (1-10)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="numberOfCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Criteria
                  </label>
                  <input
                    type="number"
                    id="numberOfCriteria"
                    min="1"
                    max="20"
                    value={numberOfCriteria}
                    onChange={(e) => setNumberOfCriteria(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Management */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Evaluation Criteria</h3>
              <button
                onClick={addCriterion}
                className="inline-flex items-center px-3 py-1 text-sm bg-[#556B2F] text-white rounded-md hover:bg-[#6B8E23] transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {criteria.map((criterion, index) => (
                <div key={criterion.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={criterion.label}
                      onChange={(e) => updateCriterion(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                      placeholder={`Criterion ${index + 1}`}
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      max={scale}
                      value={criterion.value}
                      onChange={(e) => updateCriterion(index, 'value', Number(e.target.value))}
                      className="w-full px-2 py-2 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => removeCriterion(index)}
                    disabled={criteria.length <= 1}
                    className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white font-medium rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Save Evaluation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Radar Chart Preview */}
        <div className="lg:pl-6">
          <div className="sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center mb-4">
                <h4 className="font-medium text-gray-800">{name || 'Evaluation Preview'}</h4>
                <p className="text-sm text-gray-600 mt-1">Scale: 1 - {scale}</p>
              </div>
              
              {criteria.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fontSize: 12, fill: '#374151' }}
                        className="text-xs"
                      />
                      <PolarRadiusAxis 
                        angle={0} 
                        domain={[0, scale]} 
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickCount={scale + 1}
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
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <p>Add criteria to see the radar chart</p>
                </div>
              )}
              
              {/* Criteria Summary */}
              <div className="mt-4 space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Criteria:</h5>
                {criteria.length > 0 ? (
                  <div className="space-y-1">
                    {criteria.map((criterion, index) => (
                      <div key={criterion.id} className="flex justify-between text-xs text-gray-600">
                        <span>{criterion.label}</span>
                        <span>{criterion.value}/{scale}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No criteria defined yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 