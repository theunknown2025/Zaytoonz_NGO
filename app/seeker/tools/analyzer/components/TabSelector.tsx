'use client';

import React from 'react';
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { InputMethod } from '../types';

interface TabSelectorProps {
  activeTab: InputMethod;
  onTabChange: (tab: InputMethod) => void;
  label: string;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange, label }) => {
  return (
    <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg w-fit mb-4">
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all ${
          activeTab === 'upload'
            ? 'bg-white shadow-sm text-gray-800'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        }`}
        onClick={() => onTabChange('upload')}
      >
        <ArrowUpTrayIcon className="w-4 h-4" />
        <span>Upload {label}</span>
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all ${
          activeTab === 'paste'
            ? 'bg-white shadow-sm text-gray-800'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        }`}
        onClick={() => onTabChange('paste')}
      >
        <DocumentTextIcon className="w-4 h-4" />
        <span>Paste {label}</span>
      </button>
    </div>
  );
};

export default TabSelector;

















