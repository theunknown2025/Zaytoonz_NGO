import {
  GENERAL_INSTRUCTIONS,
  WORK_INSTRUCTIONS,
  EDUCATION_INSTRUCTIONS,
  SKILLS_INSTRUCTIONS,
  LANGUAGES_INSTRUCTIONS,
  SUMMARY_INSTRUCTIONS,
  CERTIFICATES_INSTRUCTIONS,
  PROJECTS_INSTRUCTIONS,
  ADDITIONAL_INSTRUCTIONS,
  EXTERNAL_LINKS_INSTRUCTIONS,
} from './sections';

export function buildExtractionPrompt(cvText: string): string {
  const schema = [
    GENERAL_INSTRUCTIONS,
    WORK_INSTRUCTIONS,
    EDUCATION_INSTRUCTIONS,
    SKILLS_INSTRUCTIONS,
    LANGUAGES_INSTRUCTIONS,
    SUMMARY_INSTRUCTIONS,
    CERTIFICATES_INSTRUCTIONS,
    PROJECTS_INSTRUCTIONS,
    ADDITIONAL_INSTRUCTIONS,
    EXTERNAL_LINKS_INSTRUCTIONS,
  ].join(',\n');

  return `You are a CV parsing assistant. Read the following CV/resume text and extract structured data into the JSON schema below.

Rules:
- Preserve the original content meaning; reorganize it into the correct sections.
- Use empty strings for missing scalar fields and empty arrays for missing lists.
- Normalize dates to YYYY-MM or YYYY-MM-DD when possible.
- For work experience, set "current" to true when the role is ongoing.
- Skill/language levels must use the allowed enum values only.
- Do not invent information that is not in the source document.
- Return ONLY valid JSON matching this structure:

{
${schema}
}

CV TEXT:
---
${cvText.slice(0, 28000)}
---`;
}
