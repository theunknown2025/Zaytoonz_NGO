'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  PlusCircleIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import ListProcess from './ListProcess';
import NewProcess from './NewProcess';
import { Toaster } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { getProcessTemplateWithSteps } from './services/processService';

export default function ProcessMakersTool() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'detail'>('list');
  const [activeProcess, setActiveProcess] = useState<number | null>(null);
  const [editProcessId, setEditProcessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for query parameters on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const editParam = searchParams.get('edit');
    
    if (tabParam === 'new') {
      setActiveTab('new');
    }
    
    if (editParam) {
      setEditProcessId(editParam);
      setActiveTab('new');
    }
  }, [searchParams]);
  
  // Listen for switchTab events
  useEffect(() => {
    const handleSwitchTab = (event: any) => {
      const { tab, processId } = event.detail;
      
      if (tab) {
        setActiveTab(tab as 'list' | 'new' | 'detail');
      }
      
      if (processId) {
        setEditProcessId(processId);
      } else {
        setEditProcessId(null);
      }
    };
    
    window.addEventListener('switchTab', handleSwitchTab);
    
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab);
    };
  }, []);
  
  const processes = [
    { 
      id: 1, 
      name: 'Volunteer Onboarding',
      description: 'Process for onboarding new volunteers',
      steps: 5,
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Donation Processing',
      description: 'Workflow for handling incoming donations',
      steps: 4,
      status: 'active'
    },
    { 
      id: 3, 
      name: 'Event Planning',
      description: 'Process for organizing community events',
      steps: 7,
      status: 'draft'
    },
  ];
  
  const workflowSteps = [
    { id: 1, name: 'Application Review', assignee: 'Volunteer Manager', status: 'completed' },
    { id: 2, name: 'Interview Scheduling', assignee: 'HR Team', status: 'completed' },
    { id: 3, name: 'Background Check', assignee: 'Security Team', status: 'in-progress' },
    { id: 4, name: 'Training Session', assignee: 'Trainer', status: 'pending' },
    { id: 5, name: 'Final Approval', assignee: 'Program Director', status: 'pending' },
  ];

  return (
    <div className="px-4 py-6">
      <Toaster position="top-right" />
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <Cog6ToothIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">Process Makers</h1>
          <p className="mt-2 text-sm text-gray-600">Design and manage your organization's workflow processes</p>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                setEditProcessId(null);
                // Update URL
                window.history.pushState({}, '', `/ngo/resources/tools/ProcessMakers`);
              }}
              className={`py-2.5 px-5 text-sm font-medium ${
                activeTab === 'list'
                  ? 'text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23]'
                  : 'text-gray-900 bg-white hover:bg-gray-100'
              } rounded-l-lg border border-gray-200 flex items-center`}
            >
              <ListBulletIcon className="w-4 h-4 mr-2" />
              Process List
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('new');
                setActiveProcess(null);
                // Update URL
                window.history.pushState({}, '', `/ngo/resources/tools/ProcessMakers?tab=new`);
              }}
              className={`py-2.5 px-5 text-sm font-medium ${
                activeTab === 'new'
                  ? 'text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23]'
                  : 'text-gray-900 bg-white hover:bg-gray-100'
              } rounded-r-lg border border-gray-200 flex items-center`}
            >
              <PlusCircleIcon className="w-4 h-4 mr-2" />
              {editProcessId ? 'Edit Process' : 'New Process'}
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'list' && <ListProcess />}
        {activeTab === 'new' && <NewProcess editProcessId={editProcessId} />}
        
        {/* Original Process Detail View - shown when activeTab is 'detail' */}
        {activeTab === 'detail' && activeProcess && (
          <div className="lg:w-full">
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {processes.find(p => p.id === activeProcess)?.name} Process
                </h2>
                <div className="flex gap-3">
                  <button 
                    className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
                    onClick={() => setActiveTab('list')}
                  >
                    Back to List
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                {processes.find(p => p.id === activeProcess)?.description}. Follow the steps below to complete the process.
              </p>
              
              <div className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`relative pl-8 py-4 ${
                      index !== workflowSteps.length - 1 ? 'border-l-2 border-dashed border-gray-200 ml-4' : ''
                    }`}
                  >
                    <div className={`absolute left-0 top-4 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : step.status === 'in-progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{step.name}</h3>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">Assigned to: {step.assignee}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : step.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'completed' 
                            ? 'Completed' 
                            : step.status === 'in-progress'
                              ? 'In Progress'
                              : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#556B2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Process Participants
                </h3>
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#556B2F] rounded-full flex items-center justify-center text-white text-sm mr-3">
                        VM
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Volunteer Manager</h4>
                        <p className="text-xs text-gray-500">Process owner</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                        HR
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">HR Team</h4>
                        <p className="text-xs text-gray-500">Participant</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 px-4 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#556B2F] hover:text-[#556B2F] transition-colors flex items-center justify-center text-sm">
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Add Participant
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#556B2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Required Documents
                </h3>
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                    <span className="text-sm">Volunteer Application Form</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Received</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                    <span className="text-sm">Background Check Authorization</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pending</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                    <span className="text-sm">Training Acknowledgment</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Not Required Yet</span>
                  </div>
                  <button className="w-full py-2 px-4 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#556B2F] hover:text-[#556B2F] transition-colors flex items-center justify-center text-sm">
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Add Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 