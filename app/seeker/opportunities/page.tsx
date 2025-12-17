'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ListBulletIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getOpportunities, searchOpportunities, type Opportunity } from '@/app/lib/opportunities';
import { useAuth } from '@/app/lib/auth';

// Filter types
interface Filters {
  // Standard filters
  category: string;
  location: string;
  postedDate: string;
  // Advanced filters
  contractType: string;
  level: string;
  sector: string;
  fundingType: string;
  eligibility: string;
  amountRange: string;
  duration: string;
  format: string;
  deadlineStatus: string;
  source: string;
}

const initialFilters: Filters = {
  category: 'all',
  location: 'all',
  postedDate: 'all',
  contractType: 'all',
  level: 'all',
  sector: 'all',
  fundingType: 'all',
  eligibility: 'all',
  amountRange: 'all',
  duration: 'all',
  format: 'all',
  deadlineStatus: 'all',
  source: 'all',
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // For backwards compatibility
  const selectedCategory = filters.category;

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

  // Extract unique filter values from opportunities
  const filterOptions = useMemo(() => {
    const locations = new Set<string>();
    const contractTypes = new Set<string>();
    const levels = new Set<string>();
    const sectors = new Set<string>();
    const fundingTypes = new Set<string>();
    const eligibilities = new Set<string>();
    const amountRanges = new Set<string>();
    const durations = new Set<string>();
    const formats = new Set<string>();

    opportunities.forEach(opp => {
      if (opp.location) locations.add(opp.location);
      if (opp.criteria?.contractType) contractTypes.add(opp.criteria.contractType);
      if (opp.criteria?.level) levels.add(opp.criteria.level);
      if (opp.criteria?.sector) sectors.add(opp.criteria.sector);
      if (opp.criteria?.fundingType) fundingTypes.add(opp.criteria.fundingType);
      if (opp.criteria?.eligibility) eligibilities.add(opp.criteria.eligibility);
      if (opp.criteria?.amountRange) amountRanges.add(opp.criteria.amountRange);
      if (opp.criteria?.duration) durations.add(opp.criteria.duration);
      if (opp.criteria?.format) formats.add(opp.criteria.format);
    });

    return {
      locations: Array.from(locations).sort(),
      contractTypes: Array.from(contractTypes).sort(),
      levels: Array.from(levels).sort(),
      sectors: Array.from(sectors).sort(),
      fundingTypes: Array.from(fundingTypes).sort(),
      eligibilities: Array.from(eligibilities).sort(),
      amountRanges: Array.from(amountRanges).sort(),
      durations: Array.from(durations).sort(),
      formats: Array.from(formats).sort(),
    };
  }, [opportunities]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all' && key !== 'category') count++;
    });
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchOpportunities();
  }, []);
  
  useEffect(() => {
    filterOpportunities();
  }, [filters, opportunities, searchQuery]);

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
    let filtered = [...opportunities];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(opp => opp.category === filters.category);
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(opp => opp.location === filters.location);
    }

    // Posted date filter
    if (filters.postedDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(opp => {
        const posted = parsePostedDate(opp.posted);
        if (!posted) return true;
        
        const diffDays = Math.ceil((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.postedDate) {
          case 'today': return diffDays <= 1;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'quarter': return diffDays <= 90;
          default: return true;
        }
      });
    }

    // Contract type filter
    if (filters.contractType !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.contractType === filters.contractType);
    }

    // Level filter
    if (filters.level !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.level === filters.level);
    }

    // Sector filter
    if (filters.sector !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.sector === filters.sector);
    }

    // Funding type filter
    if (filters.fundingType !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.fundingType === filters.fundingType);
    }

    // Eligibility filter
    if (filters.eligibility !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.eligibility === filters.eligibility);
    }

    // Amount range filter
    if (filters.amountRange !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.amountRange === filters.amountRange);
    }

    // Duration filter
    if (filters.duration !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.duration === filters.duration);
    }

    // Format filter (for training)
    if (filters.format !== 'all') {
      filtered = filtered.filter(opp => opp.criteria?.format === filters.format);
    }

    // Deadline status filter
    if (filters.deadlineStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(opp => {
        if (!opp.deadline) return filters.deadlineStatus === 'no_deadline';
        
        const deadline = new Date(opp.deadline);
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.deadlineStatus) {
          case 'expired': return diffDays < 0;
          case 'urgent': return diffDays >= 0 && diffDays <= 3;
          case 'soon': return diffDays > 3 && diffDays <= 7;
          case 'open': return diffDays > 7;
          case 'no_deadline': return false;
          default: return true;
        }
      });
    }

    // Source filter (internal vs scraped)
    if (filters.source !== 'all') {
      filtered = filtered.filter(opp => {
        const isScraped = opp.isScraped || opp.id.startsWith('scraped_');
        return filters.source === 'external' ? isScraped : !isScraped;
      });
    }

    // Search query filter (text search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title?.toLowerCase().includes(query) ||
        opp.organization?.toLowerCase().includes(query) ||
        opp.description?.toLowerCase().includes(query) ||
        opp.location?.toLowerCase().includes(query)
      );
    }

    const sortValue = (opp: Opportunity) =>
      opp.sortTimestamp ?? (opp.posted ? new Date(opp.posted).getTime() : 0);

    filtered.sort((a, b) => sortValue(b) - sortValue(a));

    setFilteredOpportunities(filtered);
  };

  // Helper to parse posted date string back to Date
  const parsePostedDate = (posted: string): Date | null => {
    if (!posted) return null;
    
    const now = new Date();
    const match = posted.match(/(\d+)\s+(day|week|month)s?\s+ago/i);
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      const date = new Date(now);
      if (unit === 'day') date.setDate(date.getDate() - num);
      else if (unit === 'week') date.setDate(date.getDate() - num * 7);
      else if (unit === 'month') date.setMonth(date.getMonth() - num);
      
      return date;
    }
    return null;
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
    setShowAdvancedFilters(false);
  };

  // Update a single filter
  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is handled in the useEffect, so just trigger re-filter
    filterOpportunities();
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
      case 'job': return 'bg-olive-100 text-olive-700 border-olive-300';
      case 'funding': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'training': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-olive-50 text-olive-700 border-olive-200';
    }
  };

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

  const getCriteriaEntries = (opportunity: Opportunity) => {
    const entries: { key: string; label: string; value: string }[] = [];
    const seen = new Set<string>();

    const addEntry = (label: string, value: any) => {
      if (!value && value !== 0) return;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const key = `${label}:${stringValue}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ key, label, value: stringValue });
    };

    if (opportunity.criteria) {
      Object.entries(opportunity.criteria).forEach(([field, value]) => {
        if (!value || field === 'customFilters') return;
        addEntry(getCriteriaLabel(field), value);
      });

      if (opportunity.criteria.customFilters && typeof opportunity.criteria.customFilters === 'object') {
        Object.entries(opportunity.criteria.customFilters).forEach(([name, val]) => addEntry(name, val));
      }
    }

    // Ensure deadline is present once
    if (opportunity.deadline) {
      addEntry('Deadline', opportunity.deadline);
    }

    return entries;
  };

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
    const isSaved = savedOpportunities.has(opportunity.id);
    const categoryIcon = getCategoryIcon(opportunity.category);
    const categoryColor = getCategoryColor(opportunity.category);
    const criteriaEntries = getCriteriaEntries(opportunity);

    return (
      <div 
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-olive-100 p-6 cursor-pointer hover:bg-olive-50/30 transform hover:scale-[1.02] opportunity-card"
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
                className="w-12 h-12 rounded-full object-cover border-2 border-olive-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center border-2 border-olive-200">
                <BuildingOfficeIcon className="w-6 h-6 text-olive-600" />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-olive-800 mb-1 line-clamp-2">
                {opportunity.title}
              </h3>
              <p className="text-sm text-olive-600">{opportunity.organization}</p>
            </div>
          </div>
          
          <button
            onClick={(e) => toggleSaveOpportunity(opportunity.id, e)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isSaved 
                ? 'bg-olive-100 text-olive-700 hover:bg-olive-200' 
                : 'bg-olive-50 text-olive-400 hover:bg-olive-100 hover:text-olive-600'
            }`}
          >
            {isSaved ? (
              <HeartSolidIcon className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${categoryColor}`}>
            {categoryIcon}
            <span className="capitalize">{opportunity.category}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {opportunity.location && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <MapPinIcon className="w-4 h-4" />
              <span>{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.compensation && !/competitive/i.test(opportunity.compensation) && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <BanknotesIcon className="w-4 h-4" />
              <span>{opportunity.compensation}</span>
            </div>
          )}

          {opportunity.mainInformation && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <DocumentTextIcon className="w-4 h-4" />
              <span className="line-clamp-1">{opportunity.mainInformation}</span>
            </div>
          )}

          {opportunity.type && opportunity.type !== 'Job Opportunity' && opportunity.type !== 'Funding Opportunity' && opportunity.type !== 'Training Program' && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <ClockIcon className="w-4 h-4" />
              <span>{opportunity.type}</span>
            </div>
          )}
        </div>

        {/* Criteria Display */}
        {criteriaEntries.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {criteriaEntries.map((item) => (
                <span key={item.key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-olive-50 text-olive-700 border border-olive-200">
                  <span className="mr-1">{item.label}:</span>
                  <span>{item.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-olive-700 text-sm line-clamp-3 mb-4">
          {truncateText(opportunity.description || '')}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-olive-100">
          <div className="flex items-center gap-2">
            {opportunity.contactEmails && opportunity.contactEmails.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-olive-600 bg-olive-50 px-2 py-1 rounded">
                <EnvelopeIcon className="w-3 h-3" />
                <span>Email</span>
              </div>
            )}
            {opportunity.applicationForm && (
              <div className="flex items-center gap-1 text-xs text-olive-600 bg-olive-50 px-2 py-1 rounded">
                <DocumentTextIcon className="w-3 h-3" />
                <span>Form</span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-olive-500">
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
    const criteriaEntries = getCriteriaEntries(opportunity);

    return (
      <div 
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-olive-100 p-6 cursor-pointer hover:bg-olive-50/30"
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
                  className="w-12 h-12 rounded-full object-cover border-2 border-olive-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center border-2 border-olive-200">
                  <BuildingOfficeIcon className="w-6 h-6 text-olive-600" />
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
              </div>

              <h3 className="text-lg font-semibold text-olive-800 mb-1 truncate">
                {opportunity.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-olive-600 mb-2">
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

                {opportunity.compensation && !/competitive/i.test(opportunity.compensation) && (
                  <div className="flex items-center gap-1">
                    <BanknotesIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.compensation}</span>
                  </div>
                )}

                {opportunity.mainInformation && (
                  <div className="flex items-center gap-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.mainInformation}</span>
                  </div>
                )}

                {opportunity.type && opportunity.type !== 'Job Opportunity' && opportunity.type !== 'Funding Opportunity' && opportunity.type !== 'Training Program' && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.type}</span>
                  </div>
                )}
              </div>

              <p className="text-olive-700 text-sm line-clamp-2">
                {truncateText(opportunity.description || '')}
              </p>

              {/* Criteria Display */}
               {criteriaEntries.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                     {criteriaEntries.slice(0, 3).map((item) => (
                       <span key={item.key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-olive-50 text-olive-700 border border-olive-200">
                         <span className="mr-1">{item.label}:</span>
                         <span>{item.value}</span>
                       </span>
                     ))}

                     {criteriaEntries.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-olive-50 text-olive-600 border border-olive-200">
                         +{criteriaEntries.length - 3} more
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
                <div className="flex items-center gap-1 text-xs text-olive-600 bg-olive-50 px-2 py-1 rounded">
                  <EnvelopeIcon className="w-3 h-3" />
                  <span>Email</span>
                </div>
              )}
              {opportunity.applicationForm && (
                <div className="flex items-center gap-1 text-xs text-olive-600 bg-olive-50 px-2 py-1 rounded">
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
                  ? 'bg-olive-100 text-olive-700 hover:bg-olive-200' 
                  : 'bg-olive-50 text-olive-400 hover:bg-olive-100 hover:text-olive-600'
              }`}
            >
              {isSaved ? (
                <HeartSolidIcon className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>

            {/* Posted Date */}
            <div className="text-xs text-olive-500 text-right min-w-0">
              <div>Posted</div>
              <div className="font-medium">{opportunity.posted}</div>
            </div>

            {/* Arrow */}
            <ChevronRightIcon className="w-5 h-5 text-olive-400" />
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-olive-50">
      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
      {/* Public Header for non-logged-in users */}
      {!user && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto" />
              </Link>
              
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                  Home
                </Link>
                <Link href="/seeker/opportunities" className="text-olive-600 font-semibold border-b-2 border-olive-600 pb-1">
                  Opportunities
                </Link>
                <Link href="/#about" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                  About
                </Link>
                <Link href="/#contact" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                  Contact
                </Link>
              </nav>

              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-olive-700 hover:text-olive-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-olive-700 text-white px-6 py-2 rounded-full font-medium hover:bg-olive-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-olive-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-olive-700" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-olive-700" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden pb-4 border-t border-olive-200 bg-white">
                <div className="pt-4 space-y-2">
                  <Link href="/" className="block px-3 py-2 text-olive-700 hover:text-olive-600 hover:bg-olive-50 rounded-lg">
                    Home
                  </Link>
                  <Link href="/seeker/opportunities" className="block px-3 py-2 text-olive-600 font-semibold bg-olive-100 rounded-lg">
                    Opportunities
                  </Link>
                  <Link href="/#about" className="block px-3 py-2 text-olive-700 hover:text-olive-600 hover:bg-olive-50 rounded-lg">
                    About
                  </Link>
                  <Link href="/#contact" className="block px-3 py-2 text-olive-700 hover:text-olive-600 hover:bg-olive-50 rounded-lg">
                    Contact
                  </Link>
                  <div className="pt-4 mt-4 border-t border-olive-200 space-y-2">
                    <Link href="/auth/signin" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="block bg-olive-700 text-white px-3 py-2 rounded-full font-medium text-center hover:bg-olive-800">
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Opportunities Banner */}
      <div className={`relative overflow-hidden ${!user ? 'pt-16' : ''}`}>
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-olive-700 via-olive-600 to-olive-800">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-olive-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-olive-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              Discover Your Future
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Opportunities
            </h1>
            <p className="text-lg md:text-xl text-olive-100 max-w-2xl mx-auto leading-relaxed">
              Explore thousands of jobs, funding opportunities, and training programs curated for your success
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{filteredOpportunities.length}</div>
                <div className="text-olive-200 text-sm font-medium">Available</div>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {opportunities.filter(o => o.category === 'job').length}
                </div>
                <div className="text-olive-200 text-sm font-medium">Jobs</div>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {opportunities.filter(o => o.category === 'funding').length}
                </div>
                <div className="text-olive-200 text-sm font-medium">Funding</div>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {opportunities.filter(o => o.category === 'training').length}
                </div>
                <div className="text-olive-200 text-sm font-medium">Training</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-16 md:h-24" preserveAspectRatio="none">
            <path 
              fill="#f7f8f3" 
              d="M0,64 C240,120 480,20 720,64 C960,108 1200,28 1440,64 L1440,120 L0,120 Z"
            />
          </svg>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-20">
        {/* Search & Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-olive-100">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-olive-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities by title, organization, or keywords..."
                  className="w-full pl-12 pr-4 py-4 border border-olive-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent text-lg bg-olive-50/50 placeholder:text-olive-400"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-olive-700 to-olive-600 text-white rounded-xl hover:from-olive-800 hover:to-olive-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Standard Filters */}
            <div className="border-t border-olive-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-olive-600" />
                  <span className="font-medium text-olive-800">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-olive-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-sm text-olive-600 hover:text-olive-800 font-medium transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Reset All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Category</label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="job">Jobs</option>
                      <option value="funding">Funding</option>
                      <option value="training">Training</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400 pointer-events-none" />
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Location</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <select
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                    >
                      <option value="all">All Locations</option>
                      {filterOptions.locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400 pointer-events-none" />
                  </div>
                </div>

                {/* Posted Date Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Posted</label>
                  <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <select
                      value={filters.postedDate}
                      onChange={(e) => updateFilter('postedDate', e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                    >
                      <option value="all">Any Time</option>
                      <option value="today">Last 24 Hours</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="quarter">Last 3 Months</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400 pointer-events-none" />
                  </div>
                </div>

                {/* Source Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Source</label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <select
                      value={filters.source}
                      onChange={(e) => updateFilter('source', e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                    >
                      <option value="all">All Sources</option>
                      <option value="internal">Zaytoonz Partners</option>
                      <option value="external">External Sources</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="border-t border-olive-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-olive-600 hover:text-olive-800 font-medium transition-colors group"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span>Advanced Search</span>
                {showAdvancedFilters ? (
                  <ChevronUpIcon className="w-4 h-4 transition-transform" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 transition-transform" />
                )}
                {!showAdvancedFilters && (
                  <span className="text-xs text-olive-400 ml-2">
                    More filtering options
                  </span>
                )}
              </button>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <div className="mt-6 p-5 bg-olive-50/50 rounded-xl border border-olive-100 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="w-4 h-4 text-olive-500" />
                    <span className="text-sm font-medium text-olive-700">Advanced Filters</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Contract Type Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Contract Type</label>
                      <select
                        value={filters.contractType}
                        onChange={(e) => updateFilter('contractType', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">All Types</option>
                        {filterOptions.contractTypes.length > 0 ? (
                          filterOptions.contractTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))
                        ) : (
                          <>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Internship">Internship</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Experience Level Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Experience Level</label>
                      <select
                        value={filters.level}
                        onChange={(e) => updateFilter('level', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">All Levels</option>
                        {filterOptions.levels.length > 0 ? (
                          filterOptions.levels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))
                        ) : (
                          <>
                            <option value="Entry">Entry Level</option>
                            <option value="Mid">Mid Level</option>
                            <option value="Senior">Senior Level</option>
                            <option value="Lead">Lead / Manager</option>
                            <option value="Executive">Executive</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Sector Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Sector</label>
                      <select
                        value={filters.sector}
                        onChange={(e) => updateFilter('sector', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">All Sectors</option>
                        {filterOptions.sectors.length > 0 ? (
                          filterOptions.sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                          ))
                        ) : (
                          <>
                            <option value="Technology">Technology</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Finance">Finance</option>
                            <option value="Non-profit">Non-profit</option>
                            <option value="Government">Government</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Funding Type Filter (for funding category) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Funding Type</label>
                      <select
                        value={filters.fundingType}
                        onChange={(e) => updateFilter('fundingType', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">All Types</option>
                        {filterOptions.fundingTypes.length > 0 ? (
                          filterOptions.fundingTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))
                        ) : (
                          <>
                            <option value="Grant">Grant</option>
                            <option value="Loan">Loan</option>
                            <option value="Investment">Investment</option>
                            <option value="Scholarship">Scholarship</option>
                            <option value="Prize">Prize / Award</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Eligibility Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Eligibility</label>
                      <select
                        value={filters.eligibility}
                        onChange={(e) => updateFilter('eligibility', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">All Eligibilities</option>
                        {filterOptions.eligibilities.length > 0 ? (
                          filterOptions.eligibilities.map(elig => (
                            <option key={elig} value={elig}>{elig}</option>
                          ))
                        ) : (
                          <>
                            <option value="Individuals">Individuals</option>
                            <option value="Startups">Startups</option>
                            <option value="SMEs">SMEs</option>
                            <option value="NGOs">NGOs</option>
                            <option value="Researchers">Researchers</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Amount Range Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Amount Range</label>
                      <select
                        value={filters.amountRange}
                        onChange={(e) => updateFilter('amountRange', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">Any Amount</option>
                        {filterOptions.amountRanges.length > 0 ? (
                          filterOptions.amountRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                          ))
                        ) : (
                          <>
                            <option value="< $1,000">Under $1,000</option>
                            <option value="$1,000 - $10,000">$1,000 - $10,000</option>
                            <option value="$10,000 - $50,000">$10,000 - $50,000</option>
                            <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                            <option value="> $100,000">Over $100,000</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Duration Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Duration</label>
                      <select
                        value={filters.duration}
                        onChange={(e) => updateFilter('duration', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">Any Duration</option>
                        {filterOptions.durations.length > 0 ? (
                          filterOptions.durations.map(dur => (
                            <option key={dur} value={dur}>{dur}</option>
                          ))
                        ) : (
                          <>
                            <option value="< 1 week">Less than 1 week</option>
                            <option value="1-4 weeks">1-4 weeks</option>
                            <option value="1-3 months">1-3 months</option>
                            <option value="3-6 months">3-6 months</option>
                            <option value="> 6 months">More than 6 months</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Format Filter (for training) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Format</label>
                      <select
                        value={filters.format}
                        onChange={(e) => updateFilter('format', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">All Formats</option>
                        {filterOptions.formats.length > 0 ? (
                          filterOptions.formats.map(fmt => (
                            <option key={fmt} value={fmt}>{fmt}</option>
                          ))
                        ) : (
                          <>
                            <option value="Online">Online</option>
                            <option value="In-person">In-person</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Self-paced">Self-paced</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Deadline Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-olive-600 uppercase tracking-wide">Deadline Status</label>
                      <select
                        value={filters.deadlineStatus}
                        onChange={(e) => updateFilter('deadlineStatus', e.target.value)}
                        className="w-full px-3 py-2.5 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 appearance-none bg-white text-olive-700 text-sm"
                      >
                        <option value="all">Any Deadline</option>
                        <option value="urgent">Urgent (≤ 3 days)</option>
                        <option value="soon">Closing Soon (4-7 days)</option>
                        <option value="open">Open (7+ days)</option>
                        <option value="no_deadline">No Deadline</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Reset for Advanced */}
                  <div className="mt-4 pt-4 border-t border-olive-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          contractType: 'all',
                          level: 'all',
                          sector: 'all',
                          fundingType: 'all',
                          eligibility: 'all',
                          amountRange: 'all',
                          duration: 'all',
                          format: 'all',
                          deadlineStatus: 'all',
                        }));
                      }}
                      className="text-sm text-olive-600 hover:text-olive-800 font-medium"
                    >
                      Clear Advanced Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-olive-800">
              {loading ? 'Loading opportunities...' : `${filteredOpportunities.length} Opportunities Found`}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <p className="text-olive-600">
                {filters.category === 'all' ? 'All categories' : `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}s`}
              </p>
              
              {/* Active Filter Tags */}
              {filters.location !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <MapPinIcon className="w-3 h-3" />
                  {filters.location}
                  <button onClick={() => updateFilter('location', 'all')} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.postedDate !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <CalendarDaysIcon className="w-3 h-3" />
                  {filters.postedDate === 'today' ? 'Last 24h' : 
                   filters.postedDate === 'week' ? 'Last week' : 
                   filters.postedDate === 'month' ? 'Last month' : 'Last 3 months'}
                  <button onClick={() => updateFilter('postedDate', 'all')} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.source !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <GlobeAltIcon className="w-3 h-3" />
                  {filters.source === 'internal' ? 'Zaytoonz Partners' : 'External'}
                  <button onClick={() => updateFilter('source', 'all')} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <MagnifyingGlassIcon className="w-3 h-3" />
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {savedOpportunities.size > 0 && (
                <span className="text-olive-700 font-medium text-sm">
                  • {savedOpportunities.size} saved
                </span>
              )}
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-olive-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-olive-700 shadow-sm' 
                  : 'text-olive-500 hover:text-olive-700'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-olive-700 shadow-sm' 
                  : 'text-olive-500 hover:text-olive-700'
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
                  className="mt-4 px-6 py-2 bg-olive-700 text-white rounded-lg hover:bg-olive-800 transition-colors font-medium"
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-olive-100 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-olive-800 mb-2">Loading opportunities...</h3>
            <p className="text-olive-600">Please wait while we fetch the latest opportunities</p>
          </div>
        )}
          
        {/* Empty State */}
        {!loading && filteredOpportunities.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-olive-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-olive-100 rounded-full mb-6">
              <BriefcaseIcon className="w-10 h-10 text-olive-500" />
            </div>
            <h3 className="text-2xl font-semibold text-olive-800 mb-4">No opportunities found</h3>
            <p className="text-lg text-olive-600 mb-6 max-w-md mx-auto">
              {activeFilterCount > 0
                ? 'No opportunities match your current filters. Try adjusting your search criteria.'
                : filters.category === 'all' 
                  ? 'No opportunities are currently available'
                  : `No ${filters.category} opportunities are currently available`
              }
            </p>
            {activeFilterCount > 0 && (
              <button 
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-olive-700 text-white rounded-lg hover:bg-olive-800 transition-colors font-medium"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Reset All Filters
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
