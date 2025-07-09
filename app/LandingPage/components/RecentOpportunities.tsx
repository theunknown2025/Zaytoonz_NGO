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
  source?: 'saved' | 'scraped';
  source_url?: string;
  link?: string;
  company?: string;
}

const RecentOpportunities: React.FC = () => {
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
      // Fetch both saved and scraped opportunities
      const [savedResponse, scrapedResponse] = await Promise.all([
        fetch('/api/opportunities/recent'),
        fetch('/api/admin/scraped-opportunities?status=active&limit=15')
      ]);

      let savedOpportunities: Opportunity[] = [];
      let scrapedOpportunities: Opportunity[] = [];

      // Handle saved opportunities
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        savedOpportunities = savedData.map((opp: any) => ({
          ...opp,
          source: 'saved' as const
        }));
      }

      // Handle scraped opportunities
      if (scrapedResponse.ok) {
        const scrapedData = await scrapedResponse.json();
        scrapedOpportunities = (scrapedData.opportunities || []).map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          opportunity_type: opp.opportunity_type,
          created_at: opp.scraped_at,
          description: opp.description || '',
          location: opp.location || '',
          hours: opp.hours || '',
          status: opp.status,
          source: 'scraped' as const,
          source_url: opp.source_url,
          link: opp.metadata?.link || opp.source_url, // Use opportunity link from metadata or fallback to source
          company: opp.company
        }));
      }

      // Combine and group opportunities
      const allOpportunities = [...savedOpportunities, ...scrapedOpportunities];
      
      // Sort by created_at/scraped_at date (most recent first)
      allOpportunities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const grouped = {
        job: allOpportunities.filter(opp => opp.opportunity_type === 'job').slice(0, 5),
        funding: allOpportunities.filter(opp => opp.opportunity_type === 'funding').slice(0, 5),
        training: allOpportunities.filter(opp => opp.opportunity_type === 'training').slice(0, 5)
      };

      setOpportunities(grouped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      
      // Fallback to mock data for development
      const mockData: Opportunity[] = [
        // Jobs
        {
          id: '1',
          title: 'Senior Program Manager',
          opportunity_type: 'job',
          created_at: '2025-01-15T10:00:00Z',
          description_title: 'Lead Development Programs',
          description: 'Join our team to lead innovative development programs across Africa. We are looking for an experienced program manager with strong leadership skills.',
          location: 'Nairobi, Kenya',
          hours: 'Full-time',
          status: 'published',
          source: 'saved'
        },
        {
          id: '4',
          title: 'Data Analyst Position',
          opportunity_type: 'job',
          created_at: '2025-01-12T08:00:00Z',
          description_title: 'Analyze Impact Data',
          description: 'We are seeking a data analyst to help us measure and improve our program effectiveness through comprehensive data analysis.',
          location: 'Remote',
          hours: 'Part-time',
          status: 'published',
          source: 'scraped',
          source_url: 'https://example.com/job/data-analyst',
          company: 'TechForGood Inc'
        },
        {
          id: '6',
          title: 'Communications Specialist',
          opportunity_type: 'job',
          created_at: '2025-01-11T14:00:00Z',
          description_title: 'Drive Communication Strategy',
          description: 'Looking for a creative communications specialist to develop and execute our outreach and engagement strategies.',
          location: 'London, UK',
          hours: 'Full-time',
          status: 'published',
          source: 'saved'
        },
        {
          id: '7',
          title: 'Field Coordinator',
          opportunity_type: 'job',
          created_at: '2025-01-10T12:00:00Z',
          description_title: 'Coordinate Field Operations',
          description: 'Coordinate field operations and manage local partnerships in rural communities.',
          location: 'Bangladesh',
          hours: 'Full-time',
          status: 'published',
          source: 'scraped',
          source_url: 'https://example.com/job/field-coordinator',
          company: 'Global Aid Network'
        },
        {
          id: '8',
          title: 'Project Manager',
          opportunity_type: 'job',
          created_at: '2025-01-09T10:00:00Z',
          description_title: 'Manage Development Projects',
          description: 'Lead cross-functional teams to deliver impactful development projects on time and within budget.',
          location: 'São Paulo, Brazil',
          hours: 'Full-time',
          status: 'published',
          source: 'saved'
        },
        // Funding
        {
          id: '2',
          title: 'Climate Action Grant',
          opportunity_type: 'funding',
          created_at: '2025-01-14T15:30:00Z',
          description_title: 'Support Climate Initiatives',
          description: 'Funding opportunity for innovative climate action projects. Up to $50,000 available for qualifying organizations.',
          location: 'Global',
          hours: '',
          status: 'published',
          source: 'saved'
        },
        {
          id: '5',
          title: 'Youth Empowerment Grant',
          opportunity_type: 'funding',
          created_at: '2025-01-11T14:00:00Z',
          description_title: 'Empower Young Leaders',
          description: 'Funding available for projects focused on youth leadership development and community engagement initiatives.',
          location: 'Africa',
          hours: '',
          status: 'published',
          source: 'scraped',
          source_url: 'https://example.com/grant/youth-empowerment',
          company: 'Global Youth Foundation'
        },
        {
          id: '9',
          title: 'Education Innovation Fund',
          opportunity_type: 'funding',
          created_at: '2025-01-10T11:00:00Z',
          description_title: 'Innovation in Education',
          description: 'Supporting innovative educational programs that improve learning outcomes for underserved communities.',
          location: 'Asia-Pacific',
          hours: '',
          status: 'published',
          source: 'saved'
        },
        {
          id: '10',
          title: 'Community Health Grant',
          opportunity_type: 'funding',
          created_at: '2025-01-09T13:00:00Z',
          description_title: 'Strengthen Health Systems',
          description: 'Grants available for community-based health initiatives and health system strengthening projects.',
          location: 'Sub-Saharan Africa',
          hours: '',
          status: 'published',
          source: 'scraped',
          source_url: 'https://example.com/grant/community-health',
          company: 'Health Foundation'
        },
        {
          id: '11',
          title: 'Women Empowerment Fund',
          opportunity_type: 'funding',
          created_at: '2025-01-08T16:00:00Z',
          description_title: 'Empower Women Leaders',
          description: 'Financial support for programs promoting women\'s economic empowerment and leadership development.',
          location: 'Latin America',
          hours: '',
          status: 'published',
          source: 'saved'
        },
        // Training
        {
          id: '3',
          title: 'Digital Skills Workshop',
          opportunity_type: 'training',
          created_at: '2025-01-13T09:15:00Z',
          description_title: 'Build Digital Capacity',
          description: 'Comprehensive training program on digital skills for NGO professionals. Includes social media, data analysis, and online fundraising.',
          location: 'Online',
          hours: '20 hours',
          status: 'published',
          source: 'saved'
        },
        {
          id: '12',
          title: 'Leadership Development Program',
          opportunity_type: 'training',
          created_at: '2025-01-12T14:00:00Z',
          description_title: 'Develop Leadership Skills',
          description: 'Intensive leadership development program for emerging leaders in the nonprofit sector.',
          location: 'New York, USA',
          hours: '40 hours',
          status: 'published',
          source: 'scraped',
          source_url: 'https://example.com/training/leadership',
          company: 'Leadership Institute'
        },
        {
          id: '13',
          title: 'Financial Management Course',
          opportunity_type: 'training',
          created_at: '2025-01-11T10:00:00Z',
          description_title: 'Master Financial Management',
          description: 'Learn essential financial management skills for nonprofit organizations and development projects.',
          location: 'Geneva, Switzerland',
          hours: '30 hours',
          status: 'published',
          source: 'saved'
        },
        {
          id: '14',
          title: 'Project Evaluation Training',
          opportunity_type: 'training',
          created_at: '2025-01-10T15:00:00Z',
          description_title: 'Learn Evaluation Methods',
          description: 'Training on project evaluation methodologies and impact measurement for development practitioners.',
          location: 'Online',
          hours: '25 hours',
          status: 'published',
          source: 'scraped',
          source_url: 'https://example.com/training/evaluation',
          company: 'Evaluation Network'
        },
        {
          id: '15',
          title: 'Fundraising Masterclass',
          opportunity_type: 'training',
          created_at: '2025-01-09T12:00:00Z',
          description_title: 'Master Fundraising Techniques',
          description: 'Comprehensive training on modern fundraising strategies and donor relationship management.',
          location: 'London, UK',
          hours: '35 hours',
          status: 'published',
          source: 'saved'
        }
      ];

      // Group by type
      const grouped = {
        job: mockData.filter(opp => opp.opportunity_type === 'job').slice(0, 5),
        funding: mockData.filter(opp => opp.opportunity_type === 'funding').slice(0, 5),
        training: mockData.filter(opp => opp.opportunity_type === 'training').slice(0, 5)
      };

      setOpportunities(grouped);
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
    return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
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
    if (source === 'scraped') {
      return (
        <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          <Globe className="h-3 w-3" />
          <span>External</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
        <Building className="h-3 w-3" />
        <span>Partner</span>
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
      <div className="flex justify-center mb-12">
        <div className="bg-white rounded-xl p-2 shadow-lg border border-olive-200 flex flex-row items-center gap-2">
          {(['job', 'funding', 'training'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === type
                  ? 'bg-olive-gradient text-white shadow-md'
                  : 'text-olive-600 hover:text-olive-700 hover:bg-olive-50'
              }`}
            >
              {getTabIcon(type)}
              <span className="capitalize">{type}s</span>
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
                      {getSourceBadge(opportunity.source || 'saved')}
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
                      <span>Posted {formatDate(opportunity.created_at)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {opportunity.source === 'scraped' ? (
                    <a 
                      href={opportunity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <span>Apply</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <a 
                      href={`/seeker/opportunities/${opportunity.id}`}
                      className="w-full bg-gradient-to-r from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <span>Apply</span>
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
            No {activeTab}s available
          </h3>
          <p className="text-olive-600">
            Check back soon for new {activeTab} opportunities.
          </p>
        </div>
      )}

      {/* View All Links */}
      {opportunities[activeTab].length > 0 && (
        <div className="flex justify-center space-x-8 mt-12">
          <a
            href={`/seeker/opportunities?type=${activeTab}`}
            className="inline-flex items-center space-x-2 text-olive-600 hover:text-olive-700 font-semibold transition-colors"
          >
            <Building className="h-4 w-4" />
            <span>View all partner {activeTab}s</span>
            <ChevronRight className="h-4 w-4" />
          </a>
          <a
            href={`/seeker/opportunities/external/${activeTab}s`}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>View all external {activeTab}s</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentOpportunities; 