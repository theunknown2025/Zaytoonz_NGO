'use client';

import { useState } from 'react';
import {
  CursorArrowRaysIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/supabase';
import FlowStepIconPicker from '@/app/components/FlowStepIconPicker';
import OpportunityActionButtonsDisplay from '@/app/components/OpportunityActionButtonsDisplay';
import type { FlowStepIconKey } from '@/app/lib/flowStepIcons';
import {
  createEmptyActionButton,
  isValidActionButtonUrl,
  normalizeActionButtonUrl,
  type OpportunityActionButton,
} from '@/app/lib/opportunityActionButtons';
import { toast } from 'react-hot-toast';

interface OpportunityActionButtonsSectionProps {
  actionButtons: OpportunityActionButton[];
  onActionButtonsChange: (buttons: OpportunityActionButton[]) => void;
  opportunityId: string;
  includeActionButtons?: boolean;
  onIncludeActionButtonsChange?: (enabled: boolean) => void;
}

const ICON_BUCKET = 'opportunity-action-button-icons';

export default function OpportunityActionButtonsSection({
  actionButtons,
  onActionButtonsChange,
  opportunityId,
  includeActionButtons = false,
  onIncludeActionButtonsChange,
}: OpportunityActionButtonsSectionProps) {
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [icon, setIcon] = useState<FlowStepIconKey>('flag');
  const [iconUrl, setIconUrl] = useState<string | undefined>();
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadIcon = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${opportunityId}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    const { error } = await supabase.storage.from(ICON_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Error uploading action button icon:', error);
      return null;
    }

    const { data: urlData } = supabase.storage.from(ICON_BUCKET).getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  };

  const handleAddButton = async () => {
    if (!title.trim()) {
      toast.error('Button title is required');
      return;
    }
    if (!linkUrl.trim()) {
      toast.error('Link URL is required');
      return;
    }
    if (!isValidActionButtonUrl(linkUrl)) {
      toast.error('Please enter a valid link URL');
      return;
    }

    setUploading(true);
    try {
      let resolvedIconUrl = iconUrl;
      if (pendingIconFile) {
        const uploadedUrl = await uploadIcon(pendingIconFile);
        if (!uploadedUrl) {
          toast.error('Failed to upload icon');
          return;
        }
        resolvedIconUrl = uploadedUrl;
      }

      const newButton: OpportunityActionButton = {
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `action-${Date.now()}`,
        title: title.trim(),
        linkUrl: normalizeActionButtonUrl(linkUrl),
        icon: resolvedIconUrl ? undefined : icon,
        iconUrl: resolvedIconUrl,
        buttonOrder: actionButtons.length,
      };

      onActionButtonsChange([...actionButtons, newButton]);
      setTitle('');
      setLinkUrl('');
      setIcon('flag');
      setIconUrl(undefined);
      setPendingIconFile(null);
      toast.success('Action button added');
    } catch (error) {
      console.error('Error adding action button:', error);
      toast.error('Failed to add action button');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (id: string) => {
    onActionButtonsChange(
      actionButtons
        .filter((button) => button.id !== id)
        .map((button, index) => ({ ...button, buttonOrder: index }))
    );
  };

  const handleIconFileChange = (file: File | null) => {
    setPendingIconFile(file);
    if (file) {
      setIconUrl(undefined);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#6B8E23]/5 to-[#556B2F]/5 rounded-xl p-6 border border-[#6B8E23]/10 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#6B8E23] text-white shrink-0">
            <CursorArrowRaysIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#556B2F]">Action Buttons</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add quick-action buttons with a title, icon, and link for applicants (e.g. apply
              externally, visit a website, or download a form).
            </p>
          </div>
        </div>
        {onIncludeActionButtonsChange && (
          <button
            type="button"
            role="switch"
            aria-checked={includeActionButtons}
            onClick={() => onIncludeActionButtonsChange(!includeActionButtons)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2 ${
              includeActionButtons ? 'bg-[#556B2F]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                includeActionButtons ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {includeActionButtons && (
        <>
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apply on partner site"
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/apply"
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 px-3"
                />
              </div>
            </div>

            <div>
              <FlowStepIconPicker value={icon} onChange={setIcon} />
              <p className="mt-1 text-xs text-gray-500">
                Choose a preset icon, or upload a custom icon below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom icon (optional)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#556B2F]/50 hover:bg-[#556B2F]/5 transition-colors">
                  <PhotoIcon className="h-5 w-5 text-[#556B2F]" />
                  <span className="text-sm text-gray-600">
                    {pendingIconFile
                      ? pendingIconFile.name
                      : iconUrl
                        ? 'Custom icon selected'
                        : 'Upload PNG, JPG, SVG, or WebP'}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    onChange={(e) => handleIconFileChange(e.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddButton}
                  disabled={uploading}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    'Adding...'
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add button
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {actionButtons.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Added buttons ({actionButtons.length})
              </h4>
              {actionButtons.map((button) => (
                <div
                  key={button.id}
                  className="flex items-start justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{button.title}</p>
                    <a
                      href={normalizeActionButtonUrl(button.linkUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#556B2F] hover:underline mt-1 inline-block truncate max-w-full"
                    >
                      {button.linkUrl}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(button.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md shrink-0"
                    title="Remove button"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {actionButtons.some((button) => button.title.trim() && button.linkUrl.trim()) && (
            <div className="mt-4">
              <OpportunityActionButtonsDisplay buttons={actionButtons} mode="preview" />
            </div>
          )}
        </>
      )}
    </div>
  );
}