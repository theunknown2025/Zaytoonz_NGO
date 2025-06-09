'use client';

import React, { useState, useEffect } from 'react';
import { BellIcon, ClockIcon, CheckCircleIcon, XCircleIcon, BriefcaseIcon, BanknotesIcon, AcademicCapIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AuthService } from '@/app/lib/auth';
import { useRouter } from 'next/navigation';

// Type definitions
interface Application {
  id: string;
  opportunity_id: string;
  seeker_user_id: string;
  form_id: string;
  application_data: any;
  status: string;
  submitted_at: string;
  updated_at: string;
  notes?: string;
  opportunities: {
    id: string;
    title: string;
    opportunity_type: string;
  };
  opportunity_description: {
    title: string;
    description: string;
    location: string;
    user_id: string;
    created_at: string;
    metadata: any;
  } | null;
  forms_templates: {
    title: string;
    description: string;
  };
}

// Modal component for displaying application details
const ApplicationModal = ({ 
  application, 
  isOpen, 
  onClose 
}: { 
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [formStructure, setFormStructure] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && application) {
      fetchFormStructure();
    }
  }, [isOpen, application]);

  const fetchFormStructure = async () => {
    if (!application) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${application.form_id}`);
      const data = await response.json();
      
      if (response.ok) {
        setFormStructure(data.form);
      } else {
        console.error('Failed to fetch form structure:', data.error);
      }
    } catch (error) {
      console.error('Error fetching form structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionLabel = (questionId: string): string => {
    if (!formStructure?.sections) return `Question ${questionId}`;
    
    for (const section of formStructure.sections) {
      if (section.questions) {
        const question = section.questions.find((q: any) => q.id === questionId);
        if (question) {
          return question.label || question.text || `Question ${questionId}`;
        }
      }
    }
    return `Question ${questionId}`;
  };

  const getQuestionType = (questionId: string): string => {
    if (!formStructure?.sections) return 'text';
    
    for (const section of formStructure.sections) {
      if (section.questions) {
        const question = section.questions.find((q: any) => q.id === questionId);
        if (question) {
          return question.type || 'text';
        }
      }
    }
    return 'text';
  };

  if (!isOpen || !application) return null;

  const renderApplicationData = () => {
    if (!application.application_data) return <p className="text-gray-500">No application data available</p>;

    return (
      <div className="space-y-4">
        {Object.entries(application.application_data).map(([questionId, answer], index) => {
          const questionLabel = getQuestionLabel(questionId);
          const questionType = getQuestionType(questionId);
          
          return (
            <div key={questionId} className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <h4 className="font-medium text-gray-800">{questionLabel}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {questionType}
                  </span>
                  <span className="text-xs text-gray-400">ID: {questionId}</span>
                </div>
              </div>
              <div className="text-gray-900">
                {typeof answer === 'string' ? (
                  <div className="bg-white p-3 rounded border">
                    <p className="whitespace-pre-wrap">{answer}</p>
                  </div>
                ) : Array.isArray(answer) ? (
                  <div className="bg-white p-3 rounded border">
                    <ul className="list-disc list-inside space-y-1">
                      {answer.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded border">
                    <pre className="text-sm text-gray-700">
                      {JSON.stringify(answer, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {application.opportunity_description?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Application Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Application Status</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                application.status.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800' :
                application.status.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                application.status.toLowerCase() === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {application.status}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Form Used</h3>
              <p className="text-sm text-gray-600">{application.forms_templates.title}</p>
              {application.forms_templates.description && (
                <p className="text-xs text-gray-500 mt-1">{application.forms_templates.description}</p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Submitted</h3>
              <p className="text-sm text-gray-600">
                {new Date(application.submitted_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Last Updated</h3>
              <p className="text-sm text-gray-600">
                {new Date(application.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{application.notes}</p>
              </div>
            </div>
          )}

          {/* Application Answers */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Your Answers</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-gray-500">Loading application details...</div>
              </div>
            ) : (
              renderApplicationData()
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Optional: Add functionality to download or print the application
              window.print();
            }}
            className="px-4 py-2 bg-olive-dark text-white rounded-lg hover:bg-olive-medium transition-colors"
          >
            Print Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get current user
        const { user: currentUser } = await AuthService.getUser();
        if (!currentUser) {
          router.push('/auth/signin');
          return;
        }
        setUser(currentUser);

        // Fetch applications
        const response = await fetch(`/api/opportunities/applications?seekerUserId=${currentUser.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch applications');
        }

        setApplications(data.applications || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [router]);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const filteredApplications = selectedCategory === 'all' 
    ? applications 
    : applications.filter(app => app.opportunities.opportunity_type === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'job': return <BriefcaseIcon className="w-5 h-5" />;
      case 'funding': return <BanknotesIcon className="w-5 h-5" />;
      case 'training': return <AcademicCapIcon className="w-5 h-5" />;
      default: return <BriefcaseIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'job': return 'bg-blue-100 text-blue-800';
      case 'funding': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview scheduled': return 'bg-blue-100 text-blue-800';
      case 'submitted':
      case 'in review':
      case 'under review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="animate-pulse text-olive-dark text-lg">
          Loading your applications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Applications</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">My Applications</h1>
        <div className="ml-auto flex gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>
      
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Track All Your Applications</h2>
          <p className="text-gray-600 mb-6">
            Monitor the status of your opportunity applications, funding requests, and training program applications in one place.
          </p>
          
          {/* Category Filter */}
          <div className="mb-6">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
            >
              <option value="all">All Categories</option>
              <option value="job">Jobs</option>
              <option value="funding">Funding</option>
              <option value="training">Training</option>
            </select>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-1">Total Applications</h3>
              <p className="text-2xl font-bold text-blue-900">{filteredApplications.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="font-medium text-yellow-800 mb-1">In Progress</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {filteredApplications.filter(app => 
                  ['submitted', 'in review', 'under review', 'interview scheduled'].includes(app.status.toLowerCase())
                ).length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-800 mb-1">Accepted</h3>
              <p className="text-2xl font-bold text-green-900">
                {filteredApplications.filter(app => app.status.toLowerCase() === 'accepted').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-medium text-red-800 mb-1">Rejected</h3>
              <p className="text-2xl font-bold text-red-900">
                {filteredApplications.filter(app => app.status.toLowerCase() === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Application History ({filteredApplications.length})</h3>
            <button 
              onClick={() => router.push('/seeker/opportunities/navigate')}
              className="px-3 py-1 text-sm bg-olive-dark text-white rounded-md hover:bg-olive-medium transition-colors"
            >
              + New Application
            </button>
          </div>
          
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <ClipboardDocumentListIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't submitted any applications yet. Start by browsing opportunities.
              </p>
              <button
                onClick={() => router.push('/seeker/opportunities/navigate')}
                className="bg-olive-dark text-white px-6 py-3 rounded-lg hover:bg-olive-medium transition-colors font-medium"
              >
                Browse Opportunities
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map(application => (
                <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(application.opportunities.opportunity_type)}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {application.opportunity_description?.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Form: {application.forms_templates.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(application.opportunities.opportunity_type)}`}>
                        {application.opportunities.opportunity_type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>Applied: {formatDate(application.submitted_at)}</span>
                    </div>
                    {application.opportunity_description?.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📍 {application.opportunity_description.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Last updated: {formatDate(application.updated_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <p>Application submitted via form</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/seeker/opportunities/${application.opportunity_id}`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        View Opportunity
                      </button>
                      <button
                        onClick={() => handleViewApplication(application)}
                        className="px-4 py-2 bg-olive-dark text-white rounded-md hover:bg-olive-medium transition-colors text-sm font-medium"
                      >
                        View Application
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
} 