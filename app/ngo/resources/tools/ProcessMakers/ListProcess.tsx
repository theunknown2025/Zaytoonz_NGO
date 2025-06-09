'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { getProcessTemplates, deleteProcessTemplate, getProcessTemplateWithSteps } from './services/processService';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface ProcessPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  processId: string | null;
}

export default function ListProcess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [processes, setProcesses] = useState<ProcessTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [previewProcessId, setPreviewProcessId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  useEffect(() => {
    fetchProcesses();
  }, []);
  
  const fetchProcesses = async () => {
    try {
      setIsLoading(true);
      const data = await getProcessTemplates();
      setProcesses(data || []);
    } catch (error) {
      console.error('Error fetching processes:', error);
      toast.error('Failed to load processes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProcess = async (id: string) => {
    if (confirm('Are you sure you want to delete this process?')) {
      try {
        setIsDeleting(id);
        await deleteProcessTemplate(id);
        toast.success('Process deleted successfully!');
        fetchProcesses();
      } catch (error) {
        console.error('Error deleting process:', error);
        toast.error('Failed to delete process. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  const handleViewProcess = (id: string) => {
    router.push(`/ngo/resources/tools/ProcessMakers?id=${id}`);
  };
  
  const handleEditProcess = (id: string) => {
    // Use the main page component and switch to "new" tab with edit parameter
    const urlParams = new URLSearchParams();
    urlParams.set('edit', id);
    
    // Using the parent component's switchTab mechanism through URL
    const event = new CustomEvent('switchTab', {
      detail: { tab: 'new', processId: id }
    });
    window.dispatchEvent(event);
    
    // Update URL without full navigation
    window.history.pushState({}, '', `/ngo/resources/tools/ProcessMakers?${urlParams.toString()}`);
  };
  
  const handleCreateProcess = () => {
    // Switch to new tab without edit parameter
    const event = new CustomEvent('switchTab', {
      detail: { tab: 'new' }
    });
    window.dispatchEvent(event);
    
    // Update URL without full navigation
    window.history.pushState({}, '', `/ngo/resources/tools/ProcessMakers?tab=new`);
  };
  
  const handlePreviewProcess = async (id: string) => {
    try {
      setPreviewProcessId(id);
      setPreviewLoading(true);
      setShowPreviewModal(true);
      
      // Fetch process details for the preview
      const processData = await getProcessTemplateWithSteps(id);
      setPreviewData(processData);
    } catch (error) {
      console.error('Error loading process preview:', error);
      toast.error('Failed to load process preview');
    } finally {
      setPreviewLoading(false);
    }
  };
  
  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewProcessId(null);
    setPreviewData(null);
  };

  // Filter processes based on search term and status filter
  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          process.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || process.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Function to get status badge style
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Get status icon based on status name
  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('done') || lowerStatus.includes('complete') || lowerStatus.includes('achieve')) {
      return <CheckIcon className="h-4 w-4" />;
    } else if (lowerStatus.includes('not') || lowerStatus.includes('fail')) {
      return <XMarkIcon className="h-4 w-4" />;
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
      return <ExclamationCircleIcon className="h-4 w-4" />;
    }
    return null;
  };
  
  // Get a color for the status badge based on the status name
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('done') || lowerStatus.includes('complete') || lowerStatus.includes('achieve')) {
      return 'bg-green-100 text-green-800';
    } else if (lowerStatus.includes('not') || lowerStatus.includes('fail')) {
      return 'bg-red-100 text-red-800';
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (lowerStatus.includes('ongoing') || lowerStatus.includes('progress')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };
  
  // Format date strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Process List</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your organization's workflow processes</p>
        </div>
        <button
          onClick={handleCreateProcess}
          className="py-2 px-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all flex items-center text-sm"
        >
          <DocumentCheckIcon className="w-4 h-4 mr-2" />
          New Process
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 py-2 pr-3 block w-full border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <button
          onClick={fetchProcesses}
          className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Process List */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <svg className="animate-spin h-8 w-8 text-[#556B2F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcesses.length > 0 ? (
                filteredProcesses.map((process) => (
                  <tr key={process.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{process.name}</div>
                        <div className="text-sm text-gray-500">{process.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(process.status)}`}>
                        {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(process.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(process.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-[#556B2F] hover:text-[#4A5F29]" 
                          title="Edit process with NewProcess component"
                          onClick={() => handleEditProcess(process.id)}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-800" 
                          title="Preview process timeline"
                          onClick={() => handlePreviewProcess(process.id)}
                        >
                          <ClockIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-800" 
                          title="View"
                          onClick={() => handleViewProcess(process.id)}
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700" 
                          title="Delete"
                          onClick={() => handleDeleteProcess(process.id)}
                          disabled={isDeleting === process.id}
                        >
                          {isDeleting === process.id ? (
                            <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' ? 
                      'No processes found matching your search criteria. Try adjusting your filters.' :
                      'No processes found. Create your first process to get started!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination - can be implemented in a real app */}
      {processes.length > 0 && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <div>
            Showing {filteredProcesses.length} of {processes.length} processes
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced Process Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#556B2F]/10 to-[#6B8E23]/10">
              <h3 className="text-xl font-semibold text-[#556B2F]">
                Process Timeline View
              </h3>
              <button
                onClick={closePreviewModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {previewLoading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-[#556B2F] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Generating timeline view...</p>
                  </div>
                </div>
              ) : previewData ? (
                <div>
                  {/* Process Header */}
                  <div className="bg-white rounded-xl p-6 shadow-md mb-8 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#556B2F]">{previewData.template.name}</h2>
                        <p className="text-gray-600 mt-2">{previewData.template.description}</p>
                      </div>
                      <span className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${getStatusBadgeClass(previewData.template.status)}`}>
                        {previewData.template.status.charAt(0).toUpperCase() + previewData.template.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(previewData.template.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {formatDate(previewData.template.updated_at)}
                      </div>
                      <div>
                        <span className="font-medium">Steps:</span> {previewData.steps.length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Timeline */}
                  <div className="relative pl-8 pt-2">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-[#556B2F]/80 to-[#6B8E23]/80 rounded-full"></div>
                    
                    {previewData.steps.map((step: any, index: number) => (
                      <div 
                        key={step.id}
                        className="mb-8 relative transition-all duration-300 hover:translate-x-1"
                      >
                        {/* Timeline Node */}
                        <div className="absolute left-0 top-4 w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white font-bold">
                          {index + 1}
                        </div>
                        
                        {/* Step Card */}
                        <div className="ml-12 bg-white p-5 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform">
                          {/* Step Header */}
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Step {index + 1} of {previewData.steps.length}</span>
                          </div>
                          
                          {/* Step Description */}
                          {step.description && (
                            <p className="mt-2 text-gray-600 text-sm">{step.description}</p>
                          )}
                          
                          {/* Status Options */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Possible Status Values</h4>
                            <div className="flex flex-wrap gap-2">
                              {step.status_options.map((status: string, i: number) => (
                                <span 
                                  key={i} 
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                                >
                                  {getStatusIcon(status) && (
                                    <span className="mr-1">{getStatusIcon(status)}</span>
                                  )}
                                  {status}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                  <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p>No timeline data available</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
              <button
                onClick={closePreviewModal}
                className="py-2 px-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all flex items-center text-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 