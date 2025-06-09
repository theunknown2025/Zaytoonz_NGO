'use client';

import { useState } from 'react';
import { ChartPieIcon, ListBulletIcon, PlusIcon } from '@heroicons/react/24/outline';
import NewEvaluation from './components/NewEvaluation';
import ListEvaluations from './components/ListEvaluations';

export default function EvaluationMaker() {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');

  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <ChartPieIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">
            Evaluation Maker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create comprehensive evaluation templates with custom criteria and visual radar charts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex justify-center">
            <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'new'
                    ? 'bg-white text-[#556B2F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Evaluation
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'list'
                    ? 'bg-white text-[#556B2F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="w-5 h-5 mr-2" />
                List of Evaluations
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'new' && <NewEvaluation />}
          {activeTab === 'list' && <ListEvaluations />}
        </div>
      </div>
    </div>
  );
} 