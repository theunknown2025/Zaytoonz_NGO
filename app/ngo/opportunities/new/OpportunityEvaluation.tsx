'use client';

import { useState, useEffect } from 'react';
import { ChartPieIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

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

interface OpportunityEvaluationProps {
  opportunityId: string;
  selectedEvaluationId: string;
  onEvaluationSelect: (evaluationId: string, evaluationName: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function OpportunityEvaluation({
  opportunityId,
  selectedEvaluationId,
  onEvaluationSelect,
  onPrevious,
  onNext
}: OpportunityEvaluationProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvaluations();
  }, []);

  // Load selected evaluation details when selectedEvaluationId changes
  useEffect(() => {
    if (selectedEvaluationId && evaluations.length > 0) {
      const evaluation = evaluations.find(evaluation => evaluation.id === selectedEvaluationId);
      if (evaluation) {
        setSelectedEvaluation(evaluation);
      }
    } else {
      setSelectedEvaluation(null);
    }
  }, [selectedEvaluationId, evaluations]);

  const loadEvaluations = async () => {
    try {
      // First try to load from API
      try {
        const response = await fetch('/api/evaluations');
        if (response.ok) {
          const evaluationList = await response.json();
          setEvaluations(evaluationList);
          // Save to localStorage for offline access
          localStorage.setItem('evaluations', JSON.stringify(evaluationList));
          console.log('✅ Loaded evaluation templates from API:', evaluationList.length);
          return;
        }
      } catch (apiError) {
        console.warn('⚠️ Failed to fetch evaluations from API, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('evaluations');
      if (stored) {
        const evaluationList = JSON.parse(stored);
        setEvaluations(evaluationList);
        console.log('✅ Loaded evaluation templates from localStorage:', evaluationList.length);
      } else {
        // Create fallback evaluation templates if none exist
        const fallbackEvaluations = [
          {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Technical Skills Assessment',
            description: 'Evaluate technical competencies and problem-solving abilities',
            scale: 10,
            criteria: [
              { label: 'Technical Skills', value: 10 },
              { label: 'Problem Solving', value: 10 },
              { label: 'Communication', value: 10 },
              { label: 'Teamwork', value: 10 },
              { label: 'Leadership', value: 10 }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Leadership Potential',
            description: 'Assess leadership qualities and management capabilities',
            scale: 5,
            criteria: [
              { label: 'Vision', value: 5 },
              { label: 'Decision Making', value: 5 },
              { label: 'Team Management', value: 5 },
              { label: 'Strategic Thinking', value: 5 }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Cultural Fit',
            description: 'Evaluate alignment with organizational values and culture',
            scale: 10,
            criteria: [
              { label: 'Values Alignment', value: 10 },
              { label: 'Adaptability', value: 10 },
              { label: 'Initiative', value: 10 },
              { label: 'Collaboration', value: 10 }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setEvaluations(fallbackEvaluations);
        localStorage.setItem('evaluations', JSON.stringify(fallbackEvaluations));
        console.log('✅ Created fallback evaluation templates');
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationSelection = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    onEvaluationSelect(evaluation.id, evaluation.name);
  };

  const handleSkipEvaluation = () => {
    setSelectedEvaluation(null);
    onEvaluationSelect('', 'No Evaluation Selected');
  };

  const saveEvaluationChoice = async () => {
    if (!selectedEvaluationId && !selectedEvaluation) {
      // No evaluation selected, but that's allowed
      onNext();
      return;
    }

    setSaving(true);
    try {
      // For now, we'll just proceed since we're using localStorage
      // In the future, this would save the evaluation choice to the database
      // using the opportunity_evaluation table

      console.log('Saving evaluation choice:', {
        opportunityId,
        evaluationId: selectedEvaluationId || selectedEvaluation?.id,
        evaluationName: selectedEvaluation?.name || 'No Evaluation Selected'
      });

      onNext();
    } catch (error) {
      console.error('Error saving evaluation choice:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Evaluation Template</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select an evaluation template to assess applicants for this opportunity, or proceed without an evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Evaluation Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Available Evaluations</h3>
            <Link
              href="/ngo/resources/tools/EvaluationMaker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm bg-[#556B2F] text-white rounded-md hover:bg-[#6B8E23] transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Create New
            </Link>
          </div>

          {evaluations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <ChartPieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Evaluations Available</h4>
              <p className="text-gray-500 mb-4">You haven't created any evaluation templates yet.</p>
              <Link
                href="/ngo/resources/tools/EvaluationMaker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Evaluation
              </Link>
            </div>
          ) : (
            <>
              {/* Option to skip evaluation */}
              <div 
                className={`
                  cursor-pointer rounded-lg p-4 border-2 transition-all duration-200
                  ${(!selectedEvaluationId && !selectedEvaluation) 
                    ? 'border-[#556B2F] bg-[#556B2F]/10 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
                onClick={handleSkipEvaluation}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">No Evaluation</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Proceed without an evaluation template. You can manually review applications.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className={`
                      w-4 h-4 rounded-full border-2 
                      ${(!selectedEvaluationId && !selectedEvaluation) 
                        ? 'border-[#556B2F] bg-[#556B2F]' 
                        : 'border-gray-300'
                      }
                    `}>
                      {(!selectedEvaluationId && !selectedEvaluation) && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation options */}
              <div className="space-y-3">
                {evaluations.map((evaluation) => (
                  <div 
                    key={evaluation.id}
                    className={`
                      cursor-pointer rounded-lg p-4 border-2 transition-all duration-200
                      ${selectedEvaluationId === evaluation.id || selectedEvaluation?.id === evaluation.id
                        ? 'border-[#556B2F] bg-[#556B2F]/10 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                    onClick={() => handleEvaluationSelection(evaluation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{evaluation.name}</h4>
                        {evaluation.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {evaluation.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>Scale: 1-{evaluation.scale}</span>
                          <span>{evaluation.criteria.length} criteria</span>
                          <span>Created: {formatDate(evaluation.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvaluation(evaluation);
                          }}
                          className="p-2 text-gray-600 hover:text-[#556B2F] hover:bg-gray-50 rounded-md transition-colors"
                          title="View details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <div className={`
                          w-4 h-4 rounded-full border-2 
                          ${selectedEvaluationId === evaluation.id || selectedEvaluation?.id === evaluation.id
                            ? 'border-[#556B2F] bg-[#556B2F]' 
                            : 'border-gray-300'
                          }
                        `}>
                          {(selectedEvaluationId === evaluation.id || selectedEvaluation?.id === evaluation.id) && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="lg:pl-6">
          <div className="sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            
            {selectedEvaluation ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-800 mb-2">{selectedEvaluation.name}</h4>
                
                {selectedEvaluation.description && (
                  <p className="text-gray-600 mb-4 text-sm">{selectedEvaluation.description}</p>
                )}
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Evaluation Radar Chart</h5>
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
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Evaluation Criteria</h5>
                  <div className="space-y-2">
                    {selectedEvaluation.criteria.map((criterion, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{criterion.label}</span>
                        <span className="font-medium text-gray-900">
                          Default: {criterion.value}/{selectedEvaluation.scale}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                <ChartPieIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                {(!selectedEvaluationId && !selectedEvaluation) ? (
                  <>
                    <p className="font-medium">No Evaluation Selected</p>
                    <p className="text-sm mt-1">Proceeding without an evaluation template</p>
                  </>
                ) : (
                  <p>Select an evaluation to see its preview</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="pt-5">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={saveEvaluationChoice}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Continue to Review'}
          </button>
        </div>
      </div>
    </div>
  );
} 