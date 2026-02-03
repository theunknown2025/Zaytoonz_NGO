// contentHandler.ts
// Utility functions to clean and polish extracted opportunity content on the client side.

import OpenAI from 'openai';

export interface RawOpportunityContent {
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  qualifications?: string | null;
  benefits?: string | null;
  application_instructions?: string | null;
  contact_info?: string | null;
  raw_content?: string | null;
  structured_content?: Record<string, unknown> | null;
}

export interface CleanedOpportunityContent {
  overview: string | null;
  responsibilities: string | null;
  requirements: string | null;
  qualifications: string | null;
  benefits: string | null;
  howToApply: string | null;
  contactInfo: string | null;
  extra: string | null;
  /** Single concatenated plain text block that can be used for copy/export. */
  combinedPlainText: string;
}

/**
 * Remove obviously irrelevant boilerplate (cookies, nav, footer, generic site text)
 * from a text block. This is intentionally conservative: it only strips very common patterns.
 *
 * This is a local, rule-based cleaner that we can use as:
 * - a first pass before sending to OpenAI
 * - a fallback when OpenAI is unavailable
 */
function cleanTextBlock(text: string | null | undefined): string {
  if (!text) return '';

  let cleaned = text;

  // Normalize whitespace
  cleaned = cleaned.replace(/\r\n/g, '\n');

  // Remove very common boilerplate phrases (case-insensitive)
  const patterns: RegExp[] = [
    /we use cookies[^.\n]*\./gi,
    /cookie(s)? policy[^.\n]*\./gi,
    /back to search results/gi,
    /powered by pageup/gi,
    /toggle navigation/gi,
    /main navigation/gi,
    /subscribe\s+recaptcha\s+privacy agreement/gi,
    /unicef careers home/gi,
    /beware of fraudulent job offers/gi,
    /legal\s*$/gim,
    /accessibility\s*$/gim,
  ];

  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Drop lines that look like pure navigation / social / footer noise
  const filteredLines = cleaned
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => {
      const lower = line.toLowerCase().trim();
      if (!lower) return false;

      // Very short navigation labels
      if (['global links', 'main navigation', 'footer', 'footer secondary', 'social'].includes(lower)) {
        return false;
      }

      // Social-only icon lines
      if (['facebook', 'linkedin', 'twitter', 'youtube', 'whatsapp'].includes(lower)) {
        return false;
      }

      // Generic site-wide promo / subscription lines
      if (lower.startsWith('we will email you new jobs that match this search')) return false;
      if (lower.startsWith('great, we can send you jobs like this')) return false;
      if (lower.startsWith('the email address was invalid')) return false;
      if (lower.startsWith('you must agree to the privacy statement')) return false;

      // "Share" blocks
      if (lower.startsWith('sharethis copy and paste')) return false;

      return true;
    });

  cleaned = filteredLines.join('\n');

  // Collapse multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

/**
 * Create a single combined plain text representation from the cleaned sections.
 */
function buildCombinedPlainText(sections: Omit<CleanedOpportunityContent, 'combinedPlainText'>): string {
  const parts: string[] = [];

  if (sections.overview) {
    parts.push(sections.overview);
  }
  if (sections.responsibilities) {
    parts.push(sections.responsibilities);
  }
  if (sections.requirements) {
    parts.push(sections.requirements);
  }
  if (sections.qualifications) {
    parts.push(sections.qualifications);
  }
  if (sections.benefits) {
    parts.push(sections.benefits);
  }
  if (sections.howToApply) {
    parts.push(sections.howToApply);
  }
  if (sections.contactInfo) {
    parts.push(sections.contactInfo);
  }
  if (sections.extra) {
    parts.push(sections.extra);
  }

  return parts.join('\n\n').trim();
}

/**
 * Main synchronous cleaner: rule-based only (no OpenAI).
 * Useful as a fast fallback or when API keys are missing.
 */
export function polishOpportunityContent(opp: RawOpportunityContent): CleanedOpportunityContent {
  // Prefer structured fields; clean each one individually
  const overview = cleanTextBlock(opp.description);
  const responsibilities = cleanTextBlock(opp.responsibilities);
  const requirements = cleanTextBlock(opp.requirements);
  const qualifications = cleanTextBlock(opp.qualifications);
  const benefits = cleanTextBlock(opp.benefits);
  const howToApply = cleanTextBlock(opp.application_instructions);
  const contactInfo = cleanTextBlock(opp.contact_info);

  // Fallback: if we have no structured sections but we do have raw_content,
  // clean that and treat it as "extra"/full content.
  let extra = '';
  const hasAnyStructured =
    overview || responsibilities || requirements || qualifications || benefits || howToApply || contactInfo;

  if (!hasAnyStructured && opp.raw_content) {
    extra = cleanTextBlock(opp.raw_content);
  }

  const sectionsWithoutCombined: Omit<CleanedOpportunityContent, 'combinedPlainText'> = {
    overview: overview || null,
    responsibilities: responsibilities || null,
    requirements: requirements || null,
    qualifications: qualifications || null,
    benefits: benefits || null,
    howToApply: howToApply || null,
    contactInfo: contactInfo || null,
    extra: extra || null,
  };

  const combinedPlainText = buildCombinedPlainText(sectionsWithoutCombined);

  return {
    ...sectionsWithoutCombined,
    combinedPlainText,
  };
}

/**
 * OpenAI-powered cleaner: let the model decide what is important opportunity
 * information and return structured, polished sections.
 *
 * This runs in the browser using NEXT_PUBLIC_OPENAI_API_KEY, similar to the
 * seeker text analysis utilities.
 */
export async function polishOpportunityContentWithAI(
  opp: RawOpportunityContent
): Promise<CleanedOpportunityContent> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    if (!apiKey) {
      // No key configured: fall back to local cleaner
      return polishOpportunityContent(opp);
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Build a single text block to send to the model (prefer structured fields, then raw_content)
    const localCleaned = polishOpportunityContent(opp);
    const baseText =
      localCleaned.combinedPlainText ||
      cleanTextBlock(
        [
          opp.description,
          opp.responsibilities,
          opp.requirements,
          opp.qualifications,
          opp.benefits,
          opp.application_instructions,
          opp.contact_info,
          opp.raw_content,
        ]
          .filter(Boolean)
          .join('\n\n')
      );

    if (!baseText) {
      return localCleaned;
    }

    const prompt = `
You are given the full textual content of an opportunity detail page (job, funding, training, etc.).
The text may include navigation, cookie banners, footers, subscription widgets, and other boilerplate.

CRITICAL: Your task is to PRESERVE ALL essential opportunity information while removing ONLY site navigation, boilerplate, and unrelated content.

PRESERVE COMPLETELY (keep ALL details, do NOT summarize or condense):
- Overview / description of the role or opportunity (keep the FULL description, all paragraphs)
- Key responsibilities or scope of work (keep ALL responsibilities, tasks, duties - complete list)
- Requirements and/or qualifications (keep ALL requirements - education, experience, skills, certifications - complete list)
- Benefits (keep ALL benefits mentioned - complete list)
- How to apply / application instructions (keep ALL steps, documents needed, submission details - complete instructions)
- Contact information (keep ALL contact details if provided)
- Important dates (deadlines, start dates, duration, etc.)
- Any other opportunity-specific details (location details, salary info, contract terms, etc.)

AGGRESSIVELY REMOVE AND IGNORE (only remove these, keep everything else):
- Cookie notices ("We use cookies", "cookie policy", etc.)
- Navigation menus ("Toggle navigation", "Main navigation", "Global Links", etc.)
- Footer content ("Back to search results", "Powered by PageUp", "UNICEF Careers home", etc.)
- Social media links ("Facebook", "LinkedIn", "Twitter", "WhatsApp", "ShareThis", etc.)
- Subscription widgets ("We will email you new jobs", "Subscribe", "Recaptcha Privacy agreement", etc.)
- Generic site-wide text ("Beware of fraudulent job offers", "Legal", "Accessibility", etc.)
- Organization boilerplate that doesn't describe THIS specific opportunity
- Any text that appears before the actual job title/heading
- Any text that appears after "How to Apply" or application instructions (unless it's part of the application process)

Return ONLY a JSON object in this exact structure:
{
  "overview": "FULL description of the opportunity (keep all paragraphs, all details - do NOT summarize), or empty string",
  "responsibilities": "ALL responsibilities/scope of work (keep complete list, all bullet points, all tasks - do NOT condense), or empty string",
  "requirements": "ALL requirements (keep complete list - education, experience, skills, certifications - do NOT summarize), or empty string",
  "qualifications": "ALL formal qualifications if distinct from requirements (keep complete list - do NOT condense), or empty string",
  "benefits": "ALL benefits offered (keep complete list - do NOT summarize), or empty string",
  "howToApply": "COMPLETE application instructions (keep all steps, all documents needed, all submission details - do NOT condense), or empty string",
  "contactInfo": "ALL contact information if provided (keep complete details), or empty string",
  "extra": "ANY other important opportunity-specific details (deadlines, location details, contract terms, etc. - keep all details), or empty string"
}

CRITICAL INSTRUCTIONS:
- PRESERVE ALL content related to the opportunity - do NOT reduce, summarize, or condense
- Keep complete paragraphs, complete lists, complete instructions
- Only remove navigation, cookies, footers, and site-wide boilerplate
- The values must be plain text (no Markdown formatting, no HTML tags)
- If a section doesn't exist in the text, return empty string for that field
- Do NOT include any navigation, footer, cookie, or site-wide boilerplate text
- Your goal is to keep 100% of opportunity content, remove 100% of site boilerplate

TEXT TO CLEAN:
${baseText}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return localCleaned;
    }

    const parsed = JSON.parse(content) as Partial<CleanedOpportunityContent>;

    const sectionsWithoutCombined: Omit<CleanedOpportunityContent, 'combinedPlainText'> = {
      overview: (parsed.overview || '').trim() || null,
      responsibilities: (parsed.responsibilities || '').trim() || null,
      requirements: (parsed.requirements || '').trim() || null,
      qualifications: (parsed.qualifications || '').trim() || null,
      benefits: (parsed.benefits || '').trim() || null,
      howToApply: (parsed.howToApply || '').trim() || null,
      contactInfo: (parsed.contactInfo || '').trim() || null,
      extra: (parsed.extra || '').trim() || null,
    };

    const combinedPlainText = buildCombinedPlainText(sectionsWithoutCombined);

    // If the AI output is empty for some reason, fall back to local cleaning
    if (!combinedPlainText) {
      return localCleaned;
    }

    return {
      ...sectionsWithoutCombined,
      combinedPlainText,
    };
  } catch (error) {
    console.error('Error polishing opportunity content with OpenAI:', error);
    // On any failure, fall back to the rule-based cleaner
    return polishOpportunityContent(opp);
  }
}

