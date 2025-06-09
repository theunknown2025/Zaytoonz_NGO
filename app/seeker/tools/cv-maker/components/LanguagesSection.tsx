import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Language {
  id: number;
  language: string;
  proficiency: string;
}

interface LanguagesSectionProps {
  languages: Language[];
  onLanguageChange: (index: number, field: string, value: string) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (index: number) => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  onLanguageChange,
  onAddLanguage,
  onRemoveLanguage
}) => {
  const proficiencyLevels = [
    { value: 'beginner', label: 'Basic (A1/A2)' },
    { value: 'intermediate', label: 'Independent (B1/B2)' },
    { value: 'advanced', label: 'Proficient (C1)' },
    { value: 'native', label: 'Native/Fluent (C2)' }
  ];
  
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        List languages you speak and your proficiency level for each using CEFR scale (A1-C2).
      </p>
      
      {languages.map((lang, index) => (
        <div key={lang.id} className="mb-4">
          {index > 0 && <div className="border-t border-gray-200 my-4"></div>}
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-800">Language {index + 1}</h4>
            {languages.length > 1 && (
              <button 
                type="button" 
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => onRemoveLanguage(index)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language*</label>
              <input
                type="text"
                value={lang.language}
                onChange={(e) => onLanguageChange(index, 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="e.g. English, French, Spanish"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level*</label>
              <select
                value={lang.proficiency}
                onChange={(e) => onLanguageChange(index, 'proficiency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                required
              >
                {proficiencyLevels.map(level => (
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
        onClick={onAddLanguage}
      >
        <PlusIcon className="w-5 h-5 mr-1" />
        <span>Add Another Language</span>
      </button>
    </div>
  );
};

export default LanguagesSection; 