'use client';

import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { JobRequirement } from '../types';

interface ComparisonDetailsProps {
  requirements: JobRequirement[];
  overallScore: number;
  maxScore: number;
  generalFeedback?: string;
}

const ComparisonDetails: React.FC<ComparisonDetailsProps> = ({
  requirements,
  overallScore,
  maxScore,
  generalFeedback
}) => {
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);
  const overallPercentage = (overallScore / maxScore) * 100;
  
  const getMatchLevel = (percentage: number) => {
    if (percentage >= 80) return { text: 'Excellent Match', color: 'text-green-500' };
    if (percentage >= 60) return { text: 'Good Match', color: 'text-blue-500' };
    if (percentage >= 40) return { text: 'Fair Match', color: 'text-orange-500' };
    return { text: 'Poor Match', color: 'text-red-500' };
  };
  
  const matchLevel = getMatchLevel(overallPercentage);

  const toggleSection = (category: string) => {
    setExpandedSections(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Overall Match</h2>
        <div className="text-4xl font-bold mb-2">
          <span className={matchLevel.color}>{overallPercentage.toFixed(1)}%</span>
        </div>
        <p className={`${matchLevel.color} font-medium`}>{matchLevel.text}</p>
        
        <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23]"
            style={{ width: `${overallPercentage}%` }}
          ></div>
        </div>

        {generalFeedback && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm">
            {generalFeedback}
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Analysis</h3>
      
      {requirements.map((req, index) => {
        const matchPercentage = (req.score / req.maxScore) * 100;
        const matchColor = 
          matchPercentage >= 80 ? 'bg-green-100 border-green-200' : 
          matchPercentage >= 60 ? 'bg-blue-100 border-blue-200' : 
          matchPercentage >= 40 ? 'bg-orange-100 border-orange-200' : 
          'bg-red-100 border-red-200';
          
        const isExpanded = expandedSections.includes(req.category);
          
        return (
          <div 
            key={index} 
            className={`p-4 rounded-lg border mb-4 ${matchColor}`}
          >
            <button
              onClick={() => toggleSection(req.category)}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-800">{req.category}</h4>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold mr-2">
                    {matchPercentage.toFixed(0)}%
                  </span>
                  {matchPercentage >= 80 ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : matchPercentage >= 40 ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </button>
            
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">
                {req.score} of {req.maxScore} requirements matched
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23]"
                  style={{ width: `${matchPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="mt-4 space-y-3">
                {req.description && (
                  <div className="text-sm text-gray-600">
                    <strong className="font-medium">Requirements:</strong>
                    <p>{req.description}</p>
                  </div>
                )}
                
                {req.feedback && (
                  <div className="text-sm text-gray-600">
                    <strong className="font-medium">Feedback:</strong>
                    <p>{req.feedback}</p>
                  </div>
                )}
                
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Keywords</h5>
                  <div className="flex flex-wrap gap-1">
                    {req.keywords.map((keyword, idx) => (
                      <span 
                        key={idx}
                        className={`px-2 py-1 rounded-full text-xs ${
                          req.score > 0 ? 'bg-[#556B2F]/10 text-[#556B2F]' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ComparisonDetails;



























