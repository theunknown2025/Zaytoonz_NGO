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
} from "@heroicons/react/24/outline";
import { type NGOProfile } from "./supabaseService";
import toast from "react-hot-toast";

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
                    <tr key={ngo.id} className="hover:bg-gray-50 transition-colors duration-200">
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
                        <div className="flex items-center justify-center">
                          {getStatusIcon(ngo.approval_status)}
                          <span className={`ml-2 ${getStatusBadge(ngo.approval_status)}`}>
                            {ngo.approval_status}
                          </span>
                        </div>
                        {ngo.approval_status === 'rejected' && ngo.admin_notes && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={ngo.admin_notes}>
                            {ngo.admin_notes}
                          </div>
                        )}
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
                          <button
                            onClick={() => {
                              // TODO: Navigate to NGO details page
                              toast.success('NGO details view coming soon');
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#556B2F]"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                          
                          {ngo.approval_status === 'pending' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleApproval(ngo.id, 'approve')}
                                disabled={approvingNGO === ngo.id}
                                className="inline-flex items-center px-2 py-1 border border-green-300 shadow-sm text-xs leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
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
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Reject
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
      </div>
    </div>
  );
}
