import React from 'react';
import { PlusIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';
import { ExternalLink } from '../types';

interface ExternalLinksSectionProps {
  externalLinks: ExternalLink[];
  onExternalLinkChange: (index: number, field: string, value: string) => void;
  onAddExternalLink: () => void;
  onRemoveExternalLink: (index: number) => void;
}

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  { value: 'github', label: 'GitHub', icon: '💻' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'portfolio', label: 'Portfolio', icon: '🎨' },
  { value: 'blog', label: 'Blog', icon: '📝' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'other', label: 'Other', icon: '🔗' }
];

const getPlatformIcon = (platform: string) => {
  const platformOption = platformOptions.find(option => option.value === platform);
  return platformOption?.icon || '🔗';
};

const getPlatformLabel = (platform: string) => {
  const platformOption = platformOptions.find(option => option.value === platform);
  return platformOption?.label || 'Other';
};

export default function ExternalLinksSection({
  externalLinks,
  onExternalLinkChange,
  onAddExternalLink,
  onRemoveExternalLink
}: ExternalLinksSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-olive-medium" />
          External Links
        </h3>
        <button
          type="button"
          onClick={onAddExternalLink}
          className="px-3 py-2 bg-olive-medium hover:bg-olive-dark text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Link
        </button>
      </div>

      <div className="space-y-4">
        {externalLinks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <LinkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No external links added yet.</p>
            <p className="text-sm">Add your professional and social media links to showcase your online presence.</p>
          </div>
        ) : (
          externalLinks.map((link, index) => (
            <div key={link.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPlatformIcon(link.platform)}</span>
                  <span className="font-medium text-gray-800">
                    {getPlatformLabel(link.platform)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveExternalLink(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove link"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={link.platform}
                    onChange={(e) => onExternalLinkChange(index, 'platform', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                  >
                    <option value="">Select platform</option>
                    {platformOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={link.displayName}
                    onChange={(e) => onExternalLinkChange(index, 'displayName', e.target.value)}
                    placeholder="e.g., John Doe's LinkedIn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => onExternalLinkChange(index, 'url', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                  />
                </div>
              </div>

              {link.url && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPlatformIcon(link.platform)}</span>
                    <span className="font-medium text-gray-800">
                      {link.displayName || getPlatformLabel(link.platform)}
                    </span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-olive-medium hover:text-olive-dark break-all"
                  >
                    {link.url}
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">💡 Tips for External Links:</h4>
        <ul className="space-y-1 text-blue-700">
          <li>• Add your LinkedIn profile to showcase your professional network</li>
          <li>• Include your GitHub if you're a developer</li>
          <li>• Add your portfolio or personal website</li>
          <li>• Include relevant social media profiles that showcase your work</li>
          <li>• Make sure all URLs are accessible and up-to-date</li>
        </ul>
      </div>
    </div>
  );
} 