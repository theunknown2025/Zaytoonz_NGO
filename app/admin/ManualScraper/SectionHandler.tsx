"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Section {
  id: string;
  name: string;
  selector: string;
  elements: string[];
}

interface SectionHandlerProps {
  sections: Section[];
  selectedSection: string | null;
  onAddSection: (sectionName: string) => void;
  onSelectSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, selector: string, elements: string[]) => void;
  onDeleteSection: (sectionId: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export function SectionHandler({
  sections,
  selectedSection,
  onAddSection,
  onSelectSection,
  onUpdateSection,
  onDeleteSection,
  onGenerate,
  isGenerating,
  canGenerate
}: SectionHandlerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim());
      setNewSectionName("");
      setShowAddForm(false);
    }
  };

  const handleElementEdit = (sectionId: string, elementIndex: number, newValue: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newElements = [...section.elements];
      newElements[elementIndex] = newValue;
      onUpdateSection(sectionId, section.selector, newElements);
    }
  };

  const handleRemoveElement = (sectionId: string, elementIndex: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newElements = section.elements.filter((_, index) => index !== elementIndex);
      onUpdateSection(sectionId, section.selector, newElements);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Section
          </button>
        </div>

        {/* Add Section Form */}
        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Name
              </label>
              <input
                type="text"
                placeholder="e.g., Job Title, Location, Company"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddSection}
                disabled={!newSectionName.trim()}
                className="px-3 py-2 text-sm bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewSectionName("");
                }}
                className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        {sections.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No Sections Yet</h3>
            <p className="text-sm">Add a section to start selecting elements from the website</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`border rounded-lg transition-all ${
                  selectedSection === section.id
                    ? "border-[#556B2F] bg-[#556B2F]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Section Header */}
                <div
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => onSelectSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRightIcon 
                      className={`h-4 w-4 transition-transform ${
                        selectedSection === section.id ? "rotate-90" : ""
                      }`} 
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{section.name}</h3>
                      <p className="text-sm text-gray-500">
                        {section.elements.length} element{section.elements.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Section Content */}
                {selectedSection === section.id && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    {section.selector && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          CSS Selector
                        </label>
                        <code className="text-xs text-gray-600 break-all">
                          {section.selector}
                        </code>
                      </div>
                    )}

                    {section.elements.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Selected Elements ({section.elements.length})
                        </label>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {section.elements.map((element, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={element}
                                onChange={(e) => handleElementEdit(section.id, index, e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#556B2F] focus:border-transparent"
                              />
                              <button
                                onClick={() => handleRemoveElement(section.id, index)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <div className="text-2xl mb-2">🎯</div>
                        <p className="text-sm">
                          Click "Start Selection" on the right panel<br />
                          to select elements for this section
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            canGenerate && !isGenerating
              ? "bg-[#556B2F] text-white hover:bg-[#6B8E23] shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </div>
          ) : (
            "Generate Opportunities"
          )}
        </button>
        {!canGenerate && sections.length > 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Add at least one element to a section to generate
          </p>
        )}
      </div>
    </div>
  );
} 