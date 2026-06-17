'use client';

import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { OpportunityDocument } from '@/app/lib/opportunityDocuments';

interface OpportunityDocumentsListProps {
  documents: OpportunityDocument[];
  /** When true, render list only (parent provides the card shell). */
  embedded?: boolean;
}

export default function OpportunityDocumentsList({ documents, embedded = false }: OpportunityDocumentsListProps) {
  if (!documents.length) return null;

  const list = (
    <ul className="space-y-3">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white border border-olive-100 rounded-lg"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-olive-900">{doc.name}</p>
            {doc.description && (
              <p className="text-sm text-olive-700 mt-0.5">{doc.description}</p>
            )}
            <p className="text-xs text-olive-500 mt-1 truncate">{doc.fileName}</p>
          </div>
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={doc.fileName}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-olive-700 rounded-lg hover:bg-olive-800 transition shrink-0"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Download
          </a>
        </li>
      ))}
    </ul>
  );

  if (embedded) return list;

  return (
    <div className="bg-olive-50 border border-olive-100 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-olive-900 mb-3 flex items-center gap-2">
        <DocumentTextIcon className="h-5 w-5 text-olive-700" />
        Files and Documents
      </h2>
      {list}
    </div>
  );
}
