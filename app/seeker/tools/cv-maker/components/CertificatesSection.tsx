import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

interface CertificatesSectionProps {
  certificates: Certificate[];
  onCertificateChange: (index: number, field: string, value: string) => void;
  onAddCertificate: () => void;
  onRemoveCertificate: (index: number) => void;
}

const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  certificates,
  onCertificateChange,
  onAddCertificate,
  onRemoveCertificate
}) => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        List relevant certifications, courses, and professional development activities you've completed.
      </p>
      
      {certificates.map((cert, index) => (
        <div key={cert.id} className="mb-6">
          {index > 0 && <div className="border-t border-gray-200 my-6"></div>}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">Certificate/Course {index + 1}</h4>
            {certificates.length > 1 && (
              <button 
                type="button" 
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => onRemoveCertificate(index)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate/Course Name*</label>
              <input
                type="text"
                value={cert.name}
                onChange={(e) => onCertificateChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="e.g. Certified Project Manager (PMP)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization*</label>
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => onCertificateChange(index, 'issuer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="e.g. Project Management Institute"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Obtained</label>
            <input
              type="date"
              value={cert.date}
              onChange={(e) => onCertificateChange(index, 'date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={cert.description}
              onChange={(e) => onCertificateChange(index, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              placeholder="Describe what you learned or the skills you gained"
              rows={3}
            ></textarea>
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        className="mt-2 flex items-center text-olive-dark hover:text-olive-medium"
        onClick={onAddCertificate}
      >
        <PlusIcon className="w-5 h-5 mr-1" />
        <span>Add Another Certificate or Course</span>
      </button>
    </div>
  );
};

export default CertificatesSection; 