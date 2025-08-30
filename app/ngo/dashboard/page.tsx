'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { 
  UserCircleIcon, 
  DocumentPlusIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartPieIcon,
  ArrowRightIcon,
  BellIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisWeek: number;
  lastWeek: number;
}

interface OpportunityStats {
  total: number;
  active: number;
  thisMonth: number;
  lastMonth: number;
}

interface FormsStats {
  total: number;
  published: number;
  draft: number;
  recent: number;
}

interface UserStats {
  totalUsers: number;
  ngoUsers: number;
  seekerUsers: number;
  ngoProfiles: number;
  usersWithCvs: number;
}

interface Activity {
  type: string;
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}



export default function NGODashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [applicationStats, setApplicationStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    thisWeek: 0,
    lastWeek: 0
  });

  const [opportunityStats, setOpportunityStats] = useState<OpportunityStats>({
    total: 0,
    active: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  const [formsStats, setFormsStats] = useState<FormsStats>({
    total: 0,
    published: 0,
    draft: 0,
    recent: 0
  });

  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    ngoUsers: 0,
    seekerUsers: 0,
    ngoProfiles: 0,
    usersWithCvs: 0
  });

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Fetch dashboard data directly since layout handles approval status
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch application statistics
      const { data: appData } = await supabase
        .from('opportunity_applications')
        .select('status, submitted_at');

      if (appData) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        setApplicationStats({
          total: appData.length,
          pending: appData.filter(app => app.status === 'submitted').length,
          approved: appData.filter(app => app.status === 'approved').length,
          rejected: appData.filter(app => app.status === 'rejected').length,
          thisWeek: appData.filter(app => new Date(app.submitted_at) >= oneWeekAgo).length,
          lastWeek: appData.filter(app => 
            new Date(app.submitted_at) >= twoWeeksAgo && 
            new Date(app.submitted_at) < oneWeekAgo
          ).length
        });
      }

      // Fetch opportunity statistics
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select(`
          id,
          created_at,
          opportunity_description!inner(
            id,
            status,
            created_at
          )
        `);

      if (opportunities) {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        setOpportunityStats({
          total: opportunities.length,
          active: opportunities.filter(opp => 
            (opp.opportunity_description as any)?.status === 'published'
          ).length,
          thisMonth: opportunities.filter(opp => 
            new Date((opp.opportunity_description as any)?.created_at || opp.created_at) >= oneMonthAgo
          ).length,
          lastMonth: opportunities.filter(opp => {
            const createdAt = new Date((opp.opportunity_description as any)?.created_at || opp.created_at);
            return createdAt >= twoMonthsAgo && createdAt < oneMonthAgo;
          }).length
        });
      }

      // Fetch forms statistics
      const { data: forms } = await supabase
        .from('forms_templates')
        .select('id, published, status, created_at');

      if (forms) {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        setFormsStats({
          total: forms.length,
          published: forms.filter(form => form.published === true).length,
          draft: forms.filter(form => form.status === 'draft').length,
          recent: forms.filter(form => new Date(form.created_at) >= oneMonthAgo).length
        });
      }

      // Fetch user statistics
      const { data: users } = await supabase
        .from('users')
        .select('id, user_type');

      const { data: ngoProfiles } = await supabase
        .from('ngo_profile')
        .select('id');

      const { data: cvUsers } = await supabase
        .from('cvs')
        .select('user_id')
        .not('user_id', 'is', null);

      if (users && ngoProfiles && cvUsers) {
        const uniqueCvUsers = Array.from(new Set(cvUsers.map(cv => cv.user_id)));

        setUserStats({
          totalUsers: users.length,
          ngoUsers: users.filter(user => user.user_type === 'NGO').length,
          seekerUsers: users.filter(user => user.user_type === 'Personne').length,
          ngoProfiles: ngoProfiles.length,
          usersWithCvs: uniqueCvUsers.length
        });
      }

      // Fetch recent activities
      const { data: applications } = await supabase
        .from('opportunity_applications')
        .select(`
          id,
          status,
          submitted_at,
          opportunities!inner(
            id,
            opportunity_description!inner(
              title
            )
          ),
          users!inner(
            full_name
          )
        `)
        .order('submitted_at', { ascending: false })
        .limit(5);

      const { data: recentOpportunities } = await supabase
        .from('opportunity_description')
        .select('id, title, description, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      if (applications && recentOpportunities) {
        const activities = [
          ...applications.map((app: any) => ({
            type: 'application',
            id: app.id,
            title: `New application for "${(app.opportunities as any)?.opportunity_description?.title || 'Unknown Opportunity'}"`,
            description: `Application submitted by ${(app.users as any)?.full_name || 'Unknown User'}`,
            timestamp: app.submitted_at,
            status: app.status
          })),
          ...recentOpportunities.map((opp: any) => ({
            type: 'opportunity',
            id: opp.id,
            title: `Opportunity "${opp.title}" created`,
            description: opp.description ? opp.description.substring(0, 100) + '...' : 'No description available',
            timestamp: opp.created_at,
            status: opp.status
          }))
        ];

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 10));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendFromWeeklyData = (thisWeek: number, lastWeek: number) => {
    if (lastWeek === 0) return thisWeek > 0 ? 'up' : 'stable';
    if (thisWeek > lastWeek) return 'up';
    if (thisWeek < lastWeek) return 'down';
    return 'stable';
  };

  const getTrendFromMonthlyData = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth > 0 ? 'up' : 'stable';
    if (thisMonth > lastMonth) return 'up';
    if (thisMonth < lastMonth) return 'down';
    return 'stable';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of your NGO operations and impact
          </p>
        </div>
        <div className="flex space-x-3">
          <Link 
            href="/ngo/opportunities/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>New Opportunity</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{applicationStats.total}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(getTrendFromWeeklyData(applicationStats.thisWeek, applicationStats.lastWeek))}
                <span className="ml-2 text-sm text-gray-600">
                  {applicationStats.thisWeek} this week
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Opportunities */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
              <p className="text-3xl font-bold text-gray-900">{opportunityStats.active}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(getTrendFromMonthlyData(opportunityStats.thisMonth, opportunityStats.lastMonth))}
                <span className="ml-2 text-sm text-gray-600">
                  {opportunityStats.thisMonth} this month
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BriefcaseIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</p>
              <div className="flex items-center mt-2">
                <div className="w-4 h-4 bg-purple-400 rounded-full" />
                <span className="ml-2 text-sm text-gray-600">
                  {userStats.seekerUsers} seekers, {userStats.ngoUsers} NGOs
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserGroupIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Impact Rating */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Forms</p>
              <p className="text-3xl font-bold text-gray-900">{formsStats.published}</p>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full mr-1 ${i < 4 ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {formsStats.draft} drafts
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ChartPieIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Application Status Overview</h2>
              <Link href="/ngo/applications" className="text-blue-600 hover:text-blue-800 flex items-center">
                View All <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <ClockIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-800">{applicationStats.pending}</p>
                <p className="text-sm text-yellow-600">Pending Review</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-800">{applicationStats.approved}</p>
                <p className="text-sm text-green-600">Approved</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-800">{applicationStats.rejected}</p>
                <p className="text-sm text-red-600">Rejected</p>
                    </div>
                  </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-medium text-gray-900">
                    {applicationStats.total > 0 
                      ? Math.round(((applicationStats.approved + applicationStats.rejected) / applicationStats.total) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Approval Rate</span>
                  <span className="font-medium text-gray-900">
                    {applicationStats.total > 0 
                      ? Math.round((applicationStats.approved / applicationStats.total) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <span className="font-medium text-gray-900">2.5 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/ngo/opportunities/new"
              className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">Create New Opportunity</span>
            </Link>
            
            <Link
              href="/ngo/applications"
              className="w-full flex items-center p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <ClipboardDocumentListIcon className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="text-yellow-700 font-medium">Review Applications</span>
            </Link>
            
            <Link
              href="/ngo/form-builder"
              className="w-full flex items-center p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <DocumentPlusIcon className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-700 font-medium">Create Application Form</span>
            </Link>
            
            <Link
              href="/ngo/analytics"
              className="w-full flex items-center p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ChartBarIcon className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-purple-700 font-medium">View Analytics</span>
            </Link>
          </div>

          {/* Alerts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <BellIcon className="w-5 h-5 text-orange-500 mr-2" />
              Alerts & Notifications
            </h3>
            <div className="space-y-2">
              {applicationStats.pending > 0 && (
                <div className="flex items-center p-2 bg-orange-50 rounded">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="text-sm text-orange-700">
                    {applicationStats.pending} application{applicationStats.pending > 1 ? 's' : ''} pending review
                  </span>
                </div>
              )}
              {formsStats.draft > 0 && (
                <div className="flex items-center p-2 bg-blue-50 rounded">
                  <DocumentTextIcon className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-blue-700">
                    {formsStats.draft} draft form{formsStats.draft > 1 ? 's' : ''} ready to publish
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & Opportunities Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
            <Link href="/ngo/activities" className="text-blue-600 hover:text-blue-800 flex items-center">
              View All <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'application' ? 'bg-blue-100' : 
                    activity.type === 'opportunity' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'application' ? (
                      <DocumentTextIcon className={`w-4 h-4 ${
                        activity.type === 'application' ? 'text-blue-600' : 
                        activity.type === 'opportunity' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    ) : (
                      <BriefcaseIcon className={`w-4 h-4 ${
                        activity.type === 'application' ? 'text-blue-600' : 
                        activity.type === 'opportunity' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                        </span>
                      </div>
                      </div>
                    </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Opportunities Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Opportunities Overview</h2>
            <Link href="/ngo/opportunities" className="text-blue-600 hover:text-blue-800 flex items-center">
              Manage <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-800">{opportunityStats.total}</p>
              <p className="text-sm text-blue-600">Total Posted</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-800">{opportunityStats.active}</p>
              <p className="text-sm text-green-600">Currently Active</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Job Opportunities</span>
              <span className="font-medium text-gray-900">{Math.floor(opportunityStats.total * 0.6)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Training Programs</span>
              <span className="font-medium text-gray-900">{Math.floor(opportunityStats.total * 0.3)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Funding Opportunities</span>
              <span className="font-medium text-gray-900">{Math.ceil(opportunityStats.total * 0.1)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average Applications per Opportunity</span>
              <span className="font-medium text-gray-900">
                {opportunityStats.total > 0 ? Math.round(applicationStats.total / opportunityStats.total) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 