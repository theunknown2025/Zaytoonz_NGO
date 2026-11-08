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

  return `You are a CV structuring assistant. Place the source CV into the JSON schema below. Structure only. Do not edit the writing.

Rules:
- Copy every phrase, sentence, bullet, name, job title, company, school, and skill exactly as written in the source.
- Do not rewrite, paraphrase, improve, shorten, expand, translate, correct grammar, fix spelling, or change tone.
- Do not add achievements, keywords, or details that are not in the source.
- Do not drop content. If a block does not fit a specific field, place the original text in the closest field (description, summary, or additional).
- Keep each source line break. Never join separate lines or bullets into one paragraph.
- Each bullet stays on its own line inside the same string, using a real newline character, with the original wording.
- Split a full name into firstName and lastName without changing spelling.
- Dates are the only values you may reformat, and only so the form can store them: use YYYY-MM-DD. If the source gives only a month and year, use the first day of that month. If it gives only a year, use YYYY-01-01. If a date cannot be read, leave it empty. Do not guess a different date.
- Set work "current" to true only when the source says the role is ongoing (Present, Current, Now, or an explicit ongoing role). Otherwise false.
- Skill and language levels: set a level only when the source states one, using the allowed values. If the source does not state a level, use an empty string. Do not assume "intermediate".
- Use empty strings for missing scalar fields and empty arrays for missing lists.
- Return ONLY valid JSON matching this structure:

{
${schema}
}

CV TEXT:
---
${cvText.slice(0, 28000)}
---`;
}
