'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  uniqueCountriesFromLocations,
  displayOpportunityCountry,
} from '@/app/lib/locationNormalize';
import {
  buildOrganizationCanonicalMap,
  canonicalOrganizationName,
  organizationMatchesFilter,
  uniqueOrganizationsFromOpportunities,
} from '@/app/lib/organizationNormalize';
import MultiSelectFilter, { type MultiSelectOption } from './MultiSelectFilter';
import PostedDateRangeFilter, {
  initialPostedDateRange,
  opportunityMatchesPostedRange,
  type PostedDateRange,
} from './PostedDateRangeFilter';

type MultiSelectFilterKey = Exclude<keyof Filters, 'postedRange'>;

// Filter types — each field holds zero or more selected values (empty = no filter)
interface Filters {
  category: string[];
  location: string[];
  organization: string[];
  postedRange: PostedDateRange;
  contractType: string[];
  level: string[];
  sector: string[];
  fundingType: string[];
  eligibility: string[];
  amountRange: string[];
  duration: string[];
  format: string[];
  deadlineStatus: string[];
  source: string[];
}

const initialFilters: Filters = {
  category: [],
  location: [],
  organization: [],
  postedRange: initialPostedDateRange,
  contractType: [],
  level: [],
  sector: [],
  fundingType: [],
  eligibility: [],
  amountRange: [],
  duration: [],
  format: [],
  deadlineStatus: [],
  source: [],
};

const CATEGORY_OPTIONS: MultiSelectOption[] = [
  { value: 'job', label: 'Jobs' },
  { value: 'funding', label: 'Funding' },
  { value: 'training', label: 'Training' },
];

const SOURCE_OPTIONS: MultiSelectOption[] = [
  { value: 'internal', label: 'Zaytoonz Partners' },
  { value: 'external', label: 'External Sources' },
];

const DEADLINE_STATUS_OPTIONS: MultiSelectOption[] = [
  { value: 'urgent', label: 'Urgent (≤ 3 days)' },
  { value: 'soon', label: 'Closing Soon (4-7 days)' },
  { value: 'open', label: 'Open (7+ days)' },
  { value: 'no_deadline', label: 'No Deadline' },
  { value: 'expired', label: 'Expired' },
];

const DEFAULT_CONTRACT_TYPES: MultiSelectOption[] = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
];

const DEFAULT_LEVELS: MultiSelectOption[] = [
  { value: 'Entry', label: 'Entry Level' },
  { value: 'Mid', label: 'Mid Level' },
  { value: 'Senior', label: 'Senior Level' },
  { value: 'Lead', label: 'Lead / Manager' },
  { value: 'Executive', label: 'Executive' },
];

const DEFAULT_SECTORS: MultiSelectOption[] = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Non-profit', label: 'Non-profit' },
  { value: 'Government', label: 'Government' },
];

const DEFAULT_FUNDING_TYPES: MultiSelectOption[] = [
  { value: 'Grant', label: 'Grant' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Scholarship', label: 'Scholarship' },
  { value: 'Prize', label: 'Prize / Award' },
];

const DEFAULT_ELIGIBILITIES: MultiSelectOption[] = [
  { value: 'Individuals', label: 'Individuals' },
  { value: 'Startups', label: 'Startups' },
  { value: 'SMEs', label: 'SMEs' },
  { value: 'NGOs', label: 'NGOs' },
  { value: 'Researchers', label: 'Researchers' },
];

const DEFAULT_AMOUNT_RANGES: MultiSelectOption[] = [
  { value: '< $1,000', label: 'Under $1,000' },
  { value: '$1,000 - $10,000', label: '$1,000 - $10,000' },
  { value: '$10,000 - $50,000', label: '$10,000 - $50,000' },
  { value: '$50,000 - $100,000', label: '$50,000 - $100,000' },
  { value: '> $100,000', label: 'Over $100,000' },
];

const DEFAULT_DURATIONS: MultiSelectOption[] = [
  { value: '< 1 week', label: 'Less than 1 week' },
  { value: '1-4 weeks', label: '1-4 weeks' },
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '> 6 months', label: 'More than 6 months' },
];

const DEFAULT_FORMATS: MultiSelectOption[] = [
  { value: 'Online', label: 'Online' },
  { value: 'In-person', label: 'In-person' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Self-paced', label: 'Self-paced' },
];

function optionsFromValues(values: string[], fallbacks: MultiSelectOption[]): MultiSelectOption[] {
  if (values.length > 0) {
    return values.map((value) => ({ value, label: value }));
  }
  return fallbacks;
}

function matchesDeadlineStatus(opp: Opportunity, status: string): boolean {
  if (!opp.deadline) return status === 'no_deadline';
  const deadline = new Date(opp.deadline);
  if (Number.isNaN(deadline.getTime())) return status === 'no_deadline';
  const diffDays = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  switch (status) {
    case 'urgent':
      return diffDays <= 3 && diffDays >= 0;
    case 'soon':
      return diffDays > 3 && diffDays <= 7;
    case 'open':
      return diffDays > 7;
    case 'expired':
      return diffDays < 0;
    case 'no_deadline':
      return false;
    default:
      return false;
  }
}

function categoryFromSearchParam(value: string | null): string {
  if (value === 'job' || value === 'training' || value === 'funding') return value;
  return 'all';
}

function OpportunitiesPageContent() {
  const searchParams = useSearchParams();
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

  const locationOptions = useMemo<MultiSelectOption[]>(
    () =>
      uniqueCountriesFromLocations(opportunities.map((opp) => opp.location)).map((country) => ({
        value: country,
        label: country,
      })),
    [opportunities]
  );

  const organizationCanonicalMap = useMemo(
    () => buildOrganizationCanonicalMap(opportunities),
    [opportunities]
  );

  const organizationOptions = useMemo<MultiSelectOption[]>(
    () =>
      uniqueOrganizationsFromOpportunities(opportunities).map((name) => ({
        value: name,
        label: name,
      })),
    [opportunities]
  );

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
    const contractTypes = new Set<string>();
    const levels = new Set<string>();
    const sectors = new Set<string>();
    const fundingTypes = new Set<string>();
    const eligibilities = new Set<string>();
    const amountRanges = new Set<string>();
    const durations = new Set<string>();
    const formats = new Set<string>();

    opportunities.forEach(opp => {
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

  // Count active filter groups
  const activeFilterCount = useMemo(() => {
    let count = 0;
    (Object.keys(filters) as Array<keyof Filters>).forEach((key) => {
      if (key === 'postedRange') {
        if (filters.postedRange.from) count++;
      } else if (filters[key].length > 0) count++;
    });
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  const urlCategory = categoryFromSearchParam(searchParams.get('category'));

  useLayoutEffect(() => {
    if (urlCategory === 'all') return;
    setFilters((prev) =>
      prev.category.length === 1 && prev.category[0] === urlCategory
        ? prev
        : { ...prev, category: [urlCategory] }
    );
  }, [urlCategory]);

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

    if (filters.category.length > 0) {
      filtered = filtered.filter((opp) => filters.category.includes(opp.category));
    }

    if (filters.location.length > 0) {
      filtered = filtered.filter((opp) => {
        const country = displayOpportunityCountry(opp.location);
        return country ? filters.location.includes(country) : false;
      });
    }

    if (filters.organization.length > 0) {
      filtered = filtered.filter((opp) =>
        organizationMatchesFilter(opp, filters.organization, organizationCanonicalMap)
      );
    }

    if (filters.postedRange.from) {
      filtered = filtered.filter((opp) =>
        opportunityMatchesPostedRange(opp, filters.postedRange, parsePostedDate)
      );
    }

    if (filters.contractType.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.contractType && filters.contractType.includes(opp.criteria.contractType)
      );
    }

    if (filters.level.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.level && filters.level.includes(opp.criteria.level)
      );
    }

    if (filters.sector.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.sector && filters.sector.includes(opp.criteria.sector)
      );
    }

    if (filters.fundingType.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.fundingType && filters.fundingType.includes(opp.criteria.fundingType)
      );
    }

    if (filters.eligibility.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.eligibility && filters.eligibility.includes(opp.criteria.eligibility)
      );
    }

    if (filters.amountRange.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.amountRange && filters.amountRange.includes(opp.criteria.amountRange)
      );
    }

    if (filters.duration.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.duration && filters.duration.includes(opp.criteria.duration)
      );
    }

    if (filters.format.length > 0) {
      filtered = filtered.filter(
        (opp) => opp.criteria?.format && filters.format.includes(opp.criteria.format)
      );
    }

    if (filters.deadlineStatus.length > 0) {
      filtered = filtered.filter((opp) =>
        filters.deadlineStatus.some((status) => matchesDeadlineStatus(opp, status))
      );
    }

    if (filters.source.length === 1) {
      filtered = filtered.filter((opp) => {
        const isExternal =
          opp.isScraped ||
          opp.isExtracted ||
          opp.isAdminPosted ||
          opp.id.startsWith('scraped_') ||
          opp.id.startsWith('extracted_');
        return filters.source[0] === 'external' ? isExternal : !isExternal;
      });
    }

    // Search query filter (text search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title?.toLowerCase().includes(query) ||
        canonicalOrganizationName(opp, organizationCanonicalMap)?.toLowerCase().includes(query) ||
        opp.organization?.toLowerCase().includes(query) ||
        opp.description?.toLowerCase().includes(query) ||
        opp.location?.toLowerCase().includes(query) ||
        displayOpportunityCountry(opp.location)?.toLowerCase().includes(query)
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

  const updateFilter = (key: MultiSelectFilterKey, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
  };

  const updatePostedRange = (range: PostedDateRange) => {
    setFilters((prev) => ({ ...prev, postedRange: range }));
  };

  const removeFilterValue = (key: MultiSelectFilterKey, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item !== value),
    }));
  };

  const clearPostedRange = () => {
    setFilters((prev) => ({ ...prev, postedRange: initialPostedDateRange }));
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

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
    const isSaved = savedOpportunities.has(opportunity.id);
    const categoryIcon = getCategoryIcon(opportunity.category);
    const categoryColor = getCategoryColor(opportunity.category);
    const country = displayOpportunityCountry(opportunity.location);
    const organization = canonicalOrganizationName(opportunity, organizationCanonicalMap);

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
                alt={organization ?? opportunity.organization}
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
              <p className="text-sm text-olive-600">{organization ?? opportunity.organization}</p>
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
          {country && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <MapPinIcon className="w-4 h-4" />
              <span>{country}</span>
            </div>
          )}
          
          {opportunity.compensation && !/competitive/i.test(opportunity.compensation) && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <BanknotesIcon className="w-4 h-4" />
              <span>{opportunity.compensation}</span>
            </div>
          )}

          {opportunity.type && opportunity.type !== 'Job Opportunity' && opportunity.type !== 'Funding Opportunity' && opportunity.type !== 'Training Program' && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <ClockIcon className="w-4 h-4" />
              <span>{opportunity.type}</span>
            </div>
          )}

          {opportunity.deadline && (
            <div className="flex items-center gap-2 text-sm text-olive-600">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{opportunity.deadline}</span>
            </div>
          )}
        </div>

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
    const country = displayOpportunityCountry(opportunity.location);
    const organization = canonicalOrganizationName(opportunity, organizationCanonicalMap);

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
                  alt={organization ?? opportunity.organization}
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
                  <span className="truncate">{organization ?? opportunity.organization}</span>
                </div>
                
                {country && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">{country}</span>
                  </div>
                )}

                {opportunity.compensation && !/competitive/i.test(opportunity.compensation) && (
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

                {opportunity.deadline && (
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span className="truncate">{opportunity.deadline}</span>
                  </div>
                )}
              </div>

              <p className="text-olive-700 text-sm line-clamp-2">
                {truncateText(opportunity.description || '')}
              </p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <MultiSelectFilter
                  label="Category"
                  icon={BriefcaseIcon}
                  placeholder="All Categories"
                  options={CATEGORY_OPTIONS}
                  selected={filters.category}
                  onChange={(values) => updateFilter('category', values)}
                />

                <MultiSelectFilter
                  label="Location"
                  icon={MapPinIcon}
                  placeholder="All Locations"
                  options={locationOptions}
                  selected={filters.location}
                  onChange={(values) => updateFilter('location', values)}
                />

                <MultiSelectFilter
                  label="Organization"
                  icon={BuildingOfficeIcon}
                  placeholder="All Organizations"
                  options={organizationOptions}
                  selected={filters.organization}
                  onChange={(values) => updateFilter('organization', values)}
                  searchable
                  searchPlaceholder="Search organizations..."
                />

                <PostedDateRangeFilter
                  value={filters.postedRange}
                  onChange={updatePostedRange}
                />

                <MultiSelectFilter
                  label="Source"
                  icon={GlobeAltIcon}
                  placeholder="All Sources"
                  options={SOURCE_OPTIONS}
                  selected={filters.source}
                  onChange={(values) => updateFilter('source', values)}
                />
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
                    <MultiSelectFilter
                      label="Contract Type"
                      placeholder="All Types"
                      options={optionsFromValues(filterOptions.contractTypes, DEFAULT_CONTRACT_TYPES)}
                      selected={filters.contractType}
                      onChange={(values) => updateFilter('contractType', values)}
                    />

                    <MultiSelectFilter
                      label="Experience Level"
                      placeholder="All Levels"
                      options={optionsFromValues(filterOptions.levels, DEFAULT_LEVELS)}
                      selected={filters.level}
                      onChange={(values) => updateFilter('level', values)}
                    />

                    <MultiSelectFilter
                      label="Sector"
                      placeholder="All Sectors"
                      options={optionsFromValues(filterOptions.sectors, DEFAULT_SECTORS)}
                      selected={filters.sector}
                      onChange={(values) => updateFilter('sector', values)}
                    />

                    <MultiSelectFilter
                      label="Funding Type"
                      placeholder="All Types"
                      options={optionsFromValues(filterOptions.fundingTypes, DEFAULT_FUNDING_TYPES)}
                      selected={filters.fundingType}
                      onChange={(values) => updateFilter('fundingType', values)}
                    />

                    <MultiSelectFilter
                      label="Eligibility"
                      placeholder="All Eligibilities"
                      options={optionsFromValues(filterOptions.eligibilities, DEFAULT_ELIGIBILITIES)}
                      selected={filters.eligibility}
                      onChange={(values) => updateFilter('eligibility', values)}
                    />

                    <MultiSelectFilter
                      label="Amount Range"
                      placeholder="Any Amount"
                      options={optionsFromValues(filterOptions.amountRanges, DEFAULT_AMOUNT_RANGES)}
                      selected={filters.amountRange}
                      onChange={(values) => updateFilter('amountRange', values)}
                    />

                    <MultiSelectFilter
                      label="Duration"
                      placeholder="Any Duration"
                      options={optionsFromValues(filterOptions.durations, DEFAULT_DURATIONS)}
                      selected={filters.duration}
                      onChange={(values) => updateFilter('duration', values)}
                    />

                    <MultiSelectFilter
                      label="Format"
                      placeholder="All Formats"
                      options={optionsFromValues(filterOptions.formats, DEFAULT_FORMATS)}
                      selected={filters.format}
                      onChange={(values) => updateFilter('format', values)}
                    />

                    <MultiSelectFilter
                      label="Deadline Status"
                      placeholder="Any Deadline"
                      options={DEADLINE_STATUS_OPTIONS}
                      selected={filters.deadlineStatus}
                      onChange={(values) => updateFilter('deadlineStatus', values)}
                    />
                  </div>

                  {/* Quick Reset for Advanced */}
                  <div className="mt-4 pt-4 border-t border-olive-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          contractType: [],
                          level: [],
                          sector: [],
                          fundingType: [],
                          eligibility: [],
                          amountRange: [],
                          duration: [],
                          format: [],
                          deadlineStatus: [],
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
                {filters.category.length === 0
                  ? 'All categories'
                  : filters.category.map((c) => `${c.charAt(0).toUpperCase()}${c.slice(1)}s`).join(', ')}
              </p>

              {filters.category.map((value) => (
                <span key={`category-${value}`} className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <BriefcaseIcon className="w-3 h-3" />
                  {CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value}
                  <button type="button" onClick={() => removeFilterValue('category', value)} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.location.map((value) => (
                <span key={`location-${value}`} className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <MapPinIcon className="w-3 h-3" />
                  {value}
                  <button type="button" onClick={() => removeFilterValue('location', value)} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.organization.map((value) => (
                <span key={`organization-${value}`} className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <BuildingOfficeIcon className="w-3 h-3" />
                  {value}
                  <button type="button" onClick={() => removeFilterValue('organization', value)} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.postedRange.from && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <CalendarDaysIcon className="w-3 h-3" />
                  {filters.postedRange.tillToday
                    ? `Since ${new Date(`${filters.postedRange.from}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – Today`
                    : filters.postedRange.to
                      ? `${new Date(`${filters.postedRange.from}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(`${filters.postedRange.to}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : `Since ${new Date(`${filters.postedRange.from}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  <button type="button" onClick={clearPostedRange} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.source.map((value) => (
                <span key={`source-${value}`} className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <GlobeAltIcon className="w-3 h-3" />
                  {SOURCE_OPTIONS.find((o) => o.value === value)?.label ?? value}
                  <button type="button" onClick={() => removeFilterValue('source', value)} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

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
                : filters.category.length === 0
                  ? 'No opportunities are currently available'
                  : `No ${filters.category.join(', ')} opportunities are currently available`
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

export default function OpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-olive-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-olive-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600" />
            </div>
            <p className="text-olive-700 font-medium">Loading opportunities...</p>
          </div>
        </div>
      }
    >
      <OpportunitiesPageContent />
    </Suspense>
  );
}
