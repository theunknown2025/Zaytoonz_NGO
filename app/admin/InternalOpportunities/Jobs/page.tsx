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

export default function Jobs() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGOProfile | null>(null);
  const [isNgoProfileExpanded, setIsNgoProfileExpanded] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchJobOpportunities = async () => {
      try {
        const response = await fetch('/api/opportunities?type=job');
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data);
        } else {
          console.error('Failed to fetch job opportunities');
          setOpportunities([]);
        }
      } catch (error) {
        console.error('Error fetching job opportunities:', error);
        setOpportunities([]);
      }
    };

    fetchJobOpportunities();
  }, []);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'job': return <BriefcaseIcon className="w-4 h-4" />;
      case 'funding': return <BanknotesIcon className="w-4 h-4" />;
      case 'training': return <AcademicCapIcon className="w-4 h-4" />;
      default: return <BriefcaseIcon className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'funding': return 'bg-green-50 text-green-700 border-green-200';
      case 'training': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      );
    }
    
    return null;
  };

  const FormattedDescription = ({ description }: { description: string }) => {
    // Check if the description contains HTML
    if (containsHtml(description)) {
      // If it contains HTML, render it directly with dangerouslySetInnerHTML
      const sanitizedHtml = sanitizeHtml(description);
      return (
        <div 
          className="text-gray-700 leading-relaxed prose prose-sm max-w-none 
                     prose-headings:text-gray-900 prose-headings:font-semibold 
                     prose-p:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed
                     prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6
                     prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mb-4
                     prose-h3:text-lg prose-h3:mb-3
                     prose-h4:text-base prose-h4:mb-2
                     prose-ul:mb-4 prose-ul:pl-6 prose-li:mb-1
                     prose-ol:mb-4 prose-ol:pl-6
                     prose-strong:font-semibold prose-strong:text-gray-900
                     prose-em:italic prose-em:text-gray-700
                     prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700
                     prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
                     prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                     prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                     [&>div]:mb-4 [&>div>h2]:text-xl [&>div>h2]:font-semibold [&>div>h2]:text-gray-900 [&>div>h2]:mb-3
                     [&>div>p]:mb-3 [&>div>p]:text-gray-700 [&>div>p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    } else {
      // If it doesn't contain HTML, use the original markdown-style parsing
      const sections = parseDescription(description);
      
      return (
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="space-y-3">
              {section.title && (
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  {section.title}
                </h3>
              )}
              {section.content && (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                  {/* Check if content contains file URLs and render them appropriately */}
                  {section.content.split('\n').map((line, lineIndex) => {
                    const trimmedLine = line.trim();
                    
                    // Check if line contains a Supabase storage URL
                    const supabaseUrlMatch = trimmedLine.match(/https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s]+/);
                    
                    if (supabaseUrlMatch) {
                      const url = supabaseUrlMatch[0];
                      // Extract filename from the URL or use the remaining text as filename
                      const urlParts = url.split('/');
                      const fileName = urlParts[urlParts.length - 1] || trimmedLine.replace(url, '').trim();
                      
                      return (
                        <div key={lineIndex}>
                          {renderFileUrl(url, fileName)}
                        </div>
                      );
                    }
                    
                    return (
                      <div key={lineIndex}>
                        {trimmedLine}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
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
    // Handle analyse action - could open a modal or navigate to analytics page
    console.log('Analysing opportunity:', opportunityId);
    // For now, just select the opportunity to show its details
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      setSelected(opportunity);
    }
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
              <BriefcaseIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Internal Job Opportunities</h1>
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
                      Compensation
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
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(opportunity.category || 'job')}`}>
                            {getCategoryIcon(opportunity.category || 'job')}
                            <span className="capitalize">{opportunity.category || 'job'}</span>
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

          {/* NGO Profile Accordion */}
          {selected && ngoProfile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsNgoProfileExpanded(!isNgoProfileExpanded)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-6 h-6 text-[#556B2F]" />
                    <h2 className="text-lg font-semibold text-gray-900">NGO Profile</h2>
                    <span className="text-sm text-gray-500">({ngoProfile.name})</span>
                  </div>
                  {isNgoProfileExpanded ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {isNgoProfileExpanded && (
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Organization Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Organization Name</p>
                            <p className="font-medium text-gray-900">{ngoProfile.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{ngoProfile.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Year Created</p>
                            <p className="font-medium text-gray-900">{ngoProfile.year_created}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Legal Representative
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <UserIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{ngoProfile.legal_rep_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <IdentificationIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Function</p>
                            <p className="font-medium text-gray-900">{ngoProfile.legal_rep_function}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{ngoProfile.legal_rep_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <PhoneIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{ngoProfile.legal_rep_phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Image */}
                  {ngoProfile.profile_image_url && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Organization Logo
                      </h3>
                      <div className="flex justify-center">
                        <img 
                          src={ngoProfile.profile_image_url} 
                          alt={`${ngoProfile.name} logo`}
                          className="max-w-xs h-auto rounded-lg shadow-sm border border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {ngoProfile.documents && ngoProfile.documents.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ngoProfile.documents.map((doc) => (
                          <div key={doc.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                )}
                                <a 
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-flex items-center gap-1"
                                >
                                  View Document
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  {ngoProfile.additional_info && ngoProfile.additional_info.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Additional Information
                      </h3>
                      <div className="space-y-4">
                        {ngoProfile.additional_info.map((info) => (
                          <div key={info.id} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{info.title}</h4>
                            <p className="text-gray-700 leading-relaxed">{info.content}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {info.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Created: {new Date(ngoProfile.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(ngoProfile.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State for NGO Profile */}
          {selected && loadingProfile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#556B2F]"></div>
                <span className="text-gray-600">Loading NGO Profile...</span>
              </div>
            </div>
          )}

          {/* Selected Opportunity Description */}
          {selected && (
            <div className="space-y-6">
              {/* Opportunity Header */}
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                {/* Category and Status */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getCategoryColor(selected.category || 'job')}`}>
                    {getCategoryIcon(selected.category || 'job')}
                    <span className="capitalize">{selected.category || 'job'}</span>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selected.status || 'active')}`}>
                    {selected.status === 'active' && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
                    {selected.status === 'suspended' && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                    {selected.status === 'expired' && <span className="w-2 h-2 bg-red-400 rounded-full"></span>}
                    {selected.status || 'active'}
                  </div>
                  
                  {getDeadlineStatus(selected.deadline) && (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border bg-gray-50 border-gray-200 ${getDeadlineStatus(selected.deadline)!.color}`}>
                      <CalendarDaysIcon className="w-4 h-4" />
                      {getDeadlineStatus(selected.deadline)!.text}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {selected.title}
                </h1>

                {/* Organization */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#556B2F] flex items-center justify-center">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selected.organization || 'Zaytoonz NGO'}</h2>
                    <p className="text-gray-600">Posted {selected.posted || 'recently'}</p>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {selected.location && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <MapPinIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{selected.location}</p>
                      </div>
                    </div>
                  )}

                  {selected.compensation && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <BanknotesIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Compensation</p>
                        <p className="font-medium text-gray-900">{selected.compensation}</p>
                      </div>
                    </div>
                  )}

                  {selected.type && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{selected.type}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applicants</p>
                      <p className="font-medium text-gray-900">{selected.applicants || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    View Applications
                  </button>
                  <button className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium flex items-center gap-2">
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleSuspend(selected.id)}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                      selected.status === 'suspended'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {selected.status === 'suspended' ? (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        Activate
                      </>
                    ) : (
                      <>
                        <PauseIcon className="w-4 h-4" />
                        Suspend
                      </>
                    )}
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">Description</h2>
                </div>
                <FormattedDescription description={selected.description || ''} />
              </div>

              {/* Metadata */}
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <InformationCircleIcon className="w-6 h-6 text-gray-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">Additional Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(selected.metadata).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-600 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <p className="text-gray-900 font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!selected && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">Select an Opportunity</h3>
                <p className="text-gray-400">Click on any opportunity in the table above to view its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 