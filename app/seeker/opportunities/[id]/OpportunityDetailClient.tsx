'use client';

import React, { useState, useEffect } from 'react';
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
  IdentificationIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { type Opportunity } from '@/app/lib/opportunities';
import { AuthService } from '@/app/lib/auth';
import { getCVs } from '@/app/seeker/tools/cv-maker/supabaseService';
import { toast, Toaster } from 'react-hot-toast';

interface OpportunityDetailClientProps {
  opportunity: Opportunity;
}

export default function OpportunityDetailClient({ opportunity }: OpportunityDetailClientProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // CV selection state
  const [savedCVs, setSavedCVs] = useState<any[]>([]);
  const [selectedCV, setSelectedCV] = useState<any>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);

  // Generate storage key for this specific opportunity
  const getStorageKey = () => `selectedCV_${opportunity.id}`;

  // Load persisted CV selection from localStorage
  const loadPersistedCV = async () => {
    try {
      const storageKey = getStorageKey();
      const persistedCV = localStorage.getItem(storageKey);
      if (persistedCV) {
        const cvData = JSON.parse(persistedCV);
        
        // Validate that the persisted CV still exists by checking against user's current CVs
        try {
          const { data: currentCVs, error } = await getCVs();
          if (error) {
            console.error('Error validating persisted CV:', error);
            setSelectedCV(cvData); // Still set it, validation failed
            return;
          }
          
          // Check if the persisted CV still exists in user's current CVs
          const cvExists = currentCVs?.find(cv => cv.id === cvData.id);
          
          if (cvExists) {
            // Update with fresh data from database in case CV was updated
            setSelectedCV(cvExists);
            // Update localStorage with fresh data
            localStorage.setItem(storageKey, JSON.stringify(cvExists));
            console.log(`✅ Loaded and validated persisted CV for opportunity ${opportunity.id}:`, cvExists.name);
            // Optional: Show a brief toast to indicate CV was auto-loaded
            setTimeout(() => {
              toast.success(`Your previously selected CV "${cvExists.name}" has been restored`, {
                duration: 3000,
                icon: '💾'
              });
            }, 1000);
          } else {
            // CV no longer exists, clear the persisted selection
            localStorage.removeItem(storageKey);
            console.log(`⚠️ Persisted CV no longer exists, cleared selection for opportunity ${opportunity.id}`);
          }
        } catch (validationError) {
          console.error('Error during CV validation:', validationError);
          // Fall back to using persisted data without validation
          setSelectedCV(cvData);
          console.log(`✅ Loaded persisted CV for opportunity ${opportunity.id}:`, cvData.name, '(validation skipped)');
        }
      } else {
        console.log(`ℹ️ No persisted CV found for opportunity ${opportunity.id}`);
      }
    } catch (error) {
      console.error('Error loading persisted CV:', error);
    }
  };

  // Save CV selection to localStorage
  const persistCVSelection = (cv: any) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(cv));
      console.log('Persisted CV selection:', cv.name);
    } catch (error) {
      console.error('Error persisting CV selection:', error);
    }
  };

  // Clear persisted CV selection
  const clearPersistedCV = () => {
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      console.log('Cleared persisted CV selection');
    } catch (error) {
      console.error('Error clearing persisted CV:', error);
    }
  };

  useEffect(() => {
    // Get current user on component mount
    const getCurrentUser = async () => {
      const { user: currentUser } = await AuthService.getUser();
      setUser(currentUser);
      
      // Check for existing application if user is logged in
      if (currentUser) {
        await checkExistingApplication(currentUser.id);
        // Load persisted CV selection after user is confirmed
        await loadPersistedCV();
      }
    };

    getCurrentUser();
  }, []);

  // Additional effect to load persisted CV when user becomes available
  useEffect(() => {
    if (user && !selectedCV) {
      loadPersistedCV();
    }
  }, [user]);

  const checkExistingApplication = async (userId: string) => {
    setCheckingApplication(true);
    try {
      const response = await fetch(`/api/opportunities/applications?seekerUserId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.applications) {
        // Check if user has already applied to this specific opportunity
        const existingApp = data.applications.find(
          (app: any) => app.opportunity_id === opportunity.id
        );
        
        if (existingApp) {
          setHasExistingApplication(true);
          setExistingApplication(existingApp);
        }
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    } finally {
      setCheckingApplication(false);
    }
  };

  // Load saved CVs from database
  const loadSavedCVs = async () => {
    setCvLoading(true);
    try {
      const { data, error } = await getCVs();
      if (error) {
        console.error('Error loading CVs:', error);
        toast.error('Failed to load saved CVs');
      } else if (data) {
        setSavedCVs(data);
        
        // Check if there's a persisted CV selection and update it with fresh data
        const storageKey = getStorageKey();
        const persistedCV = localStorage.getItem(storageKey);
        if (persistedCV && selectedCV) {
          const cvData = JSON.parse(persistedCV);
          const freshCV = data.find(cv => cv.id === cvData.id);
          if (freshCV && (freshCV.updated_at !== cvData.updated_at)) {
            // CV was updated, refresh the selection
            setSelectedCV(freshCV);
            localStorage.setItem(storageKey, JSON.stringify(freshCV));
            console.log('Updated persisted CV with fresh data:', freshCV.name);
          }
        }
      }
    } catch (err) {
      console.error('Error in CV fetch:', err);
      toast.error('Failed to load saved CVs');
    } finally {
      setCvLoading(false);
    }
  };

  // Handle CV selection
  const handleSelectCV = (cv: any) => {
    setSelectedCV(cv);
    persistCVSelection(cv); // Save to localStorage
    setShowCVModal(false);
    toast.success(`CV "${cv.name}" selected and saved for this opportunity`);
  };

  // Handle CV inclusion button click
  const handleIncludeCV = () => {
    if (!user) {
      toast.error('Please sign in to include a CV');
      return;
    }
    
    if (savedCVs.length === 0) {
      loadSavedCVs();
    }
    setShowCVModal(true);
  };

  // Handle CV removal
  const handleRemoveCV = () => {
    setSelectedCV(null);
    clearPersistedCV(); // Clear from localStorage
    toast.success('CV removed from application');
  };

  const handleEditApplication = () => {
    // Pre-fill form with existing application data
    if (existingApplication?.application_data) {
      setFormData(existingApplication.application_data);
    }
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData({});
    setSubmissionError(null);
  };

  const handleUpdateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSubmissionError(null);
    
    try {
      if (!user || !existingApplication) {
        throw new Error('User or application not found');
      }

      // Update the existing application
      const response = await fetch(`/api/opportunities/applications/${existingApplication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationData: formData,
          notes: `Application updated for ${opportunity.title}`
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application');
      }

      console.log('Application updated successfully:', result.application);
      
      // Update the existing application state
      setExistingApplication(result.application);
      setIsEditMode(false);
      setFormData({});
      
      // Show success message temporarily
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      
    } catch (error) {
      console.error('Error updating application:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteApplication = async () => {
    setIsDeleting(true);
    
    try {
      if (!existingApplication) {
        throw new Error('Application not found');
      }

      const response = await fetch(`/api/opportunities/applications/${existingApplication.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete application');
      }

      console.log('Application deleted successfully');
      
      // Reset application state
      setHasExistingApplication(false);
      setExistingApplication(null);
      setShowDeleteConfirm(false);
      setIsEditMode(false);
      setFormData({});
      
    } catch (error) {
      console.error('Error deleting application:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // Here you would typically save to database or local storage
  };

  // Form handling functions
  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!opportunity.applicationForm?.id) {
        throw new Error('No form ID found');
      }

      // Submit form data to the database
      const response = await fetch('/api/opportunities/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          seekerUserId: user.id,
          formId: opportunity.applicationForm.id,
          applicationData: formData,
          selectedCVId: selectedCV?.id || null,
          selectedCVName: selectedCV?.name || null,
          notes: `Application submitted for ${opportunity.title}${selectedCV ? ` with CV: "${selectedCV.name}"` : ''}`
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      console.log('Application submitted successfully:', result.application);
      setSubmitted(true);
      
      // Clear persisted CV selection after successful submission
      clearPersistedCV();
      
      // Optional: Clear form data after successful submission
      setFormData({});
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryIcon = getCategoryIcon(opportunity.category);
  const categoryColor = getCategoryColor(opportunity.category);
  const deadlineStatus = getDeadlineStatus(opportunity.deadline);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Opportunities</span>
            </button>
            <div className="flex items-center gap-3">
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
              <button className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Opportunity Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {opportunity.title}
          </h1>

          {/* Organization */}
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

          {/* Quick Info Grid - Only show non-criteria information */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {opportunity.compensation && opportunity.compensation !== 'Not specified' && (
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

            {opportunity.hours && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hours</p>
                  <p className="font-medium text-gray-900">{opportunity.hours}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Posted</p>
                <p className="font-medium text-gray-900">{opportunity.posted}</p>
              </div>
            </div>
          </div>

          {/* Criteria Display */}
          {opportunity.criteria && Object.keys(opportunity.criteria).length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#556B2F] bg-opacity-10 rounded-lg">
                  <IdentificationIcon className="w-6 h-6 text-[#556B2F]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Opportunity Criteria</h2>
                  <p className="text-sm text-gray-600 mt-1">Key requirements and details for this opportunity</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#556B2F] from-opacity-5 to-[#6B8E23] to-opacity-5 rounded-2xl p-6 border border-[#556B2F] border-opacity-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(opportunity.criteria).map(([field, value]) => {
                    if (!value || field === 'customFilters') return null;

                    const getCriteriaLabel = (field: string) => {
                      switch (field) {
                        case 'contractType': return 'Contract Type';
                        case 'level': return 'Level';
                        case 'sector': return 'Sector';
                        case 'location': return 'Location';
                        case 'fundingType': return 'Funding Type';
                        case 'eligibility': return 'Eligibility';
                        case 'amountRange': return 'Amount Range';
                        case 'purpose': return 'Purpose';
                        case 'format': return 'Format';
                        case 'duration': return 'Duration';
                        case 'certification': return 'Certification';
                        case 'cost': return 'Cost';
                        case 'deadline': return 'Deadline';
                        default: return field;
                      }
                    };

                    const getCriteriaIcon = (field: string) => {
                      switch (field) {
                        case 'contractType': return <BriefcaseIcon className="w-5 h-5" />;
                        case 'level': return <UserIcon className="w-5 h-5" />;
                        case 'sector': return <BuildingOfficeIcon className="w-5 h-5" />;
                        case 'location': return <MapPinIcon className="w-5 h-5" />;
                        case 'fundingType': return <BanknotesIcon className="w-5 h-5" />;
                        case 'eligibility': return <CheckCircleIcon className="w-5 h-5" />;
                        case 'amountRange': return <BanknotesIcon className="w-5 h-5" />;
                        case 'purpose': return <DocumentTextIcon className="w-5 h-5" />;
                        case 'format': return <AcademicCapIcon className="w-5 h-5" />;
                        case 'duration': return <ClockIcon className="w-5 h-5" />;
                        case 'certification': return <CheckCircleIcon className="w-5 h-5" />;
                        case 'cost': return <BanknotesIcon className="w-5 h-5" />;
                        case 'deadline': return <CalendarDaysIcon className="w-5 h-5" />;
                        default: return <InformationCircleIcon className="w-5 h-5" />;
                      }
                    };

                    return (
                      <div key={field} className="bg-white rounded-xl p-4 shadow-sm border border-[#556B2F] border-opacity-20 hover:shadow-md transition-all duration-200 hover:border-[#556B2F] hover:border-opacity-40">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-[#556B2F] bg-opacity-10 rounded-lg flex-shrink-0">
                            {getCriteriaIcon(field)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#556B2F] uppercase tracking-wide mb-1">
                              {getCriteriaLabel(field)}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Display custom filters */}
                  {opportunity.criteria.customFilters && Object.entries(opportunity.criteria.customFilters).map(([filterName, filterValue]) => (
                    <div key={`custom-${filterName}`} className="bg-white rounded-xl p-4 shadow-sm border border-[#6B8E23] border-opacity-20 hover:shadow-md transition-all duration-200 hover:border-[#6B8E23] hover:border-opacity-40">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#6B8E23] bg-opacity-10 rounded-lg flex-shrink-0">
                          <InformationCircleIcon className="w-5 h-5 text-[#6B8E23]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#6B8E23] uppercase tracking-wide mb-1">
                            {filterName}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {typeof filterValue === 'string' ? filterValue : JSON.stringify(filterValue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="w-full space-y-8">
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 w-full">
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Description</h2>
            </div>
            <FormattedDescription description={opportunity.description || ''} />
          </div>

          {/* Metadata */}
          {opportunity.metadata && Object.keys(opportunity.metadata).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 w-full">
              <div className="flex items-center gap-3 mb-6">
                <InformationCircleIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Additional Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(opportunity.metadata).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <p className="text-gray-900 font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Process */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 w-full">
            <div className="flex items-center gap-3 mb-6">
              <UserIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Application Process</h2>
            </div>

            {(opportunity.contactEmails?.length || opportunity.applicationForm) ? (
              <div className="space-y-8">
                {/* Email Application */}
                {opportunity.contactEmails && opportunity.contactEmails.length > 0 && (
                  <div className="w-full">
                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <EnvelopeIcon className="w-5 h-5" />
                      Contact Application
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-3">Contact Emails:</p>
                        <div className="space-y-3">
                          {opportunity.contactEmails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border">
                              <span className="text-sm text-gray-700">{email}</span>
                              <a
                                href={`mailto:${email}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Send Email
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {opportunity.referenceCodes && opportunity.referenceCodes.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-3">Reference Codes:</p>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.referenceCodes.map((code, index) => (
                              <span key={index} className="inline-block bg-green-100 text-green-800 text-sm px-4 py-2 rounded-full font-medium">
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Application */}
                {opportunity.applicationForm && (
                  <div className="w-full max-w-[90%] mx-auto">
                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <IdentificationIcon className="w-5 h-5" />
                      {opportunity.applicationForm.title || 'Application Form'}
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      {opportunity.applicationForm.instructions && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {opportunity.applicationForm.instructions}
                          </p>
                        </div>
                      )}
                      
                      {opportunity.applicationForm.form_structure && Array.isArray(opportunity.applicationForm.form_structure) && opportunity.applicationForm.form_structure.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Application Form:</h4>
                          
                          {/* Authentication Check */}
                          {!user && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                              <div className="flex items-center">
                                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3" />
                                <div>
                                  <h3 className="text-lg font-medium text-yellow-800">Please Sign In</h3>
                                  <p className="text-yellow-700 mt-1">You need to be signed in to submit an application.</p>
                                  <button
                                    onClick={() => router.push('/auth/signin')}
                                    className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                                  >
                                    Sign In
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Loading Check */}
                          {user && checkingApplication && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                                <div>
                                  <h3 className="text-lg font-medium text-blue-800">Checking Application Status</h3>
                                  <p className="text-blue-700 mt-1">Please wait while we check if you have already applied...</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Existing Application Message */}
                          {user && !checkingApplication && hasExistingApplication && !isEditMode && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                              <div className="flex items-center">
                                <CheckCircleIcon className="w-6 h-6 text-blue-600 mr-3" />
                                <div className="flex-1">
                                  <h3 className="text-lg font-medium text-blue-800">You've Already Applied to This Opportunity</h3>
                                  <p className="text-blue-700 mt-1">
                                    You submitted your application on {new Date(existingApplication?.submitted_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-blue-600 text-sm mt-2">
                                    Status: <span className="font-medium">{existingApplication?.status || 'Submitted'}</span>
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-4">
                                    <button
                                      onClick={handleEditApplication}
                                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                      Edit Application
                                    </button>
                                    <button
                                      onClick={() => setShowDeleteConfirm(true)}
                                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                      Delete Application
                                    </button>
                                    <button
                                      onClick={() => router.push('/seeker/opportunities/applications')}
                                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                      <EyeIcon className="w-4 h-4" />
                                      View All Applications
                                    </button>
                                    <button
                                      onClick={() => router.push('/seeker/opportunities/navigate')}
                                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                      Browse Other Opportunities
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Delete Confirmation Modal */}
                          {showDeleteConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                                <div className="flex items-center mb-4">
                                  <TrashIcon className="w-6 h-6 text-red-600 mr-3" />
                                  <h3 className="text-lg font-semibold text-gray-900">Delete Application</h3>
                                </div>
                                <p className="text-gray-600 mb-6">
                                  Are you sure you want to delete your application? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-end">
                                  <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleDeleteApplication}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                                  >
                                    {isDeleting ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {submissionError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                              <div className="flex items-center">
                                <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
                                <div>
                                  <h3 className="text-lg font-medium text-red-800">Submission Error</h3>
                                  <p className="text-red-700 mt-1">{submissionError}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {submitted ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                              <div className="flex items-center">
                                <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                                <div>
                                  <h3 className="text-lg font-medium text-green-800">
                                    {isEditMode ? 'Application Updated Successfully!' : 'Application Submitted Successfully!'}
                                  </h3>
                                  <p className="text-green-700 mt-1">
                                    {isEditMode 
                                      ? 'Your application has been updated successfully.' 
                                      : 'Thank you for your application. We\'ll review it and get back to you soon.'
                                    }
                                  </p>
                                  <button
                                    onClick={() => router.push('/seeker/opportunities/applications')}
                                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                  >
                                    View My Applications
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : user && !checkingApplication && (!hasExistingApplication || isEditMode) ? (
                            <form onSubmit={isEditMode ? handleUpdateApplication : handleSubmit} className="space-y-6">
                              {isEditMode && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <PencilIcon className="w-5 h-5 text-yellow-600 mr-2" />
                                      <span className="text-yellow-800 font-medium">Editing Your Application</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {opportunity.applicationForm.form_structure.map((section: any, sectionIndex: number) => (
                                <div key={section.id || sectionIndex} className="bg-white rounded-lg p-6 border">
                                  <h5 className="font-semibold text-gray-800 mb-4 text-lg">{section.title}</h5>
                                  {section.questions && Array.isArray(section.questions) && (
                                    <div className="space-y-4">
                                      {section.questions.map((question: any, questionIndex: number) => (
                                        <div key={question.id || questionIndex} className="space-y-2">
                                          <label className="block text-sm font-medium text-gray-700">
                                            {question.label}
                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                          </label>
                                          
                                          {/* Render different input types */}
                                          {question.type === 'text' && (
                                            <input
                                              type="text"
                                              placeholder={question.placeholder || ''}
                                              value={formData[question.id] || ''}
                                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                                              required={question.required}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                          )}
                                          
                                          {question.type === 'email' && (
                                            <input
                                              type="email"
                                              placeholder={question.placeholder || ''}
                                              value={formData[question.id] || ''}
                                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                                              required={question.required}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                          )}
                                          
                                          {question.type === 'textarea' && (
                                            <textarea
                                              placeholder={question.placeholder || ''}
                                              value={formData[question.id] || ''}
                                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                                              required={question.required}
                                              rows={4}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                          )}
                                          
                                          {question.type === 'select' && (
                                            <select
                                              value={formData[question.id] || ''}
                                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                                              required={question.required}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                              <option value="">{question.placeholder || 'Select an option...'}</option>
                                              {question.options && question.options.map((option: any, optionIndex: number) => (
                                                <option key={optionIndex} value={option.value || option}>
                                                  {option.label || option}
                                                </option>
                                              ))}
                                            </select>
                                          )}
                                          
                                          {question.type === 'radio' && (
                                            <div className="space-y-2">
                                              {question.options && question.options.map((option: any, optionIndex: number) => (
                                                <label key={optionIndex} className="flex items-center space-x-2">
                                                  <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option.value || option}
                                                    checked={formData[question.id] === (option.value || option)}
                                                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                                                    required={question.required}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                  />
                                                  <span className="text-sm text-gray-700">{option.label || option}</span>
                                                </label>
                                              ))}
                                            </div>
                                          )}
                                          
                                          {question.type === 'checkbox' && (
                                            <div className="space-y-2">
                                              {question.options && question.options.map((option: any, optionIndex: number) => (
                                                <label key={optionIndex} className="flex items-center space-x-2">
                                                  <input
                                                    type="checkbox"
                                                    value={option.value || option}
                                                    checked={(formData[question.id] || []).includes(option.value || option)}
                                                    onChange={(e) => {
                                                      const currentValues = formData[question.id] || [];
                                                      const newValues = e.target.checked
                                                        ? [...currentValues, option.value || option]
                                                        : currentValues.filter((v: any) => v !== (option.value || option));
                                                      handleInputChange(question.id, newValues);
                                                    }}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                  />
                                                  <span className="text-sm text-gray-700">{option.label || option}</span>
                                                </label>
                                              ))}
                                            </div>
                                          )}
                                          
                                          {question.type === 'file' && (
                                            <input
                                              type="file"
                                              onChange={(e) => handleInputChange(question.id, e.target.files?.[0])}
                                              required={question.required}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                          )}
                                          
                                          {question.type === 'date' && (
                                            <input
                                              type="date"
                                              value={formData[question.id] || ''}
                                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                                              required={question.required}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                          )}
                                          
                                          {question.type === 'number' && (
                                            <input
                                              type="number"
                                              placeholder={question.placeholder || ''}
                                              value={formData[question.id] || ''}
                                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                                              required={question.required}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              <div className="flex justify-end pt-4">
                                <button
                                  type="submit"
                                  disabled={isSubmitting || isUpdating}
                                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                                    (isSubmitting || isUpdating)
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                  }`}
                                >
                                  {isEditMode ? (
                                    isUpdating ? 'Updating...' : 'Update Application'
                                  ) : (
                                    isSubmitting ? 'Submitting...' : 'Submit Application'
                                  )}
                                </button>
                              </div>
                            </form>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">No Application Methods Available</h3>
                <p className="text-yellow-700 mb-4">This opportunity doesn't have any configured application methods.</p>
                <div className="text-sm text-yellow-600">
                  <p>Please contact the organization directly or check back later for updates.</p>
                </div>
              </div>
            )}

            {/* Apply Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {opportunity.contactEmails && opportunity.contactEmails.length > 0 && (
                <a
                  href={`mailto:${opportunity.contactEmails[0]}`}
                  className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg text-center"
                >
                  Apply via Email
                </a>
              )}
              {!opportunity.contactEmails?.length && !opportunity.applicationForm && (
                <div className="flex-1 bg-gray-300 text-gray-600 py-4 px-6 rounded-lg text-center font-semibold text-lg">
                  No Application Method Available
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              By applying, you agree to our terms and conditions
            </p>
          </div>

          {/* Include CV Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 w-full mt-8">
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Include CV</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <p className="text-gray-600 flex-1">
                  Enhance your application by including your professional CV. This will help the organization better understand your qualifications and experience.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full ml-4 flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1z" clipRule="evenodd" />
                  </svg>
                  Auto-saved
                </div>
              </div>

              {selectedCV ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-green-800">CV Selected</h3>
                        <p className="text-green-700 mt-1">"{selectedCV.name}" will be included with your application</p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-green-600 text-sm">
                            Last updated: {new Date(selectedCV.updated_at || selectedCV.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Saved for this opportunity
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCVModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Change CV
                      </button>
                      <button
                        onClick={handleRemoveCV}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No CV Selected</h3>
                    <p className="text-gray-600 mb-6">
                      Select a CV from your saved CVs to include with your application
                    </p>
                    <button
                      onClick={handleIncludeCV}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                      Select CV to Include
                    </button>
                  </div>
                </div>
              )}

              {user && (
                <div className="text-center">
                  <a
                    href="/seeker/tools/cv-maker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                  >
                    Don't have a CV? Create one now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CV Selection Modal */}
      {showCVModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">Select CV to Include</h3>
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => setShowCVModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {cvLoading ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="animate-spin mb-4">
                    <svg className="w-12 h-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500">Loading your saved CVs...</p>
                </div>
              ) : savedCVs.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Saved CVs Found</h3>
                  <p className="text-gray-500 mb-6">You don't have any saved CVs yet. Create one first to include it in your application.</p>
                  <a
                    href="/seeker/tools/cv-maker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    Create Your First CV
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Select a CV from your saved CVs to include with your application to {opportunity.title}.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCVs.map(cv => (
                      <div 
                        key={cv.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedCV?.id === cv.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectCV(cv)}
                      >
                        <div className="flex items-start gap-3">
                          <DocumentTextIcon className="w-8 h-8 text-blue-600 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{cv.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Last updated: {new Date(cv.updated_at || cv.created_at).toLocaleDateString()}
                            </p>
                            {cv.general_info && (
                              <p className="text-sm text-gray-600 mt-1">
                                {cv.general_info.firstName} {cv.general_info.lastName}
                              </p>
                            )}
                          </div>
                          {selectedCV?.id === cv.id && (
                            <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <a
                      href="/seeker/tools/cv-maker"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                    >
                      Create a new CV
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    
                    {selectedCV && (
                      <div className="text-sm text-gray-600">
                        Selected: <span className="font-medium">{selectedCV.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowCVModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
              {selectedCV && (
                <button
                  onClick={() => setShowCVModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Confirm Selection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
} 