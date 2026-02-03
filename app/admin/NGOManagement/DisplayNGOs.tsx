"use client";

import { useState } from "react";
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  DocumentIcon,
  LinkIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { type NGOProfile, type NGOProfileWithDetails } from "./supabaseService";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import AddNGOModal from "./AddNGOModal";

interface DisplayNGOsProps {
  ngos: NGOProfile[];
  loading: boolean;
  stats: any;
  currentPage: number;
  totalCount: number;
  searchTerm: string;
  statusFilter: string;
  approvingNGO: string | null;
  setStatusFilter: (filter: string) => void;
  fetchPaginatedNGOs: (page: number) => void;
  searchNGOs: (term: string, page: number) => void;
  handleApproval: (ngoId: string, action: 'approve' | 'reject', notes?: string) => void;
  setSearchTerm: (term: string) => void;
}

export default function DisplayNGOs({
  ngos,
  loading,
  stats,
  currentPage,
  totalCount,
  searchTerm,
  statusFilter,
  approvingNGO,
  setStatusFilter,
  fetchPaginatedNGOs,
  searchNGOs,
  handleApproval,
  setSearchTerm
}: DisplayNGOsProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [selectedNGO, setSelectedNGO] = useState<NGOProfileWithDetails | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Selection state
  const [selectedNGOs, setSelectedNGOs] = useState<Set<string>>(new Set());
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set([
    'name', 'email', 'approval_status', 'legal_rep_name', 'year_created'
  ]));


  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      searchNGOs(localSearchTerm, 1);
    } else {
      setSearchTerm("");
      fetchPaginatedNGOs(1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewNGO = async (ngo: NGOProfile) => {
    try {
      // Fetch additional details for the NGO
      const response = await fetch(`/api/admin/ngos/${ngo.id}/details`);
      if (response.ok) {
        const ngoDetails = await response.json();
        setSelectedNGO(ngoDetails);
        setIsViewModalOpen(true);
      } else {
        toast.error('Failed to fetch NGO details');
      }
    } catch (error) {
      console.error('Error fetching NGO details:', error);
      toast.error('Failed to fetch NGO details');
    }
  };

  const handleViewOrganization = async (ngo: NGOProfile) => {
    try {
      // Fetch additional details for the NGO
      const response = await fetch(`/api/admin/ngos/${ngo.id}/details`);
      if (response.ok) {
        const ngoDetails = await response.json();
        setSelectedNGO(ngoDetails);
        setIsViewModalOpen(true);
      } else {
        toast.error('Failed to fetch NGO details');
      }
    } catch (error) {
      console.error('Error fetching NGO details:', error);
      toast.error('Failed to fetch NGO details');
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedNGO(null);
  };

  // Selection handlers
  const handleSelectNGO = (ngoId: string) => {
    const newSelected = new Set(selectedNGOs);
    if (newSelected.has(ngoId)) {
      newSelected.delete(ngoId);
    } else {
      newSelected.add(ngoId);
    }
    setSelectedNGOs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNGOs.size === ngos.length) {
      setSelectedNGOs(new Set());
    } else {
      setSelectedNGOs(new Set(ngos.map(ngo => ngo.id)));
    }
  };

  const handleRowClick = (ngoId: string, event: React.MouseEvent) => {
    // Only toggle selection if not clicking on action buttons
    if ((event.target as HTMLElement).closest('button') || 
        (event.target as HTMLElement).closest('a')) {
      return;
    }
    handleSelectNGO(ngoId);
  };

  // Column definitions for export
  const availableColumns = [
    { key: 'name', label: 'NGO Name' },
    { key: 'email', label: 'Email' },
    { key: 'approval_status', label: 'Approval Status' },
    { key: 'legal_rep_name', label: 'Legal Representative Name' },
    { key: 'legal_rep_function', label: 'Legal Representative Function' },
    { key: 'legal_rep_email', label: 'Legal Representative Email' },
    { key: 'legal_rep_phone', label: 'Legal Representative Phone' },
    { key: 'year_created', label: 'Year Created' },
    { key: 'opportunities_count', label: 'Opportunities Count' },
    { key: 'applications_count', label: 'Applications Count' },
    { key: 'active_opportunities_count', label: 'Active Opportunities Count' },
    { key: 'is_locked', label: 'Is Locked' },
    { key: 'is_paused', label: 'Is Paused' },
    { key: 'admin_notes', label: 'Admin Notes' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'updated_at', label: 'Last Updated' },
    { key: 'approved_at', label: 'Approved Date' },
    { key: 'user_id', label: 'User ID' },
  ];

  const handleColumnToggle = (columnKey: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(columnKey)) {
      newSelected.delete(columnKey);
    } else {
      newSelected.add(columnKey);
    }
    setSelectedColumns(newSelected);
  };

  // Excel export function
  const handleExportToExcel = () => {
    if (selectedNGOs.size === 0) {
      toast.error('Please select at least one NGO to export');
      return;
    }

    if (selectedColumns.size === 0) {
      toast.error('Please select at least one column to export');
      return;
    }

    const selectedNGOsData = ngos.filter(ngo => selectedNGOs.has(ngo.id));
    
    // Prepare data for export
    const exportData = selectedNGOsData.map((ngo, index) => {
      const row: any = {};
      selectedColumns.forEach(columnKey => {
        const column = availableColumns.find(col => col.key === columnKey);
        if (column) {
          let value = (ngo as any)[columnKey];
          
          // Handle special cases and provide default values
          if (value === null || value === undefined || value === '') {
            if (columnKey === 'is_locked' || columnKey === 'is_paused') {
              value = 'No';
            } else if (columnKey === 'opportunities_count' || columnKey === 'applications_count' || columnKey === 'active_opportunities_count') {
              value = 0;
            } else if (columnKey === 'admin_notes') {
              value = '(No notes)';
            } else if (columnKey === 'legal_rep_name' || columnKey === 'legal_rep_email' || columnKey === 'legal_rep_phone' || columnKey === 'legal_rep_function') {
              value = '(Not provided)';
            } else if (columnKey === 'created_at' || columnKey === 'updated_at' || columnKey === 'approved_at') {
              value = value ? new Date(value).toLocaleDateString() : '(Not set)';
            } else {
              value = '(Empty)';
            }
          } else {
            // Format specific fields
            if (columnKey === 'is_locked' || columnKey === 'is_paused') {
              value = value ? 'Yes' : 'No';
            } else if (columnKey === 'created_at' || columnKey === 'updated_at' || columnKey === 'approved_at') {
              value = new Date(value).toLocaleDateString();
            }
          }
          
          row[column.label] = value;
        }
      });
      return row;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'NGOs');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `NGOs_Export_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${selectedNGOsData.length} NGOs to ${filename}`);
    setIsExtractModalOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const pendingCount = stats?.approvalCounts?.pending || 0;
  const approvedCount = stats?.approvalCounts?.approved || 0;
  const rejectedCount = stats?.approvalCounts?.rejected || 0;

  const handleNGOAdded = () => {
    // Refresh list to include the newly created NGO
    fetchPaginatedNGOs(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UserGroupIcon className="h-8 w-8 text-[#556B2F] mr-3" />
                NGOs Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and monitor all registered NGOs and their approval status
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#556B2F] hover:bg-[#4A5D28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
              >
                <span className="mr-2 text-lg">+</span>
                Add NGO
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total NGOs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search NGOs by name, email, or legal representative..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-[#556B2F] focus:border-[#556B2F]"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#556B2F] focus:border-[#556B2F]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#4A5D28] focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2"
            >
              Search
            </button>
            {selectedNGOs.size > 0 && (
              <button
                onClick={() => setIsExtractModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Extract ({selectedNGOs.size})
              </button>
            )}
          </div>
        </div>

        {/* NGOs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered NGOs ({ngos.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F] mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading NGOs...</p>
            </div>
          ) : ngos.length === 0 ? (
            <div className="p-8 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" ? 'No NGOs found matching your criteria.' : 'No NGOs registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedNGOs.size === ngos.length && ngos.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-[#556B2F] focus:ring-[#556B2F] border-gray-300 rounded"
                        />
                        <span className="ml-2">Select</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NGO Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Legal Representative
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunities
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ngos.map((ngo) => (
                    <tr 
                      key={ngo.id} 
                      className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                        selectedNGOs.has(ngo.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={(e) => handleRowClick(ngo.id, e)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedNGOs.has(ngo.id)}
                          onChange={() => handleSelectNGO(ngo.id)}
                          className="h-4 w-4 text-[#556B2F] focus:ring-[#556B2F] border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {ngo.profile_image_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={ngo.profile_image_url}
                                alt={ngo.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#556B2F] flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {ngo.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{ngo.name}</div>
                            <div className="text-sm text-gray-500">{ngo.email}</div>
                            <div className="text-xs text-gray-400">Founded in {ngo.year_created}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ngo.legal_rep_name}</div>
                        <div className="text-sm text-gray-500">{ngo.legal_rep_function}</div>
                        <div className="text-xs text-gray-400">{ngo.legal_rep_email}</div>
                        <div className="text-xs text-gray-400">{ngo.legal_rep_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center space-y-2">
                          {/* Main approval status */}
                          <div className="flex items-center justify-center">
                            {getStatusIcon(ngo.approval_status)}
                            <span className={`ml-2 ${getStatusBadge(ngo.approval_status)}`}>
                              {ngo.approval_status}
                            </span>
                          </div>
                          
                          {/* Additional status indicators */}
                          <div className="flex items-center space-x-2">
                            {/* Lock status */}
                            {ngo.is_locked && (
                              <div className="flex items-center text-xs text-yellow-600">
                                <LockClosedIcon className="w-3 h-3 mr-1" />
                                <span>Locked</span>
                              </div>
                            )}
                            
                            {/* Pause status */}
                            {ngo.is_paused && (
                              <div className="flex items-center text-xs text-purple-600">
                                <PauseIcon className="w-3 h-3 mr-1" />
                                <span>Paused</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Admin notes for rejected NGOs */}
                          {ngo.approval_status === 'rejected' && ngo.admin_notes && (
                            <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={ngo.admin_notes}>
                              {ngo.admin_notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-blue-600">{ngo.opportunities_count || 0}</span>
                          <span className="text-xs text-gray-500">
                            {ngo.active_opportunities_count || 0} active
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-2xl font-bold text-green-600">{ngo.applications_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col space-y-2">
                          {/* Approval buttons - only for pending NGOs */}
                          {ngo.approval_status === 'pending' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleApproval(ngo.id, 'approve')}
                                disabled={approvingNGO === ngo.id}
                                className="inline-flex items-center px-2 py-1 border border-green-300 shadow-sm text-xs leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                <CheckCircleIcon className="h-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('Enter rejection reason (optional):');
                                  if (notes !== null) {
                                    handleApproval(ngo.id, 'reject', notes);
                                  }
                                }}
                                disabled={approvingNGO === ngo.id}
                                className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                <XCircleIcon className="h-3 h-3 mr-1" />
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {/* Action icons for approved/rejected NGOs */}
                          {(ngo.approval_status === 'approved' || ngo.approval_status === 'rejected') && (
                            <div className="flex justify-center space-x-2 pt-2">
                              {/* View Icon */}
                              <button
                                onClick={() => handleViewOrganization(ngo)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View NGO Details"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              
                              {/* Lock Icon */}
                              <button
                                onClick={() => {
                                  // TODO: Implement lock functionality
                                  const action = ngo.is_locked ? 'unlock' : 'lock';
                                  const message = ngo.is_locked ? 'Unlock NGO Account' : 'Lock NGO Account';
                                  toast.success(`${message} functionality coming soon`);
                                }}
                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                  ngo.is_locked 
                                    ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                                    : 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                                }`}
                                title={ngo.is_locked ? 'Unlock NGO Account' : 'Lock NGO Account'}
                              >
                                <LockClosedIcon className={`h-5 w-5 ${ngo.is_locked ? 'text-green-600' : 'text-yellow-600'}`} />
                              </button>
                              
                              {/* Pause/Play Icon */}
                              <button
                                onClick={() => {
                                  // TODO: Implement pause/play functionality
                                  const action = ngo.is_paused ? 'resume' : 'pause';
                                  const message = ngo.is_paused ? 'Resume NGO Account' : 'Pause NGO Account';
                                  toast.success(`${message} functionality coming soon`);
                                }}
                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                  ngo.is_paused 
                                    ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                                    : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                                }`}
                                title={ngo.is_paused ? 'Resume NGO Account' : 'Pause NGO Account'}
                              >
                                {ngo.is_paused ? (
                                  <PlayIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                  <PauseIcon className="h-5 w-5 text-purple-600" />
                                )}
                              </button>
                              
                              {/* Delete Icon */}
                              <button
                                onClick={() => {
                                  // TODO: Implement delete functionality
                                  if (confirm('Are you sure you want to delete this NGO? This action cannot be undone.')) {
                                    toast.success('Delete functionality coming soon');
                                  }
                                }}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete NGO Account"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalCount > 10 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchPaginatedNGOs(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchPaginatedNGOs(currentPage + 1)}
                disabled={currentPage * 10 >= totalCount}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Export Column Selection Modal */}
        {isExtractModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Export NGO Data</h3>
                <button
                  onClick={() => setIsExtractModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Selected NGOs: <span className="font-semibold">{selectedNGOs.size}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the columns you want to include in the Excel export:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {availableColumns.map((column) => (
                    <div key={column.key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={column.key}
                        checked={selectedColumns.has(column.key)}
                        onChange={() => handleColumnToggle(column.key)}
                        className="h-4 w-4 text-[#556B2F] focus:ring-[#556B2F] border-gray-300 rounded"
                      />
                      <label
                        htmlFor={column.key}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {column.label}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedColumns(new Set(availableColumns.map(col => col.key)))}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedColumns(new Set())}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsExtractModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExportToExcel}
                      disabled={selectedColumns.size === 0}
                      className="px-4 py-2 bg-[#556B2F] text-white rounded-md hover:bg-[#4A5D28] focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      Export to Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add NGO Modal */}
        <AddNGOModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleNGOAdded}
        />

        {/* NGO View Modal */}
        {isViewModalOpen && selectedNGO && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">NGO Profile Details</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedNGO.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year Created</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedNGO.year_created}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {selectedNGO.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                      <div className="mt-1">
                        {selectedNGO.profile_image_url ? (
                          <img 
                            src={selectedNGO.profile_image_url} 
                            alt="Profile" 
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Representative Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Legal Representative
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedNGO.legal_rep_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Function</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedNGO.legal_rep_function || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {selectedNGO.legal_rep_email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {selectedNGO.legal_rep_phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedNGO.opportunities_count || 0}</div>
                      <div className="text-sm text-gray-500">Total Opportunities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedNGO.applications_count || 0}</div>
                      <div className="text-sm text-gray-500">Total Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedNGO.active_opportunities_count || 0}</div>
                      <div className="text-sm text-gray-500">Active Opportunities</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    Uploaded Documents {selectedNGO.documents && Array.isArray(selectedNGO.documents) && selectedNGO.documents.length > 0 && `(${selectedNGO.documents.length})`}
                  </h4>
                  
                  {/* Info note about documents */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Document Access</p>
                        <p className="mt-1">
                          {selectedNGO.documents && Array.isArray(selectedNGO.documents) && selectedNGO.documents.length > 0 && 
                           selectedNGO.documents.some(doc => doc.url && doc.url.includes('example.com')) 
                            ? 'Some documents may be stored externally and will open in new tabs. You can also download them directly.'
                            : 'Documents are stored securely and can be viewed or downloaded directly.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedNGO.documents && Array.isArray(selectedNGO.documents) && selectedNGO.documents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedNGO.documents.map((doc) => {
                        const isExternalUrl = doc.url && (doc.url.includes('example.com') || doc.url.startsWith('http'));
                        const isSupabaseUrl = doc.url && doc.url.includes('supabase.co');
                        
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{doc.name || 'Untitled Document'}</h5>
                              {doc.description && (
                                <p className="text-sm text-gray-600">{doc.description}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Uploaded: {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Unknown date'}
                              </p>
                              {doc.url && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 break-all">
                                    URL: {doc.url}
                                  </p>
                                  {isExternalUrl && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                      External Storage
                                    </span>
                                  )}
                                  {isSupabaseUrl && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                      Secure Storage
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex space-x-2">
                              {doc.url && (
                                <>
                                  <a
                                    href={doc.url}
                                    target={isExternalUrl ? "_blank" : "_self"}
                                    rel={isExternalUrl ? "noopener noreferrer" : ""}
                                    className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                      isExternalUrl 
                                        ? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500"
                                        : "border-[#556B2F] text-[#556B2F] bg-white hover:bg-gray-50 focus:ring-[#556B2F]"
                                    }`}
                                    title={isExternalUrl ? "Open document in new tab" : "View document"}
                                  >
                                    <DocumentIcon className="h-4 w-4 mr-1" />
                                    {isExternalUrl ? "Open" : "View"}
                                  </a>
                                  <a
                                    href={doc.url}
                                    download={doc.name || 'document'}
                                    className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    title="Download document"
                                  >
                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No documents uploaded yet.</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Documents will appear here once uploaded by the NGO
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                {selectedNGO.additionalInfo && selectedNGO.additionalInfo.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Additional Information ({selectedNGO.additionalInfo.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedNGO.additionalInfo.map((info) => (
                        <div key={info.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{info.title}</h5>
                            <p className="text-sm text-gray-600">{info.content}</p>
                            <p className="text-xs text-gray-500">
                              Type: {info.type} • Added: {new Date(info.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {info.type === 'link' && (
                            <a
                              href={info.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                            >
                              <LinkIcon className="h-4 w-4 mr-1" />
                              Visit
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Account Information */}
                {selectedNGO.user && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">User Account</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedNGO.user.full_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedNGO.user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User Type</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedNGO.user.user_type}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
