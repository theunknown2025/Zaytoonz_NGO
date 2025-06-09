import React from 'react';

interface AdditionalSectionProps {
  additionalInfo: string;
  onAdditionalChange: (value: string) => void;
}

const AdditionalSection: React.FC<AdditionalSectionProps> = ({
  additionalInfo,
  onAdditionalChange
}) => {
  return (
    <div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
        <textarea
          value={additionalInfo}
          onChange={(e) => onAdditionalChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
          placeholder="Examples:&#10;• Driving License: Full, clean license&#10;• Interests: Mountain climbing, photography, volunteering at local animal shelter&#10;• Awards: Employee of the Year 2022, Dean's List 2018-2020&#10;• Professional Memberships: Member of the Institute of Electrical and Electronics Engineers (IEEE)"
          rows={6}
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">
          Focus on information that adds value to your professional profile or demonstrates relevant qualities.
        </p>
      </div>
    </div>
  );
};

export default AdditionalSection; 