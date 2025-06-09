import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface PlaceholderSectionProps {
  sectionTitle: string;
}

const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({ sectionTitle }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <DocumentTextIcon className="w-16 h-16 text-olive-light/50 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon</h3>
      <p className="text-gray-500">The {sectionTitle} section will be available soon!</p>
    </div>
  );
};

export default PlaceholderSection; 