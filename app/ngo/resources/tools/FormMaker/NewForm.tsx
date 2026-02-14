'use client';

import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { saveFormTemplate, publishFormTemplate, saveFormImage, getFormById, updateFormTemplate } from './services/formService';
import { FormData, Section, Question, QuestionType } from './types';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to prevent build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  
  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client during build if env vars are missing
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Types for component props
interface NewFormProps {
  onFormSaved: () => void;
  onCancel: () => void;
  editFormId?: string | null;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
}

export default function NewForm({ onFormSaved, onCancel, editFormId = null, toast }: NewFormProps) {
  const [displayMode, setDisplayMode] = useState<'sections' | 'all'>('sections');
  const [formTitle, setFormTitle] = useState('New Form');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<string | null>(editFormId);
  
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

  // Load form data if in edit mode
  useEffect(() => {
    if (editFormId) {
      loadFormData(editFormId);
    }
  }, [editFormId]);

  // Load form data for editing
  const loadFormData = async (formId: string) => {
    setIsSaving(true);
    
    try {
      const result = await getFormById(formId);
      
      if (result.success && result.form) {
        const form = result.form;
        
        // Update the form state
        setFormTitle(form.title);
        setFormDescription(form.description || '');
        
        // Parse sections data
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
        
        setSections(sectionsData);
        setCurrentFormId(form.id);
        
        // Set form image if available
        if (form.form_pictures && form.form_pictures.length > 0) {
          const imagePath = form.form_pictures[0].file_path;
          try {
            const imageUrl = supabase.storage.from('forms-pictures').getPublicUrl(imagePath).data.publicUrl;
            setFormImage(imageUrl);
          } catch (e) {
            console.error('Error getting image URL:', e);
            setFormImage(null);
          }
        } else {
          setFormImage(null);
        }
      } else {
        toast.error(result.error || 'Failed to load form');
      }
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Failed to load form');
    } finally {
      setIsSaving(false);
    }
  };

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
  
  const handleSaveForm = async () => {
    setIsSaving(true);
    
    try {
      // Prepare the form data
      const formData: FormData = {
        title: formTitle,
        description: formDescription,
        sections: sections
      };
      
      // We'll let the backend handle the user ID - removing hardcoded value
      // const userId = '00000000-0000-0000-0000-000000000000'; // Demo user ID
      
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
        // Save new form - pass undefined for userId to let the backend handle it
        result = await saveFormTemplate(formData, undefined);
        
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
      
      // Notify parent component that form was saved
      onFormSaved();
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
      
      // Notify parent component that form was published
      onFormSaved();
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

  // Functions to reorder sections
  const handleMoveSectionUp = (sectionId: string) => {
    const sectionIndex = sections.findIndex(section => section.id === sectionId);
    if (sectionIndex <= 0) return; // Already at the top
    
    const updatedSections = [...sections];
    const temp = updatedSections[sectionIndex];
    updatedSections[sectionIndex] = updatedSections[sectionIndex - 1];
    updatedSections[sectionIndex - 1] = temp;
    
    setSections(updatedSections);
  };
  
  const handleMoveSectionDown = (sectionId: string) => {
    const sectionIndex = sections.findIndex(section => section.id === sectionId);
    if (sectionIndex >= sections.length - 1) return; // Already at the bottom
    
    const updatedSections = [...sections];
    const temp = updatedSections[sectionIndex];
    updatedSections[sectionIndex] = updatedSections[sectionIndex + 1];
    updatedSections[sectionIndex + 1] = temp;
    
    setSections(updatedSections);
  };
  
  // Functions to reorder questions within a section
  const handleMoveQuestionUp = (sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const questionIndex = section.questions.findIndex(q => q.id === questionId);
    if (questionIndex <= 0) return; // Already at the top
    
    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        const updatedQuestions = [...s.questions];
        const temp = updatedQuestions[questionIndex];
        updatedQuestions[questionIndex] = updatedQuestions[questionIndex - 1];
        updatedQuestions[questionIndex - 1] = temp;
        
        return {
          ...s,
          questions: updatedQuestions
        };
      }
      return s;
    });
    
    setSections(updatedSections);
  };
  
  const handleMoveQuestionDown = (sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const questionIndex = section.questions.findIndex(q => q.id === questionId);
    if (questionIndex >= section.questions.length - 1) return; // Already at the bottom
    
    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        const updatedQuestions = [...s.questions];
        const temp = updatedQuestions[questionIndex];
        updatedQuestions[questionIndex] = updatedQuestions[questionIndex + 1];
        updatedQuestions[questionIndex + 1] = temp;
        
        return {
          ...s,
          questions: updatedQuestions
        };
      }
      return s;
    });
    
    setSections(updatedSections);
  };

  return (
    <div>
      {/* Display Mode Toggle */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Display Format:</h2>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#556B2F]"
                  checked={displayMode === 'sections'}
                  onChange={() => setDisplayMode('sections')}
                />
                <span className="ml-2">Display by Section</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#556B2F]"
                  checked={displayMode === 'all'}
                  onChange={() => setDisplayMode('all')}
                />
                <span className="ml-2">Display All</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setPreviewActive(!previewActive)}
              className="py-2 px-4 border border-[#556B2F] text-[#556B2F] rounded-lg hover:bg-[#556B2F]/10 transition-colors flex items-center"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {previewActive ? 'Edit Mode' : 'Preview'}
            </button>
            <button 
              onClick={handleSaveForm}
              disabled={isSaving}
              className="py-2 px-4 border border-[#556B2F] text-[#556B2F] rounded-lg hover:bg-[#556B2F]/10 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#556B2F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Save Draft
                </>
              )}
            </button>
            <button 
              onClick={handlePublishForm}
              disabled={isSaving}
              className="py-2 px-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Publish Form
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      {/* Form Header Section */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Header</h2>
        
        {!previewActive ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter form title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
                rows={3}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Image (Optional)</label>
              
              {formImage ? (
                <div className="relative w-full h-40 mb-2">
                  <Image 
                    src={formImage} 
                    alt="Form header" 
                    className="rounded-md object-cover" 
                    fill
                  />
                  <button 
                    onClick={() => setFormImage(null)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label className="cursor-pointer text-[#556B2F] hover:text-[#6B8E23]">
                      <span>Upload an image</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-800">{formTitle}</h1>
            {formImage && (
              <div className="mt-4 relative w-full h-40">
                <Image 
                  src={formImage} 
                  alt="Form header" 
                  className="rounded-md object-cover" 
                  fill
                />
              </div>
            )}
            <p className="mt-4 text-gray-600">{formDescription}</p>
          </div>
        )}
      </div>
      
      {/* Form Sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="bg-white p-6 rounded-lg shadow-sm">
            {!previewActive ? (
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="flex flex-col mr-2">
                    <button 
                      onClick={() => handleMoveSectionUp(section.id)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={sectionIndex === 0}
                      title="Move section up"
                    >
                      <ArrowUpIcon className={`w-4 h-4 ${sectionIndex === 0 ? 'opacity-30' : ''}`} />
                    </button>
                    <button 
                      onClick={() => handleMoveSectionDown(section.id)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={sectionIndex === sections.length - 1}
                      title="Move section down"
                    >
                      <ArrowDownIcon className={`w-4 h-4 ${sectionIndex === sections.length - 1 ? 'opacity-30' : ''}`} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className="text-lg font-semibold text-gray-800 border-b border-gray-200 focus:border-[#556B2F] focus:ring-0 px-0 py-1"
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAddQuestion(section.id)}
                    className="p-1 text-[#556B2F] hover:bg-[#556B2F]/10 rounded transition-colors"
                    title="Add question"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                  </button>
                  {sections.length > 1 && (
                    <button 
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete section"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{section.title}</h3>
            )}
            
            {/* Questions */}
            <div className="space-y-6 mt-6">
              {section.questions.map((question, questionIndex) => (
                <div key={question.id} className="border border-gray-200 p-4 rounded-md">
                  {!previewActive ? (
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="flex flex-col mr-2">
                          <button 
                            onClick={() => handleMoveQuestionUp(section.id, question.id)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={questionIndex === 0}
                            title="Move question up"
                          >
                            <ArrowUpIcon className={`w-3 h-3 ${questionIndex === 0 ? 'opacity-30' : ''}`} />
                          </button>
                          <button 
                            onClick={() => handleMoveQuestionDown(section.id, question.id)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={questionIndex === section.questions.length - 1}
                            title="Move question down"
                          >
                            <ArrowDownIcon className={`w-3 h-3 ${questionIndex === section.questions.length - 1 ? 'opacity-30' : ''}`} />
                          </button>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 mr-2">{question.label}</span>
                          {question.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <span className="text-xs bg-[#556B2F]/10 text-[#556B2F] px-2 py-0.5 rounded-full">
                          {question.type}
                        </span>
                        <button 
                          onClick={() => handleEditQuestion(question.id, section.id)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(section.id, question.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {question.label}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                  )}
                  
                  {/* Question Preview */}
                  <div className="mt-2">
                    {question.type === 'text' && (
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        placeholder={question.placeholder}
                        disabled={!previewActive}
                      />
                    )}
                    
                    {question.type === 'textarea' && (
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        placeholder={question.placeholder}
                        rows={4}
                        disabled={!previewActive}
                      ></textarea>
                    )}
                    
                    {question.type === 'radio' && question.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center mt-1">
                        <input
                          type="radio"
                          name={`radio-${question.id}`}
                          className="text-[#556B2F]"
                          disabled={!previewActive}
                        />
                        <label className="ml-2 text-sm text-gray-700">{option}</label>
                      </div>
                    ))}
                    
                    {question.type === 'checkbox' && question.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          className="text-[#556B2F]"
                          disabled={!previewActive}
                        />
                        <label className="ml-2 text-sm text-gray-700">{option}</label>
                      </div>
                    ))}
                    
                    {question.type === 'select' && (
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        disabled={!previewActive}
                      >
                        <option value="">Select an option</option>
                        {question.options?.map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    
                    {question.type === 'date' && (
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        disabled={!previewActive}
                      />
                    )}

                    {question.type === 'link' && (
                      <input
                        type="url"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        placeholder={question.placeholder || "Enter URL"}
                        disabled={!previewActive}
                      />
                    )}
                    
                    {question.type === 'file' && (
                      <div className="mt-1 flex items-center">
                        <label className="block">
                          <span className="py-2 px-4 bg-gray-50 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer">
                            Choose file
                          </span>
                          <input
                            type="file"
                            className="sr-only"
                            disabled={!previewActive}
                          />
                        </label>
                        <span className="ml-3 text-sm text-gray-500">No file selected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Edit Question Form */}
            {editingQuestionId && editingSectionId === section.id && !previewActive && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Question</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                      <select
                        name="type"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        value={editFormData.type}
                        onChange={handleEditFormChange}
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Paragraph</option>
                        <option value="radio">Multiple Choice (Radio)</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="select">Dropdown</option>
                        <option value="date">Date</option>
                        <option value="link">Link</option>
                        <option value="file">File Upload</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question Label</label>
                      <input
                        type="text"
                        name="label"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        value={editFormData.label}
                        onChange={handleEditFormChange}
                        placeholder="Enter question label"
                      />
                    </div>
                    
                    {(editFormData.type === 'text' || editFormData.type === 'textarea' || editFormData.type === 'link') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder (Optional)</label>
                        <input
                          type="text"
                          name="placeholder"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                          value={editFormData.placeholder}
                          onChange={handleEditFormChange}
                          placeholder="Enter placeholder text"
                        />
                      </div>
                    )}
                    
                    {(editFormData.type === 'radio' || editFormData.type === 'checkbox' || editFormData.type === 'select') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Options (Comma Separated)</label>
                        <textarea
                          name="options"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                          value={editFormData.options}
                          onChange={handleEditFormChange}
                          placeholder="Option 1, Option 2, Option 3"
                          rows={3}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-required"
                        name="required"
                        checked={editFormData.required}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          required: e.target.checked
                        })}
                        className="text-[#556B2F]"
                      />
                      <label htmlFor="edit-required" className="ml-2 text-sm text-gray-700">Required</label>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-3">
                      <button
                        onClick={handleCancelEdit}
                        className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEditedQuestion}
                        className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md transition-all"
                        disabled={!editFormData.label}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add Question Form */}
            {showAddQuestion && activeSectionId === section.id && !previewActive && !editingQuestionId && (
              <div className="mt-6 border border-green-300 p-4 rounded-md bg-green-50">
                <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                  <PlusCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                  Add New Question
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                      value={newQuestion.type}
                      onChange={(e) => handleUpdateQuestion('type', e.target.value)}
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Paragraph</option>
                      <option value="radio">Multiple Choice (Radio)</option>
                      <option value="checkbox">Checkboxes</option>
                      <option value="select">Dropdown</option>
                      <option value="date">Date</option>
                      <option value="link">Link</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Label</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                      value={newQuestion.label}
                      onChange={(e) => handleUpdateQuestion('label', e.target.value)}
                      placeholder="Enter question label"
                    />
                  </div>
                  
                  {(newQuestion.type === 'text' || newQuestion.type === 'textarea' || newQuestion.type === 'link') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder (Optional)</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                        value={newQuestion.placeholder || ''}
                        onChange={(e) => handleUpdateQuestion('placeholder', e.target.value)}
                        placeholder="Enter placeholder text"
                      />
                    </div>
                  )}
                  
                  {(newQuestion.type === 'radio' || newQuestion.type === 'checkbox' || newQuestion.type === 'select') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                      {newQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#556B2F] focus:border-[#556B2F]"
                            value={option}
                            onChange={(e) => handleUpdateOptions(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          {newQuestion.options && newQuestion.options.length > 1 && (
                            <button 
                              onClick={() => handleRemoveOption(index)}
                              className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={handleAddOption}
                        className="text-sm text-[#556B2F] hover:underline flex items-center mt-2"
                      >
                        <PlusCircleIcon className="w-4 h-4 mr-1" />
                        Add Option
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="new-required"
                      checked={newQuestion.required}
                      onChange={(e) => handleUpdateQuestion('required', e.target.checked)}
                      className="text-[#556B2F]"
                    />
                    <label htmlFor="new-required" className="ml-2 text-sm text-gray-700">Required</label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-3">
                    <button
                      onClick={() => setShowAddQuestion(false)}
                      className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveQuestion(section.id)}
                      className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md transition-all"
                      disabled={!newQuestion.label}
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add Section Button */}
      {!previewActive && (
        <button
          onClick={handleAddSection}
          className="mt-6 w-full py-3 px-4 bg-[#556B2F]/10 hover:bg-[#556B2F]/20 text-[#556B2F] rounded-lg flex items-center justify-center transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Add New Section
        </button>
      )}
      
      {/* Form Actions */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveForm}
          disabled={isSaving}
          className="py-2 px-6 border border-[#556B2F] text-[#556B2F] rounded-lg hover:bg-[#556B2F]/10 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#556B2F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Save Draft
            </>
          )}
        </button>
        <button
          onClick={handlePublishForm}
          disabled={isSaving}
          className="py-2 px-6 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Publish Form
            </>
          )}
        </button>
      </div>
    </div>
  );
} 