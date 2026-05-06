'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  BriefcaseIcon,
  BanknotesIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface NGO {
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  profile_image_url?: string;
  jobs_count: number;
  fundings_count: number;
  trainings_count: number;
  total_opportunities: number;
}

const PAGE_SIZE = 16;
const SEARCH_DEBOUNCE_MS = 320;

export default function OrganizationsPage() {
  const [browseNgos, setBrowseNgos] = useState<NGO[]>([]);
  const [browseHasMore, setBrowseHasMore] = useState(false);
  const [searchNgos, setSearchNgos] = useState<NGO[]>([]);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchTotalMatches, setSearchTotalMatches] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalApprovedAll, setTotalApprovedAll] = useState<number | null>(null);

  const trimmedSearch = searchTerm.trim();
  const debouncedTrimmed = debouncedSearch.trim();
  const isBrowseMode = trimmedSearch.length === 0;
  const awaitingDebounce =
    trimmedSearch.length > 0 && debouncedTrimmed !== trimmedSearch;
  const displayNgos = isBrowseMode ? browseNgos : searchNgos;
  const hasMore = isBrowseMode ? browseHasMore : searchHasMore;
  const showSearchActivity = !isBrowseMode && (awaitingDebounce || searchLoading);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/public/ngos?limit=${PAGE_SIZE}&offset=0`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setBrowseNgos([]);
        } else {
          const list = data.ngos || [];
          setBrowseNgos(list);
          setBrowseHasMore(Boolean(data.has_more));
          setTotalApprovedAll(
            typeof data.total_approved === 'number' ? data.total_approved : null
          );
        }
      } catch (err) {
        console.error('Error fetching NGOs:', err);
        setError('Failed to load organizations');
        setBrowseNgos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNGOs();
  }, []);

  useEffect(() => {
    const q = debouncedSearch.trim();
    if (!q) {
      setSearchNgos([]);
      setSearchHasMore(false);
      setSearchTotalMatches(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setSearchLoading(true);
        setError(null);
        const response = await fetch(
          `/api/public/ngos?limit=${PAGE_SIZE}&offset=0&q=${encodeURIComponent(q)}`
        );
        const data = await response.json();

        if (cancelled) return;

        if (data.error) {
          setError(data.error);
          setSearchNgos([]);
          setSearchHasMore(false);
          setSearchTotalMatches(null);
          return;
        }

        setSearchNgos(data.ngos || []);
        setSearchHasMore(Boolean(data.has_more));
        setSearchTotalMatches(
          typeof data.total_approved === 'number' ? data.total_approved : null
        );
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Error searching NGOs:', err);
        setError('Failed to search organizations');
        setSearchNgos([]);
        setSearchHasMore(false);
        setSearchTotalMatches(null);
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const q = debouncedTrimmed;
    const searchMode = q.length > 0;

    try {
      setLoadingMore(true);
      setError(null);
      const offset = searchMode ? searchNgos.length : browseNgos.length;
      const url = searchMode
        ? `/api/public/ngos?limit=${PAGE_SIZE}&offset=${offset}&q=${encodeURIComponent(q)}`
        : `/api/public/ngos?limit=${PAGE_SIZE}&offset=${offset}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const next = (data.ngos || []) as NGO[];
      if (searchMode) {
        setSearchNgos((prev) => {
          const seen = new Set(prev.map((n) => n.id));
          const merged = next.filter((n) => !seen.has(n.id));
          return [...prev, ...merged];
        });
        setSearchHasMore(Boolean(data.has_more));
        if (typeof data.total_approved === 'number') {
          setSearchTotalMatches(data.total_approved);
        }
      } else {
        setBrowseNgos((prev) => {
          const seen = new Set(prev.map((n) => n.id));
          const merged = next.filter((n) => !seen.has(n.id));
          return [...prev, ...merged];
        });
        setBrowseHasMore(Boolean(data.has_more));
        if (typeof data.total_approved === 'number') {
          setTotalApprovedAll(data.total_approved);
        }
      }
    } catch (err) {
      console.error('Error loading more NGOs:', err);
      setError('Failed to load more organizations');
    } finally {
      setLoadingMore(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is handled by useEffect
  };

  return (
    <div className="min-h-screen bg-olive-50">
      {/* Landing Page Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto" />
            </Link>
            <Link 
              href="/" 
              className="text-olive-700 hover:text-olive-600 font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Organizations Banner */}
      <div className="relative overflow-hidden pt-16">
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
              Our Partners
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Organizations
            </h1>
            <p className="text-lg md:text-xl text-olive-100 max-w-2xl mx-auto leading-relaxed">
              Discover organizations making a difference through jobs, funding, and training opportunities
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {isBrowseMode
                    ? totalApprovedAll ?? browseNgos.length
                    : searchTotalMatches ?? searchNgos.length}
                </div>
                <div className="text-olive-200 text-sm font-medium">Organizations</div>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {displayNgos.reduce((sum, ngo) => sum + ngo.jobs_count, 0)}
                </div>
                <div className="text-olive-200 text-sm font-medium">Jobs</div>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {displayNgos.reduce((sum, ngo) => sum + ngo.fundings_count, 0)}
                </div>
                <div className="text-olive-200 text-sm font-medium">Funding</div>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {displayNgos.reduce((sum, ngo) => sum + ngo.trainings_count, 0)}
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
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-olive-100">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-olive-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search organizations by name..."
                  className="w-full pl-12 pr-10 py-4 border border-olive-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent text-lg bg-olive-50/50 placeholder:text-olive-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-olive-400 hover:text-olive-600"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-olive-800">
              {loading
                ? 'Loading organizations...'
                : showSearchActivity
                  ? 'Searching organizations...'
                  : `${displayNgos.length} Organizations Found`}
            </h3>
            {searchTerm && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                  <MagnifyingGlassIcon className="w-3 h-3" />
                  "{searchTerm}"
                  <button onClick={clearSearch} className="ml-1 hover:text-olive-900">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}
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
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
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
            <h3 className="text-xl font-semibold text-olive-800 mb-2">Loading organizations...</h3>
            <p className="text-olive-600">Please wait while we fetch the latest organizations</p>
          </div>
        )}
          
        {/* Search in progress (server query) */}
        {!loading && showSearchActivity && displayNgos.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-olive-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-olive-100 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600" />
            </div>
            <p className="text-olive-700 font-medium">Searching all organizations…</p>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !showSearchActivity &&
          displayNgos.length === 0 &&
          !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-olive-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-olive-100 rounded-full mb-6">
              <BuildingOfficeIcon className="w-10 h-10 text-olive-500" />
            </div>
            <h3 className="text-2xl font-semibold text-olive-800 mb-4">No organizations found</h3>
            <p className="text-lg text-olive-600 mb-6 max-w-md mx-auto">
              {trimmedSearch
                ? 'No organizations match your search. Try a different name or email fragment.'
                : 'No organizations are currently available'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {trimmedSearch && (
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-olive-700 text-white rounded-lg hover:bg-olive-800 transition-colors font-medium"
                >
                  Clear Search
                </button>
              )}
              {!trimmedSearch && hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-olive-700 hover:text-olive-900 disabled:text-olive-400 disabled:cursor-not-allowed text-base font-medium underline underline-offset-4"
                >
                  {loadingMore ? 'Loading…' : 'Preview More Organization'}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Organizations Display */}
        {!loading && displayNgos.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayNgos.map(ngo => (
                  <OrganizationCard key={ngo.id} ngo={ngo} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayNgos.map(ngo => (
                  <OrganizationRow key={ngo.id} ngo={ngo} />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex flex-col items-center mt-10 pb-4">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-olive-700 hover:text-olive-900 disabled:text-olive-400 disabled:cursor-not-allowed text-base font-medium underline underline-offset-4 decoration-olive-400 hover:decoration-olive-700 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  {loadingMore ? 'Loading…' : 'Preview More Organization'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Card Component
function OrganizationCard({ ngo }: { ngo: NGO }) {
  return (
    <Link
      href={`/public/ngo/${ngo.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-olive-100 p-6 cursor-pointer hover:bg-olive-50/30 transform hover:scale-[1.02]"
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-olive-100 to-olive-200 flex items-center justify-center border-2 border-olive-200">
          {ngo.logo_url || ngo.profile_image_url ? (
            <img
              src={ngo.logo_url || ngo.profile_image_url}
              alt={ngo.name}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center" style={{ display: ngo.logo_url || ngo.profile_image_url ? 'none' : 'flex' }}>
            <img
              src="/image.png"
              alt="Zaytoonz"
              className="w-14 h-14 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* NGO Name */}
      <h3 className="text-lg font-semibold text-olive-800 mb-2 text-center line-clamp-2">
        {ngo.name}
      </h3>

      {/* Opportunity Counts */}
      <div className="flex justify-center items-center gap-4 mb-4">
        {ngo.jobs_count > 0 && (
          <div className="flex flex-col items-center">
            <BriefcaseIcon className="w-5 h-5 text-olive-600 mb-1" />
            <span className="text-sm font-semibold text-olive-800">{ngo.jobs_count}</span>
          </div>
        )}
        {ngo.fundings_count > 0 && (
          <div className="flex flex-col items-center">
            <BanknotesIcon className="w-5 h-5 text-olive-600 mb-1" />
            <span className="text-sm font-semibold text-olive-800">{ngo.fundings_count}</span>
          </div>
        )}
        {ngo.trainings_count > 0 && (
          <div className="flex flex-col items-center">
            <AcademicCapIcon className="w-5 h-5 text-olive-600 mb-1" />
            <span className="text-sm font-semibold text-olive-800">{ngo.trainings_count}</span>
          </div>
        )}
      </div>

      {/* Total Opportunities */}
      <div className="text-center mb-4">
        <p className="text-sm text-olive-600">
          {ngo.total_opportunities} {ngo.total_opportunities === 1 ? 'opportunity' : 'opportunities'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center pt-4 border-t border-olive-100">
        <div className="flex items-center text-olive-600 hover:text-olive-700 transition-colors">
          <span className="text-sm font-medium mr-2">View Profile</span>
          <ChevronRightIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

// Row Component
function OrganizationRow({ ngo }: { ngo: NGO }) {
  return (
    <Link
      href={`/public/ngo/${ngo.id}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-olive-100 p-6 cursor-pointer hover:bg-olive-50/30"
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Main Info */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-olive-100 to-olive-200 flex items-center justify-center border-2 border-olive-200">
              {ngo.logo_url || ngo.profile_image_url ? (
                <img
                  src={ngo.logo_url || ngo.profile_image_url}
                  alt={ngo.name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center" style={{ display: ngo.logo_url || ngo.profile_image_url ? 'none' : 'flex' }}>
                <img
                  src="/image.png"
                  alt="Zaytoonz"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-olive-800 mb-1.5 truncate">
              {ngo.name}
            </h3>

            {/* Email */}
            <div className="flex items-center gap-1.5 text-sm text-olive-600 mb-2">
              <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{ngo.email}</span>
            </div>

            {/* Opportunity Counts */}
            <div className="flex items-center gap-3 text-sm text-olive-600 flex-wrap">
              {ngo.jobs_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <BriefcaseIcon className="w-4 h-4" />
                  <span>{ngo.jobs_count} Jobs</span>
                </div>
              )}
              {ngo.fundings_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <BanknotesIcon className="w-4 h-4" />
                  <span>{ngo.fundings_count} Fundings</span>
                </div>
              )}
              {ngo.trainings_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>{ngo.trainings_count} Trainings</span>
                </div>
              )}
              <span className="text-olive-600">
                {ngo.total_opportunities} total
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Arrow */}
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <ChevronRightIcon className="w-5 h-5 text-olive-400" />
        </div>
      </div>
    </Link>
  );
}
