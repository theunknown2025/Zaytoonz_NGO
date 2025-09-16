'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth';
import { toast } from 'react-hot-toast';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  created_by?: string;
}

interface NewTeamMember {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: 'admin' | 'member' | 'viewer';
}

export default function TeamManagementPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newMember, setNewMember] = useState<NewTeamMember>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'member'
  });

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/ngo/team?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.teamMembers || []);
        } else {
          toast.error('Failed to fetch team members');
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast.error('Error fetching team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user?.id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMember.password !== newMember.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (newMember.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/ngo/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          ...newMember,
          userId: user?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Team member added successfully');
        setNewMember({
          full_name: '',
          email: '',
          password: '',
          confirm_password: '',
          role: 'member'
        });
        setShowAddForm(false);
        
        // Refresh team members list
        const refreshResponse = await fetch(`/api/ngo/team?userId=${user?.id}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTeamMembers(refreshData.teamMembers || []);
        }
      } else {
        toast.error(data.error || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Error adding team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role change
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/ngo/team/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success('Role updated successfully');
        // Refresh team members list
        const refreshResponse = await fetch(`/api/ngo/team?userId=${user?.id}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTeamMembers(refreshData.teamMembers || []);
        }
      } else {
        toast.error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role');
    }
  };

  // Handle status change
  const handleStatusChange = async (memberId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/ngo/team/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        // Refresh team members list
        const refreshResponse = await fetch(`/api/ngo/team?userId=${user?.id}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTeamMembers(refreshData.teamMembers || []);
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  // Handle member deletion
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ngo/team/${memberId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || '',
        },
      });

      if (response.ok) {
        toast.success('Team member deleted successfully');
        // Refresh team members list
        const refreshResponse = await fetch(`/api/ngo/team?userId=${user?.id}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTeamMembers(refreshData.teamMembers || []);
        }
      } else {
        toast.error('Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Error deleting team member');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="h-8 w-8 mr-3 text-[#556B2F]" />
              Team Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your NGO team members and their access permissions.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Add Team Member Form */}
      {showAddForm && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Team Member</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  required
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-3"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-3"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-10"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    required
                    value={newMember.confirm_password}
                    onChange={(e) => setNewMember({ ...newMember, confirm_password: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-10"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as 'admin' | 'member' | 'viewer' })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-10"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Team Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Team Members ({teamMembers.length})</h2>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-4">Add team members to collaborate on your NGO activities.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add First Team Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23] flex items-center justify-center text-white font-medium">
                            {member.full_name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)} border-0 focus:ring-2 focus:ring-[#556B2F]`}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={member.status}
                        onChange={(e) => handleStatusChange(member.id, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)} border-0 focus:ring-2 focus:ring-[#556B2F]`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Admin</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Full access to all features</li>
              <li>• Can manage team members</li>
              <li>• Can create and edit opportunities</li>
              <li>• Can manage applications</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Member</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Can create and edit opportunities</li>
              <li>• Can manage applications</li>
              <li>• Cannot manage team members</li>
              <li>• Limited access to settings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Viewer</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Read-only access</li>
              <li>• Can view opportunities and applications</li>
              <li>• Cannot make changes</li>
              <li>• Cannot access sensitive data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
