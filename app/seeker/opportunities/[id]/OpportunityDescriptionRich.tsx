'use client';

import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

function containsHtml(str: string) {
  if (!str) return false;
  return /<[^>]*>/g.test(str);
}

function sanitizeHtml(html: string) {
  if (!html) return '';

  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');

  sanitized = sanitized.replace(
    /(https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/opportunity-description-images\/[^\s<>"']+)/g,
    '<div class="my-4"><img src="$1" alt="Opportunity image" class="max-w-full h-auto rounded-lg shadow-sm border border-gray-200" style="max-height: 400px;" /></div>'
  );

  sanitized = sanitized.replace(
    /(https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/opportunity-description-documents\/[^\s<>"']+)/g,
    '<div class="my-4"><a href="$1" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Download Document</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div>'
  );

  return sanitized;
}

function parseDescription(description: string) {
  if (!description) return [];

  const lines = description.split('\n');
  const sections: Array<{ title?: string; content: string }> = [];
  let currentSection: { title?: string; content: string } = { content: '' };

  for (const line of lines) {
    const trimmedLine = line.trim();
    const titleMatch = trimmedLine.match(/^\*\*(.+?)\*\*$/);

    if (titleMatch) {
      if (currentSection.content.trim() || currentSection.title) {
        sections.push(currentSection);
      }
      currentSection = { title: titleMatch[1], content: '' };
    } else if (trimmedLine) {
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    }
  }

  if (currentSection.content.trim() || currentSection.title) {
    sections.push(currentSection);
  }

  return sections;
}

function renderFileUrl(url: string, fileName?: string) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isDocument = /\.(pdf|doc|docx|txt)$/i.test(url);

  if (isImage) {
    return (
      <div className="my-4">
        <img
          src={url}
          alt={fileName || 'Opportunity image'}
          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
          style={{ maxHeight: '400px' }}
          onError={(e) => {
            console.error('Error loading image:', url);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {fileName && <p className="text-sm text-gray-600 mt-2">{fileName}</p>}
      </div>
    );
  }
  if (isDocument) {
    return (
      <div className="my-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <DocumentTextIcon className="w-5 h-5" />
          <span>{fileName || 'Download Document'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    );
  }

  return null;
}

/** Rich opportunity description: HTML, markdown-style sections, or plain text (shared by public layouts). */
export default function OpportunityDescriptionRich({ description }: { description: string }) {
  if (containsHtml(description)) {
    const sanitizedHtml = sanitizeHtml(description);
    return (
      <div
        className="text-gray-700 leading-relaxed prose prose-sm max-w-none break-words 
                   prose-headings:text-gray-900 prose-headings:font-semibold 
                   prose-p:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed
                   prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6
                   prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mb-4
                   prose-h3:text-lg prose-h3:mb-3
                   prose-h4:text-base prose-h4:mb-2
                   prose-ul:mb-4 prose-ul:pl-6 prose-li:mb-1
                   prose-ol:mb-4 prose-ol:pl-6
                   prose-strong:font-semibold prose-strong:text-gray-900
                   prose-em:italic prose-em:text-gray-700
                   prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700
                   prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
                   prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                   prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                   [&>div]:mb-4 [&>div>h2]:text-xl [&>div>h2]:font-semibold [&>div>h2]:text-gray-900 [&>div>h2]:mb-3
                   [&>div>p]:mb-3 [&>div>p]:text-gray-700 [&>div>p]:leading-relaxed"
        style={{ overflowWrap: 'anywhere' } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  const sections = parseDescription(description);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="space-y-3">
          {section.title && (
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">{section.title}</h3>
          )}
          {section.content && (
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words prose prose-sm max-w-none"
              style={{ overflowWrap: 'anywhere' } as React.CSSProperties}
            >
              {section.content.split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                const supabaseUrlMatch = trimmedLine.match(
                  /https:\/\/[a-zA-Z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s]+/
                );

                if (supabaseUrlMatch) {
                  const url = supabaseUrlMatch[0];
                  const urlParts = url.split('/');
                  const fileName = urlParts[urlParts.length - 1] || trimmedLine.replace(url, '').trim();

                  return (
                    <div key={lineIndex}>{renderFileUrl(url, fileName)}</div>
                  );
                }

                return (
                  <div key={lineIndex}>{trimmedLine}</div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
