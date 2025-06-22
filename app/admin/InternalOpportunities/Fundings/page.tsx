'use client';

import { useEffect, useState } from 'react';
import { 
  BriefcaseIcon, 
  BanknotesIcon, 
  AcademicCapIcon, 
  MapPinIcon, 
  ClockIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PauseIcon,
  ChartBarIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  category?: string;
  organization?: string;
  location?: string;
  compensation?: string;
  type?: string;
  deadline?: string;
  posted?: string;
  status?: 'active' | 'suspended' | 'expired';
  applicants?: number;
  metadata?: Record<string, any>;
  ngoProfileId?: string;
}

interface NGOProfile {
  id: string;
  user_id: string;
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
  additional_info?: AdditionalInfo[];
  documents?: Document[];
}

interface AdditionalInfo {
  id: string;
  title: string;
  content: string;
  type: string;
}

interface Document {
  id: string;
  name: string;
  description?: string;
  url: string;
}

export default function Fundings() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGOProfile | null>(null);
  const [isNgoProfileExpanded, setIsNgoProfileExpanded] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchFundingOpportunities = async () => {
      try {
        const response = await fetch('/api/opportunities?type=funding');
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data);
        } else {
          console.error('Failed to fetch funding opportunities');
          setOpportunities([]);
        }
      } catch (error) {
        console.error('Error fetching funding opportunities:', error);
        setOpportunities([]);
      }
    };

    fetchFundingOpportunities();
  }, []);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'job': return <BriefcaseIcon className="w-4 h-4" />;
      case 'funding': return <BanknotesIcon className="w-4 h-4" />;
      case 'training': return <AcademicCapIcon className="w-4 h-4" />;
      default: return <BanknotesIcon className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'funding': return 'bg-green-50 text-green-700 border-green-200';
      case 'training': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'suspended': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'expired', text: 'Expired', color: 'text-red-600' };
    } else if (diffDays <= 3) {
      return { type: 'urgent', text: `${diffDays} days left`, color: 'text-orange-600' };
    } else if (diffDays <= 7) {
      return { type: 'soon', text: `${diffDays} days left`, color: 'text-yellow-600' };
    } else {
      return { type: 'normal', text: `${diffDays} days left`, color: 'text-green-600' };
    }
  };

  // Helper function to check if content contains HTML
  const containsHtml = (str: string) => {
    if (!str) return false;
    return /<[^>]*>/g.test(str);
  };

  // Helper function to sanitize HTML content (basic sanitization)
  const sanitizeHtml = (html: string) => {
    if (!html) return '';
    
    // Remove potentially dangerous elements and attributes
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');
    
    // Convert Supabase storage URLs to proper HTML elements
    sanitized = sanitized.replace(
      /(https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/opportunity-description-images\/[^\s<>"']+)/g,
      '<div class="my-4"><img src="$1" alt="Opportunity image" class="max-w-full h-auto rounded-lg shadow-sm border border-gray-200" style="max-height: 400px;" /></div>'
    );
    
    sanitized = sanitized.replace(
      /(https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/opportunity-description-documents\/[^\s<>"']+)/g,
      '<div class="my-4"><a href="$1" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Download Document</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div>'
    );
    
    return sanitized;
  };

  const parseDescription = (description: string) => {
    if (!description) return [];
    
    const lines = description.split('\n');
    const sections: Array<{ title?: string; content: string }> = [];
    let currentSection: { title?: string; content: string } = { content: '' };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      const titleMatch = trimmedLine.match(/^\*\*(.+?)\*\*$/);
      
      if (titleMatch) {
        if (currentSection.content.trim() || currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = { title: titleMatch[1], content: '' };
      } else if (trimmedLine) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    }
    
    if (currentSection.content.trim() || currentSection.title) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const renderFileUrl = (url: string, fileName?: string) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isDocument = /\.(pdf|doc|docx|txt)$/i.test(url);
    
    if (isImage) {
      return (
        <div className="my-4">
          <img 
            src={url} 
            alt={fileName || 'Opportunity image'} 
            className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
            style={{ maxHeight: '400px' }}
            onError={(e) => {
              console.error('Error loading image:', url);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {fileName && (
            <p className="text-sm text-gray-600 mt-2">{fileName}</p>
          )}
        </div>
      );
    } else if (isDocument) {
      return (
        <div className="my-4">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span>{fileName || 'Download Document'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      );
    } else {
      return (
        <div className="my-4">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {fileName || url}
          </a>
        </div>
      );
    }
  };

  const FormattedDescription = ({ description }: { description: string }) => {
    if (!description) return null;

    if (containsHtml(description)) {
      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      );
    }

    const sections = parseDescription(description);
    
    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="border-l-4 border-green-200 pl-4">
            {section.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {section.title}
              </h3>
            )}
            <div className="text-gray-700 whitespace-pre-wrap">
              {section.content.split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                
                // Check if line is a URL
                if (trimmedLine.match(/^https?:\/\//)) {
                  return (
                    <div key={lineIndex}>
                      {renderFileUrl(trimmedLine)}
                    </div>
                  );
                }
                
                return (
                  <div key={lineIndex}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleSuspend = (opportunityId: string) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, status: opp.status === 'suspended' ? 'active' : 'suspended' as 'active' | 'suspended' | 'expired' }
          : opp
      )
    );
  };

  const handleAnalyse = (opportunityId: string) => {
    console.log('Analysing opportunity:', opportunityId);
  };

  const fetchNGOProfile = async (profileId: string) => {
    setLoadingProfile(true);
    try {
      console.log('Fetching NGO profile for ID:', profileId);
      const response = await fetch(`/api/ngo-profile/${profileId}`);
      
      if (response.ok) {
        const profile = await response.json();
        console.log('Successfully fetched NGO profile:', profile);
        setNgoProfile(profile);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch NGO profile:', response.status, errorData);
        setNgoProfile(null);
      }
    } catch (error) {
      console.error('Error fetching NGO profile:', error);
      setNgoProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleRowSelect = (opportunity: Opportunity) => {
    setSelected(opportunity);
    setIsNgoProfileExpanded(false);
    setNgoProfile(null);
    
    // Fetch NGO profile if available
    if (opportunity.ngoProfileId) {
      fetchNGOProfile(opportunity.ngoProfileId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BanknotesIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Internal Funding Opportunities</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium flex items-center gap-2">
                <PencilIcon className="w-4 h-4" />
                Create New
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Opportunities Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Available Opportunities ({opportunities.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => {
                    const deadlineStatus = getDeadlineStatus(opportunity.deadline);
                    const isSelected = selected?.id === opportunity.id;
                    
                    return (
                      <tr 
                        key={opportunity.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-[#556B2F]' : ''
                        }`}
                        onClick={() => handleRowSelect(opportunity)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {opportunity.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {opportunity.type} • Posted {opportunity.posted}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(opportunity.category || 'funding')}`}>
                            {getCategoryIcon(opportunity.category || 'funding')}
                            <span className="capitalize">{opportunity.category || 'funding'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            {opportunity.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {opportunity.compensation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {opportunity.deadline}
                          </div>
                          {deadlineStatus && (
                            <div className={`text-xs ${deadlineStatus.color} font-medium`}>
                              {deadlineStatus.text}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(opportunity.status || 'active')}`}>
                            {opportunity.status === 'active' && <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>}
                            {opportunity.status === 'suspended' && <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>}
                            {opportunity.status === 'expired' && <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>}
                            {opportunity.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            {opportunity.applicants || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuspend(opportunity.id);
                              }}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                opportunity.status === 'suspended'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              }`}
                            >
                              {opportunity.status === 'suspended' ? (
                                <>
                                  <PlayIcon className="w-3 h-3" />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <PauseIcon className="w-3 h-3" />
                                  Suspend
                                </>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyse(opportunity.id);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            >
                              <ChartBarIcon className="w-3 h-3" />
                              Analyse
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Opportunity Details */}
          {selected && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Opportunity Details</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* NGO Profile Accordion */}
                {ngoProfile && (
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setIsNgoProfileExpanded(!isNgoProfileExpanded)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BuildingOfficeIcon className="w-5 h-5 text-[#556B2F]" />
                        <span className="font-medium text-gray-900">NGO Profile</span>
                      </div>
                      {isNgoProfileExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {isNgoProfileExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Organization Information</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <BuildingOfficeIcon className="w-4 h-4" />
                                  <span className="font-medium">{ngoProfile.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <EnvelopeIcon className="w-4 h-4" />
                                  <span>{ngoProfile.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CalendarDaysIcon className="w-4 h-4" />
                                  <span>Founded in {ngoProfile.year_created}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Legal Representative</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <IdentificationIcon className="w-4 h-4" />
                                  <span className="font-medium">{ngoProfile.legal_rep_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <EnvelopeIcon className="w-4 h-4" />
                                  <span>{ngoProfile.legal_rep_email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <PhoneIcon className="w-4 h-4" />
                                  <span>{ngoProfile.legal_rep_phone}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {ngoProfile.legal_rep_function}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Opportunity Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{selected.title}</h3>
                  <FormattedDescription description={selected.description} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}