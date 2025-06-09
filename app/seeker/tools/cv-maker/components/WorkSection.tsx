import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface WorkExperience {
  id: number;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface WorkSectionProps {
  workExperiences: WorkExperience[];
  onWorkChange: (index: number, field: string, value: string | boolean) => void;
  onAddWork: () => void;
  onRemoveWork: (index: number) => void;
}

const WorkSection: React.FC<WorkSectionProps> = ({ 
  workExperiences, 
  onWorkChange, 
  onAddWork, 
  onRemoveWork 
}) => {
  return (
    <div>
      {workExperiences.map((work, index) => (
        <div key={work.id} className="mb-6">
          {index > 0 && <div className="border-t border-gray-200 my-6"></div>}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">Work Experience {index + 1}</h4>
            {workExperiences.length > 1 && (
              <button 
                type="button" 
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => onRemoveWork(index)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title*</label>
              <input
                type="text"
                value={work.position}
                onChange={(e) => onWorkChange(index, 'position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="Job Title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company*</label>
              <input
                type="text"
                value={work.company}
                onChange={(e) => onWorkChange(index, 'company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="Company Name"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={work.location}
              onChange={(e) => onWorkChange(index, 'location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              placeholder="Location"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
              <input
                type="date"
                value={work.startDate}
                onChange={(e) => onWorkChange(index, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
              <input
                type="date"
                value={work.endDate}
                onChange={(e) => onWorkChange(index, 'endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                disabled={work.current}
                required={!work.current}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={work.current}
                onChange={(e) => onWorkChange(index, 'current', e.target.checked)}
                className="mr-2 h-4 w-4 text-olive-medium rounded border-gray-300 focus:ring-olive-light"
              />
              <span className="text-sm text-gray-700">I currently work here</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities & Achievements</label>
            <textarea
              value={work.description}
              onChange={(e) => onWorkChange(index, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              placeholder="Describe your responsibilities and achievements"
              rows={4}
            ></textarea>
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        className="mt-2 flex items-center text-olive-dark hover:text-olive-medium"
        onClick={onAddWork}
      >
        <PlusIcon className="w-5 h-5 mr-1" />
        <span>Add Another Work Experience</span>
      </button>
    </div>
  );
};

export default WorkSection; 