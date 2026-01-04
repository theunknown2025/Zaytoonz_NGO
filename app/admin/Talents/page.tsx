'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  TagIcon,
  EyeIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  getPaginatedSeekerProfiles, 
  searchSeekerProfiles, 
  getSeekerProfileStats,
  filterSeekerProfiles,
  getFilterOptions,
  SeekerProfile,
  SeekerProfileFilters
} from './supabaseService';
import Charts from './charts';

export default function Talents() {
  const [profiles, setProfiles] = useState<SeekerProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<SeekerProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  
  // Chart visibility state
  const [showCharts, setShowCharts] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<SeekerProfileFilters>({});
  const [filterOptions, setFilterOptions] = useState<{
    nationalities: string[];
    fieldsOfExpertise: string[];
  }>({ nationalities: [], fieldsOfExpertise: [] });
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Autocomplete states
  const [nationalityInput, setNationalityInput] = useState('');
  const [fieldInput, setFieldInput] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);



  useEffect(() => {
    loadFilterOptions();
    loadStats();
  }, []);

  useEffect(() => {
    // Add a small delay to debounce rapid filter changes
    const timeoutId = setTimeout(() => {
      applyFiltersAndSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, filters, searchTerm]);

  useEffect(() => {
    // Check if there are active filters
    const hasFilters = Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== null
    ) || searchTerm.trim() !== '';
    setHasActiveFilters(hasFilters);
  }, [filters, searchTerm]);

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.nationality-autocomplete')) {
        setShowNationalityDropdown(false);
      }
      if (!target.closest('.field-autocomplete')) {
        setShowFieldDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const { data, error, totalCount: count } = await getPaginatedSeekerProfiles(currentPage, itemsPerPage);
      
      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      if (data) {
        setProfiles(data);
        setTotalCount(count);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const { nationalities, fieldsOfExpertise, error } = await getFilterOptions();
      if (!error) {
        setFilterOptions({ nationalities, fieldsOfExpertise });
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const applyFiltersAndSearch = async () => {
    try {
      setIsLoading(true);
      
      // Calculate if we have active filters directly
      const hasFiltersOrSearch = Object.values(filters).some(value => 
        value !== undefined && value !== '' && value !== null
      ) || searchTerm.trim() !== '';
      
      // If we have filters or search term, use filtering
      if (hasFiltersOrSearch) {
        const filterParams = { ...filters };
        
        // Handle the case where searchTerm is used but no other filters
        if (searchTerm.trim() && !filters.name) {
          filterParams.name = searchTerm;
        }
        
        const { data, error, totalCount: count } = await filterSeekerProfiles(
          filterParams, 
          currentPage, 
          itemsPerPage
        );
        
        if (error) {
          console.error('Error filtering profiles:', error);
          return;
        }

        if (data) {
          setProfiles(data);
          setTotalCount(count);
        }
      } else {
        // No filters, load all profiles
        await loadProfiles();
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<SeekerProfileFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Clean up the filters - remove empty values
      Object.keys(updated).forEach(key => {
        const value = updated[key as keyof SeekerProfileFilters];
        if (value === '' || value === null || 
            (Array.isArray(value) && value.length === 0)) {
          delete updated[key as keyof SeekerProfileFilters];
        }
      });
      
      return updated;
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
    setNationalityInput('');
    setFieldInput('');
  };

  // Autocomplete helper functions
  const getFilteredNationalities = (input: string) => {
    if (!input.trim()) return filterOptions.nationalities.slice(0, 10);
    return filterOptions.nationalities.filter(nationality =>
      nationality.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 10);
  };

  const getFilteredFields = (input: string) => {
    if (!input.trim()) return filterOptions.fieldsOfExpertise.slice(0, 10);
    return filterOptions.fieldsOfExpertise.filter(field =>
      field.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 10);
  };

  const addNationality = (nationality: string) => {
    const currentNationalities = filters.nationality || [];
    if (!currentNationalities.includes(nationality)) {
      const newNationalities = [...currentNationalities, nationality];
      handleFilterChange({ nationality: newNationalities });
    }
    setNationalityInput('');
    setShowNationalityDropdown(false);
  };

  const addField = (field: string) => {
    const currentFields = filters.fieldOfExpertise || [];
    if (!currentFields.includes(field)) {
      const newFields = [...currentFields, field];
      handleFilterChange({ fieldOfExpertise: newFields });
    }
    setFieldInput('');
    setShowFieldDropdown(false);
  };

  const removeNationality = (nationality: string) => {
    const currentNationalities = filters.nationality || [];
    const newNationalities = currentNationalities.filter(n => n !== nationality);
    handleFilterChange({ nationality: newNationalities.length > 0 ? newNationalities : undefined });
  };

  const removeField = (field: string) => {
    const currentFields = filters.fieldOfExpertise || [];
    const newFields = currentFields.filter(f => f !== field);
    handleFilterChange({ fieldOfExpertise: newFields.length > 0 ? newFields : undefined });
  };

  const loadStats = async () => {
    try {
      const { data, error } = await getSeekerProfileStats();
      if (data && !error) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const openProfileModal = (profile: SeekerProfile) => {
    setSelectedProfile(profile);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#556B2F]">Talents Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#556B2F]/90 transition-colors flex items-center gap-2"
              >
                <ChartBarIcon className="h-5 w-5" />
                {showCharts ? 'Hide Charts' : 'Show Charts'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-8 w-8 text-[#556B2F]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Talents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top Field</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.topFields?.[0]?.field || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <Charts showCharts={showCharts} />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          {/* Top Row: Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F]"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  showFilters ? 'bg-gray-50 text-[#556B2F]' : 'bg-white text-gray-700'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                Basic Filters
                {hasActiveFilters && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-2 w-2"></span>
                )}
              </button>

              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  showAdvancedSearch ? 'bg-gray-50 text-[#556B2F]' : 'bg-white text-gray-700'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Advanced Search
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear All
                </button>
              )}

              <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
          </div>

          {/* Basic Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={filters.name || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({ name: value === '' ? undefined : value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] text-sm"
                  />
                </div>

                {/* Years of Experience Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      value={filters.minExperience !== undefined ? filters.minExperience : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange({ 
                          minExperience: value === '' || value === null ? undefined : Number(value) 
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      value={filters.maxExperience !== undefined ? filters.maxExperience : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange({ 
                          maxExperience: value === '' || value === null ? undefined : Number(value) 
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] text-sm"
                    />
                  </div>
                </div>

                {/* Nationality Filter */}
                <div className="relative nationality-autocomplete">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  
                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder="Type to search nationalities..."
                    value={nationalityInput}
                    onChange={(e) => {
                      setNationalityInput(e.target.value);
                      setShowNationalityDropdown(true);
                    }}
                    onFocus={() => setShowNationalityDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowNationalityDropdown(false);
                        setNationalityInput('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] text-sm"
                  />

                  {/* Dropdown */}
                  {showNationalityDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {(() => {
                        const filteredNationalities = getFilteredNationalities(nationalityInput);
                        if (filteredNationalities.length === 0) {
                          return (
                            <div className="px-3 py-2 text-sm text-red-600">
                              The required nationality is not available
                            </div>
                          );
                        }
                        return filteredNationalities.map((nationality) => (
                          <button
                            key={nationality}
                            onClick={() => addNationality(nationality)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
                            disabled={(filters.nationality || []).includes(nationality)}
                          >
                            <span className={(filters.nationality || []).includes(nationality) ? 'text-gray-400' : 'text-gray-900'}>
                              {nationality}
                              {(filters.nationality || []).includes(nationality) && ' ✓'}
                            </span>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Field of Expertise Filter */}
                <div className="relative field-autocomplete">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Expertise</label>
                  
                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder="Type to search fields of expertise..."
                    value={fieldInput}
                    onChange={(e) => {
                      setFieldInput(e.target.value);
                      setShowFieldDropdown(true);
                    }}
                    onFocus={() => setShowFieldDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowFieldDropdown(false);
                        setFieldInput('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] text-sm"
                  />

                  {/* Dropdown */}
                  {showFieldDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {(() => {
                        const filteredFields = getFilteredFields(fieldInput);
                        if (filteredFields.length === 0) {
                          return (
                            <div className="px-3 py-2 text-sm text-red-600">
                              The required field is not available
                            </div>
                          );
                        }
                        return filteredFields.map((field) => (
                          <button
                            key={field}
                            onClick={() => addField(field)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
                            disabled={(filters.fieldOfExpertise || []).includes(field)}
                          >
                            <span className={(filters.fieldOfExpertise || []).includes(field) ? 'text-gray-400' : 'text-gray-900'}>
                              {field}
                              {(filters.fieldOfExpertise || []).includes(field) && ' ✓'}
                            </span>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Search Panel */}
          {showAdvancedSearch && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Search</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Advanced Name Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name Search</label>
                  <input
                    type="text"
                    placeholder="Search by full name..."
                    value={filters.name || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({ name: value === '' ? undefined : value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] text-sm"
                  />
                </div>

                {/* Email Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Search by email..."
                    value={filters.email || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({ email: value === '' ? undefined : value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.name && filters.name !== searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Name: "{filters.name}"
                      <button
                        onClick={() => handleFilterChange({ name: undefined })}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.minExperience !== undefined || filters.maxExperience !== undefined) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Experience: {filters.minExperience || 0}-{filters.maxExperience || '∞'} years
                      <button
                        onClick={() => handleFilterChange({ minExperience: undefined, maxExperience: undefined })}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.nationality && filters.nationality.length > 0 && (
                    <>
                      {filters.nationality.map((nationality) => (
                        <span key={`nationality-${nationality}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Nationality: {nationality}
                          <button
                            onClick={() => removeNationality(nationality)}
                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </>
                  )}
                  {filters.fieldOfExpertise && filters.fieldOfExpertise.length > 0 && (
                    <>
                      {filters.fieldOfExpertise.map((field) => (
                        <span key={`field-${field}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Field: {field}
                          <button
                            onClick={() => removeField(field)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </>
                  )}
                  {filters.email && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Email: "{filters.email}"
                      <button
                        onClick={() => handleFilterChange({ email: undefined })}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {totalCount} result{totalCount !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Talents Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Talents ({totalCount})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading talents...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircleIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No talents found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fields
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {profile.profile_picture_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={profile.profile_picture_url}
                                  alt="Profile"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <UserCircleIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {profile.first_name} {profile.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {profile.date_of_birth && (
                                  <span>{calculateAge(profile.date_of_birth)} years old</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{profile.user?.email}</div>
                          <div className="text-sm text-gray-500">{profile.user?.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {profile.years_of_experience || 0} years
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {profile.nationality || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {profile.fields_of_experience?.slice(0, 2).map((field, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#556B2F] bg-opacity-10 text-[#556B2F]"
                              >
                                {field}
                              </span>
                            ))}
                            {profile.fields_of_experience?.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{profile.fields_of_experience.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(profile.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openProfileModal(profile)}
                            className="text-[#556B2F] hover:text-[#556B2F]/80 flex items-center gap-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-[#556B2F] text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Profile Details Modal */}
      {showModal && selectedProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Talent Profile Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  {selectedProfile.profile_picture_url ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={selectedProfile.profile_picture_url}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserCircleIcon className="h-10 w-10 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedProfile.first_name} {selectedProfile.last_name}
                    </h4>
                    <p className="text-gray-600">{selectedProfile.user?.email}</p>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProfile.date_of_birth 
                        ? `${calculateAge(selectedProfile.date_of_birth)} years old`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nationality</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProfile.nationality || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProfile.years_of_experience || 0} years
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedProfile.created_at)}
                    </p>
                  </div>
                </div>

                {/* Fields of Experience */}
                {selectedProfile.fields_of_experience && selectedProfile.fields_of_experience.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fields of Experience</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.fields_of_experience.map((field, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#556B2F] bg-opacity-10 text-[#556B2F] border border-[#556B2F] border-opacity-20"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Me */}
                {selectedProfile.about_me && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedProfile.about_me}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 