'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRightIcon, 
  ChevronDownIcon, 
  PencilIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  UserGroupIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  TrashIcon,
  PlayIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { getOpportunities, deleteOpportunity } from '../services/opportunityService';
import { getOpportunityProcess } from '../../resources/tools/ProcessMakers/services/opportunityProcessService';
import { Toaster, toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Opportunity {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

interface OpportunityDetail {
  description?: {
    id?: string;
    title?: string;
    description?: string;
    location?: string;
    hours?: string;
    metadata?: {
      descriptionMode?: 'template' | 'editor';
      selectedTemplate?: string;
      templateFields?: Record<string, string>;
      categories?: string[];
    };
  };
  form_choice?: {
    applicationMethod: 'form' | 'email';
    formName?: string;
    formId?: string;
    contactEmails?: string[];
    referenceCodes?: string[];
  };
  process?: any;
}

export default function ListOpportunities() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [opportunityDetails, setOpportunityDetails] = useState<Record<string, OpportunityDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [publishing, setPublishing] = useState<Record<string, boolean>>({});
  const [publishedOpportunities, setPublishedOpportunities] = useState<Record<string, boolean>>({});
  
  // New state for separating opportunities by status
  const [activeTab, setActiveTab] = useState<'draft' | 'completed'>('draft');
  const [draftOpportunities, setDraftOpportunities] = useState<Opportunity[]>([]);
  const [completedOpportunities, setCompletedOpportunities] = useState<Opportunity[]>([]);
  const [publishedOpportunityList, setPublishedOpportunityList] = useState<Opportunity[]>([]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    // Check published status for all opportunities
    opportunities.forEach(opportunity => {
      checkPublishedStatus(opportunity.id);
    });
  }, [opportunities]);

  const checkPublishedStatus = async (opportunityId: string) => {
    try {
      const { data, error } = await supabase
        .from('opportunity_description')
        .select('status')
        .eq('opportunity_id', opportunityId)
        .maybeSingle();
      
      if (data && data.status === 'published') {
        setPublishedOpportunities(prev => ({ ...prev, [opportunityId]: true }));
      }
    } catch (error) {
      console.error('Error checking published status:', error);
    }
  };

  const handlePublish = async (opportunityId: string) => {
    try {
      setPublishing(prev => ({ ...prev, [opportunityId]: true }));
      
      // Update the status to 'published' in opportunity_description table
      const { error } = await supabase
        .from('opportunity_description')
        .update({ status: 'published' })
        .eq('opportunity_id', opportunityId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setPublishedOpportunities(prev => ({ ...prev, [opportunityId]: true }));
      toast.success('Opportunity published successfully!');
      
      // Refresh opportunities to move from completed to published
      fetchOpportunities();
      
    } catch (error) {
      console.error('Error publishing opportunity:', error);
      toast.error('Failed to publish opportunity');
    } finally {
      setPublishing(prev => ({ ...prev, [opportunityId]: false }));
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      
      // Fetch opportunities with their description status
      const { data: opportunitiesData, error: oppError } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          opportunity_description (
            status
          )
        `)
        .order('created_at', { ascending: false });
      
      if (oppError) {
        console.error('Failed to fetch opportunities:', oppError);
        toast.error('Failed to load opportunities');
        setOpportunities([]);
        return;
      }
      
      // Transform the data to include status from opportunity_description
      const transformedOpportunities = opportunitiesData?.map(opp => ({
        id: opp.id,
        title: opp.title,
        created_at: opp.created_at,
        updated_at: opp.updated_at,
        status: opp.opportunity_description?.[0]?.status || 'draft' // Default to draft if no description
      })) || [];
      
      setOpportunities(transformedOpportunities);
      
      // Separate opportunities by status
      const draft = transformedOpportunities.filter(opp => opp.status === 'draft');
      const completed = transformedOpportunities.filter(opp => opp.status === 'completed');
      const published = transformedOpportunities.filter(opp => opp.status === 'published');
      
      setDraftOpportunities(draft);
      setCompletedOpportunities(completed);
      setPublishedOpportunityList(published);
      
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (opportunityId: string) => {
    try {
      setDeleting(prev => ({ ...prev, [opportunityId]: true }));
      
      const result = await deleteOpportunity(opportunityId);
      
      if (result.success) {
        toast.success('Opportunity deleted successfully');
        // Remove the deleted opportunity from the list
        setOpportunities(opportunities.filter(opp => opp.id !== opportunityId));
        setDeleteConfirm(null);
        // Refresh the lists
        fetchOpportunities();
      } else {
        toast.error(result.error || 'Failed to delete opportunity');
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('An error occurred while deleting the opportunity');
    } finally {
      setDeleting(prev => ({ ...prev, [opportunityId]: false }));
    }
  };

  const toggleOpportunity = async (opportunityId: string) => {
    const isExpanding = expandedOpportunity !== opportunityId;
    
    setExpandedOpportunity(isExpanding ? opportunityId : null);
    setExpandedSection(null);
    
    if (isExpanding && !opportunityDetails[opportunityId]) {
      await fetchOpportunityDetails(opportunityId);
    }
  };

  const fetchOpportunityDetails = async (opportunityId: string) => {
    try {
      setLoadingDetails(prev => ({ ...prev, [opportunityId]: true }));
      
      // Fetch description data
      let description = null;
      try {
        const { data } = await supabase
          .from('opportunity_description')
          .select('*')
          .eq('opportunity_id', opportunityId)
          .maybeSingle();
        description = data;
      } catch (error) {
        console.error('Error fetching description:', error);
      }
      
      // Fetch process data
      let process = null;
      try {
        process = await getOpportunityProcess(opportunityId);
      } catch (error) {
        console.error('Error fetching process:', error);
      }
      
      // Fetch form choice data
      let formChoice = null;
      try {
        const { data } = await supabase
          .from('opportunity_form_choice')
          .select('*, form:form_id(*)')
          .eq('opportunity_id', opportunityId)
          .maybeSingle();
        formChoice = data;
      } catch (error) {
        console.error('Error fetching form choice:', error);
      }
      
      // Fetch form email data
      let formEmail = null;
      try {
        const { data } = await supabase
          .from('opportunity_form_email')
          .select('*')
          .eq('opportunity_id', opportunityId)
          .maybeSingle();
        formEmail = data;
      } catch (error) {
        console.error('Error fetching form email:', error);
      }
      
      // Prepare application method info
      let formInfo = null;
      
      // Check for form choice
      if (formChoice) {
        formInfo = {
          applicationMethod: 'form' as const,
          formName: formChoice.form?.title || 'Custom Form',
          formId: formChoice.form_id
        };
      } 
      // Check for email form if no form choice
      else if (formEmail) {
        formInfo = {
          applicationMethod: 'email' as const,
          contactEmails: formEmail.contact_emails || [],
          referenceCodes: formEmail.reference_codes || []
        };
      }
      
      // Set all opportunity details
      setOpportunityDetails(prev => {
        const updated = { ...prev };
        updated[opportunityId] = {
          description,
          process,
          form_choice: formInfo || undefined
        };
        return updated;
      });
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      toast.error('Failed to load opportunity details');
    } finally {
      setLoadingDetails(prev => ({ ...prev, [opportunityId]: false }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateToEdit = (opportunityId: string, section: string) => {
    router.push(`/ngo/opportunities/new?edit=${opportunityId}&step=${section}`);
  };

  // Helper function to check if content contains HTML
  const containsHtml = (str: string) => {
    if (!str) return false;
    return /<[^>]*>/g.test(str);
  };

  // Helper function to parse template-style descriptions
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

  // Helper function to render file URLs (images and documents)
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

  // Component to render formatted description with proper parsing
  const FormattedDescription = ({ description }: { description: string }) => {
    if (!description) return <p className="text-gray-500">No description provided</p>;

    // Check if the description contains HTML
    if (containsHtml(description)) {
      // If it contains HTML, render it directly with dangerouslySetInnerHTML
      return (
        <div 
          className="prose max-w-none text-gray-700 
                     prose-headings:text-gray-900 prose-headings:font-semibold 
                     prose-p:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed
                     prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6
                     prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mb-4
                     prose-h3:text-lg prose-h3:mb-3
                     prose-h4:text-base prose-h4:mb-2
                     prose-ul:mb-4 prose-ul:pl-6 prose-li:mb-1
                     prose-ol:mb-4 prose-ol:pl-6
                     prose-strong:font-semibold prose-strong:text-gray-900
                     prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      );
    } else {
      // If it doesn't contain HTML, use the template-style parsing
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
                <div className="text-gray-700 leading-relaxed">
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
                    
                    return trimmedLine ? (
                      <div key={lineIndex} className="mb-2">
                        {trimmedLine}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  // Helper function to render process steps
  const renderProcessSteps = (process: any) => {
    if (!process || !process.steps || process.steps.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p>No process steps configured</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {process.steps.map((step: any, index: number) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-700">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{step.name || `Step ${index + 1}`}</h4>
                {step.description && (
                  <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                )}
                {step.duration && (
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>Duration: {step.duration}</span>
                  </div>
                )}
                {step.required_documents && step.required_documents.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Required documents:</p>
                    <ul className="list-disc list-inside text-sm text-gray-500">
                      {step.required_documents.map((doc: string, docIndex: number) => (
                        <li key={docIndex}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Separate component for form preview to handle hooks properly
  const FormPreview = ({ opportunityId }: { opportunityId: string }) => {
    const [formData, setFormData] = useState<any>(null);
    const [loadingForm, setLoadingForm] = useState(true);

    useEffect(() => {
      const getFormData = async () => {
        try {
          const { data, error } = await supabase
            .from('opportunity_form_choice')
            .select(`
              form_id,
              forms_templates (
                id,
                title,
                sections,
                description,
                status
              )
            `)
            .eq('opportunity_id', opportunityId)
            .single();

          if (error || !data?.forms_templates) {
            return null;
          }

          return data.forms_templates;
        } catch (error) {
          console.error('Error fetching form data:', error);
          return null;
        }
      };

      const fetchForm = async () => {
        setLoadingForm(true);
        const form = await getFormData();
        setFormData(form);
        setLoadingForm(false);
      };

      fetchForm();
    }, [opportunityId]);

    if (loadingForm) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading form...</span>
        </div>
      );
    }

    if (!formData || !formData.sections) {
      return (
        <div className="text-center py-8 text-gray-500">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No form template found</p>
          <p className="text-sm">The form may have been deleted or is not accessible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Form Header */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">{formData.title}</h3>
          {formData.description && (
            <p className="text-gray-600 mt-1">{formData.description}</p>
          )}
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {formData.sections?.map((section: any, sectionIndex: number) => (
            <div key={sectionIndex} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">{section.title}</h4>
              {section.description && (
                <p className="text-gray-600 text-sm mb-4">{section.description}</p>
              )}
              
              <div className="space-y-4">
                {section.questions?.map((question: any, questionIndex: number) => (
                  <div key={questionIndex} className="bg-white rounded border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          {question.label}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {question.description && (
                          <p className="text-gray-600 text-sm mb-3">{question.description}</p>
                        )}
                        
                        {/* Render form field based on type */}
                        {renderFormField(question)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render different form field types
  const renderFormField = (question: any) => {
    const baseClasses = "w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 cursor-not-allowed";
    
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            className={baseClasses}
            placeholder={question.placeholder || "Short text answer"}
            disabled
            readOnly
          />
        );
      
      case 'long_text':
        return (
          <textarea
            className={`${baseClasses} h-24 resize-none`}
            placeholder={question.placeholder || "Long text answer"}
            disabled
            readOnly
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            className={baseClasses}
            placeholder={question.placeholder || "email@example.com"}
            disabled
            readOnly
          />
        );
      
      case 'phone':
        return (
          <input
            type="tel"
            className={baseClasses}
            placeholder={question.placeholder || "Phone number"}
            disabled
            readOnly
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            className={baseClasses}
            placeholder={question.placeholder || "Number"}
            disabled
            readOnly
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            className={baseClasses}
            disabled
            readOnly
          />
        );
      
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`preview-${question.id}`}
                  className="text-green-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  className="text-green-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'dropdown':
        return (
          <select className={baseClasses} disabled>
            <option>Select an option...</option>
            {question.options?.map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <DocumentTextIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">File upload field</p>
            <p className="text-gray-400 text-xs">
              {question.accept ? `Accepts: ${question.accept}` : 'Any file type'}
            </p>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            className={baseClasses}
            placeholder="Unknown field type"
            disabled
            readOnly
          />
        );
    }
  };

  // Helper function to render application method with form details
  const renderApplicationMethodWithForm = (formChoice: any, opportunityId: string) => {
    if (!formChoice) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p>No application method configured</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Application Method Header */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3">Application Method</h4>
          
          {formChoice.applicationMethod === 'form' ? (
            <div className="space-y-3">
              <div className="flex items-center text-green-700">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Online Application Form</span>
              </div>
              {formChoice.formName && (
                <p className="text-gray-600">
                  <strong>Form:</strong> {formChoice.formName}
                </p>
              )}
              {formChoice.referenceCodes && formChoice.referenceCodes.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Reference Codes:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formChoice.referenceCodes.map((code: string, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-green-700">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Email Application</span>
              </div>
              {formChoice.contactEmails && formChoice.contactEmails.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Contact Emails:</strong>
                  </p>
                  <div className="space-y-1">
                    {formChoice.contactEmails.map((email: string, index: number) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
                          {email}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Preview Section */}
        {formChoice.applicationMethod === 'form' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Application Form Preview</h4>
              <span className="text-sm text-gray-500">Read-only preview</span>
            </div>
            <FormPreview opportunityId={opportunityId} />
          </div>
        )}
      </div>
    );
  };
  
  const renderOpportunityCard = (opportunity: Opportunity) => (
    <div 
      key={opportunity.id} 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Opportunity Header - Always visible */}
      <div 
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => toggleOpportunity(opportunity.id)}
      >
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900 mr-3">{opportunity.title}</h3>
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              opportunity.status === 'published'
                ? 'bg-blue-100 text-blue-800'
                : opportunity.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {opportunity.status === 'published' ? 'Published' : opportunity.status === 'completed' ? 'Completed' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>Created: {formatDate(opportunity.created_at)}</span>
            <span className="mx-2">•</span>
            <span>Updated: {formatDate(opportunity.updated_at)}</span>
            
            {/* Show published status if published */}
            {opportunity.status === 'published' && (
              <>
                <span className="mx-2">•</span>
                <span className="text-green-600 font-medium flex items-center">
                  <GlobeAltIcon className="h-4 w-4 mr-1" /> 
                  Live
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {/* Publish button - show only for completed opportunities that are not published */}
          {opportunity.status === 'completed' && (
            <button 
              className={`text-blue-600 hover:text-blue-800 p-2 mr-1 ${publishing[opportunity.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!publishing[opportunity.id]) {
                  handlePublish(opportunity.id);
                }
              }}
              disabled={publishing[opportunity.id]}
              title="Publish opportunity"
            >
              {publishing[opportunity.id] ? (
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <GlobeAltIcon className="h-5 w-5" />
              )}
            </button>
          )}
          
          {/* Continue button - show only for draft opportunities */}
          {opportunity.status === 'draft' && (
            <button 
              className="text-blue-600 hover:text-blue-800 p-2 mr-1 relative group"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/ngo/opportunities/new?edit=${opportunity.id}`);
              }}
              title="Continue unfinished Opportunity"
            >
              <PlayIcon className="h-5 w-5" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Continue unfinished Opportunity
              </div>
            </button>
          )}
          
          {/* Edit button */}
          <button 
            className="text-[#556B2F] hover:text-[#4A5F29] p-2"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/ngo/opportunities/new?edit=${opportunity.id}`);
            }}
            title="Edit opportunity"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          {/* Delete button */}
          <button 
            className={`text-red-600 hover:text-red-800 p-2 ${deleting[opportunity.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!deleting[opportunity.id]) {
                setDeleteConfirm(opportunity.id);
              }
            }}
            disabled={deleting[opportunity.id]}
            title="Delete opportunity"
          >
            {deleting[opportunity.id] ? (
              <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <TrashIcon className="h-5 w-5" />
            )}
          </button>
          
          {expandedOpportunity === opportunity.id ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {/* Detailed View Section - Full Opportunity Display */}
      {expandedOpportunity === opportunity.id && (
        <div className="border-t border-gray-200 bg-white">
          {loadingDetails[opportunity.id] ? (
            <div className="flex justify-center items-center h-20 p-6">
              <svg className="animate-spin h-6 w-6 text-[#556B2F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="p-6">
              {opportunityDetails[opportunity.id] ? (
                <div className="max-w-6xl mx-auto">
                  {/* Opportunity Header */}
                  <div className="mb-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                          {opportunityDetails[opportunity.id].description?.title || opportunity.title}
                        </h1>
                        
                        {/* Key Details */}
                        <div className="flex flex-wrap gap-4 mb-4">
                          {opportunityDetails[opportunity.id]?.description?.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPinIcon className="w-5 h-5 mr-2" />
                              <span>{opportunityDetails[opportunity.id]?.description?.location}</span>
                            </div>
                          )}
                          {opportunityDetails[opportunity.id]?.description?.hours && (
                            <div className="flex items-center text-gray-600">
                              <ClockIcon className="w-5 h-5 mr-2" />
                              <span>{opportunityDetails[opportunity.id]?.description?.hours}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <CalendarDaysIcon className="w-5 h-5 mr-2" />
                            <span>Posted {formatDate(opportunity.created_at)}</span>
                          </div>
                        </div>

                        {/* Categories */}
                        {opportunityDetails[opportunity.id]?.description?.metadata?.categories && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {opportunityDetails[opportunity.id]?.description?.metadata?.categories?.map((category: string, index: number) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <TagIcon className="w-4 h-4 mr-1" />
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button 
                        className="flex items-center px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#4A5F29] transition-colors"
                        onClick={() => navigateToEdit(opportunity.id, 'description')}
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Opportunity
                      </button>
                    </div>
                  </div>

                  {/* Quick Info and Actions Section - Top Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Quick Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`font-medium ${
                            opportunity.status === 'published' ? 'text-blue-600' :
                            opportunity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {opportunity.status === 'published' ? 'Published' : 
                             opportunity.status === 'completed' ? 'Completed' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created</span>
                          <span className="text-gray-900">{new Date(opportunity.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="text-gray-900">{new Date(opportunity.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button 
                          className="flex items-center justify-center px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#4A5F29] transition-colors text-sm"
                          onClick={() => navigateToEdit(opportunity.id, 'description')}
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Edit Description
                        </button>
                        
                        <button 
                          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          onClick={() => navigateToEdit(opportunity.id, 'form_choice')}
                        >
                          <DocumentTextIcon className="w-4 h-4 mr-2" />
                          Edit Form
                        </button>
                        
                        <button 
                          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          onClick={() => navigateToEdit(opportunity.id, 'process')}
                        >
                          <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                          Edit Process
                        </button>

                        {opportunity.status === 'completed' && (
                          <button 
                            className={`flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm ${publishing[opportunity.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handlePublish(opportunity.id)}
                            disabled={publishing[opportunity.id]}
                          >
                            {publishing[opportunity.id] ? (
                              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <GlobeAltIcon className="w-4 h-4 mr-2" />
                            )}
                            Publish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content Section */}
                  <div className="space-y-8">
                    {/* Description Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                        About This Opportunity
                      </h2>
                      <FormattedDescription 
                        description={opportunityDetails[opportunity.id].description?.description || ''} 
                      />
                    </div>

                    {/* Application Method Section - Moved before Process */}
                    {opportunityDetails[opportunity.id]?.form_choice && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <DocumentTextIcon className="w-6 h-6 mr-2 text-green-600" />
                          How to Apply
                        </h2>
                        {renderApplicationMethodWithForm(opportunityDetails[opportunity.id].form_choice, opportunity.id)}
                      </div>
                    )}

                    {/* Process Section */}
                    {opportunityDetails[opportunity.id]?.process && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-blue-600" />
                          Application Process
                        </h2>
                        {renderProcessSteps(opportunityDetails[opportunity.id].process)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No details available for this opportunity</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-[#556B2F] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Opportunity</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this opportunity? This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={deleting[deleteConfirm]}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting[deleteConfirm]}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
                  deleting[deleteConfirm] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {deleting[deleteConfirm] ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Opportunities</h2>
        <Link 
          href="/ngo/opportunities/new" 
          className="px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-md shadow-sm hover:shadow-md transition-all duration-200"
        >
          Create New
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('draft')}
            className={`${
              activeTab === 'draft'
                ? 'border-[#6B8E23] text-[#556B2F] font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <span className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Draft Opportunities
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {draftOpportunities.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-[#6B8E23] text-[#556B2F] font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <span className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed Opportunities
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {completedOpportunities.length + publishedOpportunityList.length}
              </span>
            </span>
          </button>
        </nav>
      </div>
      
      {/* Content Based on Active Tab */}
      {activeTab === 'draft' ? (
        // Draft Tab Content
        draftOpportunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ClockIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">You don't have any draft opportunities yet.</h3>
            <p className="text-gray-600 mb-6">Start creating your first opportunity to see it here.</p>
            <Link 
              href="/ngo/opportunities/new" 
              className="px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              Create Your First Opportunity
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {draftOpportunities.map(renderOpportunityCard)}
          </div>
        )
      ) : (
        // Completed Tab Content with separate sections
        completedOpportunities.length === 0 && publishedOpportunityList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">You don't have any completed opportunities yet.</h3>
            <p className="text-gray-600 mb-6">Complete and submit your draft opportunities to see them here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Completed Opportunities Section */}
            {completedOpportunities.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-800">Completed & Ready to Publish</h3>
                    <span className="ml-3 bg-green-200 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {completedOpportunities.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {completedOpportunities.map(renderOpportunityCard)}
                </div>
              </div>
            )}
            
            {/* Published Opportunities Section */}
            {publishedOpportunityList.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                    <GlobeAltIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-800">Published & Live</h3>
                    <span className="ml-3 bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {publishedOpportunityList.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {publishedOpportunityList.map(renderOpportunityCard)}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
} 