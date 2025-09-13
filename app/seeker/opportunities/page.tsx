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
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getOpportunities, searchOpportunities, type Opportunity } from '@/app/lib/opportunities';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const handleOpportunityClick = (opportunityId: string) => {
    router.push(`/seeker/opportunities/${opportunityId}`);
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

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
    const isSaved = savedOpportunities.has(opportunity.id);
    const categoryIcon = getCategoryIcon(opportunity.category);
    const categoryColor = getCategoryColor(opportunity.category);
    const deadlineStatus = getDeadlineStatus(opportunity.deadline);

    return (
      <div 
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 transform hover:scale-[1.02]"
        onClick={() => handleOpportunityClick(opportunity.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Organization Avatar */}
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
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                {opportunity.title}
              </h3>
              <p className="text-sm text-gray-600">{opportunity.organization}</p>
            </div>
          </div>
          
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
        </div>

        {/* Category and Deadline */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${categoryColor}`}>
            {categoryIcon}
            <span className="capitalize">{opportunity.category}</span>
          </div>
          
          {deadlineStatus && (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${deadlineStatus.color}`}>
              <CalendarDaysIcon className="w-3 h-3 mr-1" />
              {deadlineStatus.text}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {opportunity.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4" />
              <span>{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.compensation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BanknotesIcon className="w-4 h-4" />
              <span>{opportunity.compensation}</span>
            </div>
          )}

          {opportunity.type && opportunity.type !== 'Job Opportunity' && opportunity.type !== 'Funding Opportunity' && opportunity.type !== 'Training Program' && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>{opportunity.type}</span>
            </div>
          )}
        </div>

        {/* Criteria Display */}
        {opportunity.criteria && Object.keys(opportunity.criteria).length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(opportunity.criteria).map(([field, value]) => {
                if (!value || field === 'customFilters') return null;
                
                const getCriteriaLabel = (field: string) => {
                  switch (field) {
                    case 'contractType': return 'Contract';
                    case 'level': return 'Level';
                    case 'sector': return 'Sector';
                    case 'location': return 'Location';
                    case 'fundingType': return 'Type';
                    case 'eligibility': return 'Eligibility';
                    case 'amountRange': return 'Amount';
                    case 'purpose': return 'Purpose';
                    case 'format': return 'Format';
                    case 'duration': return 'Duration';
                    case 'certification': return 'Certification';
                    case 'cost': return 'Cost';
                    case 'deadline': return 'Deadline';
                    default: return field;
                  }
                };

                return (
                  <span key={field} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    <span className="mr-1">{getCriteriaLabel(field)}:</span>
                    <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                  </span>
                );
              })}
              
              {/* Display custom filters */}
              {opportunity.criteria.customFilters && Object.entries(opportunity.criteria.customFilters).map(([filterName, filterValue]) => (
                <span key={`custom-${filterName}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <span className="mr-1">{filterName}:</span>
                  <span>{filterValue}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {truncateText(opportunity.description || '')}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
          
          <div className="text-xs text-gray-500">
            Posted {opportunity.posted}
          </div>
        </div>
      </div>
    );
  };

  const OpportunityRow = ({ opportunity }: { opportunity: Opportunity }) => {
    const isSaved = savedOpportunities.has(opportunity.id);
    const categoryIcon = getCategoryIcon(opportunity.category);
    const categoryColor = getCategoryColor(opportunity.category);
    const deadlineStatus = getDeadlineStatus(opportunity.deadline);

    return (
      <div 
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6 cursor-pointer hover:bg-gray-50"
        onClick={() => handleOpportunityClick(opportunity.id)}
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

                {opportunity.type && opportunity.type !== 'Job Opportunity' && opportunity.type !== 'Funding Opportunity' && opportunity.type !== 'Training Program' && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.type}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-sm line-clamp-2">
                {truncateText(opportunity.description || '')}
              </p>

              {/* Criteria Display */}
              {opportunity.criteria && Object.keys(opportunity.criteria).length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(opportunity.criteria).slice(0, 3).map(([field, value]) => {
                      if (!value || field === 'customFilters') return null;
                      
                      const getCriteriaLabel = (field: string) => {
                        switch (field) {
                          case 'contractType': return 'Contract';
                          case 'level': return 'Level';
                          case 'sector': return 'Sector';
                          case 'location': return 'Location';
                          case 'fundingType': return 'Type';
                          case 'eligibility': return 'Eligibility';
                          case 'amountRange': return 'Amount';
                          case 'purpose': return 'Purpose';
                          case 'format': return 'Format';
                          case 'duration': return 'Duration';
                          case 'certification': return 'Certification';
                          case 'cost': return 'Cost';
                          case 'deadline': return 'Deadline';
                          default: return field;
                        }
                      };

                      return (
                        <span key={field} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <span className="mr-1">{getCriteriaLabel(field)}:</span>
                          <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                        </span>
                      );
                    })}
                    
                    {/* Show count if there are more criteria */}
                    {Object.keys(opportunity.criteria).length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                        +{Object.keys(opportunity.criteria).length - 3} more
                      </span>
                    )}
                  </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
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
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
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
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
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
        
        {/* Opportunities Display */}
        {!loading && filteredOpportunities.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOpportunities.map(opportunity => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map(opportunity => (
                  <OpportunityRow key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
