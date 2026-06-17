import { buildExtractionPrompt } from './buildPrompt';
import { getOpenAIClient, getOpenAIModel } from './openaiClient';
import type { ExtractionResult, ExtractedCV } from './types';
import {
  parseGeneral,
  hasGeneralContent,
  parseWork,
  hasWorkContent,
  parseEducation,
  hasEducationContent,
  parseSkills,
  hasSkillsContent,
  parseLanguages,
  hasLanguagesContent,
  parseSummary,
  hasSummaryContent,
  parseCertificates,
  hasCertificatesContent,
  parseProjects,
  hasProjectsContent,
  parseAdditional,
  hasAdditionalContent,
  parseExternalLinks,
  hasExternalLinksContent,
} from './sections';

function parseExtractedResponse(raw: unknown): ExtractedCV {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  return {
    general: parseGeneral(data.general),
    work: parseWork(data.work),
    education: parseEducation(data.education),
    skills: parseSkills(data.skills),
    languages: parseLanguages(data.languages),
    summary: parseSummary(data.summary),
    certificates: parseCertificates(data.certificates),
    projects: parseProjects(data.projects),
    additional: parseAdditional(data.additional),
    externalLinks: parseExternalLinks(data.externalLinks),
  };
}

function resolveActiveSections(extracted: ExtractedCV): string[] {
  const sections = ['general', 'work', 'education'];

  if (hasSkillsContent(extracted.skills)) sections.push('skills');
  if (hasLanguagesContent(extracted.languages)) sections.push('languages');
  if (hasSummaryContent(extracted.summary)) sections.push('summary');
  if (hasCertificatesContent(extracted.certificates)) sections.push('certificates');
  if (hasProjectsContent(extracted.projects)) sections.push('projects');
  if (hasAdditionalContent(extracted.additional)) sections.push('additional');
  if (hasExternalLinksContent(extracted.externalLinks)) sections.push('externalLinks');

  // Ensure general is included when we have personal info
  if (!hasGeneralContent(extracted.general) && sections.length === 3) {
    // keep default sections even if empty
  }

  return sections;
}

export async function extractCvFromText(cvText: string): Promise<ExtractionResult> {
  const trimmed = cvText.trim();
  if (!trimmed) {
    throw new Error('The uploaded file appears to be empty.');
  }

  const openai = getOpenAIClient();
  const model = getOpenAIModel();
  const prompt = buildExtractionPrompt(trimmed);

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You extract structured CV data from resume text. Return only valid JSON with no markdown.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI while parsing the CV.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse the AI response. Please try again.');
  }

  const data = parseExtractedResponse(parsed);
  const activeSections = resolveActiveSections(data);

  return { data, activeSections };
}
