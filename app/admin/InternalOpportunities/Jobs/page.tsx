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
  IdentificationIcon,
  LinkIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import DataExtractor, { opportunityColumns, defaultOpportunityColumns } from '../../components/DataExtractor';

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
  isScraped?: boolean;
  sourceUrl?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  
  // Selection and export state
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobOpportunities = async () => {
      try {
        console.log('Fetching job opportunities...');
        const response = await fetch('/api/opportunities?type=job');
        if (response.ok) {
          const data = await response.json();
          console.log('Job opportunities received:', data);
          setOpportunities(data || []);
          setTotalOpportunities(data?.length || 0);
        } else {
          console.error('Failed to fetch job opportunities, status:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);
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

  // Selection handlers for export
  const handleSelectOpportunity = (opportunityId: string) => {
    const newSelected = new Set(selectedOpportunities);
    if (newSelected.has(opportunityId)) {
      newSelected.delete(opportunityId);
    } else {
      newSelected.add(opportunityId);
    }
    setSelectedOpportunities(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOpportunities.size === currentOpportunities.length) {
      setSelectedOpportunities(new Set());
    } else {
      setSelectedOpportunities(new Set(currentOpportunities.map(opp => opp.id)));
    }
  };

  const handleRowClickForSelection = (opportunityId: string, event: React.MouseEvent) => {
    // Only toggle selection if not clicking on action buttons
    if ((event.target as HTMLElement).closest('button') || 
        (event.target as HTMLElement).closest('a')) {
      return;
    }
    // Don't interfere with row selection for viewing details
    return;
  };

  // Pagination logic
  const totalPages = Math.ceil(totalOpportunities / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentOpportunities = opportunities.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelected(null); // Clear selection when changing pages
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1); // Reset to first page
    setSelected(null); // Clear selection
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
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Available Opportunities ({totalOpportunities})</h2>
              <div className="flex items-center gap-4">
                {selectedOpportunities.size > 0 && (
                  <button
                    onClick={() => setIsExtractModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    Extract ({selectedOpportunities.size})
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={15}>15</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
              </div>
            </div>
            
            <div>
              <table className="w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedOpportunities.size === currentOpportunities.length && currentOpportunities.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-[#556B2F] focus:ring-[#556B2F] border-gray-300 rounded"
                          title="Select All"
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOpportunities.map((opportunity) => {
                    const deadlineStatus = getDeadlineStatus(opportunity.deadline);
                    const isSelected = selected?.id === opportunity.id;
                    
                    return (
                      <tr 
                        key={opportunity.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-[#556B2F]' : ''
                        } ${selectedOpportunities.has(opportunity.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => handleRowSelect(opportunity)}
                      >
                        <td className="px-6 py-4 text-center w-16">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedOpportunities.has(opportunity.id)}
                              onChange={() => handleSelectOpportunity(opportunity.id)}
                              className="h-4 w-4 text-[#556B2F] focus:ring-[#556B2F] border-gray-300 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 w-[25%]">
                          <div className="flex items-center">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {opportunity.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {opportunity.type} • Posted {opportunity.posted}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-[20%]">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{opportunity.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-[15%] text-sm text-gray-900">
                          <div className="truncate">{opportunity.compensation}</div>
                        </td>
                        <td className="px-6 py-4 w-[15%]">
                          <div className="text-sm text-gray-900 truncate">
                            {opportunity.deadline}
                          </div>
                          {deadlineStatus && (
                            <div className={`text-xs ${deadlineStatus.color} font-medium truncate`}>
                              {deadlineStatus.text}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 w-[10%]">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(opportunity.status || 'active')}`}>
                            {opportunity.status === 'active' && <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>}
                            {opportunity.status === 'suspended' && <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>}
                            {opportunity.status === 'expired' && <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>}
                            <span className="truncate">{opportunity.status || 'active'}</span>
                          </span>
                        </td>
                                                 <td className="px-6 py-4 w-[15%] text-sm font-medium">
                           <div className="flex items-center gap-1 flex-wrap">
                             {opportunity.isScraped && opportunity.sourceUrl && (
                               <a
                                 href={opportunity.sourceUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 onClick={(e) => e.stopPropagation()}
                                 className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex-shrink-0"
                                 title="View original source"
                               >
                                 <LinkIcon className="w-3 h-3" />
                                 <span className="hidden sm:inline">Source</span>
                               </a>
                             )}
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleSuspend(opportunity.id);
                               }}
                               className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 ${
                                 opportunity.status === 'suspended'
                                   ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                   : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                               }`}
                             >
                               {opportunity.status === 'suspended' ? (
                                 <>
                                   <PlayIcon className="w-3 h-3" />
                                   <span className="hidden sm:inline">Activate</span>
                                 </>
                               ) : (
                                 <>
                                   <PauseIcon className="w-3 h-3" />
                                   <span className="hidden sm:inline">Suspend</span>
                                 </>
                               )}
                             </button>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleAnalyse(opportunity.id);
                               }}
                               className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex-shrink-0"
                             >
                               <ChartBarIcon className="w-3 h-3" />
                               <span className="hidden sm:inline">Analyse</span>
                             </button>
                           </div>
                         </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalOpportunities > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {Math.min(startIndex + 1, totalOpportunities)} to {Math.min(endIndex, totalOpportunities)} of {totalOpportunities} opportunities
                  </div>
                  
                  {/* Only show pagination controls if there's more than one page */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 text-sm border rounded-md min-w-[32px] ${
                                  currentPage === page
                                    ? 'bg-[#556B2F] text-white border-[#556B2F]'
                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span key={page} className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Debug info - remove this after testing */}
                <div className="mt-2 text-xs text-gray-400">
                  Debug: Total: {totalOpportunities}, Pages: {totalPages}, Current: {currentPage}, Per Page: {rowsPerPage}
                </div>
              </div>
            )}
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

      {/* Data Extractor Modal */}
      <DataExtractor
        data={opportunities}
        selectedItems={selectedOpportunities}
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        availableColumns={opportunityColumns}
        defaultSelectedColumns={defaultOpportunityColumns}
        filename="Job_Opportunities_Export"
        title="Export Job Opportunities"
        itemType="opportunities"
      />
    </div>
  );
} 