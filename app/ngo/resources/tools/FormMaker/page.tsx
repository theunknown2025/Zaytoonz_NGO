'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ListBulletIcon,
  ChevronDownIcon,
  PhotoIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { saveFormTemplate, publishFormTemplate, saveFormImage, getUserForms, getFormById, updateFormTemplate } from './services/formService';
import { FormData, Section, Question, QuestionType } from './types';
import { createClient } from '@supabase/supabase-js';
import ListForms from './ListForms';
import NewForm from './NewForm';
import ZaytoonzTemplates from './ZaytoonzTemplates';
import { useAuth } from '@/app/lib/auth';

// Lazy Supabase client initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(supabaseUrl, supabaseKey);
}

// Implement a simple toast function if there's no toast library available
const toast = {
  success: (message: string) => {
    console.log(message);
    // You can replace this with a proper toast notification if available
    alert(message);
  },
  error: (message: string) => {
    console.error(message);
    // You can replace this with a proper toast notification if available
    alert(`Error: ${message}`);
  }
};

export default function FormMakerTool() {
  const { user } = useAuth(); // Get current user from auth context
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'zaytoonz'>('list');
  const [displayMode, setDisplayMode] = useState<'sections' | 'all'>('sections');
  const [formTitle, setFormTitle] = useState('New Form');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [editFormId, setEditFormId] = useState<string | null>(null);
  
  // Form sections
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Basic Information',
      questions: [
        { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
        { id: '2', type: 'text', label: 'Email Address', placeholder: 'Enter your email', required: true },
      ]
    }
  ]);
  
  // For preview
  const [previewActive, setPreviewActive] = useState(false);
  
  // For form list tab
  const [savedForms, setSavedForms] = useState<Array<{
    id: string;
    title: string;
    sections: number;
    questions: number;
    status: string;
    responses: number;
  }>>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [formsError, setFormsError] = useState<string | null>(null);
  
  // Active section for adding questions
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'> & { id?: string }>({
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
  });
  
  // For editing existing questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  
  const [editingQuestionSectionId, setEditingQuestionSectionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    type: QuestionType;
    label: string;
    placeholder: string;
    options: string;
    required: boolean;
  }>({
    type: 'text',
    label: '',
    placeholder: '',
    options: '',
    required: false,
  });
  
  // Check if Supabase is properly configured
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Add debug state
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Handlers
  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: `Section ${sections.length + 1}`,
      questions: []
    };
    
    setSections([...sections, newSection]);
    setActiveSectionId(newSection.id);
  };
  
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, title } : section
    ));
  };
  
  const handleDeleteSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== sectionId));
      if (activeSectionId === sectionId) {
        setActiveSectionId(sections[0].id);
      }
    }
  };
  
  const handleAddQuestion = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setShowAddQuestion(true);
    setNewQuestion({
      type: 'text',
      label: '',
      placeholder: '',
      options: [''],
      required: false,
    });
  };
  
  const handleSaveQuestion = (sectionId: string) => {
    if (newQuestion.label) {
      const question: Question = {
        id: Date.now().toString(),
        type: newQuestion.type as QuestionType,
        label: newQuestion.label,
        placeholder: newQuestion.placeholder || '',
        required: newQuestion.required || false,
        options: newQuestion.type === 'radio' || newQuestion.type === 'checkbox' || newQuestion.type === 'select' 
          ? newQuestion.options
          : undefined
      };
      
      setSections(sections.map(section => 
        section.id === sectionId 
          ? { ...section, questions: [...section.questions, question] }
          : section
      ));
      
      setNewQuestion({
        type: 'text',
        label: '',
        placeholder: '',
        required: false,
        options: ['']
      });
      
      setShowAddQuestion(false);
      toast.success("Question added successfully!");
    }
  };
  
  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
        : section
    ));
  };
  
  const handleUpdateOptions = (index: number, value: string) => {
    if (!newQuestion.options) return;
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };
  
  const handleAddOption = () => {
    if (!newQuestion.options) return;
    setNewQuestion({ 
      ...newQuestion, 
      options: [...newQuestion.options, ''] 
    });
  };
  
  const handleRemoveOption = (index: number) => {
    if (!newQuestion.options) return;
    const newOptions = [...newQuestion.options];
    newOptions.splice(index, 1);
    setNewQuestion({ ...newQuestion, options: newOptions });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Save the file for later upload
      setFormImageFile(file);
      
      // Display preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Fetch forms from database when tab changes to 'list'
  useEffect(() => {
    if (activeTab === 'list') {
      // Test supabase connection first
      testSupabaseConnection();
      // Then fetch forms
      fetchUserForms();
    }
  }, [activeTab]);

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      if (!isSupabaseConfigured) {
        console.error('Supabase is not configured properly');
        return;
      }
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('forms_templates').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection successful:', data);
      }
    } catch (e) {
      console.error('Error testing Supabase connection:', e);
    }
  };

  // Function to fetch user forms
  const fetchUserForms = async () => {
    setIsLoadingForms(true);
    setFormsError(null);
    
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        setFormsError('Database configuration error: Missing Supabase environment variables. Please check .env.local file.');
        setIsLoadingForms(false);
        return;
      }
      
      // Fetch all forms from the database
      const result = await getUserForms(user?.id);
      
      if (result.success && Array.isArray(result.forms)) {
        // If no forms found, display empty state
        if (result.forms.length === 0) {
          setSavedForms([]);
          setIsLoadingForms(false);
          return;
        }
        
        // Transform the data to match the UI requirements
        const formattedForms = result.forms.map(form => {
          // Parse the sections data
          let sectionsData = [];
          
          try {
            if (typeof form.sections === 'string') {
              // If it's a JSON string, parse it
              sectionsData = JSON.parse(form.sections);
            } else if (Array.isArray(form.sections)) {
              // If it's already an array, use it directly
              sectionsData = form.sections;
            } else if (form.sections && typeof form.sections === 'object') {
              // If it's a JSONB object from Postgres, it should already be parsed
              sectionsData = form.sections;
            }
          } catch (e) {
            console.error('Error parsing sections data:', e);
            sectionsData = [];
          }
          
          // Count sections and questions
          const numSections = Array.isArray(sectionsData) ? sectionsData.length : 0;
          const numQuestions = Array.isArray(sectionsData) 
            ? sectionsData.reduce((total, section) => {
                return total + (Array.isArray(section.questions) ? section.questions.length : 0);
              }, 0)
            : 0;
          
          return {
            id: form.id,
            title: form.title || 'Untitled Form',
            sections: numSections,
            questions: numQuestions,
            status: form.status || 'draft',
            responses: 0 // We don't have response count yet
          };
        });
        
        setSavedForms(formattedForms);
      } else {
        // Set error state
        setFormsError(result.error || 'Failed to load forms');
        setSavedForms([]);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setFormsError('Failed to load forms: ' + (error instanceof Error ? error.message : String(error)));
      setSavedForms([]);
    } finally {
      setIsLoadingForms(false);
    }
  };

  // Load a form for editing
  const handleEditForm = async (formId: string) => {
    setIsSaving(true);
    
    try {
      // Set the editFormId to pass to the NewForm component
      setEditFormId(formId);
      
      // Switch to the edit tab
      setActiveTab('new');
      
      // The form data will be loaded by the NewForm component using its useEffect
    } catch (error) {
      console.error('Error preparing to edit form:', error);
      toast.error('Failed to prepare form for editing');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a form
  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const supabase = getSupabaseClient();
      
      // First check if form exists
      const { data: checkData, error: checkError } = await supabase
        .from('forms_templates')
        .select('id')
        .eq('id', formId)
        .single();
        
      if (checkError) {
        toast.error('Form not found or could not be accessed');
        setIsSaving(false);
        return;
      }
      
      // Delete any associated images
      const { data: imageData, error: imageError } = await supabase
        .from('form_pictures')
        .select('file_path')
        .eq('form_id', formId);
        
      if (!imageError && imageData && imageData.length > 0) {
        // Delete files from storage
        for (const image of imageData) {
          if (image.file_path) {
            await supabase.storage
              .from('forms-pictures')
              .remove([image.file_path]);
          }
        }
        
        // Delete image records
        await supabase
          .from('form_pictures')
          .delete()
          .eq('form_id', formId);
      }
      
      // Delete the form
      const { error } = await supabase
        .from('forms_templates')
        .delete()
        .eq('id', formId);
        
      if (error) {
        console.error('Error deleting form:', error);
        toast.error('Failed to delete form: ' + error.message);
        return;
      }
      
      // Remove from the list
      setSavedForms(savedForms.filter(form => form.id !== formId));
      toast.success('Form deleted successfully');
      
      // Refresh the forms list
      fetchUserForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  // Update the handleSaveForm function to refresh the forms list
  const handleSaveForm = async () => {
    setIsSaving(true);
    
    try {
      // Prepare the form data
      const formData: FormData = {
        title: formTitle,
        description: formDescription,
        sections: sections
      };
      
      // Let the backend handle the user ID instead of using a hardcoded one
      // const userId = user?.id || '00000000-0000-0000-0000-000000000000'; // Use Clerk user ID if available
      
      // Check if we're updating or creating
      let result;
      if (currentFormId) {
        // Update existing form
        result = await updateFormTemplate(currentFormId, formData);
        if (!result.success) {
          toast.error(result.error || 'Failed to update form');
          setIsSaving(false);
          return;
        }
      } else {
        // Save new form
        result = await saveFormTemplate(formData, user?.id);
        
        if (!result.success) {
          toast.error(result.error || 'Failed to save form');
          setIsSaving(false);
          return;
        }
        
        const formId = result.formId;
        setCurrentFormId(formId || null);
      }
      
      // Upload form image if available
      if (currentFormId && formImageFile) {
        const imageResult = await saveFormImage(currentFormId, formImageFile);
        
        if (!imageResult.success) {
          console.error('Failed to save form image:', imageResult.error);
          // Continue even if image upload fails
        }
        
        // Clear the file after upload
        setFormImageFile(null);
      }
      
      toast.success(currentFormId ? 'Form updated successfully!' : 'Form saved as draft!');
      
      // Refresh the forms list if in list view
      if (activeTab === 'list') {
        fetchUserForms();
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePublishForm = async () => {
    if (!currentFormId) {
      // Save the form first if it's not saved yet
      await handleSaveForm();
      
      // If still no formId after saving, return
      if (!currentFormId) {
        toast.error('Please save the form first');
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      // Publish the form
      const result = await publishFormTemplate(currentFormId);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to publish form');
        return;
      }
      
      toast.success('Form published successfully!');
      
      // Update the status in the saved forms list
      setSavedForms(savedForms.map(form => 
        form.id === currentFormId 
          ? { ...form, status: 'published' } 
          : form
      ));
      
      // Switch to the forms list tab
      setActiveTab('list');
    } catch (error) {
      console.error('Error publishing form:', error);
      toast.error('Failed to publish form');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditQuestion = (questionId: string, sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const question = section.questions.find(q => q.id === questionId);
    if (!question) return;
    
    setEditingQuestionId(questionId);
    setEditingSectionId(sectionId);
    setEditingQuestion(question);
    setEditFormData({
      type: question.type,
      label: question.label,
      placeholder: question.placeholder || '',
      options: question.options?.join(', ') || '',
      required: question.required || false,
    });
  };
  
  const handleSaveEditedQuestion = () => {
    if (!editingQuestionId || !editingSectionId) return;

    const updatedSections = sections.map(section => {
      if (section.id === editingSectionId) {
        return {
          ...section,
          questions: section.questions.map(question => {
            if (question.id === editingQuestionId) {
              return {
                ...question,
                type: editFormData.type,
                label: editFormData.label,
                placeholder: editFormData.placeholder,
                options: editFormData.options.split(',').map(opt => opt.trim()).filter(opt => opt !== ''),
                required: editFormData.required,
              };
            }
            return question;
          }),
        };
      }
      return section;
    });

    setSections(updatedSections);

    // Reset edit state
    setEditingQuestionId(null);
    setEditingSectionId(null);
    setEditFormData({
      type: 'text',
      label: '',
      placeholder: '',
      options: '',
      required: false,
    });

    toast.success('Question updated successfully!');
  };
  
  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingSectionId(null);
    setEditFormData({
      type: 'text',
      label: '',
      placeholder: '',
      options: '',
      required: false,
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditFormData({
        ...editFormData,
        [name]: checked,
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
  };

  const handleUpdateQuestion = (field: keyof Question, value: any) => {
    setNewQuestion({
      ...newQuestion,
      [field]: value
    });
  };

  // Handle form creation
  const handleNewForm = () => {
    setEditFormId(null);
    setActiveTab('new');
  };

  // Handle form save/publish
  const handleFormSaved = () => {
    setActiveTab('list');
  };

  // Handle cancel
  const handleCancel = () => {
    setActiveTab('list');
  };

  // Handle use template from Zaytoonz Templates
  const handleUseTemplate = (template: any) => {
    // Pre-populate form with template data
    setFormTitle(template.title);
    setFormDescription(template.description);
    setSections(template.sections || []);
    
    // Switch to new form tab
    setActiveTab('new');
    
    // Show success message
    toast.success(`Template "${template.title}" loaded successfully!`);
  };

  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <DocumentTextIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">Form Maker</h1>
          <p className="mt-2 text-sm text-gray-600">Create custom forms for your organization's needs</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'new' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Form
          </button>
          <button
            onClick={() => {
              setEditFormId(null);
              setActiveTab('list');
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'list' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Forms
          </button>
          <button
            onClick={() => setActiveTab('zaytoonz')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'zaytoonz' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Zaytoonz Templates
          </button>
        </div>
        
        {/* New Form Tab */}
        {activeTab === 'new' && (
          <NewForm 
            onFormSaved={handleFormSaved} 
            onCancel={handleCancel} 
            editFormId={editFormId}
            toast={toast}
          />
        )}
        
        {/* List Forms Tab */}
        {activeTab === 'list' && (
          <ListForms 
            onNewForm={handleNewForm} 
            onEditForm={handleEditForm}
            toast={toast}
          />
        )}
        
        {/* Zaytoonz Templates Tab */}
        {activeTab === 'zaytoonz' && (
          <ZaytoonzTemplates 
            onUseTemplate={handleUseTemplate}
          />
        )}
      </div>
    </div>
  );
}