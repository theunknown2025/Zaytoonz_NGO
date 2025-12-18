'use client';

import React from 'react';
import RadarChart from './RadarChart';
import ComparisonDetails from './ComparisonDetails';
import { ComparisonResult } from '../types';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

interface ComparisonResultsProps {
  result: ComparisonResult | null;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Comparison Results</h2>
          <p className="text-gray-600">
            See how your CV matches the job requirements
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:from-[#6B8E23] hover:to-[#556B2F] transition-all">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RadarChart requirements={result.requirements} />
        <ComparisonDetails 
          requirements={result.requirements}
          overallScore={result.overallScore}
          maxScore={result.maxScore}
          generalFeedback={result.generalFeedback}
        />
      </div>
    </div>
  );
};

export default ComparisonResults;


















