'use client';

import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { saveAdminFormTemplate, updateAdminFormTemplate, getAdminFormTemplateById } from './services/formService';
import { FormData, Section, Question, QuestionType } from './types';

interface NewFormProps {
  onFormSaved: () => void;
  onCancel: () => void;
  editTemplateId?: string | null;
}

export default function NewForm({ onFormSaved, onCancel, editTemplateId = null }: NewFormProps) {
  const [formTitle, setFormTitle] = useState('New Admin Template');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  
  // Form sections
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Basic Information',
      questions: [
        { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
        { id: '2', type: 'email', label: 'Email Address', placeholder: 'Enter your email', required: true },
      ]
    }
  ]);
  
  // Active section for adding questions
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'> & { id?: string }>({
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: ['']
  });
  
  // For editing existing questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Load template data if in edit mode
  useEffect(() => {
    if (editTemplateId) {
      loadTemplateData(editTemplateId);
    }
  }, [editTemplateId]);

  const loadTemplateData = async (templateId: string) => {
    setIsSaving(true);
    
    try {
      const result = await getAdminFormTemplateById(templateId);
      
      if (result.success && result.template) {
        const template = result.template;
        
        setFormTitle(template.title);
        setFormDescription(template.description || '');
        
        // Parse sections data
        if (template.sections && Array.isArray(template.sections)) {
          setSections(template.sections);
        }
      } else {
        alert(result.error || 'Failed to load template');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template');
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
    const updatedOptions = [...(newQuestion.options || [''])];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleAddOption = () => {
    const updatedOptions = [...(newQuestion.options || [''])];
    updatedOptions.push('');
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = [...(newQuestion.options || [''])];
    updatedOptions.splice(index, 1);
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a form title');
      return;
    }

    try {
      setIsSaving(true);
      const formData: FormData = {
        title: formTitle,
        description: formDescription,
        sections: sections
      };

      const result = editTemplateId 
        ? await updateAdminFormTemplate(editTemplateId, formData)
        : await saveAdminFormTemplate(formData);

      if (result.success) {
        alert(`Template ${editTemplateId ? 'updated' : 'saved'} successfully!`);
        onFormSaved();
      } else {
        alert(result.error || `Failed to ${editTemplateId ? 'update' : 'save'} template`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('An error occurred while saving the template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditQuestion = (questionId: string, sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    
    if (question) {
      setEditingQuestionId(questionId);
      setEditingSectionId(sectionId);
      setEditingQuestion({ ...question });
    }
  };

  const handleSaveEditedQuestion = () => {
    if (editingQuestion && editingSectionId && editingQuestionId) {
      setSections(sections.map(section => 
        section.id === editingSectionId
          ? {
              ...section,
              questions: section.questions.map(q => 
                q.id === editingQuestionId ? editingQuestion : q
              )
            }
          : section
      ));
      
      setEditingQuestionId(null);
      setEditingSectionId(null);
      setEditingQuestion(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingSectionId(null);
    setEditingQuestion(null);
  };

  const renderQuestionInput = (question: Question, sectionId: string) => {
    const commonClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent";
    
    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={question.type}
            placeholder={question.placeholder}
            className={commonClasses}
            disabled
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder}
            rows={3}
            className={commonClasses}
            disabled
          />
        );
      case 'select':
        return (
          <select className={commonClasses} disabled>
            <option value="">Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="radio" name={question.id} value={option} disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="checkbox" value={option} disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            className={commonClasses}
            disabled
          />
        );
      case 'file':
        return (
          <input
            type="file"
            className={commonClasses}
            disabled
          />
        );
      default:
        return (
          <input
            type="text"
            placeholder={question.placeholder}
            className={commonClasses}
            disabled
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#556B2F]">
              {editTemplateId ? 'Edit Admin Template' : 'New Admin Template'}
            </h2>
            <p className="text-gray-600">Create a professional form template for admin use</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewActive(!previewActive)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <EyeIcon className="w-5 h-5" />
            {previewActive ? 'Edit' : 'Preview'}
          </button>
          
          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors disabled:opacity-50"
          >
            <DocumentTextIcon className="w-5 h-5" />
            {isSaving ? 'Saving...' : editTemplateId ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </div>

      {previewActive ? (
        // Preview Mode
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formTitle}</h1>
            {formDescription && (
              <p className="text-gray-600">{formDescription}</p>
            )}
          </div>

          {sections.map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{section.title}</h2>
              <div className="space-y-6">
                {section.questions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {question.label}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestionInput(question, section.id)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Edit Mode
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="Enter template title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    placeholder="Describe what this template is for"
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                    className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#556B2F] focus:outline-none py-1"
                  />
                  <div className="flex items-center gap-2">
                    {sections.length > 1 && (
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {section.questions.map((question) => (
                    <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                      {editingQuestionId === question.id ? (
                        // Edit Question Form
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question Type
                            </label>
                            <select
                              value={editingQuestion?.type}
                              onChange={(e) => setEditingQuestion(editingQuestion ? { ...editingQuestion, type: e.target.value as QuestionType } : null)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="textarea">Textarea</option>
                              <option value="select">Select</option>
                              <option value="radio">Radio</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="date">Date</option>
                              <option value="file">File</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question Label
                            </label>
                            <input
                              type="text"
                              value={editingQuestion?.label || ''}
                              onChange={(e) => setEditingQuestion(editingQuestion ? { ...editingQuestion, label: e.target.value } : null)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              value={editingQuestion?.placeholder || ''}
                              onChange={(e) => setEditingQuestion(editingQuestion ? { ...editingQuestion, placeholder: e.target.value } : null)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuestion?.required || false}
                              onChange={(e) => setEditingQuestion(editingQuestion ? { ...editingQuestion, required: e.target.checked } : null)}
                              className="rounded border-gray-300 text-[#556B2F] focus:ring-[#556B2F]"
                            />
                            <label className="text-sm text-gray-700">Required field</label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEditedQuestion}
                              className="px-3 py-1 bg-[#556B2F] text-white text-sm rounded hover:bg-[#6B8E23] transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Question
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{question.label}</h4>
                            <p className="text-sm text-gray-600">
                              Type: {question.type} 
                              {question.required && ' • Required'}
                              {question.placeholder && ` • Placeholder: ${question.placeholder}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditQuestion(question.id, section.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(section.id, question.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Question Button */}
                  <button
                    onClick={() => handleAddQuestion(section.id)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#556B2F] hover:text-[#556B2F] transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Add Question
                  </button>
                </div>
              </div>
            ))}

            {/* Add Section Button */}
            <button
              onClick={handleAddSection}
              className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#556B2F] hover:text-[#556B2F] transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircleIcon className="w-6 h-6" />
              Add Section
            </button>
          </div>

          {/* Add Question Form */}
          {showAddQuestion && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Question</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as QuestionType })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                      <option value="file">File</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Label
                    </label>
                    <input
                      type="text"
                      value={newQuestion.label}
                      onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                      placeholder="Enter question label"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={newQuestion.placeholder}
                      onChange={(e) => setNewQuestion({ ...newQuestion, placeholder: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  {(newQuestion.type === 'select' || newQuestion.type === 'radio' || newQuestion.type === 'checkbox') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {(newQuestion.options || ['']).map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleUpdateOptions(index, e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                              placeholder={`Option ${index + 1}`}
                            />
                            {(newQuestion.options?.length || 0) > 1 && (
                              <button
                                onClick={() => handleRemoveOption(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={handleAddOption}
                          className="text-sm text-[#556B2F] hover:text-[#6B8E23] transition-colors"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newQuestion.required}
                      onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                      className="rounded border-gray-300 text-[#556B2F] focus:ring-[#556B2F]"
                    />
                    <label className="text-sm text-gray-700">Required field</label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveQuestion(activeSectionId)}
                      className="flex-1 px-3 py-2 bg-[#556B2F] text-white text-sm rounded hover:bg-[#6B8E23] transition-colors"
                    >
                      Add Question
                    </button>
                    <button
                      onClick={() => setShowAddQuestion(false)}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 