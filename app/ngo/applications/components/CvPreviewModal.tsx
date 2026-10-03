'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CVPreview from '@/app/seeker/tools/cv-maker/components/CVPreview';
import type { CVData } from '@/app/seeker/tools/cv-maker/types';

function mapStoredCv(raw: any): { cvData: CVData; addedSections: string[] } {
  const general = raw.general_info || {};
  const cvData: CVData = {
    general: {
      firstName: general.firstName || '',
      lastName: general.lastName || '',
      email: general.email || '',
      phone: general.phone || '',
      address: general.address || general.location || '',
      nationality: general.nationality || '',
      birthDate: general.birthDate || '',
      gender: general.gender || '',
    },
    work: (raw.work_experiences || []).map((work: any) => ({
      id: work.id,
      position: work.position || '',
      company: work.company || '',
      location: work.location || '',
      startDate: work.start_date || '',
      endDate: work.end_date || '',
      current: Boolean(work.is_current),
      description: work.description || '',
    })),
    education: (raw.education || []).map((edu: any) => ({
      id: edu.id,
      degree: edu.degree || '',
      institution: edu.institution || '',
      location: edu.location || '',
      startDate: edu.start_date || '',
      endDate: edu.end_date || '',
      description: edu.description || '',
    })),
    skills: (raw.skills || []).map((skill: any) => ({
      id: skill.id,
      name: skill.name || '',
      level: skill.level || '',
    })),
    languages: (raw.languages || []).map((lang: any) => ({
      id: lang.id,
      language: lang.language || '',
      proficiency: lang.proficiency || '',
    })),
    summary: raw.summary || '',
    certificates: (raw.certificates || []).map((cert: any) => ({
      id: cert.id,
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.issue_date || '',
      description: cert.description || '',
    })),
    projects: (raw.projects || []).map((project: any) => ({
      id: project.id,
      title: project.title || '',
      role: project.role || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      description: project.description || '',
      url: project.url || '',
    })),
    volunteering: [],
    publications: [],
    references: [],
    additional: raw.additional || '',
    externalLinks: (raw.external_links || []).map((link: any) => ({
      id: link.id,
      platform: link.platform || '',
      url: link.url || '',
      displayName: link.display_name || '',
    })),
  };

  const addedSections = Array.isArray(raw.sections) && raw.sections.length > 0
    ? raw.sections
    : ['general', 'summary', 'work', 'education', 'skills', 'languages', 'certificates', 'projects', 'additional', 'externalLinks'];

  return { cvData, addedSections };
}

export default function CvPreviewModal({
  cvId,
  cvName,
  onClose,
}: {
  cvId: string;
  cvName?: string | null;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<{ cvData: CVData; addedSections: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cvs/${cvId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load CV');
        if (!cancelled) setPreview(mapStoredCv(data));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load CV');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cvId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">CV preview</h2>
            {cvName && <p className="text-sm text-gray-600">{cvName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close CV preview"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto bg-gray-100 p-4 sm:p-6">
          {loading && <p className="py-12 text-center text-sm text-gray-600">Loading CV…</p>}
          {error && <p className="py-12 text-center text-sm text-red-700">{error}</p>}
          {preview && (
            <CVPreview cvData={preview.cvData} addedSections={preview.addedSections} />
          )}
        </div>
      </div>
    </div>
  );
}
