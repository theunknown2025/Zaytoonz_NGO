export interface OpportunityDocument {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  fileName: string;
  mimeType?: string;
  uploadedAt?: string;
}

export function parseOpportunityDocuments(metadata: unknown): OpportunityDocument[] {
  if (!metadata || typeof metadata !== 'object') return [];
  const docs = (metadata as { documents?: unknown }).documents;
  if (!Array.isArray(docs)) return [];
  return docs.filter(
    (doc): doc is OpportunityDocument =>
      doc &&
      typeof doc === 'object' &&
      typeof (doc as OpportunityDocument).id === 'string' &&
      typeof (doc as OpportunityDocument).name === 'string' &&
      typeof (doc as OpportunityDocument).fileUrl === 'string'
  );
}
