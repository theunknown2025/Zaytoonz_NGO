'use client';

import { useState, useEffect } from 'react';
import { ChartPieIcon, StarIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface EvaluationTemplate {
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

interface EvaluationResult {
  criteria: Array<{
    label: string;
    score: number;
  }>;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  notes: string;
  evaluatedAt: string;
  evaluatedBy: string;
}

interface ApplicationEvaluationProps {
  applicationId: string;
  opportunityId: string;
  applicantName: string;
  onEvaluationSaved?: () => void;
}

export default function ApplicationEvaluation({
  applicationId,
  opportunityId,
  applicantName,
  onEvaluationSaved
}: ApplicationEvaluationProps) {
  const [evaluationTemplate, setEvaluationTemplate] = useState<EvaluationTemplate | null>(null);
  const [existingEvaluation, setExistingEvaluation] = useState<EvaluationResult | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluationData();
  }, [opportunityId, applicationId]);

  const loadEvaluationData = async () => {
    try {
      setLoading(true);
      
      // First, ensure we have evaluation templates in localStorage
      let evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
      
      if (evaluations.length === 0) {
        // Try to fetch evaluation templates from API
        try {
          const response = await fetch('/api/evaluations');
          if (response.ok) {
            evaluations = await response.json();
            localStorage.setItem('evaluations', JSON.stringify(evaluations));
            console.log('✅ Loaded evaluation templates from API and saved to localStorage:', evaluations.length);
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch evaluations from API, using fallback data:', error);
          
          // Fallback: Create sample evaluation templates
          evaluations = [
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
          localStorage.setItem('evaluations', JSON.stringify(evaluations));
          console.log('✅ Created fallback evaluation templates and saved to localStorage');
        }
      }
      
      // Second, check if there's an evaluation template for this opportunity
      // Try database first, then fallback to localStorage
      let evaluationChoice = null;
      
      // Try to load from database
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}/evaluation`);
        if (response.ok) {
          const result = await response.json();
          if (result.evaluationTemplate) {
            evaluationChoice = {
              evaluationId: result.evaluationTemplate.id,
              evaluationName: result.evaluationTemplate.name
            };
            console.log('✅ Found evaluation choice in database:', evaluationChoice);
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch evaluation choice from database:', error);
      }
      
      // Fallback to localStorage if not found in database
      if (!evaluationChoice) {
        const opportunityEvaluationKey = `opportunity_evaluation_${opportunityId}`;
        const storedEvaluationChoice = localStorage.getItem(opportunityEvaluationKey);
        
        console.log('🔍 Looking for evaluation choice with key:', opportunityEvaluationKey);
        
        if (storedEvaluationChoice) {
          evaluationChoice = JSON.parse(storedEvaluationChoice);
          console.log('✅ Found evaluation choice in localStorage:', evaluationChoice);
        }
      }
      
      if (evaluationChoice) {
        
        if (evaluationChoice.evaluationId) {
          // Find the evaluation template in our loaded evaluations
          const template = evaluations.find((evalTemplate: EvaluationTemplate) => evalTemplate.id === evaluationChoice.evaluationId);
          
          if (template) {
            console.log('✅ Loaded evaluation template:', template.name);
            setEvaluationTemplate(template);
            
            // Initialize criteria scores with template defaults
            const initialScores: { [key: string]: number } = {};
            template.criteria.forEach((criterion: { label: string; value: number }) => {
              initialScores[criterion.label] = Math.floor(template.scale / 2); // Start with middle value
            });
            setCriteriaScores(initialScores);
          } else {
            console.warn('⚠️ Evaluation template not found. Template ID:', evaluationChoice.evaluationId);
            console.log('Available templates:', evaluations.map((t: any) => ({ id: t.id, name: t.name })));
          }
        } else {
          console.log('ℹ️ No evaluation ID in stored choice');
        }
      } else {
        console.log('ℹ️ No evaluation choice found for opportunity:', opportunityId);
        
        // Try to link to a default evaluation template if none is selected
        if (evaluations.length > 0) {
          console.log('🔗 Available evaluation templates for manual selection:');
          evaluations.forEach((template: any, index: number) => {
            console.log(`${index + 1}. ${template.name} (ID: ${template.id})`);
          });
        }
      }
      
      // Check if there's an existing evaluation for this application
      const evaluationKey = `evaluation_${applicationId}`;
      const storedEvaluation = localStorage.getItem(evaluationKey);
      
      if (storedEvaluation) {
        const evaluation = JSON.parse(storedEvaluation);
        setExistingEvaluation(evaluation);
        setNotes(evaluation.notes || '');
        
        // Set the criteria scores from existing evaluation
        const scores: { [key: string]: number } = {};
        evaluation.criteria.forEach((criterion: any) => {
          scores[criterion.label] = criterion.score;
        });
        setCriteriaScores(scores);
      }
      
    } catch (error) {
      console.error('Error loading evaluation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criterionLabel: string, score: number) => {
    setCriteriaScores(prev => ({
      ...prev,
      [criterionLabel]: score
    }));
  };

  const calculateTotalScore = () => {
    if (!evaluationTemplate) return { total: 0, max: 0, percentage: 0 };
    
    const total = Object.values(criteriaScores).reduce((sum, score) => sum + score, 0);
    const max = evaluationTemplate.criteria.length * evaluationTemplate.scale;
    const percentage = max > 0 ? (total / max) * 100 : 0;
    
    return { total, max, percentage };
  };

  const handleSaveEvaluation = async () => {
    if (!evaluationTemplate) return;
    
    setIsSaving(true);
    try {
      const { total, max, percentage } = calculateTotalScore();
      
      const evaluationResult: EvaluationResult = {
        criteria: evaluationTemplate.criteria.map(criterion => ({
          label: criterion.label,
          score: criteriaScores[criterion.label] || 0
        })),
        totalScore: total,
        maxScore: max,
        percentageScore: Math.round(percentage * 100) / 100,
        notes: notes.trim(),
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'current_user' // In a real app, this would be the current user ID
      };
      
      // Save to localStorage for now
      const evaluationKey = `evaluation_${applicationId}`;
      localStorage.setItem(evaluationKey, JSON.stringify(evaluationResult));
      
      setExistingEvaluation(evaluationResult);
      setIsEvaluating(false);
      
      // In the future, this would save to the database:
      // await saveEvaluationToDatabase(applicationId, opportunityId, evaluationTemplate.id, evaluationResult);
      
      if (onEvaluationSaved) {
        onEvaluationSaved();
      }
      
    } catch (error) {
      console.error('Error saving evaluation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEvaluation = () => {
    setIsEvaluating(true);
  };

  const cancelEvaluation = () => {
    setIsEvaluating(false);
    // Reset scores to existing evaluation or template defaults
    if (existingEvaluation) {
      const scores: { [key: string]: number } = {};
      existingEvaluation.criteria.forEach(criterion => {
        scores[criterion.label] = criterion.score;
      });
      setCriteriaScores(scores);
      setNotes(existingEvaluation.notes || '');
    } else if (evaluationTemplate) {
      const initialScores: { [key: string]: number } = {};
      evaluationTemplate.criteria.forEach(criterion => {
        initialScores[criterion.label] = Math.floor(evaluationTemplate.scale / 2);
      });
      setCriteriaScores(initialScores);
      setNotes('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  if (!evaluationTemplate) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <ChartPieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h6 className="font-medium text-gray-600 mb-2">No Evaluation Template</h6>
        <p className="text-gray-500 text-sm">
          No evaluation template was selected for this opportunity.
        </p>
      </div>
    );
  }

  const { total, max, percentage } = calculateTotalScore();
  const radarData = evaluationTemplate.criteria.map(criterion => ({
    subject: criterion.label,
    value: criteriaScores[criterion.label] || 0,
    fullMark: evaluationTemplate.scale
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h6 className="font-medium text-gray-900 flex items-center">
          <ChartPieIcon className="w-5 h-5 mr-2" />
          Candidate Evaluation
        </h6>
        {existingEvaluation && !isEvaluating && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Evaluated
          </span>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h6 className="font-medium text-gray-800">{evaluationTemplate.name}</h6>
          <span className="text-sm text-gray-600">Scale: 1-{evaluationTemplate.scale}</span>
        </div>
        
        {evaluationTemplate.description && (
          <p className="text-sm text-gray-600 mb-3">{evaluationTemplate.description}</p>
        )}

        {existingEvaluation && !isEvaluating && (
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Score</span>
              <span className="text-lg font-bold text-[#556B2F]">
                {existingEvaluation.percentageScore.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {existingEvaluation.totalScore} out of {existingEvaluation.maxScore} points
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Evaluated on {new Date(existingEvaluation.evaluatedAt).toLocaleDateString()}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Criteria */}
          <div className="space-y-4">
            <h6 className="font-medium text-gray-700">
              {isEvaluating ? 'Evaluate Criteria' : 'Evaluation Criteria'}
            </h6>
            
            <div className="space-y-3">
              {evaluationTemplate.criteria.map((criterion, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {criterion.label}
                    </label>
                    <span className="text-sm font-bold text-[#556B2F]">
                      {criteriaScores[criterion.label] || 0}/{evaluationTemplate.scale}
                    </span>
                  </div>
                  
                  {isEvaluating ? (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max={evaluationTemplate.scale}
                        value={criteriaScores[criterion.label] || 0}
                        onChange={(e) => handleScoreChange(criterion.label, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #556B2F 0%, #556B2F ${((criteriaScores[criterion.label] || 0) / evaluationTemplate.scale) * 100}%, #e5e7eb ${((criteriaScores[criterion.label] || 0) / evaluationTemplate.scale) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1</span>
                        <span>{evaluationTemplate.scale}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#556B2F] h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((criteriaScores[criterion.label] || 0) / evaluationTemplate.scale) * 100}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isEvaluating && (
              <div className="bg-white rounded-lg p-3 border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional comments about this candidate..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          {/* Right Column - Radar Chart */}
          <div className="space-y-4">
            <h6 className="font-medium text-gray-700">Evaluation Radar Chart</h6>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fontSize: 11, fill: '#374151' }}
                    />
                    <PolarRadiusAxis 
                      angle={0} 
                      domain={[0, evaluationTemplate.scale]} 
                      tick={{ fontSize: 9, fill: '#6b7280' }}
                      tickCount={evaluationTemplate.scale + 1}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#556B2F"
                      fill="#556B2F"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-3 text-center">
                <div className="text-lg font-bold text-[#556B2F]">
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  {total} out of {max} points
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {isEvaluating ? (
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelEvaluation}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                    Save Evaluation
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Evaluating: <span className="font-medium">{applicantName}</span>
              </div>
              <button
                onClick={startEvaluation}
                className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
              >
                {existingEvaluation ? (
                  <>
                    <StarIcon className="w-4 h-4 inline mr-1" />
                    Edit Evaluation
                  </>
                ) : (
                  <>
                    <ChartPieIcon className="w-4 h-4 inline mr-1" />
                    Start Evaluation
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {existingEvaluation && existingEvaluation.notes && !isEvaluating && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h6 className="text-sm font-medium text-blue-800 mb-1">Evaluation Notes</h6>
            <p className="text-sm text-blue-700">{existingEvaluation.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
} 