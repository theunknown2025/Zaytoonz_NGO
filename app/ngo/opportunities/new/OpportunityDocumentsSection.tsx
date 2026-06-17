'use client';

import { useState } from 'react';
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/supabase';
import type { OpportunityDocument } from '@/app/lib/opportunityDocuments';
import { toast } from 'react-hot-toast';

interface OpportunityDocumentsSectionProps {
  documents: OpportunityDocument[];
  onDocumentsChange: (documents: OpportunityDocument[]) => void;
  opportunityId: string;
  includeDocuments?: boolean;
  onIncludeDocumentsChange?: (enabled: boolean) => void;
}

const BUCKET = 'opportunity-description-documents';

export default function OpportunityDocumentsSection({
  documents,
  onDocumentsChange,
  opportunityId,
  includeDocuments = false,
  onIncludeDocumentsChange,
}: OpportunityDocumentsSectionProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop() || 'bin';
    const filePath = `${opportunityId}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Error uploading document:', error);
      return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  };

  const handleAddDocument = async () => {
    if (!name.trim()) {
      toast.error('Document name is required');
      return;
    }
    if (!pendingFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const fileUrl = await uploadDocument(pendingFile);
      if (!fileUrl) {
        toast.error('Failed to upload document');
        return;
      }

      const newDoc: OpportunityDocument = {
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `doc-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        fileUrl,
        fileName: pendingFile.name,
        mimeType: pendingFile.type || undefined,
        uploadedAt: new Date().toISOString(),
      };

      onDocumentsChange([...documents, newDoc]);
      setName('');
      setDescription('');
      setPendingFile(null);
      toast.success('Document added');
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  return (
    <div className="bg-gradient-to-r from-[#6B8E23]/5 to-[#556B2F]/5 rounded-xl p-6 border border-[#6B8E23]/10 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#6B8E23] text-white shrink-0">
            <DocumentTextIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#556B2F]">Files and Documents</h3>
            <p className="text-sm text-gray-600 mt-1">
              Optionally attach supporting files applicants may need (guides, forms, brochures, etc.).
            </p>
          </div>
        </div>
        {onIncludeDocumentsChange && (
          <button
            type="button"
            role="switch"
            aria-checked={includeDocuments}
            onClick={() => onIncludeDocumentsChange(!includeDocuments)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2 ${
              includeDocuments ? 'bg-[#556B2F]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                includeDocuments ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {includeDocuments && (
      <>
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Application guidelines"
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this file"
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] sm:text-sm py-2 px-3"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#556B2F]/50 hover:bg-[#556B2F]/5 transition-colors">
              <DocumentArrowUpIcon className="h-5 w-5 text-[#556B2F]" />
              <span className="text-sm text-gray-600">
                {pendingFile ? pendingFile.name : 'Choose PDF, DOC, DOCX, or other file'}
              </span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,image/*"
                onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="button"
              onClick={handleAddDocument}
              disabled={uploading}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                'Uploading...'
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add document
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Added documents ({documents.length})</h4>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-start justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                {doc.description && (
                  <p className="text-xs text-gray-600 mt-0.5">{doc.description}</p>
                )}
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#556B2F] hover:underline mt-1 inline-block truncate max-w-full"
                >
                  {doc.fileName}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(doc.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md shrink-0"
                title="Remove document"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
