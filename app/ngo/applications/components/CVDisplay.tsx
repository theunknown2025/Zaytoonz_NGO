'use client';

import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface CVData {
  id: string;
  name: string;
  general_info?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    address?: string;
    birthDate?: string;
    nationality?: string;
    gender?: string;
  };
  summary?: string;
  additional?: string;
  work_experiences?: Array<{
    id: string;
    position: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
  }>;
  education?: Array<{
    id: string;
    degree: string;
    institution: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>;
  skills?: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  languages?: Array<{
    id: string;
    language: string;
    proficiency: string;
  }>;
  certificates?: Array<{
    id: string;
    name: string;
    issuer?: string;
    issue_date?: string;
    description?: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    role?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    url?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface CVDisplayProps {
  applicationId: string;
  cvId: string | null;
  cvName: string | null;
  className?: string;
}

export default function CVDisplay({ applicationId, cvId, cvName, className = '' }: CVDisplayProps) {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cvId) {
      fetchCVDetails(cvId);
    }
  }, [cvId]);

  const fetchCVDetails = async (cvIdToFetch: string) => {
    if (!cvIdToFetch) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching CV details for ID:', cvIdToFetch);
      
      const response = await fetch(`/api/cvs/${cvIdToFetch}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CV: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ CV data loaded:', data);
      
      setCvData(data);
    } catch (error) {
      console.error('❌ Error fetching CV details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load CV details');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFetch = () => {
    if (cvId) {
      fetchCVDetails(cvId);
    }
  };

  // Helper function to get full name
  const getFullName = () => {
    if (cvData?.general_info?.fullName) {
      return cvData.general_info.fullName;
    }
    
    const firstName = cvData?.general_info?.firstName || '';
    const lastName = cvData?.general_info?.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return null;
  };

  // No CV attached
  if (!cvId || !cvName) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          <DocumentTextIcon className="w-5 h-5 text-gray-400" />
          <h6 className="font-medium text-gray-600">CV Information</h6>
        </div>
        <p className="text-gray-500 italic text-sm">No CV included with this application</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          <h6 className="font-medium text-gray-800">Included CV</h6>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Attached
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium text-gray-700">CV Name:</span> {cvName}
          </p>
          
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading CV details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          <h6 className="font-medium text-gray-800">Included CV</h6>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Attached
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium text-gray-700">CV Name:</span> {cvName}
          </p>
          
          <div className="mt-3 p-3 bg-white rounded border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Failed to load CV details</p>
                <p className="text-xs text-red-500 mt-1">{error}</p>
              </div>
              <button
                onClick={handleRetryFetch}
                className="flex items-center space-x-1 text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                <ArrowPathIcon className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CV not yet loaded but not loading
  if (!cvData) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          <h6 className="font-medium text-gray-800">Included CV</h6>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Attached
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium text-gray-700">CV Name:</span> {cvName}
          </p>
          
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">CV details not loaded</p>
              <button
                onClick={handleRetryFetch}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                Load CV Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Successfully loaded CV data
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
        <h6 className="font-medium text-gray-800">Included CV</h6>
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          Loaded
        </span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium text-gray-700">CV Name:</span> {cvName}
        </p>
        
        <div className="mt-3 p-3 bg-white rounded border max-h-96 overflow-y-auto">
          <h6 className="font-medium text-gray-800 mb-3">CV Details</h6>
          
          {/* General Information */}
          {cvData.general_info && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                Personal Information
              </p>
              <div className="text-sm text-gray-600 space-y-1 ml-5">
                {getFullName() && (
                  <p><span className="font-medium">Name:</span> {getFullName()}</p>
                )}
                {cvData.general_info.email && (
                  <p><span className="font-medium">Email:</span> {cvData.general_info.email}</p>
                )}
                {cvData.general_info.phone && (
                  <p><span className="font-medium">Phone:</span> {cvData.general_info.phone}</p>
                )}
                {(cvData.general_info.location || cvData.general_info.address) && (
                  <p><span className="font-medium">Location:</span> {cvData.general_info.location || cvData.general_info.address}</p>
                )}
                {cvData.general_info.nationality && (
                  <p><span className="font-medium">Nationality:</span> {cvData.general_info.nationality}</p>
                )}
                {cvData.general_info.birthDate && (
                  <p><span className="font-medium">Birth Date:</span> {new Date(cvData.general_info.birthDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {cvData.summary && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Professional Summary</p>
              <p className="text-sm text-gray-600 ml-5">{cvData.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {cvData.work_experiences && cvData.work_experiences.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <BriefcaseIcon className="w-4 h-4 mr-1" />
                Work Experience
              </p>
              <div className="ml-5 space-y-2">
                {cvData.work_experiences.slice(0, 3).map((work, index) => (
                  <div key={work.id || index} className="text-sm">
                    <p className="font-medium text-gray-800">{work.position} at {work.company}</p>
                    <p className="text-gray-600">
                      {work.location && `${work.location} • `}
                      {work.start_date} - {work.is_current ? 'Present' : work.end_date}
                    </p>
                    {work.description && (
                      <p className="text-gray-600 mt-1">
                        {work.description.length > 100 
                          ? `${work.description.substring(0, 100)}...` 
                          : work.description
                        }
                      </p>
                    )}
                  </div>
                ))}
                {cvData.work_experiences.length > 3 && (
                  <p className="text-xs text-gray-500 italic">
                    ... and {cvData.work_experiences.length - 3} more position{cvData.work_experiences.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {cvData.education && cvData.education.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <AcademicCapIcon className="w-4 h-4 mr-1" />
                Education
              </p>
              <div className="ml-5 space-y-2">
                {cvData.education.slice(0, 2).map((edu, index) => (
                  <div key={edu.id || index} className="text-sm">
                    <p className="font-medium text-gray-800">{edu.degree}</p>
                    <p className="text-gray-600">
                      {edu.institution}{edu.location && ` • ${edu.location}`}
                    </p>
                    <p className="text-gray-600">{edu.start_date} - {edu.end_date}</p>
                    {edu.description && (
                      <p className="text-gray-600 mt-1 text-xs">{edu.description}</p>
                    )}
                  </div>
                ))}
                {cvData.education.length > 2 && (
                  <p className="text-xs text-gray-500 italic">
                    ... and {cvData.education.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {cvData.skills && cvData.skills.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
              <div className="ml-5 flex flex-wrap gap-1">
                {cvData.skills.slice(0, 8).map((skill, index) => (
                  <span key={skill.id || index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {skill.name} ({skill.level})
                  </span>
                ))}
                {cvData.skills.length > 8 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{cvData.skills.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Languages</p>
              <div className="ml-5 flex flex-wrap gap-1">
                {cvData.languages.map((lang, index) => (
                  <span key={lang.id || index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {lang.language} ({lang.proficiency})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {cvData.certificates && cvData.certificates.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Certificates</p>
              <div className="ml-5 space-y-1">
                {cvData.certificates.slice(0, 3).map((cert, index) => (
                  <div key={cert.id || index} className="text-sm">
                    <p className="font-medium text-gray-800">{cert.name}</p>
                    <p className="text-gray-600">
                      {cert.issuer && `${cert.issuer}`}{cert.issue_date && ` • ${cert.issue_date}`}
                    </p>
                    {cert.description && (
                      <p className="text-gray-600 text-xs mt-1">{cert.description}</p>
                    )}
                  </div>
                ))}
                {cvData.certificates.length > 3 && (
                  <p className="text-xs text-gray-500 italic">
                    ... and {cvData.certificates.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Projects */}
          {cvData.projects && cvData.projects.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Projects</p>
              <div className="ml-5 space-y-2">
                {cvData.projects.slice(0, 2).map((project, index) => (
                  <div key={project.id || index} className="text-sm">
                    <p className="font-medium text-gray-800">{project.title}</p>
                    {project.role && (
                      <p className="text-gray-600">Role: {project.role}</p>
                    )}
                    {(project.start_date || project.end_date) && (
                      <p className="text-gray-600">
                        {project.start_date} - {project.end_date}
                      </p>
                    )}
                    {project.description && (
                      <p className="text-gray-600 text-xs mt-1">
                        {project.description.length > 100 
                          ? `${project.description.substring(0, 100)}...` 
                          : project.description
                        }
                      </p>
                    )}
                    {project.url && (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs hover:underline"
                      >
                        View Project
                      </a>
                    )}
                  </div>
                ))}
                {cvData.projects.length > 2 && (
                  <p className="text-xs text-gray-500 italic">
                    ... and {cvData.projects.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {cvData.additional && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Additional Information</p>
              <p className="text-sm text-gray-600 ml-5">{cvData.additional}</p>
            </div>
          )}

          {/* Footer with last updated */}
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            Last updated: {new Date(cvData.updated_at || cvData.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
} 