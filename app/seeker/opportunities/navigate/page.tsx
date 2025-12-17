'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BriefcaseIcon, 
  BanknotesIcon, 
  AcademicCapIcon, 
  MapPinIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ShareIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  IdentificationIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getOpportunities, searchOpportunities, type Opportunity } from '@/app/lib/opportunities';

export default function NavigatePage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // Helper function to strip HTML tags and get plain text for preview
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Helper function to truncate text safely
  const truncateText = (text: string, maxLength: number = 120) => {
    if (!text) return '';
    const plainText = stripHtmlTags(text);
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  // Helper function to check if content contains HTML
  const containsHtml = (str: string) => {
    if (!str) return false;
    return /<[^>]*>/g.test(str);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [selectedCategory, opportunities, searchQuery]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { opportunities: data, error: fetchError } = await getOpportunities();
      
      if (fetchError) {
        setError(fetchError);
        console.error('Error fetching opportunities:', fetchError);
      } else if (data) {
        // Debug logging
        console.log('Fetched opportunities:', data.length);
        const scrapedCount = data.filter(opp => opp.isScraped).length;
        console.log('Scraped opportunities count:', scrapedCount);
        
        // Log a few scraped opportunities for debugging
        const scrapedOpps = data.filter(opp => opp.isScraped).slice(0, 3);
        scrapedOpps.forEach(opp => {
          console.log('Scraped opportunity:', {
            id: opp.id,
            title: opp.title,
            sourceUrl: opp.sourceUrl,
            isScraped: opp.isScraped
          });
        });

        setOpportunities(data);
        setFilteredOpportunities(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching opportunities');
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    if (selectedCategory === 'all') {
      setFilteredOpportunities(opportunities);
    } else {
      const filtered = opportunities.filter(opp => opp.category === selectedCategory);
      setFilteredOpportunities(filtered);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      filterOpportunities();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const category = selectedCategory === 'all' ? undefined : selectedCategory as 'job' | 'funding' | 'training';
      const { opportunities: searchResults, error: searchError } = await searchOpportunities(searchQuery.trim(), category);
      
      if (searchError) {
        setError(searchError);
        console.error('Error searching opportunities:', searchError);
      } else if (searchResults) {
        setFilteredOpportunities(searchResults);
      }
    } catch (err) {
      console.error('Unexpected error during search:', err);
      setError('An unexpected error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleOpportunityClick = (opportunity: Opportunity) => {
    // Debug logging
    console.log('Opportunity clicked:', {
      id: opportunity.id,
      title: opportunity.title,
      isScraped: opportunity.isScraped,
      sourceUrl: opportunity.sourceUrl,
      organization: opportunity.organization
    });

    // Check if it's a scraped opportunity
    if (opportunity.isScraped && opportunity.sourceUrl) {
      console.log('Opening scraped opportunity URL:', opportunity.sourceUrl);
      // Open scraped opportunity in new tab
      window.open(opportunity.sourceUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.log('Navigating to internal opportunity page:', `/seeker/opportunities/${opportunity.id}`);
      // Navigate to internal opportunity page
      router.push(`/seeker/opportunities/${opportunity.id}`);
    }
  };

  const toggleSaveOpportunity = (opportunityId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when clicking save button
    setSavedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(opportunityId)) {
        newSet.delete(opportunityId);
      } else {
        newSet.add(opportunityId);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'job': return <BriefcaseIcon className="w-5 h-5" />;
      case 'funding': return <BanknotesIcon className="w-5 h-5" />;
      case 'training': return <AcademicCapIcon className="w-5 h-5" />;
      default: return <BriefcaseIcon className="w-5 h-5" />;
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

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'expired', text: 'Expired', color: 'text-red-600 bg-red-50' };
    } else if (diffDays <= 3) {
      return { type: 'urgent', text: `${diffDays} days left`, color: 'text-orange-600 bg-orange-50' };
    } else if (diffDays <= 7) {
      return { type: 'soon', text: `${diffDays} days left`, color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { type: 'normal', text: `${diffDays} days left`, color: 'text-green-600 bg-green-50' };
    }
  };

  const OpportunityRow = ({ opportunity }: { opportunity: Opportunity }) => {
    const isSaved = savedOpportunities.has(opportunity.id);
    const categoryIcon = getCategoryIcon(opportunity.category);
    const categoryColor = getCategoryColor(opportunity.category);
    const deadlineStatus = getDeadlineStatus(opportunity.deadline);

    return (
      <div 
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6 cursor-pointer hover:bg-gray-50"
        onClick={() => handleOpportunityClick(opportunity)}
      >
        <div className="flex items-center justify-between">
          {/* Left Section - Main Info */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Organization Avatar */}
            <div className="flex-shrink-0">
              {opportunity.organizationProfile?.profileImage ? (
                <img 
                  src={opportunity.organizationProfile.profileImage} 
                  alt={opportunity.organization}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <BuildingOfficeIcon className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {/* Category Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColor}`}>
                  {categoryIcon}
                  <span className="capitalize">{opportunity.category}</span>
                </div>
                
                {/* External Indicator for Scraped Opportunities */}
                {opportunity.isScraped && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                    <span>External</span>
                  </div>
                )}
                
                {/* Deadline Status */}
                {deadlineStatus && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${deadlineStatus.color}`}>
                    <CalendarDaysIcon className="w-3 h-3 mr-1" />
                    {deadlineStatus.text}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {opportunity.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span className="truncate">{opportunity.organization}</span>
                </div>
                
                {opportunity.location && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.location}</span>
                  </div>
                )}

                {opportunity.compensation && (
                  <div className="flex items-center gap-1">
                    <BanknotesIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.compensation}</span>
                  </div>
                )}

                {opportunity.type && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.type}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-sm line-clamp-2">
                {truncateText(opportunity.description || '')}
              </p>

              {/* Action Buttons for Scraped Opportunities */}
              {opportunity.isScraped && (
                <div className="flex items-center gap-3 mt-3">
                  {/* View More Button - Shows full description */}
                  {opportunity.description && opportunity.description.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOpportunity(opportunity);
                        setShowDescriptionModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View More</span>
                    </button>
                  )}
                  
                  {/* View Opportunity Button - Opens specific opportunity URL */}
                  {opportunity.sourceUrl && (
                    <a
                      href={opportunity.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#556B2F] hover:bg-[#6B8E23] rounded-lg transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      <span>View Opportunity</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 ml-4">
            {/* Application Method Indicators */}
            <div className="flex items-center gap-2">
              {opportunity.contactEmails && opportunity.contactEmails.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  <EnvelopeIcon className="w-3 h-3" />
                  <span>Email</span>
                </div>
              )}
              {opportunity.applicationForm && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  <DocumentTextIcon className="w-3 h-3" />
                  <span>Form</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={(e) => toggleSaveOpportunity(opportunity.id, e)}
              className={`p-2 rounded-full transition-all duration-200 ${
                isSaved 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
              }`}
            >
              {isSaved ? (
                <HeartSolidIcon className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>

            {/* Posted Date */}
            <div className="text-xs text-gray-500 text-right min-w-0">
              <div>Posted</div>
              <div className="font-medium">{opportunity.posted}</div>
            </div>

            {/* Arrow */}
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Navigate Opportunities</h1>
              <p className="text-sm text-gray-600">Discover jobs, funding, and training programs</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-10 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[160px]"
                  >
                    <option value="all">All Categories</option>
                    <option value="job">Jobs</option>
                    <option value="funding">Funding</option>
                    <option value="training">Training</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Results */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading opportunities...' : `${filteredOpportunities.length} Opportunities Found`}
          </h3>
          <p className="text-gray-600 mt-1">
            {selectedCategory === 'all' ? 'Showing all categories' : `Filtered by ${selectedCategory}`}
            {savedOpportunities.size > 0 && (
              <span className="ml-2 text-blue-600">
                • {savedOpportunities.size} saved
              </span>
            )}
          </p>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-6 h-6 text-red-600 mt-1 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchOpportunities}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
          
        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading opportunities...</h3>
            <p className="text-gray-500">Please wait while we fetch the latest opportunities</p>
          </div>
        )}
          
        {/* Empty State */}
        {!loading && filteredOpportunities.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <BriefcaseIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No opportunities found</h3>
            <p className="text-lg text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No opportunities match your search "${searchQuery}"`
                : selectedCategory === 'all' 
                  ? 'No opportunities are currently available'
                  : `No ${selectedCategory} opportunities are currently available`
              }
            </p>
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  filterOpportunities();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
        
        {/* Opportunities List */}
        {!loading && filteredOpportunities.length > 0 && (
          <div className="space-y-4">
            {filteredOpportunities.map(opportunity => (
              <OpportunityRow key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>

      {/* Description Modal */}
      {showDescriptionModal && selectedOpportunity && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDescriptionModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-bold mb-2">{selectedOpportunity.title}</h2>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>{selectedOpportunity.organization}</span>
                    </div>
                    {selectedOpportunity.location && (
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{selectedOpportunity.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Body - Full Description */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Full Description
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {containsHtml(selectedOpportunity.description || '') ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedOpportunity.description || '' }} />
                ) : (
                  <p>{selectedOpportunity.description || 'No description available'}</p>
                )}
              </div>
              
              {/* Additional Details */}
              {selectedOpportunity.deadline && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span className="font-medium">Deadline:</span>
                    <span>{selectedOpportunity.deadline}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
              
              {selectedOpportunity.sourceUrl && (
                <a
                  href={selectedOpportunity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#556B2F] hover:bg-[#6B8E23] rounded-lg transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  <span>View Opportunity</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 