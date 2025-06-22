'use client';

import { useState } from 'react';
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
  EyeSlashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Question {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export default function FormMaker() {
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'templates'>('builder');
  const [formTitle, setFormTitle] = useState('New Form');
  const [formDescription, setFormDescription] = useState('');
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
  
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'>>({
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: []
  });

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
      required: false,
      options: []
    });
  };

  const handleSaveQuestion = () => {
    if (newQuestion.label) {
      const question: Question = {
        id: Date.now().toString(),
        ...newQuestion
      };
      
      setSections(sections.map(section => 
        section.id === activeSectionId 
          ? { ...section, questions: [...section.questions, question] }
          : section
      ));
      
      setNewQuestion({
        type: 'text',
        label: '',
        placeholder: '',
        required: false,
        options: []
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

  const renderQuestion = (question: Question, sectionId: string) => {
    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={question.type}
            placeholder={question.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            disabled
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            disabled
          />
        );
      case 'select':
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]" disabled>
            <option>Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input type="radio" name={question.id} className="mr-2" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            disabled
          />
        );
      case 'file':
        return (
          <input
            type="file"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
            disabled
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin/Workshop" className="text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <DocumentTextIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Form Maker</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Save Draft
              </button>
              <button className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium">
                Publish Form
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'builder' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Form Builder
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates' 
                ? 'border-[#556B2F] text-[#556B2F]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Form Builder Tab */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Builder */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                    />
                  </div>
                </div>
              </div>

              {/* Sections */}
              {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#556B2F] rounded px-2"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddQuestion(section.id)}
                        className="text-[#556B2F] hover:text-[#6B8E23] p-1"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                      </button>
                      {sections.length > 1 && (
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.questions.map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {question.label}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <button
                            onClick={() => handleDeleteQuestion(section.id, question.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        {renderQuestion(question, section.id)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Section Button */}
              <button
                onClick={handleAddSection}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#556B2F] hover:text-[#556B2F] transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Add New Section
              </button>
            </div>

            {/* Question Types Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Types</h3>
                <div className="space-y-2">
                  {[
                    { type: 'text', label: 'Text Input', icon: PencilSquareIcon },
                    { type: 'email', label: 'Email', icon: PencilSquareIcon },
                    { type: 'textarea', label: 'Long Text', icon: DocumentTextIcon },
                    { type: 'select', label: 'Dropdown', icon: ChevronDownIcon },
                    { type: 'radio', label: 'Multiple Choice', icon: CheckCircleIcon },
                    { type: 'checkbox', label: 'Checkboxes', icon: ListBulletIcon },
                    { type: 'date', label: 'Date', icon: CalendarIcon },
                    { type: 'file', label: 'File Upload', icon: PhotoIcon },
                  ].map((questionType) => {
                    const Icon = questionType.icon;
                    return (
                      <div
                        key={questionType.type}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#556B2F] hover:bg-[#556B2F]/5 cursor-pointer transition-colors"
                      >
                        <Icon className="w-5 h-5 text-[#556B2F]" />
                        <span className="text-sm font-medium text-gray-700">{questionType.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{formTitle}</h2>
                {formDescription && (
                  <p className="text-gray-600">{formDescription}</p>
                )}
              </div>

              {sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
                  <div className="space-y-4">
                    {section.questions.map((question) => (
                      <div key={question.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {question.label}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderQuestion(question, section.id)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button className="w-full bg-[#556B2F] text-white py-3 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium">
                Submit Form
              </button>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Volunteer Application', description: 'Standard volunteer registration form' },
              { name: 'Event Registration', description: 'Event signup with participant details' },
              { name: 'Feedback Survey', description: 'Collect feedback and suggestions' },
              { name: 'Contact Form', description: 'Simple contact information form' },
              { name: 'Donation Form', description: 'Donation collection with payment details' },
              { name: 'Newsletter Signup', description: 'Email subscription form' },
            ].map((template, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <button className="w-full bg-[#556B2F] text-white py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Question Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Question</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                  >
                    <option value="text">Text Input</option>
                    <option value="email">Email</option>
                    <option value="textarea">Long Text</option>
                    <option value="select">Dropdown</option>
                    <option value="radio">Multiple Choice</option>
                    <option value="checkbox">Checkboxes</option>
                    <option value="date">Date</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Label</label>
                  <input
                    type="text"
                    value={newQuestion.label}
                    onChange={(e) => setNewQuestion({...newQuestion, label: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                  <input
                    type="text"
                    value={newQuestion.placeholder}
                    onChange={(e) => setNewQuestion({...newQuestion, placeholder: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556B2F]"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newQuestion.required}
                    onChange={(e) => setNewQuestion({...newQuestion, required: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Required field</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-4 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23]"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}