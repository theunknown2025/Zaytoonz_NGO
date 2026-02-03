"use client";

import React from 'react';
import Link from 'next/link';
import { 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  AcademicCapIcon,
  GlobeAltIcon,
  ChartBarIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

export default function ExternalOpportunitiesPage() {
  const opportunityTypes = [
    {
      type: 'jobs',
      title: 'Jobs',
      description: 'View and manage scraped job opportunities from external websites',
      icon: BriefcaseIcon,
      color: 'from-blue-500 to-blue-600',
      path: '/admin/ExternalOpportunities/Jobs'
    },
    {
      type: 'funding',
      title: 'Funding',
      description: 'Browse funding opportunities and grants from external sources',
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-green-600',
      path: '/admin/ExternalOpportunities/Funding'
    },
    {
      type: 'training',
      title: 'Training',
      description: 'Discover training programs and educational opportunities',
      icon: AcademicCapIcon,
      color: 'from-purple-500 to-purple-600',
      path: '/admin/ExternalOpportunities/Training'
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
              <p className="text-gray-600">Manage scraped opportunities from external websites</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scraped</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-blue-600">-</p>
                </div>
                <BriefcaseIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Funding Opportunities</p>
                  <p className="text-2xl font-bold text-green-600">-</p>
                </div>
                <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Training Programs</p>
                  <p className="text-2xl font-bold text-purple-600">-</p>
                </div>
                <AcademicCapIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#556B2F] transition-colors">
                      {opportunity.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {opportunity.description}
                    </p>
                    <div className="mt-4 flex items-center text-[#556B2F] text-sm font-medium">
                      <span>View {opportunity.title}</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          
          {/* Manual Creation Card */}
          <Link
            href="/admin/ExternalOpportunities/Manual"
            className="group block"
          >
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-[#556B2F] hover:shadow-md hover:border-solid transition-all duration-200 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-[#556B2F] to-[#6B8E23] relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-4 left-4">
                  <PencilSquareIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#556B2F] transition-colors">
                  Manual Creation
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Create and manage opportunities manually with rich text editor
                </p>
                <div className="mt-4 flex items-center text-[#556B2F] text-sm font-medium">
                  <span>Create Manually</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/ExternalOpportunities/Manual/new"
                className="px-4 py-2 border border-transparent text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md font-medium rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Create Manual Opportunity</span>
              </Link>
              <Link
                href="/admin/ExternalOpportunities/Manual"
                className="px-4 py-2 border border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/10 font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>View Manual Opportunities</span>
              </Link>
              <Link
                href="/admin/ExternalOpportunities/Jobs"
                className="px-4 py-2 border border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/10 font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <BriefcaseIcon className="w-4 h-4" />
                <span>View All Jobs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 