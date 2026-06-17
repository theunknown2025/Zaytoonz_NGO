import type { EnhanceDescriptionInput } from './types';

const TYPE_LABELS: Record<string, string> = {
  job: 'job / volunteer position',
  funding: 'funding / grant opportunity',
  training: 'training / educational program',
};

export function buildEnhanceDescriptionMessages(input: EnhanceDescriptionInput) {
  const typeLabel = input.opportunityType
    ? TYPE_LABELS[input.opportunityType] ?? input.opportunityType
    : 'volunteer or NGO opportunity';

  const contextLines = [
    input.title ? `Opportunity title: ${input.title}` : null,
    `Opportunity type: ${typeLabel}`,
  ].filter(Boolean);

  const systemPrompt = `You are an expert NGO communications writer. Your task is to improve opportunity descriptions for clarity, structure, and impact while preserving all factual content from the original text.

Rules:
- Keep every substantive fact, requirement, date, location detail, and qualification from the original
- Do NOT invent new requirements, benefits, or details that were not implied by the original
- Improve organization with clear HTML sections using h2/h3 headings, paragraphs, and bullet lists where appropriate
- Use professional, inclusive, and engaging language suitable for NGO audiences
- Return ONLY valid HTML fragment (no markdown, no code fences, no outer html/body tags)
- Use semantic tags: h2, h3, p, ul, ol, li, strong, em
- If the original is very short, expand structure but do not fabricate specifics`;

  const userPrompt = `${contextLines.join('\n')}

Original description:
"""
${input.text}
"""

Return the enhanced description as an HTML fragment.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
