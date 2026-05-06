'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  GraduationCap,
  MapPin,
  Clock,
  ChevronRight,
  Calendar,
  Globe,
  Building,
  ChevronLeft
} from 'lucide-react';
import type { LanguageCode } from '../translations';

interface Opportunity {
  id: string;
  title: string;
  opportunity_type: 'job' | 'funding' | 'training';
  created_at: string;
  description_title?: string;
  description: string;
  location: string;
  hours: string;
  status: string;
  source?: 'ngo' | 'scraped' | 'extracted' | 'saved';
  source_url?: string;
  company?: string;
}

interface RecentOpportunitiesProps {
  lang: LanguageCode;
  translations: {
    latestTitle: string;
    jobs: string;
    funding: string;
    training: string;
    viewOpportunity: string;
    viewDetails: string;
    posted: string;
    external: string;
    partner: string;
    noAvailable: string;
    checkBack: string;
    exploreAll: string;
  };
}

const RecentOpportunities: React.FC<RecentOpportunitiesProps> = ({ lang, translations }) => {
  const [activeTab, setActiveTab] = useState<'job' | 'funding' | 'training'>('job');
  const [opportunities, setOpportunities] = useState<{
    job: Opportunity[];
    funding: Opportunity[];
    training: Opportunity[];
  }>({
    job: [],
    funding: [],
    training: []
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    // Reset slide when tab changes
    setCurrentSlide(0);
  }, [activeTab]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/opportunities/recent');
      if (!response.ok) {
        throw new Error('Failed to load opportunities');
      }

      const allOpportunities: Opportunity[] = await response.json();

      const grouped = {
        job: allOpportunities.filter((opp) => opp.opportunity_type === 'job').slice(0, 5),
        funding: allOpportunities.filter((opp) => opp.opportunity_type === 'funding').slice(0, 5),
        training: allOpportunities.filter((opp) => opp.opportunity_type === 'training').slice(0, 5),
      };

      setOpportunities(grouped);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities({ job: [], funding: [], training: [] });
    } finally {
      setLoading(false);
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-5 w-5" />;
      case 'funding':
        return <DollarSign className="h-5 w-5" />;
      case 'training':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    const plain = html.replace(/<[^>]*>/g, '');
    return plain.length > 150 ? `${plain.substring(0, 150)}...` : plain;
  };

  const getTabColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'from-olive-500 to-olive-600';
      case 'funding':
        return 'from-olive-600 to-green-600';
      case 'training':
        return 'from-green-500 to-green-600';
      default:
        return 'from-olive-500 to-olive-600';
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === 'scraped' || source === 'extracted') {
      return (
        <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          <Globe className="h-3 w-3" />
          <span>{translations.external}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
        <Building className="h-3 w-3" />
        <span>{translations.partner}</span>
      </div>
    );
  };

  const nextSlide = () => {
    const maxSlides = Math.max(0, opportunities[activeTab].length - 3);
    setCurrentSlide(prev => (prev >= maxSlides ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxSlides = Math.max(0, opportunities[activeTab].length - 3);
    setCurrentSlide(prev => (prev <= 0 ? maxSlides : prev - 1));
  };

  const canNavigate = opportunities[activeTab].length > 3;
  
  // Calculate the transform based on card width percentage
  const cardWidthPercent = 100 / 3; // Each card takes 1/3 of the container
  const slideTransform = currentSlide * cardWidthPercent;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex justify-center mb-12 w-full">
        <div className="bg-white rounded-xl p-2 shadow-lg border border-olive-200 flex flex-row items-center gap-2 w-full">
          {(['job', 'training', 'funding'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap flex-1 ${
                activeTab === type
                  ? 'bg-olive-gradient text-white shadow-md'
                  : 'text-olive-600 hover:text-olive-700 hover:bg-olive-50'
              }`}
            >
              {getTabIcon(type)}
              <span className="capitalize">
                {type === 'job' ? translations.jobs : 
                 type === 'funding' ? translations.funding : 
                 translations.training}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === type ? 'bg-white/20 text-white' : 'bg-olive-100 text-olive-700'
              }`}>
                {opportunities[type].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative max-w-full">
        {/* Navigation Buttons */}
        {canNavigate && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-olive-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-olive-600" />
            </button>
          </>
        )}

        {/* Opportunities Slider */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out gap-6"
            style={{ 
              transform: `translateX(-${slideTransform}%)`,
              width: '100%'
            }}
          >
            {opportunities[activeTab].map((opportunity) => (
              <div
                key={opportunity.id}
                className="flex-shrink-0 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-olive-100 overflow-hidden"
                style={{ 
                  width: 'calc(33.333% - 1rem)',
                  minWidth: '280px'
                }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-olive-gradient w-12 h-12 rounded-lg flex items-center justify-center text-white">
                      {getTabIcon(activeTab)}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="bg-olive-100 text-olive-700 px-3 py-1 rounded-full text-sm font-medium">
                        {opportunity.opportunity_type}
                      </span>
                      {getSourceBadge(opportunity.source || 'ngo')}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
                    {opportunity.description_title || opportunity.title}
                  </h3>

                  {/* Company (for scraped opportunities) */}
                  {opportunity.company && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Building className="h-4 w-4 mr-2" />
                      <span className="truncate">{opportunity.company}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-4">
                    {stripHtml(opportunity.description)}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {opportunity.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    
                    {opportunity.hours && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{opportunity.hours}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{translations.posted} {formatDate(opportunity.created_at)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {opportunity.source === 'scraped' &&
                  opportunity.source_url &&
                  /^https?:\/\//i.test(opportunity.source_url) ? (
                    <a
                      href={opportunity.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <span>{translations.viewOpportunity}</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <a
                      href={`/seeker/opportunities/${opportunity.id}`}
                      className="w-full bg-gradient-to-r from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <span>
                        {opportunity.source === 'ngo'
                          ? translations.viewDetails
                          : translations.viewOpportunity}
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        {canNavigate && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.max(1, opportunities[activeTab].length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-olive-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {opportunities[activeTab].length === 0 && (
        <div className="text-center py-16">
          <div className="bg-olive-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
            {getTabIcon(activeTab)}
          </div>
          <h3 className="text-xl font-semibold text-olive-700 mb-2">
            {translations.noAvailable.replace('{type}', activeTab)}
          </h3>
          <p className="text-olive-600">
            {translations.checkBack.replace('{type}', activeTab)}
          </p>
        </div>
      )}

      {/* Explore All Opportunities Button */}
      {opportunities[activeTab].length > 0 && (
        <div className="flex justify-center mt-12">
          <a
            href="/seeker/opportunities"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <span>{translations.exploreAll}</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentOpportunities; 