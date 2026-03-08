/**
 * Formats opportunity description for display.
 * For template-generated content (**Label**\nValue), ensures labels and content
 * are visually distinguished with proper line breaks and styling.
 */
export function formatDescriptionForDisplay(description: string): string {
  if (!description?.trim()) return '';

  // If content is already HTML (from TinyMCE editor), use as-is
  if (/<[a-z][\s\S]*>/i.test(description)) {
    return description;
  }

  // Template format: **Label**\nValue - convert for clear visual separation
  // 1. Make labels block-level with styling so they stand out as section titles
  // 2. Preserve line breaks (HTML ignores \n by default)
  return description
    .replace(/\*\*(.*?)\*\*/g, '<strong class="block text-[#556B2F] font-semibold mb-1 mt-3 first:mt-0">$1</strong>')
    .replace(/\n/g, '<br />');
}
