import React from 'react';

interface SummarySectionProps {
  summary: string;
  onSummaryChange: (value: string) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ 
  summary, 
  onSummaryChange 
}) => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Write a brief professional summary highlighting your key qualifications, experience, and career objectives.
        This will appear at the top of your CV and make a strong first impression.
      </p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
          placeholder="Example: Experienced marketing professional with 5+ years in digital marketing and brand development. Skilled in SEO, content strategy, and campaign management with a proven track record of increasing online engagement by 150% and managing successful product launches. Seeking to leverage my expertise in a senior marketing role."
          rows={6}
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">
          Keep your summary concise (3-5 sentences) and focused on your most relevant qualifications for the job you're targeting.
        </p>
      </div>
    </div>
  );
};

export default SummarySection; 