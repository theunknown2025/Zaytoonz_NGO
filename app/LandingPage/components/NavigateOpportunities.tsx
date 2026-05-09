'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BriefcaseIcon, 
  BanknotesIcon, 
  AcademicCapIcon, 
  MapPinIcon, 
  ClockIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { type Opportunity } from '@/app/lib/opportunities';
import OpportunityDescriptionRich from '@/app/seeker/opportunities/[id]/OpportunityDescriptionRich';

interface NavigateOpportunitiesProps {
  opportunity: Opportunity;
}

export default function NavigateOpportunities({ opportunity }: NavigateOpportunitiesProps) {
  const router = useRouter();
  const [showSignupModal, setShowSignupModal] = useState(false);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'job': return <BriefcaseIcon className="w-6 h-6" />;
      case 'funding': return <BanknotesIcon className="w-6 h-6" />;
      case 'training': return <AcademicCapIcon className="w-6 h-6" />;
      default: return <BriefcaseIcon className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-olive-50 text-olive-700 border-olive-200';
      case 'funding': return 'bg-green-50 text-green-700 border-green-200';
      case 'training': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'expired', text: 'Expired', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (diffDays <= 3) {
      return { type: 'urgent', text: `${diffDays} days left`, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else if (diffDays <= 7) {
      return { type: 'soon', text: `${diffDays} days left`, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    } else {
      return { type: 'normal', text: `${diffDays} days left`, color: 'text-green-600 bg-green-50 border-green-200' };
    }
  };

  const handleApplyClick = () => {
    setShowSignupModal(true);
  };

  const handleSignupRedirect = () => {
    router.push('/auth/signup');
  };

  const categoryIcon = getCategoryIcon(opportunity.category);
  const categoryColor = getCategoryColor(opportunity.category);
  const deadlineStatus = getDeadlineStatus(opportunity.deadline);

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-olive-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-olive-700 hover:text-olive-600 transition-colors font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center">
              <img src="/image.png" alt="Zaytoonz" className="h-8 w-auto" />
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Opportunity Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-olive-100">
          {/* Category and Status */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${categoryColor}`}>
              {categoryIcon}
              <span className="capitalize">{opportunity.category}</span>
            </div>
            
            {deadlineStatus && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${deadlineStatus.color}`}>
                <CalendarDaysIcon className="w-4 h-4" />
                {deadlineStatus.text}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-olive-800 mb-6">
            {opportunity.title}
          </h1>

          {/* Organization */}
          <div className="flex items-center gap-4 mb-8">
            {opportunity.organizationProfile?.profileImage ? (
              <img 
                src={opportunity.organizationProfile.profileImage} 
                alt={opportunity.organization}
                className="w-16 h-16 rounded-full object-cover border-2 border-olive-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center border-2 border-olive-200">
                <BuildingOfficeIcon className="w-8 h-8 text-olive-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-olive-800">{opportunity.organization || 'Unknown Organization'}</h2>
              <p className="text-olive-600">Posted {opportunity.posted}</p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {opportunity.location && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-olive-100 rounded-lg">
                  <MapPinIcon className="w-5 h-5 text-olive-600" />
                </div>
                <div>
                  <p className="text-sm text-olive-500">Location</p>
                  <p className="font-medium text-olive-800">{opportunity.location}</p>
                </div>
              </div>
            )}

            {opportunity.compensation && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-olive-100 rounded-lg">
                  <BanknotesIcon className="w-5 h-5 text-olive-600" />
                </div>
                <div>
                  <p className="text-sm text-olive-500">Compensation</p>
                  <p className="font-medium text-olive-800">{opportunity.compensation}</p>
                </div>
              </div>
            )}

            {opportunity.type && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-olive-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-olive-600" />
                </div>
                <div>
                  <p className="text-sm text-olive-500">Type</p>
                  <p className="font-medium text-olive-800">{opportunity.type}</p>
                </div>
              </div>
            )}

            {opportunity.deadline && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-olive-100 rounded-lg">
                  <CalendarDaysIcon className="w-5 h-5 text-olive-600" />
                </div>
                <div>
                  <p className="text-sm text-olive-500">Deadline</p>
                  <p className="font-medium text-olive-800">{opportunity.deadline}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-olive-100 min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <DocumentTextIcon className="w-6 h-6 text-olive-600" />
            <h2 className="text-2xl font-semibold text-olive-800">About This Opportunity</h2>
          </div>
          <div className="break-words overflow-x-hidden">
            <OpportunityDescriptionRich description={opportunity.description || ''} />
          </div>
        </div>

        {/* Apply CTA */}
        <div className="bg-olive-gradient rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl mb-8 text-olive-100 max-w-2xl mx-auto">
            Join Zaytoonz and apply for this opportunity with {opportunity.organization || 'this organization'}. 
            Create your free account to start your journey towards meaningful work.
          </p>
          
          <button
            onClick={handleApplyClick}
            className="bg-white text-olive-700 px-10 py-4 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Apply to This Opportunity
          </button>
          
          <p className="text-sm text-olive-200 mt-6">
            ✓ Free account • ✓ Quick registration • ✓ Instant access
          </p>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-olive-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-olive-800 mb-4">
                Create Your Account
              </h3>
              
              <p className="text-olive-600 mb-8 leading-relaxed">
                To apply for "<span className="font-semibold">{opportunity.title}</span>" at {opportunity.organization || 'this organization'}, 
                you'll need to create a free Zaytoonz account. This takes less than 2 minutes and gives you access to all opportunities.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={handleSignupRedirect}
                  className="w-full bg-olive-gradient text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Create Free Account
                </button>
                
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-6">
                Already have an account? <a href="/auth/signin" className="text-olive-600 hover:text-olive-700 font-medium">Sign in here</a>
              </p>
            </div>
            
            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 