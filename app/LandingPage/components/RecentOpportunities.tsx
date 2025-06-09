'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  GraduationCap,
  MapPin,
  Clock,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  opportunity_type: 'job' | 'funding' | 'training';
  created_at: string;
  description_title: string;
  description: string;
  location: string;
  hours: string;
  status: string;
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

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities/recent');
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      
      const data = await response.json();
      
      // Group by type and limit to 5 each
      const grouped = {
        job: data.filter((opp: Opportunity) => opp.opportunity_type === 'job').slice(0, 5),
        funding: data.filter((opp: Opportunity) => opp.opportunity_type === 'funding').slice(0, 5),
        training: data.filter((opp: Opportunity) => opp.opportunity_type === 'training').slice(0, 5)
      };

      setOpportunities(grouped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      
      // Fallback to mock data for development
      const mockData: Opportunity[] = [
        {
          id: '1',
          title: 'Senior Program Manager',
          opportunity_type: 'job',
          created_at: '2025-01-15T10:00:00Z',
          description_title: 'Lead Development Programs',
          description: 'Join our team to lead innovative development programs across Africa. We are looking for an experienced program manager with strong leadership skills.',
          location: 'Nairobi, Kenya',
          hours: 'Full-time',
          status: 'published'
        },
        {
          id: '2',
          title: 'Climate Action Grant',
          opportunity_type: 'funding',
          created_at: '2025-01-14T15:30:00Z',
          description_title: 'Support Climate Initiatives',
          description: 'Funding opportunity for innovative climate action projects. Up to $50,000 available for qualifying organizations.',
          location: 'Global',
          hours: '',
          status: 'published'
        },
        {
          id: '3',
          title: 'Digital Skills Workshop',
          opportunity_type: 'training',
          created_at: '2025-01-13T09:15:00Z',
          description_title: 'Build Digital Capacity',
          description: 'Comprehensive training program on digital skills for NGO professionals. Includes social media, data analysis, and online fundraising.',
          location: 'Online',
          hours: '20 hours',
          status: 'published'
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

      {/* Opportunities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities[activeTab].map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-olive-100 overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-olive-gradient w-12 h-12 rounded-lg flex items-center justify-center text-white">
                  {getTabIcon(activeTab)}
                </div>
                <span className="bg-olive-100 text-olive-700 px-3 py-1 rounded-full text-sm font-medium">
                  {opportunity.opportunity_type}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                {opportunity.description_title || opportunity.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3">
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
              <a 
                href={`/seeker/opportunities/${opportunity.id}`}
                className="w-full bg-gradient-to-r from-olive-500 to-olive-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>View Details</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        ))}
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

      {/* View All Link */}
      {opportunities[activeTab].length > 0 && (
        <div className="text-center mt-12">
          <a
            href={`/seeker/opportunities?type=${activeTab}`}
            className="inline-flex items-center space-x-2 text-olive-600 hover:text-olive-700 font-semibold transition-colors"
          >
            <span>View all {activeTab}s</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentOpportunities; 