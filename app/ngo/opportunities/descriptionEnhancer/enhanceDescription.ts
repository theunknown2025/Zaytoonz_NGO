import { buildEnhanceDescriptionMessages } from './buildPrompt';
import { getOpenAIClient, getOpenAIModel } from './openaiClient';
import type { EnhanceDescriptionInput, EnhanceDescriptionResult } from './types';

const MIN_TEXT_LENGTH = 20;

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanModelHtml(raw: string): string {
  let html = raw.trim();
  if (html.startsWith('```')) {
    html = html.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '');
  }
  return html.trim();
}

export function validateDescriptionForEnhancement(text: string): string | null {
  const plain = stripHtml(text);
  if (!plain) {
    return 'Please write some description text before enhancing with AI.';
  }
  if (plain.length < MIN_TEXT_LENGTH) {
    return `Description should be at least ${MIN_TEXT_LENGTH} characters before enhancing.`;
  }
  return null;
}

export async function enhanceOpportunityDescription(
  input: EnhanceDescriptionInput
): Promise<EnhanceDescriptionResult> {
  const validationError = validateDescriptionForEnhancement(input.text);
  if (validationError) {
    throw new Error(validationError);
  }

  const openai = getOpenAIClient();
  const model = getOpenAIModel();
  const { systemPrompt, userPrompt } = buildEnhanceDescriptionMessages(input);

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('No response from OpenAI while enhancing the description.');
  }

  const enhanced = cleanModelHtml(content);
  if (!stripHtml(enhanced)) {
    throw new Error('AI returned an empty description. Please try again.');
  }

  return { enhanced };
}
