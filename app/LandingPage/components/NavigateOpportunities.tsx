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

  // Helper function to check if content contains HTML
  const containsHtml = (str: string) => {
    if (!str) return false;
    return /<[^>]*>/g.test(str);
  };

  // Helper function to sanitize HTML content (basic sanitization)
  const sanitizeHtml = (html: string) => {
    if (!html) return '';
    
    // Remove potentially dangerous elements and attributes
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');
    
    // Convert Supabase storage URLs to proper HTML elements
    sanitized = sanitized.replace(
      /(https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/opportunity-description-images\/[^\s<>"']+)/g,
      '<div class="my-4"><img src="$1" alt="Opportunity image" class="max-w-full h-auto rounded-lg shadow-sm border border-gray-200" style="max-height: 400px;" /></div>'
    );
    
    sanitized = sanitized.replace(
      /(https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/opportunity-description-documents\/[^\s<>"']+)/g,
      '<div class="my-4"><a href="$1" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Download Document</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div>'
    );
    
    return sanitized;
  };

  const parseDescription = (description: string) => {
    if (!description) return [];
    
    const lines = description.split('\n');
    const sections: Array<{ title?: string; content: string }> = [];
    let currentSection: { title?: string; content: string } = { content: '' };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      const titleMatch = trimmedLine.match(/^\*\*(.+?)\*\*$/);
      
      if (titleMatch) {
        if (currentSection.content.trim() || currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = { title: titleMatch[1], content: '' };
      } else if (trimmedLine) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    }
    
    if (currentSection.content.trim() || currentSection.title) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const renderFileUrl = (url: string, fileName?: string) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isDocument = /\.(pdf|doc|docx|txt)$/i.test(url);
    
    if (isImage) {
      return (
        <div className="my-4">
          <img 
            src={url} 
            alt={fileName || 'Opportunity image'} 
            className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
            style={{ maxHeight: '400px' }}
            onError={(e) => {
              console.error('Error loading image:', url);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {fileName && (
            <p className="text-sm text-gray-600 mt-2">{fileName}</p>
          )}
        </div>
      );
    } else if (isDocument) {
      return (
        <div className="my-4">
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span>{fileName || 'Download Document'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      );
    }
    
    return null;
  };

  const FormattedDescription = ({ description }: { description: string }) => {
    // Check if the description contains HTML
    if (containsHtml(description)) {
      // If it contains HTML, render it directly with dangerouslySetInnerHTML
      const sanitizedHtml = sanitizeHtml(description);
      return (
        <div 
          className="text-gray-700 leading-relaxed prose prose-sm max-w-none 
                     prose-headings:text-gray-900 prose-headings:font-semibold 
                     prose-p:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed
                     prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6
                     prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mb-4
                     prose-h3:text-lg prose-h3:mb-3
                     prose-h4:text-base prose-h4:mb-2
                     prose-ul:mb-4 prose-ul:pl-6 prose-li:mb-1
                     prose-ol:mb-4 prose-ol:pl-6
                     prose-strong:font-semibold prose-strong:text-gray-900
                     prose-em:italic prose-em:text-gray-700
                     prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700
                     prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
                     prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                     prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                     [&>div]:mb-4 [&>div>h2]:text-xl [&>div>h2]:font-semibold [&>div>h2]:text-gray-900 [&>div>h2]:mb-3
                     [&>div>p]:mb-3 [&>div>p]:text-gray-700 [&>div>p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    } else {
      // If it doesn't contain HTML, use the original markdown-style parsing
      const sections = parseDescription(description);
      
      return (
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="space-y-3">
              {section.title && (
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  {section.title}
                </h3>
              )}
              {section.content && (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                  {/* Check if content contains file URLs and render them appropriately */}
                  {section.content.split('\n').map((line, lineIndex) => {
                    const trimmedLine = line.trim();
                    
                    // Check if line contains a Supabase storage URL
                    const supabaseUrlMatch = trimmedLine.match(/https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s]+/);
                    
                    if (supabaseUrlMatch) {
                      const url = supabaseUrlMatch[0];
                      // Extract filename from the URL or use the remaining text as filename
                      const urlParts = url.split('/');
                      const fileName = urlParts[urlParts.length - 1] || trimmedLine.replace(url, '').trim();
                      
                      return (
                        <div key={lineIndex}>
                          {renderFileUrl(url, fileName)}
                        </div>
                      );
                    }
                    
                    return (
                      <div key={lineIndex}>
                        {trimmedLine}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      );
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
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-olive-100">
          <div className="flex items-center gap-3 mb-6">
            <DocumentTextIcon className="w-6 h-6 text-olive-600" />
            <h2 className="text-2xl font-semibold text-olive-800">About This Opportunity</h2>
          </div>
          <FormattedDescription description={opportunity.description || ''} />
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