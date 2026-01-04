'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { ChartPieIcon, ListBulletIcon, PlusIcon, RectangleGroupIcon } from '@heroicons/react/24/outline';
import NewEvaluation from './components/NewEvaluation';
import ListEvaluations from './components/ListEvaluations';
import ZaytoonzTemplates from './ZaytoonzTemplates';

export default function EvaluationMaker() {
  const [activeTab, setActiveTab] = useState<'new' | 'list' | 'zaytoonz'>('new');

  // Handle use template from Zaytoonz Templates
  const handleUseTemplate = (template: any) => {
    // Here you would typically pass the template data to the NewEvaluation component
    // For now, just switch to the new evaluation tab
    setActiveTab('new');
    
    // In a real implementation, you might want to pass the template data
    // to the NewEvaluation component via props or context
    console.log('Using template:', template);
  };

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
              <button
                onClick={() => setActiveTab('zaytoonz')}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'zaytoonz'
                    ? 'bg-white text-[#556B2F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <RectangleGroupIcon className="w-5 h-5 mr-2" />
                Zaytoonz Templates
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'new' && <NewEvaluation />}
          {activeTab === 'list' && <ListEvaluations />}
          {activeTab === 'zaytoonz' && (
            <div className="p-6">
              <ZaytoonzTemplates onUseTemplate={handleUseTemplate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 