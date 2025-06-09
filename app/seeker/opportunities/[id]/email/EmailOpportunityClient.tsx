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
  HeartIcon,
  ShareIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { type Opportunity } from '@/app/lib/opportunities';

interface EmailOpportunityClientProps {
  opportunity: Opportunity;
}

export default function EmailOpportunityClient({ opportunity }: EmailOpportunityClientProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

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
      case 'job': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'funding': return 'bg-green-50 text-green-700 border-green-200';
      case 'training': return 'bg-purple-50 text-purple-700 border-purple-200';
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

  const FormattedDescription = ({ description }: { description: string }) => {
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
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  const copyToClipboard = async (text: string, type: 'email' | 'reference') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const generateEmailSubject = () => {
    return `Application for ${opportunity.title} - ${opportunity.organization}`;
  };

  const generateEmailBody = () => {
    const subject = generateEmailSubject();
    const referenceCodes = opportunity.referenceCodes?.join(', ') || '';
    
    return `Dear ${opportunity.organization} Team,

I am writing to express my interest in the ${opportunity.title} opportunity posted by your organization.

${referenceCodes ? `Reference Code(s): ${referenceCodes}` : ''}

[Please write your application letter here, including:]
- Your relevant experience and qualifications
- Why you are interested in this opportunity
- How you can contribute to the organization
- Any additional information requested in the job description

I have attached my resume/CV and any other required documents for your review.

Thank you for considering my application. I look forward to hearing from you soon.

Best regards,
[Your Name]
[Your Contact Information]`;
  };

  const categoryIcon = getCategoryIcon(opportunity.category);
  const categoryColor = getCategoryColor(opportunity.category);
  const deadlineStatus = getDeadlineStatus(opportunity.deadline);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Opportunities</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full font-medium">
                <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                Email Application
              </span>
              <button
                onClick={toggleSave}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isSaved 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                }`}
              >
                {isSaved ? (
                  <HeartSolidIcon className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Opportunity Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
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

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {opportunity.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            {opportunity.organizationProfile?.profileImage ? (
              <img 
                src={opportunity.organizationProfile.profileImage} 
                alt={opportunity.organization}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <BuildingOfficeIcon className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{opportunity.organization}</h2>
              <p className="text-gray-600">Posted {opportunity.posted}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {opportunity.location && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPinIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{opportunity.location}</p>
                </div>
              </div>
            )}

            {opportunity.compensation && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BanknotesIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Compensation</p>
                  <p className="font-medium text-gray-900">{opportunity.compensation}</p>
                </div>
              </div>
            )}

            {opportunity.type && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900">{opportunity.type}</p>
                </div>
              </div>
            )}

            {opportunity.deadline && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="font-medium text-gray-900">{opportunity.deadline}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Description</h2>
              </div>
              <FormattedDescription description={opportunity.description || ''} />
            </div>

            {/* Email Application Tips */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                Email Application Tips
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Use a professional email address and clear subject line</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Include all reference codes in your email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Attach your CV/resume and any required documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Write a compelling cover letter explaining your interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Follow up professionally if you don't hear back within the expected timeframe</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Email Application */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Email Application</h2>
              </div>

              {/* Contact Emails */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Contact Emails</h3>
                <div className="space-y-3">
                  {opportunity.contactEmails?.map((email, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Email {index + 1}</span>
                        <button
                          onClick={() => copyToClipboard(email, 'email')}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          {copiedEmail === email ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <ClipboardDocumentIcon className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-sm text-gray-900 font-mono bg-white rounded p-2 border">
                        {email}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <a
                          href={`mailto:${email}?subject=${encodeURIComponent(generateEmailSubject())}&body=${encodeURIComponent(generateEmailBody())}`}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center text-sm"
                        >
                          Open Email Client
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference Codes */}
              {opportunity.referenceCodes && opportunity.referenceCodes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Reference Codes</h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-700 mb-2 font-medium">Include these codes in your email:</p>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.referenceCodes.map((code, index) => (
                        <span 
                          key={index} 
                          className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-mono cursor-pointer hover:bg-green-200 transition-colors"
                          onClick={() => copyToClipboard(code, 'reference')}
                          title="Click to copy"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Email Template */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Email Template</h3>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {generateEmailSubject()}
                  </div>
                  <textarea
                    value={generateEmailBody()}
                    readOnly
                    className="w-full h-40 text-xs bg-white border rounded p-3 font-mono text-gray-700 resize-none"
                  />
                  <button
                    onClick={() => copyToClipboard(generateEmailBody(), 'email')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Copy Email Template
                  </button>
                </div>
              </div>

              {/* Quick Apply Button */}
              <button 
                onClick={() => {
                  const email = opportunity.contactEmails?.[0];
                  if (email) {
                    window.location.href = `mailto:${email}?subject=${encodeURIComponent(generateEmailSubject())}&body=${encodeURIComponent(generateEmailBody())}`;
                  }
                }}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
              >
                <PaperClipIcon className="w-5 h-5" />
                Apply Now via Email
              </button>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                This will open your default email client with pre-filled content
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 