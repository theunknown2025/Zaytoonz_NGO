'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
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
import CvPreviewModal from './components/CvPreviewModal';
import { useAuth } from '@/app/lib/auth';
import { toast } from 'react-hot-toast';
import ApplicationProcessPanel from '@/app/components/ApplicationProcessPanel';
import CvExportProgressModal, { type CvExportProgress } from './components/CvExportProgressModal';
import { exportCandidateCvs } from './utils/generateCvPdfs';
import { getQualificationGroupColorClasses } from '@/app/lib/qualificationGroups';

interface QualificationGroupRow {
  id: string;
  label: string;
  color: string | null;
  sort_order: number;
}

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
  current_step_index?: number;
  process_status?: string;
  qualification_group_id?: string | null;
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
  status: string;
  created_at: string;
  opportunities: {
    id: string;
    title: string;
    opportunity_type: string;
    created_at: string;
  };
  applications: Application[];
  application_count: number;
  qualification_groups: QualificationGroupRow[];
}

export default function ApplicationsPage() {
  const [opportunities, setOpportunities] = useState<OpportunityWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupFilters, setGroupFilters] = useState<Record<string, string>>({});
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [cvExport, setCvExport] = useState<CvExportProgress | null>(null);
  const [expandedOpportunities, setExpandedOpportunities] = useState<Set<string>>(new Set());
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const [extractorOpen, setExtractorOpen] = useState(false);
  const [selectedOpportunityForExtract, setSelectedOpportunityForExtract] = useState<OpportunityWithApplications | null>(null);
  const [publishingOpportunities, setPublishingOpportunities] = useState<Set<string>>(new Set());
  const [cvPreview, setCvPreview] = useState<{ id: string; name: string | null } | null>(null);
  
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

  const setApplicationGroupLocally = (applicationId: string, groupId: string | null) => {
    setOpportunities((prev) =>
      prev.map((opp) => ({
        ...opp,
        applications: opp.applications.map((app) =>
          app.id === applicationId ? { ...app, qualification_group_id: groupId } : app
        ),
      }))
    );
  };

  const handleAssignGroup = async (application: Application, groupId: string) => {
    const previousGroupId = application.qualification_group_id ?? null;
    const nextGroupId = previousGroupId === groupId ? null : groupId;
    setApplicationGroupLocally(application.id, nextGroupId);

    try {
      const response = await fetch('/api/ngo/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id, qualificationGroupId: nextGroupId }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to move application');
      }
    } catch (error) {
      setApplicationGroupLocally(application.id, previousGroupId);
      toast.error(error instanceof Error ? error.message : 'Failed to move application');
    }
  };

  const toggleApplicationSelected = (applicationId: string) => {
    setSelectedApplications((prev) => {
      const next = new Set(prev);
      if (next.has(applicationId)) next.delete(applicationId);
      else next.add(applicationId);
      return next;
    });
  };

  const setApplicationsSelected = (applicationIds: string[], selected: boolean) => {
    setSelectedApplications((prev) => {
      const next = new Set(prev);
      applicationIds.forEach((id) => (selected ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const handleDownloadSelectedCvs = async (opportunity: OpportunityWithApplications) => {
    const selected = opportunity.applications.filter((app) => selectedApplications.has(app.id));
    const withCv = selected.filter((app) => app.selected_cv_id);
    const withoutCv = selected.filter((app) => !app.selected_cv_id);

    if (withCv.length === 0) {
      toast.error('None of the selected candidates included a CV');
      return;
    }

    const items = withCv.map((app) => ({
      applicationId: app.id,
      cvId: app.selected_cv_id as string,
      candidateName: app.seeker_profile?.full_name || app.selected_cv_name || 'Candidate',
    }));

    setCvExport({ done: 0, total: items.length, finished: false, generated: 0, failed: [] });
    try {
      const result = await exportCandidateCvs(items, `${opportunity.title}_CVs`, (done, total) =>
        setCvExport((prev) => (prev ? { ...prev, done, total } : prev))
      );
      setCvExport((prev) =>
        prev
          ? {
              ...prev,
              finished: true,
              generated: result.generated,
              failed: [
                ...result.failed,
                ...withoutCv.map((app) => ({
                  candidateName: app.seeker_profile?.full_name || 'Unknown applicant',
                  error: 'No CV included with the application',
                })),
              ],
            }
          : prev
      );
    } catch (error) {
      console.error('Error exporting CVs:', error);
      setCvExport(null);
      toast.error(error instanceof Error ? error.message : 'Failed to generate CVs');
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

  const handlePublishOpportunity = async (opportunityId: string) => {
    try {
      setPublishingOpportunities(prev => new Set(Array.from(prev).concat(opportunityId)));
      
      const response = await fetch('/api/ngo/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
          action: 'publish'
        }),
      });

      if (response.ok) {
        // Refresh the data to show updated status
        await fetchApplications();
        toast.success('Opportunity published successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish opportunity');
      }
    } catch (error) {
      console.error('Error publishing opportunity:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish opportunity');
    } finally {
      setPublishingOpportunities(prev => {
        const newSet = new Set(prev);
        newSet.delete(opportunityId);
        return newSet;
      });
    }
  };

  const getGroupFilter = (opportunityId: string) => groupFilters[opportunityId] || 'all';

  const setGroupFilter = (opportunityId: string, value: string) => {
    setGroupFilters((prev) => ({ ...prev, [opportunityId]: value }));
  };

  const getFilteredApplications = (opportunity: OpportunityWithApplications) => {
    const filter = getGroupFilter(opportunity.opportunity_id);
    if (filter === 'all') return opportunity.applications;
    if (filter === 'unassigned') return opportunity.applications.filter((app) => !app.qualification_group_id);
    return opportunity.applications.filter((app) => app.qualification_group_id === filter);
  };

  // Get total counts for filter buttons
  const getAllApplications = () => {
    return opportunities.flatMap(opp => opp.applications);
  };

  const getStatusCounts = () => {
    const allApps = getAllApplications();
    return {
      all: allApps.length,
      unassigned: allApps.filter(app => !app.qualification_group_id).length,
      grouped: allApps.filter(app => app.qualification_group_id).length,
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
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.unassigned}</div>
            <div className="text-sm text-gray-600">Not Yet Grouped</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.grouped}</div>
            <div className="text-sm text-gray-600">Sorted Into Groups</div>
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
                  href="/ngo/opportunities?tab=list" 
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
                      Status
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
                          {opportunity.applications.some(app => !app.qualification_group_id) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {opportunity.applications.filter(app => !app.qualification_group_id).length} Not grouped
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          opportunity.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {opportunity.status === 'published' ? 'Published' : 'Completed'}
                        </span>
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
                          {opportunity.status === 'completed' && (
                            <button
                              onClick={() => handlePublishOpportunity(opportunity.opportunity_id)}
                              disabled={publishingOpportunities.has(opportunity.opportunity_id)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {publishingOpportunities.has(opportunity.opportunity_id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Publishing...
                                </>
                              ) : (
                                <>
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  Publish
                                </>
                              )}
                            </button>
                          )}
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
          const filteredApps = getFilteredApplications(opportunity);
          const activeFilter = getGroupFilter(opportunity.opportunity_id);
          const groups = opportunity.qualification_groups || [];
          const groupsById = new Map(groups.map((g) => [g.id, g]));
          const visibleIds = filteredApps.map((app) => app.id);
          const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedApplications.has(id));
          const selectedCount = opportunity.applications.filter((app) => selectedApplications.has(app.id)).length;

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
              <div className="p-4 bg-gray-50 border-b space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGroupFilter(opportunity.opportunity_id, 'all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === 'all' ? 'bg-[#556B2F] text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All ({opportunity.applications.length})
                  </button>
                  <button
                    onClick={() => setGroupFilter(opportunity.opportunity_id, 'unassigned')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === 'unassigned' ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Not grouped ({opportunity.applications.filter(app => !app.qualification_group_id).length})
                  </button>
                  {groups.map((group) => {
                    const colors = getQualificationGroupColorClasses(group.color);
                    const count = opportunity.applications.filter(app => app.qualification_group_id === group.id).length;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setGroupFilter(opportunity.opportunity_id, group.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                          activeFilter === group.id ? colors.active : `border-transparent text-gray-700 hover:bg-gray-100`
                        }`}
                      >
                        <span className={`mr-2 h-2 w-2 rounded-full ${activeFilter === group.id ? 'bg-white' : colors.dot}`} />
                        {group.label} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => setApplicationsSelected(visibleIds, e.target.checked)}
                      disabled={visibleIds.length === 0}
                      className="h-4 w-4 rounded border-gray-300 text-[#556B2F] focus:ring-[#556B2F]"
                    />
                    Select all shown
                    {selectedCount > 0 && (
                      <span className="text-gray-500">({selectedCount} selected)</span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDownloadSelectedCvs(opportunity)}
                    disabled={selectedCount === 0 || (cvExport !== null && !cvExport.finished)}
                    className="inline-flex items-center px-3 py-1.5 bg-[#556B2F] text-white text-sm rounded-lg hover:bg-[#465924] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                    {selectedCount > 1 ? `Download ${selectedCount} CVs (ZIP)` : 'Download CV'}
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
                                <input
                                  type="checkbox"
                                  checked={selectedApplications.has(application.id)}
                                  onChange={() => toggleApplicationSelected(application.id)}
                                  aria-label={`Select ${profile?.full_name || 'applicant'}`}
                                  className="h-4 w-4 rounded border-gray-300 text-[#556B2F] focus:ring-[#556B2F]"
                                />
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
                                  {(() => {
                                    const group = application.qualification_group_id
                                      ? groupsById.get(application.qualification_group_id)
                                      : undefined;
                                    return group ? (
                                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getQualificationGroupColorClasses(group.color).badge}`}>
                                        {group.label}
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                        Not grouped
                                      </span>
                                    );
                                  })()}
                                  {application.selected_cv_id && (
                                    <button
                                      type="button"
                                      onClick={() => setCvPreview({
                                        id: application.selected_cv_id as string,
                                        name: application.selected_cv_name || null,
                                      })}
                                      className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 flex items-center hover:bg-blue-200"
                                    >
                                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                                      View CV
                                    </button>
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
                            {groups.length > 0 && (
                              <div className="mt-3 flex flex-wrap items-center gap-2 pl-[5.5rem]">
                                <span className="text-xs font-medium text-gray-500 mr-1">Move to:</span>
                                {groups.map((group) => {
                                  const colors = getQualificationGroupColorClasses(group.color);
                                  const isCurrent = application.qualification_group_id === group.id;
                                  return (
                                    <button
                                      key={group.id}
                                      type="button"
                                      onClick={() => handleAssignGroup(application, group.id)}
                                      title={isCurrent ? 'Click again to remove from this group' : `Move to ${group.label}`}
                                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                        isCurrent ? colors.active : colors.button
                                      }`}
                                    >
                                      {isCurrent && <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />}
                                      {group.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
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
                                {application.selected_cv_id ? (
                                  <button
                                    type="button"
                                    onClick={() => setCvPreview({
                                      id: application.selected_cv_id as string,
                                      name: application.selected_cv_name || null,
                                    })}
                                    className="inline-flex items-center rounded-lg bg-[#556B2F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#465924]"
                                  >
                                    View CV{application.selected_cv_name ? `: ${application.selected_cv_name}` : ''}
                                  </button>
                                ) : (
                                  <p className="text-sm text-gray-500">No CV was included with this application.</p>
                                )}
                              </div>

                              {/* Process Section */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <ApplicationProcessPanel
                                  applicationId={application.id}
                                  mode="ngo"
                                  onUpdated={fetchApplications}
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
      {cvPreview && (
        <CvPreviewModal
          cvId={cvPreview.id}
          cvName={cvPreview.name}
          onClose={() => setCvPreview(null)}
        />
      )}
      {cvExport && (
        <CvExportProgressModal progress={cvExport} onClose={() => setCvExport(null)} />
      )}
    </div>
  );
} 