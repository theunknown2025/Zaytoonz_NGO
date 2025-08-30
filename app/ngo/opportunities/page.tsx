'use client';

import Link from 'next/link';
import { 
  PlusIcon,
  ListBulletIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function OpportunitiesPage() {
  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <DocumentPlusIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">
            Opportunities Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Overview and quick access to your opportunities management
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Opportunity */}
          <Link 
            href="/ngo/opportunities/new"
            className="group relative bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-[#556B2F] hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full group-hover:shadow-lg transition-shadow">
                <PlusIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Opportunity</h2>
              <p className="text-gray-600 mb-4">
                Set up a new volunteer opportunity with our step-by-step guided process
              </p>
              <div className="inline-flex items-center text-[#556B2F] font-medium">
                Get Started
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* View All Opportunities */}
          <Link 
            href="/ngo/opportunities/liste"
            className="group relative bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-[#556B2F] hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full group-hover:shadow-lg transition-shadow">
                <ListBulletIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">My Opportunities</h2>
              <p className="text-gray-600 mb-4">
                Browse, search, and manage all your existing volunteer opportunities
              </p>
              <div className="inline-flex items-center text-[#556B2F] font-medium">
                View & Manage
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats (optional - could be implemented later) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-[#556B2F]" />
            Quick Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#556B2F]">-</div>
              <div className="text-sm text-gray-600">Total Opportunities</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#556B2F]">-</div>
              <div className="text-sm text-gray-600">Active Opportunities</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#556B2F]">-</div>
              <div className="text-sm text-gray-600">Applications</div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 rounded-xl p-6 border border-[#556B2F]/10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ngo/opportunities/new"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <DocumentPlusIcon className="w-4 h-4 mr-2" />
              Create Opportunity
            </Link>
            
            <Link
              href="/ngo/opportunities/liste"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
              My Opportunities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 