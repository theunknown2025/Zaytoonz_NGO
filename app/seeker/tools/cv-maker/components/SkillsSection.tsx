import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Skill {
  id: number;
  name: string;
  level: string;
}

interface SkillsSectionProps {
  skills: Skill[];
  onSkillChange: (index: number, field: string, value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onSkillChange,
  onAddSkill,
  onRemoveSkill
}) => {
  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];
  
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        List your professional skills and rate your proficiency level for each.
      </p>
      
      {skills.map((skill, index) => (
        <div key={skill.id} className="mb-4">
          {index > 0 && <div className="border-t border-gray-200 my-4"></div>}
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-800">Skill {index + 1}</h4>
            {skills.length > 1 && (
              <button 
                type="button" 
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => onRemoveSkill(index)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name*</label>
              <input
                type="text"
                value={skill.name}
                onChange={(e) => onSkillChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="e.g. Project Management, JavaScript, Photoshop"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level*</label>
              <select
                value={skill.level}
                onChange={(e) => onSkillChange(index, 'level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                required
              >
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        className="mt-2 flex items-center text-olive-dark hover:text-olive-medium"
        onClick={onAddSkill}
      >
        <PlusIcon className="w-5 h-5 mr-1" />
        <span>Add Another Skill</span>
      </button>
    </div>
  );
};

export default SkillsSection; 