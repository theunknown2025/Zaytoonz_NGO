'use client';

import { useState } from 'react';
import { 
  DocumentTextIcon,
  ListBulletIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import ListForms from './ListForms';
import NewForm from './NewForm';

export default function FormMaker() {
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);

  const handleNewForm = () => {
    setEditTemplateId(null);
    setActiveTab('new');
  };

  const handleEditForm = (templateId: string) => {
    setEditTemplateId(templateId);
    setActiveTab('new');
  };

  const handleFormSaved = () => {
    setActiveTab('list');
    setEditTemplateId(null);
  };

  const handleCancel = () => {
    setActiveTab('list');
    setEditTemplateId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-xl text-white">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#556B2F]">Admin Form Maker</h1>
              <p className="text-gray-600">Create and manage your form templates</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-[#556B2F] text-[#556B2F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ListBulletIcon className="w-5 h-5" />
                  My Templates
                </div>
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'new'
                    ? 'border-[#556B2F] text-[#556B2F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PlusCircleIcon className="w-5 h-5" />
                  {editTemplateId ? 'Edit Template' : 'New Template'}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'list' && (
            <ListForms
              onNewForm={handleNewForm}
              onEditForm={handleEditForm}
            />
          )}
          
          {activeTab === 'new' && (
            <NewForm
              onFormSaved={handleFormSaved}
              onCancel={handleCancel}
              editTemplateId={editTemplateId}
            />
          )}
        </div>
      </div>
    </div>
  );
}