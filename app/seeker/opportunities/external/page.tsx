"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  AcademicCapIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface OpportunityStats {
  jobs: number;
  funding: number;
  training: number;
  total: number;
}

interface RecentOpportunity {
  id: string;
  title: string;
  opportunity_type: string;
  company: string;
  location: string;
  source_url: string;
  scraped_at: string;
}

export default function ExternalOpportunitiesPage() {
  const [stats, setStats] = useState<OpportunityStats>({ jobs: 0, funding: 0, training: 0, total: 0 });
  const [recentOpportunities, setRecentOpportunities] = useState<RecentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOpportunities();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsRes, fundingRes, trainingRes] = await Promise.all([
        fetch('/api/admin/scraped-opportunities?type=job&status=active&limit=1'),
        fetch('/api/admin/scraped-opportunities?type=funding&status=active&limit=1'),
        fetch('/api/admin/scraped-opportunities?type=training&status=active&limit=1')
      ]);

      const [jobsData, fundingData, trainingData] = await Promise.all([
        jobsRes.json(),
        fundingRes.json(),
        trainingRes.json()
      ]);

      setStats({
        jobs: jobsData.total || 0,
        funding: fundingData.total || 0,
        training: trainingData.total || 0,
        total: (jobsData.total || 0) + (fundingData.total || 0) + (trainingData.total || 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentOpportunities = async () => {
    try {
      const response = await fetch('/api/admin/scraped-opportunities?status=active&limit=6');
      const data = await response.json();
      setRecentOpportunities(data.opportunities || []);
    } catch (error) {
      console.error('Error fetching recent opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const opportunityTypes = [
    {
      type: 'jobs',
      title: 'Job Opportunities',
      description: 'Browse job openings from various companies and organizations',
      icon: BriefcaseIcon,
      color: 'from-blue-500 to-blue-600',
      count: stats.jobs,
      path: '/seeker/opportunities/external/jobs'
    },
    {
      type: 'funding',
      title: 'Funding & Grants',
      description: 'Discover funding opportunities and grant programs',
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-green-600',
      count: stats.funding,
      path: '/seeker/opportunities/external/funding'
    },
    {
      type: 'training',
      title: 'Training Programs',
      description: 'Find educational and professional development opportunities',
      icon: AcademicCapIcon,
      color: 'from-purple-500 to-purple-600',
      count: stats.training,
      path: '/seeker/opportunities/external/training'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-lg">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">External Opportunities</h1>
              <p className="text-gray-600">Discover opportunities from top companies and organizations worldwide</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <GlobeAltIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Job Openings</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.jobs}</p>
                </div>
                <BriefcaseIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Funding Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.funding}</p>
                </div>
                <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Training Programs</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.training}</p>
                </div>
                <AcademicCapIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {opportunityTypes.map((opportunity) => {
            const IconComponent = opportunity.icon;
            return (
              <Link
                key={opportunity.type}
                href={opportunity.path}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className={`h-32 bg-gradient-to-br ${opportunity.color} relative`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute bottom-4 left-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm font-medium">{opportunity.count}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#556B2F] transition-colors">
                      {opportunity.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {opportunity.description}
                    </p>
                    <div className="flex items-center text-[#556B2F] text-sm font-medium">
                      <span>Browse {opportunity.title}</span>
                      <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Opportunities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Opportunities</h2>
            <Link
              href="/seeker/opportunities/external/jobs"
              className="text-[#556B2F] hover:text-[#6B8E23] text-sm font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No external opportunities available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                      {opportunity.title}
                    </h3>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2
                      ${opportunity.opportunity_type === 'job' ? 'bg-blue-100 text-blue-800' : 
                        opportunity.opportunity_type === 'funding' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'}
                    `}>
                      {opportunity.opportunity_type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {opportunity.company && (
                      <div className="flex items-center text-gray-600 text-xs">
                        <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                        <span className="truncate">{opportunity.company}</span>
                      </div>
                    )}
                    {opportunity.location && (
                      <div className="flex items-center text-gray-600 text-xs">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        <span className="truncate">{opportunity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 text-xs">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      <span>Added {formatDate(opportunity.scraped_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/seeker/opportunities/external/${opportunity.opportunity_type}s`}
                      className="text-[#556B2F] hover:text-[#6B8E23] text-xs font-medium"
                    >
                      View Details
                    </Link>
                    <a
                      href={opportunity.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 