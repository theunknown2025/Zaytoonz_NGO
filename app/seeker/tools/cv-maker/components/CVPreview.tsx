'use client';

import React, { forwardRef } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  FlagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { CVData } from '../types';
import {
  getSectionTitle,
  getSectionIcon,
  getPlatformIcon,
  getPlatformLabel,
  CV_THEME,
} from '../sectionConfig';

interface CVPreviewProps {
  cvData: CVData;
  addedSections: string[];
}

const formatMonthYear = (date: string) =>
  date ? new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';

const formatBirthDate = (date: string) =>
  date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const proficiencyMap: Record<string, string> = {
  beginner: 'A1/A2',
  intermediate: 'B1/B2',
  advanced: 'C1',
  native: 'C2/Native',
};

function SectionHeader({ section }: { section: string }) {
  return (
    <div
      className="flex items-center gap-2.5 pb-2 mb-3"
      style={{ borderBottom: `2px solid ${CV_THEME.accentBorder}` }}
    >
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ backgroundColor: CV_THEME.accentLight, color: CV_THEME.accentMedium }}
      >
        {getSectionIcon(section, 'w-[18px] h-[18px]')}
      </span>
      <h3
        className="text-[13px] font-bold uppercase tracking-wide"
        style={{ color: CV_THEME.accent }}
      >
        {getSectionTitle(section)}
      </h3>
    </div>
  );
}

function ContactItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px]" style={{ color: CV_THEME.textMuted }}>
      <span style={{ color: CV_THEME.accentMedium }} className="flex-shrink-0">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>(function CVPreview(
  { cvData, addedSections },
  ref
) {
  const { firstName, lastName, email, phone, address, nationality, birthDate, gender } =
    cvData.general;
  const hasName = firstName || lastName;
  const hasContact = email || phone || address;
  const hasPersonalDetails = nationality || birthDate || gender;

  const renderSection = (section: string) => {
    switch (section) {
      case 'general': {
        if (!hasPersonalDetails) return null;
        return (
          <div key="general" className="mb-5">
            <SectionHeader section="general" />
            <div className="grid grid-cols-1 gap-1.5">
              {nationality && (
                <ContactItem icon={<FlagIcon className="w-3.5 h-3.5" />}>
                  Nationality: {nationality}
                </ContactItem>
              )}
              {birthDate && (
                <ContactItem icon={<CalendarIcon className="w-3.5 h-3.5" />}>
                  Date of birth: {formatBirthDate(birthDate)}
                </ContactItem>
              )}
              {gender && (
                <ContactItem icon={<UserIcon className="w-3.5 h-3.5" />}>
                  Gender: {gender}
                </ContactItem>
              )}
            </div>
          </div>
        );
      }

      case 'summary':
        if (!cvData.summary) return null;
        return (
          <div key="summary" className="mb-5">
            <SectionHeader section="summary" />
            <p className="text-[10px] leading-relaxed" style={{ color: CV_THEME.text }}>
              {cvData.summary}
            </p>
          </div>
        );

      case 'work': {
        const items = cvData.work.filter((w) => w.position || w.company);
        if (items.length === 0) return null;
        return (
          <div key="work" className="mb-5">
            <SectionHeader section="work" />
            {items.map((work) => {
              const formattedStart = formatMonthYear(work.startDate);
              const formattedEnd = work.current ? 'Present' : formatMonthYear(work.endDate);
              return (
                <div key={work.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between gap-2 items-start">
                    <div className="text-[11px] font-bold" style={{ color: CV_THEME.text }}>
                      {work.position}
                    </div>
                    {(formattedStart || formattedEnd) && (
                      <div
                        className="text-[9px] whitespace-nowrap flex-shrink-0"
                        style={{ color: CV_THEME.textMuted }}
                      >
                        {formattedStart} – {formattedEnd}
                      </div>
                    )}
                  </div>
                  <div
                    className="text-[10px] italic"
                    style={{ color: CV_THEME.accentMedium }}
                  >
                    {work.company}
                    {work.location ? `, ${work.location}` : ''}
                  </div>
                  {work.description && (
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: CV_THEME.text }}>
                      {work.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'education': {
        const items = cvData.education.filter((e) => e.degree || e.institution);
        if (items.length === 0) return null;
        return (
          <div key="education" className="mb-5">
            <SectionHeader section="education" />
            {items.map((education) => {
              const formattedStart = formatMonthYear(education.startDate);
              const formattedEnd = formatMonthYear(education.endDate);
              return (
                <div key={education.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between gap-2 items-start">
                    <div className="text-[11px] font-bold" style={{ color: CV_THEME.text }}>
                      {education.degree}
                    </div>
                    {(formattedStart || formattedEnd) && (
                      <div
                        className="text-[9px] whitespace-nowrap flex-shrink-0"
                        style={{ color: CV_THEME.textMuted }}
                      >
                        {formattedStart} – {formattedEnd}
                      </div>
                    )}
                  </div>
                  <div
                    className="text-[10px] italic"
                    style={{ color: CV_THEME.accentMedium }}
                  >
                    {education.institution}
                    {education.location ? `, ${education.location}` : ''}
                  </div>
                  {education.description && (
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: CV_THEME.text }}>
                      {education.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'skills': {
        const items = cvData.skills.filter((s) => s.name);
        if (items.length === 0) return null;
        return (
          <div key="skills" className="mb-5">
            <SectionHeader section="skills" />
            <div className="flex flex-wrap gap-1.5">
              {items.map((skill) => (
                <span
                  key={skill.id}
                  className="text-[9px] px-2 py-1 rounded-md font-medium"
                  style={{ backgroundColor: CV_THEME.skillBg, color: CV_THEME.skillText }}
                >
                  {skill.name} ({skill.level.charAt(0).toUpperCase() + skill.level.slice(1)})
                </span>
              ))}
            </div>
          </div>
        );
      }

      case 'languages': {
        const items = cvData.languages.filter((l) => l.language);
        if (items.length === 0) return null;
        return (
          <div key="languages" className="mb-5">
            <SectionHeader section="languages" />
            <div className="flex flex-wrap gap-1.5">
              {items.map((language) => (
                <span
                  key={language.id}
                  className="text-[9px] px-2 py-1 rounded-md font-medium"
                  style={{ backgroundColor: CV_THEME.skillBg, color: CV_THEME.skillText }}
                >
                  {language.language} (
                  {proficiencyMap[language.proficiency] || language.proficiency})
                </span>
              ))}
            </div>
          </div>
        );
      }

      case 'certificates': {
        const items = cvData.certificates.filter((c) => c.name);
        if (items.length === 0) return null;
        return (
          <div key="certificates" className="mb-5">
            <SectionHeader section="certificates" />
            {items.map((certificate) => {
              const formattedDate = formatMonthYear(certificate.date);
              return (
                <div key={certificate.id} className="mb-3 last:mb-0">
                  <div className="text-[11px] font-bold" style={{ color: CV_THEME.text }}>
                    {certificate.name}
                  </div>
                  <div className="text-[10px] italic" style={{ color: CV_THEME.accentMedium }}>
                    {certificate.issuer}
                    {formattedDate ? ` (${formattedDate})` : ''}
                  </div>
                  {certificate.description && (
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: CV_THEME.text }}>
                      {certificate.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'projects': {
        const items = cvData.projects.filter((p) => p.title);
        if (items.length === 0) return null;
        return (
          <div key="projects" className="mb-5">
            <SectionHeader section="projects" />
            {items.map((project) => {
              const formattedStart = formatMonthYear(project.startDate);
              const formattedEnd = formatMonthYear(project.endDate);
              const dateRange =
                formattedStart || formattedEnd ? `${formattedStart} – ${formattedEnd}` : '';
              return (
                <div key={project.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between gap-2 items-start">
                    <div className="text-[11px] font-bold" style={{ color: CV_THEME.text }}>
                      {project.title}
                    </div>
                    {dateRange && (
                      <div
                        className="text-[9px] whitespace-nowrap flex-shrink-0"
                        style={{ color: CV_THEME.textMuted }}
                      >
                        {dateRange}
                      </div>
                    )}
                  </div>
                  {project.role && (
                    <div className="text-[10px] italic" style={{ color: CV_THEME.accentMedium }}>
                      {project.role}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: CV_THEME.text }}>
                      {project.description}
                    </p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] mt-0.5 inline-block hover:underline"
                      style={{ color: CV_THEME.accentMedium }}
                    >
                      {project.url}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'additional':
        if (!cvData.additional) return null;
        return (
          <div key="additional" className="mb-5">
            <SectionHeader section="additional" />
            <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: CV_THEME.text }}>
              {cvData.additional}
            </p>
          </div>
        );

      case 'externalLinks': {
        const items = cvData.externalLinks.filter((l) => l.url);
        if (items.length === 0) return null;
        return (
          <div key="externalLinks" className="mb-5">
            <SectionHeader section="externalLinks" />
            {items.map((link) => (
              <div key={link.id} className="mb-2 last:mb-0 flex items-start gap-2">
                <span className="text-base leading-none flex-shrink-0 mt-0.5">
                  {getPlatformIcon(link.platform)}
                </span>
                <div>
                  <div className="text-[11px] font-bold" style={{ color: CV_THEME.text }}>
                    {link.displayName || getPlatformLabel(link.platform)}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] hover:underline break-all"
                    style={{ color: CV_THEME.accentMedium }}
                  >
                    {link.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const sectionElements = addedSections
    .map((section) => renderSection(section))
    .filter(Boolean);

  const showEmptyState = !hasName && !hasContact && !hasPersonalDetails && sectionElements.length === 0;

  return (
    <div
      ref={ref}
      className="bg-white font-sans"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        color: CV_THEME.text,
        fontSize: '10pt',
      }}
    >
      {(hasName || hasContact) && (
        <div
          className="pb-4 mb-5"
          style={{ borderBottom: `3px solid ${CV_THEME.accent}` }}
        >
          {hasName && (
            <h1
              className="text-[22px] font-bold mb-3"
              style={{ color: CV_THEME.accent }}
            >
              {firstName} {lastName}
            </h1>
          )}
          {hasContact && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {email && (
                <ContactItem icon={<EnvelopeIcon className="w-3.5 h-3.5" />}>
                  {email}
                </ContactItem>
              )}
              {phone && (
                <ContactItem icon={<PhoneIcon className="w-3.5 h-3.5" />}>
                  {phone}
                </ContactItem>
              )}
              {address && (
                <ContactItem icon={<MapPinIcon className="w-3.5 h-3.5" />}>
                  {address}
                </ContactItem>
              )}
            </div>
          )}
        </div>
      )}

      {sectionElements}

      {showEmptyState && (
        <div
          className="text-center py-12 text-[11px] italic"
          style={{ color: CV_THEME.textMuted }}
        >
          Start filling in your CV sections to see a live preview here.
        </div>
      )}
    </div>
  );
});

export default CVPreview;
