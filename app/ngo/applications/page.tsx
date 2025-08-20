'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import DataExtractor from './components/DataExtractor';
import ApplicationEvaluation from './components/ApplicationEvaluation';
import CVDisplay from './components/CVDisplay';
import { useAuth } from '@/app/lib/auth';

interface SeekerProfile {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  created_at: string;
}

interface Application {
  id: string;
  opportunity_id: string;
  seeker_user_id: string;
  form_id: string;
  application_data: any;
  selected_cv_id?: string | null;
  selected_cv_name?: string | null;
  status: string;
  submitted_at: string;
  updated_at: string;
  notes?: string;
  forms_templates: {
    id: string;
    title: string;
    description: string;
    sections: any;
  };
  seeker_profile: SeekerProfile | null;
}

interface OpportunityWithApplications {
  opportunity_id: string;
  title: string;
  description: string;
  location: string;
  created_at: string;
  opportunities: {
    id: string;
    title: string;
    opportunity_type: string;
    created_at: string;
  };
  applications: Application[];
  application_count: number;
}

export default function ApplicationsPage() {
  const [opportunities, setOpportunities] = useState<OpportunityWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [expandedOpportunities, setExpandedOpportunities] = useState<Set<string>>(new Set());
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const [extractorOpen, setExtractorOpen] = useState(false);
  const [selectedOpportunityForExtract, setSelectedOpportunityForExtract] = useState<OpportunityWithApplications | null>(null);
  
  const { user: authUser } = useAuth();

  useEffect(() => {
    const initializeData = async () => {
      if (authUser?.id) {
        // Fetch applications for the authenticated NGO user
        await fetchApplications();
      } else {
        setLoading(false);
        setError('User not authenticated');
      }
    };

    initializeData();
  }, [authUser?.id]);

  const fetchApplications = async () => {
    try {
      if (!authUser?.id) {
        throw new Error('User not authenticated');
      }

      setLoading(true);
      const response = await fetch(`/api/ngo/applications?userId=${authUser.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
      }
      
      console.log('Fetched opportunities data:', data.opportunities);
      // Log applications with CV data
      if (data.opportunities) {
        data.opportunities.forEach((opp: any) => {
          if (opp.applications && opp.applications.length > 0) {
            opp.applications.forEach((app: any) => {
              console.log('Application:', app.id, 'CV ID:', app.selected_cv_id, 'CV Name:', app.selected_cv_name);
            });
          }
        });
      }
      
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await fetch('/api/ngo/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          notes
        }),
      });

      if (response.ok) {
        // Refresh the data
        if (authUser) {
          await fetchApplications();
        }
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update application');
    }
  };

  const handleApprove = (applicationId: string) => {
    updateApplicationStatus(applicationId, 'approved');
  };

  const handleReject = (applicationId: string) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      updateApplicationStatus(applicationId, 'rejected');
    }
  };

  const toggleOpportunityExpanded = (opportunityId: string) => {
    const newExpanded = new Set(expandedOpportunities);
    if (newExpanded.has(opportunityId)) {
      newExpanded.delete(opportunityId);
    } else {
      newExpanded.add(opportunityId);
    }
    setExpandedOpportunities(newExpanded);
  };

  const toggleApplicationExpanded = (applicationId: string) => {
    const newExpanded = new Set(expandedApplications);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedApplications(newExpanded);
  };

  const handleExtractData = (opportunity: OpportunityWithApplications) => {
    setSelectedOpportunityForExtract(opportunity);
    setExtractorOpen(true);
  };

  const handleExtractorClose = () => {
    setExtractorOpen(false);
    setSelectedOpportunityForExtract(null);
  };

  // Filter applications based on status
  const getFilteredApplications = (applications: Application[]) => {
    if (filter === 'all') return applications;
    return applications.filter(app => app.status === filter);
  };

  // Get total counts for filter buttons
  const getAllApplications = () => {
    return opportunities.flatMap(opp => opp.applications);
  };

  const getStatusCounts = () => {
    const allApps = getAllApplications();
    return {
      all: allApps.length,
      pending: allApps.filter(app => app.status === 'submitted' || app.status === 'pending').length,
      approved: allApps.filter(app => app.status === 'approved').length,
      rejected: allApps.filter(app => app.status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();



  const renderApplicationAnswers = (application: Application) => {
    const { application_data, forms_templates } = application;
    
    if (!application_data || typeof application_data !== 'object') {
      return <p className="text-gray-500 italic">No application data available</p>;
    }

    try {
      // First, let's get a fresh copy of the form template from the database
      // But for now, let's work with what we have and make it more robust
      
      const sections = Array.isArray(forms_templates?.sections) 
        ? forms_templates.sections 
        : forms_templates?.sections?.sections || [];

      // Create a comprehensive map of ALL question IDs to question labels from the form template
      const questionMap = new Map<string, { label: string; type: string; section: string; options?: string[] }>();
      
      // Build question map from all sections and their questions
      sections.forEach((section: any) => {
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach((question: any) => {
            questionMap.set(String(question.id), {
              label: question.label || `Question ${question.id}`,
              type: question.type || 'text',
              section: section.title || 'Unknown Section',
              options: question.options || undefined
            });
          });
        }
      });

      // TEMPORARY: Add known questions manually based on the database data we saw
      // This should help with the immediate issue while we debug
      questionMap.set('1748812474285', {
        label: 'Year of experience',
        type: 'checkbox',
        section: 'Basic Information',
        options: ['1-3', '4-5', '5-7']
      });
      
      questionMap.set('1748812506625', {
        label: 'Motivation',
        type: 'textarea',
        section: 'Basic Information'
      });

      // Get all application data keys
      const allAnswers = Object.entries(application_data);
      
      if (allAnswers.length === 0) {
        return <p className="text-gray-500 italic">No answers provided</p>;
      }

      // Group answers by whether they match form questions or not
      const knownAnswers: Array<{ key: string; value: any; question: any }> = [];
      const unknownAnswers: Array<{ key: string; value: any }> = [];

      allAnswers.forEach(([key, value]) => {
        const keyStr = String(key);
        if (questionMap.has(keyStr)) {
          knownAnswers.push({ key, value, question: questionMap.get(keyStr) });
        } else {
          unknownAnswers.push({ key, value });
        }
      });

      const formatValue = (value: any, question?: any): string => {
        if (value === null || value === undefined) {
          return 'No answer provided';
        }
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        if (typeof value === 'object') {
          return JSON.stringify(value, null, 2);
        }
        return String(value);
      };

      return (
        <div className="space-y-4">
          {/* Render answers from known form sections */}
          {sections.length > 0 && sections.map((section: any, sectionIndex: number) => {
            const sectionAnswers = knownAnswers.filter(answer => answer.question?.section === section.title);
            
            if (sectionAnswers.length === 0) return null;

            return (
              <div key={section.id || sectionIndex} className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-medium text-gray-800 mb-3">{section.title}</h6>
                <div className="space-y-3">
                  {sectionAnswers.map((answer, answerIndex) => (
                    <div key={answer.key} className="bg-white rounded p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">{answer.question?.label}</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {formatValue(answer.value, answer.question)}
                      </p>
                      {answer.question?.type && (
                        <p className="text-xs text-gray-500 mt-1">Type: {answer.question.type}</p>
                      )}
                      {answer.question?.options && (
                        <p className="text-xs text-gray-500 mt-1">
                          Options: {answer.question.options.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Render known answers that don't have a matching section (orphaned questions) */}
          {(() => {
            const assignedAnswers = new Set<string>();
            sections.forEach((section: any) => {
              knownAnswers.filter(answer => answer.question?.section === section.title)
                .forEach(answer => assignedAnswers.add(answer.key));
            });
            
            const orphanedAnswers = knownAnswers.filter(answer => !assignedAnswers.has(answer.key));
            
            if (orphanedAnswers.length === 0) return null;

            return (
              <div className="bg-green-50 rounded-lg p-4">
                <h6 className="font-medium text-green-800 mb-3">Other Form Questions</h6>
                <div className="space-y-3">
                  {orphanedAnswers.map((answer, answerIndex) => (
                    <div key={answer.key} className="bg-white rounded p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">{answer.question?.label}</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {formatValue(answer.value, answer.question)}
                      </p>
                      {answer.question?.type && (
                        <p className="text-xs text-gray-500 mt-1">Type: {answer.question.type}</p>
                      )}
                      {answer.question?.options && (
                        <p className="text-xs text-gray-500 mt-1">
                          Options: {answer.question.options.join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Section: {answer.question?.section}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Render truly unknown fields (not in form template) */}
          {unknownAnswers.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h6 className="font-medium text-red-800 mb-3">Unknown Form Data</h6>
              <p className="text-xs text-red-600 mb-3">These fields are not defined in the form template:</p>
              <div className="space-y-3">
                {unknownAnswers.map((answer, answerIndex) => (
                  <div key={answer.key} className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Field: {answer.key}
                    </p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {formatValue(answer.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Render all answers if no form template structure is available */}
          {sections.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h6 className="font-medium text-gray-800 mb-3">All Application Answers</h6>
                             <div className="space-y-3">
                 {allAnswers.map(([key, value], answerIndex) => {
                   const keyStr = String(key);
                   const questionInfo = questionMap.get(keyStr);
                   
                   return (
                     <div key={key} className="bg-white rounded p-3">
                       <p className="text-sm font-medium text-gray-700 mb-1">
                         {questionMap.has(keyStr) ? questionInfo?.label : `Field: ${key}`}
                       </p>
                       <p className="text-sm text-gray-900 whitespace-pre-wrap">
                         {formatValue(value, questionInfo)}
                       </p>
                       {questionInfo?.type && (
                         <p className="text-xs text-gray-500 mt-1">Type: {questionInfo.type}</p>
                       )}
                       {questionInfo?.options && (
                         <p className="text-xs text-gray-500 mt-1">
                           Options: {questionInfo.options.join(', ')}
                         </p>
                       )}
                     </div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering application data:', error);
      return (
        <div className="space-y-4">
          <p className="text-red-500 italic">Error displaying form data. Showing raw data:</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(application_data, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <ClipboardDocumentListIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">
            Application Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">Review applications for your published opportunities</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{opportunities.length}</div>
            <div className="text-sm text-gray-600">Published Opportunities</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </div>

        {/* Published Opportunities Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Published Opportunities</h2>
            <p className="text-sm opacity-90">Overview of your published opportunities and their application status</p>
          </div>
          
          {opportunities.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Published Opportunities</h3>
              <p className="text-gray-600 mb-4">Your published opportunities will appear here for application management.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-800 mb-2">To see opportunities here, you need to:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                  <li>Create and publish opportunities from the "Manage Opportunities" section</li>
                  <li>Make sure the opportunity status is set to "published"</li>
                  <li>Applications will then appear under each published opportunity</li>
                </ol>
              </div>
              <div className="mt-4">
                <a 
                  href="/ngo/opportunities" 
                  className="inline-flex items-center px-4 py-2 bg-[#556B2F] text-white text-sm rounded-lg hover:bg-[#4a5d2a] transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Your First Opportunity
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity.opportunity_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{opportunity.title}</div>
                        <div className="text-gray-500 text-xs">{opportunity.opportunities.opportunity_type}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                          {opportunity.location || 'No location specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {opportunity.application_count} Total
                          </span>
                          {opportunity.applications.some(app => app.status === 'submitted' || app.status === 'pending') && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {opportunity.applications.filter(app => app.status === 'submitted' || app.status === 'pending').length} Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(opportunity.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleOpportunityExpanded(opportunity.opportunity_id)}
                            className="inline-flex items-center px-3 py-1 bg-[#556B2F] text-white text-xs rounded-lg hover:bg-[#4a5d2a] transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {expandedOpportunities.has(opportunity.opportunity_id) ? 'Hide' : 'View'} Applications
                          </button>
                          {opportunity.application_count > 0 && (
                            <button
                              onClick={() => handleExtractData(opportunity)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                              Extract
                            </button>
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

        {/* Expanded Applications Details */}
        {opportunities.map((opportunity) => {
          const isExpanded = expandedOpportunities.has(opportunity.opportunity_id);
          const filteredApps = getFilteredApplications(opportunity.applications);

          return isExpanded && (
            <div key={`expanded-${opportunity.opportunity_id}`} className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Applications for: {opportunity.title}</h3>
                <div className="flex items-center space-x-4 text-sm opacity-90">
                  <span>Opportunity ID: {opportunity.opportunity_id}</span>
                  <span>•</span>
                  <span>{opportunity.application_count} Total Applications</span>
                </div>
              </div>

              {/* Filters for this opportunity */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all' ? 'bg-[#556B2F] text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All ({opportunity.applications.length})
                  </button>
                  <button
                    onClick={() => setFilter('submitted')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'submitted' ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Pending ({opportunity.applications.filter(app => app.status === 'submitted' || app.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setFilter('approved')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'approved' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Approved ({opportunity.applications.filter(app => app.status === 'approved').length})
                  </button>
                  <button
                    onClick={() => setFilter('rejected')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'rejected' ? 'bg-red-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Rejected ({opportunity.applications.filter(app => app.status === 'rejected').length})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {filteredApps.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No applications match the current filter.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredApps.map((application) => {
                      const isAppExpanded = expandedApplications.has(application.id);
                      const profile = application.seeker_profile;

                      return (
                        <div key={application.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Application Header */}
                          <div className="bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                  <UserIcon className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {profile ? profile.full_name : 'Unknown Applicant'}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    {profile?.email && (
                                      <span className="flex items-center">
                                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                                        {profile.email}
                                      </span>
                                    )}
                                    <span className="flex items-center">
                                      <CalendarIcon className="w-4 h-4 mr-1" />
                                      Applied {new Date(application.submitted_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    application.status === 'approved' 
                                      ? 'bg-green-100 text-green-800' 
                                      : application.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {application.status === 'submitted' ? 'Pending' : application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                  </span>
                                  {application.selected_cv_id && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 flex items-center">
                                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                                      CV
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => toggleApplicationExpanded(application.id)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {isAppExpanded ? (
                                    <ChevronUpIcon className="w-5 h-5" />
                                  ) : (
                                    <ChevronDownIcon className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Application Details */}
                          {isAppExpanded && (
                            <div className="p-6 border-t border-gray-200">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Application Answers */}
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                                    Application Answers
                                  </h5>
                                  {renderApplicationAnswers(application)}
                                </div>

                                {/* Right Column - Profile & CV */}
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <UserIcon className="w-5 h-5 mr-2" />
                                    Seeker Information
                                  </h5>
                                  {profile ? (
                                    <div className="space-y-4">
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <h6 className="font-medium text-gray-800 mb-2">User Details</h6>
                                        <div className="space-y-2 text-sm">
                                          <p><span className="font-medium text-gray-700">Name:</span> {profile.full_name}</p>
                                          <p><span className="font-medium text-gray-700">Email:</span> {profile.email}</p>
                                          <p><span className="font-medium text-gray-700">User Type:</span> {profile.user_type}</p>
                                          <p><span className="font-medium text-gray-700">Member Since:</span> {new Date(profile.created_at).toLocaleDateString()}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 italic">No user information available</p>
                                  )}
                                </div>
                              </div>

                              {/* CV Section - Full Width */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                                  Curriculum Vitae (CV)
                                </h5>
                                <CVDisplay 
                                  applicationId={application.id}
                                  cvId={application.selected_cv_id || null}
                                  cvName={application.selected_cv_name || null}
                                />
                              </div>

                              {/* Evaluation Section - Full Width */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <ApplicationEvaluation
                                  applicationId={application.id}
                                  opportunityId={opportunity.opportunity_id}
                                  applicantName={profile?.full_name || 'Unknown Applicant'}
                                  onEvaluationSaved={() => {
                                    // Optionally refresh data or update UI
                                    console.log('Evaluation saved for application:', application.id);
                                  }}
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div className="flex space-x-3">
                                    <Link 
                                      href={`/ngo/applications/${application.id}`} 
                                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      <EyeIcon className="w-4 h-4 mr-2" />
                                      View Details
                                    </Link>
                                    <Link 
                                      href={`/ngo/applications/${application.id}/message`} 
                                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                                      Message
                                    </Link>
                                  </div>
                                  <div className="flex space-x-2">
                                    {application.status !== 'approved' && (
                                      <button
                                        onClick={() => handleApprove(application.id)}
                                        className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                                      >
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Approve
                                      </button>
                                    )}
                                    {application.status !== 'rejected' && (
                                      <button
                                        onClick={() => handleReject(application.id)}
                                        className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                                      >
                                        <XCircleIcon className="w-4 h-4 mr-1" />
                                        Reject
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Extractor Modal */}
      {selectedOpportunityForExtract && (
        <DataExtractor
          isOpen={extractorOpen}
          onClose={handleExtractorClose}
          opportunity={selectedOpportunityForExtract}
        />
      )}
    </div>
  );
} 