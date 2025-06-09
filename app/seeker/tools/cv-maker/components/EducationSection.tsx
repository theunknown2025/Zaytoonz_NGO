import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationSectionProps {
  educations: Education[];
  onEducationChange: (index: number, field: string, value: string) => void;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  educations,
  onEducationChange,
  onAddEducation,
  onRemoveEducation
}) => {
  return (
    <div>
      {educations.map((edu, index) => (
        <div key={edu.id} className="mb-6">
          {index > 0 && <div className="border-t border-gray-200 my-6"></div>}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">Education {index + 1}</h4>
            {educations.length > 1 && (
              <button 
                type="button" 
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => onRemoveEducation(index)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree / Qualification*</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => onEducationChange(index, 'degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="e.g. Bachelor of Science in Computer Science"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution*</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => onEducationChange(index, 'institution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="School or University Name"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={edu.location}
              onChange={(e) => onEducationChange(index, 'location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              placeholder="Location"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
              <input
                type="date"
                value={edu.startDate}
                onChange={(e) => onEducationChange(index, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (or Expected)</label>
              <input
                type="date"
                value={edu.endDate}
                onChange={(e) => onEducationChange(index, 'endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Subjects & Achievements</label>
            <textarea
              value={edu.description}
              onChange={(e) => onEducationChange(index, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              placeholder="Describe your major subjects and achievements"
              rows={4}
            ></textarea>
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        className="mt-2 flex items-center text-olive-dark hover:text-olive-medium"
        onClick={onAddEducation}
      >
        <PlusIcon className="w-5 h-5 mr-1" />
        <span>Add Another Education</span>
      </button>
    </div>
  );
};

export default EducationSection; 