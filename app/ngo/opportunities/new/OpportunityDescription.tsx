'use client';

import { useState, useEffect, useRef } from 'react';
import { DocumentTextIcon, PencilSquareIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { getTemplates } from '../../resources/tools/OffreMaker/supabaseService';
import { Template as OffreTemplate, TemplateField } from '../../resources/tools/OffreMaker/NewTemplate';
import dynamic from 'next/dynamic';
import { saveOpportunityProgress, getLatestOpportunityProgress } from '../services/opportunityService';
import { toast } from 'react-hot-toast';
import { supabase } from '@/app/lib/supabase';

// Define our extended field type that supports all the field types we want to render
interface ExtendedField {
  id: string;
  type: string; // We'll use string to accommodate any field type
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

// Define our extended template that uses ExtendedField
interface ExtendedTemplate {
  id: string;
  title: string;
  description?: string;
  fields: ExtendedField[];
}

// Dynamically import the RichTextEditor component
const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md p-6 bg-gray-50 animate-pulse flex flex-col justify-center items-center h-64">
      <div className="w-12 h-12 rounded-full bg-[#556B2F]/20 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-[#556B2F]/40 animate-pulse" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
      <div className="text-gray-500 text-center">
        <p className="mb-1 font-medium">Loading rich text editor...</p>
        <p className="text-xs text-gray-400">This may take a moment</p>
      </div>
    </div>
  )
});

interface OpportunityDescriptionProps {
  formData: {
    title: string;
    description: string;
    location: string;
    hours: string;
    opportunityType: 'job' | 'funding' | 'training' | '';
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => void;
  onNext: () => void;
  opportunityId: string;
  onCriteriaChange?: (criteria: CriteriaSelection) => void;
}

interface TemplateFields {
  [key: string]: string;
}

// Add a new interface for field files
interface FieldFiles {
  [key: string]: File | null;
}

// Add interface for criteria selection
interface CriteriaSelection {
  contractType?: string;
  level?: string;
  sector?: string;
  location?: string;
  fundingType?: string;
  eligibility?: string;
  amountRange?: string;
  purpose?: string;
  format?: string;
  duration?: string;
  certification?: string;
  cost?: string;
  deadline?: string;
  customFilters?: { [key: string]: string };
}

export default function OpportunityDescription({ formData, onChange, onNext, opportunityId, onCriteriaChange }: OpportunityDescriptionProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [descriptionMode, setDescriptionMode] = useState<'template' | 'editor'>('editor');
  const [templates, setTemplates] = useState<ExtendedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateFields, setTemplateFields] = useState<TemplateFields>({});
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Add state for field files
  const [fieldFiles, setFieldFiles] = useState<FieldFiles>({});
  // Add state for criteria selection
  const [criteria, setCriteria] = useState<CriteriaSelection>({});
  // Add state for custom filters
  const [customFilters, setCustomFilters] = useState<{ [key: string]: string }>({});
  const [newCustomFilterName, setNewCustomFilterName] = useState('');
  const [newCustomFilterValue, setNewCustomFilterValue] = useState('');
  
  // Use a ref to track if we've already loaded data to prevent multiple calls
  const dataLoadedRef = useRef(false);

  // Fetch templates from the OffreMaker service
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const { data, error } = await getTemplates();
        if (error) {
          console.error('Error fetching templates:', error);
        } else if (data) {
          // Map the templates to our extended format
          const extendedTemplates: ExtendedTemplate[] = data.map((template: OffreTemplate) => ({
            ...template,
            fields: template.fields.map((field: TemplateField) => ({
              ...field,
              // Ensure all required properties are present
              required: field.required || false,
              // Convert any legacy or unknown field types to our supported types
              type: field.type
            }))
          }));
          setTemplates(extendedTemplates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Fallback to mock templates if there's an error or in development
        setTemplates([
          {
            id: "1",
            title: "Teaching Opportunity",
            description: "Template for teaching and educational opportunities",
            fields: [
              { id: "1-1", type: "text", label: "Key Responsibilities", placeholder: "What will volunteers be responsible for?", required: true },
              { id: "1-2", type: "multiline", label: "Requirements", placeholder: "What skills or qualifications are needed?", required: false },
              { id: "1-3", type: "multiline", label: "Impact", placeholder: "How will this role make a difference?", required: true }
            ]
          },
          {
            id: "2",
            title: "Environmental Project",
            description: "Template for environmental conservation projects",
            fields: [
              { id: "2-1", type: "text", label: "Project Goals", placeholder: "What are the main goals of this project?", required: true },
              { id: "2-2", type: "multiline", label: "Activities", placeholder: "What activities will volunteers perform?", required: true },
              { id: "2-3", type: "text", label: "Equipment Needed", placeholder: "What equipment will be used or provided?", required: false }
            ]
          },
          {
            id: "3",
            title: "Community Support",
            description: "Template for community service opportunities",
            fields: [
              { id: "3-1", type: "multiline", label: "Community Need", placeholder: "What community need does this address?", required: true },
              { id: "3-2", type: "multiline", label: "Activities", placeholder: "What will volunteers actually do?", required: true },
              { id: "3-3", type: "text", label: "Beneficiaries", placeholder: "Who will benefit from this work?", required: false }
            ]
          }
        ] as ExtendedTemplate[]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  // Load saved progress when component mounts
  useEffect(() => {
    // Skip if we've already loaded data
    if (dataLoadedRef.current) {
      return;
    }
    
    const loadSavedProgress = async () => {
      setLoadingProgress(true);
      try {
        // Pass the opportunityId to load progress for this specific opportunity
        const { data, error } = await getLatestOpportunityProgress(opportunityId);
        
        if (error) {
          console.error('Error loading saved progress:', error);
          return;
        }
        
        if (data) {
          console.log('Loaded saved progress:', data);
          
          // Update standard form fields
          if (data.title) {
            onChange({ target: { name: 'title', value: data.title } });
          }
          
          if (data.description) {
            onChange({ target: { name: 'description', value: data.description } });
          }
          
          if (data.location) {
            onChange({ target: { name: 'location', value: data.location } });
          }
          
          if (data.hours) {
            onChange({ target: { name: 'hours', value: data.hours } });
          }
          
          // Set description mode if saved
          if (data.metadata && typeof data.metadata === 'object') {
            // Check if metadata contains the mode field
            if (data.metadata.descriptionMode === 'template' || data.metadata.descriptionMode === 'editor') {
              setDescriptionMode(data.metadata.descriptionMode);
            }
            
            // Load template selection and fields if available
            if (data.metadata.selectedTemplate) {
              setSelectedTemplate(data.metadata.selectedTemplate);
            }
            
            if (data.metadata.templateFields && typeof data.metadata.templateFields === 'object') {
              setTemplateFields(data.metadata.templateFields);
            }
            
            // Load criteria from dedicated column if available
            if (data.criteria && typeof data.criteria === 'object') {
              setCriteria(data.criteria);
              
              // Load custom filters if available
              if (data.criteria.customFilters && typeof data.criteria.customFilters === 'object') {
                setCustomFilters(data.criteria.customFilters);
              }
            }
            // Fallback: Load criteria from metadata (for backward compatibility)
            else if (data.metadata && data.metadata.criteria && typeof data.metadata.criteria === 'object') {
              setCriteria(data.metadata.criteria);
              
              // Load custom filters if available
              if (data.metadata.criteria.customFilters && typeof data.metadata.criteria.customFilters === 'object') {
                setCustomFilters(data.metadata.criteria.customFilters);
              }
            }
          }
          
          // Mark data as loaded
          dataLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };
    
    loadSavedProgress();
  }, []); // Empty dependency array - only run on mount

  // Handle TinyMCE editor change
  const handleEditorChange = (content: string) => {
    onChange({
      target: {
        name: 'description',
        value: content
      }
    });
    if (!editorReady) setEditorReady(true);
  };

  // Criteria options based on opportunity type
  const getCriteriaOptions = (opportunityType: string) => {
    const options = {
      job: {
        contractType: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Temporary'],
        level: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
        sector: ['Tech', 'Education', 'Health', 'Arts', 'Environment', 'Social Services', 'Finance', 'Marketing', 'Other'],
        location: ['Onsite', 'Remote', 'Hybrid']
      },
      funding: {
        fundingType: ['Grant', 'Prize', 'Scholarship', 'Seed funding', 'VC investment'],
        eligibility: ['Individuals', 'NGOs', 'Startups', 'Students', 'Researchers'],
        amountRange: ['Under €1,000', '€1,000 - €5,000', '€5,000 - €10,000', '€10,000 - €25,000', '€25,000 - €50,000', 'Over €50,000'],
        purpose: ['Research', 'Entrepreneurship', 'Community development', 'Education', 'Innovation', 'Social impact']
      },
      training: {
        format: ['Online', 'Offline', 'Hybrid'],
        duration: ['Short course', 'Bootcamp', 'Multi-month program'],
        level: ['Beginner', 'Intermediate', 'Advanced'],
        certification: ['Yes', 'No'],
        cost: ['Free', 'Partial funding', 'Paid']
      }
    };
    
    return options[opportunityType as keyof typeof options] || {};
  };

  // Handle criteria change
  const handleCriteriaChange = (field: string, value: string) => {
    const newCriteria = {
      ...criteria,
      [field]: value
    };
    setCriteria(newCriteria);
    
    // Notify parent component
    if (onCriteriaChange) {
      onCriteriaChange(newCriteria);
    }
  };

  // Handle custom filter addition
  const handleAddCustomFilter = () => {
    if (!newCustomFilterName.trim() || !newCustomFilterValue.trim()) {
      return;
    }
    
    const newCustomFilters = {
      ...customFilters,
      [newCustomFilterName.trim()]: newCustomFilterValue.trim()
    };
    
    setCustomFilters(newCustomFilters);
    
    // Update criteria with custom filters
    const newCriteria = {
      ...criteria,
      customFilters: newCustomFilters
    };
    setCriteria(newCriteria);
    
    // Notify parent component
    if (onCriteriaChange) {
      onCriteriaChange(newCriteria);
    }
    
    // Clear input fields
    setNewCustomFilterName('');
    setNewCustomFilterValue('');
  };

  // Handle custom filter removal
  const handleRemoveCustomFilter = (filterName: string) => {
    const newCustomFilters = { ...customFilters };
    delete newCustomFilters[filterName];
    setCustomFilters(newCustomFilters);
    
    // Update criteria with custom filters
    const newCriteria = {
      ...criteria,
      customFilters: newCustomFilters
    };
    setCriteria(newCriteria);
    
    // Notify parent component
    if (onCriteriaChange) {
      onCriteriaChange(newCriteria);
    }
  };

  // Handle template selection
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (!templateId) {
      setTemplateFields({});
      return;
    }
    
    // Find the selected template
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Initialize fields
      const initialFields = template.fields.reduce<TemplateFields>((acc, field) => {
        acc[field.id] = '';
        return acc;
      }, {});
      setTemplateFields(initialFields);
      
      // Set the title if it's empty
      if (!formData.title.trim()) {
        onChange({
          target: {
            name: 'title',
            value: template.title
          }
        });
      }
    }
  };

  // Add a function to upload file to Supabase bucket
  const uploadFileToBucket = async (file: File, fieldType: string): Promise<string | null> => {
    if (!file) return null;
    
    // Determine the bucket based on field type
    const bucketName = fieldType === 'image' || fieldType === 'image_upload' 
      ? 'opportunity-description-images' 
      : 'opportunity-description-documents';
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    try {
      // Upload file to the specified bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return urlData?.publicUrl || null;
    } catch (error) {
      console.error('Error in file upload:', error);
      return null;
    }
  };

  // Update handleFieldChange to store files
  const handleFieldChange = async (fieldId: string, value: string, file?: File) => {
    // Update the template fields value
    setTemplateFields((prev: TemplateFields) => ({
      ...prev,
      [fieldId]: value
    }));
    
    // If a file was provided, store it and upload immediately for preview
    if (file) {
      setFieldFiles(prev => ({
        ...prev,
        [fieldId]: file
      }));
      
      // Get the field type to determine upload bucket
      const template = templates.find(t => t.id === selectedTemplate);
      const field = template?.fields.find(f => f.id === fieldId);
      
      if (field && (field.type === 'image' || field.type === 'image_upload' || 
                   field.type === 'document' || field.type === 'document_upload')) {
        try {
          // Upload the file immediately for preview
          const fileUrl = await uploadFileToBucket(file, field.type);
          if (fileUrl) {
            // Update template fields with the URL
            setTemplateFields((prev: TemplateFields) => ({
              ...prev,
              [fieldId]: fileUrl
            }));
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          // Keep the filename as fallback
        }
      }
    }
    
    // Regenerate description after a short delay to allow state updates
    setTimeout(() => {
      generateDescriptionFromTemplate();
    }, 100);
  };

  // Generate description from template fields
  const generateDescriptionFromTemplate = () => {
    if (!selectedTemplate) return;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    let descriptionContent = '';
    
    template.fields.forEach(field => {
      const value = templateFields[field.id];
      if (value?.trim()) {
        // Check if this is a file field and if the value is a URL
        const isFileField = field.type === 'image' || field.type === 'image_upload' || 
                           field.type === 'document' || field.type === 'document_upload';
        const isUrl = value.startsWith('http');
        
        if (isFileField && isUrl) {
          // For file fields with URLs, include both the label and the URL
          descriptionContent += `**${field.label}**\n${value}\n\n`;
        } else {
          // For regular text fields, include as before
          descriptionContent += `**${field.label}**\n${value}\n\n`;
        }
      }
    });
    
    onChange({
      target: {
        name: 'description',
        value: descriptionContent.trim()
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  // Handle saving progress to the database
  const handleSaveProgress = async () => {
    console.log("Save Progress button clicked");
    setIsSaving(true);
    try {
      // Upload files first and get their URLs
      const fileUrls: Record<string, string> = {};
      let updatedTemplateFields = { ...templateFields };
      
      if (descriptionMode === 'template' && selectedTemplate) {
        const template = templates.find(t => t.id === selectedTemplate);
        if (template) {
          // Process each field that might have a file
          for (const field of template.fields) {
            const fieldId = field.id;
            const fieldType = field.type;
            const file = fieldFiles[fieldId];
            
            // If this field has a file to upload
            if (file && (fieldType === 'image' || fieldType === 'image_upload' || 
                         fieldType === 'document' || fieldType === 'document_upload')) {
              // Upload the file
              const fileUrl = await uploadFileToBucket(file, fieldType);
              if (fileUrl) {
                fileUrls[fieldId] = fileUrl;
                
                // Update templateFields with the URL instead of just the filename
                updatedTemplateFields[fieldId] = fileUrl;
              }
            }
          }
          
          // Update state with new template fields
          setTemplateFields(updatedTemplateFields);
          
          // Regenerate description with file URLs
          let descriptionContent = '';
          template.fields.forEach(field => {
            const value = updatedTemplateFields[field.id];
            if (value?.trim()) {
              descriptionContent += `**${field.label}**\n${value}\n\n`;
            }
          });
          
          // Update the description in the form data
          onChange({
            target: {
              name: 'description',
              value: descriptionContent.trim()
            }
          });
        }
      }
      
      // Create metadata object to store template-related information
      const metadata = {
        descriptionMode,
        selectedTemplate,
        templateFields: updatedTemplateFields,
        fileUrls, // Include the file URLs in metadata
        criteria // Include criteria selection
      };
      
      // Prepare data for saving
      const progressData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        hours: formData.hours,
        status: 'draft',
        step: 'description',
        metadata: metadata,
        criteria: criteria, // Include criteria data
        opportunity_id: opportunityId
      };

      console.log("Saving data:", progressData);

      // Save to database
      const result = await saveOpportunityProgress(progressData);
      
      console.log("Save result:", result);
      
      if (result.error) {
        console.error("Save error:", result.error);
        toast.error('Failed to save progress: ' + result.error.message);
      } else {
        toast.success('Progress saved successfully!');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('An error occurred while saving progress');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProgress) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#556B2F] border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading your saved progress...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Start by providing basic details about the opportunity.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 flex items-center">
              <span className="bg-[#556B2F]/10 text-[#556B2F] p-1 rounded-md mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
              Opportunity Title *
            </label>
            <span className="text-xs text-gray-500">
              {formData.title.length}/100 characters
            </span>
          </div>

          <div className="mt-1 relative rounded-md shadow-sm group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#556B2F]/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <input
              type="text"
              name="title"
              id="title"
              maxLength={100}
              value={formData.title}
              onChange={onChange}
              className={`pl-10 pr-3 py-3 block w-full border-gray-300 rounded-md shadow-sm 
                focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] 
                group-hover:border-[#556B2F]/30 transition-all duration-200
                text-base ${
                errors.title ? 'border-red-300 bg-red-50' : ''
              }`}
              placeholder="e.g., Volunteer Teacher for After-School Program"
            />
            {formData.title.length > 0 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs">
                  {formData.title.length > 0 ? '✓' : ''}
                </span>
              </div>
            )}
          </div>

          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.title}
            </p>
          )}
          
          <p className="mt-1 text-xs text-gray-500 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-[#556B2F]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Create a clear, descriptive title that will attract the right volunteers. Aim for 5-10 words that highlight the opportunity's core purpose.
            </span>
          </p>
        </div>

        {/* Criteria Selection Section */}
        {formData.opportunityType && (
          <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 rounded-xl p-6 border border-[#556B2F]/10 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#556B2F] text-white text-sm mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#556B2F]">Opportunity Criteria</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Select relevant criteria to help applicants understand the opportunity better.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(getCriteriaOptions(formData.opportunityType)).map(([field, options]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field === 'contractType' ? 'Contract Type' :
                     field === 'level' ? 'Level' :
                     field === 'sector' ? 'Sector/Industry' :
                     field === 'location' ? 'Location' :
                     field === 'fundingType' ? 'Type' :
                     field === 'eligibility' ? 'Eligibility' :
                     field === 'amountRange' ? 'Amount Range' :
                     field === 'purpose' ? 'Purpose' :
                     field === 'format' ? 'Format' :
                     field === 'duration' ? 'Duration' :
                     field === 'certification' ? 'Certification' :
                     field === 'cost' ? 'Cost' :
                     field}
                  </label>
                  <select
                    value={typeof criteria[field as keyof CriteriaSelection] === 'string' ? criteria[field as keyof CriteriaSelection] as string : ''}
                    onChange={(e) => handleCriteriaChange(field, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-10 hover:border-[#556B2F]/50 transition-colors"
                  >
                    <option value="">Select {field === 'contractType' ? 'contract type' :
                     field === 'level' ? 'level' :
                     field === 'sector' ? 'sector' :
                     field === 'location' ? 'location' :
                     field === 'fundingType' ? 'funding type' :
                     field === 'eligibility' ? 'eligibility' :
                     field === 'amountRange' ? 'amount range' :
                     field === 'purpose' ? 'purpose' :
                     field === 'format' ? 'format' :
                     field === 'duration' ? 'duration' :
                     field === 'certification' ? 'certification' :
                     field === 'cost' ? 'cost' :
                     field}...</option>
                    {options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              {/* Cross-cutting filter - Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline / Application Period
                </label>
                <input
                  type="date"
                  value={criteria.deadline || ''}
                  onChange={(e) => handleCriteriaChange('deadline', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 pl-3 pr-3 hover:border-[#556B2F]/50 transition-colors"
                />
              </div>
            </div>
            
            {/* Selected Criteria Summary */}
            {(Object.values(criteria).some(value => value) || Object.keys(customFilters).length > 0) && (
              <div className="mt-6 pt-4 border-t border-[#556B2F]/20">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Criteria:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(criteria).map(([field, value]) => {
                    if (!value || field === 'customFilters') return null;
                    return (
                      <span key={field} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#556B2F]/10 text-[#556B2F]">
                        <span className="mr-1">
                          {field === 'contractType' ? 'Contract:' :
                           field === 'level' ? 'Level:' :
                           field === 'sector' ? 'Sector:' :
                           field === 'location' ? 'Location:' :
                           field === 'fundingType' ? 'Type:' :
                           field === 'eligibility' ? 'Eligibility:' :
                           field === 'amountRange' ? 'Amount:' :
                           field === 'purpose' ? 'Purpose:' :
                           field === 'format' ? 'Format:' :
                           field === 'duration' ? 'Duration:' :
                           field === 'certification' ? 'Certification:' :
                           field === 'cost' ? 'Cost:' :
                           field === 'deadline' ? 'Deadline:' :
                           field + ':'}
                        </span>
                        {value}
                      </span>
                    );
                  })}
                  
                  {/* Display custom filters */}
                  {Object.entries(customFilters).map(([filterName, filterValue]) => (
                    <span key={`custom-${filterName}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#6B8E23]/10 text-[#6B8E23]">
                      <span className="mr-1">{filterName}:</span>
                      {filterValue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Filters Section */}
        {formData.opportunityType && (
          <div className="bg-gradient-to-r from-[#6B8E23]/5 to-[#556B2F]/5 rounded-xl p-6 border border-[#6B8E23]/10 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#6B8E23] text-white text-sm mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#6B8E23]">Custom Filters</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Add additional criteria specific to your opportunity that aren't covered by the standard filters above.
            </p>
            
            {/* Add Custom Filter Form */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={newCustomFilterName}
                    onChange={(e) => setNewCustomFilterName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newCustomFilterName.trim() && newCustomFilterValue.trim()) {
                        handleAddCustomFilter();
                      }
                    }}
                    placeholder="e.g., Language Requirements"
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#6B8E23] focus:border-[#6B8E23] sm:text-sm py-2 pl-3 pr-3 hover:border-[#6B8E23]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Value
                  </label>
                  <input
                    type="text"
                    value={newCustomFilterValue}
                    onChange={(e) => setNewCustomFilterValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newCustomFilterName.trim() && newCustomFilterValue.trim()) {
                        handleAddCustomFilter();
                      }
                    }}
                    placeholder="e.g., English, French, Spanish"
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#6B8E23] focus:border-[#6B8E23] sm:text-sm py-2 pl-3 pr-3 hover:border-[#6B8E23]/50 transition-colors"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddCustomFilter}
                    disabled={!newCustomFilterName.trim() || !newCustomFilterValue.trim()}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#6B8E23] to-[#556B2F] hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Filter
                  </button>
                </div>
              </div>
            </div>
            
            {/* Display Custom Filters */}
            {Object.keys(customFilters).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Filters:</h4>
                <div className="space-y-2">
                  {Object.entries(customFilters).map(([filterName, filterValue]) => (
                    <div key={filterName} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{filterName}:</span>
                        <span className="ml-2 text-sm text-gray-600">{filterValue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomFilter(filterName)}
                        className="ml-3 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Help Text */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Tips for custom filters:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use clear, descriptive names (e.g., "Language Requirements", "Age Range")</li>
                    <li>Keep values concise but informative</li>
                    <li>These filters will help applicants understand specific requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How do you wish to create your opportunity description? *
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                descriptionMode === 'template' 
                  ? 'border-[#556B2F] bg-[#556B2F]/5 ring-2 ring-[#556B2F]/20' 
                  : 'border-gray-200 hover:border-[#556B2F]/30'
              }`}
              onClick={() => setDescriptionMode('template')}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${
                descriptionMode === 'template' 
                  ? 'bg-[#556B2F] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  descriptionMode === 'template' ? 'text-[#556B2F]' : 'text-gray-700'
                }`}>
                  Use a Template
                </p>
                <p className="text-xs text-gray-500">
                  Choose from predefined templates with structured fields
                </p>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                descriptionMode === 'editor' 
                  ? 'border-[#556B2F] bg-[#556B2F]/5 ring-2 ring-[#556B2F]/20' 
                  : 'border-gray-200 hover:border-[#556B2F]/30'
              }`}
              onClick={() => setDescriptionMode('editor')}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${
                descriptionMode === 'editor' 
                  ? 'bg-[#556B2F] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <PencilSquareIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  descriptionMode === 'editor' ? 'text-[#556B2F]' : 'text-gray-700'
                }`}>
                  Use Text Editor
                </p>
                <p className="text-xs text-gray-500">
                  Create a customized description with rich formatting
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          
          {descriptionMode === 'template' ? (
            <div className="mt-3 space-y-6">
              <div className="relative">
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                  Select a Template
                </label>
                <select
                  id="template"
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm rounded-md bg-white shadow-sm hover:border-[#556B2F]/50 transition-colors"
                  disabled={loading}
                >
                  <option value="">Select a template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
                {!loading && !selectedTemplate && (
                  <div className="mt-3 rounded-md bg-[#556B2F]/5 p-3 border border-[#556B2F]/10">
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#556B2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Select a template to use predefined fields for your opportunity
                    </p>
                  </div>
                )}
              </div>
              
              {selectedTemplate && !loading && (
                <div className="bg-white p-6 border border-gray-200 rounded-md shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-[#556B2F]/5 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-[#556B2F]/5 rounded-full"></div>
                  
                  <div className="relative">
                    <h3 className="text-lg font-medium text-[#556B2F] mb-3">
                      {templates.find(t => t.id === selectedTemplate)?.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      {templates.find(t => t.id === selectedTemplate)?.description}
                    </p>
                  </div>
                  
                  {templates.find(t => t.id === selectedTemplate)?.fields.map((field) => {
                    // Safely cast the field type to string to avoid TypeScript type errors
                    const fieldType = field.type as string;
                    
                    return (
                      <div key={field.id} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label 
                            htmlFor={`field-${field.id}`} 
                            className="block text-sm font-medium text-gray-700"
                          >
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {fieldType === 'title' ? 'Title' :
                             fieldType === 'subtitle' ? 'Subtitle' :
                             fieldType === 'text' ? 'Text Field' :
                             fieldType === 'multiline' ? 'Multiline Text' :
                             fieldType === 'date' ? 'Date' :
                             fieldType === 'location' ? 'Location' :
                             fieldType === 'number' ? 'Number' :
                             fieldType === 'dropdown' ? 'Dropdown' :
                             fieldType === 'image_upload' || fieldType === 'image' ? 'Image Upload' :
                             fieldType === 'document_upload' || fieldType === 'document' ? 'Document Upload' :
                             'Field'}
                          </span>
                        </div>
                        
                        {fieldType === 'title' && (
                          <div className="relative mt-1 group">
                            <input
                              type="text"
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-3 py-2.5 font-medium text-base group-hover:border-[#556B2F]/50"
                              placeholder={field.placeholder}
                            />
                          </div>
                        )}
                        
                        {fieldType === 'subtitle' && (
                          <div className="relative mt-1 group">
                            <input
                              type="text"
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-3 py-2.5 font-medium text-sm group-hover:border-[#556B2F]/50"
                              placeholder={field.placeholder}
                            />
                          </div>
                        )}
                        
                        {fieldType === 'text' && (
                          <div className="relative mt-1 group">
                            <input
                              type="text"
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-3 py-2.5 group-hover:border-[#556B2F]/50"
                              placeholder={field.placeholder}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {field.required && !templateFields[field.id] && (
                                <span className="text-red-500 text-xs italic">Required</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {fieldType === 'multiline' && (
                          <div className="relative mt-1 group">
                            <textarea
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              rows={3}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-3 py-2 resize-none group-hover:border-[#556B2F]/50"
                              placeholder={field.placeholder}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {templateFields[field.id]?.length || 0} chars
                            </div>
                          </div>
                        )}
                        
                        {fieldType === 'date' && (
                          <div className="relative mt-1 group">
                            <input
                              type="date"
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-3 py-2.5 group-hover:border-[#556B2F]/50"
                              placeholder={field.placeholder}
                            />
                          </div>
                        )}
                        
                        {fieldType === 'location' && (
                          <div className="relative mt-1 group">
                            <input
                              type="text"
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-3 py-2.5 group-hover:border-[#556B2F]/50"
                              placeholder={field.placeholder || "Enter location"}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        {fieldType === 'number' && (
                          <div className="relative mt-1 group">
                            <input
                              type="number"
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-3 py-2.5 group-hover:border-[#556B2F]/50"
                              placeholder={field.placeholder}
                            />
                          </div>
                        )}
                        
                        {fieldType === 'dropdown' && (
                          <div className="relative mt-1 group">
                            <select
                              id={`field-${field.id}`}
                              value={templateFields[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm transition-all pl-3 pr-10 py-2.5 group-hover:border-[#556B2F]/50"
                            >
                              <option value="">Select an option...</option>
                              {field.options && field.options.map((option: string, index: number) => (
                                <option key={index} value={option}>{option}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        {(fieldType === 'image_upload' || fieldType === 'image') && (
                          <div className="relative mt-1 group">
                            {templateFields[field.id] && templateFields[field.id].startsWith('http') ? (
                              // Show image preview if URL is available
                              <div className="space-y-2">
                                <div className="relative">
                                  <img 
                                    src={templateFields[field.id]} 
                                    alt="Uploaded image preview"
                                    className="w-full max-w-md h-auto rounded-lg border border-gray-300 shadow-sm"
                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTemplateFields(prev => ({
                                        ...prev,
                                        [field.id]: ''
                                      }));
                                      setFieldFiles(prev => ({
                                        ...prev,
                                        [field.id]: null
                                      }));
                                      generateDescriptionFromTemplate();
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
                              </div>
                            ) : (
                              // Show upload area
                              <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] transition-all group-hover:border-[#556B2F]/50 p-4">
                                <div className="space-y-1 text-center">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8m12 0a4 4 0 01-4-4v-4m8 0a4 4 0 004 4h4m-4-4v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <div className="text-sm text-gray-600">
                                    <label htmlFor={`field-${field.id}`} className="relative cursor-pointer rounded-md font-medium text-[#556B2F] hover:text-[#556B2F]/70 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#556B2F]">
                                      <span>Upload an image</span>
                                      <input 
                                        id={`field-${field.id}`} 
                                        name={`field-${field.id}`} 
                                        type="file" 
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            // Store both the filename and the file object
                                            handleFieldChange(field.id, file.name, file);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <p className="text-xs text-gray-500">{templateFields[field.id] || 'PNG, JPG, GIF up to 10MB'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {(fieldType === 'document_upload' || fieldType === 'document') && (
                          <div className="relative mt-1 group">
                            {templateFields[field.id] && templateFields[field.id].startsWith('http') ? (
                              // Show document uploaded status
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                      <p className="text-sm font-medium text-green-800">Document uploaded successfully</p>
                                      <p className="text-xs text-green-600">File will be available for download</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTemplateFields(prev => ({
                                        ...prev,
                                        [field.id]: ''
                                      }));
                                      setFieldFiles(prev => ({
                                        ...prev,
                                        [field.id]: null
                                      }));
                                      generateDescriptionFromTemplate();
                                    }}
                                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Show upload area
                              <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] transition-all group-hover:border-[#556B2F]/50 p-4">
                                <div className="space-y-1 text-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div className="text-sm text-gray-600">
                                    <label htmlFor={`field-${field.id}`} className="relative cursor-pointer rounded-md font-medium text-[#556B2F] hover:text-[#556B2F]/70 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#556B2F]">
                                      <span>Upload a document</span>
                                      <input 
                                        id={`field-${field.id}`} 
                                        name={`field-${field.id}`} 
                                        type="file" 
                                        className="sr-only"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            // Store both the filename and the file object
                                            handleFieldChange(field.id, file.name, file);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <p className="text-xs text-gray-500">{templateFields[field.id] || 'PDF, DOC, DOCX up to 10MB'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="relative mt-6 pt-6 border-t border-dashed border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#556B2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Description Preview
                      </h4>
                      
                      <span className="text-xs font-medium px-2 py-1 bg-[#556B2F]/10 text-[#556B2F] rounded-full">
                        Auto-Generated
                      </span>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm whitespace-pre-line shadow-inner overflow-auto max-h-48">
                      {formData.description ? (
                        <div dangerouslySetInnerHTML={{ 
                          __html: formData.description.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#556B2F]">$1</strong>') 
                        }} />
                      ) : (
                        <p className="text-gray-400 italic text-center py-4">
                          No description generated yet. Fill in the fields above.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#556B2F] border-t-transparent"></div>
                  <span className="ml-3 text-sm text-gray-600">Loading templates...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              
              <RichTextEditor 
                value={formData.description}
                onChange={handleEditorChange}
              />
              
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use the rich text editor to format your description. Include responsibilities, requirements, impact, and any other relevant details.
              </p>
            </div>
          )}
          
          {errors.description && descriptionMode === 'editor' && !editorReady && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Describe the opportunity in detail, what volunteers will do, and the impact they'll have.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
           
           
           
        </div>
      </div>
      
      <div className="pt-5">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSaveProgress();
            }}
            disabled={isSaving}
            className={`inline-flex items-center px-4 py-2 border border-[#556B2F] text-sm font-medium rounded-md shadow-sm text-[#556B2F] bg-white hover:bg-[#556B2F]/5 transition-all duration-200 ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Progress'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md transition-all duration-200"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
} 