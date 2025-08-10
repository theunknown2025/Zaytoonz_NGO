"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface NGOProfile {
  id: string;
  name: string;
  email: string;
  year_created: string;
  legal_rep_name: string;
  legal_rep_email: string;
  legal_rep_phone: string;
  legal_rep_function: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  // Approval fields
  approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  approved_at?: string;
  approved_by?: string;
  // Statistics
  opportunities_count?: number;
  applications_count?: number;
  active_opportunities_count?: number;
}

export default function NGOManagementPage() {
  const [ngos, setNgos] = useState<NGOProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approvingNGO, setApprovingNGO] = useState<string | null>(null);

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ngos');
      
      if (!response.ok) {
        throw new Error('Failed to fetch NGOs');
      }
      
      const data = await response.json();
      setNgos(data.ngos || []);
    } catch (error: any) {
      console.error('Error fetching NGOs:', error);
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (ngoId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setApprovingNGO(ngoId);
      
      const response = await fetch(`/api/admin/ngos/${ngoId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }

      toast.success(`NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchNGOs(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating approval status:', error);
      toast.error(error.message || 'Failed to update approval status');
    } finally {
      setApprovingNGO(null);
    }
  };

  const filteredNGOs = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ngo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ngo.legal_rep_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ngo.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const pendingCount = ngos.filter(ngo => ngo.approval_status === 'pending').length;
  const approvedCount = ngos.filter(ngo => ngo.approval_status === 'approved').length;
  const rejectedCount = ngos.filter(ngo => ngo.approval_status === 'rejected').length;

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
                <p className="text-2xl font-semibold text-gray-900">{ngos.length}</p>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>
        </div>

        {/* NGOs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered NGOs ({filteredNGOs.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#556B2F] mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading NGOs...</p>
            </div>
          ) : filteredNGOs.length === 0 ? (
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
                  {filteredNGOs.map((ngo) => (
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
      </div>
    </div>
  );
} 